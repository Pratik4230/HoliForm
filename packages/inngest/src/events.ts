export const INNGEST_EVENTS = {
  SEND_VERIFICATION_OTP: "email/verification.send",
  FORM_RESPONSE_SUBMITTED: "form/response.submitted",
} as const;

export type SendVerificationOtpData = {
  email: string;
  fullName: string;
  code: string;
};

export type FormResponseSubmittedData = {
  responseId: string;
};

export type SendVerificationOtpEvent = {
  name: typeof INNGEST_EVENTS.SEND_VERIFICATION_OTP;
  data: SendVerificationOtpData;
};

export type FormResponseSubmittedEvent = {
  name: typeof INNGEST_EVENTS.FORM_RESPONSE_SUBMITTED;
  data: FormResponseSubmittedData;
};
