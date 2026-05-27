"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import DatePicker from "react-datepicker";
import { useRouter } from "next/navigation";
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

function parseISODate(value?: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatISODate(value: Date | null) {
  if (!value) return undefined;
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function money(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}

function toggleValue(value: string, selected: string[], setSelected: (next: string[]) => void) {
  setSelected(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
}

export function SearchBar({ initialFilters, variant = "home" }: SearchBarProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date | null>(() => parseISODate(initialFilters?.checkIn));
  const [endDate, setEndDate] = useState<Date | null>(() => parseISODate(initialFilters?.checkOut));
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
    const checkIn = formatISODate(startDate);
    const checkOut = formatISODate(endDate);
    const normalizedGuests = Number(guests);

    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
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
    <div className={isSidebar || isMobile ? "grid gap-6" : "grid gap-5 border-t border-[#eadfd4] pt-5 md:grid-cols-[1fr_1fr_1fr]"}>
      <fieldset className="grid gap-3">
        <legend className="text-xs font-black uppercase tracking-[0.14em] text-[#466550]">Loại hình</legend>
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
        <legend className="text-xs font-black uppercase tracking-[0.14em] text-[#466550]">Tiện ích</legend>
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
          <span className="text-xs font-black uppercase tracking-[0.14em] text-[#466550]">Giá / đêm</span>
          <span className="rounded-full bg-[#e8f0eb] px-3 py-1 text-xs font-black text-[#466550]">{priceLabel}</span>
        </div>
        <input
          aria-label="Giá tối đa mỗi đêm"
          className="price-slider"
          max={PRICE_MAX}
          min={PRICE_MIN}
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
        <div className="flex justify-between text-xs font-semibold text-[#89726c]">
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
      <div className={isSidebar || isMobile ? "grid gap-4" : "grid gap-3 lg:grid-cols-[1.35fr_0.72fr_auto_auto]"}>
        <label className="grid gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#89726c]">
          Ngày nhận - trả
          <DatePicker
            className="field w-full"
            dateFormat="dd/MM/yyyy"
            endDate={endDate}
            minDate={new Date()}
            onChange={(dates) => {
              const [start, end] = dates as [Date | null, Date | null];
              setStartDate(start);
              setEndDate(end);
            }}
            placeholderText="dd/mm/yyyy - dd/mm/yyyy"
            selected={startDate}
            selectsRange
            startDate={startDate}
          />
        </label>

        <label className="grid gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#89726c]">
          Số khách
          <input
            className="field w-full"
            min="1"
            onChange={(event) => setGuests(event.target.value)}
            placeholder="2"
            type="number"
            value={guests}
          />
        </label>

        <button
          className="btn-secondary self-end"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((open) => !open)}
          type="button"
        >
          Bộ lọc
          <span className="ml-2 rounded-full bg-[#e8f0eb] px-2 py-0.5 text-xs text-[#466550]">{types.length + amenities.length}</span>
        </button>

        <button className="btn-primary self-end" disabled={isPending} type="submit">
          {isPending ? "Đang tìm..." : isSidebar || isMobile ? "Áp dụng" : "Tìm kiếm"}
        </button>
      </div>

      {(filtersOpen || isSidebar || isMobile) && <div className="mt-5">{filterControls}</div>}
    </form>
  );
}
