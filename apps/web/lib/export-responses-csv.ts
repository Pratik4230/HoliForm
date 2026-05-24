import type { RouterOutputs } from "@repo/trpc/client";

export type ExportResponsesData = RouterOutputs["responses"]["exportByForm"];

function formatAnswerForCsv(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => formatAnswerForCsv(item)).join("; ");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildColumnHeaders(columns: ExportResponsesData["columns"]): string[] {
  const labelCounts = new Map<string, number>();

  return columns.map((column) => {
    const count = (labelCounts.get(column.label) ?? 0) + 1;
    labelCounts.set(column.label, count);

    if (count > 1) {
      return `${column.label} (${column.labelKey})`;
    }

    return column.label;
  });
}

export function buildResponsesCsv(data: ExportResponsesData): string {
  const headers = [
    "Submitted At",
    "Response ID",
    ...buildColumnHeaders(data.columns),
    "Respondent IP",
  ];

  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...data.rows.map((row) => {
      const cells = [
        new Date(row.submittedAt).toISOString(),
        row.id,
        ...data.columns.map((column) => formatAnswerForCsv(row.answers[column.labelKey])),
        row.respondentIp ?? "",
      ];

      return cells.map(escapeCsvCell).join(",");
    }),
  ];

  return lines.join("\n");
}

function sanitizeFilenamePart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function downloadResponsesCsv(data: ExportResponsesData): void {
  const csv = buildResponsesCsv(data);
  const slug = sanitizeFilenamePart(data.formSlug) || "form";
  const date = new Date().toISOString().slice(0, 10);
  const filename = `${slug}-responses-${date}.csv`;
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
