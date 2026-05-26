import { StitchFrame } from "@/components/stitch-frame";
import { AdminPortal } from "@/components/admin-portal";
import { getDashboard, getUsers } from "@/lib/api";
import { canAccess, getCurrentUser } from "@/lib/rbac";
import { stitchPages } from "@/lib/stitch-pages";

export default async function AdminPage() {
  const user = await getCurrentUser();
  const allowed = ["ADMIN"] as const;

  if (!canAccess(user.role, [...allowed])) {
    return <StitchFrame src={stitchPages.accessDenied} title="Không có quyền truy cập" />;
  }

  const [dashboard, users] = await Promise.all([getDashboard("ADMIN"), getUsers("ADMIN")]);

  return <AdminPortal dashboard={dashboard} users={users} />;
}
