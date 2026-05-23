import { z } from "zod";

import { formFieldTypeModel } from "./formField";

export const listResponsesByFormInputModel = z.object({
  formId: z.uuid().describe("Form id"),
  page: z.number().int().min(1).default(1).describe("Page number (1-based)"),
  pageSize: z.number().int().min(1).max(100).default(20).describe("Items per page"),
});

export type ListResponsesByFormInput = z.infer<typeof listResponsesByFormInputModel>;

export const responseAnswerOutputModel = z.object({
  fieldId: z.uuid().describe("Field id"),
  labelKey: z.string().describe("Answer key"),
  label: z.string().describe("Field label"),
  type: formFieldTypeModel.describe("Field type"),
  value: z.unknown().describe("Answer value"),
});

export type ResponseAnswerOutput = z.infer<typeof responseAnswerOutputModel>;

export const responseListItemOutputModel = z.object({
  id: z.uuid().describe("Response id"),
  formId: z.uuid().describe("Form id"),
  submittedAt: z.coerce.date().describe("Submitted at"),
  respondentIp: z.string().nullable().describe("Respondent IP if captured"),
  answerCount: z.number().int().describe("Number of answers"),
  preview: z
    .record(z.string(), z.unknown())
    .describe("labelKey to value preview for table display"),
});

export type ResponseListItem = z.infer<typeof responseListItemOutputModel>;

export const listResponsesByFormOutputModel = z.object({
  items: z.array(responseListItemOutputModel).describe("Response rows"),
  total: z.number().int().describe("Total matching responses"),
  page: z.number().int().describe("Current page"),
  pageSize: z.number().int().describe("Page size"),
  totalPages: z.number().int().describe("Total pages"),
});

export type ListResponsesByFormOutput = z.infer<typeof listResponsesByFormOutputModel>;

export const getResponseByIdInputModel = z.object({
  formId: z.uuid().describe("Form id"),
  responseId: z.uuid().describe("Response id"),
});

export type GetResponseByIdInput = z.infer<typeof getResponseByIdInputModel>;

export const responseDetailOutputModel = z.object({
  id: z.uuid().describe("Response id"),
  formId: z.uuid().describe("Form id"),
  submittedAt: z.coerce.date().describe("Submitted at"),
  respondentIp: z.string().nullable().describe("Respondent IP"),
  metadata: z.record(z.string(), z.unknown()).nullable().describe("Extra metadata"),
});

export type ResponseDetail = z.infer<typeof responseDetailOutputModel>;

export const getResponseByIdOutputModel = z.object({
  response: responseDetailOutputModel.describe("Response metadata"),
  answers: z.array(responseAnswerOutputModel).describe("Answers with field context"),
});

export type GetResponseByIdOutput = z.infer<typeof getResponseByIdOutputModel>;

const choiceCountsModel = z.record(z.string(), z.number().int().nonnegative());

export const fieldAnalyticsOutputModel = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("choice"),
    fieldId: z.uuid(),
    label: z.string(),
    labelKey: z.string(),
    type: z.enum(["select", "radio", "multiselect", "checkbox"]),
    totalAnswers: z.number().int(),
    counts: choiceCountsModel,
  }),
  z.object({
    kind: z.literal("text"),
    fieldId: z.uuid(),
    label: z.string(),
    labelKey: z.string(),
    type: z.enum(["text", "textarea", "email", "phone", "date"]),
    totalAnswers: z.number().int(),
    recentSamples: z.array(z.string()).max(5),
  }),
  z.object({
    kind: z.literal("number"),
    fieldId: z.uuid(),
    label: z.string(),
    labelKey: z.string(),
    type: z.literal("number"),
    totalAnswers: z.number().int(),
    min: z.number().nullable(),
    max: z.number().nullable(),
    average: z.number().nullable(),
  }),
  z.object({
    kind: z.literal("boolean"),
    fieldId: z.uuid(),
    label: z.string(),
    labelKey: z.string(),
    type: z.literal("checkbox"),
    totalAnswers: z.number().int(),
    trueCount: z.number().int(),
    falseCount: z.number().int(),
  }),
]);

export type FieldAnalytics = z.infer<typeof fieldAnalyticsOutputModel>;

export const getFormAnalyticsInputModel = z.object({
  formId: z.uuid().describe("Form id"),
});

export type GetFormAnalyticsInput = z.infer<typeof getFormAnalyticsInputModel>;

export const getFormAnalyticsOutputModel = z.object({
  formId: z.uuid().describe("Form id"),
  totalResponses: z.number().int().describe("Total response count"),
  firstResponseAt: z.coerce.date().nullable().describe("Earliest submission"),
  lastResponseAt: z.coerce.date().nullable().describe("Latest submission"),
  recentResponses: z
    .array(responseListItemOutputModel)
    .max(5)
    .describe("Five most recent responses"),
  fieldBreakdowns: z.array(fieldAnalyticsOutputModel).describe("Per-field analytics"),
});

export type GetFormAnalyticsOutput = z.infer<typeof getFormAnalyticsOutputModel>;
