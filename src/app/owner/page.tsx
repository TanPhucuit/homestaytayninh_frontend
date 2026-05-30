import { AccessDenied } from "@/components/access-denied";
import { BookingListPreview, OwnerBookingFilters, OwnerBookingHistory, OwnerBookingOps, OwnerShell, OwnerStats } from "@/components/owner-ui";
import { getOwnerBookings, getOwnerHomestays } from "@/lib/api";
import { flashFromSearchParams, FlashSearchParams } from "@/lib/flash";
import { canAccess, getCurrentUser } from "@/lib/rbac";

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
  const allowed = ["OWNER", "OWNER_STAFF"] as const;

  if (user.authorizationError) {
    return <AccessDenied description={user.authorizationError} />;
  }

  if (!canAccess(user.role, [...allowed])) {
    return <AccessDenied description="Khu vực chủ homestay và vận hành booking chỉ dành cho Owner hoặc Owner Staff." />;
  }

  const bookings = await getOwnerBookings(user.role);
  const homestays = await getOwnerHomestays(user.role);
  const filteredBookings = filterBookings(bookings, params);
  const sortedBookings = [...filteredBookings].sort((a, b) => opsPriority[a.status] - opsPriority[b.status]);
  const historyBookings = sortedBookings.filter((booking) => booking.status === "COMPLETED" || booking.status === "CANCELLED");
  const canManageInventory = user.role === "OWNER";
  const canOperateBooking = user.role === "OWNER_STAFF";

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
          <>
            <OwnerBookingOps bookings={sortedBookings} homestays={homestays} />
            <section className="mt-8">
              <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-end">
                <div>
                  <h2 className="font-heading text-3xl text-[#9a4029]">Lịch sử booking</h2>
                  <p className="mt-1 text-sm text-[#75675f]">Các đơn đã hoàn thành hoặc đã hủy theo bộ lọc hiện tại.</p>
                </div>
                <span className="badge bg-[#e8f0eb] text-[#466550]">{historyBookings.length} đơn</span>
              </div>
              <OwnerBookingHistory bookings={historyBookings} homestays={homestays} />
            </section>
          </>
        ) : (
          <BookingListPreview bookings={sortedBookings} homestays={homestays} />
        )}
      </section>
    </OwnerShell>
  );
}
