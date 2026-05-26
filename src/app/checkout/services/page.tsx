import Link from "next/link";
import { ActionButton } from "@/components/action-button";
import { AppTopBar, Stepper } from "@/components/customer-ui";
import { getCheckoutPreview, money } from "@/lib/api";

export const dynamic = "force-dynamic";

type CheckoutServiceParams = {
  homestayId?: string;
  roomId?: string;
  guestName?: string;
  guestPhone?: string;
  guestCount?: string;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
};

export default async function CheckoutServicesPage({ searchParams }: { searchParams: Promise<CheckoutServiceParams> }) {
  const params = await searchParams;
  const preview = await getCheckoutPreview(params);
  const preservedEntries = Object.entries(params).filter(([, value]) => value);
  const backParams = new URLSearchParams();
  preservedEntries.forEach(([key, value]) => backParams.set(key, value ?? ""));

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

        <form action="/checkout/confirm" className="grid gap-6 lg:grid-cols-[1fr_390px]" method="get">
          {preservedEntries.map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
          <div className="space-y-6">
            <section className="card p-6 md:p-8">
              <p className="eyebrow">Đã bao gồm</p>
              <h2 className="mt-2 font-heading text-3xl text-[#9a4029]">Dịch vụ trong giá phòng</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {preview.includedServices.map((service) => (
                  <div className="rounded-2xl border border-[#d7e2da] bg-[#e8f0eb] p-4" key={service.id}>
                    <h3 className="font-bold text-[#466550]">{service.name}</h3>
                    <p className="mt-1 text-sm text-[#75675f]">Bao gồm trong giá phòng</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="card p-6 md:p-8">
              <p className="eyebrow">Chọn thêm</p>
              <h2 className="mt-2 font-heading text-3xl text-[#9a4029]">Dịch vụ đặt thêm</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {preview.homestay.services.map((service) => (
                  <label className="grid gap-4 rounded-2xl border border-[#eadfd4] bg-white p-4 shadow-[0_10px_30px_rgba(154,64,41,0.05)]" key={service.id}>
                    <div>
                      <h3 className="font-bold text-[#1c1c19]">{service.name}</h3>
                      {service.description && <p className="mt-1 text-sm text-[#75675f]">{service.description}</p>}
                      <p className="mt-2 font-bold text-[#9a4029]">{money(service.unitPrice)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-[#75675f]">Số lượng</span>
                      <input className="field h-fit w-28" name={`service:${service.id}`} type="number" min="0" defaultValue="0" aria-label={`Số lượng ${service.name}`} />
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-2xl bg-white p-6 shadow-[0_24px_80px_rgba(123,41,20,0.1)] lg:sticky lg:top-28">
            <h2 className="border-b border-[#e8e1d5] pb-4 font-heading text-2xl text-[#1c1c19]">Tóm tắt đơn đặt</h2>
            <h3 className="mt-5 font-bold text-[#1c1c19]">{preview.room.name}</h3>
            <p className="mt-1 text-sm text-[#75675f]">{preview.nights} đêm · {preview.guestCount} khách</p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><span>Tiền phòng</span><strong>{money(preview.roomTotal)}</strong></div>
              <div className="flex justify-between"><span>Dịch vụ</span><strong>{money(preview.serviceTotal)}</strong></div>
              <div className="flex justify-between"><span>Thuế/phí</span><strong>{money(preview.taxTotal)}</strong></div>
              <div className="border-t border-[#e8e1d5] pt-4">
                <div className="flex justify-between text-lg"><span className="font-bold">Tổng hóa đơn</span><strong className="text-[#9a4029]">{money(preview.grandTotal)}</strong></div>
                <p className="mt-1 text-xs text-[#75675f]">Đã bao gồm thuế, phí</p>
              </div>
            </div>
            <ActionButton className="btn-primary mt-6 w-full" pendingLabel="Đang chuyển bước...">Tiếp tục xác nhận</ActionButton>
            <Link className="btn-secondary mt-3 w-full" href={`/checkout?${backParams.toString()}`}>Quay lại</Link>
          </aside>
        </form>
      </div>
    </main>
  );
}
