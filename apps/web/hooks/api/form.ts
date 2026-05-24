"use client";

import { toast } from "sonner";
import type { RouterOutputs } from "@repo/trpc/client";
import { API_ERROR_CODES } from "@repo/validators/api-errors";
import { getApiErrorCode } from "~/lib/api-error";
import { trpc } from "~/trpc/client";

export type FormRecord = RouterOutputs["forms"]["listForms"][number];
export type FormByIdOutput = RouterOutputs["forms"]["getFormById"];
export type EditorField = FormByIdOutput["fields"][number];
export type PublicFormOutput = RouterOutputs["forms"]["getPublicForm"];
export type SubmitFormResponseOutput = RouterOutputs["forms"]["submitFormResponse"];

function useFormsUtils() {
  return trpc.useUtils();
}

export function useInvalidateFormCache(formId: string) {
  const utils = useFormsUtils();

  return async () => {
    await Promise.all([
      utils.forms.getFormById.invalidate({ formId }),
      utils.forms.listForms.invalidate(),
    ]);
  };
}

// ——— Queries ———

export function useListForms() {
  return trpc.forms.listForms.useQuery();
}

export function useFormById(formId: string) {
  return trpc.forms.getFormById.useQuery({ formId });
}

export function usePublicForm(username: string, slug: string) {
  return trpc.forms.getPublicForm.useQuery({ username, slug });
}

export type PublicFormListItem = RouterOutputs["forms"]["listPublic"][number];

export function useListPublicForms(limit = 24) {
  return trpc.forms.listPublic.useQuery({ limit });
}

export function useListFormThemes() {
  return trpc.forms.listFormThemes.useQuery();
}

// ——— Creator mutations ———

export function useCreateForm(options?: {
  onSuccess?: (created: FormRecord) => void | Promise<void>;
}) {
  const utils = useFormsUtils();

  return trpc.forms.createForm.useMutation({
    onSuccess: async (created) => {
      await utils.forms.listForms.invalidate();
      toast.success("Form created");
      await options?.onSuccess?.(created);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create form");
    },
  });
}

export function useUpdateForm(formId: string) {
  const invalidate = useInvalidateFormCache(formId);

  return trpc.forms.updateForm.useMutation({
    onSuccess: async () => {
      await invalidate();
      toast.success("Settings saved");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update form");
    },
  });
}

export function useDeleteForm() {
  const utils = useFormsUtils();

  return trpc.forms.deleteForm.useMutation({
    onSuccess: async () => {
      await utils.forms.listForms.invalidate();
      toast.success("Form deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete form");
    },
  });
}

export function usePublishForm(formId: string) {
  const invalidate = useInvalidateFormCache(formId);

  return trpc.forms.publishForm.useMutation({
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(error.message || "Failed to publish form");
    },
  });
}

export function useUnpublishForm(formId: string) {
  const invalidate = useInvalidateFormCache(formId);

  return trpc.forms.unpublishForm.useMutation({
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(error.message || "Failed to unpublish form");
    },
  });
}

export function useSetFormVisibility(formId: string) {
  const invalidate = useInvalidateFormCache(formId);

  return trpc.forms.setFormVisibility.useMutation({
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(error.message || "Failed to update visibility");
    },
  });
}

export function useSetFormAcceptingResponses(formId: string) {
  const invalidate = useInvalidateFormCache(formId);

  return trpc.forms.setFormAcceptingResponses.useMutation({
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(error.message || "Failed to update response settings");
    },
  });
}

export function useUpsertFormField(options: {
  formId: string;
  isEdit?: boolean;
  onSuccess?: () => void;
}) {
  const invalidate = useInvalidateFormCache(options.formId);

  return trpc.forms.upsertFormField.useMutation({
    onSuccess: async () => {
      await invalidate();
      toast.success(options.isEdit ? "Field updated" : "Field added");
      options.onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save field");
    },
  });
}

export function useDeleteFormField(formId: string) {
  const invalidate = useInvalidateFormCache(formId);

  return trpc.forms.deleteFormField.useMutation({
    onSuccess: async () => {
      await invalidate();
      toast.success("Field removed");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete field");
    },
  });
}

export function useReorderFormField(formId: string) {
  const invalidate = useInvalidateFormCache(formId);

  return trpc.forms.reorderFormField.useMutation({
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(error.message || "Failed to reorder field");
    },
  });
}

// ——— Public (respondent) ———

export function useSubmitFormResponse(options?: {
  onSuccess?: (data: SubmitFormResponseOutput) => void;
}) {
  return trpc.forms.submitFormResponse.useMutation({
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      const code = getApiErrorCode(error);
      if (code === API_ERROR_CODES.RATE_LIMIT_EXCEEDED) {
        toast.error("Too many submissions. Please wait a few minutes and try again.");
        return;
      }
      toast.error(error.message || "Could not submit your answers");
    },
  });
}
