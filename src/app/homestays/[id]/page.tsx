import Link from "next/link";
import { PageShell } from "@/components/customer-ui";
import { getHomestay, money } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomestayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const homestay = await getHomestay(id);
  const mainRoom = homestay.rooms[0];
  const rating = Number(homestay.rating ?? 0).toFixed(1);

  return (
    <PageShell eyebrow="Homestay Detail" title={homestay.name} description={homestay.description}>
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div
          className="relative min-h-[520px] overflow-hidden rounded-[32px] bg-cover bg-center shadow-[0_28px_80px_rgba(154,64,41,0.18)]"
          style={{ backgroundImage: `url(${homestay.imageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/60" />
          <div className="absolute left-6 top-6 rounded-full bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#7b2914]">
            {homestay.type}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em]">Tây Ninh Retreat</p>
            <h2 className="mt-3 max-w-2xl font-heading text-4xl md:text-5xl">{homestay.name}</h2>
            <p className="mt-4 max-w-2xl text-white/85">{homestay.location}</p>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="card p-6">
            <p className="eyebrow">Giá từ</p>
            <h2 className="mt-2 font-heading text-4xl text-[#7b2914]">{money(homestay.priceFrom)}</h2>
            <p className="mt-2 text-sm text-[#75675f]">Mỗi đêm, đã bao gồm các tiện ích mặc định của homestay.</p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-[#fdf9f4] p-4">
                <p className="font-heading text-2xl text-[#9a4029]">{rating}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#75675f]">Rating</p>
              </div>
              <div className="rounded-2xl bg-[#fdf9f4] p-4">
                <p className="font-heading text-2xl text-[#9a4029]">{homestay.capacity}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#75675f]">Khách</p>
              </div>
              <div className="rounded-2xl bg-[#fdf9f4] p-4">
                <p className="font-heading text-2xl text-[#9a4029]">{homestay.rooms.length}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#75675f]">Phòng</p>
              </div>
            </div>
            {mainRoom && (
              <Link className="btn-primary mt-6 w-full" href={`/checkout?homestayId=${homestay.id}`}>
                Tiếp tục đặt phòng
              </Link>
            )}
          </div>

          <div className="card p-6">
            <p className="eyebrow">Tiện ích</p>
            <h2 className="mt-2 font-heading text-2xl text-[#7b2914]">Không gian và dịch vụ có sẵn</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {homestay.amenities.map((amenity) => (
                <span className="rounded-full bg-[#e8f0eb] px-3 py-1 text-sm font-semibold text-[#466550]" key={amenity}>
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <p className="eyebrow">Vị trí</p>
            <div className="mt-3 rounded-3xl bg-[#fdf9f4] p-5">
              <p className="font-semibold text-[#3f3530]">{homestay.location}</p>
              <p className="mt-2 text-sm text-[#75675f]">Khu vực được hiển thị ở mức tổng quan cho demo. Bản đồ chi tiết sẽ lấy từ API bản đồ khi cấu hình production.</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="card p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Room Selection</p>
              <h2 className="mt-2 font-heading text-3xl text-[#7b2914]">Phòng khả dụng</h2>
            </div>
            <span className="rounded-full bg-[#ffdad2] px-4 py-2 text-sm font-bold text-[#7b2914]">{homestay.rooms.length} lựa chọn</span>
          </div>
          <div className="mt-5 space-y-3">
            {homestay.rooms.map((room) => (
              <div className="rounded-3xl bg-[#fdf9f4] p-4" key={room.id}>
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="font-heading text-2xl text-[#466550]">{room.name}</p>
                    <p className="mt-1 text-sm text-[#75675f]">
                      {room.roomType} · tối đa {room.capacity} khách · {room.totalUnits} phòng/căn
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="font-bold text-[#9a4029]">{money(room.pricePerNight)}</p>
                    <p className="text-xs text-[#75675f]">mỗi đêm</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <p className="eyebrow">Services</p>
          <h2 className="mt-2 font-heading text-3xl text-[#7b2914]">Dịch vụ có thể đặt thêm</h2>
          <div className="mt-5 space-y-3">
            {homestay.services.map((service) => (
              <div className="flex justify-between gap-4 rounded-3xl bg-[#fdf9f4] p-4" key={service.id}>
                <div>
                  <p className="font-bold text-[#466550]">{service.name}</p>
                  {service.description && <p className="mt-1 text-sm text-[#75675f]">{service.description}</p>}
                </div>
                <p className="shrink-0 font-bold text-[#9a4029]">{money(service.unitPrice)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 card p-6">
        <p className="eyebrow">Reviews</p>
        <h2 className="mt-2 font-heading text-3xl text-[#7b2914]">Đánh giá gần đây</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {homestay.reviews.length ? (
            homestay.reviews.map((review) => (
              <div className="rounded-3xl bg-[#fdf9f4] p-5" key={review.id}>
                <p className="font-bold text-[#9a4029]">{"★".repeat(review.rating)}</p>
                <p className="mt-3 text-sm leading-6 text-[#56423d]">{review.comment}</p>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-[#dcc0ba] bg-white/70 p-5 text-sm text-[#75675f]">Homestay chưa có đánh giá.</div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
