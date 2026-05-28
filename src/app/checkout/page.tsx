import { AppTopBar } from "@/components/customer-ui";

export const dynamic = "force-dynamic";

type CheckoutParams = {
  homestayId?: string;
  roomId?: string;
  roomIds?: string;
};

function selectedRoomIds(params: CheckoutParams) {
  if (params.roomIds) {
    return params.roomIds.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return params.roomId ? [params.roomId] : [];
}

function CheckoutSelectionNotice({ homestayId, roomIds }: { homestayId?: string; roomIds: string[] }) {
  const query = new URLSearchParams();
  if (roomIds.length) query.set("roomIds", roomIds.join(","));
  const backHref = homestayId ? `/homestays/${homestayId}${query.toString() ? `?${query.toString()}` : ""}#rooms` : "/homestays";
  return (
    <main className="min-h-screen text-[#1c1c19]">
      <AppTopBar />
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
        <section className="card p-6 text-center md:p-8">
          <p className="eyebrow">Checkout</p>
          <h1 className="mt-3 font-heading text-4xl text-[#9a4029]">Bắt đầu từ chọn phòng</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#75675f]">
            Vui lòng chọn phòng, ngày lưu trú và số khách trong khung đặt phòng của homestay trước khi tiếp tục thanh toán.
          </p>
          <a className="btn-primary mt-6" href={backHref}>Quay lại chọn phòng</a>
        </section>
      </div>
    </main>
  );
}

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<CheckoutParams> }) {
  const params = await searchParams;
  const roomIds = selectedRoomIds(params);
  return <CheckoutSelectionNotice homestayId={params.homestayId} roomIds={roomIds} />;
}
