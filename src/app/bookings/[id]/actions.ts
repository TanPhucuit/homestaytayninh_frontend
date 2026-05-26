"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addBookingService, initiatePayment } from "@/lib/api";
import { ApiClientError } from "@/lib/api-client";

function redirectToLogin(bookingId: string): never {
  redirect(`/login?error=auth_required&next=${encodeURIComponent(`/bookings/${bookingId}`)}`);
}

export async function addServiceAction(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  const serviceId = String(formData.get("serviceId") ?? "");
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));
  if (!bookingId || !serviceId) return;
  try {
    await addBookingService(bookingId, serviceId, quantity, "CUSTOMER");
  } catch (error) {
    if (error instanceof ApiClientError && (error.status === 401 || error.status === 403)) redirectToLogin(bookingId);
    throw error;
  }
  revalidatePath(`/bookings/${bookingId}`);
}

export async function retryPaymentAction(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) return;
  try {
    await initiatePayment(bookingId, "CUSTOMER");
  } catch (error) {
    if (error instanceof ApiClientError && (error.status === 401 || error.status === 403)) redirectToLogin(bookingId);
    throw error;
  }
  revalidatePath(`/bookings/${bookingId}`);
}
