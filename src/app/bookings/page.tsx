import { BookingCard, PageShell, statusGroup } from "@/components/customer-ui";
import { EmptyState } from "@/components/feedback-state";
import { getBookings, getHomestays } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const [bookings, homestays] = await Promise.all([getBookings("CUSTOMER"), getHomestays("CUSTOMER")]);
  const homestayById = new Map(homestays.map((homestay) => [homestay.id, homestay]));
  const groups = ["Sắp tới", "Đang trải nghiệm", "Đã hoàn thành", "Đã hủy"];

  return (
    <PageShell eyebrow="Booking History" title="Quản lý đặt phòng của tôi" description="Theo dõi trạng thái đơn đặt phòng, thanh toán và dịch vụ đi kèm.">
      {bookings.length ? (
        <div className="space-y-8">
          {groups.map((group) => {
            const items = bookings.filter((booking) => statusGroup(booking.status) === group);
            return (
              <section key={group}>
                <h2 className="mb-4 text-2xl text-[#9a4029]">{group}</h2>
                {items.length ? (
                  <div className="grid gap-4">
                    {items.map((booking) => <BookingCard booking={booking} homestay={homestayById.get(booking.homestayId)} key={booking.id} />)}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#eadfd3] bg-white/60 p-5 text-sm text-[#75675f]">Chưa có booking trong nhóm này.</div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Bạn chưa có booking" description="Hãy tìm homestay phù hợp và tạo đơn đặt phòng đầu tiên." actionHref="/homestays" actionLabel="Tìm homestay" />
      )}
    </PageShell>
  );
}
