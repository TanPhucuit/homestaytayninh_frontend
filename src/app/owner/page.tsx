import { AccessDenied } from "@/components/access-denied";
import { BookingCard } from "@/components/booking-card";
import { BookingServicesDisplay } from "@/components/booking-services-display";
import { ToastActionButton } from "@/components/toast-action";
import { AdminShell, MetricCard, Pill } from "@/components/ui";
import { getBookings, getHomestays, money } from "@/lib/api";
import { canAccess, getCurrentUser } from "@/lib/rbac";

export default async function OwnerPage() {
  const user = await getCurrentUser();
  const allowed = ["OWNER", "OWNER_STAFF", "ADMIN"] as const;

  if (!canAccess(user.role, [...allowed])) {
    return <AccessDenied role={user.role} allowed={[...allowed]} />;
  }

  const [allHomestays, allBookings] = await Promise.all([getHomestays(), getBookings(user.role)]);
  const homestays = user.role === "ADMIN" ? allHomestays : allHomestays.filter((homestay) => homestay.ownerId === "u-owner");
  const homestayIds = new Set(homestays.map((homestay) => homestay.id));
  const bookings = user.role === "ADMIN" ? allBookings : allBookings.filter((booking) => homestayIds.has(booking.homestayId));

  return (
    <AdminShell active="Dashboard" title="Vận hành homestay" role={user.role}>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Doanh thu tháng" value="124.5M ₫" note="Theo homestay được phân quyền" />
        <MetricCard label="Booking chờ" value={`${bookings.filter((item) => item.status === "PENDING").length}`} note="Cần xác nhận" />
        <MetricCard label="Tỷ lệ lấp đầy" value="85%" note="Mục tiêu 90%" />
        <MetricCard label="Dịch vụ đang chuẩn bị" value={`${bookings.flatMap((item) => item.services).filter((item) => item.status === "PREPARING").length}`} note="PREPARING" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card p-5">
          <h2 className="text-2xl font-bold text-[#466550]">Homestay trong phạm vi quản lý</h2>
          <div className="mt-4 space-y-3">
            {homestays.length === 0 ? (
              <div className="rounded-2xl bg-white p-4 text-sm text-[#75675f]">Không có homestay nào thuộc quyền của tài khoản hiện tại.</div>
            ) : (
              homestays.map((homestay) => (
                <div key={homestay.id} className="rounded-2xl bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{homestay.name}</p>
                      <p className="text-sm text-[#75675f]">{homestay.location}</p>
                    </div>
                    <Pill>Active</Pill>
                  </div>
                  <p className="mt-3 text-sm text-[#75675f]">{money(homestay.priceFrom)}/đêm</p>
                  <p className="mt-2 text-xs text-[#466550]">
                    {homestay.rooms.length} phòng · {homestay.services.length} dịch vụ add-on · ownerId {homestay.ownerId}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-4 lg:col-span-2">
          <div className="card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-[#466550]">Đặt phòng hộ khách hàng</h2>
              <Pill tone="clay">OWNER_STAFF</Pill>
            </div>
            <p className="mt-2 text-sm text-[#75675f]">
              Owner Staff được xem booking và dịch vụ liên quan đến homestay được phân quyền, tạo booking hộ, check-in/out và thêm dịch vụ khi booking đang IN_STAY.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {["Khách hàng hoặc khách vãng lai", "Homestay/phòng/ngày ở", "Dịch vụ đặt thêm", "Pay later / Manual paid / ApiPay link"].map((field) => (
                <div key={field} className="field text-sm">
                  {field}
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {["Tạo đơn hộ", "Xác nhận", "Check-in", "Thêm dịch vụ", "Check-out"].map((action) => (
                <ToastActionButton key={action} className="btn-secondary" message={`${action} thành công trong demo state`}>
                  {action}
                </ToastActionButton>
              ))}
            </div>
          </div>

          <div className="table-card">
            <div className="hidden grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-2 border-b border-[#eadfd3] bg-[#fdf9f4] p-4 text-xs font-bold uppercase tracking-wide text-[#75675f] md:grid">
              <span>Mã đơn</span>
              <span>Khách</span>
              <span>Phòng</span>
              <span>Thanh toán</span>
              <span>Hành động</span>
            </div>
            {bookings.length === 0 ? (
              <div className="p-4 text-sm text-[#75675f]">Không có booking liên quan đến homestay được phân quyền.</div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="grid gap-2 border-b border-[#eadfd3] p-4 text-sm last:border-b-0 md:grid-cols-[1fr_1fr_1fr_1fr_1fr]">
                  <strong>{booking.id}</strong>
                  <span>
                    <span className="font-bold text-[#75675f] md:hidden">Khách: </span>
                    {booking.guestName}
                  </span>
                  <span>
                    <span className="font-bold text-[#75675f] md:hidden">Homestay: </span>
                    {booking.homestayId}
                  </span>
                  <span>
                    <span className="font-bold text-[#75675f] md:hidden">Thanh toán: </span>
                    {booking.payment?.status}
                  </span>
                  <span>
                    <span className="font-bold text-[#75675f] md:hidden">Hành động: </span>
                    Xác nhận / Check-out
                  </span>
                </div>
              ))
            )}
          </div>

          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}

          {bookings[0] && (
            <div className="rounded-2xl border border-[#9a4029]/20 bg-[#fffaf4] p-1">
              <div className="px-5 py-4">
                <p className="eyebrow">Owner Staff Detail</p>
                <h2 className="mt-2 text-2xl font-bold text-[#466550]">Chi tiết dịch vụ và chi phí đơn {bookings[0].id}</h2>
                <p className="mt-1 text-sm text-[#75675f]">Panel này phục vụ Owner Staff khi xác nhận dịch vụ, cập nhật PREPARING/SERVED và đối soát tổng tiền.</p>
              </div>
              <BookingServicesDisplay booking={bookings[0]} audience="owner-staff" />
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
