import { StitchFrame } from "@/components/stitch-frame";
import { stitchPages } from "@/lib/stitch-pages";

function resolvePaymentScreen(status?: string) {
  const normalized = String(status ?? "pending").toLowerCase();
  if (normalized === "paid" || normalized === "success") return stitchPages.paymentSuccess;
  if (normalized === "failed" || normalized === "expired") return stitchPages.paymentFailed;
  return stitchPages.paymentPending;
}

export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  return <StitchFrame src={resolvePaymentScreen(params.status)} title="Kết quả thanh toán ApiPay" />;
}

