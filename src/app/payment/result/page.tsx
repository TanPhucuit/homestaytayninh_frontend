import Link from "next/link";
import { PaymentStatusBadge, PaymentUiStatus } from "@/components/payment-ui";
import { SectionHeading } from "@/components/ui";

const normalizeStatus = (value?: string): PaymentUiStatus => {
  const upper = String(value ?? "pending").toUpperCase();
  if (upper === "UNPAID" || upper === "PENDING" || upper === "PAID" || upper === "FAILED" || upper === "EXPIRED") return upper;
  return "PENDING";
};

const resultCopy: Record<PaymentUiStatus, { title: string; description: string; primary: string; href: string; retry: boolean }> = {
  UNPAID: {
    title: "ChÆ°a thanh toÃ¡n",
    description: "Payment request chÆ°a Ä‘Æ°á»£c hoÃ n táº¥t. Báº¡n cÃ³ thá»ƒ quay láº¡i checkout Ä‘á»ƒ táº¡o yÃªu cáº§u thanh toÃ¡n.",
    primary: "Quay láº¡i checkout",
    href: "/checkout",
    retry: true
  },
  PENDING: {
    title: "Äang chá» thanh toÃ¡n",
    description: "ApiPay Ä‘ang xá»­ lÃ½ giao dá»‹ch. Há»‡ thá»‘ng sáº½ cáº­p nháº­t booking sau khi nháº­n callback.",
    primary: "Xem booking",
    href: "/bookings",
    retry: false
  },
  PAID: {
    title: "Thanh toÃ¡n thÃ nh cÃ´ng",
    description: "Payment Ä‘Ã£ Ä‘Æ°á»£c ghi nháº­n. Booking sáº½ chuyá»ƒn sang tráº¡ng thÃ¡i phÃ¹ há»£p sau khi owner xÃ¡c nháº­n phÃ²ng.",
    primary: "Xem booking cá»§a tÃ´i",
    href: "/bookings",
    retry: false
  },
  FAILED: {
    title: "Thanh toÃ¡n tháº¥t báº¡i",
    description: "Giao dá»‹ch khÃ´ng thÃ nh cÃ´ng. KhÃ´ng cáº­p nháº­t booking thÃ nh paid. Báº¡n cÃ³ thá»ƒ thá»­ láº¡i.",
    primary: "Thá»­ láº¡i thanh toÃ¡n",
    href: "/checkout",
    retry: true
  },
  EXPIRED: {
    title: "Payment URL Ä‘Ã£ háº¿t háº¡n",
    description: "ÄÆ°á»ng dáº«n thanh toÃ¡n háº¿t háº¡n. HÃ£y táº¡o payment request má»›i Ä‘á»ƒ tiáº¿p tá»¥c.",
    primary: "Táº¡o payment má»›i",
    href: "/checkout",
    retry: true
  }
};

export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const status = normalizeStatus(params.status);
  const copy = resultCopy[status];

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <SectionHeading
        eyebrow="ApiPay result"
        title={copy.title}
        description={copy.description}
      />

      <section className="card mt-8 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[#75675f]">MÃ£ payment</p>
            <h2 className="mt-1 text-3xl font-bold text-[#466550]">AP-20260526-0001</h2>
          </div>
          <PaymentStatusBadge status={status} />
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl bg-[#fdf9f4] p-4 text-sm md:grid-cols-3">
          <div>
            <p className="text-[#75675f]">Provider</p>
            <p className="font-bold">Mock ApiPay</p>
          </div>
          <div>
            <p className="text-[#75675f]">Booking</p>
            <p className="font-bold">bk-pending-1</p>
          </div>
          <div>
            <p className="text-[#75675f]">Callback</p>
            <p className="font-bold">Idempotent</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={copy.href} className="btn-primary">{copy.primary}</Link>
          {copy.retry && <Link href="/checkout" className="btn-secondary">Thá»­ láº¡i thanh toÃ¡n</Link>}
          <Link href="/bookings" className="btn-secondary">Vá» lá»‹ch sá»­ booking</Link>
        </div>
      </section>
    </main>
  );
}

