import { formService } from "../../services";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { mapServiceError } from "../../utils/map-service-error";
import { protectedOpenApiMeta, publicOpenApiMeta } from "../../utils/openapi-meta";
import { generatePath } from "../../utils/path-generator";
import {
  aiCreateFormFromPromptInputModel,
  aiEditFormFromPromptInputModel,
  aiFormBuilderOutputModel,
  archiveFormInputModel,
  cloneFormInputModel,
  createFormInputModel,
  deleteFormFieldInputModel,
  deleteFormFieldOutputModel,
  deleteFormInputModel,
  deleteFormOutputModel,
  formFieldOutputModel,
  formRecordOutputModel,
  getFormByIdInputModel,
  getFormByIdOutputModel,
  getPublicFormInputModel,
  getPublicFormOutputModel,
  listPublicFormsInputModel,
  listPublicFormsOutputModel,
  submitFormResponseInputModel,
  submitFormResponseOutputModel,
  listFormsInputModel,
  listFormsOutputModel,
  listFormThemesInputModel,
  listFormThemesOutputModel,
  publishFormInputModel,
  reorderFormFieldInputModel,
  setFormAcceptingResponsesInputModel,
  setFormVisibilityInputModel,
  unarchiveFormInputModel,
  unpublishFormInputModel,
  updateFormInputModel,
  upsertFormFieldInputModel,
  verifyFormAccessInputModel,
  verifyFormAccessOutputModel,
} from "@repo/validators/forms";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

export const formsRouter = router({
  aiCreateFormFromPrompt: protectedProcedure
    .meta(protectedOpenApiMeta("POST", getPath("/aiCreateFormFromPrompt"), TAGS))
    .input(aiCreateFormFromPromptInputModel)
    .output(aiFormBuilderOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.createFormFromPrompt(ctx.user.id, input.messages);
      } catch (error) {
        mapServiceError(error);
      }
    }),

  aiEditFormFromPrompt: protectedProcedure
    .meta(protectedOpenApiMeta("POST", getPath("/aiEditFormFromPrompt"), TAGS))
    .input(aiEditFormFromPromptInputModel)
    .output(aiFormBuilderOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.editFormFromPrompt(ctx.user.id, input.formId, input.messages);
      } catch (error) {
        mapServiceError(error);
      }
    }),

  createForm: protectedProcedure
    .meta(protectedOpenApiMeta("POST", getPath("/createForm"), TAGS))
    .input(createFormInputModel)
    .output(formRecordOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.createForm(ctx.user.id, input);
      } catch (error) {
        mapServiceError(error);
      }
    }),

  listForms: protectedProcedure
    .meta(protectedOpenApiMeta("GET", getPath("/listForms"), TAGS))
    .input(listFormsInputModel)
    .output(listFormsOutputModel)
    .query(async ({ ctx }) => {
      return await formService.listForms(ctx.user.id);
    }),

  listFormThemes: publicProcedure
    .meta(publicOpenApiMeta("GET", getPath("/listFormThemes"), TAGS))
    .input(listFormThemesInputModel)
    .output(listFormThemesOutputModel)
    .query(async () => {
      return await formService.listFormThemes();
    }),

  getFormById: protectedProcedure
    .meta(protectedOpenApiMeta("GET", getPath("/getFormById"), TAGS))
    .input(getFormByIdInputModel)
    .output(getFormByIdOutputModel)
    .query(async ({ ctx, input }) => {
      try {
        return await formService.getFormById(ctx.user.id, input);
      } catch (error) {
        mapServiceError(error);
      }
    }),

  updateForm: protectedProcedure
    .meta(protectedOpenApiMeta("PATCH", getPath("/updateForm"), TAGS))
    .input(updateFormInputModel)
    .output(formRecordOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.updateForm(ctx.user.id, input);
      } catch (error) {
        mapServiceError(error);
      }
    }),

  deleteForm: protectedProcedure
    .meta(protectedOpenApiMeta("DELETE", getPath("/deleteForm"), TAGS))
    .input(deleteFormInputModel)
    .output(deleteFormOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.deleteForm(ctx.user.id, input);
      } catch (error) {
        mapServiceError(error);
      }
    }),

  archiveForm: protectedProcedure
    .meta(protectedOpenApiMeta("POST", getPath("/archiveForm"), TAGS))
    .input(archiveFormInputModel)
    .output(formRecordOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.archiveForm(ctx.user.id, input);
      } catch (error) {
        mapServiceError(error);
      }
    }),

  unarchiveForm: protectedProcedure
    .meta(protectedOpenApiMeta("POST", getPath("/unarchiveForm"), TAGS))
    .input(unarchiveFormInputModel)
    .output(formRecordOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.unarchiveForm(ctx.user.id, input);
      } catch (error) {
        mapServiceError(error);
      }
    }),

  cloneForm: protectedProcedure
    .meta(protectedOpenApiMeta("POST", getPath("/cloneForm"), TAGS))
    .input(cloneFormInputModel)
    .output(formRecordOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.cloneForm(ctx.user.id, input);
      } catch (error) {
        mapServiceError(error);
      }
    }),

  publishForm: protectedProcedure
    .meta(protectedOpenApiMeta("POST", getPath("/publishForm"), TAGS))
    .input(publishFormInputModel)
    .output(formRecordOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.publishForm(ctx.user.id, input);
      } catch (error) {
        mapServiceError(error);
      }
    }),

  unpublishForm: protectedProcedure
    .meta(protectedOpenApiMeta("POST", getPath("/unpublishForm"), TAGS))
    .input(unpublishFormInputModel)
    .output(formRecordOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.unpublishForm(ctx.user.id, input);
      } catch (error) {
        mapServiceError(error);
      }
    }),

  setFormVisibility: protectedProcedure
    .meta(protectedOpenApiMeta("PATCH", getPath("/setFormVisibility"), TAGS))
    .input(setFormVisibilityInputModel)
    .output(formRecordOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.setFormVisibility(ctx.user.id, input);
      } catch (error) {
        mapServiceError(error);
      }
    }),

  setFormAcceptingResponses: protectedProcedure
    .meta(protectedOpenApiMeta("PATCH", getPath("/setFormAcceptingResponses"), TAGS))
    .input(setFormAcceptingResponsesInputModel)
    .output(formRecordOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.setFormAcceptingResponses(ctx.user.id, input);
      } catch (error) {
        mapServiceError(error);
      }
    }),

  upsertFormField: protectedProcedure
    .meta(protectedOpenApiMeta("POST", getPath("/upsertFormField"), TAGS))
    .input(upsertFormFieldInputModel)
    .output(formFieldOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.upsertFormField(ctx.user.id, input);
      } catch (error) {
        mapServiceError(error);
      }
    }),

  deleteFormField: protectedProcedure
    .meta(protectedOpenApiMeta("DELETE", getPath("/deleteFormField"), TAGS))
    .input(deleteFormFieldInputModel)
    .output(deleteFormFieldOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.deleteFormField(ctx.user.id, input);
      } catch (error) {
        mapServiceError(error);
      }
    }),

  reorderFormField: protectedProcedure
    .meta(protectedOpenApiMeta("PATCH", getPath("/reorderFormField"), TAGS))
    .input(reorderFormFieldInputModel)
    .output(formFieldOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.reorderFormField(ctx.user.id, input);
      } catch (error) {
        mapServiceError(error);
      }
    }),

  verifyFormAccess: publicProcedure
    .meta(publicOpenApiMeta("POST", getPath("/verifyFormAccess"), TAGS))
    .input(verifyFormAccessInputModel)
    .output(verifyFormAccessOutputModel)
    .mutation(async ({ input }) => {
      try {
        return await formService.verifyFormAccess(input);
      } catch (error) {
        mapServiceError(error);
      }
    }),

  getPublicForm: publicProcedure
    .meta(publicOpenApiMeta("GET", getPath("/getPublicForm"), TAGS))
    .input(getPublicFormInputModel)
    .output(getPublicFormOutputModel)
    .query(async ({ input }) => {
      try {
        return await formService.getPublicForm(input);
      } catch (error) {
        mapServiceError(error);
      }
    }),

  listPublic: publicProcedure
    .meta(publicOpenApiMeta("GET", getPath("/listPublic"), TAGS))
    .input(listPublicFormsInputModel)
    .output(listPublicFormsOutputModel)
    .query(async ({ input }) => {
      try {
        return await formService.listPublicForms(input);
      } catch (error) {
        mapServiceError(error);
      }
    }),

  submitFormResponse: publicProcedure
    .meta(publicOpenApiMeta("POST", getPath("/submitFormResponse"), TAGS))
    .input(submitFormResponseInputModel)
    .output(submitFormResponseOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.submitFormResponse(input, {
          respondentIp: ctx.respondentIp,
        });
      } catch (error) {
        mapServiceError(error);
      }
    }),
});
