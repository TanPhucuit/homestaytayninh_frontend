import type { ReactNode } from "react";
import { ActionButton } from "./action-button";
import { BookingCard, PageShell, StatusBadge } from "./customer-ui";
import { ConfirmActionButton } from "./confirm-action-button";
import { FlashMessage } from "./feedback-state";
import { Booking, Homestay } from "@/lib/types";
import { money } from "@/lib/api";
import { FlashState } from "@/lib/flash";
import { createImageAction, createServiceAction, updateHomestayAction, updateRoomAction, updateServiceAction } from "@/app/owner/actions";
import { OwnerRoomCreateForm } from "./owner-room-create-form";

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

export function OwnerBookingFilters({
  keyword,
  status,
  checkInFrom,
  checkInTo
}: {
  keyword?: string;
  status?: string;
  checkInFrom?: string;
  checkInTo?: string;
}) {
  return (
    <form className="mb-5 grid gap-3 rounded-2xl border border-[#eadfd4] bg-white p-4 shadow-[0_14px_45px_rgba(123,41,20,0.06)] lg:grid-cols-[1fr_180px_170px_170px_auto]" method="get">
      <input className="field" name="q" defaultValue={keyword ?? ""} placeholder="Tìm mã booking, khách, SĐT" />
      <select className="field" name="status" defaultValue={status ?? ""}>
        <option value="">Tất cả trạng thái</option>
        <option value="PENDING">Chờ xác nhận</option>
        <option value="CONFIRMED">Đã xác nhận</option>
        <option value="IN_STAY">Đang trải nghiệm</option>
        <option value="COMPLETED">Đã hoàn thành</option>
        <option value="CANCELLED">Đã hủy</option>
      </select>
      <input className="field" name="checkInFrom" defaultValue={checkInFrom ?? ""} type="date" aria-label="Check-in từ ngày" />
      <input className="field" name="checkInTo" defaultValue={checkInTo ?? ""} type="date" aria-label="Check-in đến ngày" />
      <div className="flex gap-2">
        <button className="btn-primary flex-1 lg:flex-none" type="submit">Lọc</button>
        <a className="btn-secondary flex-1 lg:flex-none" href="/owner">Xóa</a>
      </div>
    </form>
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

function inventoryTotals(homestay: Homestay) {
  const activeRooms = homestay.rooms.filter((room) => room.active !== false);
  if (!activeRooms.length) {
    return {
      activeRooms,
      priceFrom: homestay.priceFrom,
      capacity: homestay.capacity,
      source: "fallback" as const
    };
  }

  return {
    activeRooms,
    priceFrom: Math.min(...activeRooms.map((room) => room.pricePerNight)),
    capacity: activeRooms.reduce((sum, room) => sum + room.capacity * Math.max(1, room.totalUnits || 1), 0),
    source: "rooms" as const
  };
}

export function OwnerInventory({ homestays }: { homestays: Homestay[] }) {
  return (
    <section className="grid gap-5">
      {homestays.map((homestay) => {
        const totals = inventoryTotals(homestay);
        const includedServices = Array.from(
          new Map([...homestay.includedServices, ...homestay.services.filter((service) => service.included)].map((service) => [service.id, service])).values()
        );
        const addOnServices = homestay.services.filter((service) => !service.included);
        const totalsSynced = totals.priceFrom === homestay.priceFrom && totals.capacity === homestay.capacity;

        return (
          <article className="card p-6" key={homestay.id}>
            <div className="flex flex-col justify-between gap-4 lg:flex-row">
              <div className="min-w-0">
                <p className="eyebrow">{homestay.type}</p>
                <h2 className="mt-1 font-heading text-3xl text-[#9a4029]">{homestay.name}</h2>
                <p className="mt-2 text-sm text-[#75675f]">{homestay.location}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-[#fdf9f4] px-4 py-3">
                    <p className="text-xs font-bold uppercase text-[#89726c]">Giá hiển thị</p>
                    <p className="mt-1 font-bold text-[#466550]">{money(totals.priceFrom)}</p>
                  </div>
                  <div className="rounded-xl bg-[#fdf9f4] px-4 py-3">
                    <p className="text-xs font-bold uppercase text-[#89726c]">Sức chứa hiển thị</p>
                    <p className="mt-1 font-bold text-[#466550]">{totals.capacity} khách</p>
                  </div>
                  <div className="rounded-xl bg-[#fdf9f4] px-4 py-3">
                    <p className="text-xs font-bold uppercase text-[#89726c]">Phòng đang bán</p>
                    <p className="mt-1 font-bold text-[#466550]">{totals.activeRooms.length} loại</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-[#75675f]">
                  {totals.source === "rooms"
                    ? "Giá và sức chứa đang được tính từ phòng đang bán. Dùng nút đồng bộ để cập nhật lại trường tổng hợp lưu trên homestay."
                    : "Homestay chưa có phòng đang bán, hệ thống đang dùng giá và sức chứa tạm của homestay."}
                </p>
              </div>
              <div className="h-32 w-full shrink-0 rounded-2xl bg-[#efe7dc] bg-cover bg-center lg:w-52" style={{ backgroundImage: `url(${homestay.imageUrl})` }} aria-label={homestay.name} />
            </div>

            {totals.source === "rooms" && (
              <form action={updateHomestayAction} className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#d7e2da] bg-[#f5fbf6] p-4 sm:flex-row sm:items-center sm:justify-between">
                <input type="hidden" name="homestayId" value={homestay.id} />
                <input type="hidden" name="name" value={homestay.name} />
                <input type="hidden" name="type" value={homestay.type} />
                <input type="hidden" name="location" value={homestay.location} />
                <input type="hidden" name="description" value={homestay.description} />
                <input type="hidden" name="imageUrl" value={homestay.imageUrl} />
                <input type="hidden" name="priceFrom" value={totals.priceFrom} />
                <input type="hidden" name="capacity" value={totals.capacity} />
                <div>
                  <p className="font-bold text-[#466550]">{totalsSynced ? "Giá và sức chứa đã khớp phòng đang bán" : "Cần đồng bộ giá và sức chứa"}</p>
                  <p className="mt-1 text-sm text-[#75675f]">Giá khởi điểm = giá/đêm thấp nhất; sức chứa = sức chứa mỗi phòng/căn x số lượng phòng/căn.</p>
                </div>
                <ActionButton className="btn-secondary w-full sm:w-auto" disabled={totalsSynced} pendingLabel="Đang đồng bộ...">Đồng bộ từ phòng</ActionButton>
              </form>
            )}

            <details className="mt-5 rounded-2xl border border-[#eadfd4] bg-[#fdf9f4] p-4">
              <summary className="cursor-pointer font-bold text-[#466550]">Thông tin homestay</summary>
              <form action={updateHomestayAction} className="mt-4 grid gap-4 md:grid-cols-2">
                <input type="hidden" name="homestayId" value={homestay.id} />
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                  Tên homestay
                  <input className="field" name="name" defaultValue={homestay.name} required />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                  Loại hình
                  <select className="field" name="type" defaultValue={homestay.type}>
                    <option>Phòng</option>
                    <option>Lều</option>
                    <option>Nhà nguyên căn</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                  Vị trí
                  <input className="field" name="location" defaultValue={homestay.location} required />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                  URL hình ảnh chính
                  <input className="field" name="imageUrl" type="url" defaultValue={homestay.imageUrl} required />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                  Giá khởi điểm đang lưu
                  <input className="field" name="priceFrom" type="number" min="0" defaultValue={homestay.priceFrom} required />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                  Sức chứa đang lưu
                  <input className="field" name="capacity" type="number" min="1" defaultValue={homestay.capacity} required />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530] md:col-span-2">
                  Mô tả
                  <textarea className="field min-h-24" name="description" defaultValue={homestay.description} required />
                </label>
                <ActionButton className="btn-primary w-full md:col-span-2" pendingLabel="Đang lưu...">Lưu homestay</ActionButton>
              </form>
            </details>

            <details className="mt-4 rounded-2xl border border-[#eadfd4] bg-white p-4">
              <summary className="cursor-pointer font-bold text-[#466550]">Ảnh</summary>
              <form action={createImageAction} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_120px_auto]">
                <input type="hidden" name="homestayId" value={homestay.id} />
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                  URL hình ảnh mới
                  <input className="field" name="url" type="url" placeholder="https://..." required />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                  Mô tả ảnh
                  <input className="field" name="alt" placeholder="Ví dụ: Sân vườn buổi sáng" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                  Thứ tự
                  <input className="field" name="position" type="number" min="0" defaultValue="1" />
                </label>
                <ActionButton className="btn-secondary w-full self-end" pendingLabel="Đang thêm...">Thêm ảnh</ActionButton>
              </form>
            </details>

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              <details className="rounded-2xl border border-[#eadfd4] bg-white p-4">
                <summary className="cursor-pointer font-bold text-[#466550]">Phòng và giá cố định</summary>
                <OwnerRoomCreateForm homestayId={homestay.id} />

                <div className="mt-5 space-y-3">
                  <h3 className="font-bold text-[#1c1c19]">Phòng hiện có</h3>
                  {homestay.rooms.length ? homestay.rooms.map((room) => (
                    <div className="rounded-xl bg-[#fdf9f4] p-4 text-sm" key={room.id}>
                      <form action={updateRoomAction} className="grid gap-4 md:grid-cols-2">
                        <input type="hidden" name="homestayId" value={homestay.id} />
                        <input type="hidden" name="roomId" value={room.id} />
                        <label className="grid gap-2 font-semibold text-[#3f3530]">
                          Tên phòng/căn
                          <input className="field" name="name" defaultValue={room.name} required />
                        </label>
                        <label className="grid gap-2 font-semibold text-[#3f3530]">
                          Loại phòng/căn
                          <input className="field" name="roomType" defaultValue={room.roomType} required />
                        </label>
                        <label className="grid gap-2 font-semibold text-[#3f3530] md:col-span-2">
                          URL ảnh phòng
                          <input className="field" name="imageUrl" type="url" defaultValue={room.imageUrl ?? ""} placeholder="https://..." />
                        </label>
                        <label className="grid gap-2 font-semibold text-[#3f3530]">
                          Giá cố định/đêm
                          <input className="field" name="pricePerNight" type="number" min="0" defaultValue={room.pricePerNight} required />
                        </label>
                        <label className="grid gap-2 font-semibold text-[#3f3530]">
                          Sức chứa mỗi phòng/căn
                          <input className="field" name="capacity" type="number" min="1" defaultValue={room.capacity} required />
                        </label>
                        <label className="grid gap-2 font-semibold text-[#3f3530]">
                          Số lượng phòng/căn cùng loại
                          <input className="field" name="totalUnits" type="number" min="1" defaultValue={room.totalUnits} required />
                        </label>
                        <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 font-semibold text-[#3f3530]">
                          <input name="active" type="checkbox" defaultChecked={room.active} /> {room.active ? "Đang bán" : "Đang ngừng bán"}
                        </label>
                        <ConfirmActionButton className="btn-secondary w-full md:col-span-2" message={room.active ? "Nếu bỏ chọn Đang bán, phòng sẽ được ngừng bán nhưng không bị xóa. Tiếp tục?" : "Phục hồi phòng này để khách có thể đặt lại?"} pendingLabel="Đang lưu...">Lưu phòng</ConfirmActionButton>
                      </form>
                    </div>
                  )) : (
                    <p className="rounded-xl bg-[#fdf9f4] p-4 text-sm text-[#75675f]">Homestay này chưa có phòng. Thêm phòng ở form phía trên.</p>
                  )}
                </div>
              </details>

              <details className="rounded-2xl border border-[#eadfd4] bg-white p-4">
                <summary className="cursor-pointer font-bold text-[#466550]">Dịch vụ</summary>
                <div className="mt-4 grid gap-4">
                  <form action={createServiceAction} className="grid gap-4 rounded-2xl bg-[#fdf9f4] p-4 md:grid-cols-2">
                    <input type="hidden" name="homestayId" value={homestay.id} />
                    <input type="hidden" name="included" value="off" />
                    <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                      Tên dịch vụ bổ sung
                      <input className="field" name="name" placeholder="Ví dụ: BBQ sân vườn" required />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                      Đơn giá
                      <input className="field" name="unitPrice" type="number" min="0" placeholder="Ví dụ: 250000" required />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-[#3f3530] md:col-span-2">
                      Mô tả
                      <textarea className="field min-h-20" name="description" placeholder="Mô tả ngắn để khách hiểu dịch vụ" />
                    </label>
                    <ActionButton className="btn-primary w-full md:col-span-2" pendingLabel="Đang thêm...">Thêm dịch vụ bổ sung</ActionButton>
                  </form>

                  <form action={createServiceAction} className="grid gap-4 rounded-2xl border border-[#d7e2da] bg-[#f5fbf6] p-4 md:grid-cols-2">
                    <input type="hidden" name="homestayId" value={homestay.id} />
                    <input type="hidden" name="included" value="on" />
                    <input type="hidden" name="unitPrice" value="0" />
                    <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                      Tên dịch vụ đã bao gồm
                      <input className="field" name="name" placeholder="Ví dụ: Wifi, nước uống" required />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                      Mô tả
                      <input className="field" name="description" placeholder="Không tính thêm tiền khi đặt phòng" />
                    </label>
                    <ActionButton className="btn-secondary w-full md:col-span-2" pendingLabel="Đang thêm...">Thêm dịch vụ đã bao gồm</ActionButton>
                  </form>

                  <div className="space-y-3">
                    <h3 className="font-bold text-[#1c1c19]">Dịch vụ bổ sung khách có thể đặt thêm</h3>
                    {addOnServices.length ? addOnServices.map((service) => (
                      <form action={updateServiceAction} className="grid gap-3 rounded-xl bg-[#fdf9f4] p-4 text-sm" key={service.id}>
                        <input type="hidden" name="homestayId" value={homestay.id} />
                        <input type="hidden" name="serviceId" value={service.id} />
                        <input type="hidden" name="included" value="off" />
                        <label className="grid gap-2 font-semibold text-[#3f3530]">
                          Tên dịch vụ
                          <input className="field" name="name" defaultValue={service.name} required />
                        </label>
                        <label className="grid gap-2 font-semibold text-[#3f3530]">
                          Mô tả
                          <textarea className="field min-h-16" name="description" defaultValue={service.description ?? ""} />
                        </label>
                        <label className="grid gap-2 font-semibold text-[#3f3530]">
                          Đơn giá
                          <input className="field" name="unitPrice" type="number" min="0" defaultValue={service.unitPrice} required />
                        </label>
                        <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 font-semibold text-[#3f3530]">
                          <input name="active" type="checkbox" defaultChecked={service.active} /> {service.active ? "Đang bán" : "Đang ngừng bán"}
                        </label>
                        <ConfirmActionButton className="btn-secondary w-full" message={service.active ? "Nếu bỏ chọn Đang bán, dịch vụ sẽ được ngừng bán nhưng không bị xóa. Tiếp tục?" : "Phục hồi dịch vụ này để khách có thể đặt lại?"} pendingLabel="Đang lưu...">Lưu dịch vụ bổ sung</ConfirmActionButton>
                      </form>
                    )) : (
                      <p className="rounded-xl bg-[#fdf9f4] p-4 text-sm text-[#75675f]">Chưa có dịch vụ bổ sung.</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-[#1c1c19]">Dịch vụ đã bao gồm trong giá phòng</h3>
                    {includedServices.length ? includedServices.map((service) => (
                      <form action={updateServiceAction} className="grid gap-3 rounded-xl border border-[#d7e2da] bg-[#f5fbf6] p-4 text-sm" key={service.id}>
                        <input type="hidden" name="homestayId" value={homestay.id} />
                        <input type="hidden" name="serviceId" value={service.id} />
                        <input type="hidden" name="included" value="on" />
                        <input type="hidden" name="unitPrice" value={service.unitPrice} />
                        <label className="grid gap-2 font-semibold text-[#3f3530]">
                          Tên dịch vụ
                          <input className="field" name="name" defaultValue={service.name} required />
                        </label>
                        <label className="grid gap-2 font-semibold text-[#3f3530]">
                          Mô tả
                          <textarea className="field min-h-16" name="description" defaultValue={service.description ?? ""} />
                        </label>
                        <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 font-semibold text-[#3f3530]">
                          <input name="active" type="checkbox" defaultChecked={service.active} /> {service.active ? "Đang hiển thị" : "Đang ẩn"}
                        </label>
                        <ConfirmActionButton className="btn-secondary w-full" message={service.active ? "Ẩn dịch vụ đã bao gồm này khỏi phần hiển thị? Dữ liệu booking cũ không bị xóa." : "Hiển thị lại dịch vụ đã bao gồm này?"} pendingLabel="Đang lưu...">Lưu dịch vụ đã bao gồm</ConfirmActionButton>
                      </form>
                    )) : (
                      <p className="rounded-xl bg-[#f5fbf6] p-4 text-sm text-[#75675f]">Chưa có dịch vụ đã bao gồm.</p>
                    )}
                  </div>
                </div>
              </details>
            </div>
          </article>
        );
      })}
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
