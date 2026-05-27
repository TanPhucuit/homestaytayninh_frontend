import Link from "next/link";
import { AppTopBar, HomestayCard } from "@/components/customer-ui";
import { SearchBar } from "@/components/search-bar";
import { getHomestays, money } from "@/lib/api";
import { getCurrentUser, homeForRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const heroImage = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2200&q=85";

export default async function HomePage() {
  const [homestays, user] = await Promise.all([getHomestays("CUSTOMER"), getCurrentUser()]);
  const featured = homestays.slice(0, 3);
  const hero = featured[0];

  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />

      <section className="relative flex min-h-[720px] items-center overflow-hidden md:min-h-[800px]">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c1c19]/28 via-[#1c1c19]/34 to-[#1c1c19]/76" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 pb-28 pt-16 text-white md:px-8 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-white/82">Terra & Leaf Homestay Tây Ninh</p>
            <h1 className="mt-5 max-w-4xl font-heading text-5xl font-bold leading-[1.03] drop-shadow-md md:text-[70px]">
              Hành trình nghỉ dưỡng giữa thiên nhiên Tây Ninh
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90 drop-shadow-sm">
              Tìm homestay, chọn phòng, thêm dịch vụ và theo dõi booking trong một trải nghiệm ấm áp, rõ ràng và đúng vai trò.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link className="btn-primary" href="/homestays">Đặt phòng ngay</Link>
              {user.authenticated && !user.authorizationError ? (
                <Link className="rounded-xl bg-white/15 px-6 py-3 font-bold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25" href={homeForRole(user.role)}>
                  Vào khu vực của bạn
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
          <div className="hidden rounded-2xl border border-white/28 bg-[#fdf9f4]/14 p-5 text-sm font-semibold text-white shadow-[0_30px_90px_rgba(0,0,0,0.22)] backdrop-blur-md lg:block">
            <div className="grid gap-3">
              <div className="rounded-xl bg-white/12 p-4">Homestay đã kiểm duyệt</div>
              <div className="rounded-xl bg-white/12 p-4">Thanh toán ApiPay minh bạch</div>
              <div className="rounded-xl bg-white/12 p-4">Theo dõi booking theo thời gian thực</div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-28 max-w-6xl px-4 md:px-8">
        <SearchBar variant="home" />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-18 md:px-8 md:py-20">
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
