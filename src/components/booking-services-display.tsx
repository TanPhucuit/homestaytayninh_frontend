import { money } from "@/lib/api";
import { mockDataSource } from "@/lib/mock-data-source";
import { Booking } from "@/lib/types";
import { EmptyState } from "./feedback-state";
import { Pill } from "./ui";

export function BookingServicesDisplay({
  booking,
  audience = "customer"
}: {
  booking: Booking;
  audience?: "customer" | "owner-staff";
}) {
  const includedServices = booking.includedServices?.length ? booking.includedServices : mockDataSource.defaultIncludedServices;

  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#466550]">Booking Services Display</h2>
          <p className="mt-1 text-sm text-[#75675f]">
            {audience === "owner-staff"
              ? "Owner Staff theo dõi dịch vụ đã bao gồm, dịch vụ đặt thêm và trạng thái phục vụ."
              : "Khách hàng xem rõ dịch vụ đã bao gồm, dịch vụ đặt thêm và tổng chi phí."}
          </p>
        </div>
        <Pill tone={booking.status === "IN_STAY" ? "green" : "sand"}>{booking.status === "IN_STAY" ? "Có thể thêm dịch vụ" : "Không mở thêm dịch vụ"}</Pill>
      </div>

      <div className="mt-5 rounded-2xl bg-[#fdf9f4] p-4">
        <p className="font-bold text-[#466550]">Included Services</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {includedServices.map((service) => (
            <div key={service.id} className="rounded-2xl border border-[#eadfd3] bg-white p-4">
              <p className="font-bold">{service.name}</p>
              <p className="mt-1 text-xs text-[#75675f]">{service.description}</p>
              <p className="mt-3 text-sm font-bold text-[#466550]">Included · 0đ</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="font-bold text-[#466550]">Add-on Services</p>
        {booking.services.length === 0 ? (
          <div className="mt-3">
            <EmptyState title="Chưa có add-on services" description="Booking này chưa phát sinh dịch vụ đặt thêm." />
          </div>
        ) : (
          <div className="mt-3 overflow-hidden rounded-2xl border border-[#eadfd3] bg-white">
            <div className="hidden grid-cols-[1.4fr_0.7fr_0.9fr_0.9fr_0.8fr] gap-3 bg-[#fdf9f4] p-4 text-xs font-bold uppercase tracking-wide text-[#75675f] md:grid">
              <span>Dịch vụ</span>
              <span>Quantity</span>
              <span>Unit price</span>
              <span>Subtotal</span>
              <span>Status</span>
            </div>
            {booking.services.map((service) => (
              <div key={service.id} className="grid gap-3 border-t border-[#eadfd3] p-4 text-sm md:grid-cols-[1.4fr_0.7fr_0.9fr_0.9fr_0.8fr] md:items-center">
                <div>
                  <p className="font-bold">{service.name}</p>
                  <p className="text-xs text-[#75675f] md:hidden">
                    SL {service.quantity} · {money(service.unitPrice)} · Subtotal {money(service.total)}
                  </p>
                </div>
                <span className="hidden md:block">{service.quantity}</span>
                <span className="hidden md:block">{money(service.unitPrice)}</span>
                <strong className="hidden text-[#9a4029] md:block">{money(service.total)}</strong>
                <Pill tone={service.status === "SERVED" ? "green" : "clay"}>{service.status}</Pill>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 rounded-2xl bg-[#fdf9f4] p-4">
        <p className="font-bold text-[#466550]">Order Summary</p>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span>Room total</span>
            <strong>{money(booking.roomTotal)}</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span>Service total</span>
            <strong>{money(booking.serviceTotal)}</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span>Tax/Fee</span>
            <strong>{money(booking.taxTotal)}</strong>
          </div>
          <div className="border-t border-[#eadfd3] pt-3 text-lg">
            <div className="flex justify-between gap-4">
              <span>Grand total</span>
              <strong className="text-[#9a4029]">{money(booking.grandTotal)}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
