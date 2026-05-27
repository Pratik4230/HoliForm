import "dotenv/config";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "./env";

const pool = new Pool({ connectionString: env.DATABASE_URL });

export const db: NodePgDatabase = drizzle(pool);
export * from "drizzle-orm";
export { ensureFormThemePresets } from "./seed-form-themes";
export {
  DEFAULT_FORM_THEME_ID,
  FORM_THEME_PRESET_IDS,
  FORM_THEME_PRESETS,
} from "./form-theme-presets";
export default db;
