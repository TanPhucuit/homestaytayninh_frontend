import { AppTopBar, Stepper } from "@/components/customer-ui";
import { MultiRoomServicesForm } from "@/components/multi-room-services-form";
import { getHomestay } from "@/lib/api";

export const dynamic = "force-dynamic";

type CheckoutServiceParams = {
  homestayId?: string;
  roomId?: string;
  roomIds?: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  guestCount?: string;
  guests?: string;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
  [key: string]: string | undefined;
};

function selectedRoomIds(params: CheckoutServiceParams) {
  if (params.roomIds) return params.roomIds.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function selectedServiceQuantities(params: CheckoutServiceParams) {
  return Object.entries(params)
    .filter(([key, value]) => key.startsWith("service:") && Number(value) > 0)
    .map(([key, value]) => {
      const [, roomId, serviceId] = key.split(":");
      return serviceId ? { key: `${roomId}:${serviceId}`, quantity: Number(value) } : null;
    })
    .filter((item): item is { key: string; quantity: number } => Boolean(item));
}

function dateFromIso(value?: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function nightsBetween(checkIn?: string, checkOut?: string) {
  const start = dateFromIso(checkIn);
  const end = dateFromIso(checkOut);
  if (!start || !end || end <= start) return 0;
  return Math.ceil((end.getTime() - start.getTime()) / 86_400_000);
}

function positiveGuestCount(value?: string) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? String(number) : undefined;
}

function detailRoomsHref(homestayId?: string, params?: CheckoutServiceParams, roomIds: string[] = []) {
  if (!homestayId) return "/homestays";
  const query = new URLSearchParams();
  const selectedRooms = roomIds.length ? roomIds : selectedRoomIds(params ?? {});
  if (selectedRooms.length) query.set("roomIds", selectedRooms.join(","));
  if (nightsBetween(params?.checkIn, params?.checkOut) > 0) {
    query.set("checkIn", params?.checkIn ?? "");
    query.set("checkOut", params?.checkOut ?? "");
  }
  const guests = positiveGuestCount(params?.guests ?? params?.guestCount);
  if (guests) query.set("guests", guests);
  return `/homestays/${homestayId}${query.toString() ? `?${query.toString()}` : ""}#rooms`;
}

function Notice({ message, homestayId, params }: { message: string; homestayId?: string; params?: CheckoutServiceParams }) {
  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
        <section className="card p-6 text-center md:p-8">
          <p className="eyebrow">Dịch vụ bổ sung</p>
          <h1 className="mt-3 font-heading text-4xl text-[#9a4029]">Cần chọn lại phòng</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#75675f]">{message}</p>
          <a className="btn-primary mt-6" href={detailRoomsHref(homestayId, params)}>Quay lại chọn phòng</a>
        </section>
      </div>
    </main>
  );
}

export default async function CheckoutServicesPage({ searchParams }: { searchParams: Promise<CheckoutServiceParams> }) {
  const params = await searchParams;
  const roomIds = selectedRoomIds(params);
  if (!params.homestayId) return <Notice message="Vui lòng chọn homestay và phòng trước khi chọn dịch vụ." />;
  if (roomIds.length === 0) return <Notice homestayId={params.homestayId} params={params} message="Vui lòng chọn ít nhất một phòng trước khi chọn dịch vụ." />;

  const homestay = await getHomestay(params.homestayId, "CUSTOMER");
  const rooms = roomIds.map((roomId) => homestay.rooms.find((room) => room.id === roomId)).filter((room): room is NonNullable<typeof room> => Boolean(room));
  if (rooms.length !== roomIds.length) {
    return <Notice homestayId={params.homestayId} params={params} message="Một hoặc nhiều phòng đã chọn không còn khả dụng. Vui lòng chọn lại phòng." />;
  }
  if (nightsBetween(params.checkIn, params.checkOut) <= 0) {
    return <Notice homestayId={homestay.id} params={params} message="Vui lòng chọn ngày nhận và ngày trả hợp lệ sau khi chọn phòng." />;
  }
  const guests = positiveGuestCount(params.guests ?? params.guestCount);
  if (!guests) {
    return <Notice homestayId={homestay.id} params={params} message="Vui lòng nhập số khách hợp lệ sau khi chọn phòng." />;
  }
  const backHref = detailRoomsHref(homestay.id, params, roomIds);

  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_430px]">
          <div>
            <p className="eyebrow">Thanh toán</p>
            <h1 className="mt-2 font-heading text-4xl text-[#9a4029] md:text-5xl">Dịch vụ bổ sung</h1>
            <p className="mt-3 text-[#56423d]">Chọn dịch vụ riêng cho từng phòng. Có thể bỏ qua nếu không cần.</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-[0_18px_55px_rgba(123,41,20,0.08)]">
            <Stepper active={2} />
          </div>
        </div>
        <MultiRoomServicesForm
          homestayId={homestay.id}
          rooms={rooms}
          services={homestay.services.filter((service) => service.active !== false && !service.included)}
          initialSelectedServices={selectedServiceQuantities(params)}
          checkIn={params.checkIn ?? ""}
          checkOut={params.checkOut ?? ""}
          guests={guests}
          backHref={backHref}
        />
      </div>
    </main>
  );
}
