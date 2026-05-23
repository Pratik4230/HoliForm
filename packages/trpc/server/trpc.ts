import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";
import { isAppServiceError } from "@repo/services/errors";

import { createContext } from "./context";
import { userService } from "./services";
import { getAutheticationCookie } from "./utils/cookie";

export const tRPCContext = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createContext>()
  .create({
    errorFormatter({ shape, error }) {
      const cause = error.cause;
      if (isAppServiceError(cause)) {
        return {
          ...shape,
          data: {
            ...shape.data,
            apiCode: cause.code,
          },
        };
      }

      return shape;
    },
  });

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
