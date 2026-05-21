import { boolean, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export type FormThemeConfig = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor?: string;
  fontFamily?: string;
};

export const formThemesTable = pgTable("form_themes", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  config: jsonb("config").$type<FormThemeConfig>().notNull(),
  isPreset: boolean("is_preset").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SelectFormTheme = typeof formThemesTable.$inferSelect;
export type InsertFormTheme = typeof formThemesTable.$inferInsert;
