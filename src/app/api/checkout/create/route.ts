import { NextRequest, NextResponse } from "next/server";
import { ApiClientError, apiMutation } from "@/lib/api-client";
import { endpoints } from "@/lib/endpoints";
import { Booking } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

const AUTH_MODE = process.env.NEXT_PUBLIC_AUTH_MODE ?? "supabase";

function isoDateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function positiveInteger(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function paymentStatusForRoute(status?: string) {
  const normalized = String(status ?? "pending").toLowerCase();
  if (normalized === "paid") return "paid";
  if (normalized === "failed" || normalized === "cancelled") return "failed";
  return "pending";
}

export async function POST(request: NextRequest) {
  if (AUTH_MODE === "supabase") {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Vui lòng đăng nhập Google trước khi đặt phòng." }, { status: 401 });
    }
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const offset = 14 + Math.floor(Math.random() * 45);
  const serviceItems = [
    { serviceId: "svc-bbq", quantity: positiveInteger(body.bbqQuantity, 0) }
  ].filter((item) => item.quantity > 0);

  try {
    const booking = await apiMutation<Booking>(
      endpoints.bookings.create,
      "POST",
      {
        homestayId: "hs-ba-den",
        roomId: "room-ba-den-family",
        guestName: String(body.guestName || "Khách hàng Terra & Leaf"),
        guestPhone: String(body.guestPhone || "0900000000"),
        guestCount: 4,
        checkIn: isoDateAfter(offset),
        checkOut: isoDateAfter(offset + 2),
        serviceItems
      },
      "CUSTOMER"
    );
    const payment = await apiMutation<NonNullable<Booking["payment"]>>(
      endpoints.payments.initiate,
      "POST",
      { bookingId: booking.id },
      "CUSTOMER"
    );

    return NextResponse.json({
      booking: { ...booking, payment },
      payment,
      redirectUrl: `/payment/result?status=${paymentStatusForRoute(payment.status)}&bookingId=${encodeURIComponent(booking.id)}`
    });
  } catch (error) {
    if (error instanceof ApiClientError) {
      return NextResponse.json({ message: error.message }, { status: error.status ?? 502 });
    }
    return NextResponse.json({ message: "Không thể tạo booking hoặc thanh toán." }, { status: 500 });
  }
}
