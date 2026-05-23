import { and, asc, db, eq } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/formField";
import {
  formResponseAnswersTable,
  formResponsesTable,
} from "@repo/database/models/formResponse";
import { usersTable } from "@repo/database/models/user";
import { API_ERROR_CODES } from "@repo/validators/api-errors";
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

import { AppServiceError } from "../errors";
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

async function getPublishedFormRow(username: string, slug: string) {
  const creatorRows = await db
    .select({ id: usersTable.id, username: usersTable.username })
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);

  const creator = creatorRows[0];
  if (!creator) {
    throw new AppServiceError("Form not found", API_ERROR_CODES.FORM_NOT_FOUND);
  }

  const formRows = await db
    .select()
    .from(formsTable)
    .where(and(eq(formsTable.userId, creator.id), eq(formsTable.slug, slug)))
    .limit(1);

  const form = formRows[0];
  if (!form) {
    throw new AppServiceError("Form not found", API_ERROR_CODES.FORM_NOT_FOUND);
  }

  if (form.status !== "published") {
    throw new AppServiceError("This form is not published", API_ERROR_CODES.FORM_NOT_PUBLISHED);
  }

  return { form, username: creator.username };
}

async function loadPublishedFormContext(username: string, slug: string) {
  const { form, username: creatorUsername } = await getPublishedFormRow(username, slug);

  const fieldRows = await db
    .select()
    .from(formFieldsTable)
    .where(eq(formFieldsTable.formId, form.id))
    .orderBy(asc(formFieldsTable.index));

  const fields = fieldRows.map((row) => mapFormFieldRecord(row));

  return {
    form,
    username: creatorUsername,
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
    throw new AppServiceError(
      "Form is not accepting responses",
      API_ERROR_CODES.FORM_NOT_ACCEPTING_RESPONSES,
    );
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
      throw new AppServiceError("Failed to save response", API_ERROR_CODES.INTERNAL_ERROR);
    }

    const answerRows = Object.entries(validatedAnswers).map(([labelKey, value]) => {
      const field = fieldByLabelKey.get(labelKey);
      if (!field) {
        throw new AppServiceError("Invalid answer field", API_ERROR_CODES.VALIDATION_ERROR);
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
