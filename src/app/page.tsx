import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, CalendarCheck, Home, Leaf, MapPin, QrCode, ShieldCheck, Sparkles, Star, Tent, TreePine } from "lucide-react";
import { AppTopBar, HomestayCard, SiteFooter } from "@/components/customer-ui";
import { SearchBar } from "@/components/search-bar";
import { getHomestays, money } from "@/lib/api";
import { getCurrentUser, homeForRole } from "@/lib/rbac";
import type { Homestay } from "@/lib/types";

export const dynamic = "force-dynamic";

const heroImage = "/images/demo/tay-ninh-5.jpg";

const stayTypes = [
  { label: "Phòng", description: "Phòng đôi, phòng gia đình nép mình giữa vườn cây.", icon: Home },
  { label: "Lều Glamping", description: "Cắm trại tiện nghi, đón bình minh trên đồi.", icon: Tent },
  { label: "Nhà nguyên căn", description: "Không gian riêng cho nhóm bạn và đại gia đình.", icon: TreePine }
] as const;

const steps = [
  { title: "Tìm & chọn phòng", description: "Lọc theo ngày, số khách, loại hình, giá và tiện ích. Chỉ hiện phòng còn trống.", icon: CalendarCheck },
  { title: "Thêm dịch vụ", description: "BBQ sân vườn, trekking, bữa sáng… chọn cho từng phòng, tổng tiền cập nhật ngay.", icon: Sparkles },
  { title: "Thanh toán VietQR", description: "Quét mã bằng app ngân hàng qua ApiPay, đơn tự xác nhận khi tiền về.", icon: QrCode }
] as const;

const marqueeItems = ["Núi Bà Đen", "Hồ Dầu Tiếng", "Tòa Thánh Cao Đài", "Glamping ngắm bình minh", "BBQ sân vườn", "Trekking", "Vườn trái cây", "Thanh toán VietQR"];

function destinationsOf(homestays: Homestay[]) {
  const byArea = new Map<string, { area: string; homestay: Homestay; count: number }>();
  for (const homestay of homestays) {
    const area = homestay.location.split(",")[0].trim();
    const entry = byArea.get(area);
    if (entry) entry.count += 1;
    else byArea.set(area, { area, homestay, count: 1 });
  }
  return [...byArea.values()].sort((a, b) => b.count - a.count || b.homestay.rating - a.homestay.rating).slice(0, 5);
}

export default async function HomePage() {
  const [homestays, user] = await Promise.all([getHomestays("CUSTOMER"), getCurrentUser()]);
  const featured = homestays.slice(0, 6);
  const destinations = destinationsOf(homestays);
  const minPrice = homestays.length ? Math.min(...homestays.map((item) => item.priceFrom)) : 0;
  const avgRating = homestays.length ? homestays.reduce((sum, item) => sum + item.rating, 0) / homestays.length : 0;
  const reviews = homestays.flatMap((homestay) => homestay.reviews.map((review) => ({ ...review, homestay }))).slice(0, 3);
  const signedIn = user.authenticated && !user.authorizationError;
  const collage = [homestays[1]?.imageUrl, homestays[3]?.imageUrl].filter(Boolean) as string[];

  return (
    <>
      <AppTopBar />
      <main id="main" className="text-ink">
        {/* ---------- Hero: editorial split with arch windows ---------- */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -left-40 top-20 size-[34rem] rounded-full bg-gold-soft blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-40 -top-20 size-[30rem] rounded-full bg-brand-wash blur-3xl" aria-hidden="true" />
          <div className="container-page relative grid items-center gap-12 pb-28 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-36 lg:pt-16">
            <div className="min-w-0">
              <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-line bg-cream px-4 py-2 text-xs font-semibold tracking-wide text-ink-muted">
                <BadgeCheck className="size-4 text-leaf" aria-hidden="true" /> {homestays.length} nơi nghỉ đã kiểm duyệt tại Tây Ninh
              </p>
              <h1 className="display animate-fade-up mt-7 text-[2.6rem] leading-[0.98] [animation-delay:80ms] sm:text-7xl xl:text-[6.2rem]">
                Ở lại giữa <span className="italic text-brand">thiên nhiên</span>, <span className="sm:whitespace-nowrap">chậm hơn một nhịp</span>
              </h1>
              <p className="animate-fade-up mt-7 max-w-xl text-lg leading-8 text-muted [animation-delay:160ms]">
                Homestay, lều glamping và nhà nguyên căn dưới chân núi Bà Đen và ven hồ Dầu Tiếng. Chọn phòng, thêm dịch vụ và thanh toán VietQR trong vài phút.
              </p>
              <div className="animate-fade-up mt-9 flex flex-col gap-3 [animation-delay:240ms] sm:flex-row">
                <Link className="btn-primary px-8" href="/homestays">
                  Đặt phòng ngay <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                {signedIn ? (
                  <Link className="btn-secondary px-8" href={homeForRole(user.role)}>Vào khu vực của bạn</Link>
                ) : user.authenticated ? (
                  <Link className="btn-secondary px-8" href="/login?error=role_lookup">Kiểm tra quyền truy cập</Link>
                ) : (
                  <Link className="btn-secondary px-8" href="/login">Đăng nhập</Link>
                )}
              </div>
              <dl className="animate-fade-up mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-line pt-7 [animation-delay:320ms]">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-subtle">Đánh giá</dt>
                  <dd className="mt-1 flex items-center gap-1.5 font-heading text-3xl"><Star className="size-5 fill-gold text-gold" aria-hidden="true" />{avgRating.toFixed(1)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-subtle">Giá chỉ từ</dt>
                  <dd className="mt-1 font-heading text-3xl">{money(minPrice)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-subtle">Thanh toán</dt>
                  <dd className="mt-1 flex items-center gap-1.5 font-heading text-3xl"><QrCode className="size-5 text-leaf" aria-hidden="true" />VietQR</dd>
                </div>
              </dl>
            </div>

            <div className="animate-fade-up relative mx-auto w-full max-w-[34rem] [animation-delay:200ms]">
              <div className="arch-lg image-shell relative aspect-[4/5] shadow-lift">
                {/* eslint-disable-next-line @next/next/no-img-element -- static hero, sized by CSS */}
                <img alt="Tượng Phật Bà trên đỉnh núi Bà Đen giữa mây" className="ken-burns absolute inset-0 size-full object-cover" fetchPriority="high" src={heroImage} />
                <div className="absolute inset-0 bg-gradient-to-t from-bark/45 via-transparent to-transparent" aria-hidden="true" />
                <p className="absolute inset-x-0 bottom-7 text-center text-xs font-semibold uppercase tracking-[0.3em] text-white/90">Núi Bà Đen · Tây Ninh</p>
              </div>
              {collage[0] && (
                <div className="image-shell absolute -bottom-8 -left-6 hidden size-40 rounded-full border-[8px] border-sand shadow-lift sm:block md:-left-12 md:size-48">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote catalog image */}
                  <img alt="Homestay giữa vườn cây" className="size-full object-cover" loading="lazy" src={collage[0]} />
                </div>
              )}
              <div className="absolute -right-3 top-10 grid size-32 place-items-center rounded-full bg-brand text-white shadow-cta md:-right-8 md:size-36" aria-hidden="true">
                <svg className="spin-slow absolute inset-0 size-full" viewBox="0 0 120 120">
                  <defs><path id="ring" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
                  <text className="fill-white/90 text-[10.5px] font-semibold uppercase" letterSpacing="3.2"><textPath href="#ring">Glamping · Homestay · Villa ·</textPath></text>
                </svg>
                <Leaf className="size-8" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Search floats over the hero edge ---------- */}
        <div className="container-page relative z-10 -mt-20 lg:-mt-28">
          <div className="animate-fade-up rounded-[32px] bg-cream p-2 shadow-lift ring-1 ring-line-soft [animation-delay:360ms]">
            <SearchBar variant="home" />
          </div>
        </div>

        {/* ---------- Marquee ---------- */}
        <div className="mt-20 overflow-hidden bg-brand py-5 text-white" aria-hidden="true">
          <div className="marquee gap-10 pr-10">
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span className="flex items-center gap-10 whitespace-nowrap font-heading text-xl italic md:text-2xl" key={`${item}-${index}`}>
                {item}
                <Leaf className="size-4 text-gold not-italic" />
              </span>
            ))}
          </div>
        </div>

        {/* ---------- Editorial intro ---------- */}
        <section className="section container-page grid items-center gap-14 lg:grid-cols-2">
          <div className="reveal">
            <p className="eyebrow">Về Homestay Tây Ninh</p>
            <h2 className="display mt-5 text-4xl md:text-6xl">
              Nghỉ chậm lại, <span className="italic text-brand">sống trọn</span> từng khoảnh khắc
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-8 text-muted">
              Mỗi homestay đều được kiểm duyệt, mô tả rõ tiện nghi, giá theo mùa và dịch vụ đi kèm. Bạn chọn nơi ở, phần còn lại hệ thống lo: giữ phòng, thanh toán và nhắc lịch nhận phòng.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: ShieldCheck, title: "Thanh toán an toàn", text: "VietQR qua ApiPay, tự đối soát." },
                { icon: BadgeCheck, title: "Chỗ nghỉ đã duyệt", text: "Thông tin, giá và hình ảnh rõ ràng." }
              ].map(({ icon: Icon, title, text }) => (
                <li className="flex gap-3" key={title}>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-leaf-soft text-leaf-strong" aria-hidden="true"><Icon className="size-5" /></span>
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="block text-sm text-muted">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal relative h-[460px] md:h-[560px]" style={{ ["--reveal-delay" as string]: "150ms" }}>
            {collage[0] && (
              <div className="hover-zoom image-shell arch absolute left-0 top-0 h-[78%] w-[62%] shadow-lift">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote catalog image */}
                <img alt="Không gian homestay giữa thiên nhiên" className="size-full object-cover" loading="lazy" src={collage[0]} />
              </div>
            )}
            {collage[1] && (
              <div className="hover-zoom image-shell absolute bottom-0 right-0 h-[58%] w-[52%] rounded-[32px] rounded-tl-[96px] border-[6px] border-sand shadow-lift">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote catalog image */}
                <img alt="Phòng nghỉ ấm cúng" className="size-full object-cover" loading="lazy" src={collage[1]} />
              </div>
            )}
            <div className="absolute bottom-10 left-6 rounded-3xl bg-bark px-6 py-5 text-white shadow-lift [animation:float-soft_6s_ease-in-out_infinite]">
              <p className="font-heading text-4xl text-gold">{homestays.length}+</p>
              <p className="text-sm text-white/75">nơi nghỉ đang mở bán</p>
            </div>
          </div>
        </section>

        {/* ---------- Featured ---------- */}
        <section id="noi-bat" className="section bg-cream">
          <div className="container-page">
            <div className="reveal mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="eyebrow">Gợi ý lưu trú</p>
                <h2 className="display mt-4 text-4xl md:text-6xl">Homestay nổi bật</h2>
                <p className="mt-4 max-w-xl text-muted">Các lựa chọn đang mở bán, phù hợp cho gia đình, nhóm bạn và những chuyến nghỉ ngắn ngày.</p>
              </div>
              <Link className="btn-secondary self-start md:self-auto" href="/homestays">
                Xem tất cả <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {featured.map((homestay, index) => (
                <div className="reveal" key={homestay.id} style={{ ["--reveal-delay" as string]: `${(index % 3) * 110}ms` }}>
                  <HomestayCard homestay={homestay} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Destinations bento ---------- */}
        {destinations.length >= 3 && (
          <section className="section container-page">
            <div className="reveal mb-12 text-center">
              <p className="eyebrow justify-center">Điểm đến</p>
              <h2 className="display mt-4 text-4xl md:text-6xl">Khắp các vùng <span className="italic text-leaf">Tây Ninh</span></h2>
            </div>
            <div className="grid auto-rows-[220px] gap-4 md:grid-cols-4 md:auto-rows-[240px]">
              {destinations.map(({ area, homestay, count }, index) => (
                <Link
                  className={`reveal hover-zoom image-shell group relative rounded-[28px] ${index === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
                  href={`/homestays/${homestay.id}`}
                  key={area}
                  style={{ ["--reveal-delay" as string]: `${index * 90}ms` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote catalog image */}
                  <img alt={`Homestay tại ${area}`} className="absolute inset-0 size-full object-cover" loading="lazy" src={homestay.imageUrl} />
                  <span className="absolute inset-0 bg-gradient-to-t from-bark/85 via-bark/10 to-transparent" aria-hidden="true" />
                  <span className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-3 text-white">
                    <span>
                      <span className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-white/70"><MapPin className="size-3.5" aria-hidden="true" />{count} nơi nghỉ</span>
                      <span className={`mt-1 block font-heading ${index === 0 ? "text-4xl md:text-5xl" : "text-2xl"}`}>{area}</span>
                    </span>
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur transition duration-500 group-hover:rotate-45 group-hover:bg-gold group-hover:text-bark" aria-hidden="true">
                      <ArrowUpRight className="size-5" />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ---------- How it works (dark) ---------- */}
        <section className="grain relative overflow-hidden bg-bark text-white">
          <div className="pointer-events-none absolute -left-40 top-10 size-[30rem] rounded-full bg-brand/25 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-32 bottom-0 size-[26rem] rounded-full bg-gold/15 blur-3xl" aria-hidden="true" />
          <div className="section container-page relative grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="reveal">
              <p className="eyebrow eyebrow-light">Đặt phòng đơn giản</p>
              <h2 className="display mt-5 text-4xl md:text-6xl">Ba bước là <span className="italic text-gold">xong</span></h2>
              <p className="mt-6 max-w-md text-lg leading-8 text-white/70">Không cần gọi điện, không cần chờ chuyển khoản thủ công. Đơn được giữ chỗ ngay và tự xác nhận khi thanh toán thành công.</p>
              <Link className="btn-primary mt-9 px-7" href="/homestays">
                Bắt đầu tìm phòng <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <ol className="grid gap-4">
              {steps.map(({ title, description, icon: Icon }, index) => (
                <li
                  className="reveal group flex gap-5 rounded-[26px] border border-white/10 bg-white/[0.04] p-6 transition duration-500 hover:border-gold/40 hover:bg-white/[0.08]"
                  key={title}
                  style={{ ["--reveal-delay" as string]: `${index * 120}ms` }}
                >
                  <span className="font-heading text-5xl italic leading-none text-gold/70 transition group-hover:text-gold">0{index + 1}</span>
                  <span>
                    <span className="flex items-center gap-2 text-lg font-semibold"><Icon className="size-5 text-gold" aria-hidden="true" />{title}</span>
                    <span className="mt-1.5 block text-sm leading-6 text-white/65">{description}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Stay types ---------- */}
        <section className="section container-page">
          <div className="reveal mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Loại hình lưu trú</p>
              <h2 className="display mt-4 text-4xl md:text-6xl">Chọn kiểu nghỉ <span className="italic text-brand">hợp với bạn</span></h2>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {stayTypes.map(({ label, description, icon: Icon }, index) => (
              <Link
                className="reveal group relative overflow-hidden rounded-[28px] border border-line-soft bg-white p-8 transition duration-500 hover:-translate-y-1.5 hover:border-transparent hover:bg-bark hover:text-white hover:shadow-lift"
                href={`/homestays?type=${encodeURIComponent(label)}`}
                key={label}
                style={{ ["--reveal-delay" as string]: `${index * 110}ms` }}
              >
                <span className="arch grid h-24 w-16 place-items-center bg-leaf-soft text-leaf-strong transition duration-500 group-hover:bg-gold group-hover:text-bark" aria-hidden="true">
                  <Icon className="size-7" strokeWidth={1.6} />
                </span>
                <span className="mt-8 block font-heading text-3xl">{label}</span>
                <span className="mt-2 block text-sm leading-6 text-muted transition group-hover:text-white/70">{description}</span>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand transition group-hover:text-gold">
                  Xem lựa chọn <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------- Reviews ---------- */}
        {reviews.length > 0 && (
          <section className="section bg-cream">
            <div className="container-page">
              <div className="reveal mb-12 text-center">
                <p className="eyebrow justify-center">Khách nói gì</p>
                <h2 className="display mt-4 text-4xl md:text-6xl">Những kỳ nghỉ <span className="italic text-leaf">đáng nhớ</span></h2>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {reviews.map((review, index) => (
                  <figure className="reveal card flex flex-col p-7" key={review.id} style={{ ["--reveal-delay" as string]: `${index * 110}ms` }}>
                    <div className="flex gap-0.5" aria-label={`${review.rating} trên 5 sao`}>
                      {Array.from({ length: 5 }, (_, star) => (
                        <Star className={`size-4 ${star < Math.round(review.rating) ? "fill-gold text-gold" : "text-line"}`} aria-hidden="true" key={star} />
                      ))}
                    </div>
                    <blockquote className="mt-5 flex-1 font-heading text-xl italic leading-8 text-ink">“{review.comment}”</blockquote>
                    <figcaption className="mt-6 border-t border-line-soft pt-4 text-sm text-muted">
                      Lưu trú tại <Link className="font-semibold text-ink underline-offset-4 hover:underline" href={`/homestays/${review.homestay.id}`}>{review.homestay.name}</Link>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------- CTA band ---------- */}
        <section className="container-page pt-24">
          <div className="reveal relative isolate overflow-hidden rounded-[36px] bg-bark px-8 py-16 text-center text-white md:px-16 md:py-24">
            {/* eslint-disable-next-line @next/next/no-img-element -- static decorative image */}
            <img alt="" aria-hidden="true" className="absolute inset-0 -z-10 size-full object-cover opacity-35" loading="lazy" src={heroImage} />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-bark via-bark/70 to-bark/30" aria-hidden="true" />
            <p className="eyebrow eyebrow-light justify-center">Sẵn sàng lên đường?</p>
            <h2 className="display mx-auto mt-5 max-w-3xl text-4xl md:text-6xl">Kỳ nghỉ tiếp theo của bạn bắt đầu <span className="italic text-gold">từ đây</span></h2>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link className="btn-primary px-8" href="/homestays">Tìm homestay <ArrowRight className="size-4" aria-hidden="true" /></Link>
              <Link className="btn-light px-8" href="/articles">Đọc cẩm nang</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
