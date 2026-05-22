import { z } from "zod";

export const usernameModel = z
  .string()
  .min(3)
  .max(32)
  .regex(
    /^[a-z0-9_]+$/,
    "Username must be lowercase letters, numbers, or underscores",
  )
  .describe("Unique public username for share URLs");

export type Username = z.infer<typeof usernameModel>;
