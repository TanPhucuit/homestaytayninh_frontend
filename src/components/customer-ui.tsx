import type { ReactNode } from "react";
import Link from "next/link";
import { Booking, BookingStatus, Homestay, PaymentStatus, Service } from "@/lib/types";
import { money } from "@/lib/api";
import { canViewPaymentStatus } from "@/lib/booking-rules";
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
  const navItems = user.authenticated && !user.authorizationError
    ? navForRole(user.role)
    : [{ label: "Khám phá", href: "/homestays" }, { label: "Cẩm nang", href: "/articles" }];

  return (
    <header className="sticky top-0 z-30 border-b border-[#dcc0ba] bg-[#fdf9f4]/92 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
        <Link href="/" className="min-w-0">
          <span className="block font-heading text-2xl font-bold leading-none tracking-tight text-[#7b2914] md:text-3xl">Terra & Leaf</span>
          <span className="hidden text-[11px] font-bold uppercase tracking-[0.18em] text-[#466550] sm:block">Homestay Tây Ninh</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-[#56423d] lg:flex">
          {!user.authenticated && <Link className="hover:text-[#7b2914]" href="/">Trang chủ</Link>}
          {navItems.map((item) => (
            user.authenticated && !user.authorizationError ? (
              <a className="hover:text-[#7b2914]" href={item.href} key={item.href}>{item.label}</a>
            ) : (
              <Link className="hover:text-[#7b2914]" href={item.href} key={item.href}>{item.label}</Link>
            )
          ))}
        </nav>
        {user.authenticated ? (
          <div className="flex items-center gap-2">
            {user.authorizationError ? (
              <span className="max-w-44 truncate rounded-full bg-[#fff3d6] px-3 py-2 text-xs font-bold text-[#7a4a12] sm:max-w-none sm:px-4 sm:text-sm" title={user.authorizationError}>
                Đã đăng nhập · Lỗi quyền
              </span>
            ) : (
              <a className="hidden rounded-full bg-[#e8f0eb] px-4 py-2 text-sm font-bold text-[#466550] md:block" href={homeForRole(user.role)}>
                {user.role} · {user.name}
              </a>
            )}
            <details className="relative lg:hidden">
              <summary className="btn-secondary list-none px-3 py-2">Menu</summary>
              <div className="absolute right-0 mt-2 grid min-w-52 gap-2 rounded-2xl border border-[#dcc0ba] bg-white p-3 shadow-[0_20px_60px_rgba(123,41,20,0.14)]">
                {navItems.map((item) => <a className="rounded-xl px-3 py-2 text-sm font-bold text-[#56423d] hover:bg-[#fdf9f4]" href={item.href} key={item.href}>{item.label}</a>)}
              </div>
            </details>
            <a className="btn-secondary whitespace-nowrap px-3 py-2 md:px-4" href="/auth/logout">Đăng xuất</a>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link className="hidden btn-secondary md:inline-flex" href="/homestays">Đặt phòng ngay</Link>
            <Link className="btn-primary px-3 py-2 md:px-5" href="/login">Đăng nhập</Link>
          </div>
        )}
      </div>
    </header>
  );
}

async function PageQuickLinks() {
  const user = await getCurrentUser();
  if (user.authenticated && !user.authorizationError) {
    const roleLinks: Record<string, Array<{ label: string; href: string }>> = {
      CUSTOMER: [
        { label: "Trang chủ", href: "/" },
        { label: "Tìm homestay", href: "/homestays" },
        { label: "Booking của tôi", href: "/bookings" }
      ],
      OWNER: [
        { label: "Dashboard chủ nhà", href: "/owner" },
        { label: "Quản lý homestay", href: "/owner/manage" }
      ],
      OWNER_STAFF: [
        { label: "Booking vận hành", href: "/owner" },
        { label: "Đặt hộ khách", href: "/owner/proxy-booking" }
      ],
      STAFF: [
        { label: "CMS nội dung", href: "/staff" },
        { label: "Kiểm soát người dùng", href: "/staff/moderation" }
      ],
      ADMIN: [
        { label: "Tổng quan Admin", href: "/admin" },
        { label: "Quản lý homestay", href: "/owner/manage" },
        { label: "Vận hành booking", href: "/owner" }
      ]
    };
    return roleLinks[user.role].map((item) => <Link className="btn-secondary" href={item.href} key={item.href}>{item.label}</Link>);
  }
  return (
    <>
      <Link className="btn-secondary" href="/">Trang chủ</Link>
      <Link className="btn-secondary" href="/homestays">Tìm homestay</Link>
    </>
  );
}

export function PageShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description?: string; children: ReactNode }) {
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
              <PageQuickLinks />
            </div>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}

export function Stepper({ active }: { active: 1 | 2 | 3 }) {
  const steps = ["Thông tin", "Dịch vụ", "Xác nhận"];
  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => {
        const number = index + 1;
        const done = number < active;
        const current = number === active;
        return (
          <div className="flex flex-1 items-center last:flex-none" key={step}>
            <div className="flex flex-col items-center gap-2">
              <div className={`grid h-10 w-10 place-items-center rounded-full border text-sm font-bold ${current ? "border-[#7b2914] bg-[#7b2914] text-white" : done ? "border-[#466550] bg-[#e8f0eb] text-[#466550]" : "border-[#dcc0ba] bg-[#f7f3ee] text-[#89726c]"}`}>
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

export function HomestayCard({ homestay, href }: { homestay: Homestay; href?: string }) {
  const visibleAmenities = homestay.amenities.slice(0, 3);
  const extraAmenityCount = Math.max(0, homestay.amenities.length - visibleAmenities.length);

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#e7d9cf] bg-[#fffdfb] shadow-[0_18px_50px_rgba(72,45,32,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#d9c2b4] hover:shadow-[0_24px_70px_rgba(72,45,32,0.11)]">
      <div className="image-shell relative aspect-[4/3]">
        <div
          className="absolute inset-0 bg-cover bg-center transition duration-700 ease-out group-hover:scale-[1.04]"
          style={{ backgroundImage: `url(${homestay.imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f1712]/45 via-[#1f1712]/5 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full border border-white/50 bg-[#fdf9f4]/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#466550] backdrop-blur">{homestay.type}</div>
        <button className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-white/55 bg-[#fdf9f4]/88 text-lg text-[#9a4029] shadow-sm transition hover:bg-white" type="button" aria-label="Lưu homestay">
          ♡
        </button>
        <div className="absolute bottom-4 right-4 rounded-full bg-[#fdf9f4]/92 px-3 py-1 text-xs font-bold text-[#466550] shadow-sm backdrop-blur">★ {homestay.rating}</div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="space-y-1.5">
          <h2 className="line-clamp-1 font-heading text-[1.35rem] leading-tight text-[#2c211c]">{homestay.name}</h2>
          <p className="line-clamp-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#89726c]">{homestay.location}</p>
        </div>

        <p className="line-clamp-2 min-h-11 text-sm leading-6 text-[#5f514a]">{homestay.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {visibleAmenities.map((amenity) => (
            <span className="rounded-full bg-[#f2ebe4] px-2.5 py-1 text-[11px] font-bold text-[#6f564b]" key={amenity}>{amenity}</span>
          ))}
          {extraAmenityCount > 0 && (
            <span className="rounded-full bg-[#e8f0eb] px-2.5 py-1 text-[11px] font-bold text-[#466550]">+{extraAmenityCount}</span>
          )}
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-[#eadfd4] pt-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9a4029]">Từ</p>
            <p className="mt-1 whitespace-nowrap">
              <span className="font-heading text-2xl font-bold leading-none text-[#9a4029]">{money(homestay.priceFrom)}</span>
              <span className="ml-1 text-xs font-semibold text-[#89726c]">/đêm</span>
            </p>
            <p className="mt-1 text-xs font-semibold text-[#89726c]">Tối đa {homestay.capacity} khách</p>
          </div>
          <Link className="rounded-full bg-[#9a4029] px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(154,64,41,0.16)] transition hover:-translate-y-0.5 hover:bg-[#84331f]" href={href ?? `/homestays/${homestay.id}`}>Chi tiết</Link>
        </div>
      </div>
    </article>
  );
}

export function BookingCard({ booking, homestay }: { booking: Booking; homestay?: Homestay }) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-[0_18px_55px_rgba(123,41,20,0.07)]">
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
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <a className="btn-primary" href={`/bookings/${booking.id}`}>Xem chi tiết</a>
        {canViewPaymentStatus(booking) && (
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
                <span className="col-span-2 md:col-span-4">
                  <span className={`badge ${service.status === "SERVED" ? "badge-green" : "bg-[#fff3d6] text-[#7a4a12]"}`}>
                    {service.status === "SERVED" ? "Đã phục vụ" : "Đang chuẩn bị"}
                  </span>
                </span>
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
