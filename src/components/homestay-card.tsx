import { money } from "@/lib/api";
import { Homestay } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export function HomestayCard({ homestay }: { homestay: Homestay }) {
  return (
    <article className="card overflow-hidden">
      <div className="relative h-56">
        <Image src={homestay.imageUrl} alt={homestay.name} fill className="object-cover" />
      </div>
      <div className="space-y-4 p-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#9a4029]">{homestay.type}</p>
          <h3 className="mt-1 text-2xl font-bold text-[#466550]">{homestay.name}</h3>
          <p className="mt-1 text-sm text-[#75675f]">{homestay.location}</p>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-[#75675f]">{homestay.description}</p>
        <div className="flex flex-wrap gap-2">
          {homestay.amenities.slice(0, 4).map((amenity) => (
            <span key={amenity} className="rounded-full bg-[#466550]/10 px-3 py-1 text-xs font-semibold text-[#466550]">
              {amenity}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#75675f]">Tu</p>
            <p className="font-bold text-[#2b211d]">{money(homestay.priceFrom)}/Ä‘Ãªm</p>
          </div>
          <Link href={`/homestays/${homestay.id}`} className="btn-primary">
            Xem chi tiáº¿t
          </Link>
        </div>
      </div>
    </article>
  );
}

