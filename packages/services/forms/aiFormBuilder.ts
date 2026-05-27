import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { db, eq } from "@repo/database";
import { formFieldsTable } from "@repo/database/models/formField";
import {
  aiFormAssistantResultModel,
  aiFormSpecModel,
  type AiFormAssistantResult,
  type AiFormChatMessage,
  type AiFormSpec,
  type AiFormBuilderOutput,
  type GetFormByIdOutput,
} from "@repo/validators/forms";

import { logger } from "@repo/logger";
import { API_ERROR_CODES } from "@repo/validators/api-errors";
import { AppServiceError } from "../errors";
import * as formDomain from "./form";
import * as formFieldDomain from "./formField";
import { slugify } from "./slug";
import { DEFAULT_FORM_THEME_ID, isValidThemeId, listFormThemes } from "./themePresets";

const FORM_BUILDER_MODEL = "gpt-5.4-mini";

function getOpenAIProvider() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new AppServiceError(
      "AI form builder is not configured. Set OPENAI_API_KEY in your environment.",
      API_ERROR_CODES.INTERNAL_ERROR,
    );
  }

  return createOpenAI({ apiKey });
}

function getFormBuilderModel() {
  return getOpenAIProvider()(FORM_BUILDER_MODEL);
}

function buildSystemPrompt(existing?: GetFormByIdOutput) {
  const themeIds = listFormThemes().map((t) => t.id);
  const base = `You are HoliForm's AI form builder. You design Typeform-style forms: one question per step, clear labels, sensible required flags, and section breaks via pageIndex (0-based).

Rules:
- Return JSON matching the schema only.
- Use field types: text, textarea, email, number, phone, date, checkbox, radio, select, multiselect.
- For select, radio, multiselect, and checkbox with multiple options, include a non-empty choices array.
- labelKey must be lowercase snake_case, unique per form, derived from the label (e.g. full_name, email, rating).
- Prefer holi-gulal theme for festival/event forms; minimal-white or minimal-slate for professional surveys unless the user asks otherwise.
- Valid themeId values: ${themeIds.join(", ")}.
- Default visibility: unlisted unless the user wants it public/explorable.
- Keep forms focused (typically 3-15 questions).
- Honor required vs optional exactly as the user specifies.
- For empty optional strings use "" for description/slug; use null for thankYouMessage, themeId, choices, description, placeholder when not applicable.
- On new forms always set slug to "" — the server assigns a unique URL slug from the title automatically.
- assistantMessage: brief friendly summary of what you built or changed (no markdown headings).
- You receive the full conversation history. Use prior user requests and your earlier replies to stay consistent; honor cumulative edits across turns.`;

  if (!existing) {
    return `${base}

The user will describe a new form. Produce a complete form spec.`;
  }

  return `${base}

You are editing an existing form. Apply the user's requested changes while keeping unrelated fields unless they asked to remove them.

Current form JSON:
${JSON.stringify(
  {
    title: existing.form.title,
    description: existing.form.description,
    slug: existing.form.slug,
    thankYouMessage: existing.form.thankYouMessage,
    visibility: existing.form.visibility,
    themeId: existing.form.themeId,
    fields: existing.fields.map((f) => ({
      label: f.label,
      labelKey: f.labelKey,
      type: f.type,
      isRequired: f.isRequired,
      pageIndex: f.pageIndex,
      description: f.description,
      placeholder: f.placeholder,
      choices: f.options?.choices,
    })),
  },
  null,
  2,
)}`;
}

function sanitizeAiFormSpec(spec: AiFormSpec): AiFormSpec {
  const themeId =
    spec.themeId && isValidThemeId(spec.themeId) ? spec.themeId : DEFAULT_FORM_THEME_ID;

  return {
    ...spec,
    description: spec.description?.trim() ?? "",
    slug: spec.slug.trim().length > 0 ? spec.slug.trim() : "",
    themeId,
    fields: spec.fields.map((field) => ({
      ...field,
      labelKey: field.labelKey?.trim() ?? "",
      choices: field.choices?.length ? field.choices : null,
    })),
  };
}

async function generateFormSpec(
  messages: AiFormChatMessage[],
  existing?: GetFormByIdOutput,
): Promise<AiFormAssistantResult> {
  try {
    const { output } = await generateText({
      model: getFormBuilderModel(),
      output: Output.object({ schema: aiFormAssistantResultModel }),
      system: buildSystemPrompt(existing),
      messages,
      maxRetries: 2,
    });

    if (!output) {
      throw new AppServiceError(
        "AI did not return a valid form. Try rephrasing your request.",
        API_ERROR_CODES.INTERNAL_ERROR,
      );
    }

    return {
      assistantMessage: output.assistantMessage,
      form: sanitizeAiFormSpec(output.form),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    logger.error("AI form generation failed", { message });

    if (message.includes("OPENAI_API_KEY") || message.includes("API key")) {
      throw new AppServiceError(
        "AI form builder is not configured. Set OPENAI_API_KEY in your environment.",
        API_ERROR_CODES.INTERNAL_ERROR,
      );
    }

    if (error instanceof AppServiceError) {
      throw error;
    }

    throw new AppServiceError(
      message.includes("Invalid schema") || message.includes("response_format")
        ? "AI could not build the form structure. Try a shorter or simpler description."
        : message.slice(0, 500) || "AI request failed. Please try again.",
      API_ERROR_CODES.INTERNAL_ERROR,
    );
  }
}

function uniqueLabelKey(base: string, used: Set<string>) {
  let key = base;
  let n = 2;
  while (used.has(key)) {
    key = `${base}_${n}`;
    n += 1;
  }
  used.add(key);
  return key;
}

function normalizeFieldSpecs(fields: AiFormSpec["fields"]) {
  const usedKeys = new Set<string>();

  return fields.map((field, index) => {
    const rawKey =
      field.labelKey?.trim() || slugify(field.label).replace(/-/g, "_");
    const labelKey = uniqueLabelKey(
      rawKey.length > 0 ? rawKey : `field_${index + 1}`,
      usedKeys,
    );

    const needsChoices =
      field.type === "select" ||
      field.type === "radio" ||
      field.type === "multiselect" ||
      (field.type === "checkbox" && (field.choices?.length ?? 0) > 0);

    const choices = field.choices?.filter((c) => c.trim().length > 0) ?? [];

    if (needsChoices && choices.length === 0) {
      throw new AppServiceError(
        `Field "${field.label}" needs at least one choice`,
        API_ERROR_CODES.VALIDATION_ERROR,
      );
    }

    return {
      label: field.label,
      labelKey,
      type: field.type,
      isRequired: field.isRequired,
      pageIndex: field.pageIndex ?? 0,
      description: field.description ?? null,
      placeholder: field.placeholder ?? null,
      options: needsChoices ? { choices } : null,
      validationRules: null,
      index: String((index + 1) * 1000),
    };
  });
}

async function replaceFormFields(
  userId: string,
  formId: string,
  spec: AiFormSpec,
) {
  await db.delete(formFieldsTable).where(eq(formFieldsTable.formId, formId));

  const normalized = normalizeFieldSpecs(spec.fields);
  for (const field of normalized) {
    await formFieldDomain.upsertFormField(userId, {
      formId,
      label: field.label,
      labelKey: field.labelKey,
      type: field.type,
      index: field.index,
      pageIndex: field.pageIndex,
      isRequired: field.isRequired,
      description: field.description,
      placeholder: field.placeholder,
      options: field.options,
      validationRules: field.validationRules,
    });
  }
}

async function applyFormSpec(
  userId: string,
  formId: string | null,
  spec: AiFormSpec,
): Promise<string> {
  const parsed = aiFormSpecModel.parse(spec);

  if (formId) {
    await formDomain.updateForm(userId, {
      formId,
      title: parsed.title,
      description: parsed.description,
      slug: parsed.slug.trim().length > 0 ? parsed.slug.trim() : undefined,
      thankYouMessage: parsed.thankYouMessage ?? undefined,
      themeId: parsed.themeId ?? undefined,
    });

    if (parsed.visibility) {
      await formDomain.setFormVisibility(userId, {
        formId,
        visibility: parsed.visibility,
      });
    }

    await replaceFormFields(userId, formId, parsed);
    return formId;
  }

  const created = await formDomain.createForm(userId, {
    title: parsed.title,
    description: parsed.description ?? "",
    slug: undefined,
    themeId: parsed.themeId ?? DEFAULT_FORM_THEME_ID,
  });

  if (parsed.thankYouMessage) {
    await formDomain.updateForm(userId, {
      formId: created.id,
      slug: undefined,
      thankYouMessage: parsed.thankYouMessage,
    });
  }

  if (parsed.visibility && parsed.visibility !== "unlisted") {
    await formDomain.setFormVisibility(userId, {
      formId: created.id,
      visibility: parsed.visibility,
    });
  }

  await replaceFormFields(userId, created.id, parsed);
  return created.id;
}

export async function createFormFromPrompt(
  userId: string,
  messages: AiFormChatMessage[],
): Promise<AiFormBuilderOutput> {
  const result = await generateFormSpec(messages);
  const formId = await applyFormSpec(userId, null, result.form);
  const form = await formDomain.getFormById(userId, { formId });

  return {
    formId,
    assistantMessage: result.assistantMessage,
    form,
  };
}

export async function editFormFromPrompt(
  userId: string,
  formId: string,
  messages: AiFormChatMessage[],
): Promise<AiFormBuilderOutput> {
  const existing = await formDomain.getFormById(userId, { formId });
  const result = await generateFormSpec(messages, existing);
  const updatedId = await applyFormSpec(userId, formId, result.form);
  const form = await formDomain.getFormById(userId, { formId: updatedId });

  return {
    formId: updatedId,
    assistantMessage: result.assistantMessage,
    form,
  };
}
