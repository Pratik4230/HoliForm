import type { InngestFunction } from "inngest";

import { formResponseEmailsFunction } from "./form-response-emails";
import { sendVerificationOtpFunction } from "./send-verification-otp";

export const inngestFunctions: InngestFunction.Any[] = [
  sendVerificationOtpFunction,
  formResponseEmailsFunction,
];
