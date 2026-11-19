import Link from "next/link";
import { ArrowDownWideNarrow, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { AppTopBar, HomestayCard, PageBanner, SiteFooter } from "@/components/customer-ui";
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
    <>
      <AppTopBar />
      <main id="main" className="min-h-screen text-ink">
        <PageBanner
          eyebrow="Kết quả tìm kiếm"
          title={<>Tìm thấy <span className="italic text-brand">{filteredHomestays.length}</span> homestay tại Tây Ninh</>}
          description="Lọc theo số khách, loại hình, mức giá và tiện ích. Ngày lưu trú được chọn riêng sau khi bạn chọn phòng."
        >
          <div className="flex flex-wrap gap-2">
            <Link className="btn-secondary" href="/">Trang chủ</Link>
            <Link className="btn-secondary" href="/homestays"><RotateCcw className="size-4" aria-hidden="true" /> Xóa bộ lọc</Link>
          </div>
        </PageBanner>

        <div className="container-page py-10 md:py-14">
          <div className="mb-6 lg:hidden">
            <SearchBar initialFilters={filters} variant="mobile" />
          </div>

          <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
            <aside className="hidden h-fit lg:sticky lg:top-28 lg:block">
              <SearchBar initialFilters={filters} variant="sidebar" />
            </aside>

            <section aria-label="Danh sách homestay">
              <div className="mb-8 flex flex-col justify-between gap-4 border-b border-line-soft pb-5 md:flex-row md:items-center">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted">
                    Trang <span className="font-semibold text-ink">{currentPage}/{totalPages}</span> · hiển thị {visibleHomestays.length} lựa chọn
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {appliedFilters.length ? appliedFilters.map((item) => (
                      <span className="rounded-full bg-leaf-soft px-3 py-1 text-xs font-semibold text-leaf-strong" key={item.key}>{item.label}</span>
                    )) : <span className="rounded-full border border-line-soft bg-white px-3 py-1 text-xs font-medium text-muted">Chưa áp dụng bộ lọc</span>}
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 self-start rounded-full border border-line-soft bg-white px-4 py-2 text-sm font-medium text-ink-muted md:self-auto">
                  <ArrowDownWideNarrow className="size-4 text-leaf" aria-hidden="true" /> Sắp xếp: Gợi ý phù hợp
                </span>
              </div>

              {visibleHomestays.length ? (
                <>
                  <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 2xl:grid-cols-3">
                    {visibleHomestays.map((homestay, index) => (
                      <div className="reveal" key={homestay.id} style={{ ["--reveal-delay" as string]: `${(index % 2) * 100}ms` }}>
                        <HomestayCard homestay={homestay} href={detailHrefWithSearch(homestay.id, filters)} />
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Phân trang homestay">
                      <Link
                        aria-disabled={currentPage === 1}
                        className={`btn-secondary px-4 ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
                        href={homestaySearchHref(filters, currentPage - 1)}
                      >
                        <ChevronLeft className="size-4" aria-hidden="true" /> Trước
                      </Link>
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                        <Link
                          aria-current={page === currentPage ? "page" : undefined}
                          className={`grid size-11 place-items-center rounded-full text-sm font-semibold transition ${
                            page === currentPage ? "bg-bark text-white" : "border border-line bg-white text-ink-muted hover:border-ink"
                          }`}
                          href={homestaySearchHref(filters, page)}
                          key={page}
                        >
                          {page}
                        </Link>
                      ))}
                      <Link
                        aria-disabled={currentPage === totalPages}
                        className={`btn-secondary px-4 ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
                        href={homestaySearchHref(filters, currentPage + 1)}
                      >
                        Sau <ChevronRight className="size-4" aria-hidden="true" />
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
      <SiteFooter />
    </>
  );
}
