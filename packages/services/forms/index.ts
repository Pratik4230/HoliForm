import type {
  ArchiveFormInput,
  AiFormChatMessage,
  CloneFormInput,
  CreateFormInput,
  DeleteFormFieldInput,
  DeleteFormFieldOutput,
  DeleteFormInput,
  DeleteFormOutput,
  FormFieldRecord,
  FormRecord,
  GetFormByIdInput,
  GetFormByIdOutput,
  GetPublicFormInput,
  GetPublicFormOutput,
  ListPublicFormsInput,
  ListPublicFormsOutput,
  ListFormThemesOutput,
  SubmitFormResponseInput,
  SubmitFormResponseOutput,
  PublishFormInput,
  PublicFormRecord,
  ReorderFormFieldInput,
  SetFormAcceptingResponsesInput,
  SetFormVisibilityInput,
  UnarchiveFormInput,
  UnpublishFormInput,
  UpdateFormInput,
  UpsertFormFieldInput,
  VerifyFormAccessInput,
  VerifyFormAccessOutput,
} from "@repo/validators/forms";

import * as aiFormBuilderDomain from "./aiFormBuilder";
import * as formDomain from "./form";
import * as formFieldDomain from "./formField";
import * as publicDomain from "./public";
import * as themesDomain from "./themes";

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

  cloneForm(userId: string, payload: CloneFormInput) {
    return formDomain.cloneForm(userId, payload);
  }

  archiveForm(userId: string, payload: ArchiveFormInput) {
    return formDomain.archiveForm(userId, payload);
  }

  unarchiveForm(userId: string, payload: UnarchiveFormInput) {
    return formDomain.unarchiveForm(userId, payload);
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

  getPublicForm(payload: GetPublicFormInput) {
    return publicDomain.getPublicForm(payload);
  }

  verifyFormAccess(payload: VerifyFormAccessInput) {
    return publicDomain.verifyFormAccess(payload);
  }

  listPublicForms(payload: ListPublicFormsInput) {
    return publicDomain.listPublicForms(payload);
  }

  submitFormResponse(
    payload: SubmitFormResponseInput,
    options?: { respondentIp?: string },
  ) {
    return publicDomain.submitFormResponse(payload, options);
  }

  listFormThemes() {
    return themesDomain.listFormThemes();
  }

  createFormFromPrompt(userId: string, messages: AiFormChatMessage[]) {
    return aiFormBuilderDomain.createFormFromPrompt(userId, messages);
  }

  editFormFromPrompt(userId: string, formId: string, messages: AiFormChatMessage[]) {
    return aiFormBuilderDomain.editFormFromPrompt(userId, formId, messages);
  }
}

export default FormService;

export type {
  CloneFormInput,
  CreateFormInput,
  DeleteFormFieldInput,
  DeleteFormFieldOutput,
  DeleteFormInput,
  DeleteFormOutput,
  FormFieldRecord,
  FormRecord,
  GetFormByIdInput,
  GetFormByIdOutput,
  GetPublicFormInput,
  GetPublicFormOutput,
  ListPublicFormsInput,
  ListPublicFormsOutput,
  ListFormThemesOutput,
  SubmitFormResponseInput,
  SubmitFormResponseOutput,
  PublishFormInput,
  PublicFormRecord,
  ReorderFormFieldInput,
  SetFormAcceptingResponsesInput,
  SetFormVisibilityInput,
  UnpublishFormInput,
  UpdateFormInput,
  UpsertFormFieldInput,
};
