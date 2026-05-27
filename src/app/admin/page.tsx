import { AccessDenied } from "@/components/access-denied";
import { AdminPortal } from "@/components/admin-portal";
import { getDashboard, getUsers } from "@/lib/api";
import { flashFromSearchParams, FlashSearchParams } from "@/lib/flash";
import { canAccess, getCurrentUser } from "@/lib/rbac";

export default async function AdminPage({ searchParams }: { searchParams: Promise<FlashSearchParams> }) {
  const user = await getCurrentUser();
  const flash = flashFromSearchParams(await searchParams);
  const allowed = ["ADMIN"] as const;

  if (user.authorizationError) {
    return <AccessDenied description={user.authorizationError} />;
  }

  if (!canAccess(user.role, [...allowed])) {
    return <AccessDenied description="Khu vực quản trị chỉ dành cho tài khoản Admin." />;
  }

  const [dashboard, users] = await Promise.all([getDashboard("ADMIN"), getUsers("ADMIN")]);

  return <AdminPortal dashboard={dashboard} users={users} currentUser={user} flash={flash} />;
}
