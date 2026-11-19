import Link from "next/link";
import { CheckCircle2, Hourglass, Leaf, XCircle } from "lucide-react";
import { AccessDenied } from "@/components/access-denied";
import { PaymentBadge } from "@/components/customer-ui";
import { PaymentStatusPoller } from "@/components/payment-status-poller";
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

function cleanPaymentError(value?: string) {
  if (!value) return undefined;
  if (/internal server error|backend|payload|json|api/i.test(value)) {
    return "Không thể tạo liên kết thanh toán lúc này. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.";
  }
  return value;
}

function copyFor(status: PaymentStatus) {
  if (status === "PAID") {
    return {
      icon: CheckCircle2,
      tone: "bg-leaf-soft text-leaf-strong",
      ring: "bg-leaf/20",
      title: "Thanh toán thành công",
      description: "Đơn đặt phòng của bạn đã được ghi nhận. Bạn có thể xem chi tiết trong Chuyến đi của tôi."
    };
  }
  if (status === "FAILED" || status === "CANCELLED") {
    return {
      icon: XCircle,
      tone: "bg-danger-soft text-danger",
      ring: "bg-danger/15",
      title: "Thanh toán chưa hoàn tất",
      description: "Giao dịch chưa hoàn tất hoặc đã hết hạn. Bạn có thể thử lại từ trang chi tiết đơn đặt."
    };
  }
  return {
    icon: Hourglass,
    tone: "bg-warn-soft text-warn",
    ring: "bg-gold/25",
    title: "Thanh toán đang xử lý",
    description: "Trạng thái giao dịch đang chờ xác nhận. Vui lòng kiểm tra lại sau ít phút."
  };
}

export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<{ status?: string; bookingId?: string; paymentError?: string; demo?: string }> }) {
  const params = await searchParams;
  const paymentError = cleanPaymentError(params.paymentError);
  const user = params.bookingId ? await getCurrentUser() : null;
  if (params.bookingId && !user?.authenticated) {
    return <AccessDenied description="Vui lòng đăng nhập để xem trạng thái thanh toán của đơn đặt." />;
  }
  if (user?.authorizationError) {
    return <AccessDenied description={user.authorizationError} />;
  }
  const payment = params.bookingId ? await getPaymentStatus(params.bookingId, user?.role ?? "CUSTOMER") : null;
  const status = paymentError ? "FAILED" : (payment?.status ?? normalizePaymentStatus(params.status));
  const view = copyFor(status);
  const StatusIcon = view.icon;
  const shouldPoll = Boolean(params.bookingId && status === "PENDING" && !paymentError);

  return (
    <main id="main" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-4 py-14 text-ink">
      <div className="pointer-events-none absolute -left-32 -top-32 size-[30rem] rounded-full bg-leaf-soft blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 size-[28rem] rounded-full bg-leaf-soft blur-3xl" aria-hidden="true" />
      <section className="animate-fade-up relative w-full max-w-2xl rounded-[32px] border border-line-soft bg-white p-8 text-center shadow-lift md:p-12">
        <Link className="mx-auto mb-8 flex w-fit items-center gap-2 font-heading text-lg text-ink" href="/">
          <Leaf className="size-4 text-brand" aria-hidden="true" /> Homestay <span className="italic text-gold">Tây Ninh</span>
        </Link>
        <div className="relative mx-auto grid size-24 place-items-center">
          <span className={`absolute inset-0 animate-ping rounded-full opacity-60 [animation-duration:2.4s] ${view.ring}`} aria-hidden="true" />
          <span className={`relative grid size-24 place-items-center rounded-full ${view.tone}`}>
            <StatusIcon className={`size-11 ${status === "PENDING" || status === "INITIATED" ? "animate-pulse" : ""}`} aria-hidden="true" />
          </span>
        </div>
        <p className="eyebrow mt-8">Kết quả thanh toán</p>
        <h1 className="display mt-3 text-4xl text-ink md:text-5xl">{view.title}</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted">{view.description}</p>
        {status === "PENDING" && (
          <p className="mx-auto mt-3 max-w-lg text-sm font-semibold leading-6 text-warn">
            Trạng thái có thể mất vài phút để cập nhật. Không tạo lại booking trong lúc giao dịch đang xử lý.
          </p>
        )}
        {paymentError && (
          <div className="mx-auto mt-5 max-w-md rounded-2xl border border-danger-soft bg-brand-wash p-5 text-sm font-semibold text-danger">
            Đơn đã được tạo, chỉ phần thanh toán chưa hoàn tất. Không cần đặt lại phòng. Lỗi thanh toán: {paymentError}
          </div>
        )}
        <PaymentStatusPoller enabled={shouldPoll} />
        <div className="mt-5 flex justify-center">
          <PaymentBadge status={status} />
        </div>
        {payment && (
          <div className="mx-auto mt-6 max-w-md rounded-2xl bg-cream p-5 text-sm text-ink-muted">
            <div className="flex justify-between gap-4"><span>Mã thanh toán</span><strong>{payment.id}</strong></div>
            <div className="mt-2 flex justify-between gap-4"><span>Số tiền</span><strong>{money(payment.amount)}</strong></div>
          </div>
        )}
        {payment?.qrUrl && status !== "PAID" && (
          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-line-soft bg-white p-5">
            <p className="font-heading text-2xl text-ink">Quét mã để thanh toán</p>
            {/* QR URL is returned dynamically by the payment provider, so next/image cannot safely whitelist it. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="mx-auto mt-4 h-64 w-64 rounded-xl bg-white object-contain" src={payment.qrUrl} alt="Mã QR thanh toán" />
            <p className="mt-3 text-xs leading-5 text-muted">Sau khi chuyển khoản, trạng thái có thể cần vài phút để cập nhật.</p>
          </div>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {payment?.checkoutUrl && status !== "PAID" && (
            <a className="btn-primary" href={payment.checkoutUrl} rel="noreferrer" target="_blank">
              Mở trang thanh toán
            </a>
          )}
          {params.bookingId && status === "PENDING" && (
            <Link className={payment?.checkoutUrl ? "btn-secondary" : "btn-primary"} href={`/payment/result?bookingId=${params.bookingId}&status=pending`}>
              Kiểm tra lại trạng thái
            </Link>
          )}
          {params.bookingId && (status === "FAILED" || status === "CANCELLED") && (
            <Link className="btn-primary" href={`/bookings/${params.bookingId}`}>
              Về chi tiết đơn để thử thanh toán lại
            </Link>
          )}
          <Link className={params.bookingId && status !== "PAID" ? "btn-secondary" : "btn-primary"} href="/bookings">Về chuyến đi của tôi</Link>
          {params.bookingId && status !== "FAILED" && status !== "CANCELLED" && <Link className="btn-secondary" href={`/bookings/${params.bookingId}`}>Xem chi tiết đơn</Link>}
          {!params.bookingId && <Link className="btn-secondary" href="/homestays">Tiếp tục khám phá</Link>}
        </div>
      </section>
    </main>
  );
}
