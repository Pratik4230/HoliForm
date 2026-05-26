import type { CookieOptions, Response, Request } from "express";
import { TRPCContext } from "../context";

const ONE_MINUTE = 60000;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_WEEK = 7 * ONE_DAY;
const ONE_MONTH = 30 * ONE_DAY;
const ONE_YEAR = 365 * ONE_DAY;

const defaultCookieOption: CookieOptions = {
  path: "/",
  httpOnly: true,
  secure: false,
  sameSite: "strict",
  maxAge: ONE_YEAR,
};

function isProductionEnv() {
  const nodeEnv = String(process.env.NODE_ENV ?? "");
  return nodeEnv === "prod" || nodeEnv === "production";
}

/** Cross-site cookies for Vercel web + Render/Railway API in production. */
export function getAuthCookieOptions(): CookieOptions {
  if (isProductionEnv()) {
    return {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ONE_YEAR,
    };
  }
  return defaultCookieOption;
}

export function createCookieFactory(res: Response) {
  return function createCookie(
    name: string,
    value: string,
    opts: CookieOptions = defaultCookieOption,
  ) {
    res.cookie(name, value, opts);
  };
}

export function getCookieFactory(req: Request) {
  return function getCookie(name: string) {
    return req.cookies[name];
  };
}

export function clearCookieFactory(res: Response) {
  return function clearCookie(name: string, opts?: CookieOptions) {
    if (opts) {
      res.clearCookie(name, {
        path: opts.path,
        secure: opts.secure,
        sameSite: opts.sameSite,
      });
      return;
    }
    res.clearCookie(name);
  };
}

//Authetication cookie

const AUTHENTICATION_COOKIE_NAME = "authentication-token";

export function setAutheticationCookie(ctx: TRPCContext, accessToken: string) {
  ctx.createCookie(AUTHENTICATION_COOKIE_NAME, accessToken, getAuthCookieOptions());
}

export function getAutheticationCookie(ctx: TRPCContext) {
  return ctx.getCookie(AUTHENTICATION_COOKIE_NAME);
}

export function clearAutheticationCookie(ctx: TRPCContext) {
  ctx.clearCookie(AUTHENTICATION_COOKIE_NAME, getAuthCookieOptions());
}
