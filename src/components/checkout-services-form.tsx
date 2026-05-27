"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckoutPreview, Service } from "@/lib/types";

type CheckoutServicesFormProps = {
  preview: CheckoutPreview;
  preservedEntries: Array<[string, string]>;
  backHref: string;
};

function money(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function initialQuantities(entries: Array<[string, string]>, services: Service[]) {
  const values: Record<string, number> = {};
  services.forEach((service) => {
    const raw = entries.find(([key]) => key === `service:${service.id}`)?.[1];
    const quantity = Number(raw ?? 0);
    values[service.id] = Number.isInteger(quantity) && quantity > 0 ? quantity : 0;
  });
  return values;
}

export function CheckoutServicesForm({ preview, preservedEntries, backHref }: CheckoutServicesFormProps) {
  const addOnServices = preview.homestay.services.filter((service) => service.active !== false && !service.included);
  const [quantities, setQuantities] = useState(() => initialQuantities(preservedEntries, addOnServices));
  const nonServiceEntries = preservedEntries.filter(([key]) => !key.startsWith("service:"));
  const serviceTotal = useMemo(() => {
    return addOnServices.reduce((sum, service) => sum + service.unitPrice * (quantities[service.id] ?? 0), 0);
  }, [addOnServices, quantities]);
  const taxTotal = Math.round((preview.roomTotal + serviceTotal + preview.cleaningFee) * 0.1);
  const grandTotal = preview.roomTotal + serviceTotal + preview.cleaningFee + taxTotal;

  function setQuantity(serviceId: string, quantity: number) {
    setQuantities((current) => ({ ...current, [serviceId]: Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0 }));
  }

  return (
    <form action="/checkout/confirm" className="grid gap-6 lg:grid-cols-[1fr_390px]" method="get">
      {nonServiceEntries.map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
      <div className="space-y-6">
        <section className="card p-6 md:p-8">
          <p className="eyebrow">Đã bao gồm</p>
          <h2 className="mt-2 font-heading text-3xl text-[#9a4029]">Dịch vụ trong giá phòng</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {preview.includedServices.length ? preview.includedServices.map((service) => (
              <div className="rounded-2xl border border-[#d7e2da] bg-[#e8f0eb] p-4" key={service.id}>
                <h3 className="font-bold text-[#466550]">{service.name}</h3>
                {service.description && <p className="mt-1 text-sm text-[#75675f]">{service.description}</p>}
                <p className="mt-2 text-xs font-bold uppercase text-[#466550]">Bao gồm trong giá phòng</p>
              </div>
            )) : <p className="text-sm text-[#75675f]">Chưa có dịch vụ bao gồm.</p>}
          </div>
        </section>

        <section className="card p-6 md:p-8">
          <p className="eyebrow">Chọn thêm</p>
          <h2 className="mt-2 font-heading text-3xl text-[#9a4029]">Dịch vụ bổ sung</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {addOnServices.length ? addOnServices.map((service) => {
              const quantity = quantities[service.id] ?? 0;
              const selected = quantity > 0;
              return (
                <article className={`grid gap-4 rounded-2xl border bg-white p-4 shadow-[0_10px_30px_rgba(154,64,41,0.05)] ${selected ? "border-[#9a4029]" : "border-[#eadfd4]"}`} key={service.id}>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      className="mt-1 h-5 w-5 accent-[#9a4029]"
                      type="checkbox"
                      checked={selected}
                      onChange={(event) => setQuantity(service.id, event.target.checked ? Math.max(1, quantity) : 0)}
                    />
                    <span>
                      <span className="block font-bold text-[#1c1c19]">{service.name}</span>
                      {service.description && <span className="mt-1 block text-sm text-[#75675f]">{service.description}</span>}
                      <span className="mt-2 block text-sm font-bold text-[#9a4029]">{money(service.unitPrice)} / lượt</span>
                    </span>
                  </label>
                  <div className="flex items-center justify-between gap-3 border-t border-[#e8e1d5] pt-3">
                    <span className="text-sm font-semibold text-[#75675f]">Số lượng</span>
                    <input
                      className="field h-fit w-28"
                      name={`service:${service.id}`}
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(event) => setQuantity(service.id, Number(event.target.value))}
                      aria-label={`Số lượng ${service.name}`}
                    />
                  </div>
                </article>
              );
            }) : <p className="text-sm text-[#75675f]">Homestay chưa mở bán dịch vụ bổ sung.</p>}
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-2xl bg-white p-6 shadow-[0_24px_80px_rgba(123,41,20,0.1)] lg:sticky lg:top-28">
        <h2 className="border-b border-[#e8e1d5] pb-4 font-heading text-2xl text-[#1c1c19]">Tóm tắt đơn đặt</h2>
        <h3 className="mt-5 font-bold text-[#1c1c19]">{preview.room.name}</h3>
        <p className="mt-1 text-sm text-[#75675f]">{preview.nights} đêm · {preview.guestCount} khách</p>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between"><span>Tiền phòng</span><strong>{money(preview.roomTotal)}</strong></div>
          <div className="flex justify-between"><span>Dịch vụ bổ sung</span><strong>{money(serviceTotal)}</strong></div>
          <div className="flex justify-between"><span>Phí dọn phòng</span><strong>{money(preview.cleaningFee)}</strong></div>
          <div className="flex justify-between"><span>Thuế 10%</span><strong>{money(taxTotal)}</strong></div>
          <div className="border-t border-[#e8e1d5] pt-4">
            <div className="flex justify-between text-lg"><span className="font-bold">Tổng cộng</span><strong className="text-[#9a4029]">{money(grandTotal)}</strong></div>
            <p className="mt-1 text-xs text-[#75675f]">Tổng tiền tự cập nhật khi chọn dịch vụ.</p>
          </div>
        </div>
        <button className="btn-primary mt-6 w-full" type="submit">Tiếp tục xác nhận</button>
        <Link className="btn-secondary mt-3 w-full" href={backHref}>Quay lại</Link>
      </aside>
    </form>
  );
}
