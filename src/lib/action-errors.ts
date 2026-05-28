import "server-only";
import { ApiClientError } from "./api-client";

const paymentSystemMessage = "Không thể tạo liên kết thanh toán lúc này. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.";
const genericSystemMessage = "Hệ thống đang xử lý chưa ổn định. Vui lòng thử lại sau.";

function friendlyBookingError(message: string) {
  if (/check-?out.*after.*check-?in|checkout must be after checkin|ngày trả phòng phải sau ngày nhận phòng/i.test(message)) {
    return "Ngày trả phòng phải sau ngày nhận phòng.";
  }
  if (/no longer available|not available for the selected dates|hết chỗ|không còn khả dụng/i.test(message)) {
    return "Phòng đã hết chỗ trong khoảng ngày đã chọn. Vui lòng chọn ngày khác hoặc phòng khác.";
  }
  if (/guest count exceeds room capacity|vượt.*sức chứa/i.test(message)) {
    return "Số khách vượt quá sức chứa của phòng đã chọn.";
  }
  if (/room does not belong|room is required|homestay is required/i.test(message)) {
    return "Thông tin phòng chưa hợp lệ. Vui lòng quay lại chọn phòng.";
  }
  return undefined;
}

export function actionErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    const bookingMessage = friendlyBookingError(error.message);
    if (bookingMessage) return bookingMessage;
    if (error.status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    if (error.status === 403) return "Tài khoản của bạn chưa có quyền thực hiện thao tác này.";
    if (error.status === 404) return "Không tìm thấy thông tin cần xử lý.";
    if (typeof error.status === "number" && error.status >= 500) return paymentSystemMessage;
    if (/internal server error|backend|payload|json|api/i.test(error.message)) return genericSystemMessage;
    return error.message || "Không thể tiếp tục, vui lòng thử lại.";
  }
  if (error instanceof Error && error.message) {
    const bookingMessage = friendlyBookingError(error.message);
    if (bookingMessage) return bookingMessage;
    if (/internal server error|payment|thanh toán/i.test(error.message)) return paymentSystemMessage;
    if (/fetch|network|api|backend|payload|json|NEXT_PUBLIC/i.test(error.message)) return genericSystemMessage;
    return error.message;
  }
  return "Thao tác không thành công. Vui lòng thử lại.";
}
