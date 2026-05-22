import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createCookieFactory, getCookieFactory, clearCookieFactory } from "./utils/cookie";

export interface TRPCContext {
  createCookie: ReturnType<typeof createCookieFactory>;
  getCookie: ReturnType<typeof getCookieFactory>;
  clearCookie: ReturnType<typeof clearCookieFactory>;
}

export type AuthenticatedUser = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  profileImageUrl: string | null;
};

export type AuthenticatedTRPCContext = TRPCContext & {
  user: AuthenticatedUser;
};

export async function createContext({
  req,
  res,
}: CreateExpressContextOptions): Promise<TRPCContext> {
  const ctx: TRPCContext = {
    createCookie: createCookieFactory(res),
    getCookie: getCookieFactory(req),
    clearCookie: clearCookieFactory(res),
  };

  return ctx;
}
export type Context = Awaited<ReturnType<typeof createContext>>;
