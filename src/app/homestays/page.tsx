import Link from "next/link";
import { AppTopBar, HomestayCard } from "@/components/customer-ui";
import { EmptyState } from "@/components/feedback-state";
import { SearchBar } from "@/components/search-bar";
import { getHomestays } from "@/lib/api";
import {
  HOMESTAY_PAGE_SIZE,
  apiFiltersFromSearch,
  detailHrefWithSearch,
  filterHomestays,
  getAppliedFilterLabels,
  homestaySearchHref,
  normalizeHomestaySearchParams,
  type HomestaySearchParams
} from "@/lib/search-filters";

export const dynamic = "force-dynamic";

export default async function HomestaysPage({ searchParams }: { searchParams: Promise<HomestaySearchParams> }) {
  const rawParams = await searchParams;
  const filters = normalizeHomestaySearchParams(rawParams);
  const homestays = await getHomestays("CUSTOMER", apiFiltersFromSearch(filters));
  const filteredHomestays = filterHomestays(homestays, filters);
  const totalPages = Math.max(1, Math.ceil(filteredHomestays.length / HOMESTAY_PAGE_SIZE));
  const currentPage = Math.min(filters.page, totalPages);
  const pageStart = (currentPage - 1) * HOMESTAY_PAGE_SIZE;
  const visibleHomestays = filteredHomestays.slice(pageStart, pageStart + HOMESTAY_PAGE_SIZE);
  const appliedFilters = getAppliedFilterLabels(filters);

  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <header className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow">Kết quả tìm kiếm</p>
            <h1 className="mt-2 font-heading text-4xl text-[#1c1c19] md:text-5xl">
              Tìm thấy {filteredHomestays.length} homestay tại Tây Ninh
            </h1>
            <p className="mt-3 max-w-2xl text-[#56423d]">
              Lọc theo ngày, số khách, loại hình, mức giá và tiện ích. Bộ lọc được giữ khi xem chi tiết, đặt phòng hoặc chuyển trang.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="btn-secondary" href="/">Trang chủ</Link>
            <Link className="btn-secondary" href="/homestays">Xóa bộ lọc</Link>
          </div>
        </header>

        <div className="mb-5 lg:hidden">
          <SearchBar initialFilters={filters} variant="mobile" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="hidden h-fit lg:sticky lg:top-28 lg:block">
            <SearchBar initialFilters={filters} variant="sidebar" />
          </aside>

          <section>
            <div className="mb-5 flex flex-col justify-between gap-3 rounded-2xl border border-[#eadfd4] bg-white/82 p-4 shadow-[0_16px_45px_rgba(154,64,41,0.06)] md:flex-row md:items-center">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#466550]">
                  Trang {currentPage}/{totalPages} · hiển thị {visibleHomestays.length} lựa chọn
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {appliedFilters.length ? appliedFilters.map((item) => (
                    <span className="rounded-full bg-[#e8f0eb] px-3 py-1 text-xs font-bold text-[#466550]" key={item.key}>{item.label}</span>
                  )) : <span className="rounded-full bg-[#f1ede8] px-3 py-1 text-xs font-bold text-[#75675f]">Chưa áp dụng bộ lọc</span>}
                </div>
              </div>
              <select className="field w-full md:w-56" defaultValue="recommended" aria-label="Sắp xếp">
                <option value="recommended">Gợi ý phù hợp</option>
                <option value="rating">Rating cao</option>
                <option value="price">Giá tốt</option>
              </select>
            </div>

            {visibleHomestays.length ? (
              <>
                <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
                  {visibleHomestays.map((homestay) => (
                    <HomestayCard homestay={homestay} href={detailHrefWithSearch(homestay.id, filters)} key={homestay.id} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Phân trang homestay">
                    <Link
                      aria-disabled={currentPage === 1}
                      className={`btn-secondary px-4 py-2 ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
                      href={homestaySearchHref(filters, currentPage - 1)}
                    >
                      Trước
                    </Link>
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                      <Link
                        className={`grid size-11 place-items-center rounded-xl border text-sm font-black ${
                          page === currentPage
                            ? "border-[#9a4029] bg-[#9a4029] text-white"
                            : "border-[#dcc0ba] bg-white text-[#466550] hover:border-[#466550]"
                        }`}
                        href={homestaySearchHref(filters, page)}
                        key={page}
                      >
                        {page}
                      </Link>
                    ))}
                    <Link
                      aria-disabled={currentPage === totalPages}
                      className={`btn-secondary px-4 py-2 ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
                      href={homestaySearchHref(filters, currentPage + 1)}
                    >
                      Sau
                    </Link>
                  </nav>
                )}
              </>
            ) : (
              <EmptyState
                actionHref="/homestays"
                actionLabel="Xóa bộ lọc"
                description="Thử giảm bộ lọc hoặc chọn ngày lưu trú khác."
                title="Không tìm thấy homestay phù hợp"
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
