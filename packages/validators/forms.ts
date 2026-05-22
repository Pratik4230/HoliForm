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
