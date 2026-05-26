import "server-only";
import { ApiClientError } from "./api-client";

export function actionErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    const status = error.status ? `HTTP ${error.status}: ` : "";
    return `${status}${error.message}`;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Thao tác không thành công. Vui lòng thử lại.";
}
