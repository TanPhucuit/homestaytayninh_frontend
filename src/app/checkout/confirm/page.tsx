import Link from "next/link";
import { AppTopBar, Stepper } from "@/components/customer-ui";
import { getCheckoutPreview, money } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function CheckoutConfirmPage({ searchParams }: { searchParams: Promise<{ homestayId?: string }> }) {
  const params = await searchParams;
  const preview = await getCheckoutPreview(params.homestayId);

  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div>
            <p className="eyebrow">Thanh toán</p>
            <h1 className="mt-2 font-heading text-4xl text-[#9a4029] md:text-5xl">Xác nhận & Thanh toán</h1>
            <p className="mt-3 text-[#56423d]">Hoàn tất đặt phòng của bạn an toàn và nhanh chóng.</p>
          </div>
          <div className="rounded-[24px] bg-white p-5 shadow-[0_18px_55px_rgba(123,41,20,0.08)]">
            <Stepper active={3} />
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1fr_390px]">
          <div className="space-y-6">
            <section className="card p-6 md:p-8">
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
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#466550]">Phương thức thanh toán</p>
                  <h3 className="mt-2 font-heading text-2xl text-[#7b2914]">ApiPay</h3>
                  <p className="mt-2 text-sm text-[#75675f]">Payment request được tạo qua backend để không lộ secret key ở frontend.</p>
                  <span className="mt-4 inline-flex rounded-full bg-[#ffdad2] px-4 py-2 text-sm font-bold text-[#7b2914]">Chờ provider</span>
                </div>
              </div>
            </section>

            <section className="card p-6 md:p-8">
              <h2 className="font-heading text-3xl text-[#9a4029]">Chính sách & Điều khoản</h2>
              <div className="mt-5 space-y-4 text-sm leading-6 text-[#56423d]">
                <label className="flex items-start gap-3 rounded-2xl bg-[#fdf9f4] p-4">
                  <input className="mt-1 size-4 accent-[#9a4029]" type="checkbox" defaultChecked />
                  <span>Tôi đồng ý với chính sách hủy phòng, điều khoản sử dụng dịch vụ và xác nhận thông tin đặt phòng là chính xác.</span>
                </label>
                <div className="rounded-2xl border border-[#dcc0ba] p-4">
                  ApiPay được backend tạo payment URL/QR sau khi cổng thanh toán được cấu hình. Nếu provider chưa sẵn sàng, hệ thống sẽ hiển thị lỗi thanh toán cụ thể.
                </div>
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
            <Link className="btn-primary mt-6 w-full" href={`/checkout?homestayId=${preview.homestay.id}`}>Tạo booking thật</Link>
            <Link className="btn-secondary mt-3 w-full" href={`/checkout/services?homestayId=${preview.homestay.id}`}>Quay lại</Link>
          </aside>
        </section>
      </div>
    </main>
  );
}
