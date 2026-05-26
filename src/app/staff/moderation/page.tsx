import { StitchFrame } from "@/components/stitch-frame";
import { canAccess, getCurrentUser } from "@/lib/rbac";
import { stitchPages } from "@/lib/stitch-pages";

export default async function StaffModerationPage() {
  const user = await getCurrentUser();
  const allowed = ["STAFF", "ADMIN"] as const;

  if (!canAccess(user.role, [...allowed])) {
    return <StitchFrame src={stitchPages.accessDenied} title="Không có quyền truy cập" />;
  }

  return <StitchFrame src={stitchPages.staffModeration} title="Kiểm soát người dùng" />;
}
