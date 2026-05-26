import { AccessDenied } from "@/components/access-denied";
import { ActionButton } from "@/components/action-button";
import { OwnerInventory, OwnerShell } from "@/components/owner-ui";
import { getOwnerHomestays } from "@/lib/api";
import { flashFromSearchParams, FlashSearchParams } from "@/lib/flash";
import { canAccess, getCurrentUser } from "@/lib/rbac";
import { createHomestayAction, createRoomAction, createServiceAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function OwnerManagePage({ searchParams }: { searchParams: Promise<FlashSearchParams> }) {
  const user = await getCurrentUser();
  const flash = flashFromSearchParams(await searchParams);
  const allowed = ["OWNER", "ADMIN"] as const;

  if (user.authorizationError) {
    return <AccessDenied description={user.authorizationError} />;
  }

  if (!canAccess(user.role, [...allowed])) {
    return <AccessDenied description="Trang quản lý homestay chỉ dành cho Owner hoặc Admin." />;
  }

  const homestays = await getOwnerHomestays(user.role === "ADMIN" ? "ADMIN" : "OWNER");
  const firstHomestay = homestays[0];

  return (
    <OwnerShell title="Quản lý homestay, phòng, giá và dịch vụ" description="Tạo homestay, thêm phòng, cập nhật dịch vụ đi kèm, hình ảnh và giá theo ngày. Các thao tác ngừng bán chỉ đổi trạng thái, không xóa dữ liệu." flash={flash}>
      <section className="grid gap-6 xl:grid-cols-3">
        <form action={createHomestayAction} className="card p-6">
          <p className="eyebrow">Homestay</p>
          <h2 className="mt-2 font-heading text-2xl text-[#9a4029]">Thêm homestay</h2>
          <div className="mt-4 grid gap-3">
            <input className="field" name="name" placeholder="Tên homestay" required />
            <select className="field" name="type" defaultValue="Phòng">
              <option>Phòng</option>
              <option>Lều</option>
              <option>Nhà nguyên căn</option>
            </select>
            <input className="field" name="location" placeholder="Vị trí" required />
            <textarea className="field min-h-24" name="description" placeholder="Mô tả" required />
            <input className="field" name="priceFrom" type="number" min="0" placeholder="Giá từ" required />
            <input className="field" name="capacity" type="number" min="1" placeholder="Sức chứa" required />
            <input className="field" name="imageUrl" type="url" placeholder="URL hình ảnh chính" required />
            <ActionButton pendingLabel="Đang tạo...">Tạo homestay</ActionButton>
          </div>
        </form>

        <form action={createRoomAction} className="card p-6">
          <p className="eyebrow">Phòng</p>
          <h2 className="mt-2 font-heading text-2xl text-[#9a4029]">Thêm phòng</h2>
          <div className="mt-4 grid gap-3">
            <select className="field" name="homestayId" defaultValue={firstHomestay?.id} required>
              {homestays.map((homestay) => <option key={homestay.id} value={homestay.id}>{homestay.name}</option>)}
            </select>
            <input className="field" name="name" placeholder="Tên phòng" required />
            <input className="field" name="roomType" placeholder="Loại phòng" required />
            <input className="field" name="pricePerNight" type="number" min="0" placeholder="Giá/đêm" required />
            <input className="field" name="capacity" type="number" min="1" placeholder="Sức chứa" required />
            <input className="field" name="totalUnits" type="number" min="1" placeholder="Số lượng phòng/căn" required />
            <ActionButton pendingLabel="Đang thêm..." disabled={!firstHomestay}>Thêm phòng</ActionButton>
          </div>
        </form>

        <form action={createServiceAction} className="card p-6">
          <p className="eyebrow">Dịch vụ</p>
          <h2 className="mt-2 font-heading text-2xl text-[#9a4029]">Thêm dịch vụ</h2>
          <div className="mt-4 grid gap-3">
            <select className="field" name="homestayId" defaultValue={firstHomestay?.id} required>
              {homestays.map((homestay) => <option key={homestay.id} value={homestay.id}>{homestay.name}</option>)}
            </select>
            <input className="field" name="name" placeholder="Tên dịch vụ" required />
            <textarea className="field min-h-20" name="description" placeholder="Mô tả" />
            <input className="field" name="unitPrice" type="number" min="0" placeholder="Đơn giá" required />
            <label className="flex items-center gap-2 rounded-xl bg-[#fdf9f4] px-3 py-2 text-sm text-[#466550]"><input name="included" type="checkbox" /> Dịch vụ đã bao gồm</label>
            <ActionButton pendingLabel="Đang thêm..." disabled={!firstHomestay}>Thêm dịch vụ</ActionButton>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Tài sản đang quản lý</p>
            <h2 className="mt-2 font-heading text-3xl text-[#9a4029]">Danh sách homestay</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-[#75675f]">Ảnh, bảng giá theo ngày, trạng thái bán phòng và dịch vụ được chỉnh trong từng homestay bên dưới.</p>
        </div>
        <OwnerInventory homestays={homestays} />
      </section>
    </OwnerShell>
  );
}
