import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, ChevronRight, Map as MapIcon, MapPin, Sparkles, Star, Users } from "lucide-react";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppTopBar, SiteFooter } from "@/components/customer-ui";
import { HomestayGallery } from "@/components/homestay-gallery";
import { RoomSelectionCheckout } from "@/components/room-selection-checkout";
import { getHomestay, money } from "@/lib/api";
import { Homestay, Room } from "@/lib/types";

export const dynamic = "force-dynamic";

type DetailSearchParams = {
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  guestCount?: string;
  roomIds?: string;
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
  const selectedRoomIds = (filters.roomIds ?? "").split(",").map((roomId) => roomId.trim()).filter(Boolean);
  if (selectedRoomIds.length === 0 && (filters.checkIn || filters.checkOut || filters.guests || filters.guestCount)) {
    redirect(`/homestays/${id}`);
  }
  const homestay = await getHomestay(id);
  const activeRooms = homestay.rooms.filter((room) => room.active);
  const rooms = activeRooms.length ? activeRooms : homestay.rooms;
  const gallery = buildGalleryImages(homestay);
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(homestay.location)}`;
  const hasBookingSelection = selectedRoomIds.length > 0;
  const initialGuestCount = hasBookingSelection ? (filters.guestCount ?? filters.guests ?? "") : "";
  const initialCheckIn = hasBookingSelection ? filters.checkIn : undefined;
  const initialCheckOut = hasBookingSelection ? filters.checkOut : undefined;
  const selectableRooms = rooms.map((room, index) => ({
    id: room.id,
    name: room.name,
    roomType: room.roomType,
    pricePerNight: room.pricePerNight,
    capacity: room.capacity,
    area: roomArea(room),
    description: roomDescription(room, homestay.location),
    thumbnail: room.imageUrl ?? gallery[(index + 1) % gallery.length]?.url ?? homestay.imageUrl
  }));
  const addOnServices = homestay.services.filter((service) => service.active !== false && !service.included);

  return (
    <>
      <AppTopBar />
      <main id="main" className="min-h-screen pb-24 text-ink lg:pb-0">
        <section className="container-page pt-8 md:pt-10">
          <nav aria-label="Đường dẫn" className="animate-fade-up flex items-center gap-1.5 text-sm text-muted">
            <Link className="hover:text-ink" href="/">Trang chủ</Link>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <Link className="hover:text-ink" href="/homestays">Homestay</Link>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <span className="truncate text-ink">{homestay.name}</span>
          </nav>
          <div className="mb-8 mt-5 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="animate-fade-up [animation-delay:80ms]">
              <p className="eyebrow">{homestay.type}</p>
              <h1 className="display mt-4 text-4xl md:text-6xl">{homestay.name}</h1>
              <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-ink-muted">
                <span className="inline-flex items-center gap-1.5 font-semibold text-ink"><Star className="size-4 fill-gold text-gold" aria-hidden="true" />{homestay.rating}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-leaf" aria-hidden="true" />{homestay.location}</span>
                <span className="inline-flex items-center gap-1.5"><Users className="size-4 text-leaf" aria-hidden="true" />Tối đa {homestay.capacity} khách</span>
              </p>
            </div>
            <div className="animate-fade-up flex flex-wrap gap-2 [animation-delay:160ms]">
              <a className="btn-secondary" href={mapHref} rel="noreferrer" target="_blank"><MapIcon className="size-4" aria-hidden="true" /> Xem bản đồ</a>
              <a className="btn-primary" href="#rooms">Chọn phòng <ArrowDown className="size-4" aria-hidden="true" /></a>
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:200ms]">
            <HomestayGallery images={gallery} />
          </div>
        </section>

        <section className="container-page pb-20 pt-12">
          <div className="space-y-16">
            <div className="flex flex-wrap gap-2">
              {highlightTags.map((tag) => (
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${tag.tone === "terracotta" ? "bg-brand-wash text-brand-strong" : "bg-leaf-soft text-leaf-strong"}`}
                  key={tag.label}
                >
                  <DetailIcon name={tag.icon} />
                  {tag.label}
                </span>
              ))}
            </div>

            <section className="reveal grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="eyebrow">Câu chuyện nơi ở</p>
                <h2 className="display mt-4 text-3xl md:text-5xl">Nơi đất sét nung gặp gỡ <span className="italic text-leaf">đại ngàn</span></h2>
                <div className="mt-6 space-y-4 text-base leading-8 text-ink-muted md:text-lg">
                  <p className="first-letter:float-left first-letter:mr-3 first-letter:font-heading first-letter:text-6xl first-letter:leading-[0.9] first-letter:text-brand">{homestay.description}</p>
                  <p>
                    Không gian được tổ chức theo tinh thần mộc mạc của Tây Ninh: chất đất nung ấm, mảng xanh sân vườn và nhịp sống chậm để mỗi buổi sáng bắt đầu bằng ánh nắng dịu qua hiên nhà.
                  </p>
                  <p>
                    Buổi tối là thời điểm đẹp để quây quần bên khu BBQ, thưởng thức đặc sản địa phương và nghỉ ngơi trong bầu không khí yên tĩnh sau một ngày khám phá núi Bà Đen.
                  </p>
                </div>
                <a className="mt-6 inline-flex items-center gap-2 font-semibold text-brand underline decoration-brand/30 underline-offset-4 transition hover:decoration-brand" href="#rooms">
                  Xem phòng <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </div>

              <aside className="h-fit rounded-[28px] bg-forest p-7 text-white shadow-lift" id="amenities">
                <p className="eyebrow eyebrow-light">Tiện nghi</p>
                <h2 className="mt-3 font-heading text-3xl">Tiện ích nổi bật</h2>
                {homestay.amenities.length > 0 && <p className="mt-2 text-sm text-white/60">Bao gồm {homestay.amenities.length} tiện ích đang được chủ nhà công bố</p>}
                <ul className="mt-6 grid gap-4">
                  {featuredAmenities.map((amenity) => (
                    <li className="flex items-center gap-3" key={amenity.label}>
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-gold" aria-hidden="true">
                        <DetailIcon name={amenity.icon} />
                      </span>
                      <span className="font-medium">{amenity.label}</span>
                    </li>
                  ))}
                </ul>
                {homestay.amenities.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-6">
                    {homestay.amenities.slice(0, 8).map((amenity) => (
                      <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-white/80" key={amenity}>{amenity}</span>
                    ))}
                  </div>
                )}
              </aside>
            </section>

            <RoomSelectionCheckout
              homestayId={homestay.id}
              rooms={selectableRooms}
              initialRoomIds={selectedRoomIds}
              initialCheckIn={initialCheckIn}
              initialCheckOut={initialCheckOut}
              initialGuests={initialGuestCount}
            />

            <section className="reveal">
              <p className="eyebrow">Trải nghiệm thêm</p>
              <h2 className="mt-4 font-heading text-3xl text-ink md:text-4xl">Dịch vụ có thể đặt thêm</h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {addOnServices.length ? addOnServices.map((service) => (
                  <div className="group card flex flex-col p-6 transition duration-500 hover:-translate-y-1 hover:shadow-lift" key={service.id}>
                    <span className="grid size-11 place-items-center rounded-full bg-brand-wash text-brand transition group-hover:bg-brand group-hover:text-white" aria-hidden="true"><Sparkles className="size-5" /></span>
                    <p className="mt-5 text-lg font-semibold text-ink">{service.name}</p>
                    {service.description && <p className="mt-1 flex-1 text-sm leading-6 text-muted">{service.description}</p>}
                    <p className="mt-4 font-heading text-2xl text-ink">{money(service.unitPrice)}</p>
                  </div>
                )) : (
                  <p className="rounded-3xl bg-cream p-6 text-sm text-muted">Homestay này chưa mở bán dịch vụ bổ sung.</p>
                )}
              </div>
            </section>

            <section className="reveal grid gap-10 lg:grid-cols-2">
              <div>
                <p className="eyebrow">Khách đã ở</p>
                <h2 className="mt-4 font-heading text-3xl text-ink md:text-4xl">Đánh giá</h2>
                <div className="mt-8 grid gap-4">
                  {homestay.reviews.length ? homestay.reviews.map((review) => (
                    <figure className="card p-6" key={review.id}>
                      <div className="flex gap-0.5" aria-label={`${review.rating} trên 5 sao`}>
                        {Array.from({ length: 5 }, (_, star) => (
                          <Star className={`size-4 ${star < Math.round(review.rating) ? "fill-gold text-gold" : "text-line"}`} aria-hidden="true" key={star} />
                        ))}
                      </div>
                      <blockquote className="mt-3 font-heading text-lg italic leading-7 text-ink">“{review.comment}”</blockquote>
                    </figure>
                  )) : <p className="rounded-3xl bg-cream p-6 text-sm text-muted">Chưa có đánh giá.</p>}
                </div>
              </div>

              <div>
                <p className="eyebrow">Đường đến</p>
                <h2 className="mt-4 font-heading text-3xl text-ink md:text-4xl">Vị trí</h2>
                <p className="mt-3 text-ink-muted">{homestay.location}</p>
                <div className="relative mt-6 grid min-h-72 place-items-center overflow-hidden rounded-[28px] bg-forest p-8 text-center text-white">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(201,163,90,0.25),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(176,72,43,0.25),transparent_50%)]" aria-hidden="true" />
                  <div className="relative">
                    <span className="mx-auto grid size-14 place-items-center rounded-full bg-gold text-forest shadow-lift [animation:float-soft_4s_ease-in-out_infinite]" aria-hidden="true"><MapPin className="size-6" /></span>
                    <p className="mt-4 font-heading text-2xl">{homestay.location}</p>
                    <a className="btn-light mx-auto mt-6 w-fit" href={mapHref} rel="noreferrer" target="_blank">Mở Google Maps <ArrowUpRight className="size-4" aria-hidden="true" /></a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
