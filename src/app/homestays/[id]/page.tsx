import Link from "next/link";
import { AppTopBar } from "@/components/customer-ui";
import { getHomestay, money } from "@/lib/api";

export const dynamic = "force-dynamic";

type DetailSearchParams = {
  checkIn?: string;
  checkOut?: string;
  guests?: string;
};

function checkoutHref(homestayId: string, roomId: string | undefined, params: DetailSearchParams) {
  const query = new URLSearchParams();
  query.set("homestayId", homestayId);
  if (roomId) query.set("roomId", roomId);
  if (params.checkIn) query.set("checkIn", params.checkIn);
  if (params.checkOut) query.set("checkOut", params.checkOut);
  if (params.guests) query.set("guestCount", params.guests);
  return `/checkout?${query.toString()}`;
}

export default async function HomestayDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<DetailSearchParams> }) {
  const { id } = await params;
  const filters = await searchParams;
  const homestay = await getHomestay(id);
  const mainRoom = homestay.rooms[0];
  const images = [homestay.imageUrl, ...(homestay.images?.sort((a, b) => a.position - b.position).map((image) => image.url) ?? [])].filter(Boolean);
  const gallery = Array.from(new Set(images)).slice(0, 5);
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(homestay.location)}`;

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
          <div className="flex gap-2">
            <a className="btn-secondary" href={mapHref} rel="noreferrer" target="_blank">Xem bản đồ</a>
            <Link className="btn-primary" href={checkoutHref(homestay.id, mainRoom?.id, filters)}>Đặt phòng</Link>
          </div>
        </div>

        <div className="grid gap-3 overflow-hidden rounded-2xl lg:grid-cols-[1.35fr_0.65fr]">
          <div className="image-shell min-h-[360px] bg-cover bg-center md:min-h-[520px]" style={{ backgroundImage: `url(${gallery[0] ?? homestay.imageUrl})` }} />
          <div className="grid gap-3 sm:grid-cols-2">
            {(gallery.length > 1 ? gallery.slice(1, 5) : [homestay.imageUrl, homestay.imageUrl, homestay.imageUrl, homestay.imageUrl]).map((image, index) => (
              <div className="image-shell min-h-40 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} key={`${image}-${index}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-24 md:px-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section className="border-b border-[#e8e1d5] pb-8">
            <h2 className="font-heading text-3xl text-[#1c1c19]">Về không gian này</h2>
            <p className="mt-4 max-w-3xl leading-8 text-[#56423d]">{homestay.description}</p>
          </section>

          <section className="border-b border-[#e8e1d5] pb-8">
            <h2 className="font-heading text-3xl text-[#1c1c19]">Tiện ích nổi bật</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {homestay.amenities.map((amenity) => (
                <div className="rounded-2xl border border-[#d7e2da] bg-[#e8f0eb] px-4 py-3 font-semibold text-[#466550]" key={amenity}>
                  {amenity}
                </div>
              ))}
            </div>
          </section>

          <section className="border-b border-[#e8e1d5] pb-8">
            <h2 className="font-heading text-3xl text-[#1c1c19]">Chọn phòng của bạn</h2>
            <div className="mt-5 grid gap-4">
              {homestay.rooms.map((room) => (
                <article className="grid gap-4 rounded-2xl border border-[#eadfd4] bg-white p-4 shadow-[0_12px_40px_rgba(123,41,20,0.06)] md:grid-cols-[140px_1fr_auto] md:items-center" key={room.id}>
                  <div className="image-shell min-h-28 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${homestay.imageUrl})` }} />
                  <div>
                    <h3 className="font-heading text-2xl text-[#1c1c19]">{room.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#75675f]">{room.roomType} · tối đa {room.capacity} khách · {room.totalUnits} phòng/căn</p>
                    <p className="mt-2 font-bold text-[#9a4029]">{money(room.pricePerNight)} / đêm</p>
                  </div>
                  <Link className="btn-secondary" href={checkoutHref(homestay.id, room.id, filters)}>Chọn phòng</Link>
                </article>
              ))}
            </div>
          </section>

          <section className="border-b border-[#e8e1d5] pb-8">
            <h2 className="font-heading text-3xl text-[#1c1c19]">Dịch vụ có thể đặt thêm</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {homestay.services.map((service) => (
                <div className="rounded-2xl border border-[#eadfd4] bg-white p-4 shadow-[0_10px_30px_rgba(154,64,41,0.05)]" key={service.id}>
                  <p className="font-bold text-[#466550]">{service.name}</p>
                  {service.description && <p className="mt-1 text-sm text-[#75675f]">{service.description}</p>}
                  <p className="mt-3 font-bold text-[#9a4029]">{money(service.unitPrice)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-b border-[#e8e1d5] pb-8">
            <h2 className="font-heading text-3xl text-[#1c1c19]">Đánh giá</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {homestay.reviews.length ? homestay.reviews.map((review) => (
                <article className="rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(154,64,41,0.05)]" key={review.id}>
                  <p className="font-bold text-[#466550]">★ {review.rating}</p>
                  <p className="mt-2 text-sm leading-6 text-[#56423d]">{review.comment}</p>
                </article>
              )) : <p className="text-sm text-[#75675f]">Chưa có đánh giá.</p>}
            </div>
          </section>

          <section>
            <h2 className="font-heading text-3xl text-[#1c1c19]">Vị trí</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-[#eadfd4] bg-white">
              <div className="grid min-h-48 place-items-center bg-[#e8f0eb] p-6 text-center">
                <div>
                  <p className="font-bold text-[#466550]">{homestay.location}</p>
                  <a className="btn-secondary mt-4 w-fit" href={mapHref} rel="noreferrer" target="_blank">Mở Google Maps</a>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl bg-white p-6 shadow-[0_24px_80px_rgba(123,41,20,0.1)] lg:sticky lg:top-28">
          <p className="eyebrow">Tóm tắt</p>
          <h2 className="mt-2 font-heading text-3xl text-[#7b2914]">{money(homestay.priceFrom)}</h2>
          <p className="mt-1 text-sm text-[#75675f]">mỗi đêm, chưa bao gồm dịch vụ đặt thêm</p>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-[#fdf9f4] p-3"><p className="font-bold text-[#466550]">{homestay.rating}</p><p className="text-xs text-[#75675f]">Rating</p></div>
            <div className="rounded-2xl bg-[#fdf9f4] p-3"><p className="font-bold text-[#466550]">{homestay.capacity}</p><p className="text-xs text-[#75675f]">Khách</p></div>
            <div className="rounded-2xl bg-[#fdf9f4] p-3"><p className="font-bold text-[#466550]">{homestay.rooms.length}</p><p className="text-xs text-[#75675f]">Phòng</p></div>
          </div>
          {mainRoom && <Link className="btn-primary mt-6 w-full" href={checkoutHref(homestay.id, mainRoom.id, filters)}>Tiếp tục đặt phòng</Link>}
          <p className="mt-4 text-center text-xs text-[#75675f]">Bạn vẫn chưa bị trừ tiền</p>
        </aside>
      </section>

      {mainRoom && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#dcc0ba] bg-[#fdf9f4]/95 p-3 shadow-[0_-12px_40px_rgba(123,41,20,0.12)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#75675f]">Từ</p>
              <p className="font-bold text-[#466550]">{money(homestay.priceFrom)} / đêm</p>
            </div>
            <Link className="btn-primary px-5 py-3" href={checkoutHref(homestay.id, mainRoom.id, filters)}>Đặt phòng</Link>
          </div>
        </div>
      )}
    </main>
  );
}
