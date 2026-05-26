import { PageShell, Stepper } from "@/components/customer-ui";
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
    <PageShell
      eyebrow="Booking Flow"
      title="Đặt phòng & thanh toán"
      description="Chọn phòng, dịch vụ bổ sung, nhập thông tin khách và tạo payment request ApiPay qua backend."
    >
      <div className="mb-6">
        <Stepper active={1} />
      </div>

      <form action={createCheckoutAction} className="grid gap-6 lg:grid-cols-[1fr_390px]">
        <input type="hidden" name="homestayId" value={homestay.id} />
        <input type="hidden" name="roomId" value={room.id} />

        <section className="space-y-6">
          <div className="card p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div>
                <p className="eyebrow">Bước 1</p>
                <h2 className="mt-2 font-heading text-3xl text-[#7b2914]">Thông tin lưu trú</h2>
                <p className="mt-2 max-w-2xl text-sm text-[#75675f]">Dữ liệu phòng lấy từ API homestay và được dựng bằng component Next.js thật.</p>
              </div>
              <div className="rounded-3xl bg-[#fdf9f4] p-4 lg:w-72">
                <p className="font-heading text-2xl text-[#466550]">{homestay.name}</p>
                <p className="mt-1 text-sm text-[#75675f]">{room.name}</p>
                <p className="mt-3 font-bold text-[#9a4029]">{money(room.pricePerNight)} / đêm</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                Ngày nhận phòng
                <input className="field" name="checkIn" type="date" defaultValue={defaultCheckIn} required />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                Ngày trả phòng
                <input className="field" name="checkOut" type="date" defaultValue={defaultCheckOut} required />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                Số khách
                <input className="field" name="guestCount" type="number" min="1" max={room.capacity} defaultValue="2" required />
              </label>
              <div className="rounded-2xl bg-[#e8f0eb] p-4 text-sm text-[#466550]">
                <p className="font-bold">Sức chứa tối đa: {room.capacity} khách</p>
                <p className="mt-1">Hệ thống sẽ kiểm tra trạng thái phòng ở backend trước khi tạo booking.</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <p className="eyebrow">Bước 2</p>
            <h2 className="mt-2 font-heading text-3xl text-[#7b2914]">Dịch vụ bổ sung</h2>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl bg-[#fdf9f4] p-5">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#466550]">Đã bao gồm</p>
                <div className="mt-4 space-y-3">
                  {homestay.includedServices.length ? (
                    homestay.includedServices.map((service) => (
                      <div className="rounded-2xl bg-white p-4" key={service.id}>
                        <p className="font-bold text-[#3f3530]">{service.name}</p>
                        <p className="text-sm text-[#75675f]">Bao gồm trong giá phòng</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#75675f]">Chưa cấu hình dịch vụ mặc định.</p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-[#fdf9f4] p-5">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9a4029]">Đặt thêm</p>
                <div className="mt-4 space-y-3">
                  {homestay.services.map((service) => (
                    <label className="block rounded-2xl bg-white p-4" key={service.id}>
                      <span className="flex items-start justify-between gap-3">
                        <span>
                          <span className="block font-bold text-[#466550]">{service.name}</span>
                          <span className="block text-sm text-[#75675f]">{money(service.unitPrice)}</span>
                        </span>
                        <input
                          className="field w-24"
                          name={`service:${service.id}`}
                          type="number"
                          min="0"
                          defaultValue="0"
                          aria-label={`Số lượng ${service.name}`}
                        />
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <p className="eyebrow">Bước 3</p>
            <h2 className="mt-2 font-heading text-3xl text-[#7b2914]">Thông tin khách hàng</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                Họ tên
                <input className="field" name="guestName" placeholder="Nguyễn Văn A" required minLength={2} />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
                Số điện thoại
                <input className="field" name="guestPhone" placeholder="0901234567" required pattern="^[0-9+ ]{8,15}$" />
              </label>
            </div>
          </div>
        </section>

        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <p className="eyebrow">Order Summary</p>
          <h2 className="mt-2 font-heading text-3xl text-[#7b2914]">Tóm tắt đơn hàng</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-[#75675f]">Phòng</span>
              <strong>{money(room.pricePerNight)} / đêm</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#75675f]">Dịch vụ</span>
              <span>Nhập theo số lượng</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#75675f]">Thuế/phí</span>
              <span>Tính tại backend</span>
            </div>
            <div className="rounded-2xl bg-[#fdf9f4] p-4 text-[#56423d]">
              Sau khi tạo booking, hệ thống chuyển sang payment result. ApiPay thật sẽ bật khi tài khoản provider sẵn sàng.
            </div>
          </div>
          <button className="btn-primary mt-6 w-full" type="submit">
            Xác nhận & thanh toán
          </button>
        </aside>
      </form>
    </PageShell>
  );
}
