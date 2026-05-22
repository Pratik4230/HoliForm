import { and, db, desc, eq, ne } from "@repo/database";
import { formFieldsTable } from "@repo/database/models/formField";
import {
  deleteFormFieldInputModel,
  reorderFormFieldInputModel,
  upsertFormFieldInputModel,
  type DeleteFormFieldInput,
  type DeleteFormFieldOutput,
  type FormFieldRecord,
  type ReorderFormFieldInput,
  type UpsertFormFieldInput,
} from "@repo/validators/forms";

import { mapFormFieldRecord } from "./mappers";
import { getOwnedFieldOrThrow, getOwnedFormOrThrow } from "./ownership";

async function labelKeyExistsOnForm(
  formId: string,
  labelKey: string,
  excludeFieldId?: string,
) {
  const conditions = [eq(formFieldsTable.formId, formId), eq(formFieldsTable.labelKey, labelKey)];
  if (excludeFieldId) {
    conditions.push(ne(formFieldsTable.id, excludeFieldId));
  }

  const rows = await db
    .select({ id: formFieldsTable.id })
    .from(formFieldsTable)
    .where(and(...conditions));

  return rows.length > 0;
}

async function getNextFieldIndex(formId: string) {
  const rows = await db
    .select({ index: formFieldsTable.index })
    .from(formFieldsTable)
    .where(eq(formFieldsTable.formId, formId))
    .orderBy(desc(formFieldsTable.index))
    .limit(1);

  const last = rows[0];
  if (!last) {
    return "1000";
  }

  return String(Number(last.index) + 1000);
}

export async function upsertFormField(
  userId: string,
  payload: UpsertFormFieldInput,
): Promise<FormFieldRecord> {
  const parsed = await upsertFormFieldInputModel.parseAsync(payload);
  const {
    formId,
    fieldId,
    label,
    labelKey,
    type,
    index,
    isRequired,
    description,
    placeholder,
    options,
    validationRules,
  } = parsed;

  await getOwnedFormOrThrow(userId, formId);

  if (await labelKeyExistsOnForm(formId, labelKey, fieldId)) {
    throw new Error("A field with this label key already exists on this form");
  }

  const fieldIndex = index ?? (await getNextFieldIndex(formId));

  if (fieldId) {
    const updated = await db
      .update(formFieldsTable)
      .set({
        label,
        labelKey,
        type,
        index: fieldIndex,
        isRequired: isRequired ?? false,
        description: description ?? null,
        placeholder: placeholder ?? null,
        options: options ?? null,
        validationRules: validationRules ?? null,
      })
      .where(and(eq(formFieldsTable.id, fieldId), eq(formFieldsTable.formId, formId)))
      .returning();

    const field = updated[0];
    if (!field) {
      throw new Error("Form field not found");
    }

    return mapFormFieldRecord(field);
  }

  const inserted = await db
    .insert(formFieldsTable)
    .values({
      formId,
      label,
      labelKey,
      type,
      index: fieldIndex,
      isRequired: isRequired ?? false,
      description: description ?? null,
      placeholder: placeholder ?? null,
      options: options ?? null,
      validationRules: validationRules ?? null,
    })
    .returning();

  const field = inserted[0];
  if (!field) {
    throw new Error("Failed to create form field");
  }

  return mapFormFieldRecord(field);
}

export async function deleteFormField(
  userId: string,
  payload: DeleteFormFieldInput,
): Promise<DeleteFormFieldOutput> {
  const { formId, fieldId } = await deleteFormFieldInputModel.parseAsync(payload);
  await getOwnedFieldOrThrow(userId, formId, fieldId);

  await db
    .delete(formFieldsTable)
    .where(and(eq(formFieldsTable.id, fieldId), eq(formFieldsTable.formId, formId)));

  return { success: true };
}

export async function reorderFormField(
  userId: string,
  payload: ReorderFormFieldInput,
): Promise<FormFieldRecord> {
  const { formId, fieldId, index } = await reorderFormFieldInputModel.parseAsync(payload);
  await getOwnedFieldOrThrow(userId, formId, fieldId);

  const updated = await db
    .update(formFieldsTable)
    .set({ index })
    .where(and(eq(formFieldsTable.id, fieldId), eq(formFieldsTable.formId, formId)))
    .returning();

  const field = updated[0];
  if (!field) {
    throw new Error("Form field not found");
  }

  return mapFormFieldRecord(field);
}
