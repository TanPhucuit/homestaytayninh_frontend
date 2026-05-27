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
  guestEmail?: string;
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
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_430px]">
          <div>
            <p className="eyebrow">Thanh toán</p>
            <h1 className="mt-2 font-heading text-4xl text-[#9a4029] md:text-5xl">Xác nhận đặt phòng</h1>
            <p className="mt-3 text-[#56423d]">Kiểm tra thông tin trước khi tạo đơn và chuyển sang cổng thanh toán ApiPay.</p>
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
              <p className="eyebrow">Xác nhận</p>
              <h2 className="mt-2 font-heading text-3xl text-[#7b2914]">Bảng tóm tắt đặt phòng</h2>
              <div className="mt-6 overflow-hidden rounded-2xl border border-[#e8e1d5] bg-white">
                {[
                  ["Homestay", preview.homestay.name],
                  ["Phòng", preview.room.name],
                  ["Ngày nhận phòng", params.checkIn ?? "Chưa chọn"],
                  ["Ngày trả phòng", params.checkOut ?? "Chưa chọn"],
                  ["Số đêm", `${preview.nights} đêm`],
                  ["Số khách", `${preview.guestCount} khách`],
                  ["Khách đặt", params.guestName ?? ""],
                  ["Điện thoại", params.guestPhone ?? ""],
                  ["Email", params.guestEmail || "Không cung cấp"],
                  ["Ghi chú", params.notes || "Không có"]
                ].map(([label, value]) => (
                  <div className="grid gap-2 border-b border-[#e8e1d5] px-4 py-3 text-sm last:border-b-0 md:grid-cols-[180px_1fr]" key={label}>
                    <span className="font-bold text-[#466550]">{label}</span>
                    <span className="text-[#56423d]">{value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="card p-6 md:p-8">
              <h2 className="font-heading text-3xl text-[#9a4029]">Dịch vụ đã chọn</h2>
              <div className="mt-5 space-y-3">
                {preview.selectedServices.length ? preview.selectedServices.map((service) => (
                  <div className="flex justify-between gap-4 rounded-2xl bg-[#fdf9f4] p-4 text-sm" key={service.id}>
                    <span>{service.name} · SL {service.quantity}</span>
                    <strong>{money(service.total)}</strong>
                  </div>
                )) : <p className="rounded-2xl bg-[#fdf9f4] p-4 text-sm text-[#75675f]">Không chọn dịch vụ bổ sung.</p>}
              </div>
            </section>

            <section className="card p-6 md:p-8">
              <h2 className="font-heading text-3xl text-[#9a4029]">Thanh toán qua ApiPay</h2>
              <div className="mt-5 space-y-4 text-sm leading-6 text-[#56423d]">
                <div className="rounded-2xl border border-[#fff3d6] bg-[#fff8e8] p-4 font-semibold text-[#7a4a12]">
                  Sau khi bấm thanh toán, bạn sẽ được chuyển sang trang thanh toán của ApiPay để hoàn tất giao dịch.
                </div>
                <label className="flex items-start gap-3 rounded-2xl bg-[#fdf9f4] p-4">
                  <input className="mt-1 size-4 accent-[#9a4029]" name="termsAccepted" type="checkbox" required />
                  <span>Tôi đồng ý với chính sách hủy phòng, điều khoản sử dụng dịch vụ và xác nhận thông tin đặt phòng là chính xác.</span>
                </label>
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
              <div className="flex justify-between"><span>Thuế 10%</span><strong>{money(preview.taxTotal)}</strong></div>
              <div className="border-t border-[#e8e1d5] pt-4">
                <div className="flex justify-between text-lg"><span className="font-bold">Tổng cộng</span><strong className="text-[#9a4029]">{money(preview.grandTotal)}</strong></div>
                <p className="mt-1 text-xs text-[#75675f]">Đã bao gồm thuế/phí nếu có</p>
              </div>
            </div>
            <ActionButton className="btn-primary mt-6 w-full" pendingLabel="Đang tạo thanh toán...">Thanh toán qua ApiPay</ActionButton>
            <Link className="btn-secondary mt-3 w-full" href={`/checkout/services?${backParams.toString()}`}>Quay lại</Link>
          </aside>
        </form>
      </div>
    </main>
  );
}
