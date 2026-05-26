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
  const rooms = selectedHomestay?.rooms ?? [];
  const services = selectedHomestay ? [...selectedHomestay.includedServices, ...selectedHomestay.services].filter((service) => service.active) : [];
  const hasRooms = rooms.length > 0;

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="card p-6">
        <h2 className="font-heading text-2xl text-[#9a4029]">Thông tin booking hộ</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">Homestay
            <select className="field" name="homestayId" onChange={(event) => setHomestayId(event.target.value)} value={homestayId} required>
              {homestays.map((homestay) => <option key={homestay.id} value={homestay.id}>{homestay.name}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">Phòng
            <select className="field" name="roomId" disabled={!hasRooms} required>
              {rooms.map((room) => <option key={room.id} value={room.id}>{room.name} · {money(room.pricePerNight)}</option>)}
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
        <h2 className="font-heading text-2xl text-[#9a4029]">Dịch vụ gọi kèm</h2>
        <div className="mt-4 grid gap-3">
          <select className="field" name="serviceId" defaultValue="">
            <option value="">Không chọn dịch vụ</option>
            {services.map((service) => <option key={service.id} value={service.id}>{service.name} · {money(service.unitPrice)}</option>)}
          </select>
          <input className="field" name="serviceQuantity" type="number" min="0" defaultValue="0" />
          <ActionButton pendingLabel="Đang tạo..." disabled={!hasRooms}>Tạo booking hộ</ActionButton>
          {!hasRooms && <p className="text-sm font-semibold text-[#93000a]">Homestay này chưa có phòng khả dụng để đặt.</p>}
        </div>
      </aside>
    </form>
  );
}
