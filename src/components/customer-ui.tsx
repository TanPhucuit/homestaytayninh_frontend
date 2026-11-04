import type { ReactNode } from "react";
import Link from "next/link";
import { Booking, BookingStatus, Homestay, PaymentStatus, Service } from "@/lib/types";
import { money } from "@/lib/api";
import { canViewPaymentStatus } from "@/lib/booking-rules";
import { getCurrentUser, homeForRole, navForRole } from "@/lib/rbac";
import { UserRole } from "@/lib/types";
import { CalendarDays, Check, Leaf, LogOut, MapPin, Menu, ShieldAlert, ShieldCheck, Star, Users, X } from "lucide-react";

const statusMeta: Record<BookingStatus, { label: string; className: string; group: string }> = {
  PENDING: { label: "Chờ xác nhận", group: "Sắp tới", className: "bg-warn-soft text-warn" },
  CONFIRMED: { label: "Đã xác nhận", group: "Sắp tới", className: "bg-leaf-soft text-leaf" },
  IN_STAY: { label: "Đang trải nghiệm", group: "Đang trải nghiệm", className: "bg-leaf-soft text-leaf-strong" },
  COMPLETED: { label: "Đã hoàn thành", group: "Đã hoàn thành", className: "bg-sand-deep text-ink-muted" },
  CANCELLED: { label: "Đã hủy", group: "Đã hủy", className: "bg-danger-soft text-danger" }
};

const paymentMeta: Record<PaymentStatus, { label: string; className: string }> = {
  INITIATED: { label: "Chưa thanh toán", className: "bg-sand-deep text-ink-muted" },
  PENDING: { label: "Đang xử lý", className: "bg-warn-soft text-warn" },
  PAID: { label: "Đã thanh toán", className: "bg-leaf-soft text-leaf" },
  FAILED: { label: "Thất bại", className: "bg-danger-soft text-danger" },
  CANCELLED: { label: "Đã hủy/hết hạn", className: "bg-danger-soft text-danger" }
};

const roleLabel: Record<UserRole, string> = {
  CUSTOMER: "Khách hàng",
  OWNER: "Chủ homestay",
  OWNER_STAFF: "Nhân viên homestay",
  STAFF: "Nhân viên vận hành",
  ADMIN: "Quản trị viên"
};

export async function AppTopBar() {
  const user = await getCurrentUser();
  const signedIn = user.authenticated && !user.authorizationError;
  const navItems = signedIn
    ? navForRole(user.role)
    : [{ label: "Trang chủ", href: "/" }, { label: "Khám phá", href: "/homestays" }, { label: "Cẩm nang", href: "/articles" }];

  return (
    <header className="sticky top-0 z-30 border-b border-line-soft bg-sand/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:h-20 md:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5" aria-label="Terra & Leaf, về trang chủ">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-white shadow-cta transition group-hover:bg-brand-strong" aria-hidden="true">
            <Leaf className="size-5" strokeWidth={2} />
          </span>
          <span className="min-w-0">
            <span className="block font-heading text-xl font-bold leading-none text-brand-strong md:text-2xl">Terra & Leaf</span>
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-leaf sm:block">Homestay Tây Ninh</span>
          </span>
        </Link>

        <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 text-sm font-semibold lg:flex">
          {navItems.map((item) => (
            <Link className="rounded-lg px-3 py-2 text-ink-muted transition hover:bg-sand-deep hover:text-brand-strong" href={item.href} key={item.href}>{item.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user.authenticated ? (
            <>
              {user.authorizationError ? (
                <span className="badge max-w-44 truncate bg-warn-soft text-warn sm:max-w-none" title={user.authorizationError}>
                  <ShieldAlert className="size-4" aria-hidden="true" /> Đã đăng nhập · Lỗi quyền
                </span>
              ) : (
                <Link className="hidden items-center gap-2 rounded-full border border-line-soft bg-white py-1.5 pl-1.5 pr-4 text-sm transition hover:border-line md:flex" href={homeForRole(user.role)}>
                  <span className="grid size-8 place-items-center rounded-full bg-leaf-soft text-xs font-bold text-leaf-strong" aria-hidden="true">{initials(user.name)}</span>
                  <span className="leading-tight">
                    <span className="block max-w-36 truncate font-semibold text-ink">{user.name}</span>
                    <span className="block text-xs text-muted">{roleLabel[user.role]}</span>
                  </span>
                </Link>
              )}
              <a className="btn-ghost hidden px-3 sm:inline-flex" href="/auth/logout">
                <LogOut className="size-4" aria-hidden="true" /> Đăng xuất
              </a>
            </>
          ) : (
            <>
              <Link className="btn-secondary hidden md:inline-flex" href="/homestays">Đặt phòng ngay</Link>
              <Link className="btn-primary px-4" href="/login">Đăng nhập</Link>
            </>
          )}
          <details className="group relative lg:hidden">
            <summary className="grid size-11 list-none place-items-center rounded-xl border border-line-soft bg-white text-ink-muted [&::-webkit-details-marker]:hidden" aria-label="Mở menu">
              <Menu className="size-5 group-open:hidden" aria-hidden="true" />
              <X className="hidden size-5 group-open:block" aria-hidden="true" />
            </summary>
            <nav aria-label="Menu di động" className="animate-fade-up absolute right-0 mt-2 grid w-64 gap-1 rounded-2xl border border-line-soft bg-white p-2 shadow-lift">
              {navItems.map((item) => (
                <Link className="rounded-xl px-3 py-3 text-sm font-semibold text-ink-muted hover:bg-sand hover:text-brand-strong" href={item.href} key={item.href}>{item.label}</Link>
              ))}
              {user.authenticated && (
                <a className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-danger hover:bg-danger-soft" href="/auth/logout">
                  <LogOut className="size-4" aria-hidden="true" /> Đăng xuất
                </a>
              )}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const last = parts.at(-1)?.[0] ?? "";
  const first = parts.length > 1 ? parts[0][0] : "";
  return (last + first).toUpperCase() || "U";
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line-soft bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-heading text-xl font-bold text-brand-strong">Terra & Leaf</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted">Homestay, lều glamping và nhà nguyên căn tại Tây Ninh. Đặt phòng trực tuyến, thanh toán VietQR qua ApiPay.</p>
        </div>
        <nav aria-label="Liên kết khám phá" className="grid content-start gap-2 text-sm">
          <p className="font-semibold text-ink">Khám phá</p>
          <Link className="text-muted hover:text-brand" href="/homestays">Tìm homestay</Link>
          <Link className="text-muted hover:text-brand" href="/articles">Cẩm nang Tây Ninh</Link>
          <Link className="text-muted hover:text-brand" href="/bookings">Chuyến đi của tôi</Link>
        </nav>
        <div className="grid content-start gap-2 text-sm text-muted">
          <p className="font-semibold text-ink">Hỗ trợ</p>
          <p className="flex items-center gap-2"><MapPin className="size-4 text-leaf" aria-hidden="true" /> Tây Ninh, Việt Nam</p>
          <p className="flex items-center gap-2"><ShieldCheck className="size-4 text-leaf" aria-hidden="true" /> Thanh toán bảo mật qua ApiPay</p>
        </div>
      </div>
      <p className="border-t border-line-soft py-4 text-center text-xs text-subtle">© {new Date().getFullYear()} Terra & Leaf · tayninhhomestay.id.vn</p>
    </footer>
  );
}

export function PageShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description?: string; children: ReactNode }) {
  return (
    <>
      <AppTopBar />
      <main id="main" className="min-h-[70vh] text-ink">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
          <header className="animate-fade-up mb-8 border-b border-line-soft pb-6 md:mb-10 md:pb-8">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-2 font-heading text-3xl font-semibold leading-tight text-ink md:text-5xl">{title}</h1>
            {description && <p className="mt-3 max-w-3xl text-base leading-7 text-muted">{description}</p>}
          </header>
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export function PortalHero({ eyebrow, title, description, meta, links }: {
  eyebrow: string;
  title: string;
  description: string;
  meta?: string;
  links?: Array<{ label: string; href: string; active?: boolean }>;
}) {
  return (
    <header className="animate-fade-up relative overflow-hidden rounded-2xl bg-leaf-strong p-6 text-white shadow-lift md:p-8">
      <Leaf className="pointer-events-none absolute -right-6 -top-6 size-40 rotate-12 text-white/5" aria-hidden="true" />
      <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{eyebrow}</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">{description}</p>
          {meta && <p className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/85">{meta}</p>}
        </div>
        {links && links.length > 0 && (
          <nav aria-label="Điều hướng khu vực" className="flex flex-wrap gap-2">
            {links.map((link) => (
              <Link
                aria-current={link.active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold transition ${link.active ? "bg-white text-leaf-strong" : "bg-white/10 text-white hover:bg-white/20"}`}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

export function Stepper({ active }: { active: 1 | 2 | 3 }) {
  const steps = ["Thông tin", "Dịch vụ", "Xác nhận"];
  return (
    <ol className="flex items-center justify-center" aria-label="Các bước đặt phòng">
      {steps.map((step, index) => {
        const number = index + 1;
        const done = number < active;
        const current = number === active;
        return (
          <li className="flex flex-1 items-center last:flex-none" key={step} aria-current={current ? "step" : undefined}>
            <div className="flex flex-col items-center gap-2">
              <div className={`grid size-10 place-items-center rounded-full border-2 text-sm font-bold transition ${current ? "border-brand bg-brand text-white shadow-cta" : done ? "border-leaf bg-leaf text-white" : "border-line bg-white text-subtle"}`}>
                {done ? <Check className="size-5" aria-label="Đã xong" /> : number}
              </div>
              <span className={`text-xs font-semibold ${current ? "text-brand-strong" : done ? "text-leaf-strong" : "text-subtle"}`}>{step}</span>
            </div>
            {number < steps.length && <div className={`mx-3 mb-6 h-0.5 flex-1 rounded-full ${done ? "bg-leaf" : "bg-line-soft"}`} aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
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
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line-soft bg-white shadow-card transition duration-300 ease-out hover:-translate-y-1 hover:border-line hover:shadow-lift">
      <div className="image-shell relative aspect-[4/3]">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote images from owners, unknown hosts */}
        <img
          alt={`Ảnh ${homestay.name}`}
          className="absolute inset-0 size-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
          decoding="async"
          loading="lazy"
          src={homestay.imageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" aria-hidden="true" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-leaf-strong shadow-sm">{homestay.type}</span>
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-ink shadow-sm">
          <Star className="size-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />
          {homestay.rating}
          <span className="sr-only">điểm đánh giá</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="space-y-1">
          <h2 className="line-clamp-1 font-heading text-[1.3rem] font-semibold leading-tight text-ink">
            <Link className="after:absolute after:inset-0" href={href ?? `/homestays/${homestay.id}`}>{homestay.name}</Link>
          </h2>
          <p className="flex items-center gap-1 text-sm text-muted"><MapPin className="size-3.5 shrink-0 text-leaf" aria-hidden="true" /><span className="line-clamp-1">{homestay.location}</span></p>
        </div>

        <p className="line-clamp-2 min-h-12 text-sm leading-6 text-ink-muted">{homestay.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {visibleAmenities.map((amenity) => (
            <span className="rounded-full bg-sand-deep px-2.5 py-1 text-[11px] font-bold text-ink-muted" key={amenity}>{amenity}</span>
          ))}
          {extraAmenityCount > 0 && (
            <span className="rounded-full bg-leaf-soft px-2.5 py-1 text-[11px] font-bold text-leaf">+{extraAmenityCount}</span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-line-soft pt-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted">Giá từ</p>
            <p className="mt-1 whitespace-nowrap">
              <span className="text-xl font-bold leading-none text-brand">{money(homestay.priceFrom)}</span>
              <span className="ml-1 text-xs font-semibold text-subtle">/đêm</span>
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted"><Users className="size-3.5" aria-hidden="true" /> Tối đa {homestay.capacity} khách</p>
          </div>
          <Link className="btn-primary relative z-10 min-h-10 px-4 py-2 text-sm" href={href ?? `/homestays/${homestay.id}`}>Chi tiết</Link>
        </div>
      </div>
    </article>
  );
}

export function BookingCard({ booking, homestay }: { booking: Booking; homestay?: Homestay }) {
  const roomSummary = booking.rooms?.length
    ? `${booking.rooms.length} phòng: ${booking.rooms.map((room) => room.name).join(", ")}`
    : booking.roomId;

  return (
    <article className="card p-5 transition hover:border-line md:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={booking.status} />
            {booking.payment?.status && <PaymentBadge status={booking.payment.status} />}
            <span className="rounded-full bg-sand-deep px-3 py-1 text-xs font-bold text-ink-muted">{booking.id}</span>
          </div>
          <h2 className="mt-3 font-heading text-2xl font-semibold text-ink">{homestay?.name ?? booking.homestayId}</h2>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4 text-leaf" aria-hidden="true" />{booking.checkIn} – {booking.checkOut}</span>
            <span className="inline-flex items-center gap-1.5"><Users className="size-4 text-leaf" aria-hidden="true" />{booking.guestCount} khách · {booking.guestName}</span>
          </p>
          <p className="mt-1 text-sm text-muted">{roomSummary}</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-xs font-semibold text-subtle">Tổng hóa đơn</p>
          <p className="text-2xl font-bold text-leaf">{money(booking.grandTotal)}</p>
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
      <h2 className="font-heading text-2xl text-brand-strong">Tóm tắt đơn hàng</h2>
      <div className="mt-4 space-y-3">
        {rows.map(([label, value], index) => (
          <div className={`flex justify-between gap-4 ${index === rows.length - 1 ? "border-t border-line pt-3 text-lg font-bold text-leaf" : "text-sm text-ink-muted"}`} key={label}>
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
      <h2 className="font-heading text-2xl text-brand-strong">Dịch vụ trong booking</h2>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="text-lg font-bold text-leaf">Dịch vụ đã bao gồm</h3>
          <div className="mt-3 space-y-2">
            {includedServices.length ? includedServices.map((service) => (
              <div className="rounded-xl bg-leaf-soft px-4 py-3 text-sm" key={service.id}>
                <p className="font-bold text-leaf">{service.name}</p>
                {service.description && <p className="text-ink-muted">{service.description}</p>}
              </div>
            )) : <p className="text-sm text-ink-muted">Chưa có dịch vụ bao gồm.</p>}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-leaf">Dịch vụ đặt thêm</h3>
          <div className="mt-3 grid gap-3 md:hidden">
            {addOnServices.length ? addOnServices.map((service) => (
              <article className="rounded-xl border border-line bg-white p-4 text-sm" key={service.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-ink">{service.name}</p>
                    {service.roomName && <p className="mt-1 text-xs font-semibold text-muted">{service.roomName}</p>}
                  </div>
                  <span className={`badge ${service.status === "SERVED" ? "badge-green" : "bg-warn-soft text-warn"}`}>
                    {service.status === "SERVED" ? "Đã phục vụ" : "Đang chuẩn bị"}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-sand px-3 py-2 text-xs">
                  <span>SL <strong>{service.quantity}</strong></span>
                  <span>Đơn giá <strong>{money(service.unitPrice)}</strong></span>
                  <span>Thành tiền <strong>{money(service.total)}</strong></span>
                </div>
              </article>
            )) : <p className="rounded-xl border border-line bg-white p-4 text-sm text-ink-muted">Chưa đặt dịch vụ bổ sung.</p>}
          </div>
          <div className="mt-3 hidden overflow-hidden rounded-xl border border-line md:block">
            {addOnServices.length ? addOnServices.map((service) => (
              <div className="grid gap-2 border-b border-line bg-white px-4 py-3 text-sm last:border-b-0 md:grid-cols-[1fr_110px_120px_120px_130px]" key={service.id}>
                <span className="font-semibold">
                  {service.name}
                  {service.roomName && <span className="mt-1 block text-xs font-medium text-muted">{service.roomName}</span>}
                </span>
                <span>SL: {service.quantity}</span>
                <span>{money(service.unitPrice)}</span>
                <span className="font-bold">{money(service.total)}</span>
                <span>
                  <span className={`badge ${service.status === "SERVED" ? "badge-green" : "bg-warn-soft text-warn"}`}>
                    {service.status === "SERVED" ? "Đã phục vụ" : "Đang chuẩn bị"}
                  </span>
                </span>
              </div>
            )) : <p className="p-4 text-sm text-ink-muted">Chưa đặt dịch vụ bổ sung.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

export function statusGroup(status: BookingStatus) {
  return statusMeta[status].group;
}
