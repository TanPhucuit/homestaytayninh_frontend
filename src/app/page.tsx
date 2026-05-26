import Link from "next/link";
import { EmptyState } from "@/components/feedback-state";
import { HomestayCard } from "@/components/homestay-card";
import { Pill, SectionHeading } from "@/components/ui";
import { getHomestays } from "@/lib/api";

export default async function HomePage() {
  const homestays = await getHomestays();

  return (
    <main>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.05fr_0.95fr] md:py-20">
        <div className="space-y-7">
          <SectionHeading
            eyebrow="Khám phá Tây Ninh"
            title="Hành trình về miền đất thánh"
            description="Tìm homestay gần núi Bà Đen, đặt phòng, chọn dịch vụ tại chỗ và theo dõi đơn hàng trong một trải nghiệm Terra & Leaf."
          />
          <div className="flex flex-wrap gap-3">
            <Link href="/homestays" className="btn-primary">
              Tìm phòng ngay
            </Link>
            <Link href="/owner" className="btn-secondary">
              Portal chủ homestay
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill>Homestay đã kiểm duyệt</Pill>
            <Pill>Thanh toán ApiPay</Pill>
            <Pill>Hỗ trợ 24/7</Pill>
          </div>
        </div>
        <div className="card p-5">
          <form id="search" className="grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-[#466550]">
              Ngày nhận phòng
              <input className="field" type="date" defaultValue="2026-05-28" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#466550]">
              Ngày trả phòng
              <input className="field" type="date" defaultValue="2026-05-30" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#466550]">
              Số khách
              <input className="field" type="number" defaultValue={4} />
            </label>
            <button className="btn-primary" type="button">
              Lọc kết quả demo
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="font-bold uppercase tracking-[0.3em] text-[#9a4029]">Kết quả gợi ý</p>
            <h2 className="mt-2 text-4xl font-bold text-[#466550]">Lưu trú nổi bật</h2>
          </div>
          <span className="hidden rounded-full bg-white px-4 py-2 text-sm font-bold text-[#466550] sm:block">API cache Redis ready</span>
        </div>
        {homestays.length === 0 ? (
          <EmptyState title="Chưa có homestay nổi bật" description="Khi owner tạo homestay và bật trạng thái hoạt động, danh sách gợi ý sẽ hiển thị ở đây." actionHref="/homestays" actionLabel="Mở trang tìm kiếm" icon="⌂" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {homestays.map((homestay) => (
              <HomestayCard key={homestay.id} homestay={homestay} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

