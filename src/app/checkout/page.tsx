import { AppTopBar, Stepper } from "@/components/customer-ui";
import { getHomestay, getHomestays, money } from "@/lib/api";

export const dynamic = "force-dynamic";

function isoDateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ homestayId?: string; roomId?: string; error?: string }> }) {
  const params = await searchParams;
  const homestays = await getHomestays("CUSTOMER");
  const selectedId = params.homestayId ?? homestays[0]?.id;
  const homestay = await getHomestay(selectedId, "CUSTOMER");
  const room = homestay.rooms.find((item) => item.id === params.roomId) ?? homestay.rooms[0];
  if (!room || (params.roomId && room.id !== params.roomId)) {
    throw new Error("Phòng không khả dụng cho homestay này.");
  }
  const defaultCheckIn = isoDateAfter(14);
  const defaultCheckOut = isoDateAfter(16);

  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <header className="mb-8">
          <p className="eyebrow">Checkout</p>
          <h1 className="mt-2 font-heading text-4xl text-[#1c1c19] md:text-5xl">Hoàn tất đặt phòng</h1>
          <p className="mt-3 text-[#56423d]">{homestay.name} · {room.name}</p>
        </header>

        <div className="mb-8 rounded-[24px] bg-white p-5 shadow-[0_18px_55px_rgba(123,41,20,0.08)]">
          <Stepper active={1} />
        </div>

        {params.error && (
          <div className="mb-6 rounded-2xl border border-[#ffdad6] bg-[#fff8f7] p-4 text-sm font-semibold text-[#93000a]">
            {params.error}
          </div>
        )}
        <form action="/checkout/services" className="grid gap-6 lg:grid-cols-[1fr_390px]" method="get">
          <input type="hidden" name="homestayId" value={homestay.id} />

          <section className="space-y-6">
            <div className="card p-6">
              <h2 className="font-heading text-3xl text-[#1c1c19]">1. Thông tin khách hàng</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                  Họ tên
                  <input className="field" name="guestName" placeholder="Nguyễn Văn A" required minLength={2} />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                  Số điện thoại
                  <input className="field" name="guestPhone" placeholder="0901234567" required pattern="^[0-9+ ]{8,15}$" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530] md:col-span-2">
                  Ghi chú
                  <textarea className="field min-h-24" name="notes" placeholder="Ví dụ: cần chuẩn bị cũi em bé, ăn chay..." />
                </label>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-heading text-3xl text-[#1c1c19]">2. Lưu trú và dịch vụ</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                  Phòng
                  <select className="field" name="roomId" defaultValue={room.id} required>
                    {homestay.rooms.map((item) => (
                      <option key={item.id} value={item.id}>{item.name} · {money(item.pricePerNight)} · tối đa {item.capacity} khách</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                  Nhận phòng
                  <input className="field" name="checkIn" type="date" defaultValue={defaultCheckIn} required />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                  Trả phòng
                  <input className="field" name="checkOut" type="date" defaultValue={defaultCheckOut} required />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                  Số khách
                  <input className="field" name="guestCount" type="number" min="1" max={room.capacity} defaultValue="2" required />
                </label>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-heading text-3xl text-[#1c1c19]">3. Phương thức thanh toán</h2>
              <div className="mt-5 grid gap-3">
                <label className="flex items-start gap-3 rounded-2xl border border-[#dcc0ba] bg-white p-4">
                  <input className="mt-1 h-5 w-5 accent-[#9a4029]" name="paymentMethod" type="radio" defaultChecked value="APIPAY" />
                  <span>
                    <span className="block font-bold text-[#3f3530]">ApiPay</span>
                    <span className="text-sm text-[#75675f]">Backend tạo payment request, frontend không giữ secret key.</span>
                  </span>
                </label>
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-[24px] bg-white p-6 shadow-[0_24px_80px_rgba(123,41,20,0.1)] lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-[20px]">
              <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${homestay.imageUrl})` }} />
              <div className="bg-[#466550] p-4 text-white">
                <h3 className="font-heading text-2xl">{homestay.name}</h3>
                <p className="text-sm text-white/80">{room.name}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4"><span className="text-[#75675f]">Phòng</span><strong>{money(room.pricePerNight)} / đêm</strong></div>
              <div className="flex justify-between gap-4"><span className="text-[#75675f]">Dịch vụ</span><span>Nhập theo số lượng</span></div>
              <div className="flex justify-between gap-4"><span className="text-[#75675f]">Thuế/phí</span><span>Tính tại backend</span></div>
            </div>
            <button className="btn-primary mt-6 w-full" type="submit">Tiếp tục chọn dịch vụ</button>
            <p className="mt-4 text-center text-xs text-[#75675f]">Thông tin thanh toán được xử lý an toàn qua backend.</p>
          </aside>
        </form>
      </div>
    </main>
  );
}
