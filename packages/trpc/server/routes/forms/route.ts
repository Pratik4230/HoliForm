import { TRPCError } from "@trpc/server";

import { formService } from "../../services";
import { protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { createFormInputModel, createFormOutputModel } from "./model";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

export const formsRouter = router({
  createForm: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createForm"),
        tags: TAGS,
      },
    })
    .input(createFormInputModel)
    .output(createFormOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.createForm(ctx.user.id, input);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "A form with this slug already exists for your account"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: error.message,
          });
        }
        throw error;
      }
    }),
});
