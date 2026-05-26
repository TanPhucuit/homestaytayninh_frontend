import { BookingCard, PageShell, StatusBadge } from "./customer-ui";
import { Booking, Homestay } from "@/lib/types";
import { money } from "@/lib/api";

export function OwnerShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <PageShell eyebrow="Owner Portal" title={title} description={description}>{children}</PageShell>;
}

export function OwnerStats({ homestays, bookings }: { homestays: Homestay[]; bookings: Booking[] }) {
  const paidRevenue = bookings.reduce((sum, booking) => sum + (booking.payment?.status === "PAID" ? booking.grandTotal : 0), 0);
  const inStay = bookings.filter((booking) => booking.status === "IN_STAY").length;
  const completed = bookings.filter((booking) => booking.status === "COMPLETED").length;
  const stats = [
    ["Homestay", homestays.length],
    ["Booking", bookings.length],
    ["Đang trải nghiệm", inStay],
    ["Hoàn thành", completed]
  ] as const;

  return (
    <section className="grid gap-4 md:grid-cols-4">
      {stats.map(([label, value]) => (
        <div className="card p-5" key={label}>
          <p className="text-sm font-semibold text-[#466550]">{label}</p>
          <p className="mt-2 font-heading text-3xl font-bold text-[#9a4029]">{value}</p>
        </div>
      ))}
      <div className="card p-5 md:col-span-4">
        <p className="text-sm font-semibold text-[#466550]">Doanh thu đã thanh toán</p>
        <p className="mt-2 font-heading text-3xl font-bold text-[#9a4029]">{money(paidRevenue)}</p>
      </div>
    </section>
  );
}

export function OwnerBookingOps({ bookings, homestays, action }: { bookings: Booking[]; homestays: Homestay[]; action: (formData: FormData) => Promise<void> }) {
  const homestayById = new Map(homestays.map((homestay) => [homestay.id, homestay]));
  const nextActions: Partial<Record<Booking["status"], Array<{ label: string; status: Booking["status"] }>>> = {
    PENDING: [{ label: "Xác nhận", status: "CONFIRMED" }, { label: "Từ chối", status: "CANCELLED" }],
    CONFIRMED: [{ label: "Check-in", status: "IN_STAY" }, { label: "Hủy", status: "CANCELLED" }],
    IN_STAY: [{ label: "Check-out", status: "COMPLETED" }]
  };

  return (
    <section className="space-y-4">
      {bookings.map((booking) => (
        <div className="card p-5" key={booking.id}>
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
            <div>
              <StatusBadge status={booking.status} />
              <h3 className="mt-3 font-heading text-2xl text-[#9a4029]">{homestayById.get(booking.homestayId)?.name ?? booking.homestayId}</h3>
              <p className="mt-1 text-sm text-[#75675f]">{booking.guestName} · {booking.checkIn} → {booking.checkOut} · {money(booking.grandTotal)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(nextActions[booking.status] ?? []).map((item) => (
                <form action={action} key={item.status}>
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <input type="hidden" name="status" value={item.status} />
                  <button className={item.status === "CANCELLED" ? "btn-secondary" : "btn-primary"} type="submit">{item.label}</button>
                </form>
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

export function OwnerInventory({ homestays }: { homestays: Homestay[] }) {
  return (
    <section className="grid gap-5">
      {homestays.map((homestay) => (
        <article className="card p-6" key={homestay.id}>
          <div className="flex flex-col justify-between gap-3 md:flex-row">
            <div>
              <p className="eyebrow">{homestay.type}</p>
              <h2 className="mt-1 font-heading text-3xl text-[#9a4029]">{homestay.name}</h2>
              <p className="mt-2 text-sm text-[#75675f]">{homestay.location} · {money(homestay.priceFrom)} · {homestay.capacity} khách</p>
            </div>
            <div className="h-28 w-full rounded-2xl bg-cover bg-center md:w-44" style={{ backgroundImage: `url(${homestay.imageUrl})` }} aria-label={homestay.name} />
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="font-bold text-[#466550]">Phòng</h3>
              <div className="mt-2 space-y-2">
                {homestay.rooms.map((room) => (
                  <div className="rounded-xl bg-[#fdf9f4] px-4 py-3 text-sm" key={room.id}>
                    <strong>{room.name}</strong> · {money(room.pricePerNight)} · {room.capacity} khách · {room.active ? "Đang bán" : "Tạm ẩn"}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-[#466550]">Dịch vụ</h3>
              <div className="mt-2 space-y-2">
                {[...homestay.includedServices, ...homestay.services].map((service) => (
                  <div className="rounded-xl bg-[#fdf9f4] px-4 py-3 text-sm" key={service.id}>
                    <strong>{service.name}</strong> · {service.included ? "Bao gồm" : money(service.unitPrice)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export function BookingListPreview({ bookings, homestays }: { bookings: Booking[]; homestays: Homestay[] }) {
  const homestayById = new Map(homestays.map((homestay) => [homestay.id, homestay]));
  return (
    <div className="grid gap-4">
      {bookings.slice(0, 5).map((booking) => <BookingCard booking={booking} homestay={homestayById.get(booking.homestayId)} key={booking.id} />)}
    </div>
  );
}
