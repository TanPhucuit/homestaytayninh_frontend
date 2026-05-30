"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addBookingService, getBooking, initiatePayment, setBookingServiceStatus, updateBookingStatus } from "@/lib/api";
import { actionErrorMessage } from "@/lib/action-errors";
import { ApiClientError } from "@/lib/api-client";
import { canCreateOrRetryPayment, paymentActionUnavailableReason } from "@/lib/booking-rules";
import { flashUrl } from "@/lib/flash";
import { mutationError, mutationSuccess, type MutationState } from "@/lib/mutation-state";
import { getCurrentUser } from "@/lib/rbac";
import type { Booking } from "@/lib/types";

function redirectToLogin(bookingId: string): never {
  redirect(`/login?error=auth_required&next=${encodeURIComponent(`/bookings/${bookingId}`)}`);
}

function paymentDestination(bookingId: string, payment: NonNullable<Booking["payment"]>) {
  const resultUrl = `/payment/result?bookingId=${encodeURIComponent(bookingId)}&status=pending`;
  return payment.qrUrl ? resultUrl : payment.checkoutUrl || resultUrl;
}

async function requireBookingRole(bookingId: string, role: "CUSTOMER" | "OWNER_STAFF", message: string) {
  const user = await getCurrentUser();
  if (!user.authenticated) redirectToLogin(bookingId);
  if (user.authorizationError) redirect(flashUrl(`/bookings/${bookingId}`, "error", user.authorizationError));
  if (user.role !== role) redirect(flashUrl(`/bookings/${bookingId}`, "error", message));
}

async function assertBookingRole(bookingId: string, role: "CUSTOMER" | "OWNER_STAFF", message: string) {
  const user = await getCurrentUser();
  if (!user.authenticated) throw new Error("Vui lòng đăng nhập để thao tác với booking.");
  if (user.authorizationError) throw new Error(user.authorizationError);
  if (user.role !== role) throw new Error(message);
}

export async function addServiceAction(formData: FormData) {
  const result = await addServiceInlineAction({}, formData);
  const bookingId = String(formData.get("bookingId") ?? "");
  if (result.type === "error") redirect(flashUrl(`/bookings/${bookingId}`, "error", result.message ?? "Không thể thêm dịch vụ."));
  redirect(flashUrl(`/bookings/${bookingId}`, "success", "Đã thêm dịch vụ vào booking."));
}

export async function addServiceInlineAction(_state: MutationState, formData: FormData): Promise<MutationState> {
  const bookingId = String(formData.get("bookingId") ?? "");
  const serviceId = String(formData.get("serviceId") ?? "");
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));
  try {
    if (!bookingId || !serviceId) throw new Error("Thiếu booking hoặc dịch vụ để thêm vào đơn.");
    await assertBookingRole(bookingId, "OWNER_STAFF", "Chỉ Owner Staff được thêm dịch vụ phát sinh cho booking.");
    await addBookingService(bookingId, serviceId, quantity, "OWNER_STAFF");
    revalidatePath(`/bookings/${bookingId}`);
    return mutationSuccess("Đã thêm dịch vụ vào booking.");
  } catch (error) {
    return mutationError(actionErrorMessage(error));
  }
}

export async function markServiceServedAction(formData: FormData) {
  const result = await markServiceServedInlineAction({}, formData);
  const bookingId = String(formData.get("bookingId") ?? "");
  if (result.type === "error") redirect(flashUrl(`/bookings/${bookingId}`, "error", result.message ?? "Không thể cập nhật dịch vụ."));
  redirect(flashUrl(`/bookings/${bookingId}`, "success", "Đã đánh dấu dịch vụ là đã phục vụ."));
}

export async function markServiceServedInlineAction(_state: MutationState, formData: FormData): Promise<MutationState> {
  const bookingId = String(formData.get("bookingId") ?? "");
  const serviceOrderId = String(formData.get("serviceOrderId") ?? "");
  try {
    if (!bookingId || !serviceOrderId) throw new Error("Thiếu booking hoặc dịch vụ để cập nhật trạng thái.");
    await assertBookingRole(bookingId, "OWNER_STAFF", "Chỉ Owner Staff được cập nhật trạng thái dịch vụ.");
    await setBookingServiceStatus(bookingId, serviceOrderId, "SERVED", "OWNER_STAFF");
    revalidatePath(`/bookings/${bookingId}`);
    return mutationSuccess("Đã đánh dấu dịch vụ là đã phục vụ.");
  } catch (error) {
    return mutationError(actionErrorMessage(error));
  }
}

export async function cancelBookingAction(formData: FormData) {
  const result = await cancelBookingInlineAction({}, formData);
  const bookingId = String(formData.get("bookingId") ?? "");
  if (result.type === "error") redirect(flashUrl(`/bookings/${bookingId || ""}`, "error", result.message ?? "Không thể hủy đơn."));
  redirect(flashUrl(`/bookings/${bookingId}`, "success", "Đã gửi yêu cầu hủy đơn."));
}

export async function cancelBookingInlineAction(_state: MutationState, formData: FormData): Promise<MutationState> {
  const bookingId = String(formData.get("bookingId") ?? "");
  try {
    if (!bookingId) throw new Error("Thiếu booking để hủy đơn.");
    await assertBookingRole(bookingId, "CUSTOMER", "Chỉ khách hàng được hủy booking của mình.");
    await updateBookingStatus(bookingId, "CANCELLED", "CUSTOMER");
    revalidatePath(`/bookings/${bookingId}`);
    revalidatePath("/bookings");
    return mutationSuccess("Đã gửi yêu cầu hủy đơn.");
  } catch (error) {
    return mutationError(actionErrorMessage(error));
  }
}

export async function retryPaymentAction(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  let paymentUrl: string | undefined;
  let booking: Awaited<ReturnType<typeof getBooking>> | undefined;
  let paymentError: unknown;
  if (!bookingId) redirect(flashUrl("/bookings", "error", "Thiếu booking để thử lại thanh toán."));
  await requireBookingRole(bookingId, "CUSTOMER", "Booking hộ khách không gọi ApiPay. Chỉ khách hàng tự đặt mới được thanh toán qua ApiPay.");
  try {
    booking = await getBooking(bookingId, "CUSTOMER");
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) redirectToLogin(bookingId);
    redirect(flashUrl(`/bookings/${bookingId}`, "error", actionErrorMessage(error)));
  }
  if (!booking) {
    redirect(flashUrl(`/bookings/${bookingId}`, "error", "Không tìm thấy đơn để thanh toán."));
  }
  if (!canCreateOrRetryPayment(booking)) {
    redirect(flashUrl(`/bookings/${bookingId}`, "error", paymentActionUnavailableReason(booking) ?? "Đơn này không còn trong trạng thái có thể thanh toán."));
  }
  try {
    const payment = await initiatePayment(bookingId, "CUSTOMER");
    paymentUrl = paymentDestination(bookingId, payment);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) redirectToLogin(bookingId);
    paymentError = error;
  }
  if (paymentError) {
    redirect(`/payment/result?bookingId=${bookingId}&status=failed&paymentError=${encodeURIComponent(actionErrorMessage(paymentError))}`);
  }
  if (paymentUrl) {
    redirect(paymentUrl);
  }
  redirect(`/payment/result?bookingId=${bookingId}&status=pending`);
}
