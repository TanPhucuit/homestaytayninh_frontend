import "server-only";
import { ApiClientError } from "./api-client";

export function actionErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    if (error.status === 403) return "Tài khoản của bạn chưa có quyền thực hiện thao tác này.";
    if (error.status === 404) return "Không tìm thấy thông tin cần xử lý.";
    return error.message || "Không thể tiếp tục, vui lòng thử lại.";
  }
  if (error instanceof Error && error.message) {
    if (/fetch|network|api|backend|payload|json|NEXT_PUBLIC/i.test(error.message)) {
      return "Hệ thống đang xử lý chưa ổn định. Vui lòng thử lại sau.";
    }
    return error.message;
  }
  return "Thao tác không thành công. Vui lòng thử lại.";
}
