import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { formThemesTable } from "./formTheme";
import { usersTable } from "./user";

export const formStatusEnum = pgEnum("form_status", ["draft", "published"]);

export const formVisibilityEnum = pgEnum("form_visibility", ["public", "unlisted"]);

export const formsTable = pgTable(
  "forms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").default("").notNull(),
    slug: varchar("slug", { length: 128 }).notNull(),
    status: formStatusEnum("status").default("draft").notNull(),
    visibility: formVisibilityEnum("visibility").default("unlisted").notNull(),
    themeId: varchar("theme_id", { length: 64 }).references(() => formThemesTable.id),
    thankYouMessage: text("thank_you_message").default("Thank you for your response!"),

    closedAt: timestamp("closed_at"),
    expiresAt: timestamp("expires_at"),
    maxResponses: integer("max_responses"),
    archivedAt: timestamp("archived_at"),
    accessPasswordSalt: text("access_password_salt"),
    accessPasswordHash: text("access_password_hash"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("forms_user_id_slug_unique").on(table.userId, table.slug)],
);

export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;
