import type { Request, RequestHandler, Response } from "express";
import rateLimit from "express-rate-limit";

import { API_ERROR_CODES } from "@repo/validators/api-errors";

import { env } from "../env";

function getRoutePath(req: Request): string {
  return (req.path.split("?")[0] ?? "").replace(/^\//, "");
}

export function isAuthMutationRequest(req: Request): boolean {
  if (req.method !== "POST") {
    return false;
  }
  const path = getRoutePath(req);
  return (
    path.includes("signInUserWithEmailAndPassword") ||
    path.includes("createUserWithEmailAndPasswordInput") ||
    path.includes("verifyEmailWithOtp") ||
    path.includes("resendEmailVerificationOtp")
  );
}

export function isSubmitFormResponseRequest(req: Request): boolean {
  if (req.method !== "POST") {
    return false;
  }
  return getRoutePath(req).includes("submitFormResponse");
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return String(forwarded[0]).trim();
  }
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

function rateLimitExceededHandler(
  _req: Request,
  res: Response,
  _next: () => void,
  options: { message: string },
): void {
  res.status(429).json({
    message: options.message,
    apiCode: API_ERROR_CODES.RATE_LIMIT_EXCEEDED,
  });
}

function createLimiter(options: {
  windowMs: number;
  max: number;
  message: string;
  skip?: (req: Request) => boolean;
}): RequestHandler {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getClientIp(req),
    handler: rateLimitExceededHandler,
    message: options.message,
    skip: options.skip,
  });
}

/** All `/trpc` and `/api` traffic (dashboard, public form load, etc.). */
export const generalApiRateLimiter = createLimiter({
  windowMs: env.RATE_LIMIT_API_WINDOW_MS,
  max: env.RATE_LIMIT_API_MAX,
  message: "Too many requests from this address. Please try again later.",
});

/** Sign-up and sign-in (brute-force protection). */
export const authRateLimiter = createLimiter({
  windowMs: env.RATE_LIMIT_AUTH_WINDOW_MS,
  max: env.RATE_LIMIT_AUTH_MAX,
  message: "Too many authentication attempts. Please try again later.",
  skip: (req) => !isAuthMutationRequest(req),
});

/** Public form submissions (strictest). */
export const submitFormResponseRateLimiter = createLimiter({
  windowMs: env.RATE_LIMIT_SUBMIT_WINDOW_MS,
  max: env.RATE_LIMIT_SUBMIT_MAX,
  message: "Too many submissions from this address. Please try again later.",
  skip: (req) => !isSubmitFormResponseRequest(req),
});

/** Stack on `/trpc` and `/api` — each request runs through all three limiters. */
export const apiRateLimitMiddleware: RequestHandler[] = [
  generalApiRateLimiter,
  authRateLimiter,
  submitFormResponseRateLimiter,
];
