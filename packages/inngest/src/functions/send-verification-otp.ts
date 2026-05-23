import type { InngestFunction } from "inngest";
import { sendVerificationOtpEmail } from "@repo/email";
import { logger } from "@repo/logger";

import { inngest } from "../client";
import { INNGEST_EVENTS, type SendVerificationOtpData } from "../events";

export const sendVerificationOtpFunction: InngestFunction.Any = inngest.createFunction(
  {
    id: "send-verification-otp",
    retries: 3,
    triggers: { event: INNGEST_EVENTS.SEND_VERIFICATION_OTP },
  },
  async ({ event }: { event: { data: SendVerificationOtpData } }) => {
    const { email, fullName, code } = event.data;
    await sendVerificationOtpEmail({ to: email, fullName, code });
    logger.info("Verification OTP email sent", { email });
  },
);
