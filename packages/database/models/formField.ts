import {
  boolean,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const formFieldTypeEnum = pgEnum("form_field_type", [
  "text",
  "textarea",
  "email",
  "number",
  "phone",
  "date",
  "time",
  "checkbox",
  "radio",
  "select",
  "multiselect",
  "rating",
]);

export type FormFieldOptions = {
  choices?: string[];
  min?: number;
  max?: number;
  step?: number;
};

export type FormFieldValidationRules = {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
};

export const formFieldsTable = pgTable(
  "form_fields",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .references(() => formsTable.id, { onDelete: "cascade" })
      .notNull(),

    label: varchar("label", { length: 255 }).notNull(),
    labelKey: varchar("label_key", { length: 255 }).notNull(),

    description: text("description"),
    placeholder: text("placeholder"),

    isRequired: boolean("is_required").default(false).notNull(),

    index: numeric("index", { precision: 20, scale: 10 }).notNull(),

    type: formFieldTypeEnum("type").notNull(),

    options: jsonb("options").$type<FormFieldOptions>(),
    validationRules: jsonb("validation_rules").$type<FormFieldValidationRules>(),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("form_fields_form_id_label_key_unique").on(table.formId, table.labelKey)],
);

export type SelectFormField = typeof formFieldsTable.$inferSelect;
export type InsertFormField = typeof formFieldsTable.$inferInsert;
