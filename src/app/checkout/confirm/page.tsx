import Link from "next/link";
import { ActionButton } from "@/components/action-button";
import { AppTopBar, Stepper } from "@/components/customer-ui";
import { FlashMessage } from "@/components/feedback-state";
import { getHomestay, money } from "@/lib/api";
import { flashFromSearchParams } from "@/lib/flash";
import { createCheckoutAction } from "../actions";

export const dynamic = "force-dynamic";

type CheckoutConfirmParams = {
  homestayId?: string;
  roomId?: string;
  roomIds?: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  guestCount?: string;
  guests?: string;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
  error?: string;
  success?: string;
  [key: string]: string | undefined;
};

function selectedRoomIds(params: CheckoutConfirmParams) {
  if (params.roomIds) return params.roomIds.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function dateFromIso(value?: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function nightsBetween(checkIn?: string, checkOut?: string) {
  const start = dateFromIso(checkIn);
  const end = dateFromIso(checkOut);
  if (!start || !end || end <= start) return 0;
  return Math.ceil((end.getTime() - start.getTime()) / 86_400_000);
}

function formatDate(value?: string) {
  const date = dateFromIso(value);
  return date ? new Intl.DateTimeFormat("vi-VN").format(date) : "Chưa chọn";
}

function positiveGuestCount(value?: string) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? String(number) : undefined;
}

function detailRoomsHref(homestayId?: string, params?: CheckoutConfirmParams, roomIds: string[] = []) {
  if (!homestayId) return "/homestays";
  const query = new URLSearchParams();
  const selectedRooms = roomIds.length ? roomIds : selectedRoomIds(params ?? {});
  if (selectedRooms.length) query.set("roomIds", selectedRooms.join(","));
  if (nightsBetween(params?.checkIn, params?.checkOut) > 0) {
    query.set("checkIn", params?.checkIn ?? "");
    query.set("checkOut", params?.checkOut ?? "");
  }
  const guests = positiveGuestCount(params?.guests ?? params?.guestCount);
  if (guests) query.set("guests", guests);
  return `/homestays/${homestayId}${query.toString() ? `?${query.toString()}` : ""}#rooms`;
}

function serviceSelections(params: CheckoutConfirmParams, roomIds: string[]) {
  return Object.entries(params)
    .filter(([key, value]) => key.startsWith("service:") && Number(value) > 0)
    .map(([key, value]) => {
      const [, maybeRoomId, maybeServiceId] = key.split(":");
      if (maybeServiceId) {
        return { roomId: maybeRoomId, serviceId: maybeServiceId, quantity: Number(value) };
      }
      return { roomId: roomIds[0], serviceId: maybeRoomId, quantity: Number(value) };
    })
    .filter((item) => item.roomId && item.serviceId && Number.isInteger(item.quantity) && item.quantity > 0);
}

function Notice({ message, homestayId, params }: { message: string; homestayId?: string; params?: CheckoutConfirmParams }) {
  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
        <section className="card p-6 text-center md:p-8">
          <p className="eyebrow">Xác nhận</p>
          <h1 className="mt-3 font-heading text-4xl text-[#9a4029]">Cần kiểm tra lại</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#75675f]">{message}</p>
          <a className="btn-primary mt-6" href={detailRoomsHref(homestayId, params)}>Quay lại chọn phòng</a>
        </section>
      </div>
    </main>
  );
}

export default async function CheckoutConfirmPage({ searchParams }: { searchParams: Promise<CheckoutConfirmParams> }) {
  const params = await searchParams;
  const flash = flashFromSearchParams(params);
  const roomIds = selectedRoomIds(params);
  if (!params.homestayId) return <Notice message="Vui lòng chọn homestay trước khi xác nhận đặt phòng." />;
  if (roomIds.length === 0) return <Notice homestayId={params.homestayId} params={params} message="Vui lòng chọn ít nhất một phòng trước khi xác nhận." />;

  const homestay = await getHomestay(params.homestayId, "CUSTOMER");
  const rooms = roomIds.map((roomId) => homestay.rooms.find((room) => room.id === roomId)).filter((room): room is NonNullable<typeof room> => Boolean(room));
  if (rooms.length !== roomIds.length) {
    return <Notice homestayId={homestay.id} params={params} message="Một hoặc nhiều phòng đã chọn không còn khả dụng. Vui lòng chọn lại phòng." />;
  }

  const nights = nightsBetween(params.checkIn, params.checkOut);
  if (nights <= 0) {
    return <Notice homestayId={homestay.id} params={params} message="Vui lòng chọn ngày nhận và ngày trả hợp lệ sau khi chọn phòng." />;
  }
  const guestCount = positiveGuestCount(params.guests ?? params.guestCount);
  if (!guestCount) {
    return <Notice homestayId={homestay.id} params={params} message="Vui lòng nhập số khách hợp lệ sau khi chọn phòng." />;
  }
  const selections = serviceSelections(params, roomIds);
  const selectedServices = selections.map((selection) => {
    const room = rooms.find((item) => item.id === selection.roomId);
    const service = homestay.services.find((item) => item.id === selection.serviceId && item.active !== false && !item.included);
    if (!room || !service) return null;
    return { room, service, quantity: selection.quantity, total: service.unitPrice * selection.quantity };
  }).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const roomTotal = rooms.reduce((sum, room) => sum + room.pricePerNight * nights, 0);
  const serviceTotal = selectedServices.reduce((sum, item) => sum + item.total, 0);
  const taxTotal = Math.round((roomTotal + serviceTotal) * 0.1);
  const grandTotal = roomTotal + serviceTotal + taxTotal;
  const editableKeys = new Set(["guestName", "guestPhone", "guestEmail", "notes", "error", "success"]);
  const preservedEntries = Object.entries(params).filter(([key, value]) => value && !editableKeys.has(key));
  const backParams = new URLSearchParams();
  preservedEntries.forEach(([key, value]) => backParams.set(key, value ?? ""));
  const canCreateBooking = rooms.length === 1;
  const detailBackHref = detailRoomsHref(homestay.id, params, roomIds);
  const servicesBackHref = `/checkout/services?${backParams.toString()}`;

  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_430px]">
          <div>
            <p className="eyebrow">Thanh toán</p>
            <h1 className="mt-2 font-heading text-4xl text-[#9a4029] md:text-5xl">Xác nhận đặt phòng</h1>
            <p className="mt-3 text-[#56423d]">Kiểm tra thông tin phòng, dịch vụ và tổng tiền trước khi thanh toán.</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-[0_18px_55px_rgba(123,41,20,0.08)]">
            <Stepper active={3} />
          </div>
        </div>

        <form action={createCheckoutAction} className="grid gap-6 lg:grid-cols-[1fr_390px]">
          {preservedEntries.map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
          {rooms.length === 1 && <input type="hidden" name="roomId" value={rooms[0].id} />}
          <div className="space-y-6">
            <FlashMessage flash={flash} />
            {!canCreateBooking && (
              <div className="rounded-2xl border border-[#ffdad6] bg-[#fff8f7] p-4 text-sm font-semibold text-[#93000a]" data-testid="multi-room-blocker">
                Hiện hệ thống chỉ hỗ trợ đặt một phòng mỗi lần. Vui lòng quay lại chọn phòng và chỉ giữ lại một phòng để tiếp tục.
              </div>
            )}
            <section className="card p-6 md:p-8">
              <p className="eyebrow">Xác nhận</p>
              <h2 className="mt-2 font-heading text-3xl text-[#7b2914]">Bảng tóm tắt đặt phòng</h2>
              <div className="mt-6 overflow-hidden rounded-2xl border border-[#e8e1d5] bg-white">
                {[
                  ["Homestay", homestay.name],
                  ["Ngày nhận phòng", formatDate(params.checkIn)],
                  ["Ngày trả phòng", formatDate(params.checkOut)],
                  ["Số đêm", `${nights} đêm`],
                  ["Số khách", `${guestCount} khách`],
                  ["Khách đặt", params.guestName ?? ""],
                  ["Điện thoại", params.guestPhone ?? ""],
                  ["Email", params.guestEmail || "Không cung cấp"],
                  ["Ghi chú", params.notes || "Không có"]
                ].map(([label, value]) => (
                  <div className="grid gap-2 border-b border-[#e8e1d5] px-4 py-3 text-sm last:border-b-0 md:grid-cols-[180px_1fr]" key={label}>
                    <span className="font-bold text-[#466550]">{label}</span>
                    <span className="text-[#56423d]">{value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="card p-6 md:p-8">
              <p className="eyebrow">Thông tin khách</p>
              <h2 className="mt-2 font-heading text-3xl text-[#9a4029]">Người đặt phòng</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                  Họ tên
                  <input className="field" name="guestName" defaultValue={params.guestName ?? ""} minLength={2} placeholder="Nguyễn Văn A" required />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                  Số điện thoại
                  <input className="field" name="guestPhone" defaultValue={params.guestPhone ?? ""} inputMode="tel" pattern="(?:\+?84|0)[0-9\s.-]{8,12}" placeholder="0901234567" required />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                  Email <span className="text-xs font-medium text-[#89726c]">(không bắt buộc)</span>
                  <input className="field" name="guestEmail" defaultValue={params.guestEmail ?? ""} inputMode="email" placeholder="ten@email.com" type="email" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                  Ghi chú <span className="text-xs font-medium text-[#89726c]">(không bắt buộc)</span>
                  <textarea className="field min-h-24" name="notes" defaultValue={params.notes ?? ""} placeholder="Ví dụ: cần chuẩn bị cũi em bé, ăn chay..." />
                </label>
              </div>
            </section>

            <section className="card p-6 md:p-8">
              <h2 className="font-heading text-3xl text-[#9a4029]">Phòng đã chọn</h2>
              <div className="mt-5 space-y-3">
                {rooms.map((room) => (
                  <div className="rounded-2xl bg-[#fdf9f4] p-4 text-sm" key={room.id}>
                    <div className="flex justify-between gap-4">
                      <span className="font-bold">{room.name}</span>
                      <strong>{money(room.pricePerNight * nights)}</strong>
                    </div>
                    <p className="mt-1 text-[#75675f]">{money(room.pricePerNight)} / đêm x {nights} đêm</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="card p-6 md:p-8">
              <h2 className="font-heading text-3xl text-[#9a4029]">Dịch vụ đã chọn</h2>
              <div className="mt-5 space-y-3">
                {selectedServices.length ? selectedServices.map(({ room, service, quantity, total }) => (
                  <div className="flex justify-between gap-4 rounded-2xl bg-[#fdf9f4] p-4 text-sm" key={`${room.id}-${service.id}`}>
                    <span>{room.name} · {service.name} · SL {quantity}</span>
                    <strong>{money(total)}</strong>
                  </div>
                )) : <p className="rounded-2xl bg-[#fdf9f4] p-4 text-sm text-[#75675f]">Không chọn dịch vụ bổ sung.</p>}
              </div>
            </section>

            <section className="card p-6 md:p-8">
              <h2 className="font-heading text-3xl text-[#9a4029]">Thanh toán qua ApiPay</h2>
              <div className="mt-5 space-y-4 text-sm leading-6 text-[#56423d]">
                <div className="rounded-2xl border border-[#fff3d6] bg-[#fff8e8] p-4 font-semibold text-[#7a4a12]">
                  Sau khi bấm thanh toán, bạn sẽ được chuyển sang trang thanh toán của ApiPay để hoàn tất giao dịch.
                </div>
                <label className="flex items-start gap-3 rounded-2xl bg-[#fdf9f4] p-4">
                  <input className="mt-1 size-4 accent-[#9a4029]" name="termsAccepted" type="checkbox" required disabled={!canCreateBooking} />
                  <span>Tôi đồng ý với chính sách hủy phòng, điều khoản sử dụng dịch vụ và xác nhận thông tin đặt phòng là chính xác.</span>
                </label>
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-2xl bg-white p-6 shadow-[0_24px_80px_rgba(123,41,20,0.1)] lg:sticky lg:top-28">
            <h2 className="border-b border-[#e8e1d5] pb-4 font-heading text-2xl text-[#1c1c19]">Tóm tắt đơn đặt</h2>
            <p className="mt-5 text-sm text-[#75675f]">{rooms.length} phòng · {nights} đêm · {guestCount} khách</p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><span>Nhận phòng</span><strong data-testid="confirm-check-in-display">{formatDate(params.checkIn)}</strong></div>
              <div className="flex justify-between"><span>Trả phòng</span><strong data-testid="confirm-check-out-display">{formatDate(params.checkOut)}</strong></div>
              <div className="flex justify-between"><span>Tiền phòng</span><strong>{money(roomTotal)}</strong></div>
              <div className="flex justify-between"><span>Dịch vụ</span><strong>{money(serviceTotal)}</strong></div>
              <div className="flex justify-between"><span>Thuế 10%</span><strong>{money(taxTotal)}</strong></div>
              <div className="border-t border-[#e8e1d5] pt-4">
                <div className="flex justify-between text-lg"><span className="font-bold">Tổng cộng</span><strong className="text-[#9a4029]">{money(grandTotal)}</strong></div>
                <p className="mt-1 text-xs text-[#75675f]">Đã bao gồm thuế/phí nếu có</p>
              </div>
            </div>
            {canCreateBooking ? (
              <>
                <ActionButton className="btn-primary mt-6 w-full" pendingLabel="Đang tạo thanh toán...">
                  Thanh toán qua ApiPay
                </ActionButton>
                <Link className="btn-secondary mt-3 w-full" href={servicesBackHref}>Quay lại dịch vụ</Link>
              </>
            ) : (
              <Link className="btn-primary mt-6 w-full" data-testid="back-to-room-selection" href={detailBackHref}>Quay lại chọn phòng</Link>
            )}
          </aside>
        </form>
      </div>
    </main>
  );
}
