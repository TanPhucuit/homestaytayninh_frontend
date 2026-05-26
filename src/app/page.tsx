import Link from "next/link";
import { HomestayCard } from "@/components/customer-ui";
import { getHomestays, money } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const homestays = await getHomestays("CUSTOMER");
  const featured = homestays.slice(0, 3);

  return (
    <main className="min-h-screen bg-[#fdf9f4] text-[#2b211d]">
      <header className="sticky top-0 z-20 border-b border-[#eadfd3] bg-[#fdf9f4]/90 px-4 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="font-heading text-2xl text-[#9a4029]">Terra & Leaf</Link>
          <nav className="hidden items-center gap-3 text-sm font-bold text-[#466550] md:flex">
            <Link href="/homestays">Tìm homestay</Link>
            <Link href="/bookings">Booking của tôi</Link>
            <Link href="/owner">Owner</Link>
            <Link href="/staff">Staff</Link>
          </nav>
          <Link className="btn-primary" href="/login">Đăng nhập</Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:py-20">
        <div className="flex flex-col justify-center">
          <p className="eyebrow">Homestay Tây Ninh</p>
          <h1 className="mt-4 font-heading text-5xl leading-tight text-[#9a4029] md:text-7xl">
            Nghỉ dưỡng gần núi, đặt phòng gọn trong vài bước.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#75675f]">
            Tìm homestay, chọn phòng, thêm BBQ/trekking/bữa sáng, theo dõi thanh toán và trạng thái booking trên một hệ thống thống nhất.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="btn-primary" href="/homestays">Đặt phòng ngay</Link>
            <Link className="btn-secondary" href="/login">Đăng nhập với Google</Link>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="card p-4"><p className="text-2xl font-bold text-[#466550]">{homestays.length}</p><p className="text-xs text-[#75675f]">Homestay</p></div>
            <div className="card p-4"><p className="text-2xl font-bold text-[#466550]">5</p><p className="text-xs text-[#75675f]">Vai trò</p></div>
            <div className="card p-4"><p className="text-2xl font-bold text-[#466550]">ApiPay</p><p className="text-xs text-[#75675f]">Thanh toán</p></div>
          </div>
        </div>
        <div className="relative min-h-[520px] overflow-hidden rounded-[32px] border border-[#eadfd3] bg-cover bg-center shadow-2xl" style={{ backgroundImage: `url(${featured[0]?.imageUrl ?? "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80"})` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-[#2b211d]/70 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 rounded-3xl bg-white/90 p-5 backdrop-blur">
            <p className="text-sm font-bold text-[#466550]">{featured[0]?.name ?? "Terra Leaf Núi Bà"}</p>
            <p className="mt-1 text-2xl font-bold text-[#9a4029]">{money(featured[0]?.priceFrom ?? 1450000)} / đêm</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Gợi ý lưu trú</p>
            <h2 className="mt-2 text-4xl text-[#9a4029]">Homestay nổi bật</h2>
          </div>
          <Link className="btn-secondary" href="/homestays">Xem tất cả</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((homestay) => <HomestayCard homestay={homestay} key={homestay.id} />)}
        </div>
      </section>
    </main>
  );
}
