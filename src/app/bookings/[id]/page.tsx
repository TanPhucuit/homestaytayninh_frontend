import Link from "next/link";
import { AccessDenied } from "@/components/access-denied";
import { ActionButton } from "@/components/action-button";
import { ConfirmActionButton } from "@/components/confirm-action-button";
import { BookingTotals, PageShell, PaymentBadge, ServicesDisplay, StatusBadge } from "@/components/customer-ui";
import { FlashMessage } from "@/components/feedback-state";
import { getBooking, getHomestay, money } from "@/lib/api";
import { canCreateOrRetryPayment, canViewPaymentStatus, paymentActionUnavailableReason } from "@/lib/booking-rules";
import { flashFromSearchParams, FlashSearchParams } from "@/lib/flash";
import { getCurrentUser } from "@/lib/rbac";
import { addServiceAction, cancelBookingAction, markServiceServedAction, retryPaymentAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<FlashSearchParams> }) {
  const user = await getCurrentUser();
  const flash = flashFromSearchParams(await searchParams);
  if (!user.authenticated) {
    return <AccessDenied description="Vui lòng đăng nhập để xem chi tiết đơn đặt." />;
  }
  if (user.authorizationError) {
    return <AccessDenied description={user.authorizationError} />;
  }

  const { id } = await params;
  const booking = await getBooking(id, user.role);
  const homestay = await getHomestay(booking.homestayId, "CUSTOMER");
  const isOpsRole = user.role === "OWNER_STAFF";
  const canAddService = booking.status === "IN_STAY" && isOpsRole;
  const canCancel = user.role === "CUSTOMER" && (booking.status === "PENDING" || booking.status === "CONFIRMED");
  const isPaid = booking.payment?.status === "PAID";
  const canRetryPayment = canCreateOrRetryPayment(booking);
  const canCheckPayment = canViewPaymentStatus(booking);
  const paymentNotice = paymentActionUnavailableReason(booking);
  const bookedRooms = booking.rooms?.length
    ? booking.rooms
    : homestay.rooms.filter((room) => room.id === booking.roomId);
  const addOnServices = homestay.services.filter((service) => service.active !== false && !service.included);

  return (
    <PageShell eyebrow="Chi tiết đơn đặt" title={`Đơn ${booking.id}`} description={`${homestay.name} · ${booking.checkIn} → ${booking.checkOut}`}>
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
                  {booking.payment?.status ? <PaymentBadge status={booking.payment.status} /> : <span className="rounded-full bg-[#fff3d6] px-3 py-1 text-xs font-bold text-[#7a4a12]">Chưa có giao dịch thanh toán</span>}
                </div>
                <h2 className="mt-4 font-heading text-3xl text-[#9a4029]">{homestay.name}</h2>
                <p className="mt-2 text-sm leading-6 text-[#75675f]">
                  Khách: {booking.guestName} · SĐT: {booking.guestPhone} · {booking.guestCount} khách
                </p>
                <p className="mt-1 text-sm font-semibold text-[#466550]">
                  {bookedRooms.length ? bookedRooms.map((room) => room.name).join(", ") : `Phòng ${booking.roomId}`}
                </p>
              </div>
              <Link className="btn-secondary" href={`/homestays/${homestay.id}`}>Xem homestay</Link>
            </div>
          </section>

          <ServicesDisplay includedServices={booking.includedServices ?? homestay.includedServices} addOnServices={booking.services} />

          {isOpsRole && booking.services.some((service) => service.status === "PREPARING") && (
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

          {user.role === "CUSTOMER" && booking.status === "IN_STAY" && (
            <section className="card p-6">
              <h2 className="font-heading text-2xl text-[#9a4029]">Cần thêm dịch vụ?</h2>
              <p className="mt-2 text-sm leading-6 text-[#75675f]">
                Dịch vụ phát sinh sẽ do nhân viên homestay ghi nhận vào hóa đơn của đơn đang lưu trú để tránh chọn nhầm dịch vụ hoặc sai chi phí.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button className="btn-secondary cursor-not-allowed opacity-70" disabled type="button">
                  Liên hệ trực tiếp nhân viên tại quầy
                </button>
                <Link className="btn-secondary" href={`/homestays/${homestay.id}`}>Xem dịch vụ của homestay</Link>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <BookingTotals booking={booking} />
          {canAddService && (
            <form action={addServiceAction} className="card p-6">
              <input type="hidden" name="bookingId" value={booking.id} />
              <h2 className="font-heading text-2xl text-[#9a4029]">Thêm dịch vụ</h2>
              <p className="mt-2 text-sm text-[#75675f]">Ghi nhận dịch vụ phát sinh khi khách đang lưu trú.</p>
              <div className="mt-4 grid gap-3">
                <select className="field" name="serviceId" disabled={!addOnServices.length} required>
                  {addOnServices.map((service) => (
                    <option key={service.id} value={service.id}>{service.name} · {money(service.unitPrice)}</option>
                  ))}
                </select>
                <input className="field" name="quantity" type="number" min="1" defaultValue="1" aria-label="Số lượng dịch vụ" />
                <ActionButton className="btn-primary w-full" disabled={!addOnServices.length} pendingLabel="Đang thêm...">Thêm vào hóa đơn</ActionButton>
                {!addOnServices.length && <p className="text-sm font-semibold text-[#93000a]">Homestay chưa có dịch vụ bổ sung đang bán.</p>}
              </div>
            </form>
          )}
          <section className="card p-6">
            <h2 className="font-heading text-2xl text-[#9a4029]">Thanh toán</h2>
            <p className="mt-3 text-sm text-[#75675f]">Số tiền: {money(booking.payment?.amount ?? booking.grandTotal)}</p>
            {!booking.payment && canRetryPayment && <p className="mt-2 text-sm text-[#75675f]">Đơn này chưa có giao dịch thanh toán. Bạn có thể tạo lại thanh toán qua ApiPay.</p>}
            {paymentNotice && !isPaid && <p className="mt-2 rounded-xl bg-[#fdf3ef] px-4 py-3 text-sm font-semibold text-[#9a4029]">{paymentNotice}</p>}
            {canRetryPayment && (
              <form action={retryPaymentAction} className="mt-3">
                <input type="hidden" name="bookingId" value={booking.id} />
                <ActionButton className="btn-primary w-full" pendingLabel="Đang tạo...">Thanh toán qua ApiPay</ActionButton>
              </form>
            )}
            {isPaid ? (
              <div className="mt-3 rounded-xl border border-[#d7e2da] bg-[#e8f0eb] px-4 py-3 text-center text-sm font-bold text-[#466550]">Đã thanh toán</div>
            ) : (
              canCheckPayment ? <a className="btn-secondary mt-3 w-full" href={`/payment/result?bookingId=${booking.id}&status=${booking.payment?.status ?? "pending"}`}>Kiểm tra trạng thái</a> : null
            )}
          </section>
          {canCancel && (
            <form action={cancelBookingAction} className="card p-6">
              <input type="hidden" name="bookingId" value={booking.id} />
              <h2 className="font-heading text-2xl text-[#9a4029]">Hủy đơn</h2>
              <p className="mt-2 text-sm text-[#75675f]">Có thể hủy khi đơn còn chờ xác nhận hoặc đã xác nhận nhưng chưa check-in.</p>
              <ConfirmActionButton className="btn-secondary mt-4 w-full" message="Bạn chắc chắn muốn hủy đơn này?" pendingLabel="Đang hủy...">Hủy đơn</ConfirmActionButton>
            </form>
          )}
        </aside>
      </section>
    </PageShell>
  );
}
