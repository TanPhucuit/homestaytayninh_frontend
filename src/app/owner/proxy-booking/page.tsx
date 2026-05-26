import { AccessDenied } from "@/components/access-denied";
import { OwnerShell } from "@/components/owner-ui";
import { getHomestays } from "@/lib/api";
import { canAccess, getCurrentUser } from "@/lib/rbac";
import { createProxyBookingAction } from "../actions";

export const dynamic = "force-dynamic";

function isoDateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export default async function OwnerProxyBookingPage() {
  const user = await getCurrentUser();
  const allowed = ["OWNER_STAFF", "ADMIN"] as const;

  if (!canAccess(user.role, [...allowed])) {
    return <AccessDenied description="Đặt hộ khách hàng chỉ dành cho Owner Staff hoặc Admin." />;
  }

  const homestays = await getHomestays("CUSTOMER");
  const firstHomestay = homestays[0];
  const firstRoom = firstHomestay?.rooms[0];

  return (
    <OwnerShell title="Đặt hộ khách hàng" description="Owner Staff tạo booking và chọn dịch vụ hộ khách gọi điện hoặc đặt trực tiếp tại quầy.">
      <form action={createProxyBookingAction} className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="card p-6">
          <h2 className="font-heading text-2xl text-[#9a4029]">Thông tin booking hộ</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">Homestay
              <select className="field" name="homestayId" defaultValue={firstHomestay?.id} required>
                {homestays.map((homestay) => <option key={homestay.id} value={homestay.id}>{homestay.name}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">Phòng
              <select className="field" name="roomId" defaultValue={firstRoom?.id} required>
                {homestays.flatMap((homestay) => homestay.rooms.map((room) => <option key={room.id} value={room.id}>{homestay.name} · {room.name}</option>))}
              </select>
            </label>
            <input className="field" name="customerId" placeholder="Customer ID" defaultValue="u-customer" />
            <input className="field" name="guestName" placeholder="Tên khách" required />
            <input className="field" name="guestPhone" placeholder="Số điện thoại" required pattern="^[0-9+ ]{8,15}$" />
            <input className="field" name="guestCount" type="number" min="1" defaultValue="2" required />
            <input className="field" name="checkIn" type="date" defaultValue={isoDateAfter(7)} required />
            <input className="field" name="checkOut" type="date" defaultValue={isoDateAfter(9)} required />
          </div>
        </section>

        <aside className="card h-fit p-6">
          <h2 className="font-heading text-2xl text-[#9a4029]">Dịch vụ gọi kèm</h2>
          <div className="mt-4 grid gap-3">
            <select className="field" name="serviceId" defaultValue="">
              <option value="">Không chọn dịch vụ</option>
              {homestays.flatMap((homestay) => homestay.services.map((service) => <option key={service.id} value={service.id}>{homestay.name} · {service.name}</option>))}
            </select>
            <input className="field" name="serviceQuantity" type="number" min="0" defaultValue="0" />
            <button className="btn-primary" type="submit" disabled={!firstRoom}>Tạo booking hộ</button>
          </div>
        </aside>
      </form>
    </OwnerShell>
  );
}
