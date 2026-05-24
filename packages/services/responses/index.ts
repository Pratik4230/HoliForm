import type {
  ExportResponsesByFormInput,
  ExportResponsesByFormOutput,
  GetFormAnalyticsInput,
  GetFormAnalyticsOutput,
  GetResponseByIdInput,
  GetResponseByIdOutput,
  ListResponsesByFormInput,
  ListResponsesByFormOutput,
} from "@repo/validators/forms";

import * as responseDomain from "./response";

class ResponseService {
  listByForm(userId: string, payload: ListResponsesByFormInput) {
    return responseDomain.listResponsesByForm(userId, payload);
  }

  getById(userId: string, payload: GetResponseByIdInput) {
    return responseDomain.getResponseById(userId, payload);
  }

  getFormAnalytics(userId: string, payload: GetFormAnalyticsInput) {
    return responseDomain.getFormAnalytics(userId, payload);
  }

  exportByForm(userId: string, payload: ExportResponsesByFormInput) {
    return responseDomain.exportResponsesByForm(userId, payload);
  }
}

export default ResponseService;

export type {
  ExportResponsesByFormInput,
  ExportResponsesByFormOutput,
  GetFormAnalyticsInput,
  GetFormAnalyticsOutput,
  GetResponseByIdInput,
  GetResponseByIdOutput,
  ListResponsesByFormInput,
  ListResponsesByFormOutput,
};
