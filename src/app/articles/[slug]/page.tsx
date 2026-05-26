import Link from "next/link";
import { AppTopBar } from "@/components/customer-ui";
import { getPublishedArticle } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);

  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />
      <article className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <Link className="btn-secondary" href="/articles">Tất cả bài viết</Link>
        <p className="eyebrow mt-8">Cẩm nang Tây Ninh</p>
        <h1 className="mt-3 font-heading text-4xl text-[#9a4029] md:text-5xl">{article.title}</h1>
        <p className="mt-4 text-lg leading-8 text-[#56423d]">{article.excerpt}</p>
        <div className="card mt-8 whitespace-pre-wrap p-6 leading-8 text-[#2f2926]">{article.content}</div>
      </article>
    </main>
  );
}
