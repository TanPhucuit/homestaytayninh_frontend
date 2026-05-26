import Link from "next/link";
import { ActionButton } from "@/components/action-button";
import { AppTopBar, Stepper } from "@/components/customer-ui";
import { FlashMessage } from "@/components/feedback-state";
import { getCheckoutPreview, money } from "@/lib/api";
import { flashFromSearchParams } from "@/lib/flash";
import { createCheckoutAction } from "../actions";

export const dynamic = "force-dynamic";

type CheckoutConfirmParams = {
  homestayId?: string;
  roomId?: string;
  guestName?: string;
  guestPhone?: string;
  guestCount?: string;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
  error?: string;
  success?: string;
  [key: string]: string | undefined;
};

function serviceItemsFromParams(params: CheckoutConfirmParams) {
  return Object.entries(params)
    .filter(([key]) => key.startsWith("service:"))
    .map(([key, value]) => ({ serviceId: key.replace("service:", ""), quantity: Number(value ?? 0) }))
    .filter((item) => Number.isInteger(item.quantity) && item.quantity > 0);
}

export default async function CheckoutConfirmPage({ searchParams }: { searchParams: Promise<CheckoutConfirmParams> }) {
  const params = await searchParams;
  const preview = await getCheckoutPreview({ ...params, serviceItems: serviceItemsFromParams(params) });
  const flash = flashFromSearchParams(params);
  const preservedEntries = Object.entries(params).filter(([key, value]) => value && key !== "error" && key !== "success");
  const backParams = new URLSearchParams();
  preservedEntries.forEach(([key, value]) => backParams.set(key, value ?? ""));

  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div>
            <p className="eyebrow">Thanh toán</p>
            <h1 className="mt-2 font-heading text-4xl text-[#9a4029] md:text-5xl">Xác nhận đặt phòng</h1>
            <p className="mt-3 text-[#56423d]">Kiểm tra thông tin trước khi tạo đơn. Kết quả thanh toán ở bước này là demo.</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-[0_18px_55px_rgba(123,41,20,0.08)]">
            <Stepper active={3} />
          </div>
        </div>

        <form action={createCheckoutAction} className="grid gap-6 lg:grid-cols-[1fr_390px]">
          {preservedEntries.map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
          <div className="space-y-6">
            <FlashMessage flash={flash} />
            <section className="card p-6 md:p-8">
              <p className="eyebrow">Booking Review</p>
              <h2 className="mt-2 font-heading text-3xl text-[#7b2914]">{preview.homestay.name}</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-[#fdf9f4] p-5">
                  <p className="text-sm font-bold uppercase text-[#466550]">Phòng</p>
                  <h3 className="mt-2 font-heading text-2xl text-[#7b2914]">{preview.room.name}</h3>
                  <p className="mt-2 text-sm text-[#75675f]">{preview.nights} đêm · {preview.guestCount} khách · {params.guestName}</p>
                  <p className="mt-4 font-bold text-[#9a4029]">{money(preview.roomTotal)}</p>
                </div>
                <div className="rounded-2xl bg-[#fdf9f4] p-5">
                  <p className="text-sm font-bold uppercase text-[#466550]">Thanh toán</p>
                  <h3 className="mt-2 font-heading text-2xl text-[#7b2914]">Demo thanh toán</h3>
                  <p className="mt-2 text-sm text-[#75675f]">Sau khi xác nhận, hệ thống tạo booking và hiển thị kết quả mô phỏng. Chưa trừ tiền thật.</p>
                  <span className="mt-4 inline-flex rounded-full bg-[#e8f0eb] px-4 py-2 text-sm font-bold text-[#466550]">Sẵn sàng xác nhận</span>
                </div>
              </div>
            </section>

            {preview.selectedServices.length > 0 && (
              <section className="card p-6 md:p-8">
                <h2 className="font-heading text-3xl text-[#9a4029]">Dịch vụ đã chọn</h2>
                <div className="mt-5 space-y-3">
                  {preview.selectedServices.map((service) => (
                    <div className="flex justify-between gap-4 rounded-2xl bg-[#fdf9f4] p-4 text-sm" key={service.id}>
                      <span>{service.name} · SL {service.quantity}</span>
                      <strong>{money(service.total)}</strong>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="card p-6 md:p-8">
              <h2 className="font-heading text-3xl text-[#9a4029]">Chính sách & Điều khoản</h2>
              <div className="mt-5 space-y-4 text-sm leading-6 text-[#56423d]">
                <label className="flex items-start gap-3 rounded-2xl bg-[#fdf9f4] p-4">
                  <input className="mt-1 size-4 accent-[#9a4029]" type="checkbox" defaultChecked />
                  <span>Tôi đồng ý với chính sách hủy phòng, điều khoản sử dụng dịch vụ và xác nhận thông tin đặt phòng là chính xác.</span>
                </label>
                <div className="rounded-2xl border border-[#dcc0ba] p-4">
                  Đây là màn thanh toán demo để hoàn thiện luồng đặt phòng. Khi cổng thanh toán thật sẵn sàng, bước này sẽ được kết nối ở đợt tích hợp riêng.
                </div>
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
            <ActionButton className="btn-primary mt-6 w-full" pendingLabel="Đang tạo booking...">Xác nhận đặt phòng</ActionButton>
            <Link className="btn-secondary mt-3 w-full" href={`/checkout/services?${backParams.toString()}`}>Quay lại</Link>
          </aside>
        </form>
      </div>
    </main>
  );
}
