import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/formField";
import type { FormFieldRecord, FormRecord } from "@repo/validators/forms";
import { formRequiresPassword } from "./accessPassword";

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
    expiresAt: row.expiresAt ?? null,
    maxResponses: row.maxResponses ?? null,
    archivedAt: row.archivedAt ?? null,
    requiresPassword: formRequiresPassword(row.accessPasswordSalt, row.accessPasswordHash),
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
    pageIndex: row.pageIndex ?? 0,
    type: row.type,
    options: row.options ?? null,
    validationRules: row.validationRules ?? null,
    createdAt: row.createdAt ?? null,
    updatedAt: row.updatedAt ?? null,
  };
}
