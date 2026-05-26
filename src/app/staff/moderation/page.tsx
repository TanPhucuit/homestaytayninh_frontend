import { EmptyState } from "@/components/feedback-state";
import { StaffModerationPortal } from "@/components/staff-portal";
import { getViolationReports } from "@/lib/api";
import { canAccess, getCurrentUser } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function StaffModerationPage() {
  const user = await getCurrentUser();
  const allowed = ["STAFF", "ADMIN"] as const;

  if (!canAccess(user.role, [...allowed])) {
    return (
      <main className="min-h-screen px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <EmptyState title="Không có quyền truy cập" description="Trang kiểm soát người dùng chỉ dành cho Staff hoặc Admin." actionHref="/login" actionLabel="Đăng nhập đúng vai trò" />
        </div>
      </main>
    );
  }

  const reports = await getViolationReports(user.role === "ADMIN" ? "ADMIN" : "STAFF");
  return <StaffModerationPortal reports={reports} />;
}
