"use server";

import { redirect } from "next/navigation";
import { createBooking, initiatePayment } from "@/lib/api";
import { actionErrorMessage } from "@/lib/action-errors";
import { ApiClientError } from "@/lib/api-client";
import { flashUrl } from "@/lib/flash";
import type { Booking } from "@/lib/types";

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
    .filter((item) => item.serviceId && Number.isInteger(item.quantity) && item.quantity > 0);
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

function dateFromIso(value?: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function hasValidDateRange(checkIn: string, checkOut: string) {
  const start = dateFromIso(checkIn);
  const end = dateFromIso(checkOut);
  return Boolean(start && end && end > start);
}

function paymentDestination(bookingId: string, payment: NonNullable<Booking["payment"]>) {
  const resultUrl = `/payment/result?bookingId=${encodeURIComponent(bookingId)}&status=pending`;
  return payment.qrUrl ? resultUrl : payment.checkoutUrl || resultUrl;
}

export async function createCheckoutAction(formData: FormData) {
  const homestayId = String(formData.get("homestayId") ?? "");
  const roomIds = selectedRoomIdsFromForm(formData);
  const guestName = String(formData.get("guestName") ?? "").trim();
  const guestPhone = String(formData.get("guestPhone") ?? "").trim();
  const guestEmail = String(formData.get("guestEmail") ?? "").trim();
  const guestCount = Number(formData.get("guestCount") ?? formData.get("guests") ?? 0);
  const checkIn = String(formData.get("checkIn") ?? "");
  const checkOut = String(formData.get("checkOut") ?? "");
  let bookingId: string | undefined;
  let paymentUrl: string | undefined;
  let authRequired = false;
  let roleDenied = false;
  let createError: unknown;
  let paymentError: unknown;

  if (roomIds.length === 0) {
    redirect(flashUrl(checkoutNextPath(formData), "error", "Vui lòng chọn một phòng để tiếp tục thanh toán."));
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
  if (!hasValidDateRange(checkIn, checkOut)) {
    redirect(flashUrl(checkoutNextPath(formData), "error", "Ngày trả phòng phải sau ngày nhận phòng."));
  }
  if (!Number.isInteger(guestCount) || guestCount < 1) {
    redirect(flashUrl(checkoutNextPath(formData), "error", "Vui lòng nhập số khách hợp lệ."));
  }
  if (formData.get("termsAccepted") !== "on") {
    redirect(flashUrl(checkoutNextPath(formData), "error", "Vui lòng đồng ý với điều khoản trước khi thanh toán."));
  }

  try {
    const booking = await createBooking(
      {
        homestayId,
        roomId: roomIds[0],
        roomIds,
        roomItems: roomIds.map((roomId) => ({ roomId })),
        guestName,
        guestPhone,
        guestCount,
        checkIn,
        checkOut,
        serviceItems: serviceItemsFromForm(formData)
      },
      "CUSTOMER"
    );
    bookingId = booking.id;
    const payment = await initiatePayment(booking.id, "CUSTOMER");
    paymentUrl = paymentDestination(booking.id, payment);
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
  if (paymentUrl) {
    redirect(paymentUrl);
  }

  redirect(`/payment/result?bookingId=${bookingId}&status=pending`);
}
