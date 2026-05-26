import { CustomerFilters } from "@/components/customer-filters";
import { EmptyState } from "@/components/feedback-state";
import { HomestayCard } from "@/components/homestay-card";
import { Pill, SectionHeading } from "@/components/ui";
import { getHomestays } from "@/lib/api";

export default async function HomestaysPage() {
  const homestays = await getHomestays();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading
        eyebrow="Kết quả tìm kiếm"
        title="Homestay phù hợp tại Tây Ninh"
        description="Bộ lọc demo theo ngày nhận/trả phòng, số khách, loại hình, tiện ích và mức giá."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <CustomerFilters />

        <section>
          <div className="mb-5 flex items-center justify-between">
            <p className="font-bold text-[#466550]">{homestays.length} kết quả khả dụng</p>
            <Pill tone="clay">Redis cached search</Pill>
          </div>
          {homestays.length === 0 ? (
            <EmptyState title="Không tìm thấy homestay phù hợp" description="Hãy đổi ngày nhận/trả phòng, số khách, mức giá hoặc bỏ bớt tiện ích để mở rộng kết quả." actionHref="/" actionLabel="Quay về trang chủ" icon="⌕" />
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {homestays.map((homestay) => (
                <HomestayCard key={homestay.id} homestay={homestay} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

