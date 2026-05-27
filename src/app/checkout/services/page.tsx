import { CheckoutServicesForm } from "@/components/checkout-services-form";
import { AppTopBar, Stepper } from "@/components/customer-ui";
import { getCheckoutPreview } from "@/lib/api";

export const dynamic = "force-dynamic";

type CheckoutServiceParams = {
  homestayId?: string;
  roomId?: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  guestCount?: string;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
  [key: string]: string | undefined;
};

export default async function CheckoutServicesPage({ searchParams }: { searchParams: Promise<CheckoutServiceParams> }) {
  const params = await searchParams;
  const preview = await getCheckoutPreview(params);
  const preservedEntries = Object.entries(params).filter(([, value]) => value);
  const backParams = new URLSearchParams();
  preservedEntries.filter(([key]) => !key.startsWith("service:")).forEach(([key, value]) => backParams.set(key, value ?? ""));

  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_430px]">
          <div>
            <p className="eyebrow">Thanh toán</p>
            <h1 className="mt-2 font-heading text-4xl text-[#9a4029] md:text-5xl">Dịch vụ bổ sung</h1>
            <p className="mt-3 text-[#56423d]">Chọn dịch vụ muốn đặt cùng phòng. Có thể bỏ qua nếu không cần.</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-[0_18px_55px_rgba(123,41,20,0.08)]">
            <Stepper active={2} />
          </div>
        </div>

        <CheckoutServicesForm preview={preview} preservedEntries={preservedEntries as Array<[string, string]>} backHref={`/checkout?${backParams.toString()}`} />
      </div>
    </main>
  );
}
