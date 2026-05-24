"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { RouterOutputs } from "@repo/trpc/client";
import { downloadResponsesCsv } from "~/lib/export-responses-csv";
import { trpc } from "~/trpc/client";

export type ResponsesListOutput = RouterOutputs["responses"]["listByForm"];
export type ResponseListItem = ResponsesListOutput["items"][number];
export type ResponseDetailOutput = RouterOutputs["responses"]["getById"];
export type FormAnalyticsOutput = RouterOutputs["responses"]["getAnalytics"];
export type FieldAnalytics = FormAnalyticsOutput["fieldBreakdowns"][number];
export type ExportResponsesOutput = RouterOutputs["responses"]["exportByForm"];

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
