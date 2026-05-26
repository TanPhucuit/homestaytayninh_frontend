import { PageShell } from "@/components/customer-ui";
import { getHomestay, getHomestays, money } from "@/lib/api";
import { createCheckoutAction } from "./actions";

export const dynamic = "force-dynamic";

function isoDateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ homestayId?: string }> }) {
  const params = await searchParams;
  const homestays = await getHomestays("CUSTOMER");
  const selectedId = params.homestayId ?? homestays[0]?.id;
  const homestay = await getHomestay(selectedId, "CUSTOMER");
  const room = homestay.rooms[0];
  const defaultCheckIn = isoDateAfter(14);
  const defaultCheckOut = isoDateAfter(16);

  return (
    <PageShell eyebrow="Booking Flow" title="Đặt phòng & thanh toán" description="Chọn phòng, dịch vụ bổ sung, nhập thông tin khách và tạo payment request ApiPay.">
      <form action={createCheckoutAction} className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <input type="hidden" name="homestayId" value={homestay.id} />
        <input type="hidden" name="roomId" value={room.id} />

        <section className="space-y-6">
          <div className="card p-6">
            <p className="eyebrow">Bước 1</p>
            <h2 className="mt-2 text-2xl text-[#9a4029]">Thông tin lưu trú</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">Ngày nhận phòng<input className="field" name="checkIn" type="date" defaultValue={defaultCheckIn} required /></label>
              <label className="grid gap-2 text-sm font-semibold">Ngày trả phòng<input className="field" name="checkOut" type="date" defaultValue={defaultCheckOut} required /></label>
              <label className="grid gap-2 text-sm font-semibold">Số khách<input className="field" name="guestCount" type="number" min="1" max={room.capacity} defaultValue="2" required /></label>
              <div className="rounded-xl bg-[#fdf9f4] p-4 text-sm">
                <p className="font-bold text-[#466550]">{homestay.name}</p>
                <p className="text-[#75675f]">{room.name} · {money(room.pricePerNight)} / đêm</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <p className="eyebrow">Bước 2</p>
            <h2 className="mt-2 text-2xl text-[#9a4029]">Dịch vụ bổ sung</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {homestay.services.map((service) => (
                <label className="rounded-xl border border-[#eadfd3] bg-white p-4" key={service.id}>
                  <span className="block font-bold text-[#466550]">{service.name}</span>
                  <span className="block text-sm text-[#75675f]">{money(service.unitPrice)}</span>
                  <input className="field mt-3 w-full" name={`service:${service.id}`} type="number" min="0" defaultValue="0" aria-label={`Số lượng ${service.name}`} />
                </label>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <p className="eyebrow">Bước 3</p>
            <h2 className="mt-2 text-2xl text-[#9a4029]">Thông tin khách hàng</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input className="field" name="guestName" placeholder="Họ tên" required minLength={2} />
              <input className="field" name="guestPhone" placeholder="Số điện thoại" required pattern="^[0-9+ ]{8,15}$" />
            </div>
          </div>
        </section>

        <aside className="card h-fit p-6">
          <h2 className="text-2xl text-[#9a4029]">Tóm tắt đơn hàng</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><span>Phòng</span><strong>{money(room.pricePerNight)} / đêm</strong></div>
            <div className="flex justify-between"><span>Dịch vụ</span><span>Chọn theo số lượng</span></div>
            <div className="flex justify-between"><span>Payment</span><span>ApiPay request</span></div>
          </div>
          <button className="btn-primary mt-6 w-full" type="submit">Xác nhận & Thanh toán</button>
        </aside>
      </form>
    </PageShell>
  );
}
