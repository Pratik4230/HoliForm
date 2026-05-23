import {
  type ServerRouter,
  type TRPCClientErrorLike,
} from "@repo/trpc/client";
import { API_ERROR_CODES, type ApiErrorCode, apiErrorCodeModel } from "@repo/validators/api-errors";

export function getApiErrorCode(
  error: TRPCClientErrorLike<ServerRouter> | null | undefined,
): ApiErrorCode | undefined {
  if (!error?.data) {
    return undefined;
  }

  const parsed = apiErrorCodeModel.safeParse(
    (error.data as { apiCode?: unknown }).apiCode,
  );

  return parsed.success ? parsed.data : undefined;
}

export function getPublicFormErrorMessage(
  error: TRPCClientErrorLike<ServerRouter> | null | undefined,
): string {
  const code = getApiErrorCode(error);

  switch (code) {
    case API_ERROR_CODES.FORM_NOT_PUBLISHED:
      return "This form is not published yet. Check back later or contact the creator.";
    case API_ERROR_CODES.FORM_NOT_FOUND:
      return "We could not find this form. The link may be wrong or the form was removed.";
    case API_ERROR_CODES.FORM_NOT_ACCEPTING_RESPONSES:
      return "This form is no longer accepting responses.";
    default:
      return "This form does not exist, is not published, or cannot be opened.";
  }
}
