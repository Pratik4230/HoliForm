import { TRPCError } from "@trpc/server";

import { formService } from "../../services";
import { protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  createFormInputModel,
  formRecordOutputModel,
  getFormByIdInputModel,
  getFormByIdOutputModel,
  listFormsInputModel,
  listFormsOutputModel,
} from "@repo/validators/forms";

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
    .output(formRecordOutputModel)
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

  listForms: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/listForms"),
        tags: TAGS,
      },
    })
    .input(listFormsInputModel)
    .output(listFormsOutputModel)
    .query(async ({ ctx }) => {
      return await formService.listForms(ctx.user.id);
    }),

  getFormById: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFormById"),
        tags: TAGS,
      },
    })
    .input(getFormByIdInputModel)
    .output(getFormByIdOutputModel)
    .query(async ({ ctx, input }) => {
      try {
        return await formService.getFormById(ctx.user.id, input);
      } catch (error) {
        if (error instanceof Error && error.message === "Form not found") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: error.message,
          });
        }
        throw error;
      }
    }),
});
