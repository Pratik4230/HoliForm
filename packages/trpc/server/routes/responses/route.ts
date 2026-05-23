import { TRPCError } from "@trpc/server";

import { responseService } from "../../services";
import { protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  getFormAnalyticsInputModel,
  getFormAnalyticsOutputModel,
  getResponseByIdInputModel,
  getResponseByIdOutputModel,
  listResponsesByFormInputModel,
  listResponsesByFormOutputModel,
} from "@repo/validators/forms";

const TAGS = ["Responses"];
const getPath = generatePath("/responses");

function handleResponseServiceError(error: unknown): never {
  if (!(error instanceof Error)) {
    throw error;
  }

  if (error.message === "Form not found" || error.message === "Response not found") {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: error.message,
    });
  }

  throw error;
}

export const responsesRouter = router({
  listByForm: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/listByForm"),
        tags: TAGS,
      },
    })
    .input(listResponsesByFormInputModel)
    .output(listResponsesByFormOutputModel)
    .query(async ({ ctx, input }) => {
      try {
        return await responseService.listByForm(ctx.user.id, input);
      } catch (error) {
        handleResponseServiceError(error);
      }
    }),

  getById: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getById"),
        tags: TAGS,
      },
    })
    .input(getResponseByIdInputModel)
    .output(getResponseByIdOutputModel)
    .query(async ({ ctx, input }) => {
      try {
        return await responseService.getById(ctx.user.id, input);
      } catch (error) {
        handleResponseServiceError(error);
      }
    }),

  getAnalytics: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getAnalytics"),
        tags: TAGS,
      },
    })
    .input(getFormAnalyticsInputModel)
    .output(getFormAnalyticsOutputModel)
    .query(async ({ ctx, input }) => {
      try {
        return await responseService.getFormAnalytics(ctx.user.id, input);
      } catch (error) {
        handleResponseServiceError(error);
      }
    }),
});
