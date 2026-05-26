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
      description="Lọc theo ngày nhận/trả phòng, số khách, loại hình, mức giá và tiện ích. Dữ liệu hiển thị từ backend production, không dùng frontend giả."
    >
      <form className="mb-8 grid gap-3 rounded-[24px] bg-white/90 p-5 shadow-[0_18px_55px_rgba(123,41,20,0.08)] md:grid-cols-6" action="/homestays">
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#89726c]">
          Nhận phòng
          <input className="field" name="checkIn" type="date" defaultValue={filters.checkIn} />
        </label>
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#89726c]">
          Trả phòng
          <input className="field" name="checkOut" type="date" defaultValue={filters.checkOut} />
        </label>
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#89726c]">
          Số khách
          <input className="field" name="guests" type="number" min="1" placeholder="2" defaultValue={filters.guests} />
        </label>
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#89726c]">
          Loại hình
          <select className="field" name="type" defaultValue={filters.type ?? ""}>
            <option value="">Tất cả</option>
            <option value="Phòng">Phòng</option>
            <option value="Lều">Lều</option>
            <option value="Nhà nguyên căn">Nhà nguyên căn</option>
          </select>
        </label>
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#89726c]">
          Giá tối đa
          <input className="field" name="maxPrice" type="number" min="0" step="50000" placeholder="2.000.000" defaultValue={filters.maxPrice} />
        </label>
        <button className="btn-primary self-end" type="submit">Tìm kiếm</button>
      </form>

      {homestays.length ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {homestays.map((homestay) => <HomestayCard homestay={homestay} key={homestay.id} />)}
        </section>
      ) : (
        <EmptyState title="Không tìm thấy homestay phù hợp" description="Thử giảm bộ lọc hoặc chọn ngày lưu trú khác." actionHref="/homestays" actionLabel="Xóa bộ lọc" />
      )}
    </PageShell>
  );
}
