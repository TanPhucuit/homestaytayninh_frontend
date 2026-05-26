import { AccessDenied } from "@/components/access-denied";
import { ToastActionButton } from "@/components/toast-action";
import { HomestayValidationForm, RoomValidationForm, ServiceValidationForm } from "@/components/validated-forms";
import { AdminShell, Pill } from "@/components/ui";
import { getHomestays, money } from "@/lib/api";
import { canAccess, getCurrentUser } from "@/lib/rbac";

export default async function OwnerManagePage() {
  const user = await getCurrentUser();
  const allowed = ["OWNER", "ADMIN"] as const;

  if (!canAccess(user.role, [...allowed])) {
    return <AccessDenied role={user.role} allowed={[...allowed]} />;
  }

  const allHomestays = await getHomestays();
  const homestays = user.role === "ADMIN" ? allHomestays : allHomestays.filter((item) => item.ownerId === "u-owner");
  const homestay = homestays[0];

  if (!homestay) {
    return (
      <AdminShell active="Homestay" title="Quản lý homestay, phòng và dịch vụ" role={user.role}>
        <section className="card p-8 text-center">
          <p className="eyebrow">Empty state</p>
          <h2 className="mt-2 text-3xl text-[#466550]">Chưa có homestay trong phạm vi quản lý</h2>
          <p className="mt-3 text-[#75675f]">Owner chỉ được thấy dữ liệu homestay thuộc tài khoản của mình.</p>
        </section>
      </AdminShell>
    );
  }

  return (
    <AdminShell active="Homestay" title="Quản lý homestay, phòng và dịch vụ" role={user.role}>
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="card p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-[#466550]">Thông tin homestay</h2>
            <Pill>Đang kinh doanh</Pill>
          </div>
          <div className="mt-5 grid gap-4">
            <HomestayValidationForm defaultName={homestay.name} defaultLocation={homestay.location} defaultType={homestay.type} />
            <div className="rounded-2xl border border-dashed border-[#9a4029]/35 bg-[#fdf9f4] p-8 text-center text-[#75675f]">
              Upload gallery ảnh homestay, phòng, tiện ích và khu vực xung quanh.
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="table-card">
            <div className="flex flex-col gap-3 border-b border-[#eadfd3] p-5 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-[#466550]">Phòng</h2>
              <ToastActionButton className="btn-secondary w-full sm:w-auto" message="Tạo phòng demo thành công">
                Thêm phòng
              </ToastActionButton>
            </div>
            <div className="hidden grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] gap-2 bg-[#fdf9f4] p-4 text-xs font-bold uppercase tracking-wide text-[#75675f] md:grid">
              <span>Tên phòng</span>
              <span>Sức chứa</span>
              <span>Giá đêm</span>
              <span>Trạng thái</span>
            </div>
            {homestay.rooms.map((room) => (
              <div key={room.id} className="grid gap-2 border-t border-[#eadfd3] p-4 text-sm md:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr]">
                <strong>{room.name}</strong>
                <span>
                  <span className="font-bold text-[#75675f] md:hidden">Sức chứa: </span>
                  {room.capacity} khách
                </span>
                <span>
                  <span className="font-bold text-[#75675f] md:hidden">Giá đêm: </span>
                  {money(room.pricePerNight)}
                </span>
                <Pill>{room.active ? "Active" : "Inactive"}</Pill>
              </div>
            ))}
          </div>
          <RoomValidationForm />

          <div className="table-card">
            <div className="flex flex-col gap-3 border-b border-[#eadfd3] p-5 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-[#466550]">Dịch vụ</h2>
              <ToastActionButton className="btn-secondary w-full sm:w-auto" message="Tạo dịch vụ demo thành công">
                Thêm dịch vụ
              </ToastActionButton>
            </div>
            <div className="hidden grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr] gap-2 bg-[#fdf9f4] p-4 text-xs font-bold uppercase tracking-wide text-[#75675f] md:grid">
              <span>Tên dịch vụ</span>
              <span>Loại</span>
              <span>Đơn giá</span>
              <span>Trạng thái</span>
            </div>
            {[...homestay.includedServices, ...homestay.services].map((service) => (
              <div key={service.id} className="grid gap-2 border-t border-[#eadfd3] p-4 text-sm md:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr]">
                <strong>{service.name}</strong>
                <span>
                  <span className="font-bold text-[#75675f] md:hidden">Loại: </span>
                  {service.included ? "Included" : "Add-on"}
                </span>
                <span>
                  <span className="font-bold text-[#75675f] md:hidden">Đơn giá: </span>
                  {money(service.unitPrice)}
                </span>
                <Pill>{service.active ? "Active" : "Inactive"}</Pill>
              </div>
            ))}
          </div>
          <ServiceValidationForm />
        </section>
      </div>
    </AdminShell>
  );
}
