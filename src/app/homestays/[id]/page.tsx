import { Pill } from "@/components/ui";
import { getHomestay, money } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

export default async function HomestayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const homestay = await getHomestay(id);
  const room = homestay.rooms[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <div className="grid gap-3 md:grid-cols-[1.4fr_0.6fr]">
            <div className="relative h-[430px] overflow-hidden rounded-2xl">
              <Image src={homestay.imageUrl} alt={homestay.name} fill className="object-cover" />
            </div>
            <div className="grid gap-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="relative h-[134px] overflow-hidden rounded-2xl">
                  <Image src={homestay.imageUrl} alt={`${homestay.name} ${item}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          <section>
            <p className="eyebrow">{homestay.type}</p>
            <h1 className="mt-2 text-5xl font-bold text-[#466550]">{homestay.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Pill>{homestay.location}</Pill>
              <Pill tone="clay">{homestay.rating}/5 tá»« 128 Ä‘Ã¡nh giÃ¡</Pill>
              <Pill tone="sand">Gáº§n NÃºi BÃ  Äen</Pill>
            </div>
            <p className="mt-5 text-lg leading-8 text-[#75675f]">{homestay.description}</p>
          </section>

          <section className="card p-5">
            <h2 className="text-2xl font-bold text-[#466550]">Tiá»‡n Ã­ch</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {homestay.amenities.map((amenity) => (
                <Pill key={amenity}>{amenity}</Pill>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#466550]">PhÃ²ng trá»‘ng hiá»‡n cÃ³</h2>
              <Pill tone="clay">Redis availability cache</Pill>
            </div>
            <div className="mt-4 space-y-3">
              {homestay.rooms.map((roomItem) => (
                <div key={roomItem.id} className="flex items-center justify-between rounded-2xl border border-[#eadfd3] bg-white p-4">
                  <div>
                    <p className="font-bold">{roomItem.name}</p>
                    <p className="text-sm text-[#75675f]">
                      {roomItem.capacity} khÃ¡ch Â· {roomItem.totalUnits} phÃ²ng Â· ChÃ­nh sÃ¡ch há»§y linh hoáº¡t
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#9a4029]">{money(roomItem.pricePerNight)}/Ä‘Ãªm</p>
                    <Link href="/checkout" className="btn-secondary mt-2">Chá»n phÃ²ng</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="card p-5">
              <h2 className="text-2xl font-bold text-[#466550]">Báº£n Ä‘á»“ & vá»‹ trÃ­</h2>
              <div className="mt-4 rounded-2xl bg-[#e8f0eb] p-6 text-sm leading-6 text-[#466550]">
                {homestay.location}. CÃ¡ch trung tÃ¢m thÃ nh phá»‘ khoáº£ng 15 phÃºt, thuáº­n tiá»‡n Ä‘i NÃºi BÃ  Äen vÃ  cÃ¡c Ä‘iá»ƒm áº©m thá»±c Ä‘á»‹a phÆ°Æ¡ng.
              </div>
            </div>
            <div className="card p-5">
              <h2 className="text-2xl font-bold text-[#466550]">ÄÃ¡nh giÃ¡</h2>
              {homestay.reviews.map((review) => (
                <p key={review.id} className="mt-3 text-[#75675f]">
                  {review.rating}/5 - {review.comment}
                </p>
              ))}
            </div>
          </section>
        </section>

        <aside className="card h-fit space-y-5 p-6 lg:sticky lg:top-24">
          <div>
            <p className="text-sm text-[#75675f]">PhÃ²ng gá»£i Ã½</p>
            <h2 className="text-3xl font-bold text-[#466550]">{room.name}</h2>
            <p className="mt-1 font-bold">{money(room.pricePerNight)}/Ä‘Ãªm</p>
          </div>
          <div className="rounded-2xl bg-[#fdf9f4] p-4">
            <p className="font-bold text-[#466550]">Dá»‹ch vá»¥ Ä‘Ã£ bao gá»“m</p>
            {homestay.includedServices.map((service) => (
              <p key={service.id} className="mt-2 text-sm">{service.name}</p>
            ))}
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="font-bold text-[#466550]">Dá»‹ch vá»¥ Ä‘áº·t thÃªm</p>
            {homestay.services.map((service) => (
              <div key={service.id} className="mt-2 flex justify-between text-sm">
                <span>{service.name}</span>
                <span>{money(service.unitPrice)}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-[#fdf9f4] p-4 text-sm text-[#75675f]">
            <p className="font-bold text-[#466550]">TÃ³m táº¯t nhanh</p>
            <p className="mt-2">NgÃ y nháº­n: 28/05/2026</p>
            <p>NgÃ y tráº£: 30/05/2026</p>
            <p>Sá»‘ khÃ¡ch: 2 ngÆ°á»i lá»›n</p>
          </div>
          <Link href="/checkout" className="block text-center btn-primary">
            Táº¡o booking demo
          </Link>
        </aside>
      </div>
    </main>
  );
}

