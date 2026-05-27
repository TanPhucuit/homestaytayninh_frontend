"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";

type GalleryImage = {
  url: string;
  alt: string;
};

export function HomestayGallery({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];
  const visibleImages = images.slice(0, 5);

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") setActiveIndex((current) => (current === null ? 0 : (current + 1) % images.length));
      if (event.key === "ArrowLeft") setActiveIndex((current) => (current === null ? 0 : (current - 1 + images.length) % images.length));
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeIndex, images.length]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 overflow-hidden rounded-2xl md:grid-cols-4 md:grid-rows-[250px_250px]">
        {visibleImages.map((image, index) => {
          const isMain = index === 0;
          const isLast = index === 4 && images.length > 5;

          return (
            <button
              className={`group relative overflow-hidden bg-[#efe7dc] text-left md:min-h-0 ${isMain ? "col-span-2 min-h-[260px] md:row-span-2" : "min-h-[140px]"}`}
              key={`${image.url}-${index}`}
              onClick={() => setActiveIndex(index)}
              type="button"
              aria-label={`Xem ảnh ${index + 1}`}
            >
              <img className="h-full w-full object-cover transition duration-700 group-hover:scale-105" src={image.url} alt={image.alt} />
              <span className="absolute inset-0 bg-gradient-to-t from-[#1c1c19]/18 via-transparent to-transparent opacity-70 transition group-hover:opacity-100" />
              {isLast && (
                <span className="absolute inset-0 grid place-items-center bg-[#fdf9f4]/54 text-center font-heading text-2xl font-bold text-[#1c1c19] backdrop-blur-sm">
                  Xem tất cả ảnh
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeImage && (
        <div className="fixed inset-0 z-50 grid bg-[#1c1c19]/88 p-4 backdrop-blur-sm md:p-8" role="dialog" aria-modal="true" aria-label="Xem ảnh homestay">
          <div className="mb-4 flex items-center justify-between gap-3 text-white">
            <p className="text-sm font-bold">{activeIndex! + 1} / {images.length}</p>
            <button className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#1c1c19]" onClick={() => setActiveIndex(null)} type="button">
              Đóng
            </button>
          </div>
          <div className="relative grid min-h-0 place-items-center">
            <button
              className="absolute left-0 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/92 font-bold text-[#1c1c19] shadow-lg"
              onClick={() => setActiveIndex((current) => (current === null ? 0 : (current - 1 + images.length) % images.length))}
              type="button"
              aria-label="Ảnh trước"
            >
              ‹
            </button>
            <img className="max-h-[78vh] w-auto max-w-full rounded-2xl object-contain shadow-[0_30px_90px_rgba(0,0,0,0.35)]" src={activeImage.url} alt={activeImage.alt} />
            <button
              className="absolute right-0 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/92 font-bold text-[#1c1c19] shadow-lg"
              onClick={() => setActiveIndex((current) => (current === null ? 0 : (current + 1) % images.length))}
              type="button"
              aria-label="Ảnh tiếp theo"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </>
  );
}
