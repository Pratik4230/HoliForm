import { and, db, eq } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/formField";

export async function getOwnedFormOrThrow(userId: string, formId: string) {
  const rows = await db
    .select()
    .from(formsTable)
    .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)));

  const form = rows[0];
  if (!form) {
    throw new Error("Form not found");
  }

  return form;
}

export async function getOwnedFieldOrThrow(userId: string, formId: string, fieldId: string) {
  await getOwnedFormOrThrow(userId, formId);

  const rows = await db
    .select()
    .from(formFieldsTable)
    .where(and(eq(formFieldsTable.id, fieldId), eq(formFieldsTable.formId, formId)));

  const field = rows[0];
  if (!field) {
    throw new Error("Form field not found");
  }

  return field;
}
