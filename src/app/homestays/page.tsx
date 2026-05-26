import Link from "next/link";
import { AppTopBar, HomestayCard } from "@/components/customer-ui";
import { EmptyState } from "@/components/feedback-state";
import { getHomestays, HomestayFilters } from "@/lib/api";

export const dynamic = "force-dynamic";

function detailHref(id: string, filters: HomestayFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `/homestays/${id}?${query}` : `/homestays/${id}`;
}

function cleanFilters(filters: HomestayFilters): HomestayFilters {
  const positiveNumber = (value?: string) => {
    if (!value) return undefined;
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? String(number) : undefined;
  };

  return {
    checkIn: filters.checkIn,
    checkOut: filters.checkOut,
    guests: positiveNumber(filters.guests),
    type: filters.type,
    maxPrice: positiveNumber(filters.maxPrice),
    amenity: filters.amenity
  };
}

export default async function HomestaysPage({ searchParams }: { searchParams: Promise<HomestayFilters> }) {
  const filters = await searchParams;
  const apiFilters = cleanFilters(filters);
  const homestays = await getHomestays("CUSTOMER", apiFilters);
  const appliedFilters = Object.entries(apiFilters).filter(([, value]) => value);

  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <header className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow">Kết quả tìm kiếm</p>
            <h1 className="mt-2 font-heading text-4xl text-[#1c1c19] md:text-5xl">Tìm thấy {homestays.length} homestay tại Tây Ninh</h1>
            <p className="mt-3 max-w-2xl text-[#56423d]">Lọc theo ngày, số khách, loại hình, mức giá và tiện ích. Bộ lọc được giữ khi xem chi tiết và đặt phòng.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="btn-secondary" href="/">Trang chủ</Link>
            <Link className="btn-secondary" href="/homestays">Xóa bộ lọc</Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="card h-fit p-5 lg:sticky lg:top-28">
            <form className="grid gap-5" action="/homestays">
              <div>
                <h3 className="mb-3 text-sm font-black uppercase text-[#466550]">Ngày lưu trú</h3>
                <div className="grid gap-3">
                  <input className="field" name="checkIn" type="date" defaultValue={filters.checkIn} />
                  <input className="field" name="checkOut" type="date" defaultValue={filters.checkOut} />
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-black uppercase text-[#466550]">Loại hình</h3>
                <select className="field w-full" name="type" defaultValue={filters.type ?? ""}>
                  <option value="">Tất cả</option>
                  <option value="Phòng">Phòng</option>
                  <option value="Lều">Lều</option>
                  <option value="Nhà nguyên căn">Nhà nguyên căn</option>
                </select>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-black uppercase text-[#466550]">Khoảng giá / đêm</h3>
                <input className="field w-full" name="maxPrice" type="number" min="0" step="50000" placeholder="2000000" defaultValue={filters.maxPrice} />
              </div>
              <div>
                <h3 className="mb-3 text-sm font-black uppercase text-[#466550]">Số khách</h3>
                <input className="field w-full" name="guests" type="number" min="1" placeholder="2" defaultValue={filters.guests} />
              </div>
              <div>
                <h3 className="mb-3 text-sm font-black uppercase text-[#466550]">Tiện ích</h3>
                <div className="grid gap-2 text-sm font-semibold text-[#56423d]">
                  {["Wifi", "BBQ", "Hồ bơi", "Bãi đỗ xe"].map((item) => (
                    <label className="flex items-center gap-2" key={item}>
                      <input className="accent-[#9a4029]" name="amenity" type="radio" value={item} defaultChecked={filters.amenity === item} />
                      {item}
                    </label>
                  ))}
                  <label className="flex items-center gap-2">
                    <input className="accent-[#9a4029]" name="amenity" type="radio" value="" defaultChecked={!filters.amenity} />
                    Tất cả tiện ích
                  </label>
                </div>
              </div>
              <button className="btn-primary w-full" type="submit">Áp dụng bộ lọc</button>
            </form>
          </aside>

          <section>
            <div className="mb-5 flex flex-col justify-between gap-3 rounded-2xl border border-[#eadfd4] bg-white/82 p-4 md:flex-row md:items-center">
              <div className="flex flex-wrap gap-2">
                {appliedFilters.length ? appliedFilters.map(([key, value]) => (
                  <span className="rounded-full bg-[#e8f0eb] px-3 py-1 text-xs font-bold text-[#466550]" key={key}>{key}: {value}</span>
                )) : <span className="rounded-full bg-[#f1ede8] px-3 py-1 text-xs font-bold text-[#75675f]">Chưa áp dụng bộ lọc</span>}
              </div>
              <select className="field w-full md:w-56" defaultValue="recommended" aria-label="Sắp xếp">
                <option value="recommended">Gợi ý phù hợp</option>
                <option value="rating">Rating cao</option>
                <option value="price">Giá tốt</option>
              </select>
            </div>

            {homestays.length ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {homestays.map((homestay) => (
                  <HomestayCard homestay={homestay} href={detailHref(homestay.id, apiFilters)} key={homestay.id} />
                ))}
              </div>
            ) : (
              <EmptyState title="Không tìm thấy homestay phù hợp" description="Thử giảm bộ lọc hoặc chọn ngày lưu trú khác." actionHref="/homestays" actionLabel="Xóa bộ lọc" />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
