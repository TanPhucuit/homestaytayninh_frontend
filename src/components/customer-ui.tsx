import type { ReactNode } from "react";
import Link from "next/link";
import { Booking, BookingStatus, Homestay, PaymentStatus, Service } from "@/lib/types";
import { money } from "@/lib/api";
import { canViewPaymentStatus } from "@/lib/booking-rules";
import { getCurrentUser, homeForRole, navForRole } from "@/lib/rbac";
import { UserRole } from "@/lib/types";
import { type LucideIcon, ArrowRight, ArrowUpRight, CalendarDays, Check, Leaf, LogOut, MapPin, Menu, ShieldAlert, ShieldCheck, Star, Users, X } from "lucide-react";
import { HeaderFrame } from "./motion";

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

export async function AppTopBar({ overlay = false }: { overlay?: boolean } = {}) {
  const user = await getCurrentUser();
  const signedIn = user.authenticated && !user.authorizationError;
  const navItems = signedIn
    ? navForRole(user.role)
    : [{ label: "Trang chủ", href: "/" }, { label: "Khám phá", href: "/homestays" }, { label: "Cẩm nang", href: "/articles" }];
  // Over a hero image the header text is white until the frame turns solid on scroll.
  const tone = "text-ink group-data-[solid=false]/header:text-white";

  return (
    <HeaderFrame overlay={overlay}>
      <div className="container-page flex h-16 items-center justify-between gap-2 md:h-20">
        <Link href="/" className={`group flex min-w-0 items-center gap-3 ${tone}`} aria-label="Homestay Tây Ninh, về trang chủ">
          <span className="hidden size-10 shrink-0 place-items-center rounded-full bg-brand text-white shadow-cta min-[420px]:grid transition duration-500 group-hover:rotate-[-12deg]" aria-hidden="true">
            <Leaf className="size-5" strokeWidth={1.8} />
          </span>
          <span className="min-w-0 leading-none">
            <span className="block whitespace-nowrap font-heading text-base font-semibold sm:text-xl md:text-[1.4rem]">Homestay <span className="italic text-brand">Tây Ninh</span></span>
            <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.28em] opacity-70 sm:block">Nghỉ dưỡng giữa thiên nhiên</span>
          </span>
        </Link>

        <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              className={`relative rounded-full px-4 py-2 text-sm font-medium opacity-85 transition hover:opacity-100 after:absolute after:inset-x-4 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 ${tone}`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
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
                <Link className="hidden items-center gap-2.5 rounded-full border border-line-soft bg-white/90 py-1 pl-1 pr-4 text-sm shadow-sm transition hover:border-line md:flex" href={homeForRole(user.role)}>
                  <span className="grid size-9 place-items-center rounded-full bg-bark text-xs font-semibold text-gold" aria-hidden="true">{initials(user.name)}</span>
                  <span className="leading-tight">
                    <span className="block max-w-36 truncate font-semibold text-ink">{user.name}</span>
                    <span className="block text-xs text-muted">{roleLabel[user.role]}</span>
                  </span>
                </Link>
              )}
              <a className={`hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium opacity-80 transition hover:opacity-100 sm:inline-flex ${tone}`} href="/auth/logout">
                <LogOut className="size-4" aria-hidden="true" /> Đăng xuất
              </a>
            </>
          ) : (
            <>
              <Link className={`hidden rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-80 md:inline-flex ${tone}`} href="/homestays">Đặt phòng ngay</Link>
              <Link className="btn-primary min-h-10 px-3.5 text-sm sm:min-h-11 sm:px-5" href="/login">Đăng nhập</Link>
            </>
          )}
          <details className="group relative lg:hidden">
            <summary className="grid size-11 list-none place-items-center rounded-full border border-line-soft bg-white/90 text-ink shadow-sm [&::-webkit-details-marker]:hidden" aria-label="Mở menu">
              <Menu className="size-5 group-open:hidden" aria-hidden="true" />
              <X className="hidden size-5 group-open:block" aria-hidden="true" />
            </summary>
            <nav aria-label="Menu di động" className="animate-fade-up absolute right-0 mt-3 grid w-72 gap-1 rounded-3xl border border-line-soft bg-cream p-3 shadow-lift">
              {navItems.map((item) => (
                <Link className="rounded-2xl px-4 py-3 text-sm font-medium text-ink-muted transition hover:bg-sand-deep hover:text-ink" href={item.href} key={item.href}>{item.label}</Link>
              ))}
              {user.authenticated && (
                <a className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-danger hover:bg-danger-soft" href="/auth/logout">
                  <LogOut className="size-4" aria-hidden="true" /> Đăng xuất
                </a>
              )}
            </nav>
          </details>
        </div>
      </div>
    </HeaderFrame>
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
    <footer className="grain relative mt-24 overflow-hidden bg-bark text-white/80">
      <Leaf className="pointer-events-none absolute -bottom-16 -right-10 size-80 rotate-[-18deg] text-white/[0.04]" aria-hidden="true" />
      <div className="container-page relative grid gap-12 py-16 md:grid-cols-[1.6fr_1fr_1fr] md:py-20">
        <div>
          <p className="font-heading text-3xl text-white">Homestay <span className="italic text-gold">Tây Ninh</span></p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/65">Homestay, lều glamping và nhà nguyên căn giữa thiên nhiên Tây Ninh. Đặt phòng trực tuyến, thanh toán VietQR qua ApiPay.</p>
          <Link className="btn-primary mt-7" href="/homestays">Tìm chỗ nghỉ <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
        <nav aria-label="Liên kết khám phá" className="grid content-start gap-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Khám phá</p>
          <Link className="transition hover:text-white" href="/homestays">Tìm homestay</Link>
          <Link className="transition hover:text-white" href="/articles">Cẩm nang Tây Ninh</Link>
          <Link className="transition hover:text-white" href="/bookings">Chuyến đi của tôi</Link>
        </nav>
        <div className="grid content-start gap-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Hỗ trợ</p>
          <p className="flex items-center gap-2"><MapPin className="size-4 text-gold" aria-hidden="true" /> Tây Ninh, Việt Nam</p>
          <p className="flex items-center gap-2"><ShieldCheck className="size-4 text-gold" aria-hidden="true" /> Thanh toán bảo mật qua ApiPay</p>
        </div>
      </div>
      <div className="container-page flex flex-col justify-between gap-2 border-t border-white/10 py-6 text-xs text-white/50 sm:flex-row">
        <p>© {new Date().getFullYear()} Homestay Tây Ninh</p>
        <p>tayninhhomestay.id.vn</p>
      </div>
    </footer>
  );
}

export function PageShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description?: string; children: ReactNode }) {
  return (
    <>
      <AppTopBar />
      <main id="main" className="min-h-[70vh] text-ink">
        <PageBanner eyebrow={eyebrow} title={title} description={description} />
        <div className="container-page py-10 md:py-14">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}

export function PageBanner({ eyebrow, title, description, children }: { eyebrow: string; title: ReactNode; description?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-line-soft bg-cream">
      <div className="pointer-events-none absolute -right-24 -top-24 size-[28rem] rounded-full bg-leaf-soft blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-32 bottom-0 size-80 rounded-full bg-leaf-soft blur-3xl" aria-hidden="true" />
      <div className="container-page relative py-8 md:py-12">
        <p className="eyebrow animate-fade-up">{eyebrow}</p>
        <h1 className="display animate-fade-up mt-3 max-w-4xl text-3xl text-ink [animation-delay:80ms] md:text-5xl">{title}</h1>
        {description && <p className="animate-fade-up mt-4 max-w-2xl text-base leading-7 text-muted [animation-delay:160ms] md:text-lg">{description}</p>}
        {children && <div className="animate-fade-up mt-6 [animation-delay:220ms]">{children}</div>}
      </div>
    </section>
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
    <header className="grain animate-fade-up relative overflow-hidden rounded-[28px] bg-bark p-7 text-white shadow-lift md:p-10">
      <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-brand/30 blur-3xl" aria-hidden="true" />
      <Leaf className="pointer-events-none absolute -bottom-10 right-6 size-48 rotate-12 text-white/[0.05]" aria-hidden="true" />
      <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow eyebrow-light">{eyebrow}</p>
          <h1 className="display mt-3 text-3xl md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">{description}</p>
          {meta && <p className="mt-4 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">{meta}</p>}
        </div>
        {links && links.length > 0 && (
          <nav aria-label="Điều hướng khu vực" className="flex flex-wrap gap-2">
            {links.map((link) => (
              <Link
                aria-current={link.active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium transition ${link.active ? "bg-white text-bark" : "border border-white/20 bg-white/5 text-white hover:bg-white hover:text-bark"}`}
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

export function StatTile({ label, value, icon: Icon, highlight = false }: { label: string; value: ReactNode; icon: LucideIcon; highlight?: boolean }) {
  return (
    <div className={`group relative overflow-hidden rounded-[24px] border p-6 transition duration-500 hover:-translate-y-1 hover:shadow-lift ${highlight ? "border-transparent bg-bark text-white" : "border-line-soft bg-white shadow-card"}`}>
      <span className={`grid size-11 place-items-center rounded-2xl transition duration-500 group-hover:scale-110 ${highlight ? "bg-gold text-bark" : "bg-leaf-soft text-leaf-strong"}`} aria-hidden="true">
        <Icon className="size-5" />
      </span>
      <p className={`mt-5 text-sm ${highlight ? "text-white/70" : "text-muted"}`}>{label}</p>
      <p className="mt-1 break-words font-heading text-2xl leading-tight md:text-[1.7rem] xl:text-3xl">{value}</p>
    </div>
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
  const target = href ?? `/homestays/${homestay.id}`;

  return (
    <article className="hover-zoom group relative flex flex-col">
      <div className="image-shell relative aspect-[4/5] rounded-[28px] rounded-tr-[64px] shadow-card transition duration-500 group-hover:shadow-lift sm:aspect-[5/6]">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote images from owners, unknown hosts */}
        <img alt={`Ảnh ${homestay.name}`} className="absolute inset-0 size-full object-cover" decoding="async" loading="lazy" src={homestay.imageUrl} />
        <div className="absolute inset-0 bg-gradient-to-t from-bark/40 via-transparent to-transparent" aria-hidden="true" />
        <span className="absolute left-4 top-4 rounded-full bg-cream/95 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-ink-muted shadow-sm">{homestay.type}</span>
        <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 rounded-full bg-bark/80 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
          <Star className="size-3.5 fill-gold text-gold" aria-hidden="true" />
          {homestay.rating}
        </span>
        <span className="absolute bottom-4 right-4 grid size-12 place-items-center rounded-full bg-brand text-white shadow-cta transition duration-500 group-hover:rotate-45 group-hover:bg-gold group-hover:text-bark" aria-hidden="true">
          <ArrowUpRight className="size-5" />
        </span>
      </div>
      <div className="mt-4 px-1">
        <p className="flex items-center gap-1.5 text-sm font-medium text-muted"><MapPin className="size-4 text-brand" aria-hidden="true" />{homestay.location}</p>
        <h2 className="mt-1 line-clamp-2 font-heading text-2xl leading-tight text-ink">
          <Link className="after:absolute after:inset-0 after:z-10 after:rounded-[28px]" href={target}>{homestay.name}</Link>
        </h2>
        <div className="mt-3 flex items-end justify-between gap-3 border-t border-dashed border-line pt-3">
          <p>
            <span className="text-sm text-muted">Giá từ </span>
            <span className="font-heading text-2xl text-brand-strong">{money(homestay.priceFrom)}</span>
            <span className="text-sm text-muted"> /đêm</span>
          </p>
          <Link className="relative z-20 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand-wash px-4 text-sm font-semibold text-brand-strong transition hover:bg-brand hover:text-white" href={target}>Chi tiết <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-sand-deep px-3 py-1.5 text-xs font-semibold text-ink-muted"><Users className="size-3.5" aria-hidden="true" />{homestay.capacity} khách</span>
          {visibleAmenities.map((amenity) => (
            <span className="rounded-full border border-line-soft bg-cream px-3 py-1.5 text-xs font-medium text-ink-muted" key={amenity}>{amenity}</span>
          ))}
          {extraAmenityCount > 0 && <span className="rounded-full bg-leaf-soft px-3 py-1.5 text-xs font-semibold text-leaf-strong">+{extraAmenityCount}</span>}
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
      <h2 className="font-heading text-2xl text-ink">Tóm tắt đơn hàng</h2>
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
      <h2 className="font-heading text-2xl text-ink">Dịch vụ trong booking</h2>
      <div className="mt-5 grid gap-6">
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
