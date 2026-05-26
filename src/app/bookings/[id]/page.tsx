import Link from "next/link";
import { AccessDenied } from "@/components/access-denied";
import { ActionButton } from "@/components/action-button";
import { BookingTotals, PageShell, PaymentBadge, ServicesDisplay, StatusBadge } from "@/components/customer-ui";
import { FlashMessage } from "@/components/feedback-state";
import { getBooking, getHomestay, money } from "@/lib/api";
import { flashFromSearchParams, FlashSearchParams } from "@/lib/flash";
import { getCurrentUser } from "@/lib/rbac";
import { addServiceAction, markServiceServedAction, retryPaymentAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<FlashSearchParams> }) {
  const user = await getCurrentUser();
  const flash = flashFromSearchParams(await searchParams);
  if (!user.authenticated) {
    return <AccessDenied description="Vui lòng đăng nhập để xem chi tiết booking." />;
  }
  if (user.authorizationError) {
    return <AccessDenied description={user.authorizationError} />;
  }

  const { id } = await params;
  const booking = await getBooking(id, user.role);
  const homestay = await getHomestay(booking.homestayId, "CUSTOMER");
  const canAddService = booking.status === "IN_STAY" && (user.role === "OWNER_STAFF" || user.role === "ADMIN");
  const canRetryPayment = booking.payment?.status === "INITIATED" || booking.payment?.status === "PENDING" || booking.payment?.status === "FAILED";

  return (
    <PageShell eyebrow="Booking Detail" title={`Đơn ${booking.id}`} description={`${homestay.name} · ${booking.checkIn} → ${booking.checkOut}`}>
      <div className="mb-5">
        <FlashMessage flash={flash} />
      </div>
      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="card p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={booking.status} />
                  {booking.payment?.status && <PaymentBadge status={booking.payment.status} />}
                </div>
                <h2 className="mt-4 font-heading text-3xl text-[#9a4029]">{homestay.name}</h2>
                <p className="mt-2 text-sm leading-6 text-[#75675f]">
                  Khách: {booking.guestName} · SĐT: {booking.guestPhone} · {booking.guestCount} khách
                </p>
              </div>
              <Link className="btn-secondary" href={`/homestays/${homestay.id}`}>Xem homestay</Link>
            </div>
          </section>

          <ServicesDisplay includedServices={booking.includedServices ?? homestay.includedServices} addOnServices={booking.services} />

          {(user.role === "OWNER_STAFF" || user.role === "ADMIN") && booking.services.some((service) => service.status === "PREPARING") && (
            <section className="card p-6">
              <h2 className="font-heading text-2xl text-[#9a4029]">Xác nhận dịch vụ đã phục vụ</h2>
              <div className="mt-4 space-y-3">
                {booking.services.filter((service) => service.status === "PREPARING").map((service) => (
                  <form action={markServiceServedAction} className="flex flex-col justify-between gap-3 rounded-2xl bg-[#fdf9f4] p-4 sm:flex-row sm:items-center" key={service.id}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <input type="hidden" name="serviceOrderId" value={service.id} />
                    <span>{service.name} · SL {service.quantity}</span>
                    <ActionButton className="btn-secondary" pendingLabel="Đang cập nhật...">Đánh dấu đã phục vụ</ActionButton>
                  </form>
                ))}
              </div>
            </section>
          )}

          {canAddService && (
            <form action={addServiceAction} className="card p-6">
              <input type="hidden" name="bookingId" value={booking.id} />
              <h2 className="font-heading text-2xl text-[#9a4029]">Thêm dịch vụ khi đang trải nghiệm</h2>
              <p className="mt-2 text-sm text-[#75675f]">Chức năng này phục vụ luồng Customer yêu cầu trực tiếp, hệ thống ghi nhận chi phí vào hóa đơn.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_120px_160px]">
                <select className="field" name="serviceId" required>
                  {homestay.services.map((service) => (
                    <option key={service.id} value={service.id}>{service.name} · {money(service.unitPrice)}</option>
                  ))}
                </select>
                <input className="field" name="quantity" type="number" min="1" defaultValue="1" />
                <ActionButton pendingLabel="Đang thêm...">Thêm dịch vụ</ActionButton>
              </div>
            </form>
          )}
        </div>

        <aside className="space-y-6">
          <BookingTotals booking={booking} />
          <section className="card p-6">
            <h2 className="font-heading text-2xl text-[#9a4029]">Thanh toán</h2>
            <p className="mt-3 text-sm text-[#75675f]">Số tiền: {money(booking.payment?.amount ?? booking.grandTotal)}</p>
            {booking.payment?.checkoutUrl && <Link className="btn-secondary mt-4 w-full" href={booking.payment.checkoutUrl}>Mở payment URL</Link>}
            {canRetryPayment && (
              <form action={retryPaymentAction} className="mt-3">
                <input type="hidden" name="bookingId" value={booking.id} />
                <ActionButton className="btn-primary w-full" pendingLabel="Đang tạo...">Thử lại thanh toán</ActionButton>
              </form>
            )}
            <a className="btn-secondary mt-3 w-full" href={`/payment/result?bookingId=${booking.id}`}>Kiểm tra trạng thái</a>
          </section>
        </aside>
      </section>
    </PageShell>
  );
}
