import type { ApiErrorCode } from "@repo/validators/api-errors";

export class AppServiceError extends Error {
  readonly code: ApiErrorCode;

  constructor(message: string, code: ApiErrorCode) {
    super(message);
    this.name = "AppServiceError";
    this.code = code;
  }
}

export function isAppServiceError(error: unknown): error is AppServiceError {
  return error instanceof AppServiceError;
}
