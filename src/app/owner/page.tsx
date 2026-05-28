import { AccessDenied } from "@/components/access-denied";
import { BookingListPreview, OwnerBookingFilters, OwnerBookingOps, OwnerShell, OwnerStats } from "@/components/owner-ui";
import { getOwnerBookings, getOwnerHomestays } from "@/lib/api";
import { flashFromSearchParams, FlashSearchParams } from "@/lib/flash";
import { canAccess, getCurrentUser } from "@/lib/rbac";
import { updateOwnerBookingStatusAction } from "./actions";

export const dynamic = "force-dynamic";

const opsPriority = { PENDING: 0, CONFIRMED: 1, IN_STAY: 2, COMPLETED: 3, CANCELLED: 4 } as const;
type OwnerSearchParams = FlashSearchParams & {
  q?: string;
  status?: string;
  checkInFrom?: string;
  checkInTo?: string;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function filterBookings(bookings: Awaited<ReturnType<typeof getOwnerBookings>>, params: OwnerSearchParams) {
  const keyword = normalizeText(String(params.q ?? "").trim());
  const status = String(params.status ?? "");
  const from = String(params.checkInFrom ?? "");
  const to = String(params.checkInTo ?? "");

  return bookings.filter((booking) => {
    const keywordOk = !keyword || normalizeText(`${booking.id} ${booking.guestName} ${booking.guestPhone}`).includes(keyword);
    const statusOk = !status || booking.status === status;
    const fromOk = !from || booking.checkIn >= from;
    const toOk = !to || booking.checkIn <= to;
    return keywordOk && statusOk && fromOk && toOk;
  });
}

export default async function OwnerPage({ searchParams }: { searchParams: Promise<OwnerSearchParams> }) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const flash = flashFromSearchParams(params);
  const allowed = ["OWNER", "OWNER_STAFF", "ADMIN"] as const;

  if (user.authorizationError) {
    return <AccessDenied description={user.authorizationError} />;
  }

  if (!canAccess(user.role, [...allowed])) {
    return <AccessDenied description="Khu vực vận hành homestay chỉ dành cho Owner, Owner Staff hoặc Admin." />;
  }

  const bookings = await getOwnerBookings(user.role);
  const homestays = await getOwnerHomestays(user.role);
  const filteredBookings = filterBookings(bookings, params);
  const sortedBookings = [...filteredBookings].sort((a, b) => opsPriority[a.status] - opsPriority[b.status]);
  const canManageInventory = user.role === "OWNER" || user.role === "ADMIN";
  const canOperateBooking = user.role === "OWNER_STAFF" || user.role === "ADMIN";

  return (
    <OwnerShell title="Bảng điều khiển vận hành homestay" description="Theo dõi booking, check-in/check-out và truy cập nhanh các nghiệp vụ của chủ homestay." flash={flash}>
      <div className="mb-6 flex flex-wrap gap-3">
        {canManageInventory && <a className="btn-primary" href="/owner/manage">Quản lý homestay/phòng/dịch vụ</a>}
        {canOperateBooking && <a className="btn-secondary" href="/owner/proxy-booking">Đặt hộ khách hàng</a>}
      </div>
      <OwnerStats homestays={homestays} bookings={bookings} />
      <section className="mt-8">
        <h2 className="mb-4 font-heading text-3xl text-[#9a4029]">Booking cần xử lý</h2>
        <OwnerBookingFilters keyword={params.q} status={params.status} checkInFrom={params.checkInFrom} checkInTo={params.checkInTo} />
        {canOperateBooking ? (
          <OwnerBookingOps bookings={sortedBookings} homestays={homestays} action={updateOwnerBookingStatusAction} />
        ) : (
          <BookingListPreview bookings={sortedBookings} homestays={homestays} />
        )}
      </section>
    </OwnerShell>
  );
}
