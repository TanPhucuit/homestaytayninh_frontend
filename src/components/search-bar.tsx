"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Users } from "lucide-react";
import {
  AMENITY_OPTIONS,
  PRICE_MAX,
  PRICE_MIN,
  PRICE_STEP,
  TYPE_OPTIONS,
  type NormalizedHomestaySearch
} from "@/lib/search-filters";

type SearchBarVariant = "home" | "sidebar" | "mobile";

interface SearchBarProps {
  initialFilters?: NormalizedHomestaySearch;
  variant?: SearchBarVariant;
}

function money(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}

function toggleValue(value: string, selected: string[], setSelected: (next: string[]) => void) {
  setSelected(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
}

export function SearchBar({ initialFilters, variant = "home" }: SearchBarProps) {
  const router = useRouter();
  const [guests, setGuests] = useState(initialFilters?.guests ?? "2");
  const [types, setTypes] = useState<string[]>(initialFilters?.types ?? []);
  const [amenities, setAmenities] = useState<string[]>(initialFilters?.amenities ?? []);
  const [price, setPrice] = useState(Number(initialFilters?.price ?? PRICE_MAX));
  const [filtersOpen, setFiltersOpen] = useState(variant !== "home");
  const [isPending, startTransition] = useTransition();

  const priceLabel = useMemo(() => money(price), [price]);
  const isSidebar = variant === "sidebar";
  const isMobile = variant === "mobile";
  const panelClass = isSidebar
    ? "search-panel search-panel-sidebar"
    : isMobile
      ? "search-panel search-panel-mobile"
      : "search-panel search-panel-home";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    const normalizedGuests = Number(guests);

    if (Number.isFinite(normalizedGuests) && normalizedGuests > 0) params.set("guests", String(normalizedGuests));
    types.forEach((type) => params.append("type", type));
    amenities.forEach((amenity) => params.append("amenities", amenity));
    params.set("price", String(price));

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/homestays?${query}` : "/homestays");
    });
  }

  const filterControls = (
    <div className={isSidebar || isMobile ? "grid gap-6" : "grid gap-5 border-t border-line-soft pt-5 md:grid-cols-[1fr_1fr_1fr]"}>
      <fieldset className="grid gap-3">
        <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf">Loại hình</legend>
        <div className="grid gap-2">
          {TYPE_OPTIONS.map((type) => (
            <label className="check-row" key={type}>
              <input
                checked={types.includes(type)}
                onChange={() => toggleValue(type, types, setTypes)}
                type="checkbox"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf">Tiện ích</legend>
        <div className="grid gap-2">
          {AMENITY_OPTIONS.map((amenity) => (
            <label className="check-row" key={amenity}>
              <input
                checked={amenities.includes(amenity)}
                onChange={() => toggleValue(amenity, amenities, setAmenities)}
                type="checkbox"
              />
              <span>{amenity}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid content-start gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf">Giá / đêm</span>
          <span className="rounded-full bg-leaf-soft px-3 py-1 text-xs font-semibold text-leaf">{priceLabel}</span>
        </div>
        <input
          aria-label="Giá tối đa mỗi đêm"
          className="price-slider"
          max={PRICE_MAX}
          min={PRICE_MIN}
          name="price"
          onChange={(event) => {
            setPrice(Number(event.currentTarget.value));
          }}
          onInput={(event) => {
            setPrice(Number(event.currentTarget.value));
          }}
          step={PRICE_STEP}
          type="range"
          value={price}
        />
        <div className="flex justify-between text-xs font-semibold text-subtle">
          <span>{money(PRICE_MIN)}</span>
          <span>{money(PRICE_MAX)}</span>
        </div>
      </div>
      {variant === "home" && filtersOpen && (
        <div className="md:col-span-3">
          <button className="btn-primary w-full md:w-auto" disabled={isPending} type="submit">
            {isPending ? "Đang áp dụng..." : "Áp dụng bộ lọc"}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <form className={panelClass} onSubmit={submit}>
      <div className={isSidebar || isMobile ? "grid gap-4" : "grid items-end gap-3 lg:grid-cols-[1fr_14rem_auto_auto] lg:gap-4"}>
        {variant === "home" && (
          <div className="px-2 pb-1 lg:pb-3">
            <p className="font-heading text-xl text-ink">Tìm nơi nghỉ phù hợp</p>
            <p className="mt-1 text-sm text-muted">Chọn số khách, lọc loại hình, tiện ích và mức giá.</p>
          </div>
        )}
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-subtle">
          Số khách
          <span className="relative">
          <Users className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-leaf" aria-hidden="true" />
          <input
            className="field w-full pl-11"
            min="1"
            name="guests"
            onChange={(event) => setGuests(event.target.value)}
            placeholder="2"
            type="number"
            value={guests}
          />
          </span>
        </label>

        <button
          className="btn-secondary self-end"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((open) => !open)}
          type="button"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Bộ lọc
          <span className="rounded-full bg-leaf-soft px-2 py-0.5 text-xs text-leaf-strong">{types.length + amenities.length}</span>
        </button>

        <button className="btn-primary self-end px-7" disabled={isPending} type="submit">
          <Search className="size-4" aria-hidden="true" />
          {isPending ? "Đang tìm..." : isSidebar || isMobile ? "Áp dụng" : "Tìm kiếm"}
        </button>
      </div>

      {(filtersOpen || isSidebar || isMobile) && <div className="mt-5">{filterControls}</div>}
    </form>
  );
}
