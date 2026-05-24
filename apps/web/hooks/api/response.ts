"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { ListResponsesSort } from "@repo/validators/forms";
import type { RouterOutputs } from "@repo/trpc/client";
import { downloadResponsesCsv } from "~/lib/export-responses-csv";
import { trpc } from "~/trpc/client";

export type ResponsesListOutput = RouterOutputs["responses"]["listByForm"];
export type ResponseListItem = ResponsesListOutput["items"][number];
export type ResponseDetailOutput = RouterOutputs["responses"]["getById"];
export type FormAnalyticsOutput = RouterOutputs["responses"]["getAnalytics"];
export type FieldAnalytics = FormAnalyticsOutput["fieldBreakdowns"][number];
export type ExportResponsesOutput = RouterOutputs["responses"]["exportByForm"];

export type ResponseListFilters = {
  sort: ListResponsesSort;
  search?: string;
  submittedFrom?: string;
  submittedTo?: string;
  fieldId?: string;
  fieldValue?: string;
};

function parseFilterDate(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function useResponsesByForm(
  formId: string,
  page: number,
  pageSize = 20,
  filters: ResponseListFilters = { sort: "newest" },
) {
  const search = filters.search?.trim();
  const fieldValue = filters.fieldValue?.trim();

  return trpc.responses.listByForm.useQuery(
    {
      formId,
      page,
      pageSize,
      sort: filters.sort,
      search: search || undefined,
      submittedFrom: parseFilterDate(filters.submittedFrom),
      submittedTo: parseFilterDate(filters.submittedTo),
      fieldId: filters.fieldId || undefined,
      fieldValue: fieldValue || undefined,
    },
    {
      placeholderData: (previousData) => previousData,
    },
  );
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

export function useExportResponsesByForm() {
  const utils = trpc.useUtils();
  const [isExporting, setIsExporting] = useState(false);

  const exportCsv = async (formId: string) => {
    setIsExporting(true);
    try {
      const data = await utils.client.responses.exportByForm.query({ formId });
      downloadResponsesCsv(data);
      toast.success(
        data.rows.length === 1
          ? "Exported 1 response to CSV"
          : `Exported ${data.rows.length} responses to CSV`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to export responses";
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportCsv, isExporting };
}
