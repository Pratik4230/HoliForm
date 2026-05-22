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

export const formVisibilityModel = z.enum(["public", "unlisted"]);

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

export const updateFormInputModel = z
  .object({
    formId: z.uuid().describe("Form id"),
    title: z.string().min(1).max(255).optional().describe("Form title"),
    description: z.string().max(10000).optional().describe("Form description"),
    slug: z.string().min(1).max(128).optional().describe("URL slug unique per creator"),
    themeId: z.string().max(64).nullable().optional().describe("Preset theme id"),
    thankYouMessage: z
      .string()
      .max(10000)
      .nullable()
      .optional()
      .describe("Message shown after submit"),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.slug !== undefined ||
      data.themeId !== undefined ||
      data.thankYouMessage !== undefined,
    { message: "At least one field to update is required" },
  );

export type UpdateFormInput = z.infer<typeof updateFormInputModel>;

export const deleteFormInputModel = z.object({
  formId: z.uuid().describe("Form id"),
});

export type DeleteFormInput = z.infer<typeof deleteFormInputModel>;

export const deleteFormOutputModel = z.object({
  success: z.boolean().describe("Whether delete succeeded"),
});

export type DeleteFormOutput = z.infer<typeof deleteFormOutputModel>;

export const publishFormInputModel = z.object({
  formId: z.uuid().describe("Form id"),
});

export type PublishFormInput = z.infer<typeof publishFormInputModel>;

export const unpublishFormInputModel = z.object({
  formId: z.uuid().describe("Form id"),
});

export type UnpublishFormInput = z.infer<typeof unpublishFormInputModel>;

export const setFormVisibilityInputModel = z.object({
  formId: z.uuid().describe("Form id"),
  visibility: formVisibilityModel.describe("public or unlisted"),
});

export type SetFormVisibilityInput = z.infer<typeof setFormVisibilityInputModel>;

export const closeFormInputModel = z.object({
  formId: z.uuid().describe("Form id"),
});

export type CloseFormInput = z.infer<typeof closeFormInputModel>;

export const reopenFormInputModel = z.object({
  formId: z.uuid().describe("Form id"),
});

export type ReopenFormInput = z.infer<typeof reopenFormInputModel>;

const labelKeyRegex = /^[a-z0-9_]+$/;

export const upsertFormFieldInputModel = z.object({
  formId: z.uuid().describe("Form id"),
  fieldId: z.uuid().optional().describe("Field id when updating"),
  label: z.string().min(1).max(255).describe("Field label"),
  labelKey: z
    .string()
    .min(1)
    .max(255)
    .regex(labelKeyRegex, "labelKey must be lowercase letters, numbers, or underscores")
    .describe("Stable key for answers"),
  type: formFieldTypeModel.describe("Field type"),
  index: z.string().optional().describe("Sort order; auto-assigned on create if omitted"),
  isRequired: z.boolean().optional().default(false).describe("Whether the field is required"),
  description: z.string().max(5000).nullable().optional().describe("Field description"),
  placeholder: z.string().max(5000).nullable().optional().describe("Placeholder"),
  options: formFieldOptionsModel.describe("UI options"),
  validationRules: formFieldValidationRulesModel.describe("Validation rules"),
});

export type UpsertFormFieldInput = z.infer<typeof upsertFormFieldInputModel>;

export const deleteFormFieldInputModel = z.object({
  formId: z.uuid().describe("Form id"),
  fieldId: z.uuid().describe("Field id"),
});

export type DeleteFormFieldInput = z.infer<typeof deleteFormFieldInputModel>;

export const deleteFormFieldOutputModel = z.object({
  success: z.boolean().describe("Whether delete succeeded"),
});

export type DeleteFormFieldOutput = z.infer<typeof deleteFormFieldOutputModel>;

export const reorderFormFieldInputModel = z.object({
  formId: z.uuid().describe("Form id"),
  fieldId: z.uuid().describe("Field id"),
  index: z.string().describe("New fractional sort index"),
});

export type ReorderFormFieldInput = z.infer<typeof reorderFormFieldInputModel>;
