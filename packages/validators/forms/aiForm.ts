import { z } from "zod";

import { formFieldTypeModel } from "./formField";
import { formVisibilityModel } from "./form";
import { getFormByIdOutputModel } from "./form";

/** OpenAI structured output requires every property to be required (use null when empty). */
export const aiFormFieldSpecModel = z.object({
  label: z.string().min(1).max(255).describe("Question label shown to respondents"),
  labelKey: z
    .string()
    .max(255)
    .describe("Stable snake_case key for answers; empty string to auto-generate"),
  type: formFieldTypeModel.describe("Field type"),
  isRequired: z.boolean().describe("Whether the field is required"),
  pageIndex: z.number().int().min(0).describe("Page/section index (0-based)"),
  description: z.string().max(5000).nullable().describe("Helper text under the question"),
  placeholder: z.string().max(5000).nullable().describe("Placeholder text"),
  choices: z
    .array(z.string().min(1).max(255))
    .nullable()
    .describe("Options for select, radio, multiselect, or multi checkbox; null if N/A"),
});

export type AiFormFieldSpec = z.infer<typeof aiFormFieldSpecModel>;

export const aiFormSpecModel = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(10000).describe("Form description; empty string if none"),
  slug: z.string().max(128).describe("URL slug; empty string to auto-generate"),
  thankYouMessage: z.string().max(10000).nullable(),
  visibility: formVisibilityModel,
  themeId: z.string().max(64).nullable().describe("Theme preset id or null for default"),
  fields: z.array(aiFormFieldSpecModel).min(1).max(40),
});

export type AiFormSpec = z.infer<typeof aiFormSpecModel>;

export const aiFormAssistantResultModel = z.object({
  assistantMessage: z.string().min(1).max(4000),
  form: aiFormSpecModel,
});

export type AiFormAssistantResult = z.infer<typeof aiFormAssistantResultModel>;

export const aiFormChatMessageModel = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

export type AiFormChatMessage = z.infer<typeof aiFormChatMessageModel>;

const aiFormChatHistoryModel = z
  .array(aiFormChatMessageModel)
  .min(1)
  .max(40)
  .refine((messages) => messages.at(-1)?.role === "user", {
    message: "The last message must be from the user",
  });

export const aiCreateFormFromPromptInputModel = z.object({
  messages: aiFormChatHistoryModel.describe("Full conversation history; last entry is the latest user request"),
});

export type AiCreateFormFromPromptInput = z.infer<typeof aiCreateFormFromPromptInputModel>;

export const aiEditFormFromPromptInputModel = z.object({
  formId: z.uuid().describe("Form to edit"),
  messages: aiFormChatHistoryModel.describe("Full conversation history; last entry is the latest user request"),
});

export type AiEditFormFromPromptInput = z.infer<typeof aiEditFormFromPromptInputModel>;

export const aiFormBuilderOutputModel = z.object({
  formId: z.uuid(),
  assistantMessage: z.string(),
  form: getFormByIdOutputModel,
});

export type AiFormBuilderOutput = z.infer<typeof aiFormBuilderOutputModel>;
