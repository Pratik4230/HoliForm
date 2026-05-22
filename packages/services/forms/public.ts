import { and, asc, db, eq } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/formField";
import { usersTable } from "@repo/database/models/user";
import {
  getPublicFormInputModel,
  type GetPublicFormInput,
  type GetPublicFormOutput,
  type PublicFormRecord,
} from "@repo/validators/forms";

import { mapFormFieldRecord } from "./mappers";

function mapPublicFormRecord(
  row: typeof formsTable.$inferSelect,
  username: string,
): PublicFormRecord {
  return {
    id: row.id,
    username,
    title: row.title,
    description: row.description,
    slug: row.slug,
    themeId: row.themeId ?? null,
    thankYouMessage: row.thankYouMessage ?? null,
    acceptingResponses: row.closedAt === null,
    closedAt: row.closedAt ?? null,
  };
}

export async function getPublicForm(payload: GetPublicFormInput): Promise<GetPublicFormOutput> {
  const { username, slug } = await getPublicFormInputModel.parseAsync(payload);

  const rows = await db
    .select({
      form: formsTable,
      field: formFieldsTable,
      username: usersTable.username,
    })
    .from(formsTable)
    .innerJoin(usersTable, eq(formsTable.userId, usersTable.id))
    .leftJoin(formFieldsTable, eq(formFieldsTable.formId, formsTable.id))
    .where(
      and(
        eq(usersTable.username, username),
        eq(formsTable.slug, slug),
        eq(formsTable.status, "published"),
      ),
    )
    .orderBy(asc(formFieldsTable.index));

  const firstRow = rows[0];
  if (!firstRow) {
    throw new Error("Form is not available");
  }

  return {
    form: mapPublicFormRecord(firstRow.form, firstRow.username),
    fields: rows
      .filter((row) => row.field !== null)
      .map((row) => mapFormFieldRecord(row.field!)),
  };
}
