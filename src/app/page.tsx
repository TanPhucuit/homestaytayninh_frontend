import Link from "next/link";
import { AppTopBar, HomestayCard } from "@/components/customer-ui";
import { getHomestays, money } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const homestays = await getHomestays("CUSTOMER");
  const featured = homestays.slice(0, 3);
  const hero = featured[0];

  return (
    <main className="min-h-screen bg-[#fdf9f4] text-[#1c1c19]">
      <AppTopBar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,218,210,0.9),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(200,235,208,0.8),transparent_24%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.02fr_0.98fr] md:px-8 md:py-20">
          <div className="flex flex-col justify-center">
            <p className="eyebrow">Homestay Tây Ninh</p>
            <h1 className="mt-4 font-heading text-5xl font-bold leading-[1.04] tracking-tight text-[#7b2914] md:text-7xl">
              Nghỉ dưỡng gần núi, đặt phòng gọn trong vài bước.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#56423d]">
              Tìm homestay, chọn phòng, thêm BBQ hoặc trekking, theo dõi thanh toán và trạng thái booking trong một trải nghiệm Terra & Leaf thống nhất.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="btn-primary" href="/homestays">Đặt phòng ngay</Link>
              <Link className="btn-secondary" href="/login">Đăng nhập với Google</Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-3">
              <div className="card p-4"><p className="text-3xl font-bold text-[#466550]">{homestays.length}</p><p className="text-xs font-semibold text-[#89726c]">Homestay</p></div>
              <div className="card p-4"><p className="text-3xl font-bold text-[#466550]">5</p><p className="text-xs font-semibold text-[#89726c]">Vai trò</p></div>
              <div className="card p-4"><p className="text-3xl font-bold text-[#466550]">API</p><p className="text-xs font-semibold text-[#89726c]">Kết nối thật</p></div>
            </div>
          </div>

          <div
            className="relative min-h-[560px] overflow-hidden rounded-[34px] border border-[#dcc0ba] bg-cover bg-center shadow-[0_32px_90px_rgba(43,33,29,0.16)]"
            style={{ backgroundImage: `url(${hero?.imageUrl ?? "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80"})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c19]/72 via-[#1c1c19]/12 to-transparent" />
            <div className="absolute left-6 top-6 rounded-full bg-[#fdf9f4]/90 px-4 py-2 text-sm font-bold text-[#466550] backdrop-blur">Gần Núi Bà Đen</div>
            <div className="absolute bottom-6 left-6 right-6 rounded-[26px] border border-white/50 bg-[#fdf9f4]/92 p-6 backdrop-blur">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#466550]">Lưu trú nổi bật</p>
              <h2 className="mt-2 font-heading text-3xl text-[#7b2914]">{hero?.name ?? "Terra Leaf Núi Bà"}</h2>
              <p className="mt-2 text-sm leading-6 text-[#56423d]">{hero?.description}</p>
              <p className="mt-4 text-2xl font-bold text-[#466550]">{money(hero?.priceFrom ?? 1450000)} / đêm</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <div className="mb-7 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Gợi ý lưu trú</p>
            <h2 className="mt-2 font-heading text-4xl text-[#7b2914]">Homestay nổi bật</h2>
          </div>
          <Link className="btn-secondary" href="/homestays">Xem tất cả</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((homestay) => <HomestayCard homestay={homestay} key={homestay.id} />)}
        </div>
      </section>
    </main>
  );
}
