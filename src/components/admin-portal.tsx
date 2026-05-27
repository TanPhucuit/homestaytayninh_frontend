import { banUserAction, createAdminUserAction, assignRoleAction, unbanUserAction } from "@/app/admin/actions";
import { ActionButton } from "./action-button";
import { ConfirmActionButton } from "./confirm-action-button";
import { FlashMessage } from "./feedback-state";
import { money } from "@/lib/api";
import { FlashState } from "@/lib/flash";
import { SessionUser } from "@/lib/rbac";
import { DashboardSummary, UserProfile, UserRole } from "@/lib/types";

const roles: UserRole[] = ["CUSTOMER", "OWNER", "OWNER_STAFF", "STAFF", "ADMIN"];
const permissionCards: Array<{ role: UserRole; title: string; permissions: string[] }> = [
  { role: "CUSTOMER", title: "Khách hàng", permissions: ["Tìm kiếm và đặt phòng", "Đặt dịch vụ bổ sung", "Theo dõi thanh toán và lịch sử"] },
  { role: "OWNER", title: "Chủ homestay", permissions: ["Quản lý homestay và phòng", "Cập nhật giá, hình ảnh, dịch vụ"] },
  { role: "OWNER_STAFF", title: "Nhân viên homestay", permissions: ["Xử lý booking/check-in/out", "Đặt hộ và thêm dịch vụ in-stay"] },
  { role: "STAFF", title: "Vận hành hệ thống", permissions: ["CMS bài viết", "Xử lý báo cáo, ban/unban user"] },
  { role: "ADMIN", title: "Quản trị viên", permissions: ["Bảng điều khiển toàn hệ thống", "Tạo tài khoản và phân quyền", "Truy cập các khu vực nghiệp vụ"] }
];

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-semibold text-[#466550]">{label}</p>
      <p className="mt-2 font-heading text-3xl text-[#9a4029]">{value}</p>
    </div>
  );
}

export function AdminPortal({ dashboard, users, currentUser, flash }: { dashboard: DashboardSummary; users: UserProfile[]; currentUser: SessionUser; flash?: FlashState | null }) {
  return (
    <main className="min-h-screen px-4 py-8 text-[#2f2926] md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="stitch-panel bg-[#466550] p-6 text-white md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-white/70">Khu vực quản trị</p>
              <h1 className="mt-2 font-heading text-4xl">Quản trị Homestay Tây Ninh</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                Bảng tổng quan, quản lý tài khoản, phân quyền và kiểm soát trạng thái người dùng theo nghiệp vụ.
              </p>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <div className="rounded-xl bg-white/10 px-4 py-3 text-white">
                <p className="font-bold">{currentUser.name}</p>
                <p className="text-white/75">{currentUser.email} · ADMIN</p>
              </div>
              <a className="rounded-xl bg-[#fdf9f4] px-4 py-3 text-center font-semibold text-[#9a4029]" href="/auth/logout">
                Đăng xuất
              </a>
            </div>
          </div>
        </header>

        <nav className="grid gap-3 md:grid-cols-4">
          <a className="card border-2 border-[#9a4029] p-4 font-bold text-[#9a4029]" href="/admin">Tổng quan quản trị</a>
          <a className="card p-4 font-bold text-[#466550]" href="/owner">Vận hành booking</a>
          <a className="card p-4 font-bold text-[#466550]" href="/staff">CMS nội dung</a>
          <a className="card p-4 font-bold text-[#466550]" href="/staff/moderation">Báo cáo vi phạm</a>
        </nav>

        <FlashMessage flash={flash} />

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="Doanh thu đã thanh toán" value={money(dashboard.revenue)} />
          <StatCard label="Số giao dịch" value={String(dashboard.transactions)} />
          <StatCard label="Tỷ lệ lấp đầy" value={`${dashboard.occupancyRate}%`} />
          <StatCard label="Booking hoàn thành" value={String(dashboard.completed)} />
        </section>

        <section className="card p-6">
          <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
            <div>
              <h2 className="font-heading text-2xl text-[#9a4029]">Phạm vi quyền theo vai trò</h2>
              <p className="mt-1 text-sm text-[#56423d]">Đối chiếu nhanh giao diện và quyền nghiệp vụ đã khai báo trong hệ thống.</p>
            </div>
            <span className="badge bg-[#e8f0eb] text-[#466550]">5 vai trò</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {permissionCards.map((card) => (
              <article className="rounded-2xl border border-[#eadfd4] bg-[#fdf9f4] p-4" key={card.role}>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#466550]">{card.role}</p>
                <h3 className="mt-2 font-semibold text-[#9a4029]">{card.title}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-5 text-[#56423d]">
                  {card.permissions.map((permission) => <li key={permission}>• {permission}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card p-6">
            <h2 className="font-heading text-2xl text-[#9a4029]">Hiệu suất homestay</h2>
            <div className="mt-5 space-y-3">
              {dashboard.homestayPerformance.map((item) => (
                <div className="flex items-center justify-between rounded-xl bg-[#fdf9f4] px-4 py-3" key={item.name}>
                  <span className="font-medium">{item.name}</span>
                  <span className="rounded-full bg-[#466550]/10 px-3 py-1 text-sm text-[#466550]">{item.bookings} booking</span>
                </div>
              ))}
            </div>
          </div>

          <form action={createAdminUserAction} className="card p-6">
            <h2 className="font-heading text-2xl text-[#9a4029]">Tạo tài khoản đối tác/nhân viên</h2>
            <div className="mt-5 grid gap-3">
              <input className="field" name="name" placeholder="Tên hiển thị" required />
              <input className="field" name="email" placeholder="Email" required type="email" />
              <input className="field" name="phone" placeholder="Số điện thoại" />
              <select className="field" name="role" defaultValue="OWNER">
                {roles.filter((role) => role !== "CUSTOMER").map((role) => <option key={role}>{role}</option>)}
              </select>
              <ActionButton pendingLabel="Đang tạo...">Tạo tài khoản</ActionButton>
            </div>
          </form>
        </section>

        <section className="card p-6">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <h2 className="font-heading text-2xl text-[#9a4029]">Quản lý user và phân quyền</h2>
            <p className="text-sm text-[#466550]">Admin, Staff, Owner, Owner Staff, Customer</p>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[860px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-[#466550]">
                <tr>
                  <th className="px-3 py-2">Tên</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Vai trò</th>
                  <th className="px-3 py-2">Đăng nhập</th>
                  <th className="px-3 py-2">Trạng thái</th>
                  <th className="px-3 py-2">Phân quyền</th>
                  <th className="px-3 py-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr className="bg-[#fdf9f4]" key={user.id}>
                    <td className="rounded-l-xl px-3 py-3 font-semibold">{user.name}</td>
                    <td className="px-3 py-3">{user.email}</td>
                    <td className="px-3 py-3">{user.role}</td>
                    <td className="px-3 py-3">{user.authLinked ? "Đã liên kết" : "Chờ đăng nhập Google"}</td>
                    <td className="px-3 py-3">{user.banned ? "Bị khóa" : "Hoạt động"}</td>
                    <td className="px-3 py-3">
                      <form action={assignRoleAction} className="flex gap-2">
                        <input name="userId" type="hidden" value={user.id} />
                        <select className="rounded-lg border border-[#eadfd4] px-2 py-2" name="role" defaultValue={user.role}>
                          {roles.map((role) => <option key={role}>{role}</option>)}
                        </select>
                        <ConfirmActionButton className="rounded-lg border border-[#466550] px-3 py-2 text-[#466550]" message="Xác nhận thay đổi vai trò tài khoản này?" pendingLabel="Đang lưu...">Lưu</ConfirmActionButton>
                      </form>
                    </td>
                    <td className="rounded-r-xl px-3 py-3">
                      <form action={user.banned ? unbanUserAction : banUserAction}>
                        <input name="userId" type="hidden" value={user.id} />
                        <ConfirmActionButton className="rounded-lg bg-[#9a4029] px-3 py-2 text-white" message={user.banned ? "Mở khóa tài khoản này?" : "Khóa tài khoản này?"} pendingLabel="Đang xử lý...">
                          {user.banned ? "Mở khóa" : "Khóa"}
                        </ConfirmActionButton>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
