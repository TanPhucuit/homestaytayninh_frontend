import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarCheck, Home, QrCode, Sparkles, Star, Tent, TreePine } from "lucide-react";
import { AppTopBar, HomestayCard, SiteFooter } from "@/components/customer-ui";
import { SearchBar } from "@/components/search-bar";
import { getHomestays, money } from "@/lib/api";
import { getCurrentUser, homeForRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const heroImage = "/images/demo/tay-ninh-5.jpg";

const stayTypes = [
  { label: "Phòng", description: "Phòng đôi, phòng gia đình giữa vườn", icon: Home },
  { label: "Lều Glamping", description: "Cắm trại tiện nghi, ngắm bình minh", icon: Tent },
  { label: "Nhà nguyên căn", description: "Riêng tư cho nhóm bạn, gia đình đông", icon: TreePine }
] as const;

const steps = [
  { title: "Tìm & chọn phòng", description: "Lọc theo ngày, số khách, loại hình, giá và tiện ích. Chỉ hiện phòng còn trống.", icon: CalendarCheck },
  { title: "Thêm dịch vụ", description: "BBQ sân vườn, trekking, bữa sáng… chọn theo từng phòng, tổng tiền cập nhật ngay.", icon: Sparkles },
  { title: "Thanh toán VietQR", description: "Quét mã bằng app ngân hàng qua ApiPay, đơn tự xác nhận khi tiền về.", icon: QrCode }
] as const;

export default async function HomePage() {
  const [homestays, user] = await Promise.all([getHomestays("CUSTOMER"), getCurrentUser()]);
  const featured = homestays.slice(0, 6);
  const minPrice = homestays.length ? Math.min(...homestays.map((item) => item.priceFrom)) : 0;
  const avgRating = homestays.length ? homestays.reduce((sum, item) => sum + item.rating, 0) / homestays.length : 0;
  const signedIn = user.authenticated && !user.authorizationError;

  return (
    <>
      <AppTopBar />
      <main id="main" className="text-ink">
        <section className="relative isolate overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- static hero, sized by CSS */}
          <img alt="" aria-hidden="true" className="absolute inset-0 -z-10 size-full object-cover" fetchPriority="high" src={heroImage} />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/35 via-ink/45 to-ink/80" aria-hidden="true" />
          <div className="mx-auto max-w-7xl px-4 pb-36 pt-16 text-white md:px-8 md:pb-44 md:pt-28">
            <p className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ring-1 ring-white/25 backdrop-blur">
              <BadgeCheck className="size-4" aria-hidden="true" /> Homestay đã kiểm duyệt tại Tây Ninh
            </p>
            <h1 className="animate-fade-up mt-5 max-w-3xl font-heading text-[2.6rem] font-semibold leading-[1.08] [animation-delay:60ms] md:text-7xl">
              Hành trình nghỉ dưỡng giữa thiên nhiên Tây Ninh
            </h1>
            <p className="animate-fade-up mt-5 max-w-xl text-lg leading-8 text-white/90 [animation-delay:120ms]">
              Chọn phòng, thêm dịch vụ và thanh toán VietQR trong vài phút. Đơn đặt được cập nhật trạng thái theo thời gian thực.
            </p>
            <div className="animate-fade-up mt-8 flex flex-col gap-3 [animation-delay:180ms] sm:flex-row">
              <Link className="btn-primary px-6" href="/homestays">
                Đặt phòng ngay <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              {signedIn ? (
                <Link className="btn-primary bg-white/15 px-6 shadow-none ring-1 ring-white/35 backdrop-blur hover:bg-white/25" href={homeForRole(user.role)}>
                  Vào khu vực của bạn
                </Link>
              ) : user.authenticated ? (
                <Link className="btn-primary bg-white/15 px-6 shadow-none ring-1 ring-white/35 backdrop-blur hover:bg-white/25" href="/login?error=role_lookup">
                  Kiểm tra quyền truy cập
                </Link>
              ) : (
                <Link className="btn-primary bg-white/15 px-6 shadow-none ring-1 ring-white/35 backdrop-blur hover:bg-white/25" href="/login">
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </section>

        <section aria-label="Tìm homestay" className="relative z-20 mx-auto -mt-24 max-w-6xl px-4 md:-mt-28 md:px-8">
          <SearchBar variant="home" />
        </section>

        <section aria-label="Số liệu nổi bật" className="mx-auto max-w-7xl px-4 pt-12 md:px-8">
          <dl className="grid grid-cols-3 divide-x divide-line-soft rounded-2xl border border-line-soft bg-white py-5 text-center shadow-card">
            <div className="px-2">
              <dt className="text-xs text-muted sm:text-sm">Homestay đang mở bán</dt>
              <dd className="mt-1 font-heading text-2xl font-semibold text-leaf-strong sm:text-3xl">{homestays.length}</dd>
            </div>
            <div className="px-2">
              <dt className="text-xs text-muted sm:text-sm">Điểm đánh giá trung bình</dt>
              <dd className="mt-1 inline-flex items-center gap-1 font-heading text-2xl font-semibold text-leaf-strong sm:text-3xl">
                <Star className="size-5 fill-amber-400 text-amber-500" aria-hidden="true" />{avgRating.toFixed(1)}
              </dd>
            </div>
            <div className="px-2">
              <dt className="text-xs text-muted sm:text-sm">Giá chỉ từ</dt>
              <dd className="mt-1 font-heading text-2xl font-semibold text-leaf-strong sm:text-3xl">{money(minPrice)}</dd>
            </div>
          </dl>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Gợi ý lưu trú</p>
              <h2 className="mt-2 font-heading text-3xl font-semibold text-ink md:text-4xl">Homestay nổi bật</h2>
              <p className="mt-2 max-w-2xl text-muted">Các lựa chọn đang mở bán, phù hợp cho gia đình, nhóm bạn và những chuyến nghỉ ngắn ngày.</p>
            </div>
            <Link className="btn-secondary self-start md:self-auto" href="/homestays">
              Xem tất cả <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((homestay) => <HomestayCard homestay={homestay} key={homestay.id} />)}
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <p className="eyebrow">Loại hình lưu trú</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold md:text-4xl">Chọn kiểu nghỉ hợp với bạn</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {stayTypes.map(({ label, description, icon: Icon }) => (
                <Link
                  className="group flex items-center gap-4 rounded-2xl border border-line-soft bg-sand p-5 transition hover:-translate-y-0.5 hover:border-leaf hover:bg-leaf-soft"
                  href={`/homestays?type=${encodeURIComponent(label)}`}
                  key={label}
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white text-leaf shadow-card transition group-hover:bg-leaf group-hover:text-white" aria-hidden="true">
                    <Icon className="size-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-ink">{label}</span>
                    <span className="block text-sm text-muted">{description}</span>
                  </span>
                  <ArrowRight className="ml-auto size-5 shrink-0 text-subtle transition group-hover:translate-x-1 group-hover:text-leaf" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <div className="text-center">
            <p className="eyebrow">Đặt phòng đơn giản</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold md:text-4xl">Ba bước là xong</h2>
          </div>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map(({ title, description, icon: Icon }, index) => (
              <li className="card relative p-6" key={title}>
                <span className="absolute right-5 top-4 font-heading text-5xl font-semibold text-sand-deep" aria-hidden="true">{index + 1}</span>
                <span className="grid size-12 place-items-center rounded-xl bg-brand-wash text-brand" aria-hidden="true"><Icon className="size-6" /></span>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Link className="btn-primary px-6" href="/homestays">
              Bắt đầu tìm phòng <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
