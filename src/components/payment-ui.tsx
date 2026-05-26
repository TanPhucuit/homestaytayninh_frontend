import Link from "next/link";
import { money } from "@/lib/api";

export type PaymentUiStatus = "UNPAID" | "PENDING" | "PAID" | "FAILED" | "EXPIRED";

const paymentStatusCopy: Record<PaymentUiStatus, { label: string; description: string; className: string }> = {
  UNPAID: {
    label: "Unpaid",
    description: "ChÆ°a táº¡o hoáº·c chÆ°a má»Ÿ yÃªu cáº§u thanh toÃ¡n.",
    className: "bg-[#fdf9f4] text-[#75675f] ring-[#eadfd3]"
  },
  PENDING: {
    label: "Pending",
    description: "ÄÃ£ táº¡o payment request, Ä‘ang chá» ApiPay callback.",
    className: "bg-[#fdf9f4] text-[#9a4029] ring-[#eadfd3]"
  },
  PAID: {
    label: "Paid",
    description: "Thanh toÃ¡n thÃ nh cÃ´ng, booking vÃ  audit log Ä‘Ã£ Ä‘Æ°á»£c cáº­p nháº­t.",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100"
  },
  FAILED: {
    label: "Failed",
    description: "Thanh toÃ¡n tháº¥t báº¡i. KhÃ¡ch cÃ³ thá»ƒ thá»­ láº¡i hoáº·c chá»n phÆ°Æ¡ng thá»©c khÃ¡c.",
    className: "bg-red-50 text-red-700 ring-red-100"
  },
  EXPIRED: {
    label: "Expired",
    description: "Payment URL Ä‘Ã£ háº¿t háº¡n. Cáº§n táº¡o yÃªu cáº§u thanh toÃ¡n má»›i.",
    className: "bg-amber-50 text-amber-700 ring-amber-100"
  }
};

export function PaymentStatusBadge({ status }: { status: PaymentUiStatus }) {
  const copy = paymentStatusCopy[status];
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${copy.className}`}>{copy.label}</span>;
}

export function PaymentMethodSelector() {
  const methods = [
    { name: "ApiPay QR", description: "QuÃ©t mÃ£ QR báº±ng á»©ng dá»¥ng ngÃ¢n hÃ ng hoáº·c vÃ­ Ä‘iá»‡n tá»­.", active: true },
    { name: "ApiPay URL", description: "Má»Ÿ hosted payment URL Ä‘á»ƒ thanh toÃ¡n an toÃ n.", active: false },
    { name: "Thanh toÃ¡n táº¡i chá»—", description: "Demo manual provider cho Owner Staff xÃ¡c nháº­n.", active: false }
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {methods.map((method) => (
        <div key={method.name} className={`rounded-2xl border p-4 ${method.active ? "border-[#9a4029] bg-[#9a4029]/5" : "border-[#eadfd3] bg-white"}`}>
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold text-[#2b211d]">{method.name}</p>
            <span className={`size-4 rounded-full border ${method.active ? "border-[#9a4029] bg-[#9a4029]" : "border-[#eadfd3]"}`} />
          </div>
          <p className="mt-2 text-sm text-[#75675f]">{method.description}</p>
        </div>
      ))}
    </div>
  );
}

export function PaymentRequestPanel({ amount }: { amount: number }) {
  const paymentUrl = "https://mock.apipay.vn/pay/AP-20260526-0001";
  const qrCells = Array.from({ length: 49 }, (_, index) => (index * 7 + index) % 5 !== 0);

  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <div className="rounded-2xl border border-[#eadfd3] bg-white p-5">
        <div className="grid grid-cols-7 gap-1 rounded-2xl bg-[#fdf9f4] p-3">
          {qrCells.map((filled, index) => (
            <span key={index} className={`aspect-square rounded-[3px] ${filled ? "bg-[#2b211d]" : "bg-white"}`} />
          ))}
        </div>
        <p className="mt-4 text-center text-sm font-bold text-[#466550]">QR thanh toÃ¡n demo</p>
      </div>

      <div className="rounded-2xl border border-[#eadfd3] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Payment request</p>
            <h3 className="mt-2 text-2xl font-bold text-[#466550]">AP-20260526-0001</h3>
          </div>
          <PaymentStatusBadge status="PENDING" />
        </div>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span>Sá»‘ tiá»n</span>
            <strong>{money(amount)}</strong>
          </div>
          <div className="rounded-2xl bg-[#fdf9f4] p-4">
            <p className="font-bold text-[#466550]">Payment URL</p>
            <p className="mt-2 break-all text-sm text-[#75675f]">{paymentUrl}</p>
          </div>
          <p className="text-xs text-[#75675f]">Demo khÃ´ng xá»­ lÃ½ PCI trong app. App chá»‰ redirect/hiá»ƒn thá»‹ hosted payment URL tá»« provider.</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/payment/result?status=paid" className="btn-primary">MÃ´ phá»ng paid</Link>
          <Link href="/payment/result?status=failed" className="btn-secondary">MÃ´ phá»ng failed</Link>
          <Link href="/payment/result?status=expired" className="btn-secondary">MÃ´ phá»ng expired</Link>
        </div>
      </div>
    </div>
  );
}

export function PaymentStateGrid() {
  const statuses: PaymentUiStatus[] = ["UNPAID", "PENDING", "PAID", "FAILED", "EXPIRED"];
  return (
    <div className="grid gap-3 md:grid-cols-5">
      {statuses.map((status) => {
        const copy = paymentStatusCopy[status];
        return (
          <div key={status} className="rounded-2xl border border-[#eadfd3] bg-white p-4">
            <PaymentStatusBadge status={status} />
            <p className="mt-3 text-xs leading-5 text-[#75675f]">{copy.description}</p>
          </div>
        );
      })}
    </div>
  );
}

