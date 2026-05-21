import { jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { formFieldsTable } from "./formField";
import { formsTable } from "./form";

export const formResponsesTable = pgTable("form_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .references(() => formsTable.id, { onDelete: "cascade" })
    .notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  respondentIp: varchar("respondent_ip", { length: 45 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
});

export const formResponseAnswersTable = pgTable("form_response_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  responseId: uuid("response_id")
    .references(() => formResponsesTable.id, { onDelete: "cascade" })
    .notNull(),
  fieldId: uuid("field_id")
    .references(() => formFieldsTable.id, { onDelete: "cascade" })
    .notNull(),
  value: jsonb("value").notNull(),
});

export type SelectFormResponse = typeof formResponsesTable.$inferSelect;
export type InsertFormResponse = typeof formResponsesTable.$inferInsert;
export type SelectFormResponseAnswer = typeof formResponseAnswersTable.$inferSelect;
export type InsertFormResponseAnswer = typeof formResponseAnswersTable.$inferInsert;
