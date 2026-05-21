import { z } from "zod";

export const createFormInput = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(10000).optional().default(""),
  slug: z.string().min(1).max(128).optional(),
  themeId: z.string().max(64).optional(),
});

export type CreateFormInput = z.infer<typeof createFormInput>;

export const formRecordOutput = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  title: z.string(),
  description: z.string(),
  slug: z.string(),
  status: z.enum(["draft", "published"]),
  visibility: z.enum(["public", "unlisted"]),
  themeId: z.string().nullable(),
  thankYouMessage: z.string().nullable(),
  closedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date().nullable(),
});

export type FormRecordOutput = z.infer<typeof formRecordOutput>;
