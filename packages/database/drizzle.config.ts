import { config } from "dotenv";
import { resolve } from "node:path";
import { defineConfig, type Config } from "drizzle-kit";
import { env } from "./env";

// Load monorepo root `.env` when migrate runs from packages/database
if (!process.env.DATABASE_URL) {
  config({ path: resolve(__dirname, "../../.env") });
}

const drizzleConfig: Config = defineConfig({
  out: "./drizzle",
  schema: "./schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});

export default drizzleConfig;
