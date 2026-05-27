import Link from "next/link";
import { AccessDenied } from "@/components/access-denied";
import { PaymentBadge } from "@/components/customer-ui";
import { getPaymentStatus, money } from "@/lib/api";
import { getCurrentUser } from "@/lib/rbac";
import { PaymentStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

function normalizePaymentStatus(value?: string): PaymentStatus {
  const normalized = String(value ?? "PENDING").toUpperCase();
  if (normalized === "UNPAID") return "INITIATED";
  if (normalized === "EXPIRED") return "CANCELLED";
  if (normalized === "PAID" || normalized === "FAILED" || normalized === "CANCELLED" || normalized === "INITIATED" || normalized === "PENDING") return normalized;
  return "PENDING";
}

function copyFor(status: PaymentStatus) {
  if (status === "PAID") {
    return {
      icon: "OK",
      tone: "bg-[#e8f0eb] text-[#466550]",
      title: "Thanh toán thành công",
      description: "Đơn đặt phòng của bạn đã được ghi nhận. Bạn có thể xem chi tiết trong Chuyến đi của tôi."
    };
  }
  if (status === "FAILED" || status === "CANCELLED") {
    return {
      icon: "!",
      tone: "bg-[#ffdad6] text-[#93000a]",
      title: "Thanh toán chưa hoàn tất",
      description: "Giao dịch chưa hoàn tất hoặc đã hết hạn. Bạn có thể thử lại từ trang chi tiết đơn đặt."
    };
  }
  return {
    icon: "...",
    tone: "bg-[#fff3d6] text-[#7a4a12]",
    title: "Thanh toán đang xử lý",
    description: "Trạng thái giao dịch đang chờ xác nhận. Vui lòng kiểm tra lại sau ít phút."
  };
}

export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<{ status?: string; bookingId?: string; paymentError?: string; demo?: string }> }) {
  const params = await searchParams;
  const user = params.bookingId ? await getCurrentUser() : null;
  if (params.bookingId && !user?.authenticated) {
    return <AccessDenied description="Vui lòng đăng nhập để xem trạng thái thanh toán của đơn đặt." />;
  }
  if (user?.authorizationError) {
    return <AccessDenied description={user.authorizationError} />;
  }
  const payment = params.bookingId ? await getPaymentStatus(params.bookingId, user?.role ?? "CUSTOMER") : null;
  const status = params.paymentError ? "FAILED" : (payment?.status ?? normalizePaymentStatus(params.status));
  const view = copyFor(status);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 text-[#1c1c19]">
      <section className="w-full max-w-2xl rounded-2xl border border-[#dcc0ba] bg-white p-8 text-center shadow-[0_30px_90px_rgba(123,41,20,0.12)] md:p-10">
        <div className={`mx-auto grid size-20 place-items-center rounded-full text-2xl font-bold ${view.tone}`}>
          {view.icon}
        </div>
        <p className="eyebrow mt-8">Kết quả thanh toán</p>
        <h1 className="mt-3 font-heading text-4xl text-[#9a4029] md:text-5xl">{view.title}</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#75675f]">{view.description}</p>
        {params.paymentError && (
          <div className="mx-auto mt-5 max-w-md rounded-2xl border border-[#ffdad6] bg-[#fff8f7] p-5 text-sm font-semibold text-[#93000a]">
            Không hoàn tất thanh toán: {params.paymentError}
          </div>
        )}
        <div className="mt-5 flex justify-center">
          <PaymentBadge status={status} />
        </div>
        {payment && (
          <div className="mx-auto mt-6 max-w-md rounded-2xl bg-[#fdf9f4] p-5 text-sm text-[#56423d]">
            <div className="flex justify-between gap-4"><span>Mã thanh toán</span><strong>{payment.id}</strong></div>
            <div className="mt-2 flex justify-between gap-4"><span>Số tiền</span><strong>{money(payment.amount)}</strong></div>
          </div>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="btn-primary" href="/bookings">Về chuyến đi của tôi</Link>
          {params.bookingId && <Link className="btn-secondary" href={`/bookings/${params.bookingId}`}>Xem chi tiết đơn</Link>}
          {!params.bookingId && <Link className="btn-secondary" href="/homestays">Tiếp tục khám phá</Link>}
        </div>
      </section>
    </main>
  );
}
