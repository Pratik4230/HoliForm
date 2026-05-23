import { and, db, eq } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/formField";
import { API_ERROR_CODES } from "@repo/validators/api-errors";
import { AppServiceError } from "../errors";

export async function getOwnedFormOrThrow(userId: string, formId: string) {
  const rows = await db.select().from(formsTable).where(eq(formsTable.id, formId));

  const form = rows[0];
  if (!form) {
    throw new AppServiceError("Form not found", API_ERROR_CODES.FORM_NOT_FOUND);
  }

  if (form.userId !== userId) {
    throw new AppServiceError(
      "You do not have access to this form",
      API_ERROR_CODES.FORM_FORBIDDEN,
    );
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
    throw new AppServiceError("Form field not found", API_ERROR_CODES.FORM_FIELD_NOT_FOUND);
  }

  return field;
}
