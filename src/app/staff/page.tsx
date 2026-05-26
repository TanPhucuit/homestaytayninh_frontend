import { EmptyState } from "@/components/feedback-state";
import { StaffCmsPortal } from "@/components/staff-portal";
import { getArticles } from "@/lib/api";
import { canAccess, getCurrentUser } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const user = await getCurrentUser();
  const allowed = ["STAFF", "ADMIN"] as const;

  if (!canAccess(user.role, [...allowed])) {
    return (
      <main className="min-h-screen bg-[#fdf9f4] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <EmptyState title="Không có quyền truy cập" description="Staff Portal chỉ dành cho Staff hoặc Admin." actionHref="/login" actionLabel="Đăng nhập đúng vai trò" />
        </div>
      </main>
    );
  }

  const articles = await getArticles(user.role === "ADMIN" ? "ADMIN" : "STAFF");
  return <StaffCmsPortal articles={articles} />;
}
