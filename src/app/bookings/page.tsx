import Link from "next/link";
import { AccessDenied } from "@/components/access-denied";
import { AppTopBar, PaymentBadge, StatusBadge, statusGroup } from "@/components/customer-ui";
import { EmptyState } from "@/components/feedback-state";
import { getBookings, getHomestays, money } from "@/lib/api";
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

  const [bookings, homestays] = await Promise.all([getBookings(user.role), getHomestays("CUSTOMER")]);
  const homestayById = new Map(homestays.map((homestay) => [homestay.id, homestay]));
  const defaultGroup = bookings.some((booking) => booking.status === "IN_STAY") ? "Đang trải nghiệm" : "Sắp tới";
  const activeGroup = isBookingGroup(params.statusGroup) ? params.statusGroup : defaultGroup;
  const counts = new Map<BookingGroup, number>(groups.map((group) => [group, bookings.filter((booking) => statusGroup(booking.status) === group).length]));
  const activeBookings = bookings.filter((booking) => statusGroup(booking.status) === activeGroup);

  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <header className="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="eyebrow">Đơn đặt của tôi</p>
            <h1 className="mt-2 font-heading text-4xl text-[#9a4029] md:text-5xl">Chuyến đi của bạn</h1>
            <p className="mt-3 max-w-2xl text-[#56423d]">Theo dõi trạng thái đặt phòng, thanh toán và các dịch vụ đã chọn.</p>
          </div>
          <Link className="btn-primary" href="/homestays">Đặt thêm chuyến đi</Link>
        </header>

        <div className="mb-8 grid grid-cols-2 gap-3 rounded-2xl border border-[#eadfd4] bg-white p-2 md:grid-cols-4">
          {groups.map((group) => (
            <Link
              className={`rounded-xl px-4 py-3 text-center text-sm font-bold ${group === activeGroup ? "bg-[#9a4029] text-white shadow-[0_12px_28px_rgba(154,64,41,0.2)]" : "text-[#75675f] hover:bg-[#fdf9f4]"}`}
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
                <h2 className="mt-2 font-heading text-3xl text-[#1c1c19]">{activeGroup}</h2>
              </div>
              <span className="rounded-full bg-[#e8f0eb] px-4 py-2 text-sm font-bold text-[#466550]">{activeBookings.length} đơn</span>
            </div>
            <div className="grid gap-5">
              {activeBookings.length ? activeBookings.map((booking) => {
                const homestay = homestayById.get(booking.homestayId);
                return (
                  <article className="overflow-hidden rounded-2xl border border-[#eadfd4] bg-white shadow-[0_24px_70px_rgba(123,41,20,0.1)] md:grid md:grid-cols-[320px_1fr]" key={booking.id}>
                    <div className="image-shell min-h-52 bg-cover bg-center md:min-h-72" style={{ backgroundImage: homestay?.imageUrl ? `url(${homestay.imageUrl})` : undefined }} />
                    <div className="p-5 md:p-6">
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={booking.status} />
                        {booking.payment?.status && <PaymentBadge status={booking.payment.status} />}
                      </div>
                      <h2 className="mt-4 font-heading text-3xl text-[#1c1c19]">{homestay?.name ?? booking.homestayId}</h2>
                      <p className="mt-2 text-sm text-[#75675f]">{booking.checkIn} - {booking.checkOut} · {booking.guestCount} khách</p>
                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-[#fdf9f4] p-4">
                          <h3 className="font-heading text-xl text-[#9a4029]">Thông tin khách</h3>
                          <p className="mt-2 text-sm text-[#56423d]">Khách: {booking.guestName}</p>
                          <p className="text-sm text-[#56423d]">SĐT: {booking.guestPhone}</p>
                        </div>
                        <div className="rounded-2xl bg-[#fdf9f4] p-4">
                          <h3 className="font-heading text-xl text-[#9a4029]">Dịch vụ & tổng tiền</h3>
                          <p className="mt-2 text-sm text-[#56423d]">{booking.services.length} dịch vụ đặt thêm</p>
                          <p className="font-bold text-[#466550]">{money(booking.grandTotal)}</p>
                        </div>
                      </div>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <a className="btn-primary flex-1" href={`/bookings/${booking.id}`}>Xem chi tiết</a>
                        <a className="btn-secondary flex-1" href={`/payment/result?bookingId=${booking.id}&status=${booking.payment?.status ?? "pending"}`}>Kiểm tra thanh toán</a>
                      </div>
                    </div>
                  </article>
                );
              }) : (
                <div className="rounded-2xl border border-dashed border-[#dcc0ba] bg-white/70 p-8 text-[#75675f]">Chưa có đơn đặt trong nhóm này.</div>
              )}
            </div>
          </section>
        ) : (
          <EmptyState title="Bạn chưa có đơn đặt" description="Hãy tìm homestay phù hợp và tạo đơn đặt phòng đầu tiên." actionHref="/homestays" actionLabel="Tìm homestay" />
        )}
      </div>
    </main>
  );
}
