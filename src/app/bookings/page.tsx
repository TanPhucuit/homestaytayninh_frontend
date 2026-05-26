import { BookingCard } from "@/components/booking-card";
import { EmptyState } from "@/components/feedback-state";
import { PortalShell } from "@/components/portal-shell";
import { Pill } from "@/components/ui";
import { getBookings, money } from "@/lib/api";

export default async function BookingsPage() {
  const bookings = await getBookings();
  const total = bookings.reduce((sum, booking) => sum + booking.grandTotal, 0);
  const groups = [
    { label: "Táº¥t cáº£", count: bookings.length },
    { label: "Upcoming", count: bookings.filter((booking) => booking.status === "PENDING" || booking.status === "CONFIRMED").length },
    { label: "In-stay", count: bookings.filter((booking) => booking.status === "IN_STAY").length },
    { label: "Completed", count: bookings.filter((booking) => booking.status === "COMPLETED").length },
    { label: "Cancelled", count: bookings.filter((booking) => booking.status === "CANCELLED").length }
  ];

  return (
    <PortalShell eyebrow="Customer Portal" title="Quáº£n lÃ½ Ä‘Æ¡n hÃ ng">
      <div className="mb-6 flex flex-wrap gap-2">
        {groups.map((tab, index) => (
          <Pill key={tab.label} tone={index === 0 ? "clay" : "green"}>{tab.label}: {tab.count}</Pill>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <section className="card h-fit space-y-4 p-5">
          <h2 className="text-2xl font-bold text-[#466550]">Checkout demo</h2>
          <div className="grid gap-3">
            {["Há» tÃªn", "Sá»‘ Ä‘iá»‡n thoáº¡i", "NgÃ y nháº­n/tráº£", "PhÆ°Æ¡ng thá»©c thanh toÃ¡n"].map((label) => (
              <div key={label} className="field text-sm">
                {label}
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-[#fdf9f4] p-4">
            <p className="font-bold text-[#466550]">Order summary</p>
            <p className="mt-2 text-sm">Tá»•ng tiá»n demo: {money(total)}</p>
            <p className="mt-2 text-xs text-[#75675f]">Tiá»n phÃ²ng, dá»‹ch vá»¥ thÃªm, thuáº¿/phÃ­ vÃ  grand total theo BA.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
            <Pill tone="sand">INITIATED</Pill>
            <Pill tone="sand">PENDING</Pill>
            <Pill tone="green">PAID</Pill>
          </div>
          <button className="btn-primary w-full" type="button">
            Thanh toÃ¡n qua ApiPay mock
          </button>
        </section>
        <section className="space-y-4">
          {bookings.length === 0 ? (
            <EmptyState title="ChÆ°a cÃ³ booking" description="Báº¡n chÆ°a táº¡o Ä‘Æ¡n Ä‘áº·t phÃ²ng nÃ o. HÃ£y tÃ¬m homestay phÃ¹ há»£p Ä‘á»ƒ báº¯t Ä‘áº§u." actionHref="/homestays" actionLabel="TÃ¬m homestay" />
          ) : (
            bookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
          )}
        </section>
      </div>
    </PortalShell>
  );
}

