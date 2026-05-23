import { responseService } from "../../services";
import { protectedProcedure, router } from "../../trpc";
import { mapServiceError } from "../../utils/map-service-error";
import { protectedOpenApiMeta } from "../../utils/openapi-meta";
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

export const responsesRouter = router({
  listByForm: protectedProcedure
    .meta(protectedOpenApiMeta("GET", getPath("/listByForm"), TAGS))
    .input(listResponsesByFormInputModel)
    .output(listResponsesByFormOutputModel)
    .query(async ({ ctx, input }) => {
      try {
        return await responseService.listByForm(ctx.user.id, input);
      } catch (error) {
        mapServiceError(error);
      }
    }),

  getById: protectedProcedure
    .meta(protectedOpenApiMeta("GET", getPath("/getById"), TAGS))
    .input(getResponseByIdInputModel)
    .output(getResponseByIdOutputModel)
    .query(async ({ ctx, input }) => {
      try {
        return await responseService.getById(ctx.user.id, input);
      } catch (error) {
        mapServiceError(error);
      }
    }),

  getAnalytics: protectedProcedure
    .meta(protectedOpenApiMeta("GET", getPath("/getAnalytics"), TAGS))
    .input(getFormAnalyticsInputModel)
    .output(getFormAnalyticsOutputModel)
    .query(async ({ ctx, input }) => {
      try {
        return await responseService.getFormAnalytics(ctx.user.id, input);
      } catch (error) {
        mapServiceError(error);
      }
    }),
});
