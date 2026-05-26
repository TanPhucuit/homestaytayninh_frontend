import Link from "next/link";
import { AppTopBar, HomestayCard } from "@/components/customer-ui";
import { getHomestays, money } from "@/lib/api";
import { getCurrentUser, homeForRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [homestays, user] = await Promise.all([getHomestays("CUSTOMER"), getCurrentUser()]);
  const featured = homestays.slice(0, 3);
  const hero = featured[0];

  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />

      <section className="relative flex min-h-[720px] items-center justify-center overflow-hidden md:min-h-[819px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${hero?.imageUrl ?? "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80"})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c1c19]/38 via-[#1c1c19]/28 to-[#1c1c19]/70" />
        <div className="relative mx-auto max-w-5xl px-4 text-center text-white md:px-8">
          <p className="text-sm font-black uppercase text-white/80">Terra & Leaf Homestay</p>
          <h1 className="mx-auto mt-5 max-w-4xl font-heading text-5xl font-bold leading-[1.05] drop-shadow-md md:text-[64px]">
            Nghỉ dưỡng giữa thiên nhiên Tây Ninh
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/90 drop-shadow-sm">
            Tìm homestay, chọn phòng, thêm dịch vụ và theo dõi booking trong một trải nghiệm ấm áp theo tinh thần Terra & Leaf.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link className="btn-primary" href="/homestays">Đặt phòng ngay</Link>
            {user.authenticated && !user.authorizationError ? (
              <Link className="rounded-xl bg-white/15 px-6 py-3 font-bold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25" href={homeForRole(user.role)}>
                Vào portal của bạn
              </Link>
            ) : user.authenticated ? (
              <Link className="rounded-xl bg-white/15 px-6 py-3 font-bold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25" href="/login?error=role_lookup">
                Kiểm tra quyền truy cập
              </Link>
            ) : (
              <Link className="rounded-xl bg-white/15 px-6 py-3 font-bold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25" href="/login">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-24 max-w-6xl px-4 md:px-8">
        <form action="/homestays" className="stitch-panel grid gap-3 p-5 md:grid-cols-[1fr_1fr_0.8fr_0.8fr_auto] md:p-6">
          <label className="grid gap-2 text-xs font-black uppercase text-[#89726c]">
            Nhận phòng
            <input className="field" name="checkIn" type="date" />
          </label>
          <label className="grid gap-2 text-xs font-black uppercase text-[#89726c]">
            Trả phòng
            <input className="field" name="checkOut" type="date" />
          </label>
          <label className="grid gap-2 text-xs font-black uppercase text-[#89726c]">
            Số khách
            <input className="field" name="guests" type="number" min="1" placeholder="2" />
          </label>
          <label className="grid gap-2 text-xs font-black uppercase text-[#89726c]">
            Loại hình
            <select className="field" name="type" defaultValue="">
              <option value="">Tất cả</option>
              <option value="Phòng">Phòng</option>
              <option value="Lều">Lều</option>
              <option value="Nhà nguyên căn">Nhà nguyên căn</option>
            </select>
          </label>
          <button className="btn-primary self-end" type="submit">Tìm kiếm</button>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mb-7 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Gợi ý lưu trú</p>
            <h2 className="mt-2 font-heading text-4xl text-[#7b2914]">Homestay nổi bật</h2>
            <p className="mt-3 max-w-2xl text-[#56423d]">Các lựa chọn đang mở bán, phù hợp cho gia đình, nhóm bạn và những chuyến nghỉ ngắn ngày tại Tây Ninh.</p>
          </div>
          <Link className="btn-secondary" href="/homestays">Xem tất cả</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((homestay) => <HomestayCard homestay={homestay} key={homestay.id} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card p-6"><p className="font-heading text-4xl text-[#466550]">{homestays.length}</p><p className="mt-2 text-sm font-semibold text-[#75675f]">Homestay đang mở bán</p></div>
          <div className="card p-6"><p className="font-heading text-4xl text-[#466550]">5</p><p className="mt-2 text-sm font-semibold text-[#75675f]">Vai trò nghiệp vụ</p></div>
          <div className="card p-6"><p className="font-heading text-4xl text-[#466550]">{money(hero?.priceFrom ?? 0)}</p><p className="mt-2 text-sm font-semibold text-[#75675f]">Giá khởi điểm</p></div>
        </div>
      </section>
    </main>
  );
}
