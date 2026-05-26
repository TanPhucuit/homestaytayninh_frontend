import { canAccess, getCurrentUser } from "@/lib/rbac";
import { AccessDenied } from "@/components/access-denied";
import { BookingListPreview, OwnerBookingOps, OwnerShell, OwnerStats } from "@/components/owner-ui";
import { getOwnerBookings, getOwnerHomestays } from "@/lib/api";
import { flashFromSearchParams, FlashSearchParams } from "@/lib/flash";
import { updateOwnerBookingStatusAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function OwnerPage({ searchParams }: { searchParams: Promise<FlashSearchParams> }) {
  const user = await getCurrentUser();
  const flash = flashFromSearchParams(await searchParams);
  const allowed = ["OWNER", "OWNER_STAFF", "ADMIN"] as const;

  if (user.authorizationError) {
    return <AccessDenied description={user.authorizationError} />;
  }

  if (!canAccess(user.role, [...allowed])) {
    return <AccessDenied description="Owner Portal chỉ dành cho Owner, Owner Staff hoặc Admin." />;
  }

  const bookings = await getOwnerBookings(user.role);
  const homestays = await getOwnerHomestays(user.role);

  return (
    <OwnerShell title="Dashboard vận hành homestay" description="Theo dõi doanh thu, booking, check-in/check-out và truy cập nhanh các nghiệp vụ owner." flash={flash}>
      <div className="mb-6 flex flex-wrap gap-3">
        <a className="btn-primary" href="/owner/manage">Quản lý homestay/phòng/dịch vụ</a>
        <a className="btn-secondary" href="/owner/proxy-booking">Đặt hộ khách hàng</a>
      </div>
      <OwnerStats homestays={homestays} bookings={bookings} />
      <section className="mt-8">
        <h2 className="mb-4 font-heading text-3xl text-[#9a4029]">Booking cần xử lý</h2>
        {user.role === "OWNER" ? (
          <BookingListPreview bookings={bookings} homestays={homestays} />
        ) : (
          <OwnerBookingOps bookings={bookings} homestays={homestays} action={updateOwnerBookingStatusAction} />
        )}
      </section>
    </OwnerShell>
  );
}
