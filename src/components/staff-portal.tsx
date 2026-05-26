import Link from "next/link";
import { Article, UserProfile, UserRole, ViolationReport } from "@/lib/types";
import { EmptyState } from "./feedback-state";
import {
  createArticleAction,
  deleteArticleAction,
  publishArticleAction,
  resolveReportAction,
  banModeratedUserAction,
  unbanModeratedUserAction,
  unpublishArticleAction,
  updateArticleAction
} from "@/app/staff/actions";

function StaffShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-8 text-[#2f2926] md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="stitch-panel bg-[#466550] p-6 text-white md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-white/70">Staff Portal</p>
              <h1 className="mt-2 font-heading text-4xl">{title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">{description}</p>
            </div>
            <nav className="flex flex-wrap gap-2">
              <a className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white" href="/staff">CMS bài viết</a>
              <a className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white" href="/staff/moderation">Kiểm soát user</a>
              <Link className="rounded-xl bg-[#fdf9f4] px-4 py-3 text-sm font-semibold text-[#9a4029]" href="/">Trang chủ</Link>
            </nav>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}

function ArticleStatus({ status }: { status: Article["status"] }) {
  return (
    <span className={status === "PUBLISHED" ? "badge badge-green" : "badge badge-sand"}>
      {status === "PUBLISHED" ? "Đã xuất bản" : "Bản nháp"}
    </span>
  );
}

export function StaffCmsPortal({ articles }: { articles: Article[] }) {
  return (
    <StaffShell
      title="Quản lý nội dung du lịch Tây Ninh"
      description="Tạo, sửa, xóa, publish/unpublish bài viết quảng bá du lịch và cẩm nang homestay theo nghiệp vụ Staff."
    >
      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <form action={createArticleAction} className="card p-6">
          <p className="eyebrow">Tạo bài viết</p>
          <h2 className="mt-2 font-heading text-3xl text-[#9a4029]">Bài viết mới</h2>
          <div className="mt-5 grid gap-3">
            <input className="field" name="title" placeholder="Tiêu đề" required />
            <input className="field" name="slug" placeholder="du-lich-nui-ba-den" required />
            <textarea className="field min-h-20" name="excerpt" placeholder="Tóm tắt ngắn" required />
            <textarea className="field min-h-36" name="content" placeholder="Nội dung bài viết" required />
            <select className="field" name="status" defaultValue="DRAFT">
              <option value="DRAFT">Bản nháp</option>
              <option value="PUBLISHED">Xuất bản ngay</option>
            </select>
            <button className="btn-primary" type="submit">Tạo bài viết</button>
          </div>
        </form>

        <div className="space-y-4">
          {articles.length === 0 ? (
            <EmptyState title="Chưa có bài viết" description="Tạo bài viết du lịch đầu tiên để hiển thị trong CMS." actionHref="/staff" actionLabel="Tạo bài viết" />
          ) : (
            articles.map((article) => (
              <article className="card p-5" key={article.id}>
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <ArticleStatus status={article.status} />
                    <h3 className="mt-3 font-heading text-2xl text-[#9a4029]">{article.title}</h3>
                    <p className="mt-1 text-sm text-[#75675f]">/{article.slug}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={article.status === "PUBLISHED" ? unpublishArticleAction : publishArticleAction}>
                      <input name="articleId" type="hidden" value={article.id} />
                      <button className="btn-secondary" type="submit">{article.status === "PUBLISHED" ? "Unpublish" : "Publish"}</button>
                    </form>
                    <form action={deleteArticleAction}>
                      <input name="articleId" type="hidden" value={article.id} />
                      <button className="btn-secondary" type="submit">Xóa</button>
                    </form>
                  </div>
                </div>
                <form action={updateArticleAction} className="mt-5 grid gap-3">
                  <input name="articleId" type="hidden" value={article.id} />
                  <input className="field" name="title" defaultValue={article.title} required />
                  <input className="field" name="slug" defaultValue={article.slug} required />
                  <textarea className="field min-h-20" name="excerpt" defaultValue={article.excerpt} required />
                  <textarea className="field min-h-28" name="content" defaultValue={article.content} required />
                  <select className="field" name="status" defaultValue={article.status}>
                    <option value="DRAFT">Bản nháp</option>
                    <option value="PUBLISHED">Đã xuất bản</option>
                  </select>
                  <button className="btn-primary justify-self-start" type="submit">Lưu chỉnh sửa</button>
                </form>
              </article>
            ))
          )}
        </div>
      </section>
    </StaffShell>
  );
}

export function StaffModerationPortal({ reports, users, currentRole }: { reports: ViolationReport[]; users: UserProfile[]; currentRole: UserRole }) {
  const manageableUsers = currentRole === "ADMIN" ? users : users.filter((user) => user.role !== "ADMIN");

  return (
    <StaffShell
      title="Kiểm soát người dùng và báo cáo vi phạm"
      description="Theo dõi báo cáo vi phạm, xử lý case mở và chuyển trạng thái resolved. Ban/unban user nằm trong Admin Portal."
    >
      <section className="grid gap-4">
        {reports.length === 0 ? (
          <EmptyState title="Không có báo cáo vi phạm" description="Khi có report từ người dùng, Staff sẽ xử lý tại màn hình này." />
        ) : (
          reports.map((report) => (
            <article className="card p-5" key={report.id}>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <span className={report.status === "OPEN" ? "badge badge-red" : "badge badge-green"}>{report.status === "OPEN" ? "Đang mở" : "Đã xử lý"}</span>
                  <h2 className="mt-3 font-heading text-2xl text-[#9a4029]">Report {report.id}</h2>
                  <p className="mt-2 text-sm text-[#75675f]">
                    Người báo cáo: {report.reporterId} · Người bị báo cáo: {report.reportedUserId}
                  </p>
                  <p className="mt-2 text-base text-[#2f2926]">{report.reason}</p>
                </div>
                {report.status === "OPEN" && (
                  <form action={resolveReportAction}>
                    <input name="reportId" type="hidden" value={report.id} />
                    <button className="btn-primary" type="submit">Đánh dấu đã xử lý</button>
                  </form>
                )}
              </div>
            </article>
          ))
        )}
      </section>
      <section className="card p-6">
        <h2 className="font-heading text-3xl text-[#9a4029]">Kiểm soát tài khoản</h2>
        <p className="mt-2 text-sm text-[#75675f]">Staff có thể khóa hoặc mở khóa tài khoản khi xử lý vi phạm; phân quyền chỉ do Admin thực hiện.</p>
        <div className="mt-5 grid gap-3">
          {manageableUsers.length === 0 ? (
            <EmptyState title="Chưa có người dùng" description="Danh sách người dùng sẽ hiển thị khi hệ thống có tài khoản." />
          ) : manageableUsers.map((user) => (
            <article className="flex flex-col justify-between gap-3 rounded-2xl bg-[#fdf9f4] p-4 sm:flex-row sm:items-center" key={user.id}>
              <div>
                <p className="font-semibold text-[#2f2926]">{user.name}</p>
                <p className="mt-1 text-sm text-[#75675f]">{user.email} · {user.role}</p>
              </div>
              <form action={user.banned ? unbanModeratedUserAction : banModeratedUserAction}>
                <input name="userId" type="hidden" value={user.id} />
                <button className={user.banned ? "btn-secondary" : "btn-primary"} type="submit">
                  {user.banned ? "Mở khóa" : "Khóa tài khoản"}
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>
    </StaffShell>
  );
}
