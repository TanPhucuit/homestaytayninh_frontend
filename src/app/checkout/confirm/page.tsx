import Link from "next/link";
import { PageShell, Stepper } from "@/components/customer-ui";
import { getCheckoutPreview, money } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function CheckoutConfirmPage({ searchParams }: { searchParams: Promise<{ homestayId?: string }> }) {
  const params = await searchParams;
  const preview = await getCheckoutPreview(params.homestayId);

  return (
    <PageShell
      eyebrow="Checkout Step 3"
      title="Xác nhận thanh toán"
      description="Tổng hợp tiền phòng, dịch vụ, thuế/phí và trạng thái payment trước khi tạo yêu cầu ApiPay."
    >
      <div className="mb-6">
        <Stepper active={3} />
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_390px]">
        <div className="card p-6">
          <p className="eyebrow">Booking Review</p>
          <h2 className="mt-2 font-heading text-3xl text-[#7b2914]">{preview.homestay.name}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-[#fdf9f4] p-5">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#466550]">Phòng</p>
              <h3 className="mt-2 font-heading text-2xl text-[#7b2914]">{preview.room.name}</h3>
              <p className="mt-2 text-sm text-[#75675f]">{preview.nights} đêm · {preview.guestCount} khách</p>
              <p className="mt-4 font-bold text-[#9a4029]">{money(preview.roomTotal)}</p>
            </div>
            <div className="rounded-3xl bg-[#fdf9f4] p-5">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#466550]">Payment</p>
              <h3 className="mt-2 font-heading text-2xl text-[#7b2914]">ApiPay</h3>
              <p className="mt-2 text-sm text-[#75675f]">Payment request được tạo qua backend để không lộ secret key ở frontend.</p>
              <span className="mt-4 inline-flex rounded-full bg-[#ffdad2] px-4 py-2 text-sm font-bold text-[#7b2914]">Pending provider</span>
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-white p-5 shadow-[0_18px_50px_rgba(154,64,41,0.08)]">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9a4029]">Dịch vụ đặt thêm</p>
            <div className="mt-4 space-y-3">
              {preview.selectedServices.map((service) => (
                <div className="flex justify-between gap-4 rounded-2xl bg-[#fdf9f4] p-4" key={service.id}>
                  <div>
                    <p className="font-bold text-[#466550]">{service.name}</p>
                    <p className="text-sm text-[#75675f]">SL {service.quantity} · {money(service.unitPrice)}</p>
                  </div>
                  <p className="font-bold text-[#9a4029]">{money(service.total)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <p className="eyebrow">Order Summary</p>
          <h2 className="mt-2 font-heading text-3xl text-[#7b2914]">Tổng thanh toán</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><span>Tiền phòng</span><strong>{money(preview.roomTotal)}</strong></div>
            <div className="flex justify-between"><span>Dịch vụ</span><strong>{money(preview.serviceTotal)}</strong></div>
            <div className="flex justify-between"><span>Thuế/phí</span><strong>{money(preview.taxTotal)}</strong></div>
            <div className="border-t border-[#e8e1d5] pt-4">
              <div className="flex justify-between text-lg">
                <span className="font-bold">Grand total</span>
                <strong className="text-[#9a4029]">{money(preview.grandTotal)}</strong>
              </div>
            </div>
          </div>
          <Link className="btn-primary mt-6 w-full" href={`/checkout?homestayId=${preview.homestay.id}`}>
            Tạo booking thật
          </Link>
        </aside>
      </section>
    </PageShell>
  );
}
