import { z } from "zod";

export const createFormInputModel = z.object({
  title: z.string().min(1).max(255).describe("Form title"),
  description: z.string().max(10000).optional().default("").describe("Form description"),
  slug: z.string().min(1).max(128).optional().describe("URL slug unique per creator"),
  themeId: z.string().max(64).optional().describe("Preset theme id"),
});

export type CreateFormInput = z.infer<typeof createFormInputModel>;

export const formRecordOutputModel = z.object({
  id: z.uuid().describe("Form id"),
  userId: z.uuid().describe("Owner user id"),
  title: z.string().describe("Form title"),
  description: z.string().describe("Form description"),
  slug: z.string().describe("URL slug"),
  status: z.enum(["draft", "published"]).describe("Publication status"),
  visibility: z.enum(["public", "unlisted"]).describe("Listing visibility"),
  themeId: z.string().nullable().describe("Theme id"),
  thankYouMessage: z.string().nullable().describe("Message after submit"),
  closedAt: z.coerce.date().nullable().describe("When responses were closed"),
  createdAt: z.coerce.date().nullable().describe("Created at"),
  updatedAt: z.coerce.date().nullable().describe("Updated at"),
});

export type FormRecord = z.infer<typeof formRecordOutputModel>;

export const listFormsInputModel = z.undefined();

export const listFormsOutputModel = z
  .array(formRecordOutputModel)
  .describe("Forms owned by the logged-in user, newest first");

export type ListFormsOutput = z.infer<typeof listFormsOutputModel>;

export const formFieldTypeModel = z.enum([
  "text",
  "textarea",
  "email",
  "number",
  "phone",
  "date",
  "time",
  "checkbox",
  "radio",
  "select",
  "multiselect",
  "rating",
]);

export const formFieldOptionsModel = z
  .object({
    choices: z.array(z.string()).optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
  })
  .nullable()
  .optional();

export const formFieldValidationRulesModel = z
  .object({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
  })
  .nullable()
  .optional();

export const formFieldOutputModel = z.object({
  id: z.uuid().describe("Field id"),
  formId: z.uuid().describe("Form id"),
  label: z.string().describe("Field label"),
  labelKey: z.string().describe("Stable key for answers"),
  description: z.string().nullable().describe("Field description"),
  placeholder: z.string().nullable().describe("Placeholder text"),
  isRequired: z.boolean().describe("Whether the field is required"),
  index: z.string().describe("Sort order (fractional numeric)"),
  type: formFieldTypeModel.describe("Field type"),
  options: formFieldOptionsModel.describe("UI options"),
  validationRules: formFieldValidationRulesModel.describe("Validation rules"),
  createdAt: z.coerce.date().nullable().describe("Created at"),
  updatedAt: z.coerce.date().nullable().describe("Updated at"),
});

export type FormFieldRecord = z.infer<typeof formFieldOutputModel>;

export const getFormByIdInputModel = z.object({
  formId: z.uuid().describe("Form id"),
});

export type GetFormByIdInput = z.infer<typeof getFormByIdInputModel>;

export const getFormByIdOutputModel = z.object({
  form: formRecordOutputModel.describe("Form"),
  fields: z.array(formFieldOutputModel).describe("Fields sorted by index"),
});

export type GetFormByIdOutput = z.infer<typeof getFormByIdOutputModel>;
