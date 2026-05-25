import {
  type ServerRouter,
  type TRPCClientErrorLike,
} from "@repo/trpc/client";
import { API_ERROR_CODES, type ApiErrorCode, apiErrorCodeModel } from "@repo/validators/api-errors";

export type TrpcClientError = TRPCClientErrorLike<ServerRouter>;

type ErrorDataShape = {
  apiCode?: unknown;
  httpStatus?: number;
};

function readErrorData(error: TrpcClientError | null | undefined): ErrorDataShape | undefined {
  if (!error?.data) {
    return undefined;
  }
  return error.data as ErrorDataShape;
}

export function getApiErrorCode(
  error: TrpcClientError | null | undefined,
): ApiErrorCode | undefined {
  const data = readErrorData(error);
  if (!data) {
    return undefined;
  }

  const parsed = apiErrorCodeModel.safeParse(data.apiCode);
  if (parsed.success) {
    return parsed.data;
  }

  if (data.httpStatus === 429) {
    return API_ERROR_CODES.RATE_LIMIT_EXCEEDED;
  }

  return undefined;
}

export function getPublicFormErrorMessage(error: TrpcClientError | null | undefined): string {
  const code = getApiErrorCode(error);

  switch (code) {
    case API_ERROR_CODES.FORM_NOT_PUBLISHED:
      return "This form is not published yet. Check back later or contact the creator.";
    case API_ERROR_CODES.FORM_NOT_FOUND:
      return "We could not find this form. The link may be wrong or the form was removed.";
    case API_ERROR_CODES.FORM_NOT_ACCEPTING_RESPONSES:
      return "This form is no longer accepting responses.";
    case API_ERROR_CODES.FORM_EXPIRED:
      return "This form has expired and is no longer accepting responses.";
    case API_ERROR_CODES.FORM_RESPONSE_LIMIT_REACHED:
      return "This form has reached its response limit.";
    case API_ERROR_CODES.FORM_ARCHIVED:
      return "This form is no longer available.";
    case API_ERROR_CODES.FORM_PASSWORD_REQUIRED:
    case API_ERROR_CODES.FORM_PASSWORD_INVALID:
      return "A valid password is required to open this form.";
    case API_ERROR_CODES.RATE_LIMIT_EXCEEDED:
      return "Too many submissions from your network. Please wait a few minutes and try again.";
    default:
      return "This form does not exist, is not published, or cannot be opened.";
  }
}

export function toastIfRateLimited(error: TrpcClientError): boolean {
  if (getApiErrorCode(error) !== API_ERROR_CODES.RATE_LIMIT_EXCEEDED) {
    return false;
  }
  return true;
}
