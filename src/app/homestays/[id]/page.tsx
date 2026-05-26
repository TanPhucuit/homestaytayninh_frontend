import Link from "next/link";
import { AppTopBar } from "@/components/customer-ui";
import { getHomestay, money } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomestayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const homestay = await getHomestay(id);
  const mainRoom = homestay.rooms[0];

  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">{homestay.type}</p>
            <h1 className="mt-2 font-heading text-4xl text-[#1c1c19] md:text-5xl">{homestay.name}</h1>
            <p className="mt-2 text-[#56423d]">★ {homestay.rating} · {homestay.location}</p>
          </div>
          <Link className="btn-primary" href={`/checkout?homestayId=${homestay.id}`}>Đặt phòng</Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="min-h-[520px] rounded-[28px] bg-cover bg-center shadow-[0_28px_80px_rgba(154,64,41,0.16)]" style={{ backgroundImage: `url(${homestay.imageUrl})` }} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {homestay.rooms.slice(0, 2).map((room) => (
              <div className="rounded-[24px] bg-white p-5 shadow-[0_18px_55px_rgba(123,41,20,0.08)]" key={room.id}>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#466550]">{room.roomType}</p>
                <h2 className="mt-2 font-heading text-2xl text-[#7b2914]">{room.name}</h2>
                <p className="mt-2 text-sm text-[#75675f]">{room.capacity} khách · {room.totalUnits} phòng/căn</p>
                <p className="mt-4 font-bold text-[#9a4029]">{money(room.pricePerNight)} / đêm</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 md:px-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section className="card p-6">
            <h2 className="font-heading text-3xl text-[#1c1c19]">Về không gian này</h2>
            <p className="mt-4 leading-8 text-[#56423d]">{homestay.description}</p>
          </section>

          <section className="card p-6">
            <h2 className="font-heading text-3xl text-[#1c1c19]">Tiện ích nổi bật</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {homestay.amenities.map((amenity) => (
                <div className="rounded-2xl bg-[#e8f0eb] px-4 py-3 font-semibold text-[#466550]" key={amenity}>{amenity}</div>
              ))}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-heading text-3xl text-[#1c1c19]">Chọn phòng của bạn</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {homestay.rooms.map((room) => (
                <article className="rounded-[24px] bg-[#fdf9f4] p-5" key={room.id}>
                  <h3 className="font-heading text-2xl text-[#1c1c19]">{room.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#75675f]">{room.roomType} · tối đa {room.capacity} khách · {room.totalUnits} phòng/căn</p>
                  <div className="mt-5 flex items-end justify-between gap-4">
                    <p className="font-bold text-[#9a4029]">{money(room.pricePerNight)}</p>
                    <Link className="btn-secondary" href={`/checkout?homestayId=${homestay.id}`}>Chọn phòng</Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-heading text-3xl text-[#1c1c19]">Dịch vụ có thể đặt thêm</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {homestay.services.map((service) => (
                <div className="rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(154,64,41,0.05)]" key={service.id}>
                  <p className="font-bold text-[#466550]">{service.name}</p>
                  {service.description && <p className="mt-1 text-sm text-[#75675f]">{service.description}</p>}
                  <p className="mt-3 font-bold text-[#9a4029]">{money(service.unitPrice)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-[24px] bg-white p-6 shadow-[0_24px_80px_rgba(123,41,20,0.1)] lg:sticky lg:top-28">
          <p className="eyebrow">Tóm tắt</p>
          <h2 className="mt-2 font-heading text-3xl text-[#7b2914]">{money(homestay.priceFrom)}</h2>
          <p className="mt-1 text-sm text-[#75675f]">mỗi đêm, chưa bao gồm dịch vụ đặt thêm</p>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-[#fdf9f4] p-3"><p className="font-bold text-[#466550]">{homestay.rating}</p><p className="text-xs text-[#75675f]">Rating</p></div>
            <div className="rounded-2xl bg-[#fdf9f4] p-3"><p className="font-bold text-[#466550]">{homestay.capacity}</p><p className="text-xs text-[#75675f]">Khách</p></div>
            <div className="rounded-2xl bg-[#fdf9f4] p-3"><p className="font-bold text-[#466550]">{homestay.rooms.length}</p><p className="text-xs text-[#75675f]">Phòng</p></div>
          </div>
          {mainRoom && <Link className="btn-primary mt-6 w-full" href={`/checkout?homestayId=${homestay.id}`}>Tiếp tục đặt phòng</Link>}
          <p className="mt-4 text-center text-xs text-[#75675f]">Bạn vẫn chưa bị trừ tiền</p>
        </aside>
      </section>
    </main>
  );
}
