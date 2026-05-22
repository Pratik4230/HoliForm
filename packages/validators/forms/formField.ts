import { z } from "zod";

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
