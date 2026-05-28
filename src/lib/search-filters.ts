import type { Homestay } from "./types";

export const TYPE_OPTIONS = ["Phòng", "Lều Glamping", "Nhà nguyên căn"] as const;

export const AMENITY_OPTIONS = [
  "Hồ bơi",
  "Wifi miễn phí",
  "Khu BBQ",
  "Chỗ đậu xe",
  "Bếp riêng",
  "Cho thú cưng"
] as const;

export const PRICE_MIN = 300_000;
export const PRICE_MAX = 5_000_000;
export const PRICE_STEP = 50_000;
export const HOMESTAY_PAGE_SIZE = 6;

export type SearchParamValue = string | string[] | undefined;
export type HomestaySearchParams = Record<string, SearchParamValue>;

export interface NormalizedHomestaySearch {
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  types: string[];
  amenities: string[];
  price?: string;
  page: number;
}

function first(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

function all(value: SearchParamValue) {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).map((item) => item.trim()).filter(Boolean);
}

function positiveNumber(value: SearchParamValue) {
  const raw = first(value);
  if (!raw) return undefined;
  const number = Number(raw);
  return Number.isFinite(number) && number > 0 ? String(number) : undefined;
}

function positiveInteger(value: SearchParamValue, fallback = 1) {
  const raw = first(value);
  if (!raw) return fallback;
  const number = Number(raw);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

export function normalizeHomestaySearchParams(params: HomestaySearchParams): NormalizedHomestaySearch {
  return {
    guests: positiveNumber(params.guests),
    types: all(params.type),
    amenities: [...all(params.amenities), ...all(params.amenity)],
    price: positiveNumber(params.price) ?? positiveNumber(params.maxPrice),
    page: positiveInteger(params.page)
  };
}

export function buildHomestaySearchParams(filters: NormalizedHomestaySearch, page?: number) {
  const params = new URLSearchParams();
  if (filters.guests) params.set("guests", filters.guests);
  filters.types.forEach((type) => params.append("type", type));
  filters.amenities.forEach((amenity) => params.append("amenities", amenity));
  if (filters.price) params.set("price", filters.price);
  if (page && page > 1) params.set("page", String(page));
  return params;
}

export function homestaySearchHref(filters: NormalizedHomestaySearch, page?: number) {
  const query = buildHomestaySearchParams(filters, page).toString();
  return query ? `/homestays?${query}` : "/homestays";
}

export function detailHrefWithSearch(id: string, filters: NormalizedHomestaySearch) {
  void filters;
  return `/homestays/${id}`;
}

export function apiFiltersFromSearch(filters: NormalizedHomestaySearch) {
  void filters;
  return {};
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function matchesAlias(value: string, selected: string, aliases: Record<string, string[]>) {
  const normalizedValue = normalizeText(value);
  const normalizedSelected = normalizeText(selected);
  const candidates = aliases[normalizedSelected] ?? [normalizedSelected];

  return candidates.some((candidate) => normalizedValue.includes(candidate) || candidate.includes(normalizedValue));
}

export function filterHomestays(homestays: Homestay[], filters: NormalizedHomestaySearch) {
  const maxPrice = filters.price ? Number(filters.price) : undefined;
  const guests = filters.guests ? Number(filters.guests) : undefined;
  const typeAliases: Record<string, string[]> = {
    phong: ["phong", "room"],
    "leu glamping": ["leu", "glamping", "tent"],
    "nha nguyen can": ["nha nguyen can", "nguyen can", "villa", "can ho"]
  };
  const amenityAliases: Record<string, string[]> = {
    "ho boi": ["ho boi", "pool"],
    "wifi mien phi": ["wifi", "wi-fi"],
    "khu bbq": ["bbq", "nuong"],
    "cho dau xe": ["bai do xe", "dau xe", "parking"],
    "bep rieng": ["bep", "kitchen"],
    "cho thu cung": ["thu cung", "pet"]
  };

  return homestays.filter((homestay) => {
    const typeOk = filters.types.length === 0 || filters.types.some((type) => matchesAlias(homestay.type, type, typeAliases));
    const priceOk = !maxPrice || homestay.priceFrom <= maxPrice;
    const guestsOk = !guests || homestay.capacity >= guests;
    const amenitiesOk = filters.amenities.every((selected) =>
      homestay.amenities.some((amenity) => matchesAlias(amenity, selected, amenityAliases))
    );

    return typeOk && priceOk && guestsOk && amenitiesOk;
  });
}

export function getAppliedFilterLabels(filters: NormalizedHomestaySearch) {
  const labels: Array<{ key: string; label: string }> = [];
  if (filters.guests) labels.push({ key: "guests", label: `${filters.guests} khách` });
  filters.types.forEach((type) => labels.push({ key: `type-${type}`, label: type }));
  filters.amenities.forEach((amenity) => labels.push({ key: `amenity-${amenity}`, label: amenity }));
  if (filters.price) labels.push({ key: "price", label: `Tối đa ${Number(filters.price).toLocaleString("vi-VN")}đ/đêm` });
  return labels;
}
