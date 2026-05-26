import Link from "next/link";
import { EmptyState } from "@/components/feedback-state";
import { AppTopBar } from "@/components/customer-ui";
import { getHomestays, HomestayFilters, money } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomestaysPage({ searchParams }: { searchParams: Promise<HomestayFilters> }) {
  const filters = await searchParams;
  const homestays = await getHomestays("CUSTOMER", filters);

  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Kết quả tìm kiếm</p>
            <h1 className="mt-2 font-heading text-4xl text-[#1c1c19] md:text-5xl">Tìm thấy {homestays.length} homestay tại Tây Ninh</h1>
            <p className="mt-3 max-w-2xl text-[#56423d]">Lọc theo ngày, số khách, loại hình, mức giá và tiện ích. Dữ liệu lấy từ backend API.</p>
          </div>
          <Link className="btn-secondary" href="/">Về trang chủ</Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-[288px_1fr]">
          <aside className="card h-fit p-6 lg:sticky lg:top-28">
            <form className="grid gap-5" action="/homestays">
              <div>
                <h3 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-[#466550]">Ngày lưu trú</h3>
                <div className="grid gap-3">
                  <input className="field" name="checkIn" type="date" defaultValue={filters.checkIn} />
                  <input className="field" name="checkOut" type="date" defaultValue={filters.checkOut} />
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-[#466550]">Loại hình</h3>
                <select className="field w-full" name="type" defaultValue={filters.type ?? ""}>
                  <option value="">Tất cả</option>
                  <option value="Phòng">Phòng</option>
                  <option value="Lều">Lều</option>
                  <option value="Nhà nguyên căn">Nhà nguyên căn</option>
                </select>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-[#466550]">Khoảng giá / đêm</h3>
                <input className="field w-full" name="maxPrice" type="number" min="0" step="50000" placeholder="2.000.000" defaultValue={filters.maxPrice} />
              </div>
              <div>
                <h3 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-[#466550]">Số khách</h3>
                <input className="field w-full" name="guests" type="number" min="1" placeholder="2" defaultValue={filters.guests} />
              </div>
              <button className="btn-primary w-full" type="submit">Áp dụng bộ lọc</button>
              <Link className="btn-secondary w-full" href="/homestays">Xóa bộ lọc</Link>
            </form>
          </aside>

          {homestays.length ? (
            <section className="space-y-5">
              {homestays.map((homestay) => (
                <article className="group grid overflow-hidden rounded-[24px] bg-white shadow-[0_18px_55px_rgba(123,41,20,0.08)] transition hover:-translate-y-1 md:grid-cols-[320px_1fr]" key={homestay.id}>
                  <div className="min-h-64 bg-cover bg-center" style={{ backgroundImage: `url(${homestay.imageUrl})` }} />
                  <div className="p-5 md:p-6">
                    <div className="flex flex-col justify-between gap-4 md:flex-row">
                      <div>
                        <p className="eyebrow">{homestay.type}</p>
                        <h2 className="mt-2 font-heading text-3xl text-[#1c1c19]">{homestay.name}</h2>
                        <p className="mt-2 text-sm leading-6 text-[#56423d]">{homestay.description}</p>
                      </div>
                      <div className="shrink-0 text-left md:text-right">
                        <p className="text-xs font-semibold text-[#89726c]">Giá mỗi đêm</p>
                        <p className="font-heading text-2xl text-[#9a4029]">Từ {money(homestay.priceFrom)}</p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {homestay.amenities.slice(0, 5).map((amenity) => (
                        <span className="rounded-full bg-[#e8f0eb] px-3 py-1 text-xs font-bold text-[#466550]" key={amenity}>{amenity}</span>
                      ))}
                    </div>
                    <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <p className="text-sm font-semibold text-[#75675f]">★ {homestay.rating} · {homestay.capacity} khách · {homestay.location}</p>
                      <Link className="btn-secondary" href={`/homestays/${homestay.id}`}>Xem chi tiết</Link>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          ) : (
            <EmptyState title="Không tìm thấy homestay phù hợp" description="Thử giảm bộ lọc hoặc chọn ngày lưu trú khác." actionHref="/homestays" actionLabel="Xóa bộ lọc" />
          )}
        </div>
      </div>
    </main>
  );
}
