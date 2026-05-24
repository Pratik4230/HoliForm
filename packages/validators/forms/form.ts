import { z } from "zod";

import { formFieldOutputModel } from "./formField";

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

export const getFormByIdInputModel = z.object({
  formId: z.uuid().describe("Form id"),
});

export type GetFormByIdInput = z.infer<typeof getFormByIdInputModel>;

export const getFormByIdOutputModel = z.object({
  form: formRecordOutputModel.describe("Form"),
  fields: z.array(formFieldOutputModel).describe("Fields sorted by index"),
});

export type GetFormByIdOutput = z.infer<typeof getFormByIdOutputModel>;

export const updateFormInputModel = z.object({
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
});

/** Client-side / form validation; avoid on tRPC input (breaks OpenAPI .omit()). */
export const updateFormInputFormModel = updateFormInputModel.refine(
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

export const cloneFormInputModel = z.object({
  formId: z.uuid().describe("Form id to clone"),
});

export type CloneFormInput = z.infer<typeof cloneFormInputModel>;

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

export const setFormAcceptingResponsesInputModel = z.object({
  formId: z.uuid().describe("Form id"),
  acceptingResponses: z
    .boolean()
    .describe("true to accept new responses; false to close the form"),
});

export type SetFormAcceptingResponsesInput = z.infer<
  typeof setFormAcceptingResponsesInputModel
>;
