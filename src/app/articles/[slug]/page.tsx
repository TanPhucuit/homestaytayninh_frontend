import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppTopBar, SiteFooter } from "@/components/customer-ui";
import { getPublishedArticle } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);

  return (
    <>
      <AppTopBar />
      <main id="main" className="min-h-screen text-ink">
        <article>
          <header className="container-page max-w-4xl pb-10 pt-10 text-center md:pt-14">
            <Link className="btn-ghost animate-fade-up" href="/articles"><ArrowLeft className="size-4" aria-hidden="true" /> Tất cả bài viết</Link>
            <p className="eyebrow animate-fade-up mt-8 justify-center [animation-delay:60ms]">Cẩm nang Tây Ninh</p>
            <h1 className="display animate-fade-up mt-5 text-4xl text-ink [animation-delay:120ms] md:text-6xl">{article.title}</h1>
            <p className="animate-fade-up mx-auto mt-6 max-w-2xl font-heading text-xl italic leading-8 text-muted [animation-delay:180ms]">{article.excerpt}</p>
          </header>
          {article.imageUrl && (
            <div className="container-page max-w-6xl">
              <div className="image-shell animate-fade-up aspect-[16/8] rounded-[32px] shadow-lift [animation-delay:240ms]">
                {/* eslint-disable-next-line @next/next/no-img-element -- CMS image from arbitrary hosts */}
                <img className="absolute inset-0 h-full w-full object-cover" src={article.imageUrl} alt={article.title} />
              </div>
            </div>
          )}
          <div className="container-page max-w-3xl py-14">
            <div className="whitespace-pre-wrap text-lg leading-9 text-ink-soft first-letter:float-left first-letter:mr-3 first-letter:font-heading first-letter:text-7xl first-letter:leading-[0.85] first-letter:text-brand">
              {article.content}
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
