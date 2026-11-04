import Link from "next/link";
import { AccessDenied } from "@/components/access-denied";
import { AppTopBar, SiteFooter, PaymentBadge, StatusBadge, statusGroup } from "@/components/customer-ui";
import { EmptyState } from "@/components/feedback-state";
import { getBookings, getHomestays, money } from "@/lib/api";
import { canViewPaymentStatus } from "@/lib/booking-rules";
import { getCurrentUser } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const groups = ["Sắp tới", "Đang trải nghiệm", "Đã hoàn thành", "Đã hủy"] as const;

type BookingGroup = (typeof groups)[number];

function isBookingGroup(value?: string): value is BookingGroup {
  return Boolean(value && groups.includes(value as BookingGroup));
}

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ statusGroup?: string }> }) {
  const user = await getCurrentUser();
  const params = await searchParams;
  if (!user.authenticated) {
    return <AccessDenied description="Vui lòng đăng nhập để xem lịch sử đặt phòng của bạn." />;
  }
  if (user.authorizationError) {
    return <AccessDenied description={user.authorizationError} />;
  }
  if (user.role !== "CUSTOMER") {
    return <AccessDenied description="Chuyến đi của tôi chỉ dành cho tài khoản khách hàng. Vui lòng dùng khu vực vận hành theo vai trò của bạn." />;
  }

  const [bookings, homestays] = await Promise.all([getBookings(user.role), getHomestays("CUSTOMER")]);
  const homestayById = new Map(homestays.map((homestay) => [homestay.id, homestay]));
  const defaultGroup = bookings.some((booking) => booking.status === "IN_STAY") ? "Đang trải nghiệm" : "Sắp tới";
  const activeGroup = isBookingGroup(params.statusGroup) ? params.statusGroup : defaultGroup;
  const counts = new Map<BookingGroup, number>(groups.map((group) => [group, bookings.filter((booking) => statusGroup(booking.status) === group).length]));
  const activeBookings = bookings.filter((booking) => statusGroup(booking.status) === activeGroup);
  const firstAvailableGroup = groups.find((group) => group !== activeGroup && (counts.get(group) ?? 0) > 0);

  return (
    <main id="main" className="min-h-screen text-ink">
      <AppTopBar />
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <header className="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="eyebrow">Đơn đặt của tôi</p>
            <h1 className="mt-2 font-heading text-4xl text-brand md:text-5xl">Chuyến đi của bạn</h1>
            <p className="mt-3 max-w-2xl text-ink-muted">Theo dõi trạng thái đặt phòng, thanh toán và các dịch vụ đã chọn.</p>
          </div>
          <Link className="btn-primary" href="/homestays">Đặt thêm chuyến đi</Link>
        </header>

        <div className="mb-8 grid grid-cols-2 gap-3 rounded-2xl border border-line-soft bg-white p-2 md:grid-cols-4">
          {groups.map((group) => (
            <Link
              className={`rounded-xl px-4 py-3 text-center text-sm font-bold ${group === activeGroup ? "bg-brand text-white shadow-card" : "text-muted hover:bg-sand"}`}
              href={`/bookings?statusGroup=${encodeURIComponent(group)}`}
              key={group}
            >
              {group} ({counts.get(group) ?? 0})
            </Link>
          ))}
        </div>

        {bookings.length ? (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="eyebrow">Trạng thái</p>
                <h2 className="mt-2 font-heading text-3xl text-ink">{activeGroup}</h2>
              </div>
              <span className="rounded-full bg-leaf-soft px-4 py-2 text-sm font-bold text-leaf">{activeBookings.length} đơn</span>
            </div>
            <div className="grid gap-5">
              {activeBookings.length ? activeBookings.map((booking) => {
                const homestay = homestayById.get(booking.homestayId);
                const imageUrl = homestay?.images?.[0]?.url ?? homestay?.imageUrl;
                const isPaid = booking.payment?.status === "PAID";
                const canCheckPayment = canViewPaymentStatus(booking);
                const roomSummary = booking.rooms?.length
                  ? `${booking.rooms.length} phòng: ${booking.rooms.map((room) => room.name).join(", ")}`
                  : `Phòng ${booking.roomId}`;
                return (
                  <article className="overflow-hidden rounded-2xl border border-line-soft bg-white shadow-card md:grid md:grid-cols-[320px_1fr]" key={booking.id}>
                    <div className="image-shell min-h-52 md:min-h-72">
                      {imageUrl ? (
                        <img className="h-full min-h-52 w-full object-cover md:min-h-72" src={imageUrl} alt={homestay?.name ?? "Ảnh homestay"} />
                      ) : (
                        <div className="grid h-full min-h-52 place-items-center px-6 text-center text-sm font-bold text-muted md:min-h-72">
                          Chưa có ảnh homestay
                        </div>
                      )}
                    </div>
                    <div className="p-5 md:p-6">
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={booking.status} />
                        {booking.payment?.status && <PaymentBadge status={booking.payment.status} />}
                      </div>
                      <h2 className="mt-4 font-heading text-3xl text-ink">{homestay?.name ?? booking.homestayId}</h2>
                      <p className="mt-2 text-sm text-muted">{booking.checkIn} - {booking.checkOut} · {booking.guestCount} khách</p>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold text-leaf">{roomSummary}</p>
                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-sand p-4">
                          <h3 className="font-heading text-xl text-brand">Thông tin khách</h3>
                          <p className="mt-2 text-sm text-ink-muted">Khách: {booking.guestName}</p>
                          <p className="text-sm text-ink-muted">SĐT: {booking.guestPhone}</p>
                        </div>
                        <div className="rounded-2xl bg-sand p-4">
                          <h3 className="font-heading text-xl text-brand">Dịch vụ & tổng tiền</h3>
                          <p className="mt-2 text-sm text-ink-muted">{booking.services.length} dịch vụ đặt thêm</p>
                          <p className="font-bold text-leaf">{money(booking.grandTotal)}</p>
                        </div>
                      </div>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <a className="btn-primary flex-1" href={`/bookings/${booking.id}`}>Xem chi tiết</a>
                        {canCheckPayment && <a className="btn-secondary flex-1" href={`/payment/result?bookingId=${booking.id}&status=${booking.payment?.status ?? "pending"}`}>Kiểm tra thanh toán</a>}
                        {isPaid && <span className="btn-secondary flex-1 cursor-default border-leaf-soft bg-leaf-soft text-leaf">Đã thanh toán</span>}
                      </div>
                    </div>
                  </article>
                );
              }) : (
                <div className="rounded-2xl border border-dashed border-line bg-white/70 p-8 text-center text-muted">
                  <p className="font-semibold">Chưa có đơn đặt trong nhóm này.</p>
                  <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                    {firstAvailableGroup && (
                      <Link className="btn-secondary" href={`/bookings?statusGroup=${encodeURIComponent(firstAvailableGroup)}`}>
                        Xem nhóm {firstAvailableGroup}
                      </Link>
                    )}
                    <Link className="btn-primary" href="/homestays">Đặt thêm chuyến đi</Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : (
          <EmptyState title="Bạn chưa có đơn đặt" description="Hãy tìm homestay phù hợp và tạo đơn đặt phòng đầu tiên." actionHref="/homestays" actionLabel="Tìm homestay" />
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
