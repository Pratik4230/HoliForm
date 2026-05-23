function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #171717; max-width: 560px; margin: 0 auto; padding: 24px;">
  <div style="margin-bottom: 24px;">
    <strong style="font-size: 18px;">HoliForm</strong>
  </div>
  ${body}
  <p style="margin-top: 32px; font-size: 12px; color: #737373;">You received this email from HoliForm.</p>
</body>
</html>`;
}

export function verificationOtpEmail(params: { fullName: string; code: string }): {
  subject: string;
  html: string;
} {
  const subject = `${params.code} is your HoliForm verification code`;
  const html = layout(
    subject,
    `<h1 style="font-size: 20px; margin: 0 0 16px;">Verify your email</h1>
<p>Hi ${escapeHtml(params.fullName)},</p>
<p>Enter this code to finish creating your account:</p>
<p style="font-size: 32px; font-weight: 700; letter-spacing: 0.25em; margin: 24px 0;">${escapeHtml(params.code)}</p>
<p style="color: #525252;">This code expires in 10 minutes. If you did not sign up, you can ignore this email.</p>`,
  );
  return { subject, html };
}

export function creatorNewResponseEmail(params: {
  creatorName: string;
  formTitle: string;
  responseSummary: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const subject = `New response on "${params.formTitle}"`;
  const html = layout(
    subject,
    `<h1 style="font-size: 20px; margin: 0 0 16px;">New form response</h1>
<p>Hi ${escapeHtml(params.creatorName)},</p>
<p>Someone submitted <strong>${escapeHtml(params.formTitle)}</strong>.</p>
<pre style="background: #f5f5f5; padding: 16px; border-radius: 8px; white-space: pre-wrap; font-size: 14px;">${escapeHtml(params.responseSummary)}</pre>
<p><a href="${escapeHtml(params.dashboardUrl)}" style="display: inline-block; background: #171717; color: #fff; padding: 10px 16px; border-radius: 8px; text-decoration: none;">View responses</a></p>`,
  );
  return { subject, html };
}

export function respondentThankYouEmail(params: {
  formTitle: string;
  thankYouMessage: string;
}): { subject: string; html: string } {
  const subject = `Thanks for your response — ${params.formTitle}`;
  const html = layout(
    subject,
    `<h1 style="font-size: 20px; margin: 0 0 16px;">Thank you</h1>
<p>${escapeHtml(params.thankYouMessage)}</p>
<p style="color: #525252;">You submitted <strong>${escapeHtml(params.formTitle)}</strong>.</p>`,
  );
  return { subject, html };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
