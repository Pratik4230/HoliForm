import { z } from "zod";

const envSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.email(),
  RESEND_FROM_NAME: z.string().min(1).default("HoliForm"),
  WEB_APP_URL: z.url().default("http://localhost:3000"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const emailEnv = createEnv(process.env);
