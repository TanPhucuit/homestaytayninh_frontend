"use client";

import { useEffect, useMemo, useState } from "react";
import type { Room } from "@/lib/types";

type SelectableRoom = Pick<Room, "id" | "name" | "roomType" | "pricePerNight" | "capacity"> & {
  area: string;
  description: string;
  thumbnail: string;
};

type RoomSelectionCheckoutProps = {
  homestayId: string;
  rooms: SelectableRoom[];
  initialRoomIds?: string[];
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests: string;
};

const money = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

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

function validInitialRoomIds(roomIds: string[] | undefined, rooms: SelectableRoom[]) {
  const availableIds = new Set(rooms.map((room) => room.id));
  return (roomIds ?? []).filter((roomId, index, values) => availableIds.has(roomId) && values.indexOf(roomId) === index);
}

function formatDate(value?: string) {
  const date = dateFromIso(value);
  return date ? new Intl.DateTimeFormat("vi-VN").format(date) : "Chưa chọn";
}

export function RoomSelectionCheckout({ homestayId, rooms, initialRoomIds, initialCheckIn, initialCheckOut, initialGuests }: RoomSelectionCheckoutProps) {
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>(() => validInitialRoomIds(initialRoomIds, rooms));
  const [checkIn, setCheckIn] = useState(initialCheckIn ?? "");
  const [checkOut, setCheckOut] = useState(initialCheckOut ?? "");
  const [guests, setGuests] = useState(initialGuests || "2");
  const [message, setMessage] = useState("");

  const selectedRooms = useMemo(() => rooms.filter((room) => selectedRoomIds.includes(room.id)), [rooms, selectedRoomIds]);
  const numberOfNights = nightsBetween(checkIn, checkOut);
  const datesValid = numberOfNights > 0;
  const roomTotal = datesValid ? selectedRooms.reduce((sum, room) => sum + room.pricePerNight * numberOfNights, 0) : 0;
  const taxTotal = Math.round(roomTotal * 0.1);
  const grandTotal = roomTotal + taxTotal;
  const canClickContinue = selectedRooms.length > 0 && datesValid;
  const buttonLabel = selectedRooms.length === 0
    ? "Chọn phòng để tiếp tục"
    : !datesValid
        ? "Chọn ngày hợp lệ để tiếp tục"
        : "Tiếp tục thanh toán";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedRoomIds.length) {
      params.set("roomIds", selectedRoomIds.join(","));
    } else {
      params.delete("roomIds");
    }
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", guests);
    params.delete("guestCount");
    const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }, [checkIn, checkOut, guests, selectedRoomIds]);

  function toggleRoom(roomId: string) {
    setMessage("");
    setSelectedRoomIds((current) => current.includes(roomId) ? current.filter((id) => id !== roomId) : [...current, roomId]);
  }

  function continueToCheckout() {
    if (selectedRooms.length === 0) {
      setMessage("Vui lòng chọn ít nhất một phòng để tiếp tục.");
      return;
    }
    if (!datesValid) {
      setMessage("Ngày trả phòng phải sau ngày nhận phòng.");
      return;
    }
    const params = new URLSearchParams({
      homestayId,
      roomIds: selectedRoomIds.join(","),
      checkIn,
      checkOut,
      guests
    });
    window.location.href = `/checkout/services?${params.toString()}`;
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_390px] lg:items-start" id="rooms">
      <div>
        <p className="eyebrow">Lựa chọn không gian</p>
        <h2 className="mt-2 font-heading text-3xl text-[#1c1c19]">Chọn phòng của bạn</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75675f]">
          Có thể chọn nhiều phòng để xem tổng dự kiến, sau đó chọn dịch vụ đi kèm cho từng phòng.
        </p>
        <div className="mt-6 space-y-5">
          {rooms.map((room) => {
            const selected = selectedRoomIds.includes(room.id);
            return (
              <article
                className={`group grid gap-5 rounded-2xl border bg-white p-4 shadow-[0_14px_45px_rgba(123,41,20,0.06)] transition md:grid-cols-[220px_1fr] ${
                  selected ? "border-[#9a4029] bg-[#fff8f5] ring-2 ring-[#9a4029]/12" : "border-[#dcc0ba] hover:border-[#9a4029]"
                }`}
                data-testid={`room-card-${room.id}`}
                key={room.id}
              >
                <div className="image-shell aspect-[4/3] overflow-hidden rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${room.thumbnail})` }} />
                <div className="flex min-w-0 flex-col justify-between">
                  <div>
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <h3 className="font-heading text-2xl text-[#1c1c19]">{room.name}</h3>
                      {selected && <span className="w-fit rounded-full bg-[#ffdad2] px-3 py-1 text-xs font-bold text-[#7b2914]">Đã chọn</span>}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-[#75675f]">
                      <span>{room.capacity} khách</span>
                      <span>{room.roomType}</span>
                      <span>{room.area}</span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#56423d]">{room.description}</p>
                  </div>
                  <div className="mt-5 flex flex-col justify-between gap-3 border-t border-[#e8e1d5] pt-4 sm:flex-row sm:items-end">
                    <div>
                      <p className="text-xs font-bold uppercase text-[#89726c]">Giá mỗi đêm</p>
                      <p className="font-heading text-2xl font-bold text-[#9a4029]">{money(room.pricePerNight)}</p>
                    </div>
                    <button
                      className={selected ? "btn-secondary border-[#9a4029]/40 text-[#9a4029]" : "btn-primary"}
                      data-testid={`toggle-room-${room.id}`}
                      onClick={() => toggleRoom(room.id)}
                      type="button"
                    >
                      {selected ? "Bỏ chọn" : "Chọn phòng"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-[#dcc0ba] bg-white p-6 shadow-[0_24px_80px_rgba(123,41,20,0.1)] lg:sticky lg:top-28">
        <h2 className="font-heading text-2xl text-[#1c1c19]">Tóm tắt đặt phòng</h2>
        <div className="mt-5 grid gap-3">
          <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#89726c]">
            Nhận phòng
            <input className="field" data-testid="summary-check-in" onChange={(event) => setCheckIn(event.target.value)} type="date" value={checkIn} />
          </label>
          <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#89726c]">
            Trả phòng
            <input className="field" data-testid="summary-check-out" onChange={(event) => setCheckOut(event.target.value)} type="date" value={checkOut} />
          </label>
          <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#89726c]">
            Số khách
            <input className="field" data-testid="summary-guests" min="1" onChange={(event) => setGuests(event.target.value)} type="number" value={guests} />
          </label>
        </div>

        <div className="mt-5 border-t border-[#e8e1d5] pt-5">
          {selectedRooms.length === 0 ? (
            <div className="rounded-2xl bg-[#fdf9f4] p-4 text-sm font-semibold text-[#75675f]" data-testid="selected-empty">
              Chưa chọn phòng
            </div>
          ) : (
            <div className="space-y-3" data-testid="selected-room-list">
              {selectedRooms.map((room) => {
                const total = datesValid ? room.pricePerNight * numberOfNights : 0;
                return (
                  <div className="rounded-2xl bg-[#fdf9f4] p-4 text-sm" data-testid="selected-room-row" key={room.id}>
                    <div className="flex justify-between gap-3">
                      <span className="font-bold text-[#1c1c19]">{room.name}</span>
                      <strong className="text-[#9a4029]">{money(total)}</strong>
                    </div>
                    <p className="mt-1 text-[#75675f]">{money(room.pricePerNight)} / đêm x {numberOfNights} đêm</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {message && (
          <div className="mt-4 rounded-2xl border border-[#ffdad6] bg-[#fff8f7] p-4 text-sm font-semibold text-[#93000a]" data-testid="room-selection-message">
            {message}
          </div>
        )}

        <div className="mt-5 space-y-3 border-t border-[#e8e1d5] pt-5 text-sm text-[#56423d]">
          <div className="flex justify-between gap-4"><span>Nhận phòng</span><strong data-testid="summary-check-in-display">{formatDate(checkIn)}</strong></div>
          <div className="flex justify-between gap-4"><span>Trả phòng</span><strong data-testid="summary-check-out-display">{formatDate(checkOut)}</strong></div>
          <div className="flex justify-between gap-4"><span>Số khách</span><strong data-testid="summary-guests-display">{guests || "0"}</strong></div>
          <div className="flex justify-between gap-4"><span>Số đêm</span><strong data-testid="summary-nights">{numberOfNights}</strong></div>
          <div className="flex justify-between gap-4"><span>Tổng tiền phòng</span><strong data-testid="summary-room-total">{money(roomTotal)}</strong></div>
          <div className="flex justify-between gap-4"><span>Thuế/phụ phí 10%</span><strong data-testid="summary-tax-total">{money(taxTotal)}</strong></div>
          <div className="flex justify-between gap-4 border-t border-[#e8e1d5] pt-4 text-lg">
            <span className="font-heading font-bold text-[#1c1c19]">Tổng thanh toán</span>
            <strong className="font-heading text-[#9a4029]" data-testid="summary-grand-total">{money(grandTotal)}</strong>
          </div>
        </div>

        <button
          className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-55"
          data-testid="continue-checkout"
          disabled={!canClickContinue}
          onClick={continueToCheckout}
          type="button"
        >
          {buttonLabel}
        </button>
        <p className="mt-4 text-center text-xs text-[#75675f]">Tổng tiền cập nhật khi chọn phòng hoặc đổi ngày.</p>
      </aside>
    </section>
  );
}
