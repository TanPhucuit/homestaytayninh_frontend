"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ActionButton } from "./action-button";
import type { Room, Service } from "@/lib/types";

type MultiRoomServicesFormProps = {
  homestayId: string;
  rooms: Room[];
  services: Service[];
  initialSelectedServices?: string[];
  checkIn: string;
  checkOut: string;
  guests: string;
  backHref: string;
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

function selectionKey(roomId: string, serviceId: string) {
  return `${roomId}:${serviceId}`;
}

function initialSelectedState(keys: string[] | undefined, rooms: Room[], services: Service[]) {
  const roomIds = new Set(rooms.map((room) => room.id));
  const serviceIds = new Set(services.map((service) => service.id));
  return (keys ?? []).reduce<Record<string, boolean>>((state, key) => {
    const [roomId, serviceId] = key.split(":");
    if (roomIds.has(roomId) && serviceIds.has(serviceId)) state[key] = true;
    return state;
  }, {});
}

function formatDate(value?: string) {
  const date = dateFromIso(value);
  return date ? new Intl.DateTimeFormat("vi-VN").format(date) : "Chưa chọn";
}

export function MultiRoomServicesForm({ homestayId, rooms, services, initialSelectedServices, checkIn, checkOut, guests, backHref }: MultiRoomServicesFormProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>(() => initialSelectedState(initialSelectedServices, rooms, services));
  const nights = nightsBetween(checkIn, checkOut);
  const roomTotal = rooms.reduce((sum, room) => sum + room.pricePerNight * nights, 0);
  const selectedServices = useMemo(() => {
    return rooms.flatMap((room) =>
      services
        .filter((service) => selected[selectionKey(room.id, service.id)])
        .map((service) => ({ room, service, total: service.unitPrice }))
    );
  }, [rooms, selected, services]);
  const serviceTotal = selectedServices.reduce((sum, item) => sum + item.total, 0);
  const taxTotal = Math.round((roomTotal + serviceTotal) * 0.1);
  const grandTotal = roomTotal + serviceTotal + taxTotal;

  function toggleService(roomId: string, serviceId: string) {
    const key = selectionKey(roomId, serviceId);
    setSelected((current) => ({ ...current, [key]: !current[key] }));
  }

  function applyServiceToAll(serviceId: string) {
    setSelected((current) => {
      const next = { ...current };
      const allSelected = rooms.every((room) => next[selectionKey(room.id, serviceId)]);
      rooms.forEach((room) => {
        next[selectionKey(room.id, serviceId)] = !allSelected;
      });
      return next;
    });
  }

  return (
    <form action="/checkout/confirm" className="grid gap-6 lg:grid-cols-[1fr_390px]" method="get">
      <input type="hidden" name="homestayId" value={homestayId} />
      <input type="hidden" name="roomIds" value={rooms.map((room) => room.id).join(",")} />
      <input type="hidden" name="checkIn" value={checkIn} />
      <input type="hidden" name="checkOut" value={checkOut} />
      <input type="hidden" name="guests" value={guests} />
      {selectedServices.map(({ room, service }) => (
        <input key={`${room.id}-${service.id}`} type="hidden" name={`service:${room.id}:${service.id}`} value="1" />
      ))}

      <div className="space-y-6">
        {rooms.map((room) => {
          const roomLineTotal = room.pricePerNight * nights;
          return (
            <section className="card p-6 md:p-8" data-testid={`service-room-${room.id}`} key={room.id}>
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <p className="eyebrow">Phòng đã chọn</p>
                  <h2 className="mt-2 font-heading text-3xl text-[#9a4029]">{room.name}</h2>
                  <p className="mt-2 text-sm text-[#75675f]">{money(room.pricePerNight)} / đêm x {nights} đêm</p>
                </div>
                <strong className="rounded-full bg-[#ffdad2] px-4 py-2 text-sm text-[#7b2914]">{money(roomLineTotal)}</strong>
              </div>

              <div className="mt-6">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <h3 className="font-heading text-2xl text-[#1c1c19]">Dịch vụ bổ sung</h3>
                    <p className="mt-1 text-sm text-[#75675f]">Chọn riêng cho phòng này. Có thể bỏ qua nếu không cần.</p>
                  </div>
                  {services.length > 0 && (
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#466550]">{services.length} dịch vụ khả dụng</p>
                  )}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {services.length ? services.map((service) => {
                    const key = selectionKey(room.id, service.id);
                    const isSelected = Boolean(selected[key]);
                    return (
                      <article className={`rounded-2xl border bg-white p-4 text-sm shadow-[0_10px_30px_rgba(154,64,41,0.05)] ${isSelected ? "border-[#9a4029] bg-[#fff8f5]" : "border-[#eadfd4]"}`} data-testid={`service-card-${room.id}-${service.id}`} key={service.id}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-bold text-[#1c1c19]">{service.name}</h4>
                            {service.description && <p className="mt-1 leading-6 text-[#75675f]">{service.description}</p>}
                            <p className="mt-2 font-bold text-[#9a4029]">{money(service.unitPrice)} / lượt</p>
                          </div>
                          <input
                            aria-label={`${isSelected ? "Bỏ chọn" : "Chọn"} ${service.name} cho ${room.name}`}
                            checked={isSelected}
                            className="mt-1 size-5 accent-[#9a4029]"
                            onChange={() => toggleService(room.id, service.id)}
                            type="checkbox"
                          />
                        </div>
                        <div className="mt-4 flex flex-col gap-2 border-t border-[#e8e1d5] pt-3 sm:flex-row">
                          <button className={isSelected ? "btn-secondary px-4 py-2 text-[#9a4029]" : "btn-primary px-4 py-2"} onClick={() => toggleService(room.id, service.id)} type="button">
                            {isSelected ? "Bỏ chọn" : "Thêm"}
                          </button>
                          {rooms.length > 1 && (
                            <button className="btn-secondary px-4 py-2" onClick={() => applyServiceToAll(service.id)} type="button">
                              Áp dụng cho tất cả phòng
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  }) : (
                    <p className="rounded-2xl bg-[#fdf9f4] p-4 text-sm text-[#75675f]">Homestay chưa mở bán dịch vụ bổ sung.</p>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <aside className="h-fit rounded-2xl bg-white p-6 shadow-[0_24px_80px_rgba(123,41,20,0.1)] lg:sticky lg:top-28">
        <h2 className="border-b border-[#e8e1d5] pb-4 font-heading text-2xl text-[#1c1c19]">Tóm tắt đơn đặt</h2>
        <p className="mt-4 text-sm text-[#75675f]">{rooms.length} phòng · {nights} đêm · {guests} khách</p>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4"><span>Nhận phòng</span><strong data-testid="services-check-in-display">{formatDate(checkIn)}</strong></div>
          <div className="flex justify-between gap-4"><span>Trả phòng</span><strong data-testid="services-check-out-display">{formatDate(checkOut)}</strong></div>
          <div className="flex justify-between gap-4"><span>Tổng tiền phòng</span><strong data-testid="services-room-total">{money(roomTotal)}</strong></div>
          <div>
            <div className="flex justify-between gap-4"><span>Dịch vụ bổ sung</span><strong data-testid="services-service-total">{money(serviceTotal)}</strong></div>
            {selectedServices.length ? (
              <div className="mt-3 space-y-2">
                {selectedServices.map(({ room, service, total }) => (
                  <div className="rounded-xl bg-[#fdf9f4] px-3 py-2 text-xs" data-testid="selected-service-row" key={`${room.id}-${service.id}`}>
                    <div className="flex justify-between gap-3">
                      <span>{room.name} · {service.name}</span>
                      <strong>{money(total)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 rounded-xl bg-[#fdf9f4] px-3 py-2 text-xs text-[#75675f]">Bạn có thể bỏ qua dịch vụ bổ sung và xác nhận đặt phòng.</p>
            )}
          </div>
          <div className="flex justify-between gap-4"><span>Thuế/phụ phí 10%</span><strong data-testid="services-tax-total">{money(taxTotal)}</strong></div>
          <div className="border-t border-[#e8e1d5] pt-4">
            <div className="flex justify-between gap-4 text-lg"><span className="font-bold">Tổng thanh toán</span><strong className="text-[#9a4029]" data-testid="services-grand-total">{money(grandTotal)}</strong></div>
            <p className="mt-1 text-xs text-[#75675f]">Tổng tiền tự cập nhật khi chọn hoặc bỏ chọn dịch vụ.</p>
          </div>
        </div>
        <ActionButton className="btn-primary mt-6 w-full" pendingLabel="Đang chuyển sang xác nhận...">
          Tiếp tục xác nhận
        </ActionButton>
        <Link className="btn-secondary mt-3 w-full" href={backHref}>Quay lại chọn phòng</Link>
      </aside>
    </form>
  );
}
