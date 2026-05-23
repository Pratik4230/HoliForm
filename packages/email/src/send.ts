import { fromAddress, resend } from "./client";
import {
  creatorNewResponseEmail,
  respondentThankYouEmail,
  verificationOtpEmail,
} from "./templates";

async function sendEmail(params: { to: string; subject: string; html: string }) {
  const { error } = await resend.emails.send({
    from: fromAddress(),
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendVerificationOtpEmail(params: {
  to: string;
  fullName: string;
  code: string;
}) {
  const { subject, html } = verificationOtpEmail({
    fullName: params.fullName,
    code: params.code,
  });
  await sendEmail({ to: params.to, subject, html });
}

export async function sendCreatorNewResponseEmail(params: {
  to: string;
  creatorName: string;
  formTitle: string;
  responseSummary: string;
  dashboardUrl: string;
}) {
  const { subject, html } = creatorNewResponseEmail(params);
  await sendEmail({ to: params.to, subject, html });
}

export async function sendRespondentThankYouEmail(params: {
  to: string;
  formTitle: string;
  thankYouMessage: string;
}) {
  const { subject, html } = respondentThankYouEmail(params);
  await sendEmail({ to: params.to, subject, html });
}
