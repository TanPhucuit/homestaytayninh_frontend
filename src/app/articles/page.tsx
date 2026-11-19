import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AppTopBar, PageBanner, SiteFooter } from "@/components/customer-ui";
import { EmptyState } from "@/components/feedback-state";
import { getPublishedArticles } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();
  const [lead, ...rest] = articles;

  return (
    <>
      <AppTopBar />
      <main id="main" className="min-h-screen text-ink">
        <PageBanner
          eyebrow="Cẩm nang Tây Ninh"
          title={<>Bài viết du lịch <span className="italic text-leaf">đã xuất bản</span></>}
          description="Gợi ý lịch trình, ẩm thực và những góc nhỏ đáng ghé khi nghỉ tại Tây Ninh."
        />
        <section className="container-page py-12 md:py-16">
          {lead ? (
            <>
              <Link className="reveal hover-zoom group grid overflow-hidden rounded-[32px] bg-bark text-white shadow-lift md:grid-cols-[1.25fr_1fr]" href={`/articles/${lead.slug}`}>
                <div className="image-shell aspect-[16/10] md:aspect-auto md:min-h-[420px]">
                  {lead.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- CMS image from arbitrary hosts
                    <img className="absolute inset-0 h-full w-full object-cover" src={lead.imageUrl} alt={lead.title} />
                  )}
                </div>
                <div className="flex flex-col justify-between gap-8 p-8 md:p-10">
                  <div>
                    <span className="badge bg-gold text-bark">Bài nổi bật</span>
                    <h2 className="display mt-5 text-3xl md:text-4xl">{lead.title}</h2>
                    <p className="mt-4 line-clamp-4 text-base leading-7 text-white/70">{lead.excerpt}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 font-semibold text-gold">
                    Đọc bài viết <ArrowUpRight className="size-5 transition group-hover:rotate-45" aria-hidden="true" />
                  </span>
                </div>
              </Link>

              {rest.length > 0 && (
                <div className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
                  {rest.map((article, index) => (
                    <Link
                      className="reveal hover-zoom group block"
                      href={`/articles/${article.slug}`}
                      key={article.id}
                      style={{ ["--reveal-delay" as string]: `${(index % 3) * 100}ms` }}
                    >
                      <div className="image-shell aspect-[4/3] rounded-[24px] shadow-card">
                        {article.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element -- CMS image from arbitrary hosts
                          <img className="absolute inset-0 h-full w-full object-cover" src={article.imageUrl} alt={article.title} />
                        )}
                      </div>
                      <span className="badge badge-green mt-5">Đã xuất bản</span>
                      <h2 className="mt-3 font-heading text-2xl leading-snug text-ink transition group-hover:text-brand">{article.title}</h2>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{article.excerpt}</p>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <EmptyState title="Chưa có bài viết" description="Đội ngũ nội dung sẽ xuất bản cẩm nang du lịch tại đây." />
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
