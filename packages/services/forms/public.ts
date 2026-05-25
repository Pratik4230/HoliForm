import { randomUUID } from "node:crypto";

import { and, asc, count, db, desc, eq, isNull } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/formField";
import {
  formResponseAnswersTable,
  formResponsesTable,
} from "@repo/database/models/formResponse";
import { usersTable } from "@repo/database/models/user";
import { API_ERROR_CODES } from "@repo/validators/api-errors";
import type { FormFieldRecord } from "@repo/validators/forms";
import {
  getPublicFormInputModel,
  listPublicFormsInputModel,
  submitFormResponseInputModel,
  verifyFormAccessInputModel,
  type GetPublicFormInput,
  type GetPublicFormOutput,
  type ListPublicFormsInput,
  type ListPublicFormsOutput,
  type PublicFormListItem,
  type PublicFormRecord,
  type SubmitFormResponseInput,
  type SubmitFormResponseOutput,
  type VerifyFormAccessInput,
  type VerifyFormAccessOutput,
} from "@repo/validators/forms";

import { inngest, INNGEST_EVENTS } from "@repo/inngest";

import { AppServiceError } from "../errors";
import {
  formRequiresPassword,
  verifyFormAccessPassword,
} from "./accessPassword";
import { buildSubmissionSchemaFromFields } from "./buildSubmissionSchema";
import { countFormResponses, getFormAvailability } from "./formLimits";
import { mapFormFieldRecord } from "./mappers";
import { resolveFormTheme } from "./themePresets";

function mapPublicFormRecord(
  row: typeof formsTable.$inferSelect,
  username: string,
  responseCount: number,
): PublicFormRecord {
  const { acceptingResponses, reason } = getFormAvailability(row, responseCount);

  return {
    id: row.id,
    username,
    title: row.title,
    description: row.description,
    slug: row.slug,
    themeId: row.themeId ?? null,
    thankYouMessage: row.thankYouMessage ?? null,
    acceptingResponses,
    closedAt: row.closedAt ?? null,
    expiresAt: row.expiresAt ?? null,
    maxResponses: row.maxResponses ?? null,
    responseCount,
    requiresPassword: formRequiresPassword(row.accessPasswordSalt, row.accessPasswordHash),
    availabilityReason: reason,
  };
}

function throwAvailabilityError(reason: ReturnType<typeof getFormAvailability>["reason"]) {
  switch (reason) {
    case "expired":
      throw new AppServiceError("This form has expired", API_ERROR_CODES.FORM_EXPIRED);
    case "response_limit":
      throw new AppServiceError(
        "This form has reached its response limit",
        API_ERROR_CODES.FORM_RESPONSE_LIMIT_REACHED,
      );
    case "archived":
      throw new AppServiceError("This form is no longer available", API_ERROR_CODES.FORM_ARCHIVED);
    default:
      throw new AppServiceError(
        "Form is not accepting responses",
        API_ERROR_CODES.FORM_NOT_ACCEPTING_RESPONSES,
      );
  }
}

async function getPublishedFormRow(username: string, slug: string) {
  const creatorRows = await db
    .select({ id: usersTable.id, username: usersTable.username })
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);

  const creator = creatorRows[0];
  if (!creator) {
    throw new AppServiceError("Form not found", API_ERROR_CODES.FORM_NOT_FOUND);
  }

  const formRows = await db
    .select()
    .from(formsTable)
    .where(and(eq(formsTable.userId, creator.id), eq(formsTable.slug, slug)))
    .limit(1);

  const form = formRows[0];
  if (!form) {
    throw new AppServiceError("Form not found", API_ERROR_CODES.FORM_NOT_FOUND);
  }

  if (form.status !== "published" || form.archivedAt) {
    throw new AppServiceError("Form not found", API_ERROR_CODES.FORM_NOT_FOUND);
  }

  return { form, username: creator.username };
}

async function loadPublishedFormContext(username: string, slug: string) {
  const { form, username: creatorUsername } = await getPublishedFormRow(username, slug);

  const fieldRows = await db
    .select()
    .from(formFieldsTable)
    .where(eq(formFieldsTable.formId, form.id))
    .orderBy(asc(formFieldsTable.index));

  const fields = fieldRows.map((row) => mapFormFieldRecord(row));
  const responseCount = await countFormResponses(form.id);

  return {
    form,
    username: creatorUsername,
    fields,
    responseCount,
  };
}

function assertFormAccessPassword(
  form: typeof formsTable.$inferSelect,
  password: string | undefined,
) {
  const protectedForm = formRequiresPassword(form.accessPasswordSalt, form.accessPasswordHash);
  if (!protectedForm) {
    return;
  }

  if (!password) {
    throw new AppServiceError(
      "Password is required to submit this form",
      API_ERROR_CODES.FORM_PASSWORD_REQUIRED,
    );
  }

  if (
    !verifyFormAccessPassword(password, form.accessPasswordSalt, form.accessPasswordHash)
  ) {
    throw new AppServiceError("Incorrect form password", API_ERROR_CODES.FORM_PASSWORD_INVALID);
  }
}

export async function getPublicForm(payload: GetPublicFormInput): Promise<GetPublicFormOutput> {
  const { username, slug } = await getPublicFormInputModel.parseAsync(payload);
  const { form, username: creatorUsername, fields, responseCount } = await loadPublishedFormContext(
    username,
    slug,
  );

  return {
    form: mapPublicFormRecord(form, creatorUsername, responseCount),
    fields,
    theme: resolveFormTheme(form.themeId),
  };
}

export async function verifyFormAccess(
  payload: VerifyFormAccessInput,
): Promise<VerifyFormAccessOutput> {
  const { username, slug, password } = await verifyFormAccessInputModel.parseAsync(payload);
  const { form } = await getPublishedFormRow(username, slug);

  if (!formRequiresPassword(form.accessPasswordSalt, form.accessPasswordHash)) {
    return { valid: true };
  }

  return {
    valid: verifyFormAccessPassword(
      password,
      form.accessPasswordSalt,
      form.accessPasswordHash,
    ),
  };
}

export async function listPublicForms(payload: ListPublicFormsInput): Promise<ListPublicFormsOutput> {
  const { limit } = await listPublicFormsInputModel.parseAsync(payload);

  const rows = await db
    .select({
      form: formsTable,
      username: usersTable.username,
    })
    .from(formsTable)
    .innerJoin(usersTable, eq(formsTable.userId, usersTable.id))
    .where(
      and(
        eq(formsTable.status, "published"),
        eq(formsTable.visibility, "public"),
        isNull(formsTable.archivedAt),
      ),
    )
    .orderBy(desc(formsTable.updatedAt))
    .limit(limit);

  return rows.map(
    (row): PublicFormListItem => ({
      id: row.form.id,
      username: row.username,
      title: row.form.title,
      description: row.form.description,
      slug: row.form.slug,
      acceptingResponses: getFormAvailability(row.form, 0).acceptingResponses,
      updatedAt: row.form.updatedAt ?? null,
    }),
  );
}

export async function submitFormResponse(
  payload: SubmitFormResponseInput,
  options?: { respondentIp?: string },
): Promise<SubmitFormResponseOutput> {
  const parsed = await submitFormResponseInputModel.parseAsync(payload);
  const { username, slug, answers, accessPassword, _hpWebsite } = parsed;

  if (_hpWebsite?.trim()) {
    const { form } = await loadPublishedFormContext(username, slug);
    return {
      success: true,
      responseId: randomUUID(),
      thankYouMessage: form.thankYouMessage ?? "Thank you for your response!",
    };
  }

  const { form, fields, responseCount } = await loadPublishedFormContext(username, slug);

  const availability = getFormAvailability(form, responseCount);
  if (!availability.acceptingResponses) {
    throwAvailabilityError(availability.reason);
  }

  assertFormAccessPassword(form, accessPassword);

  const submissionSchema = buildSubmissionSchemaFromFields(fields);
  const validatedAnswers = await submissionSchema.parseAsync(answers);

  const fieldByLabelKey = new Map<string, FormFieldRecord>();
  for (const field of fields) {
    fieldByLabelKey.set(field.labelKey, field);
  }

  const result = await db.transaction(async (tx) => {
    const [countRow] = await tx
      .select({ total: count() })
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, form.id));

    const currentCount = Number(countRow?.total ?? responseCount);
    const txAvailability = getFormAvailability(form, currentCount);
    if (!txAvailability.acceptingResponses && txAvailability.reason === "response_limit") {
      throw new AppServiceError(
        "This form has reached its response limit",
        API_ERROR_CODES.FORM_RESPONSE_LIMIT_REACHED,
      );
    }

    const insertedResponses = await tx
      .insert(formResponsesTable)
      .values({
        formId: form.id,
        respondentIp: options?.respondentIp ?? null,
      })
      .returning({ id: formResponsesTable.id });

    const response = insertedResponses[0];
    if (!response) {
      throw new AppServiceError("Failed to save response", API_ERROR_CODES.INTERNAL_ERROR);
    }

    const answerRows = Object.entries(validatedAnswers).map(([labelKey, value]) => {
      const field = fieldByLabelKey.get(labelKey);
      if (!field) {
        throw new AppServiceError("Invalid answer field", API_ERROR_CODES.VALIDATION_ERROR);
      }

      return {
        responseId: response.id,
        fieldId: field.id,
        value,
      };
    });

    if (answerRows.length > 0) {
      await tx.insert(formResponseAnswersTable).values(answerRows);
    }

    return response;
  });

  await inngest.send({
    name: INNGEST_EVENTS.FORM_RESPONSE_SUBMITTED,
    data: { responseId: result.id },
  });

  return {
    success: true,
    responseId: result.id,
    thankYouMessage: form.thankYouMessage ?? "Thank you for your response!",
  };
}
