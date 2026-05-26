import { AccessDenied } from "@/components/access-denied";
import { StaffCmsPortal } from "@/components/staff-portal";
import { getArticles } from "@/lib/api";
import { flashFromSearchParams, FlashSearchParams } from "@/lib/flash";
import { canAccess, getCurrentUser } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function StaffPage({ searchParams }: { searchParams: Promise<FlashSearchParams> }) {
  const user = await getCurrentUser();
  const flash = flashFromSearchParams(await searchParams);
  const allowed = ["STAFF", "ADMIN"] as const;

  if (user.authorizationError) {
    return <AccessDenied description={user.authorizationError} />;
  }

  if (!canAccess(user.role, [...allowed])) {
    return <AccessDenied description="Staff Portal chỉ dành cho Staff hoặc Admin." />;
  }

  const articles = await getArticles(user.role === "ADMIN" ? "ADMIN" : "STAFF");
  return <StaffCmsPortal articles={articles} flash={flash} />;
}
