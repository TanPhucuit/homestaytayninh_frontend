import { money } from "@/lib/api";
import { Booking } from "@/lib/types";
import Link from "next/link";
import { BookingStateActions } from "./booking-state-machine";
import { StatusBadge } from "./status-badge";

export function BookingCard({ booking }: { booking: Booking }) {
  return (
    <article className="card space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[#75675f]">MÃ£ Ä‘Æ¡n</p>
          <h3 className="text-xl font-bold text-[#466550]">{booking.id}</h3>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <p className="text-[#75675f]">KhÃ¡ch</p>
          <p className="font-bold">{booking.guestName}</p>
        </div>
        <div>
          <p className="text-[#75675f]">NgÃ y</p>
          <p className="font-bold">
            {booking.checkIn} - {booking.checkOut}
          </p>
        </div>
        <div>
          <p className="text-[#75675f]">Tá»•ng tiá»n</p>
          <p className="font-bold">{money(booking.grandTotal)}</p>
        </div>
      </div>
      <div className="rounded-2xl bg-[#fdf9f4] p-4">
        <p className="mb-2 font-bold text-[#466550]">Dá»‹ch vá»¥ kÃ¨m theo</p>
        {booking.services.map((service) => (
          <div key={service.id} className="flex justify-between text-sm">
            <span>
              {service.name} x {service.quantity}
            </span>
            <span>{money(service.total)}</span>
          </div>
        ))}
      </div>
      {booking.payment && (
        <div className="flex items-center justify-between border-t border-[#466550]/10 pt-4">
          <span className="text-sm text-[#75675f]">Thanh toÃ¡n</span>
          <StatusBadge status={booking.payment.status} />
        </div>
      )}
      <BookingStateActions status={booking.status} bookingId={booking.id} />
      <Link href={`/bookings/${booking.id}`} className="btn-secondary w-full">
        Xem chi tiáº¿t
      </Link>
    </article>
  );
}

