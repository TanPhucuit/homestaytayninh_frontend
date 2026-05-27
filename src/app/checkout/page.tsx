import { CheckoutInfoForm } from "@/components/checkout-info-form";
import { AppTopBar, Stepper } from "@/components/customer-ui";
import { getHomestay } from "@/lib/api";

export const dynamic = "force-dynamic";

type CheckoutParams = {
  homestayId?: string;
  roomId?: string;
  roomIds?: string;
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

function selectedRoomIds(params: CheckoutParams) {
  if (params.roomIds) {
    return params.roomIds.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return params.roomId ? [params.roomId] : [];
}

function CheckoutSelectionNotice({ message, homestayId }: { message: string; homestayId?: string }) {
  const backHref = homestayId ? `/homestays/${homestayId}` : "/homestays";
  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
        <section className="card p-6 text-center md:p-8">
          <p className="eyebrow">Checkout</p>
          <h1 className="mt-3 font-heading text-4xl text-[#9a4029]">Cần chọn lại phòng</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#75675f]">{message}</p>
          <a className="btn-primary mt-6" href={backHref}>Quay lại chọn phòng</a>
        </section>
      </div>
    </main>
  );
}

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<CheckoutParams> }) {
  const params = await searchParams;
  const roomIds = selectedRoomIds(params);
  if (!params.homestayId) {
    return <CheckoutSelectionNotice message="Vui lòng chọn homestay và phòng trước khi thanh toán." />;
  }
  if (roomIds.length === 0) {
    return <CheckoutSelectionNotice homestayId={params.homestayId} message="Vui lòng chọn một phòng để tiếp tục thanh toán." />;
  }
  if (roomIds.length > 1) {
    return <CheckoutSelectionNotice homestayId={params.homestayId} message="Hiện hệ thống chỉ hỗ trợ đặt một phòng mỗi lần. Vui lòng chọn một phòng để tiếp tục." />;
  }

  const homestay = await getHomestay(params.homestayId, "CUSTOMER");
  const room = homestay.rooms.find((item) => item.id === roomIds[0]);
  if (!room) {
    return <CheckoutSelectionNotice homestayId={params.homestayId} message="Phòng đã chọn không khả dụng cho homestay này. Vui lòng chọn lại phòng khác." />;
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
