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
  const sanitizedInitialRoomIds = validInitialRoomIds(initialRoomIds, rooms);
  const hasInitialSelection = sanitizedInitialRoomIds.length > 0;
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>(() => sanitizedInitialRoomIds);
  const [checkIn, setCheckIn] = useState(hasInitialSelection ? (initialCheckIn ?? "") : "");
  const [checkOut, setCheckOut] = useState(hasInitialSelection ? (initialCheckOut ?? "") : "");
  const [guests, setGuests] = useState(hasInitialSelection ? (initialGuests || "") : "");
  const [message, setMessage] = useState("");
  const [isReady, setIsReady] = useState(false);

  const selectedRooms = useMemo(() => rooms.filter((room) => selectedRoomIds.includes(room.id)), [rooms, selectedRoomIds]);
  const numberOfNights = nightsBetween(checkIn, checkOut);
  const datesValid = numberOfNights > 0;
  const guestCount = Number(guests);
  const guestsValid = Number.isInteger(guestCount) && guestCount > 0;
  const selectedCapacity = selectedRooms.reduce((sum, room) => sum + room.capacity, 0);
  const guestsFitCapacity = !guestsValid || selectedRooms.length === 0 || guestCount <= selectedCapacity;
  const roomTotal = datesValid ? selectedRooms.reduce((sum, room) => sum + room.pricePerNight * numberOfNights, 0) : 0;
  const taxTotal = Math.round(roomTotal * 0.1);
  const grandTotal = roomTotal + taxTotal;
  const canClickContinue = isReady && selectedRooms.length > 0 && datesValid && guestsValid && guestsFitCapacity;
  const buttonLabel = selectedRooms.length === 0
    ? "Chọn phòng để tiếp tục"
    : !datesValid
        ? "Chọn ngày hợp lệ để tiếp tục"
        : !guestsValid
            ? "Nhập số khách để tiếp tục"
            : !guestsFitCapacity
                ? "Số khách vượt sức chứa"
                : "Tiếp tục thanh toán";

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const params = new URLSearchParams();
    if (selectedRoomIds.length) {
      params.set("roomIds", selectedRoomIds.join(","));
      if (checkIn) params.set("checkIn", checkIn);
      if (checkOut) params.set("checkOut", checkOut);
      if (guests) params.set("guests", guests);
    }
    const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }, [checkIn, checkOut, guests, isReady, selectedRoomIds]);

  function toggleRoom(roomId: string) {
    setMessage("");
    const nextRoomIds = selectedRoomIds.includes(roomId) ? selectedRoomIds.filter((id) => id !== roomId) : [...selectedRoomIds, roomId];
    if (nextRoomIds.length === 0) {
      setCheckIn("");
      setCheckOut("");
      setGuests("");
    }
    setSelectedRoomIds(nextRoomIds);
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
    if (!guestsValid) {
      setMessage("Vui lòng nhập số khách hợp lệ.");
      return;
    }
    if (!guestsFitCapacity) {
      setMessage("Số khách vượt quá sức chứa của phòng đã chọn.");
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
    <section className="grid scroll-mt-28 gap-10 lg:grid-cols-[1fr_400px] lg:items-start" id="rooms">
      <div>
        <p className="eyebrow">Lựa chọn không gian</p>
        <h2 className="mt-4 font-heading text-3xl text-ink md:text-4xl">Chọn phòng của bạn</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Có thể chọn nhiều phòng để xem tổng dự kiến, sau đó chọn dịch vụ đi kèm cho từng phòng.
        </p>
        <div className="mt-6 space-y-5">
          {rooms.map((room) => {
            const selected = selectedRoomIds.includes(room.id);
            return (
              <article
                className={`group grid gap-5 rounded-[26px] border bg-white p-4 transition duration-500 md:grid-cols-[230px_1fr] ${
                  selected ? "border-brand bg-brand-wash shadow-lift ring-4 ring-brand/10" : "border-line-soft shadow-card hover:-translate-y-0.5 hover:shadow-lift"
                }`}
                data-testid={`room-card-${room.id}`}
                key={room.id}
              >
                <div className="image-shell aspect-[4/3] overflow-hidden rounded-[18px] bg-cover bg-center transition duration-700 group-hover:scale-[1.02]" style={{ backgroundImage: `url(${room.thumbnail})` }} />
                <div className="flex min-w-0 flex-col justify-between">
                  <div>
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <h3 className="font-heading text-2xl text-ink">{room.name}</h3>
                      {selected && <span className="w-fit rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">Đã chọn</span>}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-muted">
                      <span>{room.capacity} khách</span>
                      <span>{room.roomType}</span>
                      <span>{room.area}</span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink-muted">{room.description}</p>
                  </div>
                  <div className="mt-5 flex flex-col justify-between gap-3 border-t border-line-soft pt-4 sm:flex-row sm:items-end">
                    <div>
                      <p className="text-xs font-bold uppercase text-subtle">Giá mỗi đêm</p>
                      <p className="font-heading text-2xl text-ink">{money(room.pricePerNight)}</p>
                    </div>
                    <button
                      className={`${selected ? "btn-secondary border-brand/40 text-brand" : "btn-primary"} disabled:cursor-not-allowed disabled:opacity-55`}
                      data-testid={`toggle-room-${room.id}`}
                      disabled={!isReady}
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

      <aside className="h-fit overflow-hidden rounded-[28px] border border-line-soft bg-white shadow-lift lg:sticky lg:top-28">
        <div className="bg-bark px-6 py-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Đặt phòng</p>
          <h2 className="mt-1 font-heading text-2xl">Tóm tắt đặt phòng</h2>
        </div>
        <div className="p-6">
        <div className="grid gap-3">
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
            Nhận phòng
            <input
              className="field disabled:cursor-not-allowed disabled:bg-sand-deep disabled:text-subtle"
              data-testid="summary-check-in"
              disabled={!isReady || selectedRooms.length === 0}
              onChange={(event) => setCheckIn(event.target.value)}
              type="date"
              value={checkIn}
            />
          </label>
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
            Trả phòng
            <input
              className="field disabled:cursor-not-allowed disabled:bg-sand-deep disabled:text-subtle"
              data-testid="summary-check-out"
              disabled={!isReady || selectedRooms.length === 0}
              min={checkIn || undefined}
              onChange={(event) => setCheckOut(event.target.value)}
              type="date"
              value={checkOut}
            />
          </label>
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
            Số khách
            <input
              className="field disabled:cursor-not-allowed disabled:bg-sand-deep disabled:text-subtle"
              data-testid="summary-guests"
              disabled={!isReady || selectedRooms.length === 0}
              max={selectedCapacity || undefined}
              min="1"
              onChange={(event) => setGuests(event.target.value)}
              placeholder="Nhập số khách"
              type="number"
              value={guests}
            />
          </label>
        </div>

        <div className="mt-5 border-t border-line-soft pt-5">
          {selectedRooms.length === 0 ? (
            <div className="rounded-2xl bg-cream p-4 text-sm font-semibold text-muted" data-testid="selected-empty">
              Chưa chọn phòng
              <p className="mt-1 text-xs font-medium">Chọn phòng trước, sau đó nhập ngày lưu trú và số khách.</p>
            </div>
          ) : (
            <div className="space-y-3" data-testid="selected-room-list">
              {selectedRooms.map((room) => {
                const total = datesValid ? room.pricePerNight * numberOfNights : 0;
                return (
                  <div className="rounded-2xl bg-cream p-4 text-sm" data-testid="selected-room-row" key={room.id}>
                    <div className="flex justify-between gap-3">
                      <span className="font-bold text-ink">{room.name}</span>
                      <strong className="text-brand">{money(total)}</strong>
                    </div>
                    <p className="mt-1 text-muted">{money(room.pricePerNight)} / đêm x {numberOfNights} đêm</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {message && (
          <div className="mt-4 rounded-2xl border border-danger-soft bg-brand-wash p-4 text-sm font-semibold text-danger" data-testid="room-selection-message">
            {message}
          </div>
        )}

        <div className="mt-5 space-y-3 border-t border-line-soft pt-5 text-sm text-ink-muted">
          <div className="flex justify-between gap-4"><span>Nhận phòng</span><strong data-testid="summary-check-in-display">{formatDate(checkIn)}</strong></div>
          <div className="flex justify-between gap-4"><span>Trả phòng</span><strong data-testid="summary-check-out-display">{formatDate(checkOut)}</strong></div>
          <div className="flex justify-between gap-4"><span>Số khách</span><strong data-testid="summary-guests-display">{guests || "Chưa nhập"}</strong></div>
          <div className="flex justify-between gap-4"><span>Số đêm</span><strong data-testid="summary-nights">{numberOfNights}</strong></div>
          <div className="flex justify-between gap-4"><span>Tổng tiền phòng</span><strong data-testid="summary-room-total">{money(roomTotal)}</strong></div>
          <div className="flex justify-between gap-4"><span>Thuế/phụ phí 10%</span><strong data-testid="summary-tax-total">{money(taxTotal)}</strong></div>
          <div className="flex justify-between gap-4 border-t border-line-soft pt-4 text-lg">
            <span className="font-heading font-bold text-ink">Tổng thanh toán</span>
            <strong className="font-heading text-brand" data-testid="summary-grand-total">{money(grandTotal)}</strong>
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
        <p className="mt-4 text-center text-xs text-muted">Tổng tiền cập nhật khi chọn phòng, đổi ngày hoặc điều chỉnh số khách.</p>
        </div>
      </aside>
    </section>
  );
}
