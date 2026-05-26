import { AccessDenied } from "@/components/access-denied";
import { OwnerShell } from "@/components/owner-ui";
import { ProxyBookingForm } from "@/components/proxy-booking-form";
import { getOwnerHomestays } from "@/lib/api";
import { flashFromSearchParams, FlashSearchParams } from "@/lib/flash";
import { canAccess, getCurrentUser } from "@/lib/rbac";
import { createProxyBookingAction } from "../actions";

export const dynamic = "force-dynamic";

function isoDateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export default async function OwnerProxyBookingPage({ searchParams }: { searchParams: Promise<FlashSearchParams> }) {
  const user = await getCurrentUser();
  const flash = flashFromSearchParams(await searchParams);
  const allowed = ["OWNER_STAFF", "ADMIN"] as const;

  if (user.authorizationError) {
    return <AccessDenied description={user.authorizationError} />;
  }

  if (!canAccess(user.role, [...allowed])) {
    return <AccessDenied description="Đặt hộ khách hàng chỉ dành cho Owner Staff hoặc Admin." />;
  }

  const homestays = await getOwnerHomestays(user.role);

  return (
    <OwnerShell title="Đặt hộ khách hàng" description="Owner Staff tạo booking và chọn dịch vụ hộ khách gọi điện hoặc đặt trực tiếp tại quầy." flash={flash}>
      <ProxyBookingForm action={createProxyBookingAction} defaultCheckIn={isoDateAfter(7)} defaultCheckOut={isoDateAfter(9)} homestays={homestays} />
    </OwnerShell>
  );
}
