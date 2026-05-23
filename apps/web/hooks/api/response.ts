"use client";

import type { RouterOutputs } from "@repo/trpc/client";
import { trpc } from "~/trpc/client";

export type ResponsesListOutput = RouterOutputs["responses"]["listByForm"];
export type ResponseListItem = ResponsesListOutput["items"][number];
export type ResponseDetailOutput = RouterOutputs["responses"]["getById"];
export type FormAnalyticsOutput = RouterOutputs["responses"]["getAnalytics"];
export type FieldAnalytics = FormAnalyticsOutput["fieldBreakdowns"][number];

export function useResponsesByForm(
  formId: string,
  page: number,
  pageSize = 20,
) {
  return trpc.responses.listByForm.useQuery({
    formId,
    page,
    pageSize,
  });
}

export function useResponseById(formId: string, responseId: string | null) {
  return trpc.responses.getById.useQuery(
    { formId, responseId: responseId! },
    { enabled: Boolean(responseId) },
  );
}

export function useFormAnalytics(formId: string) {
  return trpc.responses.getAnalytics.useQuery({ formId });
}
