import { ActionButton } from "@/components/action-button";
import { AppTopBar, Stepper } from "@/components/customer-ui";
import { getHomestay, getHomestays, money } from "@/lib/api";

export const dynamic = "force-dynamic";

type CheckoutParams = {
  homestayId?: string;
  roomId?: string;
  checkIn?: string;
  checkOut?: string;
  guestCount?: string;
  guests?: string;
  error?: string;
};

function isoDateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<CheckoutParams> }) {
  const params = await searchParams;
  const homestays = await getHomestays("CUSTOMER");
  const selectedId = params.homestayId ?? homestays[0]?.id;
  const homestay = await getHomestay(selectedId, "CUSTOMER");
  const room = homestay.rooms.find((item) => item.id === params.roomId) ?? homestay.rooms[0];
  if (!room || (params.roomId && room.id !== params.roomId)) {
    throw new Error("Phòng không khả dụng cho homestay này.");
  }

  const defaultCheckIn = params.checkIn ?? isoDateAfter(14);
  const defaultCheckOut = params.checkOut ?? isoDateAfter(16);
  const defaultGuestCount = params.guestCount ?? params.guests ?? "2";

  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <header className="mb-8 grid gap-5 lg:grid-cols-[1fr_430px] lg:items-end">
          <div>
            <p className="eyebrow">Checkout</p>
            <h1 className="mt-2 font-heading text-4xl text-[#1c1c19] md:text-5xl">Hoàn tất đặt phòng</h1>
            <p className="mt-3 text-[#56423d]">{homestay.name} · {room.name}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-[0_18px_55px_rgba(123,41,20,0.08)]">
            <Stepper active={1} />
          </div>
        </header>

        {params.error && <div className="mb-6 rounded-2xl border border-[#ffdad6] bg-[#fff8f7] p-4 text-sm font-semibold text-[#93000a]">{params.error}</div>}

        <form action="/checkout/services" className="grid gap-6 lg:grid-cols-[1fr_390px]" method="get">
          <input type="hidden" name="homestayId" value={homestay.id} />
          <section className="space-y-6">
            <div className="card p-6 md:p-8">
              <p className="eyebrow">Bước 1</p>
              <h2 className="mt-2 font-heading text-3xl text-[#1c1c19]">Thông tin khách hàng</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">Họ tên
                  <input className="field" name="guestName" placeholder="Nguyễn Văn A" required minLength={2} />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">Số điện thoại
                  <input className="field" name="guestPhone" placeholder="0901234567" required pattern="^[0-9+ ]{8,15}$" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530] md:col-span-2">Ghi chú
                  <textarea className="field min-h-24" name="notes" placeholder="Ví dụ: cần chuẩn bị cũi em bé, ăn chay..." />
                </label>
              </div>
            </div>

            <div className="card p-6 md:p-8">
              <p className="eyebrow">Lưu trú</p>
              <h2 className="mt-2 font-heading text-3xl text-[#1c1c19]">Phòng và ngày ở</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530] md:col-span-2">Phòng
                  <select className="field" name="roomId" defaultValue={room.id} required>
                    {homestay.rooms.map((item) => <option key={item.id} value={item.id}>{item.name} · {money(item.pricePerNight)} · tối đa {item.capacity} khách</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">Nhận phòng
                  <input className="field" name="checkIn" type="date" defaultValue={defaultCheckIn} required />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">Trả phòng
                  <input className="field" name="checkOut" type="date" defaultValue={defaultCheckOut} required />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">Số khách
                  <input className="field" name="guestCount" type="number" min="1" max={room.capacity} defaultValue={defaultGuestCount} required />
                </label>
              </div>
            </div>

            <div className="card p-6 md:p-8">
              <p className="eyebrow">Thanh toán</p>
              <h2 className="mt-2 font-heading text-3xl text-[#1c1c19]">Phương thức demo</h2>
              <label className="mt-5 flex items-start gap-3 rounded-2xl border border-[#dcc0ba] bg-white p-4">
                <input className="mt-1 h-5 w-5 accent-[#9a4029]" name="paymentMethod" type="radio" defaultChecked value="DEMO" />
                <span>
                  <span className="block font-bold text-[#3f3530]">Thanh toán demo</span>
                  <span className="text-sm text-[#75675f]">Màn xác nhận sẽ mô phỏng kết quả thanh toán. Chưa trừ tiền thật.</span>
                </span>
              </label>
            </div>
          </section>

          <aside className="h-fit rounded-2xl bg-white p-6 shadow-[0_24px_80px_rgba(123,41,20,0.1)] lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-2xl bg-[#efe7dc]">
              <div className="image-shell h-48 bg-cover bg-center" style={{ backgroundImage: `url(${homestay.imageUrl})` }} />
              <div className="bg-[#466550] p-4 text-white">
                <h3 className="font-heading text-2xl">{homestay.name}</h3>
                <p className="text-sm text-white/80">{room.name}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4"><span className="text-[#75675f]">Phòng</span><strong>{money(room.pricePerNight)} / đêm</strong></div>
              <div className="flex justify-between gap-4"><span className="text-[#75675f]">Dịch vụ</span><span>Chọn ở bước sau</span></div>
              <div className="flex justify-between gap-4"><span className="text-[#75675f]">Thuế/phí</span><span>Hiển thị ở bước xác nhận</span></div>
            </div>
            <ActionButton className="btn-primary mt-6 w-full" pendingLabel="Đang chuyển bước...">Tiếp tục chọn dịch vụ</ActionButton>
            <p className="mt-4 text-center text-xs text-[#75675f]">Thông tin đặt phòng được giữ xuyên suốt các bước.</p>
          </aside>
        </form>
      </div>
    </main>
  );
}
