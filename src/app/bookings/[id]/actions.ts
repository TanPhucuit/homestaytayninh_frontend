"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addBookingService, initiatePayment, setBookingServiceStatus } from "@/lib/api";
import { actionErrorMessage } from "@/lib/action-errors";
import { ApiClientError } from "@/lib/api-client";
import { flashUrl } from "@/lib/flash";

function redirectToLogin(bookingId: string): never {
  redirect(`/login?error=auth_required&next=${encodeURIComponent(`/bookings/${bookingId}`)}`);
}

export async function addServiceAction(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  const serviceId = String(formData.get("serviceId") ?? "");
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));
  if (!bookingId || !serviceId) redirect(flashUrl(`/bookings/${bookingId || ""}`, "error", "Thiếu booking hoặc dịch vụ để thêm vào đơn."));
  try {
    await addBookingService(bookingId, serviceId, quantity, "OWNER_STAFF");
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) redirectToLogin(bookingId);
    redirect(flashUrl(`/bookings/${bookingId}`, "error", actionErrorMessage(error)));
  }
  revalidatePath(`/bookings/${bookingId}`);
  redirect(flashUrl(`/bookings/${bookingId}`, "success", "Đã thêm dịch vụ vào booking."));
}

export async function markServiceServedAction(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  const serviceOrderId = String(formData.get("serviceOrderId") ?? "");
  if (!bookingId || !serviceOrderId) redirect(flashUrl(`/bookings/${bookingId || ""}`, "error", "Thiếu booking hoặc service order để cập nhật trạng thái."));
  try {
    await setBookingServiceStatus(bookingId, serviceOrderId, "SERVED", "OWNER_STAFF");
  } catch (error) {
    redirect(flashUrl(`/bookings/${bookingId}`, "error", actionErrorMessage(error)));
  }
  revalidatePath(`/bookings/${bookingId}`);
  redirect(flashUrl(`/bookings/${bookingId}`, "success", "Đã đánh dấu dịch vụ là đã phục vụ."));
}

export async function retryPaymentAction(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) redirect(flashUrl("/bookings", "error", "Thiếu booking để tạo lại yêu cầu thanh toán."));
  try {
    await initiatePayment(bookingId, "CUSTOMER");
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) redirectToLogin(bookingId);
    redirect(flashUrl(`/bookings/${bookingId}`, "error", actionErrorMessage(error)));
  }
  revalidatePath(`/bookings/${bookingId}`);
  redirect(flashUrl(`/bookings/${bookingId}`, "success", "Đã tạo lại yêu cầu thanh toán."));
}
