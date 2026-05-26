import { BookingStateActions, BookingStateTimeline } from "@/components/booking-state-machine";
import { BookingServicesDisplay } from "@/components/booking-services-display";
import { StatusBadge } from "@/components/status-badge";
import { AddServiceValidationForm } from "@/components/validated-forms";
import { Pill, SectionHeading } from "@/components/ui";
import { getBooking, money } from "@/lib/api";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await getBooking(id);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading
        eyebrow="Booking detail"
        title={`Chi tiáº¿t Ä‘Æ¡n ${booking.id}`}
        description="Theo dÃµi tráº¡ng thÃ¡i booking, thanh toÃ¡n, dá»‹ch vá»¥ Ä‘Ã£ bao gá»“m vÃ  dá»‹ch vá»¥ Ä‘áº·t thÃªm trong lÃºc lÆ°u trÃº."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <div className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-[#466550]">Booking State Machine</h2>
                <p className="mt-1 text-sm text-[#75675f]">Pending â†’ Confirmed â†’ In-stay â†’ Completed; Cancelled lÃ  tráº¡ng thÃ¡i káº¿t thÃºc.</p>
              </div>
              <StatusBadge status={booking.status} />
            </div>
            <div className="mt-6">
              <BookingStateTimeline status={booking.status} />
            </div>
            <div className="mt-5">
              <BookingStateActions status={booking.status} bookingId={booking.id} />
            </div>
          </div>

          <BookingServicesDisplay booking={booking} audience="customer" />

          <div className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-[#466550]">Gá»i thÃªm dá»‹ch vá»¥</h2>
              <Pill tone={booking.status === "IN_STAY" ? "green" : "sand"}>{booking.status === "IN_STAY" ? "Enabled" : "Disabled"}</Pill>
            </div>
            <p className="mt-2 text-sm text-[#75675f]">Theo BA, chá»‰ cho phÃ©p thÃªm dá»‹ch vá»¥ khi booking á»Ÿ tráº¡ng thÃ¡i IN_STAY.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {["Set BBQ sÃ¢n vÆ°á»n", "ThuÃª xe mÃ¡y", "NÆ°á»›c uá»‘ng thÃªm"].map((service) => (
                <div key={service} className="rounded-2xl border border-[#eadfd3] bg-white p-4">
                  <p className="font-bold">{service}</p>
                  <AddServiceValidationForm enabled={booking.status === "IN_STAY"} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <p className="eyebrow">Payment summary</p>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><span>Tiá»n phÃ²ng</span><strong>{money(booking.roomTotal)}</strong></div>
            <div className="flex justify-between"><span>Dá»‹ch vá»¥ thÃªm</span><strong>{money(booking.serviceTotal)}</strong></div>
            <div className="flex justify-between"><span>Thuáº¿/phÃ­</span><strong>{money(booking.taxTotal)}</strong></div>
            <div className="border-t border-[#eadfd3] pt-4 text-lg">
              <div className="flex justify-between"><span>Tá»•ng cá»™ng</span><strong className="text-[#9a4029]">{money(booking.grandTotal)}</strong></div>
            </div>
          </div>
          {booking.payment && (
            <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#fdf9f4] p-4">
              <span className="font-bold text-[#466550]">Payment</span>
              <StatusBadge status={booking.payment.status} />
            </div>
          )}
          <div className="mt-6 rounded-2xl bg-white p-4 text-sm text-[#75675f]">
            Audit: booking.created, payment.updated, service_order.created, booking.status_changed.
          </div>
        </aside>
      </div>
    </main>
  );
}

