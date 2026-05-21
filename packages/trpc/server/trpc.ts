import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";

import { createContext } from "./context";
import { userService } from "./services";
import { getAutheticationCookie } from "./utils/cookie";

export const tRPCContext = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createContext>()
  .create({});

export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure;

const enforceUserIsAuthed = tRPCContext.middleware(async ({ ctx, next }) => {
  const userToken = getAutheticationCookie(ctx);

  if (!userToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in",
    });
  }

  try {
    const user = await userService.verifyAndDecodeToken(userToken);
    return next({
      ctx: {
        ...ctx,
        user,
      },
    });
  } catch {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or expired session",
    });
  }
});

export const protectedProcedure = publicProcedure.use(enforceUserIsAuthed);
