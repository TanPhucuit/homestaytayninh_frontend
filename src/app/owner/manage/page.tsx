import { AccessDenied } from "@/components/access-denied";
import { ActionButton } from "@/components/action-button";
import { OwnerInventory, OwnerShell } from "@/components/owner-ui";
import { getOwnerHomestays, getUsers } from "@/lib/api";
import { flashFromSearchParams, FlashSearchParams } from "@/lib/flash";
import { canAccess, getCurrentUser } from "@/lib/rbac";
import { createHomestayAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function OwnerManagePage({ searchParams }: { searchParams: Promise<FlashSearchParams> }) {
  const user = await getCurrentUser();
  const flash = flashFromSearchParams(await searchParams);
  const allowed = ["OWNER", "ADMIN"] as const;

  if (user.authorizationError) return <AccessDenied description={user.authorizationError} />;
  if (!canAccess(user.role, [...allowed])) {
    return <AccessDenied description="Trang quản lý homestay chỉ dành cho Owner hoặc Admin." />;
  }

  const homestays = await getOwnerHomestays(user.role === "ADMIN" ? "ADMIN" : "OWNER");
  const ownerUsers = user.role === "ADMIN" ? (await getUsers("ADMIN")).filter((item) => item.role === "OWNER" && !item.banned) : [];

  return (
    <OwnerShell title="Quản lý homestay, phòng, giá và dịch vụ" description="Tạo homestay, thêm phòng, cập nhật dịch vụ đi kèm, hình ảnh và giá theo ngày. Các thao tác ngừng bán chỉ đổi trạng thái, không xóa dữ liệu." flash={flash}>
      <section>
        <form action={createHomestayAction} className="card p-6 md:p-8">
          <p className="eyebrow">Homestay</p>
          <h2 className="mt-2 font-heading text-2xl text-[#9a4029]">Thêm homestay</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#75675f]">
            Tạo hồ sơ homestay trước. Sau khi homestay xuất hiện trong danh sách bên dưới, mở từng homestay để thêm phòng, giá phòng cố định và dịch vụ.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
              Tên homestay
              <input className="field" name="name" placeholder="Ví dụ: Nhà vườn núi Bà Đen" required />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
              Loại hình
              <select className="field" name="type" defaultValue="Phòng">
                <option>Phòng</option>
                <option>Lều</option>
                <option>Nhà nguyên căn</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
              Vị trí
              <input className="field" name="location" placeholder="Ví dụ: Xã Thạnh Tân, Tây Ninh" required />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
              URL hình ảnh chính
              <input className="field" name="imageUrl" type="url" placeholder="https://..." required />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
              Giá khởi điểm tạm
              <input className="field" name="priceFrom" type="number" min="0" placeholder="Ví dụ: 470000" required />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
              Sức chứa tạm
              <input className="field" name="capacity" type="number" min="1" placeholder="Ví dụ: 4" required />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#3f3530] md:col-span-2">
              Mô tả
              <textarea className="field min-h-24" name="description" placeholder="Mô tả ngắn về không gian, vị trí và trải nghiệm lưu trú" required />
            </label>
            {user.role === "ADMIN" && (
              <label className="grid gap-2 text-sm font-semibold text-[#3f3530] md:col-span-2">
                Chủ homestay
                <select className="field" name="ownerId" required defaultValue={ownerUsers[0]?.id ?? ""}>
                  <option value="" disabled>Chọn chủ homestay</option>
                  {ownerUsers.map((owner) => <option key={owner.id} value={owner.id}>{owner.name} · {owner.email}</option>)}
                </select>
              </label>
            )}
            <div className="rounded-xl bg-[#fdf9f4] p-4 text-sm leading-6 text-[#75675f] md:col-span-2">
              Giá khởi điểm và sức chứa tạm chỉ dùng khi homestay chưa có phòng. Khi đã thêm phòng, hãy dùng nút đồng bộ trong từng homestay để lấy giá thấp nhất và tổng sức chứa từ phòng đang bán.
            </div>
            <ActionButton className="btn-primary w-full md:col-span-2" pendingLabel="Đang tạo...">Tạo homestay</ActionButton>
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
