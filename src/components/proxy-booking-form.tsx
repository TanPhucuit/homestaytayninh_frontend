"use client";

import { useMemo, useState } from "react";
import { ActionButton } from "./action-button";
import { Homestay } from "@/lib/types";

type ProxyBookingFormProps = {
  action: (formData: FormData) => Promise<void>;
  defaultCheckIn: string;
  defaultCheckOut: string;
  homestays: Homestay[];
};

const money = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export function ProxyBookingForm({ action, defaultCheckIn, defaultCheckOut, homestays }: ProxyBookingFormProps) {
  const [homestayId, setHomestayId] = useState(homestays[0]?.id ?? "");
  const selectedHomestay = useMemo(() => homestays.find((homestay) => homestay.id === homestayId) ?? homestays[0], [homestayId, homestays]);
  const rooms = selectedHomestay?.rooms.filter((room) => room.active) ?? [];
  const services = selectedHomestay ? [...selectedHomestay.includedServices, ...selectedHomestay.services].filter((service) => service.active) : [];
  const hasRooms = rooms.length > 0;
  const [serviceQuantities, setServiceQuantities] = useState<Record<string, number>>({});

  function setServiceQuantity(serviceId: string, quantity: number) {
    setServiceQuantities((current) => ({ ...current, [serviceId]: Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0 }));
  }

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="card p-6">
        <p className="eyebrow">Đặt hộ khách hàng</p>
        <h2 className="mt-2 font-heading text-2xl text-[#9a4029]">Thông tin booking hộ</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">Homestay
            <select className="field" name="homestayId" onChange={(event) => setHomestayId(event.target.value)} value={homestayId} required>
              {homestays.map((homestay) => <option key={homestay.id} value={homestay.id}>{homestay.name}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">Phòng còn bán
            <select className="field" name="roomId" disabled={!hasRooms} required>
              {rooms.map((room) => <option key={room.id} value={room.id}>{room.name} · {money(room.pricePerNight)} · tối đa {room.capacity} khách</option>)}
            </select>
          </label>
          <input className="field" name="customerId" placeholder="Mã hồ sơ khách đã có (có thể bỏ trống)" />
          <input className="field" name="guestName" placeholder="Tên khách" required />
          <input className="field" name="guestPhone" placeholder="Số điện thoại" required pattern="^[0-9+ ]{8,15}$" />
          <input className="field" name="guestCount" type="number" min="1" defaultValue="2" required />
          <input className="field" name="checkIn" type="date" defaultValue={defaultCheckIn} required />
          <input className="field" name="checkOut" type="date" defaultValue={defaultCheckOut} required />
        </div>
      </section>

      <aside className="card h-fit p-6">
        <p className="eyebrow">Theo homestay đã chọn</p>
        <h2 className="mt-2 font-heading text-2xl text-[#9a4029]">Dịch vụ gọi kèm</h2>
        <p className="mt-2 text-sm leading-6 text-[#75675f]">Danh sách phòng và dịch vụ được lọc theo homestay đang chọn để tránh đặt nhầm.</p>
        <div className="mt-4 grid gap-3">
          {services.length ? services.map((service) => {
            const quantity = serviceQuantities[service.id] ?? 0;
            const selected = quantity > 0;
            return (
              <article className={`rounded-2xl border bg-white p-3 text-sm ${selected ? "border-[#9a4029]" : "border-[#eadfd4]"}`} key={service.id}>
                <label className="flex items-start gap-3">
                  <input
                    checked={selected}
                    className="mt-1 size-4 accent-[#9a4029]"
                    onChange={(event) => setServiceQuantity(service.id, event.target.checked ? Math.max(1, quantity) : 0)}
                    type="checkbox"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-[#1c1c19]">{service.name}</span>
                    <span className="mt-1 block text-xs text-[#75675f]">{money(service.unitPrice)} / lượt</span>
                  </span>
                </label>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#e8e1d5] pt-3">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#466550]">Số lượng</span>
                  <input
                    className="field h-11 w-24 px-3 py-2"
                    min="0"
                    name={`service:${service.id}`}
                    onChange={(event) => setServiceQuantity(service.id, Number(event.target.value))}
                    type="number"
                    value={quantity}
                  />
                </div>
              </article>
            );
          }) : (
            <p className="rounded-2xl bg-[#fdf9f4] p-4 text-sm text-[#75675f]">Homestay này chưa có dịch vụ đang bán.</p>
          )}
          <ActionButton pendingLabel="Đang tạo..." disabled={!hasRooms}>Tạo booking hộ</ActionButton>
          {!hasRooms && <p className="text-sm font-semibold text-[#93000a]">Homestay này chưa có phòng đang bán để đặt.</p>}
        </div>
      </aside>
    </form>
  );
}
