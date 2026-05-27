"use server";

import { redirect } from "next/navigation";
import { createBooking, initiatePayment } from "@/lib/api";
import { actionErrorMessage } from "@/lib/action-errors";
import { ApiClientError } from "@/lib/api-client";
import { flashUrl } from "@/lib/flash";

function serviceItemsFromForm(formData: FormData) {
  const roomIds = selectedRoomIdsFromForm(formData);
  return Array.from(formData.entries())
    .filter(([key]) => key.startsWith("service:"))
    .map(([key, value]) => {
      const [, maybeRoomId, maybeServiceId] = key.split(":");
      const serviceId = maybeServiceId ? maybeServiceId : maybeRoomId;
      const roomId = maybeServiceId ? maybeRoomId : roomIds[0];
      return { roomId, serviceId, quantity: Number(value) };
    })
    .filter((item) => !item.roomId || roomIds.length <= 1 || item.roomId === roomIds[0])
    .map(({ serviceId, quantity }) => ({ serviceId, quantity }))
    .filter((item) => Number.isInteger(item.quantity) && item.quantity > 0);
}

function selectedRoomIdsFromForm(formData: FormData) {
  const roomIds = String(formData.get("roomIds") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const roomId = String(formData.get("roomId") ?? "");
  return roomIds.length ? roomIds : roomId ? [roomId] : [];
}

function checkoutNextPath(formData: FormData) {
  const params = new URLSearchParams();
  ["homestayId", "roomId", "roomIds", "guestName", "guestPhone", "guestEmail", "guestCount", "guests", "checkIn", "checkOut", "notes"].forEach((key) => {
    const value = String(formData.get(key) ?? "");
    if (value) params.set(key, value);
  });
  Array.from(formData.entries())
    .filter(([key, value]) => key.startsWith("service:") && Number(value) > 0)
    .forEach(([key, value]) => params.set(key, String(value)));
  const query = params.toString();
  return query ? `/checkout/confirm?${query}` : "/checkout";
}

function isValidPhone(value: string) {
  return /^(?:\+?84|0)[0-9\s.-]{8,12}$/.test(value);
}

function isValidEmail(value: string) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function createCheckoutAction(formData: FormData) {
  const homestayId = String(formData.get("homestayId") ?? "");
  const roomIds = selectedRoomIdsFromForm(formData);
  const guestName = String(formData.get("guestName") ?? "").trim();
  const guestPhone = String(formData.get("guestPhone") ?? "").trim();
  const guestEmail = String(formData.get("guestEmail") ?? "").trim();
  let bookingId: string | undefined;
  let checkoutUrl: string | undefined;
  let authRequired = false;
  let roleDenied = false;
  let createError: unknown;
  let paymentError: unknown;

  if (roomIds.length === 0) {
    redirect(flashUrl(checkoutNextPath(formData), "error", "Vui lòng chọn một phòng để tiếp tục thanh toán."));
  }
  if (roomIds.length > 1) {
    redirect(flashUrl(checkoutNextPath(formData), "error", "Hiện hệ thống chỉ hỗ trợ đặt một phòng mỗi lần. Vui lòng chọn một phòng để tiếp tục."));
  }
  if (guestName.length < 2) {
    redirect(flashUrl(checkoutNextPath(formData), "error", "Vui lòng nhập họ tên khách đặt phòng."));
  }
  if (!isValidPhone(guestPhone)) {
    redirect(flashUrl(checkoutNextPath(formData), "error", "Số điện thoại chưa đúng định dạng."));
  }
  if (!isValidEmail(guestEmail)) {
    redirect(flashUrl(checkoutNextPath(formData), "error", "Email chưa đúng định dạng."));
  }
  if (formData.get("termsAccepted") !== "on") {
    redirect(flashUrl(checkoutNextPath(formData), "error", "Vui lòng đồng ý với điều khoản trước khi thanh toán."));
  }

  try {
    const booking = await createBooking(
      {
        homestayId,
        roomId: roomIds[0],
        guestName,
        guestPhone,
        guestCount: Math.max(1, Number(formData.get("guestCount") ?? formData.get("guests") ?? 1)),
        checkIn: String(formData.get("checkIn") ?? ""),
        checkOut: String(formData.get("checkOut") ?? ""),
        serviceItems: serviceItemsFromForm(formData)
      },
      "CUSTOMER"
    );
    bookingId = booking.id;
    const payment = await initiatePayment(booking.id, "CUSTOMER");
    checkoutUrl = payment.checkoutUrl;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      authRequired = true;
    } else if (error instanceof ApiClientError && error.status === 403) {
      roleDenied = true;
    } else if (!bookingId) {
      createError = error;
    } else {
      paymentError = error;
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
  if (paymentError) {
    redirect(`/payment/result?bookingId=${bookingId}&status=failed&paymentError=${encodeURIComponent(actionErrorMessage(paymentError))}`);
  }
  if (checkoutUrl) {
    redirect(checkoutUrl);
  }

  redirect(`/payment/result?bookingId=${bookingId}&status=pending`);
}
