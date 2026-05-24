import { and, asc, count, db, desc, eq, inArray } from "@repo/database";
import { formFieldsTable } from "@repo/database/models/formField";
import {
  formResponseAnswersTable,
  formResponsesTable,
} from "@repo/database/models/formResponse";
import type { FormFieldRecord } from "@repo/validators/forms";
import {
  exportResponsesByFormInputModel,
  getFormAnalyticsInputModel,
  getResponseByIdInputModel,
  listResponsesByFormInputModel,
  type ExportResponsesByFormOutput,
  type FieldAnalytics,
  type GetFormAnalyticsOutput,
  type GetResponseByIdOutput,
  type ListResponsesByFormOutput,
  type ResponseAnswerOutput,
  type ResponseListItem,
} from "@repo/validators/forms";

import { API_ERROR_CODES } from "@repo/validators/api-errors";
import { AppServiceError } from "../errors";
import { getOwnedFormOrThrow } from "../forms/ownership";
import { mapFormFieldRecord } from "../forms/mappers";

function buildPreview(answers: { labelKey: string; value: unknown }[]): Record<string, unknown> {
  const preview: Record<string, unknown> = {};
  for (const answer of answers) {
    preview[answer.labelKey] = answer.value;
  }
  return preview;
}

async function loadAnswersForResponses(responseIds: string[]) {
  if (responseIds.length === 0) {
    return new Map<string, ResponseAnswerOutput[]>();
  }

  const rows = await db
    .select({
      responseId: formResponseAnswersTable.responseId,
      fieldId: formFieldsTable.id,
      labelKey: formFieldsTable.labelKey,
      label: formFieldsTable.label,
      type: formFieldsTable.type,
      value: formResponseAnswersTable.value,
    })
    .from(formResponseAnswersTable)
    .innerJoin(formFieldsTable, eq(formResponseAnswersTable.fieldId, formFieldsTable.id))
    .where(inArray(formResponseAnswersTable.responseId, responseIds));

  const byResponse = new Map<string, ResponseAnswerOutput[]>();
  for (const row of rows) {
    const list = byResponse.get(row.responseId) ?? [];
    list.push({
      fieldId: row.fieldId,
      labelKey: row.labelKey,
      label: row.label,
      type: row.type,
      value: row.value,
    });
    byResponse.set(row.responseId, list);
  }

  return byResponse;
}

function toListItem(
  row: typeof formResponsesTable.$inferSelect,
  answers: ResponseAnswerOutput[],
): ResponseListItem {
  return {
    id: row.id,
    formId: row.formId,
    submittedAt: row.submittedAt,
    respondentIp: row.respondentIp ?? null,
    answerCount: answers.length,
    preview: buildPreview(answers),
  };
}

function incrementCount(map: Record<string, number>, key: string) {
  map[key] = (map[key] ?? 0) + 1;
}

function buildFieldAnalytics(field: FormFieldRecord, values: unknown[]): FieldAnalytics {
  const totalAnswers = values.length;

  if (field.type === "number") {
    const numbers = values
      .map((value) => (typeof value === "number" ? value : Number(value)))
      .filter((value) => !Number.isNaN(value));

    const sum = numbers.reduce((acc, value) => acc + value, 0);

    return {
      kind: "number",
      fieldId: field.id,
      label: field.label,
      labelKey: field.labelKey,
      type: "number",
      totalAnswers,
      min: numbers.length > 0 ? Math.min(...numbers) : null,
      max: numbers.length > 0 ? Math.max(...numbers) : null,
      average: numbers.length > 0 ? sum / numbers.length : null,
    };
  }

  if (field.type === "checkbox" && !field.options?.choices?.length) {
    let trueCount = 0;
    let falseCount = 0;
    for (const value of values) {
      if (value === true) {
        trueCount += 1;
      } else if (value === false) {
        falseCount += 1;
      }
    }

    return {
      kind: "boolean",
      fieldId: field.id,
      label: field.label,
      labelKey: field.labelKey,
      type: "checkbox",
      totalAnswers,
      trueCount,
      falseCount,
    };
  }

  if (
    field.type === "select" ||
    field.type === "radio" ||
    field.type === "multiselect" ||
    (field.type === "checkbox" && field.options?.choices?.length)
  ) {
    const counts: Record<string, number> = {};
    for (const value of values) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === "string") {
            incrementCount(counts, item);
          }
        }
      } else if (typeof value === "string") {
        incrementCount(counts, value);
      } else if (typeof value === "boolean") {
        incrementCount(counts, value ? "Yes" : "No");
      }
    }

    return {
      kind: "choice",
      fieldId: field.id,
      label: field.label,
      labelKey: field.labelKey,
      type: field.type,
      totalAnswers,
      counts,
    };
  }

  const recentSamples = values
    .map((value) => {
      if (value === null || value === undefined) {
        return "";
      }
      if (typeof value === "string") {
        return value;
      }
      return JSON.stringify(value);
    })
    .filter((value) => value.length > 0)
    .slice(0, 5);

  return {
    kind: "text",
    fieldId: field.id,
    label: field.label,
    labelKey: field.labelKey,
    type:
      field.type === "textarea" ||
      field.type === "email" ||
      field.type === "phone" ||
      field.type === "date"
        ? field.type
        : "text",
    totalAnswers,
    recentSamples,
  };
}

export async function listResponsesByForm(
  userId: string,
  payload: unknown,
): Promise<ListResponsesByFormOutput> {
  const { formId, page, pageSize } = await listResponsesByFormInputModel.parseAsync(payload);
  await getOwnedFormOrThrow(userId, formId);

  const [totalRow] = await db
    .select({ total: count() })
    .from(formResponsesTable)
    .where(eq(formResponsesTable.formId, formId));

  const total = Number(totalRow?.total ?? 0);
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;

  const responseRows = await db
    .select()
    .from(formResponsesTable)
    .where(eq(formResponsesTable.formId, formId))
    .orderBy(desc(formResponsesTable.submittedAt))
    .limit(pageSize)
    .offset(offset);

  const answersByResponse = await loadAnswersForResponses(responseRows.map((row) => row.id));

  const items = responseRows.map((row) =>
    toListItem(row, answersByResponse.get(row.id) ?? []),
  );

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getResponseById(
  userId: string,
  payload: unknown,
): Promise<GetResponseByIdOutput> {
  const { formId, responseId } = await getResponseByIdInputModel.parseAsync(payload);
  await getOwnedFormOrThrow(userId, formId);

  const rows = await db
    .select()
    .from(formResponsesTable)
    .where(
      and(eq(formResponsesTable.id, responseId), eq(formResponsesTable.formId, formId)),
    );

  const response = rows[0];
  if (!response) {
    throw new AppServiceError("Response not found", API_ERROR_CODES.RESPONSE_NOT_FOUND);
  }

  const answersByResponse = await loadAnswersForResponses([responseId]);
  const answers = answersByResponse.get(responseId) ?? [];

  return {
    response: {
      id: response.id,
      formId: response.formId,
      submittedAt: response.submittedAt,
      respondentIp: response.respondentIp ?? null,
      metadata: response.metadata ?? null,
    },
    answers: answers.sort((a, b) => a.labelKey.localeCompare(b.labelKey)),
  };
}

export async function getFormAnalytics(
  userId: string,
  payload: unknown,
): Promise<GetFormAnalyticsOutput> {
  const { formId } = await getFormAnalyticsInputModel.parseAsync(payload);
  await getOwnedFormOrThrow(userId, formId);

  const [totalRow] = await db
    .select({ total: count() })
    .from(formResponsesTable)
    .where(eq(formResponsesTable.formId, formId));

  const totalResponses = Number(totalRow?.total ?? 0);

  const boundsRows = await db
    .select({
      first: formResponsesTable.submittedAt,
      last: formResponsesTable.submittedAt,
    })
    .from(formResponsesTable)
    .where(eq(formResponsesTable.formId, formId))
    .orderBy(asc(formResponsesTable.submittedAt))
    .limit(1);

  const lastRows = await db
    .select({ last: formResponsesTable.submittedAt })
    .from(formResponsesTable)
    .where(eq(formResponsesTable.formId, formId))
    .orderBy(desc(formResponsesTable.submittedAt))
    .limit(1);

  const recentRows = await db
    .select()
    .from(formResponsesTable)
    .where(eq(formResponsesTable.formId, formId))
    .orderBy(desc(formResponsesTable.submittedAt))
    .limit(5);

  const recentAnswers = await loadAnswersForResponses(recentRows.map((row) => row.id));
  const recentResponses = recentRows.map((row) =>
    toListItem(row, recentAnswers.get(row.id) ?? []),
  );

  const fieldRows = await db
    .select()
    .from(formFieldsTable)
    .where(eq(formFieldsTable.formId, formId))
    .orderBy(asc(formFieldsTable.index));

  const fields = fieldRows.map(mapFormFieldRecord);

  const answerRows =
    fields.length === 0
      ? []
      : await db
          .select({
            fieldId: formFieldsTable.id,
            value: formResponseAnswersTable.value,
          })
          .from(formResponseAnswersTable)
          .innerJoin(
            formResponsesTable,
            eq(formResponseAnswersTable.responseId, formResponsesTable.id),
          )
          .innerJoin(formFieldsTable, eq(formResponseAnswersTable.fieldId, formFieldsTable.id))
          .where(eq(formResponsesTable.formId, formId));

  const valuesByFieldId = new Map<string, unknown[]>();
  for (const row of answerRows) {
    const list = valuesByFieldId.get(row.fieldId) ?? [];
    list.push(row.value);
    valuesByFieldId.set(row.fieldId, list);
  }

  const fieldBreakdowns = fields.map((field) =>
    buildFieldAnalytics(field, valuesByFieldId.get(field.id) ?? []),
  );

  return {
    formId,
    totalResponses,
    firstResponseAt: boundsRows[0]?.first ?? null,
    lastResponseAt: lastRows[0]?.last ?? null,
    recentResponses,
    fieldBreakdowns,
  };
}

export async function exportResponsesByForm(
  userId: string,
  payload: unknown,
): Promise<ExportResponsesByFormOutput> {
  const { formId } = await exportResponsesByFormInputModel.parseAsync(payload);
  const form = await getOwnedFormOrThrow(userId, formId);

  const fieldRows = await db
    .select()
    .from(formFieldsTable)
    .where(eq(formFieldsTable.formId, formId))
    .orderBy(asc(formFieldsTable.index));

  const columns = fieldRows.map((field) => ({
    fieldId: field.id,
    labelKey: field.labelKey,
    label: field.label,
  }));

  const responseRows = await db
    .select()
    .from(formResponsesTable)
    .where(eq(formResponsesTable.formId, formId))
    .orderBy(desc(formResponsesTable.submittedAt));

  const answersByResponse = await loadAnswersForResponses(responseRows.map((row) => row.id));

  const rows = responseRows.map((row) => {
    const answers = answersByResponse.get(row.id) ?? [];
    const answerMap: Record<string, unknown> = {};

    for (const answer of answers) {
      answerMap[answer.labelKey] = answer.value;
    }

    return {
      id: row.id,
      submittedAt: row.submittedAt,
      respondentIp: row.respondentIp ?? null,
      answers: answerMap,
    };
  });

  return {
    formId,
    formTitle: form.title,
    formSlug: form.slug,
    columns,
    rows,
  };
}
