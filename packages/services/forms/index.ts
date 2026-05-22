import type {
  CreateFormInput,
  DeleteFormFieldInput,
  DeleteFormFieldOutput,
  DeleteFormInput,
  DeleteFormOutput,
  FormFieldRecord,
  FormRecord,
  GetFormByIdInput,
  GetFormByIdOutput,
  PublishFormInput,
  ReorderFormFieldInput,
  SetFormAcceptingResponsesInput,
  SetFormVisibilityInput,
  UnpublishFormInput,
  UpdateFormInput,
  UpsertFormFieldInput,
} from "@repo/validators/forms";

import * as formDomain from "./form";
import * as formFieldDomain from "./formField";

export { buildSubmissionSchemaFromFields } from "./buildSubmissionSchema";

class FormService {
  createForm(userId: string, payload: CreateFormInput) {
    return formDomain.createForm(userId, payload);
  }

  listForms(userId: string) {
    return formDomain.listForms(userId);
  }

  getFormById(userId: string, payload: GetFormByIdInput) {
    return formDomain.getFormById(userId, payload);
  }

  updateForm(userId: string, payload: UpdateFormInput) {
    return formDomain.updateForm(userId, payload);
  }

  deleteForm(userId: string, payload: DeleteFormInput) {
    return formDomain.deleteForm(userId, payload);
  }

  publishForm(userId: string, payload: PublishFormInput) {
    return formDomain.publishForm(userId, payload);
  }

  unpublishForm(userId: string, payload: UnpublishFormInput) {
    return formDomain.unpublishForm(userId, payload);
  }

  setFormVisibility(userId: string, payload: SetFormVisibilityInput) {
    return formDomain.setFormVisibility(userId, payload);
  }

  setFormAcceptingResponses(userId: string, payload: SetFormAcceptingResponsesInput) {
    return formDomain.setFormAcceptingResponses(userId, payload);
  }

  upsertFormField(userId: string, payload: UpsertFormFieldInput) {
    return formFieldDomain.upsertFormField(userId, payload);
  }

  deleteFormField(userId: string, payload: DeleteFormFieldInput) {
    return formFieldDomain.deleteFormField(userId, payload);
  }

  reorderFormField(userId: string, payload: ReorderFormFieldInput) {
    return formFieldDomain.reorderFormField(userId, payload);
  }
}

export default FormService;

export type {
  CreateFormInput,
  DeleteFormFieldInput,
  DeleteFormFieldOutput,
  DeleteFormInput,
  DeleteFormOutput,
  FormFieldRecord,
  FormRecord,
  GetFormByIdInput,
  GetFormByIdOutput,
  PublishFormInput,
  ReorderFormFieldInput,
  SetFormAcceptingResponsesInput,
  SetFormVisibilityInput,
  UnpublishFormInput,
  UpdateFormInput,
  UpsertFormFieldInput,
};
