import type { ReactNode } from "react";
import { ActionButton } from "./action-button";
import { BookingCard, PageShell, StatusBadge } from "./customer-ui";
import { ConfirmActionButton } from "./confirm-action-button";
import { FlashMessage } from "./feedback-state";
import { Booking, Homestay } from "@/lib/types";
import { money } from "@/lib/api";
import { FlashState } from "@/lib/flash";
import { createImageAction, createRoomRateAction, updateHomestayAction, updateRoomAction, updateServiceAction } from "@/app/owner/actions";

export function OwnerShell({ title, description, flash, children }: { title: string; description: string; flash?: FlashState | null; children: ReactNode }) {
  return (
    <PageShell eyebrow="Vận hành homestay" title={title} description={description}>
      <div className="mb-5">
        <FlashMessage flash={flash} />
      </div>
      {children}
    </PageShell>
  );
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
  const confirmMessages: Partial<Record<Booking["status"], string>> = {
    CONFIRMED: "Xác nhận booking này? Sau khi xác nhận, khách sẽ thấy đơn ở nhóm sắp tới.",
    COMPLETED: "Xác nhận check-out và chuyển booking sang đã hoàn thành?",
    CANCELLED: "Xác nhận hủy hoặc từ chối booking này?"
  };
  const actionableBookings = bookings.filter((booking) => nextActions[booking.status]?.length);

  return (
    <section className="space-y-4">
      {actionableBookings.length ? actionableBookings.map((booking) => (
        <div className="card p-5" key={booking.id}>
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
            <div>
              <StatusBadge status={booking.status} />
              <h3 className="mt-3 font-heading text-2xl text-[#9a4029]">{homestayById.get(booking.homestayId)?.name ?? booking.homestayId}</h3>
              <p className="mt-1 text-sm text-[#75675f]">{booking.guestName} · {booking.checkIn} → {booking.checkOut} · {money(booking.grandTotal)}</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
              {(nextActions[booking.status] ?? []).map((item) => (
                <form action={action} key={item.status}>
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <input type="hidden" name="status" value={item.status} />
                  {confirmMessages[item.status] ? (
                    <ConfirmActionButton className={item.status === "CANCELLED" ? "btn-secondary" : "btn-primary"} message={confirmMessages[item.status] ?? ""} pendingLabel="Đang cập nhật...">{item.label}</ConfirmActionButton>
                  ) : (
                    <ActionButton className="btn-primary" pendingLabel="Đang cập nhật...">{item.label}</ActionButton>
                  )}
                </form>
              ))}
            </div>
          </div>
        </div>
      )) : (
        <div className="rounded-2xl border border-dashed border-[#dcc0ba] bg-white/70 p-8 text-[#75675f]">Không có booking cần thao tác ngay.</div>
      )}
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
            <div className="h-28 w-full rounded-2xl bg-[#efe7dc] bg-cover bg-center md:w-44" style={{ backgroundImage: `url(${homestay.imageUrl})` }} aria-label={homestay.name} />
          </div>
          <form action={updateHomestayAction} className="mt-5 grid gap-3 rounded-2xl bg-[#fdf9f4] p-4 md:grid-cols-2">
            <input type="hidden" name="homestayId" value={homestay.id} />
            <input className="field" name="name" defaultValue={homestay.name} required />
            <select className="field" name="type" defaultValue={homestay.type}>
              <option>Phòng</option>
              <option>Lều</option>
              <option>Nhà nguyên căn</option>
            </select>
            <input className="field" name="location" defaultValue={homestay.location} required />
            <input className="field" name="priceFrom" type="number" min="0" defaultValue={homestay.priceFrom} required />
            <input className="field" name="capacity" type="number" min="1" defaultValue={homestay.capacity} required />
            <input className="field" name="imageUrl" type="url" defaultValue={homestay.imageUrl} required />
            <textarea className="field min-h-20 md:col-span-2" name="description" defaultValue={homestay.description} required />
            <ActionButton className="btn-primary justify-self-start" pendingLabel="Đang lưu...">Lưu homestay</ActionButton>
          </form>
          <form action={createImageAction} className="mt-4 grid gap-3 rounded-2xl bg-white p-4 md:grid-cols-[1fr_1fr_120px_auto]">
            <input type="hidden" name="homestayId" value={homestay.id} />
            <input className="field" name="url" type="url" placeholder="URL hình ảnh mới" required />
            <input className="field" name="alt" placeholder="Mô tả ảnh" />
            <input className="field" name="position" type="number" min="0" defaultValue="1" />
            <ActionButton className="btn-secondary" pendingLabel="Đang thêm...">Thêm ảnh</ActionButton>
          </form>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="font-bold text-[#466550]">Phòng</h3>
              <div className="mt-2 space-y-2">
                {homestay.rooms.map((room) => (
                  <div className="rounded-xl bg-[#fdf9f4] p-4 text-sm" key={room.id}>
                    <form action={updateRoomAction} className="grid gap-2 md:grid-cols-2">
                      <input type="hidden" name="homestayId" value={homestay.id} />
                      <input type="hidden" name="roomId" value={room.id} />
                      <input className="field" name="name" defaultValue={room.name} required />
                      <input className="field" name="roomType" defaultValue={room.roomType} required />
                      <input className="field" name="imageUrl" type="url" defaultValue={room.imageUrl ?? ""} placeholder="URL ảnh phòng" />
                      <input className="field" name="pricePerNight" type="number" min="0" defaultValue={room.pricePerNight} required />
                      <input className="field" name="capacity" type="number" min="1" defaultValue={room.capacity} required />
                      <input className="field" name="totalUnits" type="number" min="1" defaultValue={room.totalUnits} required />
                      <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm"><input name="active" type="checkbox" defaultChecked={room.active} /> {room.active ? "Đang bán" : "Đang ngừng bán"}</label>
                      <ConfirmActionButton className="btn-secondary justify-self-start" message={room.active ? "Nếu bỏ chọn Đang bán, phòng sẽ được ngừng bán nhưng không bị xóa. Tiếp tục?" : "Phục hồi phòng này để khách có thể đặt lại?"} pendingLabel="Đang lưu...">Lưu phòng</ConfirmActionButton>
                    </form>
                    <form action={createRoomRateAction} className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
                      <input type="hidden" name="homestayId" value={homestay.id} />
                      <input type="hidden" name="roomId" value={room.id} />
                      <input className="field" name="startDate" type="date" required />
                      <input className="field" name="endDate" type="date" required />
                      <input className="field" name="pricePerNight" type="number" min="0" placeholder="Giá theo ngày" required />
                      <ActionButton className="btn-secondary" pendingLabel="Đang thêm...">Thêm giá</ActionButton>
                    </form>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-[#466550]">Dịch vụ</h3>
              <div className="mt-2 space-y-2">
                {[...homestay.includedServices, ...homestay.services].map((service) => (
                  <form action={updateServiceAction} className="grid gap-2 rounded-xl bg-[#fdf9f4] p-4 text-sm" key={service.id}>
                    <input type="hidden" name="homestayId" value={homestay.id} />
                    <input type="hidden" name="serviceId" value={service.id} />
                    <input className="field" name="name" defaultValue={service.name} required />
                    <textarea className="field min-h-16" name="description" defaultValue={service.description ?? ""} />
                    <input className="field" name="unitPrice" type="number" min="0" defaultValue={service.unitPrice} required />
                    <label className="flex items-center gap-2"><input name="included" type="checkbox" defaultChecked={service.included} /> Bao gồm</label>
                    <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2"><input name="active" type="checkbox" defaultChecked={service.active} /> {service.active ? "Đang bán" : "Đang ngừng bán"}</label>
                    <ConfirmActionButton className="btn-secondary justify-self-start" message={service.active ? "Nếu bỏ chọn Đang bán, dịch vụ sẽ được ngừng bán nhưng không bị xóa. Tiếp tục?" : "Phục hồi dịch vụ này để khách có thể đặt lại?"} pendingLabel="Đang lưu...">Lưu dịch vụ</ConfirmActionButton>
                  </form>
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
