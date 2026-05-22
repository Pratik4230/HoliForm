import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/formField";
import type { FormFieldRecord, FormRecord } from "@repo/validators/forms";

export function mapFormRecord(row: typeof formsTable.$inferSelect): FormRecord {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    description: row.description,
    slug: row.slug,
    status: row.status,
    visibility: row.visibility,
    themeId: row.themeId ?? null,
    thankYouMessage: row.thankYouMessage ?? null,
    closedAt: row.closedAt ?? null,
    createdAt: row.createdAt ?? null,
    updatedAt: row.updatedAt ?? null,
  };
}

export function mapFormFieldRecord(row: typeof formFieldsTable.$inferSelect): FormFieldRecord {
  return {
    id: row.id,
    formId: row.formId,
    label: row.label,
    labelKey: row.labelKey,
    description: row.description ?? null,
    placeholder: row.placeholder ?? null,
    isRequired: row.isRequired,
    index: String(row.index),
    type: row.type,
    options: row.options ?? null,
    validationRules: row.validationRules ?? null,
    createdAt: row.createdAt ?? null,
    updatedAt: row.updatedAt ?? null,
  };
}
