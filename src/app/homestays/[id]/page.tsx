import Link from "next/link";
import type { ReactNode } from "react";
import { AppTopBar } from "@/components/customer-ui";
import { HomestayGallery } from "@/components/homestay-gallery";
import { getHomestay, money } from "@/lib/api";
import { Homestay, Room } from "@/lib/types";

export const dynamic = "force-dynamic";

type DetailSearchParams = {
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  guestCount?: string;
};

type GalleryImage = {
  url: string;
  alt: string;
};

const highlightTags = [
  { label: "Gần núi Bà Đen", icon: "mountain", tone: "green" },
  { label: "Có BBQ sân vườn", icon: "grill", tone: "terracotta" },
  { label: "Phù hợp gia đình", icon: "family", tone: "green" },
  { label: "Có xe đưa đón", icon: "shuttle", tone: "green" }
] as const;

const featuredAmenities = [
  { label: "Wifi tốc độ cao", icon: "wifi" },
  { label: "Điều hòa 2 chiều", icon: "air" },
  { label: "Bếp đủ dụng cụ", icon: "kitchen" },
  { label: "Khu BBQ riêng tư", icon: "grill" },
  { label: "Chỗ đậu xe rộng rãi", icon: "parking" },
  { label: "Không gian sân vườn", icon: "garden" }
] as const;

function checkoutHref(homestayId: string, roomId: string | undefined, params: DetailSearchParams) {
  const guestCount = params.guestCount ?? params.guests;
  const query = new URLSearchParams();
  query.set("homestayId", homestayId);
  if (roomId) query.set("roomId", roomId);
  if (params.checkIn) query.set("checkIn", params.checkIn);
  if (params.checkOut) query.set("checkOut", params.checkOut);
  if (guestCount) {
    query.set("guestCount", guestCount);
    query.set("guests", guestCount);
  }
  return `/checkout?${query.toString()}`;
}

function dateFromIso(value?: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function nightsBetween(checkIn?: string, checkOut?: string) {
  const start = dateFromIso(checkIn);
  const end = dateFromIso(checkOut);
  if (!start || !end || end <= start) return 2;
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86_400_000));
}

function formatStayDate(value?: string) {
  const date = dateFromIso(value);
  if (!date) return "Chưa chọn";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(date);
}

function buildGalleryImages(homestay: Homestay) {
  const rawImages: GalleryImage[] = [
    { url: homestay.imageUrl, alt: `${homestay.name} - ảnh chính` },
    ...[...(homestay.images ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((image) => ({ url: image.url, alt: image.alt || homestay.name }))
  ].filter((image) => image.url);

  const uniqueImages = Array.from(new Map(rawImages.map((image) => [image.url, image])).values());
  const displayImages = [...uniqueImages];
  while (displayImages.length < 5 && uniqueImages.length) {
    const next = uniqueImages[displayImages.length % uniqueImages.length];
    displayImages.push({ ...next, alt: `${next.alt} ${displayImages.length + 1}` });
  }
  return displayImages;
}

function roomArea(room: Room) {
  if (room.capacity >= 6) return "58m2";
  if (room.capacity >= 4) return "45m2";
  if (room.capacity >= 3) return "36m2";
  return "28m2";
}

function roomDescription(room: Room, location: string) {
  if (room.capacity >= 4) {
    return `Không gian rộng rãi cho gia đình hoặc nhóm bạn, có khu nghỉ riêng tư và dễ di chuyển tới ${location}.`;
  }
  return `Phòng nghỉ ấm cúng cho cặp đôi hoặc chuyến đi ngắn ngày, bố trí gọn gàng với ánh sáng tự nhiên và tiện nghi cần thiết.`;
}

function DetailIcon({ name }: { name: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const paths: Record<string, ReactNode> = {
    mountain: <><path d="M3 17h18" /><path d="m5 17 5.2-9 3.3 5.4 1.9-2.7L21 17" /></>,
    grill: <><path d="M5 9h14" /><path d="M7 9a5 5 0 0 0 10 0" /><path d="M8 14 6 19" /><path d="M16 14l2 5" /><path d="M12 14v5" /><path d="M8 5v1" /><path d="M12 4v2" /><path d="M16 5v1" /></>,
    family: <><circle cx="8" cy="8" r="2.5" /><circle cx="16" cy="8" r="2.5" /><path d="M4 19v-1a4 4 0 0 1 4-4h1" /><path d="M20 19v-1a4 4 0 0 0-4-4h-1" /><path d="M9 19v-1.5a3 3 0 0 1 6 0V19" /></>,
    shuttle: <><path d="M4 7h11a3 3 0 0 1 3 3v5H4z" /><path d="M18 10h2l1 3v2h-3" /><circle cx="7" cy="17" r="1.7" /><circle cx="17" cy="17" r="1.7" /></>,
    wifi: <><path d="M4 9a12 12 0 0 1 16 0" /><path d="M7 12a7.5 7.5 0 0 1 10 0" /><path d="M10 15a3 3 0 0 1 4 0" /><path d="M12 18h.01" /></>,
    air: <><path d="M4 8h11a3 3 0 0 1 0 6H9" /><path d="M4 12h16" /><path d="M4 16h7a2 2 0 1 1 0 4" /></>,
    kitchen: <><path d="M7 3v18" /><path d="M4 3v5a3 3 0 0 0 6 0V3" /><path d="M16 3v18" /><path d="M16 3c2.2 1.2 3.5 3.3 3.5 5.8 0 2.2-1.1 4.2-3.5 5.2" /></>,
    parking: <><path d="M7 21V3h7a5 5 0 0 1 0 10H7" /><path d="M7 13h7" /></>,
    garden: <><path d="M12 21V9" /><path d="M12 10C8 10 6 7.5 6 4c4 0 6 2.5 6 6Z" /><path d="M12 13c4 0 6-2.5 6-6-4 0-6 2.5-6 6Z" /></>,
    group: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><path d="M16 11a3 3 0 0 1 3 3v1" /></>,
    bed: <><path d="M4 11V5" /><path d="M20 19v-5a3 3 0 0 0-3-3H4v8" /><path d="M4 15h16" /><path d="M8 11V8h4v3" /></>,
    area: <><path d="M4 9V4h5" /><path d="M20 9V4h-5" /><path d="M4 15v5h5" /><path d="M20 15v5h-5" /></>
  };

  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" {...common}>
      {paths[name] ?? paths.garden}
    </svg>
  );
}

export default async function HomestayDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<DetailSearchParams> }) {
  const { id } = await params;
  const filters = await searchParams;
  const homestay = await getHomestay(id);
  const activeRooms = homestay.rooms.filter((room) => room.active);
  const rooms = activeRooms.length ? activeRooms : homestay.rooms;
  const mainRoom = rooms[0] ?? homestay.rooms[0];
  const gallery = buildGalleryImages(homestay);
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(homestay.location)}`;
  const guestCount = filters.guestCount ?? filters.guests ?? "2";
  const nights = nightsBetween(filters.checkIn, filters.checkOut);
  const pricePerNight = mainRoom?.pricePerNight ?? homestay.priceFrom;
  const roomTotal = pricePerNight * nights;
  const taxTotal = Math.round(roomTotal * 0.1);
  const grandTotal = roomTotal + taxTotal;

  return (
    <main className="min-h-screen pb-24 text-[#1c1c19] lg:pb-0">
      <AppTopBar />

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">{homestay.type}</p>
            <h1 className="mt-2 font-heading text-4xl leading-tight text-[#1c1c19] md:text-5xl">{homestay.name}</h1>
            <p className="mt-2 flex flex-wrap gap-2 text-[#56423d]">
              <span>★ {homestay.rating}</span>
              <span>·</span>
              <span>{homestay.location}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a className="btn-secondary" href={mapHref} rel="noreferrer" target="_blank">Xem bản đồ</a>
            {mainRoom && <Link className="btn-primary" href={checkoutHref(homestay.id, mainRoom.id, filters)}>Đặt phòng</Link>}
          </div>
        </div>

        <HomestayGallery images={gallery} />
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 md:px-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="space-y-10">
          <div className="flex flex-wrap gap-2">
            {highlightTags.map((tag) => (
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${tag.tone === "terracotta" ? "border-[#9a4029]/24 bg-[#9a4029]/10 text-[#7b2914]" : "border-[#466550]/24 bg-[#466550]/10 text-[#2f4d3a]"}`}
                key={tag.label}
              >
                <DetailIcon name={tag.icon} />
                {tag.label}
              </span>
            ))}
          </div>

          <section className="border-b border-[#e8e1d5] pb-10">
            <h2 className="font-heading text-3xl leading-tight text-[#1c1c19] md:text-4xl">Nơi đất sét nung gặp gỡ đại ngàn</h2>
            <div className="mt-5 max-w-3xl space-y-4 text-base leading-8 text-[#56423d] md:text-lg">
              <p>{homestay.description}</p>
              <p>
                Không gian được tổ chức theo tinh thần mộc mạc của Tây Ninh: chất đất nung ấm, mảng xanh sân vườn và nhịp sống chậm để mỗi buổi sáng bắt đầu bằng ánh nắng dịu qua hiên nhà.
              </p>
              <p>
                Buổi tối là thời điểm đẹp để quây quần bên khu BBQ, thưởng thức đặc sản địa phương và nghỉ ngơi trong bầu không khí yên tĩnh sau một ngày khám phá núi Bà Đen.
              </p>
            </div>
            <a className="mt-5 inline-flex font-bold text-[#9a4029] underline decoration-[#9a4029]/40 underline-offset-4 hover:decoration-[#9a4029]" href="#rooms">
              Đọc thêm
            </a>
          </section>

          <section className="border-b border-[#e8e1d5] pb-10" id="amenities">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="eyebrow">Tiện nghi</p>
                <h2 className="mt-2 font-heading text-3xl text-[#1c1c19]">Tiện ích nổi bật</h2>
              </div>
              {homestay.amenities.length > 0 && <p className="text-sm font-semibold text-[#75675f]">Bao gồm {homestay.amenities.length} tiện ích đang được chủ nhà công bố</p>}
            </div>
            <div className="mt-6 grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredAmenities.map((amenity) => (
                <div className="flex items-center gap-3 text-[#56423d]" key={amenity.label}>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e8f0eb] text-[#466550]">
                    <DetailIcon name={amenity.icon} />
                  </span>
                  <span className="font-semibold">{amenity.label}</span>
                </div>
              ))}
            </div>
            {homestay.amenities.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {homestay.amenities.slice(0, 8).map((amenity) => (
                  <span className="rounded-full bg-[#ffdad2] px-3 py-1 text-xs font-bold text-[#7b2914]" key={amenity}>{amenity}</span>
                ))}
              </div>
            )}
          </section>

          <section className="border-b border-[#e8e1d5] pb-10" id="rooms">
            <p className="eyebrow">Lựa chọn không gian</p>
            <h2 className="mt-2 font-heading text-3xl text-[#1c1c19]">Chọn phòng của bạn</h2>
            <div className="mt-6 space-y-5">
              {rooms.map((room, index) => {
                const thumbnail = room.imageUrl ?? gallery[(index + 1) % gallery.length]?.url ?? homestay.imageUrl;
                return (
                  <article className="group grid gap-5 rounded-2xl border border-[#dcc0ba] bg-white p-4 shadow-[0_14px_45px_rgba(123,41,20,0.06)] transition hover:border-[#9a4029] md:grid-cols-[220px_1fr]" key={room.id}>
                    <div className="image-shell aspect-[4/3] overflow-hidden rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${thumbnail})` }} />
                    <div className="flex min-w-0 flex-col justify-between">
                      <div>
                        <h3 className="font-heading text-2xl text-[#1c1c19]">{room.name}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-[#75675f]">
                          <span className="inline-flex items-center gap-1"><DetailIcon name="group" /> {room.capacity} khách</span>
                          <span className="inline-flex items-center gap-1"><DetailIcon name="bed" /> {room.roomType}</span>
                          <span className="inline-flex items-center gap-1"><DetailIcon name="area" /> {roomArea(room)}</span>
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#56423d]">{roomDescription(room, homestay.location)}</p>
                      </div>
                      <div className="mt-5 flex flex-col justify-between gap-3 border-t border-[#e8e1d5] pt-4 sm:flex-row sm:items-end">
                        <div>
                          <p className="text-xs font-bold uppercase text-[#89726c]">Giá mỗi đêm</p>
                          <p className="font-heading text-2xl font-bold text-[#9a4029]">{money(room.pricePerNight)}</p>
                        </div>
                        <Link className="btn-secondary" href={checkoutHref(homestay.id, room.id, filters)}>Chọn phòng</Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="border-b border-[#e8e1d5] pb-10">
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

          <section className="border-b border-[#e8e1d5] pb-10">
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
            <p className="mt-2 text-[#56423d]">{homestay.location}</p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-[#eadfd4] bg-white">
              <div className="grid min-h-64 place-items-center bg-[#e8f0eb] p-6 text-center">
                <div>
                  <p className="font-bold text-[#466550]">{homestay.location}</p>
                  <a className="btn-secondary mt-4 w-fit" href={mapHref} rel="noreferrer" target="_blank">Mở Google Maps</a>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="hidden h-fit rounded-2xl border border-[#dcc0ba] bg-white p-6 shadow-[0_24px_80px_rgba(123,41,20,0.1)] lg:sticky lg:top-28 lg:block">
          <div className="border-b border-[#e8e1d5] pb-5">
            <p className="text-xs font-bold uppercase text-[#89726c]">Từ</p>
            <div className="mt-1 flex items-end gap-1">
              <span className="font-heading text-3xl font-bold text-[#9a4029]">{money(pricePerNight)}</span>
              <span className="pb-1 text-sm text-[#75675f]">/ đêm</span>
            </div>
          </div>
          <div className="mt-5 overflow-hidden rounded-xl border border-[#dcc0ba]">
            <div className="grid grid-cols-2 divide-x divide-[#dcc0ba]">
              <div className="p-3">
                <p className="text-[11px] font-black uppercase text-[#89726c]">Nhận phòng</p>
                <p className="mt-1 font-bold text-[#1c1c19]">{formatStayDate(filters.checkIn)}</p>
              </div>
              <div className="p-3">
                <p className="text-[11px] font-black uppercase text-[#89726c]">Trả phòng</p>
                <p className="mt-1 font-bold text-[#1c1c19]">{formatStayDate(filters.checkOut)}</p>
              </div>
            </div>
            <div className="border-t border-[#dcc0ba] p-3">
              <p className="text-[11px] font-black uppercase text-[#89726c]">Khách</p>
              <p className="mt-1 font-bold text-[#1c1c19]">{guestCount} khách</p>
            </div>
          </div>
          <div className="mt-5 space-y-3 border-b border-[#e8e1d5] pb-5 text-sm text-[#56423d]">
            <div className="flex justify-between gap-4"><span>{money(pricePerNight)} x {nights} đêm</span><strong>{money(roomTotal)}</strong></div>
            <div className="flex justify-between gap-4"><span>Thuế 10%</span><strong>{money(taxTotal)}</strong></div>
          </div>
          <div className="mt-5 flex justify-between gap-4">
            <span className="font-heading text-2xl font-bold text-[#1c1c19]">Tổng tiền</span>
            <strong className="font-heading text-2xl text-[#9a4029]">{money(grandTotal)}</strong>
          </div>
          {mainRoom && <Link className="btn-primary mt-6 w-full" href={checkoutHref(homestay.id, mainRoom.id, filters)}>Tiếp tục đặt phòng</Link>}
          <p className="mt-4 text-center text-xs text-[#75675f]">Bạn vẫn chưa bị trừ tiền</p>
        </aside>
      </section>

      {mainRoom && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#dcc0ba] bg-[#fdf9f4]/95 p-3 shadow-[0_-12px_40px_rgba(123,41,20,0.12)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#75675f]">{nights} đêm · gồm thuế/phí nếu có</p>
              <p className="font-bold text-[#466550]">{money(grandTotal)}</p>
            </div>
            <Link className="btn-primary px-5 py-3" href={checkoutHref(homestay.id, mainRoom.id, filters)}>Tiếp tục đặt phòng</Link>
          </div>
        </div>
      )}
    </main>
  );
}
