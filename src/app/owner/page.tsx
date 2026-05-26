import Link from "next/link";
import { canAccess, getCurrentUser } from "@/lib/rbac";
import { AccessDenied } from "@/components/access-denied";
import { BookingListPreview, OwnerBookingOps, OwnerShell, OwnerStats } from "@/components/owner-ui";
import { getHomestays, getOwnerBookings, getOwnerHomestays } from "@/lib/api";
import { updateOwnerBookingStatusAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function OwnerPage() {
  const user = await getCurrentUser();
  const allowed = ["OWNER", "OWNER_STAFF", "ADMIN"] as const;

  if (!canAccess(user.role, [...allowed])) {
    return <AccessDenied description="Owner Portal chỉ dành cho Owner, Owner Staff hoặc Admin." />;
  }

  const role = user.role === "ADMIN" ? "OWNER_STAFF" : user.role;
  const [homestays, bookings] = await Promise.all([
    user.role === "OWNER_STAFF" ? getHomestays("CUSTOMER") : getOwnerHomestays(user.role === "ADMIN" ? "ADMIN" : "OWNER"),
    getOwnerBookings(role)
  ]);

  return (
    <OwnerShell title="Dashboard vận hành homestay" description="Theo dõi doanh thu, booking, check-in/check-out và truy cập nhanh các nghiệp vụ owner.">
      <div className="mb-6 flex flex-wrap gap-3">
        <Link className="btn-primary" href="/owner/manage">Quản lý homestay/phòng/dịch vụ</Link>
        <Link className="btn-secondary" href="/owner/proxy-booking">Đặt hộ khách hàng</Link>
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
