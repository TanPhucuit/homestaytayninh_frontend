import Link from "next/link";
import { PageShell, PaymentBadge } from "@/components/customer-ui";
import { getPaymentStatus, money } from "@/lib/api";
import { PaymentStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

function normalizePaymentStatus(value?: string): PaymentStatus {
  const normalized = String(value ?? "PENDING").toUpperCase();
  if (normalized === "UNPAID") return "INITIATED";
  if (normalized === "EXPIRED") return "CANCELLED";
  if (normalized === "PAID" || normalized === "FAILED" || normalized === "CANCELLED" || normalized === "INITIATED") return normalized;
  return "PENDING";
}

export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<{ status?: string; bookingId?: string }> }) {
  const params = await searchParams;
  const payment = params.bookingId ? await getPaymentStatus(params.bookingId, "CUSTOMER") : null;
  const status = payment?.status ?? normalizePaymentStatus(params.status);
  const isPaid = status === "PAID";
  const isFailed = status === "FAILED" || status === "CANCELLED";

  return (
    <PageShell eyebrow="ApiPay" title="Kết quả thanh toán" description="Trang này đọc trạng thái payment từ backend khi có bookingId, không chỉ dựa vào query tĩnh.">
      <section className="stitch-panel mx-auto max-w-2xl p-8 text-center">
        <div className={`mx-auto flex size-16 items-center justify-center rounded-full text-3xl font-bold ${isPaid ? "bg-[#e8f0eb] text-[#466550]" : isFailed ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>
          {isPaid ? "✓" : isFailed ? "!" : "…"}
        </div>
        <h1 className="mt-5 font-heading text-4xl text-[#9a4029]">
          {isPaid ? "Thanh toán thành công" : isFailed ? "Thanh toán chưa hoàn tất" : "Thanh toán đang xử lý"}
        </h1>
        <div className="mt-4 flex justify-center">
          <PaymentBadge status={status} />
        </div>
        {payment && (
          <div className="mt-5 rounded-2xl bg-[#fdf9f4] p-4 text-sm text-[#75675f]">
            <p>Mã payment: <strong>{payment.id}</strong></p>
            <p>Số tiền: <strong>{money(payment.amount)}</strong></p>
          </div>
        )}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="btn-primary" href="/bookings">Về lịch sử booking</Link>
          {params.bookingId && <Link className="btn-secondary" href={`/bookings/${params.bookingId}`}>Xem chi tiết đơn</Link>}
        </div>
      </section>
    </PageShell>
  );
}
