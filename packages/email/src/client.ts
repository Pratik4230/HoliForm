import { Resend } from "resend";

import { emailEnv } from "./env";

export const resend = new Resend(emailEnv.RESEND_API_KEY);

export function fromAddress(): string {
  return `${emailEnv.RESEND_FROM_NAME} <${emailEnv.RESEND_FROM_EMAIL}>`;
}
