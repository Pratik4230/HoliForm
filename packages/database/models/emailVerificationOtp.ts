import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { usersTable } from "./user";

export const emailVerificationOtpsTable = pgTable(
  "email_verification_otps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    codeHash: text("code_hash").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("email_verification_otps_user_id_idx").on(table.userId)],
);
