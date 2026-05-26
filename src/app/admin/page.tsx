import { AccessDenied } from "@/components/access-denied";
import { AdminPortal } from "@/components/admin-portal";
import { getDashboard, getUsers } from "@/lib/api";
import { canAccess, getCurrentUser } from "@/lib/rbac";

export default async function AdminPage() {
  const user = await getCurrentUser();
  const allowed = ["ADMIN"] as const;

  if (!canAccess(user.role, [...allowed])) {
    return <AccessDenied description="Admin Portal chỉ dành cho tài khoản Admin." />;
  }

  const [dashboard, users] = await Promise.all([getDashboard("ADMIN"), getUsers("ADMIN")]);

  return <AdminPortal dashboard={dashboard} users={users} />;
}
