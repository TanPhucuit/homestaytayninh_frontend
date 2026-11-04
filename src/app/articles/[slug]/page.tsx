import Link from "next/link";
import { AppTopBar, SiteFooter } from "@/components/customer-ui";
import { getPublishedArticle } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);

  return (
    <main id="main" className="min-h-screen text-ink">
      <AppTopBar />
      <article className="mx-auto max-w-4xl px-4 py-10 md:px-8">
        <Link className="btn-secondary" href="/articles">Tất cả bài viết</Link>
        <p className="eyebrow mt-8">Cẩm nang Tây Ninh</p>
        <h1 className="mt-3 font-heading text-4xl text-brand md:text-5xl">{article.title}</h1>
        <p className="mt-4 text-lg leading-8 text-ink-muted">{article.excerpt}</p>
        {article.imageUrl && (
          <div className="image-shell mt-8 aspect-[16/9] rounded-2xl">
            <img className="h-full w-full object-cover" src={article.imageUrl} alt={article.title} />
          </div>
        )}
        <div className="card mt-8 whitespace-pre-wrap p-6 leading-8 text-ink">{article.content}</div>
      </article>
      <SiteFooter />
    </main>
  );
}
