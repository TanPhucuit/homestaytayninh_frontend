"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

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
      <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-[30px] md:grid-cols-4 md:grid-rows-[260px_260px]">
        {visibleImages.map((image, index) => {
          const isMain = index === 0;
          const isLast = index === 4 && images.length > 5;

          return (
            <button
              className={`group relative overflow-hidden bg-sand-deep text-left md:min-h-0 ${isMain ? "col-span-2 min-h-[260px] md:row-span-2" : "min-h-[140px]"}`}
              key={`${image.url}-${index}`}
              onClick={() => setActiveIndex(index)}
              type="button"
              aria-label={`Xem ảnh ${index + 1}`}
            >
              <img className="h-full w-full object-cover transition duration-[900ms] ease-out group-hover:scale-[1.06]" src={image.url} alt={image.alt} />
              <span className="absolute inset-0 bg-gradient-to-t from-bark/30 via-transparent to-transparent opacity-60 transition duration-500 group-hover:opacity-100" />
              {isLast && (
                <span className="absolute inset-0 grid place-items-center bg-bark/55 text-center font-heading text-2xl text-white backdrop-blur-sm">
                  Xem tất cả ảnh
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeImage && (
        <div className="animate-fade-up fixed inset-0 z-50 grid grid-rows-[auto_1fr] bg-bark/95 p-4 backdrop-blur-md md:p-8" role="dialog" aria-modal="true" aria-label="Xem ảnh homestay">
          <div className="mb-4 flex items-center justify-between gap-3 text-white">
            <p className="text-sm font-bold">{activeIndex! + 1} / {images.length}</p>
            <button className="btn-light min-h-11 px-4 text-sm" onClick={() => setActiveIndex(null)} type="button">
              <X className="size-4" aria-hidden="true" /> Đóng
            </button>
          </div>
          <div className="relative grid min-h-0 place-items-center">
            <button
              className="absolute left-0 top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white text-bark shadow-lift transition hover:bg-gold"
              onClick={() => setActiveIndex((current) => (current === null ? 0 : (current - 1 + images.length) % images.length))}
              type="button"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <img className="max-h-[78vh] w-auto max-w-full rounded-3xl object-contain shadow-lift" src={activeImage.url} alt={activeImage.alt} />
            <button
              className="absolute right-0 top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white text-bark shadow-lift transition hover:bg-gold"
              onClick={() => setActiveIndex((current) => (current === null ? 0 : (current + 1) % images.length))}
              type="button"
              aria-label="Ảnh tiếp theo"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
