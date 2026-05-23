import { z } from "zod";

import { usernameModel } from "../user";
import { formFieldOutputModel } from "./formField";

export const getPublicFormInputModel = z.object({
  username: usernameModel.describe("Creator username"),
  slug: z.string().min(1).max(128).describe("Form slug unique per creator"),
});

export type GetPublicFormInput = z.infer<typeof getPublicFormInputModel>;

export const publicFormOutputModel = z.object({
  id: z.uuid().describe("Form id"),
  username: usernameModel.describe("Creator username"),
  title: z.string().describe("Form title"),
  description: z.string().describe("Form description"),
  slug: z.string().describe("URL slug"),
  themeId: z.string().nullable().describe("Theme id"),
  thankYouMessage: z.string().nullable().describe("Message after submit"),
  acceptingResponses: z
    .boolean()
    .describe("Whether the form accepts new submissions"),
  closedAt: z.coerce.date().nullable().describe("When responses were closed"),
});

export type PublicFormRecord = z.infer<typeof publicFormOutputModel>;

export const getPublicFormOutputModel = z.object({
  form: publicFormOutputModel.describe("Published form"),
  fields: z.array(formFieldOutputModel).describe("Fields sorted by index"),
});

export type GetPublicFormOutput = z.infer<typeof getPublicFormOutputModel>;

export const submitFormResponseInputModel = z.object({
  username: usernameModel.describe("Creator username"),
  slug: z.string().min(1).max(128).describe("Form slug"),
  answers: z
    .record(z.string(), z.unknown())
    .describe("Answers keyed by field labelKey"),
});

export type SubmitFormResponseInput = z.infer<typeof submitFormResponseInputModel>;

export const submitFormResponseOutputModel = z.object({
  success: z.boolean().describe("Whether submit succeeded"),
  responseId: z.uuid().describe("Created response id"),
  thankYouMessage: z.string().describe("Confirmation message for respondent"),
});

export type SubmitFormResponseOutput = z.infer<typeof submitFormResponseOutputModel>;
