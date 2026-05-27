import { Booking, BookingStatus, PaymentStatus } from "@/lib/types";

const payableBookingStatuses = new Set<BookingStatus>(["PENDING", "CONFIRMED", "IN_STAY"]);
const retryablePaymentStatuses = new Set<PaymentStatus>(["INITIATED", "PENDING", "FAILED", "CANCELLED"]);
const checkablePaymentStatuses = new Set<PaymentStatus>(["INITIATED", "PENDING", "FAILED"]);

export function canCreateOrRetryPayment(booking: Booking) {
  return payableBookingStatuses.has(booking.status) && (!booking.payment || retryablePaymentStatuses.has(booking.payment.status));
}

export function canViewPaymentStatus(booking: Booking) {
  return payableBookingStatuses.has(booking.status) && Boolean(booking.payment && checkablePaymentStatuses.has(booking.payment.status));
}

export function paymentActionUnavailableReason(booking: Booking) {
  if (booking.status === "CANCELLED") return "Đơn đã hủy nên không thể tiếp tục thanh toán.";
  if (booking.status === "COMPLETED") return "Đơn đã hoàn thành nên không thể tạo thanh toán mới.";
  if (booking.payment?.status === "PAID") return "Đơn này đã thanh toán.";
  return null;
}
