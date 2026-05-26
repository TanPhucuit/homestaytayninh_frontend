import { BookingCard, PageShell, statusGroup } from "@/components/customer-ui";
import { EmptyState } from "@/components/feedback-state";
import { getBookings, getHomestays } from "@/lib/api";

export const dynamic = "force-dynamic";

const groups = ["Sắp tới", "Đang trải nghiệm", "Đã hoàn thành", "Đã hủy"];

export default async function BookingsPage() {
  const [bookings, homestays] = await Promise.all([getBookings("CUSTOMER"), getHomestays("CUSTOMER")]);
  const homestayById = new Map(homestays.map((homestay) => [homestay.id, homestay]));

  return (
    <PageShell
      eyebrow="Booking History"
      title="Quản lý đặt phòng của tôi"
      description="Theo dõi trạng thái đơn đặt phòng, thanh toán và dịch vụ đi kèm theo đúng quy trình Pending → Confirmed → In-stay → Completed."
    >
      {bookings.length ? (
        <div className="space-y-8">
          {groups.map((group) => {
            const items = bookings.filter((booking) => statusGroup(booking.status) === group);
            return (
              <section className="card p-5 md:p-6" key={group}>
                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="eyebrow">Booking Status</p>
                    <h2 className="mt-2 font-heading text-3xl text-[#7b2914]">{group}</h2>
                  </div>
                  <span className="rounded-full bg-[#fdf9f4] px-4 py-2 text-sm font-bold text-[#466550]">{items.length} đơn</span>
                </div>
                {items.length ? (
                  <div className="grid gap-4">
                    {items.map((booking) => (
                      <BookingCard booking={booking} homestay={homestayById.get(booking.homestayId)} key={booking.id} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-[#dcc0ba] bg-[#fdf9f4] p-6 text-sm text-[#75675f]">
                    Chưa có booking trong nhóm này.
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Bạn chưa có booking"
          description="Hãy tìm homestay phù hợp và tạo đơn đặt phòng đầu tiên."
          actionHref="/homestays"
          actionLabel="Tìm homestay"
        />
      )}
    </PageShell>
  );
}
