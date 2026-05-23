import type { InngestFunction } from "inngest";
import { eq } from "@repo/database";
import { db } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/formField";
import {
  formResponseAnswersTable,
  formResponsesTable,
} from "@repo/database/models/formResponse";
import { usersTable } from "@repo/database/models/user";
import {
  emailEnv,
  sendCreatorNewResponseEmail,
  sendRespondentThankYouEmail,
} from "@repo/email";
import { logger } from "@repo/logger";

import { inngest } from "../client";
import { INNGEST_EVENTS, type FormResponseSubmittedData } from "../events";

function formatAnswerValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(", ");
  }
  return JSON.stringify(value);
}

export const formResponseEmailsFunction: InngestFunction.Any = inngest.createFunction(
  {
    id: "form-response-emails",
    retries: 3,
    triggers: { event: INNGEST_EVENTS.FORM_RESPONSE_SUBMITTED },
  },
  async ({ event }: { event: { data: FormResponseSubmittedData } }) => {
    const { responseId } = event.data;

    const responseRows = await db
      .select({
        response: formResponsesTable,
        form: formsTable,
        creatorEmail: usersTable.email,
        creatorName: usersTable.fullName,
        creatorId: usersTable.id,
        creatorEmailNotificationsEnabled: usersTable.emailNotificationsEnabled,
      })
      .from(formResponsesTable)
      .innerJoin(formsTable, eq(formResponsesTable.formId, formsTable.id))
      .innerJoin(usersTable, eq(formsTable.userId, usersTable.id))
      .where(eq(formResponsesTable.id, responseId))
      .limit(1);

    const row = responseRows[0];
    if (!row) {
      logger.warn("Form response not found for email job", { responseId });
      return;
    }

    const answerRows = await db
      .select({
        label: formFieldsTable.label,
        type: formFieldsTable.type,
        value: formResponseAnswersTable.value,
      })
      .from(formResponseAnswersTable)
      .innerJoin(formFieldsTable, eq(formResponseAnswersTable.fieldId, formFieldsTable.id))
      .where(eq(formResponseAnswersTable.responseId, responseId));

    const summaryLines = answerRows.map(
      (answer) => `${answer.label}: ${formatAnswerValue(answer.value)}`,
    );
    const responseSummary =
      summaryLines.length > 0 ? summaryLines.join("\n") : "(No answers recorded)";

    const dashboardUrl = `${emailEnv.WEB_APP_URL}/dashboard/forms/${row.form.id}/responses`;

    if (row.creatorEmailNotificationsEnabled) {
      await sendCreatorNewResponseEmail({
        to: row.creatorEmail,
        creatorName: row.creatorName,
        formTitle: row.form.title,
        responseSummary,
        dashboardUrl,
      });
    } else {
      logger.info("Skipped creator notification email (disabled in account settings)", {
        responseId,
        creatorId: row.creatorId,
      });
    }

    const respondentEmailAnswer = answerRows.find((answer) => answer.type === "email");
    const respondentEmail = respondentEmailAnswer
      ? formatAnswerValue(respondentEmailAnswer.value).trim()
      : "";

    if (respondentEmail && respondentEmail.includes("@")) {
      await sendRespondentThankYouEmail({
        to: respondentEmail,
        formTitle: row.form.title,
        thankYouMessage: row.form.thankYouMessage ?? "Thank you for your response!",
      });
    }

    logger.info("Form response emails sent", {
      responseId,
      creatorId: row.creatorId,
      respondentEmail: respondentEmail || null,
    });
  },
);
