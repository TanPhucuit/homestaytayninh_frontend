import { BookingStatus, PaymentStatus } from "@/lib/types";

const labels: Record<BookingStatus | PaymentStatus, string> = {
  PENDING: "Chá» xÃ¡c nháº­n",
  CONFIRMED: "ÄÃ£ xÃ¡c nháº­n",
  IN_STAY: "Äang tráº£i nghiá»‡m",
  COMPLETED: "ÄÃ£ hoÃ n thÃ nh",
  CANCELLED: "ÄÃ£ há»§y",
  INITIATED: "Khá»Ÿi táº¡o",
  PAID: "ÄÃ£ thanh toÃ¡n",
  FAILED: "Tháº¥t báº¡i"
};

export function StatusBadge({ status }: { status: BookingStatus | PaymentStatus }) {
  const tone: Record<BookingStatus | PaymentStatus, string> = {
    PENDING: "bg-[#fdf9f4] text-[#9a4029] ring-[#eadfd3]",
    CONFIRMED: "bg-[#466550]/10 text-[#466550] ring-[#466550]/15",
    IN_STAY: "bg-[#9a4029]/10 text-[#9a4029] ring-[#9a4029]/15",
    COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    CANCELLED: "bg-red-50 text-red-700 ring-red-100",
    INITIATED: "bg-[#fdf9f4] text-[#75675f] ring-[#eadfd3]",
    PAID: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    FAILED: "bg-red-50 text-red-700 ring-red-100"
  };

  return <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${tone[status]}`}>{labels[status]}</span>;
}

