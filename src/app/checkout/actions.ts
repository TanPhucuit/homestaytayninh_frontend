"use server";

import { redirect } from "next/navigation";
import { createBooking, initiatePayment } from "@/lib/api";

function serviceItemsFromForm(formData: FormData) {
  return Array.from(formData.entries())
    .filter(([key]) => key.startsWith("service:"))
    .map(([key, value]) => ({ serviceId: key.replace("service:", ""), quantity: Number(value) }))
    .filter((item) => Number.isInteger(item.quantity) && item.quantity > 0);
}

export async function createCheckoutAction(formData: FormData) {
  const booking = await createBooking(
    {
      homestayId: String(formData.get("homestayId") ?? ""),
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
  await initiatePayment(booking.id, "CUSTOMER");
  redirect(`/payment/result?bookingId=${booking.id}`);
}
