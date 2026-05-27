import Link from "next/link";
import { AppTopBar } from "@/components/customer-ui";
import { EmptyState } from "@/components/feedback-state";
import { getPublishedArticles } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();

  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <p className="eyebrow">Cẩm nang Tây Ninh</p>
        <h1 className="mt-2 font-heading text-4xl text-[#9a4029] md:text-5xl">Bài viết du lịch đã xuất bản</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {articles.length ? articles.map((article) => (
            <Link className="card p-6" href={`/articles/${article.slug}`} key={article.id}>
              <span className="badge badge-green">Đã xuất bản</span>
              <h2 className="mt-4 font-heading text-3xl text-[#7b2914]">{article.title}</h2>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#56423d]">{article.excerpt}</p>
            </Link>
          )) : (
          <EmptyState title="Chưa có bài viết" description="Đội ngũ nội dung sẽ xuất bản cẩm nang du lịch tại đây." />
          )}
        </div>
      </section>
    </main>
  );
}
