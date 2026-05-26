"use server";

import { revalidatePath } from "next/cache";
import { addBookingService, initiatePayment } from "@/lib/api";

export async function addServiceAction(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  const serviceId = String(formData.get("serviceId") ?? "");
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));
  if (!bookingId || !serviceId) return;
  await addBookingService(bookingId, serviceId, quantity, "CUSTOMER");
  revalidatePath(`/bookings/${bookingId}`);
}

export async function retryPaymentAction(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) return;
  await initiatePayment(bookingId, "CUSTOMER");
  revalidatePath(`/bookings/${bookingId}`);
}
