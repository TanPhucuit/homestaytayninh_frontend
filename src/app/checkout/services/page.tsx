import Link from "next/link";
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
};

export default async function CheckoutServicesPage({ searchParams }: { searchParams: Promise<CheckoutServiceParams> }) {
  const params = await searchParams;
  const preview = await getCheckoutPreview(params);
  const preservedEntries = Object.entries(params).filter(([, value]) => value);

  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div>
            <p className="eyebrow">Thanh toán</p>
            <h1 className="mt-2 font-heading text-4xl text-[#9a4029] md:text-5xl">Dịch vụ bổ sung</h1>
            <p className="mt-3 text-[#56423d]">Tùy chỉnh kỳ nghỉ của bạn thêm trọn vẹn. Bạn có thể thay đổi sau nếu muốn.</p>
          </div>
          <div className="rounded-[24px] bg-white p-5 shadow-[0_18px_55px_rgba(123,41,20,0.08)]">
            <Stepper active={2} />
          </div>
        </div>

        <form action="/checkout/confirm" className="grid gap-6 lg:grid-cols-[1fr_390px]" method="get">
          {preservedEntries.map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
          <div className="space-y-6">
            <section className="card p-6 md:p-8">
              <h2 className="font-heading text-3xl text-[#9a4029]">Dịch vụ đã bao gồm</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {preview.includedServices.map((service) => (
                  <div className="rounded-2xl bg-[#fdf9f4] p-4" key={service.id}>
                    <h3 className="font-bold text-[#1c1c19]">{service.name}</h3>
                    <p className="mt-1 text-sm text-[#75675f]">Bao gồm trong giá phòng</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="card p-6 md:p-8">
              <h2 className="font-heading text-3xl text-[#9a4029]">Dịch vụ đặt thêm</h2>
              <p className="mt-2 text-[#75675f]">Chọn số lượng dịch vụ muốn đặt cùng booking.</p>
              <div className="mt-6 space-y-4">
                {preview.homestay.services.map((service) => (
                  <label className="grid gap-4 rounded-3xl bg-[#fdf9f4] p-4 md:grid-cols-[1fr_auto]" key={service.id}>
                    <div>
                      <h3 className="font-bold text-[#1c1c19]">{service.name}</h3>
                      {service.description && <p className="mt-1 text-sm text-[#75675f]">{service.description}</p>}
                      <p className="mt-2 font-bold text-[#9a4029]">{money(service.unitPrice)}</p>
                    </div>
                    <input className="field h-fit w-28" name={`service:${service.id}`} type="number" min="0" defaultValue="0" aria-label={`Số lượng ${service.name}`} />
                  </label>
                ))}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-[24px] bg-white p-6 shadow-[0_24px_80px_rgba(123,41,20,0.1)] lg:sticky lg:top-28">
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
            <button className="btn-primary mt-6 w-full" type="submit">Tiếp tục xác nhận</button>
            <Link className="btn-secondary mt-3 w-full" href={`/checkout?homestayId=${preview.homestay.id}&roomId=${preview.room.id}`}>Quay lại</Link>
          </aside>
        </form>
      </div>
    </main>
  );
}
