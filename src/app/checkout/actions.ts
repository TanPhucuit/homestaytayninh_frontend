"use server";

import { redirect } from "next/navigation";
import { createBooking, initiatePayment } from "@/lib/api";
import { ApiClientError } from "@/lib/api-client";

function serviceItemsFromForm(formData: FormData) {
  return Array.from(formData.entries())
    .filter(([key]) => key.startsWith("service:"))
    .map(([key, value]) => ({ serviceId: key.replace("service:", ""), quantity: Number(value) }))
    .filter((item) => Number.isInteger(item.quantity) && item.quantity > 0);
}

export async function createCheckoutAction(formData: FormData) {
  const homestayId = String(formData.get("homestayId") ?? "");
  let bookingId: string | undefined;
  let authRequired = false;

  try {
    const booking = await createBooking(
      {
        homestayId,
        roomId: String(formData.get("roomId") ?? ""),
        guestName: String(formData.get("guestName") ?? "").trim(),
        guestPhone: String(formData.get("guestPhone") ?? "").trim(),
        guestCount: Math.max(1, Number(formData.get("guestCount") ?? 1)),
        checkIn: String(formData.get("checkIn") ?? ""),
        checkOut: String(formData.get("checkOut") ?? ""),
        serviceItems: serviceItemsFromForm(formData)
      },
      "CUSTOMER"
    );
    bookingId = booking.id;
  } catch (error) {
    if (error instanceof ApiClientError && (error.status === 401 || error.status === 403)) {
      authRequired = true;
    } else {
      throw error;
    }
  }

  if (authRequired) {
    redirect(`/login?error=auth_required&next=${encodeURIComponent(`/checkout?homestayId=${homestayId}`)}`);
  }
  if (!bookingId) {
    throw new Error("Booking was not created.");
  }

  let paymentPending = false;
  try {
    await initiatePayment(bookingId, "CUSTOMER");
  } catch {
    paymentPending = true;
  }

  redirect(`/payment/result?bookingId=${bookingId}${paymentPending ? "&payment=pending" : ""}`);
}
