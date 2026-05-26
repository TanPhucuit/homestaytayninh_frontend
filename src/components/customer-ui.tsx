import Link from "next/link";
import { Booking, BookingStatus, Homestay, PaymentStatus, Service } from "@/lib/types";
import { money } from "@/lib/api";

const statusMeta: Record<BookingStatus, { label: string; className: string; group: string }> = {
  PENDING: { label: "Chờ xác nhận", group: "Sắp tới", className: "bg-amber-100 text-amber-800" },
  CONFIRMED: { label: "Đã xác nhận", group: "Sắp tới", className: "bg-[#e8f0eb] text-[#466550]" },
  IN_STAY: { label: "Đang trải nghiệm", group: "Đang trải nghiệm", className: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Đã hoàn thành", group: "Đã hoàn thành", className: "bg-zinc-100 text-zinc-700" },
  CANCELLED: { label: "Đã hủy", group: "Đã hủy", className: "bg-red-100 text-red-700" }
};

const paymentMeta: Record<PaymentStatus, { label: string; className: string }> = {
  INITIATED: { label: "Chưa thanh toán", className: "bg-zinc-100 text-zinc-700" },
  PENDING: { label: "Đang xử lý", className: "bg-amber-100 text-amber-800" },
  PAID: { label: "Đã thanh toán", className: "bg-[#e8f0eb] text-[#466550]" },
  FAILED: { label: "Thất bại", className: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Đã hủy/hết hạn", className: "bg-red-100 text-red-700" }
};

export function PageShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#fdf9f4] px-4 py-8 text-[#2b211d] md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-[#eadfd3] md:flex-row md:items-end">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-2 text-4xl text-[#9a4029] md:text-5xl">{title}</h1>
            {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75675f]">{description}</p>}
          </div>
          <nav className="flex flex-wrap gap-2 text-sm font-semibold">
            <Link className="btn-secondary" href="/">Trang chủ</Link>
            <Link className="btn-secondary" href="/homestays">Tìm homestay</Link>
            <Link className="btn-secondary" href="/bookings">Booking của tôi</Link>
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  const meta = statusMeta[status];
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${meta.className}`}>{meta.label}</span>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const meta = paymentMeta[status];
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${meta.className}`}>{meta.label}</span>;
}

export function HomestayCard({ homestay }: { homestay: Homestay }) {
  return (
    <article className="card overflow-hidden">
      <div className="aspect-[16/10] bg-cover bg-center" style={{ backgroundImage: `url(${homestay.imageUrl})` }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#466550]">{homestay.type}</p>
            <h2 className="mt-1 text-2xl text-[#9a4029]">{homestay.name}</h2>
          </div>
          <span className="rounded-full bg-[#e8f0eb] px-3 py-1 text-sm font-bold text-[#466550]">★ {homestay.rating}</span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#75675f]">{homestay.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {homestay.amenities.slice(0, 4).map((amenity) => (
            <span className="rounded-full bg-[#f8e7e0] px-3 py-1 text-xs font-semibold text-[#9a4029]" key={amenity}>{amenity}</span>
          ))}
        </div>
        <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs text-[#75675f]">Từ</p>
            <p className="text-xl font-bold text-[#466550]">{money(homestay.priceFrom)} / đêm</p>
          </div>
          <Link className="btn-primary" href={`/homestays/${homestay.id}`}>Xem chi tiết</Link>
        </div>
      </div>
    </article>
  );
}

export function BookingCard({ booking, homestay }: { booking: Booking; homestay?: Homestay }) {
  return (
    <article className="card p-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={booking.status} />
            {booking.payment?.status && <PaymentBadge status={booking.payment.status} />}
          </div>
          <h2 className="mt-3 text-2xl text-[#9a4029]">{homestay?.name ?? booking.homestayId}</h2>
          <p className="mt-1 text-sm text-[#75675f]">
            {booking.checkIn} → {booking.checkOut} · {booking.guestCount} khách · {booking.guestName}
          </p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-xs text-[#75675f]">Tổng hóa đơn</p>
          <p className="text-2xl font-bold text-[#466550]">{money(booking.grandTotal)}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link className="btn-primary" href={`/bookings/${booking.id}`}>Xem chi tiết</Link>
        {(booking.payment?.status === "INITIATED" || booking.payment?.status === "PENDING" || booking.payment?.status === "FAILED") && (
          <Link className="btn-secondary" href={`/payment/result?bookingId=${booking.id}`}>Kiểm tra thanh toán</Link>
        )}
      </div>
    </article>
  );
}

export function BookingTotals({ booking }: { booking: Booking }) {
  const rows = [
    ["Tiền phòng", booking.roomTotal],
    ["Tổng tiền dịch vụ", booking.serviceTotal],
    ["Thuế/Phí", booking.taxTotal],
    ["Tổng hóa đơn", booking.grandTotal]
  ] as const;

  return (
    <section className="card p-6">
      <h2 className="text-2xl text-[#9a4029]">Order Summary</h2>
      <div className="mt-4 space-y-3">
        {rows.map(([label, value], index) => (
          <div className={`flex justify-between gap-4 ${index === rows.length - 1 ? "border-t border-[#eadfd3] pt-3 text-lg font-bold text-[#466550]" : "text-sm"}`} key={label}>
            <span>{label}</span>
            <span>{money(value)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ServicesDisplay({ includedServices, addOnServices }: { includedServices: Service[]; addOnServices: Booking["services"] }) {
  return (
    <section className="card p-6">
      <h2 className="text-2xl text-[#9a4029]">Dịch vụ trong booking</h2>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="text-lg font-bold text-[#466550]">Included Services</h3>
          <div className="mt-3 space-y-2">
            {includedServices.length ? includedServices.map((service) => (
              <div className="rounded-xl bg-[#e8f0eb] px-4 py-3 text-sm" key={service.id}>
                <p className="font-bold text-[#466550]">{service.name}</p>
                {service.description && <p className="text-[#75675f]">{service.description}</p>}
              </div>
            )) : <p className="text-sm text-[#75675f]">Chưa có dịch vụ bao gồm.</p>}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#466550]">Add-on Services</h3>
          <div className="mt-3 overflow-hidden rounded-xl border border-[#eadfd3]">
            {addOnServices.length ? addOnServices.map((service) => (
              <div className="grid grid-cols-2 gap-2 border-b border-[#eadfd3] bg-white px-4 py-3 text-sm last:border-b-0 md:grid-cols-[1fr_70px_120px_120px]" key={service.id}>
                <span className="font-semibold">{service.name}</span>
                <span>SL: {service.quantity}</span>
                <span>{money(service.unitPrice)}</span>
                <span className="font-bold">{money(service.total)}</span>
                <span className="col-span-2 text-xs text-[#75675f] md:col-span-4">Trạng thái: {service.status === "SERVED" ? "Đã phục vụ" : "Đang chuẩn bị"}</span>
              </div>
            )) : <p className="p-4 text-sm text-[#75675f]">Chưa đặt dịch vụ bổ sung.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

export function statusGroup(status: BookingStatus) {
  return statusMeta[status].group;
}
