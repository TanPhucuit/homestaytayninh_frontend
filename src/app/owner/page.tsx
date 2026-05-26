import { StitchFrame } from "@/components/stitch-frame";
import { canAccess, getCurrentUser } from "@/lib/rbac";
import { stitchPages } from "@/lib/stitch-pages";

export default async function OwnerPage() {
  const user = await getCurrentUser();
  const allowed = ["OWNER", "OWNER_STAFF", "ADMIN"] as const;

  if (!canAccess(user.role, [...allowed])) {
    return <StitchFrame src={stitchPages.accessDenied} title="Không có quyền truy cập" />;
  }

  const src = user.role === "OWNER_STAFF" ? stitchPages.ownerBookingOps : stitchPages.ownerDashboard;
  return <StitchFrame src={src} title="Owner Portal Terra & Leaf" />;
}
