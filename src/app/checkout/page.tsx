import { CheckoutInfoForm } from "@/components/checkout-info-form";
import { AppTopBar, Stepper } from "@/components/customer-ui";
import { getHomestay, getHomestays } from "@/lib/api";

export const dynamic = "force-dynamic";

type CheckoutParams = {
  homestayId?: string;
  roomId?: string;
  checkIn?: string;
  checkOut?: string;
  guestCount?: string;
  guests?: string;
  error?: string;
};

function isoDateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<CheckoutParams> }) {
  const params = await searchParams;
  const homestays = await getHomestays("CUSTOMER");
  const selectedId = params.homestayId ?? homestays[0]?.id;
  const homestay = await getHomestay(selectedId, "CUSTOMER");
  const room = homestay.rooms.find((item) => item.id === params.roomId) ?? homestay.rooms[0];
  if (!room || (params.roomId && room.id !== params.roomId)) {
    throw new Error("Phòng không khả dụng cho homestay này.");
  }

  const defaultCheckIn = params.checkIn ?? isoDateAfter(14);
  const defaultCheckOut = params.checkOut ?? isoDateAfter(16);
  const defaultGuestCount = params.guestCount ?? params.guests ?? "2";

  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <header className="mb-8 grid gap-5 lg:grid-cols-[1fr_430px] lg:items-end">
          <div>
            <p className="eyebrow">Checkout</p>
            <h1 className="mt-2 font-heading text-4xl text-[#1c1c19] md:text-5xl">Hoàn tất đặt phòng</h1>
            <p className="mt-3 text-[#56423d]">{homestay.name} · {room.name}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-[0_18px_55px_rgba(123,41,20,0.08)]">
            <Stepper active={1} />
          </div>
        </header>
        <CheckoutInfoForm
          homestay={homestay}
          room={room}
          defaultCheckIn={defaultCheckIn}
          defaultCheckOut={defaultCheckOut}
          defaultGuestCount={defaultGuestCount}
          error={params.error}
        />
      </div>
    </main>
  );
}
