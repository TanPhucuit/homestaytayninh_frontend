import { AccessDenied } from "@/components/access-denied";
import { ToastActionButton } from "@/components/toast-action";
import { BlogValidationForm } from "@/components/validated-forms";
import { AdminShell, MetricCard, Pill } from "@/components/ui";
import { getArticles, getUsers, getViolationReports } from "@/lib/api";
import { canAccess, getCurrentUser } from "@/lib/rbac";

export default async function StaffPage() {
  const user = await getCurrentUser();
  const allowed = ["STAFF", "ADMIN"] as const;

  if (!canAccess(user.role, [...allowed])) {
    return <AccessDenied role={user.role} allowed={[...allowed]} />;
  }

  const [articles, users, reports] = await Promise.all([getArticles(), getUsers(), getViolationReports()]);
  const bannedCount = users.filter((item) => item.banned).length;
  const openReports = reports.filter((item) => item.status === "OPEN");

  return (
    <AdminShell active="CMS" title="CMS, blog/news và kiểm soát người dùng" role={user.role}>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Bài viết" value={`${articles.length}`} note="Blog/news du lịch" />
        <MetricCard label="Đã publish" value={`${articles.filter((article) => article.status === "PUBLISHED").length}`} note="Đang hiển thị public" />
        <MetricCard label="Báo cáo vi phạm" value={`${openReports.length}`} note="Cần kiểm tra" />
        <MetricCard label="Tài khoản bị khóa" value={`${bannedCount}`} note="Staff có thể ban/unban" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <div className="card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#466550]">CMS bài viết du lịch / blog / news</h2>
                <p className="mt-1 text-sm text-[#75675f]">Staff chỉ thấy CMS, user moderation và báo cáo vi phạm.</p>
              </div>
              <ToastActionButton className="btn-primary w-full sm:w-auto" message="Tạo bài viết demo thành công">
                Tạo bài viết
              </ToastActionButton>
            </div>

            <div className="mt-5 grid gap-3">
              {articles.length === 0 ? (
                <div className="rounded-2xl bg-white p-4 text-sm text-[#75675f]">Chưa có bài viết nào.</div>
              ) : (
                articles.map((article) => (
                  <article key={article.id} className="rounded-2xl border border-[#eadfd3] bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold">{article.title}</h3>
                        <p className="mt-1 text-sm text-[#75675f]">{article.excerpt}</p>
                        <p className="mt-2 text-xs text-[#75675f]">/{article.slug}</p>
                      </div>
                      <Pill tone={article.status === "DRAFT" ? "clay" : "green"}>{article.status === "DRAFT" ? "Nháp" : "Đã xuất bản"}</Pill>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <ToastActionButton className="btn-secondary" message="Cập nhật bài viết demo thành công">
                        Sửa
                      </ToastActionButton>
                      <ToastActionButton className="btn-secondary" message="Xóa bài viết demo thành công">
                        Xóa
                      </ToastActionButton>
                      <ToastActionButton className={article.status === "DRAFT" ? "btn-primary" : "btn-secondary"} message={`${article.status === "DRAFT" ? "Publish" : "Unpublish"} bài viết demo thành công`}>
                        {article.status === "DRAFT" ? "Publish" : "Unpublish"}
                      </ToastActionButton>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
          <BlogValidationForm />
        </section>

        <section className="space-y-6">
          <div className="card p-5">
            <h2 className="text-2xl font-bold text-[#466550]">Báo cáo vi phạm</h2>
            <div className="mt-4 space-y-3">
              {reports.length === 0 ? (
                <div className="rounded-2xl bg-white p-4 text-sm text-[#75675f]">Không có báo cáo vi phạm.</div>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="rounded-2xl bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">{report.reason}</p>
                        <p className="mt-1 text-xs text-[#75675f]">
                          Reporter: {report.reporterId} · User: {report.reportedUserId}
                        </p>
                      </div>
                      <Pill tone={report.status === "OPEN" ? "clay" : "green"}>{report.status === "OPEN" ? "Đang mở" : "Đã xử lý"}</Pill>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <ToastActionButton className="btn-secondary" message="Đã mở audit log demo">
                        Xem audit
                      </ToastActionButton>
                      <ToastActionButton className="btn-primary" message="Đã đánh dấu báo cáo là đã xử lý">
                        Đánh dấu đã xử lý
                      </ToastActionButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-2xl font-bold text-[#466550]">Kiểm soát người dùng</h2>
            <div className="mt-4 space-y-3">
              {users.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4">
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-xs text-[#75675f]">
                      {item.role} · {item.email}
                    </p>
                  </div>
                  <Pill tone={item.banned ? "red" : "green"}>{item.banned ? "Bị khóa" : "Hoạt động"}</Pill>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <ToastActionButton className="btn-secondary flex-1" message="Ban user demo thành công">
                Ban user
              </ToastActionButton>
              <ToastActionButton className="btn-secondary flex-1" message="Unban user demo thành công">
                Unban user
              </ToastActionButton>
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
