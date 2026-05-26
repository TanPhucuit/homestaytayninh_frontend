import { AccessDenied } from "@/components/access-denied";
import { StaffModerationPortal } from "@/components/staff-portal";
import { getUsers, getViolationReports } from "@/lib/api";
import { canAccess, getCurrentUser } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function StaffModerationPage() {
  const user = await getCurrentUser();
  const allowed = ["STAFF", "ADMIN"] as const;

  if (user.authorizationError) {
    return <AccessDenied description={user.authorizationError} />;
  }

  if (!canAccess(user.role, [...allowed])) {
    return <AccessDenied description="Trang kiểm soát người dùng chỉ dành cho Staff hoặc Admin." />;
  }

  const role = user.role === "ADMIN" ? "ADMIN" : "STAFF";
  const [reports, users] = await Promise.all([getViolationReports(role), getUsers(role)]);
  return <StaffModerationPortal reports={reports} users={users} currentRole={user.role} />;
}
