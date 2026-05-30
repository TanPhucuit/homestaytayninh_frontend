import { AccessDenied } from "@/components/access-denied";
import { StaffModerationPortal } from "@/components/staff-portal";
import { getUsers, getViolationReports } from "@/lib/api";
import { flashFromSearchParams, FlashSearchParams } from "@/lib/flash";
import { canAccess, getCurrentUser } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function StaffModerationPage({ searchParams }: { searchParams: Promise<FlashSearchParams> }) {
  const user = await getCurrentUser();
  const flash = flashFromSearchParams(await searchParams);
  const allowed = ["STAFF"] as const;

  if (user.authorizationError) {
    return <AccessDenied description={user.authorizationError} />;
  }

  if (!canAccess(user.role, [...allowed])) {
    return <AccessDenied description="Trang kiểm soát người dùng chỉ dành cho Staff." />;
  }

  const [reports, users] = await Promise.all([getViolationReports("STAFF"), getUsers("STAFF")]);
  return <StaffModerationPortal reports={reports} users={users} currentRole={user.role} flash={flash} />;
}
