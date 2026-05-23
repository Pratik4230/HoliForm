import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import { API_ERROR_CODES, type ApiErrorCode } from "@repo/validators/api-errors";
import { AppServiceError, isAppServiceError } from "@repo/services/errors";

type TrpcErrorCode = TRPCError["code"];

const API_CODE_TO_TRPC: Record<ApiErrorCode, TrpcErrorCode> = {
  [API_ERROR_CODES.FORM_NOT_FOUND]: "NOT_FOUND",
  [API_ERROR_CODES.FORM_NOT_PUBLISHED]: "NOT_FOUND",
  [API_ERROR_CODES.RESPONSE_NOT_FOUND]: "NOT_FOUND",
  [API_ERROR_CODES.FORM_FIELD_NOT_FOUND]: "NOT_FOUND",
  [API_ERROR_CODES.FORM_FORBIDDEN]: "FORBIDDEN",
  [API_ERROR_CODES.FORM_NOT_ACCEPTING_RESPONSES]: "PRECONDITION_FAILED",
  [API_ERROR_CODES.FORM_SLUG_CONFLICT]: "CONFLICT",
  [API_ERROR_CODES.FORM_FIELD_LABEL_KEY_CONFLICT]: "CONFLICT",
  [API_ERROR_CODES.AUTH_CONFLICT]: "CONFLICT",
  [API_ERROR_CODES.AUTH_INVALID_CREDENTIALS]: "UNAUTHORIZED",
  [API_ERROR_CODES.RATE_LIMIT_EXCEEDED]: "TOO_MANY_REQUESTS",
  [API_ERROR_CODES.VALIDATION_ERROR]: "BAD_REQUEST",
  [API_ERROR_CODES.UPDATE_REQUIRES_FIELDS]: "BAD_REQUEST",
  [API_ERROR_CODES.INTERNAL_ERROR]: "INTERNAL_SERVER_ERROR",
};

/** Maps service-layer errors to tRPC errors with `data.apiCode` for clients. */
export function mapServiceError(error: unknown): never {
  if (isAppServiceError(error)) {
    throw new TRPCError({
      code: API_CODE_TO_TRPC[error.code],
      message: error.message,
      cause: error,
    });
  }

  if (error instanceof ZodError) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Validation failed",
      cause: new AppServiceError("Validation failed", API_ERROR_CODES.VALIDATION_ERROR),
    });
  }

  if (error instanceof TRPCError) {
    throw error;
  }

  if (error instanceof Error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
      cause: new AppServiceError(error.message, API_ERROR_CODES.INTERNAL_ERROR),
    });
  }

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
    cause: new AppServiceError("An unexpected error occurred", API_ERROR_CODES.INTERNAL_ERROR),
  });
}
