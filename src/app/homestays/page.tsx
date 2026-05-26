import { EmptyState } from "@/components/feedback-state";
import { HomestayCard, PageShell } from "@/components/customer-ui";
import { getHomestays, HomestayFilters } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomestaysPage({ searchParams }: { searchParams: Promise<HomestayFilters> }) {
  const filters = await searchParams;
  const homestays = await getHomestays("CUSTOMER", filters);

  return (
    <PageShell
      eyebrow="Customer Portal"
      title="Tìm homestay Tây Ninh"
      description="Lọc theo ngày nhận/trả phòng, số khách, loại hình, mức giá và tiện ích. Dữ liệu được lấy từ backend nếu API khả dụng."
    >
      <form className="card mb-6 grid gap-3 p-5 md:grid-cols-6" action="/homestays">
        <input className="field" name="checkIn" type="date" defaultValue={filters.checkIn} aria-label="Ngày nhận phòng" />
        <input className="field" name="checkOut" type="date" defaultValue={filters.checkOut} aria-label="Ngày trả phòng" />
        <input className="field" name="guests" type="number" min="1" placeholder="Số khách" defaultValue={filters.guests} />
        <select className="field" name="type" defaultValue={filters.type ?? ""}>
          <option value="">Tất cả loại hình</option>
          <option value="Phòng">Phòng</option>
          <option value="Lều">Lều</option>
          <option value="Nhà nguyên căn">Nhà nguyên căn</option>
        </select>
        <input className="field" name="maxPrice" type="number" min="0" step="50000" placeholder="Giá tối đa" defaultValue={filters.maxPrice} />
        <button className="btn-primary" type="submit">Tìm kiếm</button>
      </form>

      {homestays.length ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {homestays.map((homestay) => <HomestayCard homestay={homestay} key={homestay.id} />)}
        </section>
      ) : (
        <EmptyState title="Không tìm thấy homestay phù hợp" description="Thử giảm bộ lọc hoặc chọn ngày lưu trú khác." actionHref="/homestays" actionLabel="Xóa bộ lọc" />
      )}
    </PageShell>
  );
}
