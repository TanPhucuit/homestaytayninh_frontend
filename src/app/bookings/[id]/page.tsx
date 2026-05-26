import Link from "next/link";
import { BookingTotals, PageShell, PaymentBadge, ServicesDisplay, StatusBadge } from "@/components/customer-ui";
import { getBooking, getHomestay, money } from "@/lib/api";
import { addServiceAction, retryPaymentAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await getBooking(id, "CUSTOMER");
  const homestay = await getHomestay(booking.homestayId, "CUSTOMER");
  const canAddService = booking.status === "IN_STAY";
  const canRetryPayment = booking.payment?.status === "INITIATED" || booking.payment?.status === "PENDING" || booking.payment?.status === "FAILED";

  return (
    <PageShell eyebrow="Booking Detail" title={`Đơn ${booking.id}`} description={`${homestay.name} · ${booking.checkIn} → ${booking.checkOut}`}>
      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="card p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={booking.status} />
                  {booking.payment?.status && <PaymentBadge status={booking.payment.status} />}
                </div>
                <h2 className="mt-4 text-3xl text-[#9a4029]">{homestay.name}</h2>
                <p className="mt-2 text-sm leading-6 text-[#75675f]">
                  Khách: {booking.guestName} · SĐT: {booking.guestPhone} · {booking.guestCount} khách
                </p>
              </div>
              <Link className="btn-secondary" href={`/homestays/${homestay.id}`}>Xem homestay</Link>
            </div>
          </section>

          <ServicesDisplay includedServices={booking.includedServices ?? homestay.includedServices} addOnServices={booking.services} />

          {canAddService && (
            <form action={addServiceAction} className="card p-6">
              <input type="hidden" name="bookingId" value={booking.id} />
              <h2 className="text-2xl text-[#9a4029]">Thêm dịch vụ khi đang trải nghiệm</h2>
              <p className="mt-2 text-sm text-[#75675f]">Chức năng này phục vụ luồng Customer yêu cầu trực tiếp, hệ thống ghi nhận chi phí vào hóa đơn.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_120px_160px]">
                <select className="field" name="serviceId" required>
                  {homestay.services.map((service) => (
                    <option key={service.id} value={service.id}>{service.name} · {money(service.unitPrice)}</option>
                  ))}
                </select>
                <input className="field" name="quantity" type="number" min="1" defaultValue="1" />
                <button className="btn-primary" type="submit">Thêm dịch vụ</button>
              </div>
            </form>
          )}
        </div>

        <aside className="space-y-6">
          <BookingTotals booking={booking} />
          <section className="card p-6">
            <h2 className="text-2xl text-[#9a4029]">Thanh toán</h2>
            <p className="mt-3 text-sm text-[#75675f]">Số tiền: {money(booking.payment?.amount ?? booking.grandTotal)}</p>
            {booking.payment?.checkoutUrl && <Link className="btn-secondary mt-4 w-full" href={booking.payment.checkoutUrl}>Mở payment URL</Link>}
            {canRetryPayment && (
              <form action={retryPaymentAction} className="mt-3">
                <input type="hidden" name="bookingId" value={booking.id} />
                <button className="btn-primary w-full" type="submit">Thử lại thanh toán</button>
              </form>
            )}
            <Link className="btn-secondary mt-3 w-full" href={`/payment/result?bookingId=${booking.id}`}>Kiểm tra trạng thái</Link>
          </section>
        </aside>
      </section>
    </PageShell>
  );
}
