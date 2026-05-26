import Link from "next/link";
import { PaymentBadge, StatusBadge, statusGroup } from "@/components/customer-ui";
import { EmptyState } from "@/components/feedback-state";
import { getBookings, getHomestays, money } from "@/lib/api";

export const dynamic = "force-dynamic";

const groups = ["Sắp tới", "Đang trải nghiệm", "Đã hoàn thành", "Đã hủy"];

export default async function BookingsPage() {
  const [bookings, homestays] = await Promise.all([getBookings("CUSTOMER"), getHomestays("CUSTOMER")]);
  const homestayById = new Map(homestays.map((homestay) => [homestay.id, homestay]));
  const activeGroup = bookings.some((booking) => booking.status === "IN_STAY") ? "Đang trải nghiệm" : "Sắp tới";
  const activeBookings = bookings.filter((booking) => statusGroup(booking.status) === activeGroup);
  const otherBookings = bookings.filter((booking) => statusGroup(booking.status) !== activeGroup);

  return (
    <main className="min-h-screen text-[#1c1c19]">
      <header className="border-b border-[#dcc0ba] bg-[#fdf9f4]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="font-heading text-3xl font-bold text-[#7b2914]">Terra & Leaf</Link>
          <nav className="hidden gap-8 text-sm font-semibold text-[#56423d] md:flex">
            <Link href="/homestays">Khám phá</Link>
            <Link href="/bookings" className="text-[#9a4029]">Chuyến đi</Link>
            <Link href="/login">Tài khoản</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <h1 className="mb-6 font-heading text-4xl text-[#9a4029] md:text-5xl">Chuyến đi của bạn</h1>
        <div className="mb-10 flex gap-8 overflow-x-auto border-b border-[#dcc0ba]">
          {groups.map((group) => (
            <span className={`whitespace-nowrap pb-3 text-sm font-bold ${group === activeGroup ? "border-b-2 border-[#9a4029] text-[#9a4029]" : "text-[#75675f]"}`} key={group}>
              {group}
            </span>
          ))}
        </div>

        {bookings.length ? (
          <div className="space-y-16">
            <section>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="eyebrow">Booking Status</p>
                  <h2 className="mt-2 font-heading text-3xl text-[#1c1c19]">{activeGroup}</h2>
                </div>
                <span className="rounded-full bg-[#e8f0eb] px-4 py-2 text-sm font-bold text-[#466550]">{activeBookings.length} đơn</span>
              </div>
              <div className="grid gap-5">
                {activeBookings.length ? activeBookings.map((booking) => {
                  const homestay = homestayById.get(booking.homestayId);
                  return (
                    <article className="overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(123,41,20,0.1)] md:grid md:grid-cols-[340px_1fr]" key={booking.id}>
                      <div className="min-h-72 bg-cover bg-center" style={{ backgroundImage: `url(${homestay?.imageUrl ?? ""})` }} />
                      <div className="p-6">
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge status={booking.status} />
                          {booking.payment?.status && <PaymentBadge status={booking.payment.status} />}
                        </div>
                        <h2 className="mt-4 font-heading text-3xl text-[#1c1c19]">{homestay?.name ?? booking.homestayId}</h2>
                        <p className="mt-2 text-sm text-[#75675f]">{booking.checkIn} - {booking.checkOut} · {booking.guestCount} khách</p>
                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                          <div className="rounded-2xl bg-[#fdf9f4] p-4">
                            <h3 className="font-heading text-xl text-[#9a4029]">Chi tiết đặt phòng</h3>
                            <p className="mt-2 text-sm text-[#56423d]">Khách: {booking.guestName}</p>
                            <p className="text-sm text-[#56423d]">SĐT: {booking.guestPhone}</p>
                          </div>
                          <div className="rounded-2xl bg-[#fdf9f4] p-4">
                            <h3 className="font-heading text-xl text-[#9a4029]">Dịch vụ & Tiện ích</h3>
                            <p className="mt-2 text-sm text-[#56423d]">{booking.services.length} dịch vụ đặt thêm</p>
                            <p className="font-bold text-[#466550]">{money(booking.grandTotal)}</p>
                          </div>
                        </div>
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                          <Link className="btn-primary flex-1" href={`/bookings/${booking.id}`}>Xem chi tiết</Link>
                          <Link className="btn-secondary flex-1" href={`/payment/result?bookingId=${booking.id}`}>Kiểm tra thanh toán</Link>
                        </div>
                      </div>
                    </article>
                  );
                }) : (
                  <div className="rounded-3xl border border-dashed border-[#dcc0ba] bg-white/70 p-8 text-[#75675f]">Chưa có booking trong nhóm này.</div>
                )}
              </div>
            </section>

            <section>
              <h2 className="mb-6 font-heading text-3xl text-[#9a4029]">Chuyến đi khác</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {otherBookings.map((booking) => {
                  const homestay = homestayById.get(booking.homestayId);
                  return (
                    <Link className="rounded-3xl bg-white p-5 shadow-[0_16px_45px_rgba(123,41,20,0.07)]" href={`/bookings/${booking.id}`} key={booking.id}>
                      <StatusBadge status={booking.status} />
                      <h3 className="mt-3 font-heading text-2xl text-[#1c1c19]">{homestay?.name ?? booking.homestayId}</h3>
                      <p className="mt-1 text-sm text-[#75675f]">{booking.checkIn} - {booking.checkOut} · {booking.guestCount} khách</p>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        ) : (
          <EmptyState title="Bạn chưa có booking" description="Hãy tìm homestay phù hợp và tạo đơn đặt phòng đầu tiên." actionHref="/homestays" actionLabel="Tìm homestay" />
        )}
      </div>
    </main>
  );
}
