import { and, asc, db, eq } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/formField";
import {
  formResponseAnswersTable,
  formResponsesTable,
} from "@repo/database/models/formResponse";
import { usersTable } from "@repo/database/models/user";
import type { FormFieldRecord } from "@repo/validators/forms";
import {
  getPublicFormInputModel,
  submitFormResponseInputModel,
  type GetPublicFormInput,
  type GetPublicFormOutput,
  type PublicFormRecord,
  type SubmitFormResponseInput,
  type SubmitFormResponseOutput,
} from "@repo/validators/forms";

import { buildSubmissionSchemaFromFields } from "./buildSubmissionSchema";
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

async function loadPublishedFormContext(username: string, slug: string) {
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

  const fields = rows
    .filter((row) => row.field !== null)
    .map((row) => mapFormFieldRecord(row.field!));

  return {
    form: firstRow.form,
    username: firstRow.username,
    fields,
  };
}

export async function getPublicForm(payload: GetPublicFormInput): Promise<GetPublicFormOutput> {
  const { username, slug } = await getPublicFormInputModel.parseAsync(payload);
  const { form, username: creatorUsername, fields } = await loadPublishedFormContext(
    username,
    slug,
  );

  return {
    form: mapPublicFormRecord(form, creatorUsername),
    fields,
  };
}

export async function submitFormResponse(
  payload: SubmitFormResponseInput,
  options?: { respondentIp?: string },
): Promise<SubmitFormResponseOutput> {
  const { username, slug, answers } = await submitFormResponseInputModel.parseAsync(payload);
  const { form, fields } = await loadPublishedFormContext(username, slug);

  if (form.closedAt !== null) {
    throw new Error("Form is not accepting responses");
  }

  const submissionSchema = buildSubmissionSchemaFromFields(fields);
  const validatedAnswers = await submissionSchema.parseAsync(answers);

  const fieldByLabelKey = new Map<string, FormFieldRecord>();
  for (const field of fields) {
    fieldByLabelKey.set(field.labelKey, field);
  }

  const result = await db.transaction(async (tx) => {
    const insertedResponses = await tx
      .insert(formResponsesTable)
      .values({
        formId: form.id,
        respondentIp: options?.respondentIp ?? null,
      })
      .returning({ id: formResponsesTable.id });

    const response = insertedResponses[0];
    if (!response) {
      throw new Error("Failed to save response");
    }

    const answerRows = Object.entries(validatedAnswers).map(([labelKey, value]) => {
      const field = fieldByLabelKey.get(labelKey);
      if (!field) {
        throw new Error("Invalid answer field");
      }

      return {
        responseId: response.id,
        fieldId: field.id,
        value,
      };
    });

    if (answerRows.length > 0) {
      await tx.insert(formResponseAnswersTable).values(answerRows);
    }

    return response;
  });

  return {
    success: true,
    responseId: result.id,
    thankYouMessage: form.thankYouMessage ?? "Thank you for your response!",
  };
}
