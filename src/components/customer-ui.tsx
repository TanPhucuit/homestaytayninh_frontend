import Link from "next/link";
import { Booking, BookingStatus, Homestay, PaymentStatus, Service } from "@/lib/types";
import { money } from "@/lib/api";
import { getCurrentUser, homeForRole, navForRole } from "@/lib/rbac";

const statusMeta: Record<BookingStatus, { label: string; className: string; group: string }> = {
  PENDING: { label: "Chờ xác nhận", group: "Sắp tới", className: "bg-[#fff3d6] text-[#7a4a12]" },
  CONFIRMED: { label: "Đã xác nhận", group: "Sắp tới", className: "bg-[#e8f0eb] text-[#466550]" },
  IN_STAY: { label: "Đang trải nghiệm", group: "Đang trải nghiệm", className: "bg-[#dcebe2] text-[#3f6b4d]" },
  COMPLETED: { label: "Đã hoàn thành", group: "Đã hoàn thành", className: "bg-[#ebe8e3] text-[#56514b]" },
  CANCELLED: { label: "Đã hủy", group: "Đã hủy", className: "bg-[#ffdad6] text-[#93000a]" }
};

const paymentMeta: Record<PaymentStatus, { label: string; className: string }> = {
  INITIATED: { label: "Chưa thanh toán", className: "bg-[#ebe8e3] text-[#56514b]" },
  PENDING: { label: "Đang xử lý", className: "bg-[#fff3d6] text-[#7a4a12]" },
  PAID: { label: "Đã thanh toán", className: "bg-[#e8f0eb] text-[#466550]" },
  FAILED: { label: "Thất bại", className: "bg-[#ffdad6] text-[#93000a]" },
  CANCELLED: { label: "Đã hủy/hết hạn", className: "bg-[#ffdad6] text-[#93000a]" }
};

export async function AppTopBar() {
  const user = await getCurrentUser();
  const navItems = user.authenticated
    ? navForRole(user.role)
    : [{ label: "Khám phá", href: "/homestays" }];

  return (
    <header className="sticky top-0 z-30 border-b border-[#dcc0ba] bg-[#fdf9f4]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <Link href="/" className="font-heading text-3xl font-bold tracking-tight text-[#7b2914]">
          Terra & Leaf
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#56423d] md:flex">
          {navItems.map((item) => (
            user.authenticated ? (
              <a className="hover:text-[#7b2914]" href={item.href} key={item.href}>{item.label}</a>
            ) : (
              <Link className="hover:text-[#7b2914]" href={item.href} key={item.href}>{item.label}</Link>
            )
          ))}
        </nav>
        {user.authenticated ? (
          <div className="flex items-center gap-2">
            <a className="hidden rounded-full bg-[#e8f0eb] px-4 py-2 text-sm font-bold text-[#466550] sm:block" href={homeForRole(user.role)}>
              {user.role} · {user.name}
            </a>
            <a className="btn-secondary" href="/auth/logout">Đăng xuất</a>
          </div>
        ) : (
          <Link className="btn-primary" href="/login">Đăng nhập</Link>
        )}
      </div>
    </header>
  );
}

export function PageShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description?: string; children: React.ReactNode }) {
  const bookingHistoryHref = "/bookings";

  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <header className="stitch-panel mb-8 p-6 md:p-8">
          <p className="eyebrow">{eyebrow}</p>
          <div className="mt-3 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h1 className="font-heading text-4xl leading-tight text-[#7b2914] md:text-5xl">{title}</h1>
              {description && <p className="mt-3 max-w-3xl text-base leading-7 text-[#56423d]">{description}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="btn-secondary" href="/">Trang chủ</Link>
              <Link className="btn-secondary" href="/homestays">Tìm homestay</Link>
              <a className="btn-secondary" href={bookingHistoryHref}>Booking của tôi</a>
            </div>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}

export function Stepper({ active }: { active: 1 | 2 | 3 }) {
  const steps = ["Thông tin", "Dịch vụ", "Thanh toán"];
  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => {
        const number = index + 1;
        const done = number < active;
        const current = number === active;
        return (
          <div className="flex flex-1 items-center last:flex-none" key={step}>
            <div className="flex flex-col items-center gap-2">
              <div className={`grid h-9 w-9 place-items-center rounded-full border text-sm font-bold ${current ? "border-[#7b2914] bg-[#7b2914] text-white" : done ? "border-[#466550] bg-[#e8f0eb] text-[#466550]" : "border-[#dcc0ba] bg-[#ebe8e3] text-[#89726c]"}`}>
                {done ? "✓" : number}
              </div>
              <span className={`text-xs font-bold ${current ? "text-[#7b2914]" : "text-[#89726c]"}`}>{step}</span>
            </div>
            {number < steps.length && <div className="mx-4 h-px flex-1 bg-[#dcc0ba]" />}
          </div>
        );
      })}
    </div>
  );
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  const meta = statusMeta[status];
  return <span className={`badge ${meta.className}`}>{meta.label}</span>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const meta = paymentMeta[status];
  return <span className={`badge ${meta.className}`}>{meta.label}</span>;
}

export function HomestayCard({ homestay }: { homestay: Homestay }) {
  return (
    <article className="group overflow-hidden rounded-[24px] bg-white shadow-[0_18px_55px_rgba(123,41,20,0.08)] transition hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(123,41,20,0.12)]">
      <div className="relative aspect-[16/10] bg-cover bg-center" style={{ backgroundImage: `url(${homestay.imageUrl})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c19]/55 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-[#fdf9f4]/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#466550]">{homestay.type}</div>
        <div className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-[#466550]">★ {homestay.rating}</div>
      </div>
      <div className="p-5">
        <h2 className="font-heading text-2xl text-[#7b2914]">{homestay.name}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#56423d]">{homestay.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {homestay.amenities.slice(0, 4).map((amenity) => (
            <span className="rounded-full bg-[#ffdad2] px-3 py-1 text-xs font-semibold text-[#7b2914]" key={amenity}>{amenity}</span>
          ))}
        </div>
        <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold text-[#89726c]">Từ</p>
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
    <article className="rounded-[24px] bg-white p-5 shadow-[0_18px_55px_rgba(123,41,20,0.07)]">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={booking.status} />
            {booking.payment?.status && <PaymentBadge status={booking.payment.status} />}
            <span className="rounded-full bg-[#f1ede8] px-3 py-1 text-xs font-bold text-[#56423d]">{booking.id}</span>
          </div>
          <h2 className="mt-3 font-heading text-2xl text-[#7b2914]">{homestay?.name ?? booking.homestayId}</h2>
          <p className="mt-1 text-sm text-[#56423d]">
            {booking.checkIn} → {booking.checkOut} · {booking.guestCount} khách · {booking.guestName}
          </p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-xs font-semibold text-[#89726c]">Tổng hóa đơn</p>
          <p className="text-2xl font-bold text-[#466550]">{money(booking.grandTotal)}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <a className="btn-primary" href={`/bookings/${booking.id}`}>Xem chi tiết</a>
        {(booking.payment?.status === "INITIATED" || booking.payment?.status === "PENDING" || booking.payment?.status === "FAILED") && (
          <a className="btn-secondary" href={`/payment/result?bookingId=${booking.id}`}>Kiểm tra thanh toán</a>
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
      <h2 className="font-heading text-2xl text-[#7b2914]">Tóm tắt đơn hàng</h2>
      <div className="mt-4 space-y-3">
        {rows.map(([label, value], index) => (
          <div className={`flex justify-between gap-4 ${index === rows.length - 1 ? "border-t border-[#dcc0ba] pt-3 text-lg font-bold text-[#466550]" : "text-sm text-[#56423d]"}`} key={label}>
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
      <h2 className="font-heading text-2xl text-[#7b2914]">Dịch vụ trong booking</h2>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="text-lg font-bold text-[#466550]">Dịch vụ đã bao gồm</h3>
          <div className="mt-3 space-y-2">
            {includedServices.length ? includedServices.map((service) => (
              <div className="rounded-xl bg-[#e8f0eb] px-4 py-3 text-sm" key={service.id}>
                <p className="font-bold text-[#466550]">{service.name}</p>
                {service.description && <p className="text-[#56423d]">{service.description}</p>}
              </div>
            )) : <p className="text-sm text-[#56423d]">Chưa có dịch vụ bao gồm.</p>}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#466550]">Dịch vụ đặt thêm</h3>
          <div className="mt-3 overflow-hidden rounded-xl border border-[#dcc0ba]">
            {addOnServices.length ? addOnServices.map((service) => (
              <div className="grid grid-cols-2 gap-2 border-b border-[#dcc0ba] bg-white px-4 py-3 text-sm last:border-b-0 md:grid-cols-[1fr_70px_120px_120px]" key={service.id}>
                <span className="font-semibold">{service.name}</span>
                <span>SL: {service.quantity}</span>
                <span>{money(service.unitPrice)}</span>
                <span className="font-bold">{money(service.total)}</span>
                <span className="col-span-2 text-xs text-[#56423d] md:col-span-4">Trạng thái: {service.status === "SERVED" ? "Đã phục vụ" : "Đang chuẩn bị"}</span>
              </div>
            )) : <p className="p-4 text-sm text-[#56423d]">Chưa đặt dịch vụ bổ sung.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

export function statusGroup(status: BookingStatus) {
  return statusMeta[status].group;
}
