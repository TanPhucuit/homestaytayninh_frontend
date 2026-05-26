import { StitchFrame } from "@/components/stitch-frame";
import { canAccess, getCurrentUser } from "@/lib/rbac";
import { stitchPages } from "@/lib/stitch-pages";

export default async function AdminPage() {
  const user = await getCurrentUser();
  const allowed = ["ADMIN"] as const;

  if (!canAccess(user.role, [...allowed])) {
    return <StitchFrame src={stitchPages.accessDenied} title="Không có quyền truy cập" />;
  }

  return <StitchFrame src={stitchPages.admin} title="Admin Portal Terra & Leaf" />;
}
