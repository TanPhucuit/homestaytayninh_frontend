import Link from "next/link";
import { PageShell } from "@/components/customer-ui";
import { money, getHomestay } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomestayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const homestay = await getHomestay(id);

  return (
    <PageShell eyebrow="Homestay Detail" title={homestay.name} description={homestay.description}>
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card overflow-hidden">
          <div className="min-h-[420px] bg-cover bg-center" style={{ backgroundImage: `url(${homestay.imageUrl})` }} />
        </div>
        <aside className="space-y-5">
          <div className="card p-6">
            <p className="eyebrow">{homestay.type}</p>
            <h2 className="mt-2 text-3xl text-[#9a4029]">{money(homestay.priceFrom)} / đêm</h2>
            <p className="mt-3 text-sm text-[#75675f]">{homestay.location} · Tối đa {homestay.capacity} khách · ★ {homestay.rating}</p>
            <Link className="btn-primary mt-5 w-full" href={`/checkout?homestayId=${homestay.id}`}>Tiếp tục đặt phòng</Link>
          </div>
          <div className="card p-6">
            <h2 className="text-2xl text-[#9a4029]">Tiện ích</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {homestay.amenities.map((amenity) => (
                <span className="rounded-full bg-[#e8f0eb] px-3 py-1 text-sm font-semibold text-[#466550]" key={amenity}>{amenity}</span>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-2xl text-[#9a4029]">Phòng khả dụng</h2>
          <div className="mt-4 space-y-3">
            {homestay.rooms.map((room) => (
              <div className="rounded-xl border border-[#eadfd3] bg-white p-4" key={room.id}>
                <div className="flex flex-col justify-between gap-2 sm:flex-row">
                  <div>
                    <p className="font-bold text-[#466550]">{room.name}</p>
                    <p className="text-sm text-[#75675f]">{room.roomType} · {room.capacity} khách · {room.totalUnits} phòng/căn</p>
                  </div>
                  <p className="font-bold text-[#9a4029]">{money(room.pricePerNight)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-2xl text-[#9a4029]">Dịch vụ có thể đặt thêm</h2>
          <div className="mt-4 space-y-3">
            {homestay.services.map((service) => (
              <div className="flex justify-between gap-4 rounded-xl border border-[#eadfd3] bg-white p-4" key={service.id}>
                <div>
                  <p className="font-bold text-[#466550]">{service.name}</p>
                  {service.description && <p className="text-sm text-[#75675f]">{service.description}</p>}
                </div>
                <p className="font-bold text-[#9a4029]">{money(service.unitPrice)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
