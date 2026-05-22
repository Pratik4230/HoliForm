import { TRPCError } from "@trpc/server";

import { formService } from "../../services";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
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
  listFormsInputModel,
  listFormsOutputModel,
  publishFormInputModel,
  reorderFormFieldInputModel,
  setFormAcceptingResponsesInputModel,
  setFormVisibilityInputModel,
  unpublishFormInputModel,
  updateFormInputModel,
  upsertFormFieldInputModel,
} from "@repo/validators/forms";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

function handleFormServiceError(error: unknown): never {
  if (!(error instanceof Error)) {
    throw error;
  }

  if (
    error.message === "Form not found" ||
    error.message === "Form field not found" ||
    error.message === "Form is not available"
  ) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: error.message,
    });
  }

  if (
    error.message === "A form with this slug already exists for your account" ||
    error.message === "A field with this label key already exists on this form"
  ) {
    throw new TRPCError({
      code: "CONFLICT",
      message: error.message,
    });
  }

  throw error;
}

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
        handleFormServiceError(error);
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
        handleFormServiceError(error);
      }
    }),

  updateForm: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: getPath("/updateForm"),
        tags: TAGS,
      },
    })
    .input(updateFormInputModel)
    .output(formRecordOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.updateForm(ctx.user.id, input);
      } catch (error) {
        handleFormServiceError(error);
      }
    }),

  deleteForm: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/deleteForm"),
        tags: TAGS,
      },
    })
    .input(deleteFormInputModel)
    .output(deleteFormOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.deleteForm(ctx.user.id, input);
      } catch (error) {
        handleFormServiceError(error);
      }
    }),

  publishForm: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/publishForm"),
        tags: TAGS,
      },
    })
    .input(publishFormInputModel)
    .output(formRecordOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.publishForm(ctx.user.id, input);
      } catch (error) {
        handleFormServiceError(error);
      }
    }),

  unpublishForm: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/unpublishForm"),
        tags: TAGS,
      },
    })
    .input(unpublishFormInputModel)
    .output(formRecordOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.unpublishForm(ctx.user.id, input);
      } catch (error) {
        handleFormServiceError(error);
      }
    }),

  setFormVisibility: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: getPath("/setFormVisibility"),
        tags: TAGS,
      },
    })
    .input(setFormVisibilityInputModel)
    .output(formRecordOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.setFormVisibility(ctx.user.id, input);
      } catch (error) {
        handleFormServiceError(error);
      }
    }),

  setFormAcceptingResponses: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: getPath("/setFormAcceptingResponses"),
        tags: TAGS,
      },
    })
    .input(setFormAcceptingResponsesInputModel)
    .output(formRecordOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.setFormAcceptingResponses(ctx.user.id, input);
      } catch (error) {
        handleFormServiceError(error);
      }
    }),

  upsertFormField: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/upsertFormField"),
        tags: TAGS,
      },
    })
    .input(upsertFormFieldInputModel)
    .output(formFieldOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.upsertFormField(ctx.user.id, input);
      } catch (error) {
        handleFormServiceError(error);
      }
    }),

  deleteFormField: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/deleteFormField"),
        tags: TAGS,
      },
    })
    .input(deleteFormFieldInputModel)
    .output(deleteFormFieldOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.deleteFormField(ctx.user.id, input);
      } catch (error) {
        handleFormServiceError(error);
      }
    }),

  reorderFormField: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: getPath("/reorderFormField"),
        tags: TAGS,
      },
    })
    .input(reorderFormFieldInputModel)
    .output(formFieldOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.reorderFormField(ctx.user.id, input);
      } catch (error) {
        handleFormServiceError(error);
      }
    }),

  getPublicForm: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getPublicForm"),
        tags: TAGS,
      },
    })
    .input(getPublicFormInputModel)
    .output(getPublicFormOutputModel)
    .query(async ({ input }) => {
      try {
        return await formService.getPublicForm(input);
      } catch (error) {
        handleFormServiceError(error);
      }
    }),
});
