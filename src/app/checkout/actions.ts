"use server";

import { redirect } from "next/navigation";
import { createBooking, initiatePayment } from "@/lib/api";
import { actionErrorMessage } from "@/lib/action-errors";
import { ApiClientError } from "@/lib/api-client";
import { flashUrl } from "@/lib/flash";

function serviceItemsFromForm(formData: FormData) {
  return Array.from(formData.entries())
    .filter(([key]) => key.startsWith("service:"))
    .map(([key, value]) => ({ serviceId: key.replace("service:", ""), quantity: Number(value) }))
    .filter((item) => Number.isInteger(item.quantity) && item.quantity > 0);
}

function checkoutNextPath(formData: FormData) {
  const params = new URLSearchParams();
  ["homestayId", "roomId", "guestName", "guestPhone", "guestCount", "checkIn", "checkOut"].forEach((key) => {
    const value = String(formData.get(key) ?? "");
    if (value) params.set(key, value);
  });
  Array.from(formData.entries())
    .filter(([key, value]) => key.startsWith("service:") && String(value))
    .forEach(([key, value]) => params.set(key, String(value)));
  const query = params.toString();
  return query ? `/checkout/confirm?${query}` : "/checkout";
}

export async function createCheckoutAction(formData: FormData) {
  const homestayId = String(formData.get("homestayId") ?? "");
  let bookingId: string | undefined;
  let authRequired = false;
  let roleDenied = false;
  let createError: unknown;

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
    if (error instanceof ApiClientError && error.status === 401) {
      authRequired = true;
    } else if (error instanceof ApiClientError && error.status === 403) {
      roleDenied = true;
    } else {
      createError = error;
    }
  }

  if (authRequired) {
    redirect(`/login?error=auth_required&next=${encodeURIComponent(checkoutNextPath(formData))}`);
  }
  if (roleDenied) {
    redirect("/login?error=role_lookup");
  }
  if (createError) {
    redirect(flashUrl(checkoutNextPath(formData), "error", actionErrorMessage(createError)));
  }
  if (!bookingId) {
    redirect(flashUrl(checkoutNextPath(formData), "error", "Booking chưa được tạo. Vui lòng thử lại."));
  }

  try {
    await initiatePayment(bookingId, "CUSTOMER");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không tạo được yêu cầu thanh toán.";
    redirect(`/payment/result?bookingId=${bookingId}&paymentError=${encodeURIComponent(message)}`);
  }

  redirect(`/payment/result?bookingId=${bookingId}`);
}
