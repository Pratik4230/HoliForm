import { count, db, eq } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formResponsesTable } from "@repo/database/models/formResponse";

export type FormAvailabilityReason =
  | "closed"
  | "expired"
  | "response_limit"
  | "archived"
  | null;

export function getFormAvailability(
  form: typeof formsTable.$inferSelect,
  responseCount: number,
): { acceptingResponses: boolean; reason: FormAvailabilityReason } {
  if (form.archivedAt) {
    return { acceptingResponses: false, reason: "archived" };
  }

  if (form.closedAt) {
    return { acceptingResponses: false, reason: "closed" };
  }

  if (form.expiresAt && new Date() > form.expiresAt) {
    return { acceptingResponses: false, reason: "expired" };
  }

  if (form.maxResponses !== null && form.maxResponses !== undefined) {
    if (responseCount >= form.maxResponses) {
      return { acceptingResponses: false, reason: "response_limit" };
    }
  }

  return { acceptingResponses: true, reason: null };
}

export async function countFormResponses(formId: string) {
  const [row] = await db
    .select({ total: count() })
    .from(formResponsesTable)
    .where(eq(formResponsesTable.formId, formId));

  return Number(row?.total ?? 0);
}
