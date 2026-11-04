import { assignRoleInlineAction, banUserInlineAction, createAdminUserInlineAction, unbanUserInlineAction } from "@/app/admin/actions";
import { ActionButton } from "./action-button";
import { AppTopBar, PortalHero } from "./customer-ui";
import { ConfirmActionButton } from "./confirm-action-button";
import { FlashMessage } from "./feedback-state";
import { MutationForm } from "./mutation-form";
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
  { role: "ADMIN", title: "Quản trị viên", permissions: ["Bảng điều khiển toàn hệ thống", "Tạo tài khoản đối tác/nhân viên", "Phân quyền và khóa/mở tài khoản"] }
];

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-heading text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}

export function AdminPortal({ dashboard, users, currentUser, flash }: { dashboard: DashboardSummary; users: UserProfile[]; currentUser: SessionUser; flash?: FlashState | null }) {
  return (
    <>
    <AppTopBar />
    <main id="main" className="min-h-screen px-4 py-8 text-ink md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <PortalHero
          eyebrow="Khu vực quản trị"
          title="Quản trị Homestay Tây Ninh"
          description="Bảng tổng quan, quản lý tài khoản, phân quyền và kiểm soát trạng thái người dùng theo nghiệp vụ."
          meta={`${currentUser.name} · ${currentUser.email} · Quản trị viên`}
        />

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
              <h2 className="font-heading text-2xl text-brand">Phạm vi quyền theo vai trò</h2>
              <p className="mt-1 text-sm text-ink-muted">Đối chiếu nhanh giao diện và quyền nghiệp vụ đã khai báo trong hệ thống.</p>
            </div>
            <span className="badge bg-leaf-soft text-leaf">5 vai trò</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {permissionCards.map((card) => (
              <article className="rounded-2xl border border-line-soft bg-sand p-4" key={card.role}>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-leaf">{card.role}</p>
                <h3 className="mt-2 font-semibold text-brand">{card.title}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-5 text-ink-muted">
                  {card.permissions.map((permission) => <li key={permission}>• {permission}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card p-6">
            <h2 className="font-heading text-2xl text-brand">Hiệu suất homestay</h2>
            <div className="mt-5 space-y-3">
              {dashboard.homestayPerformance.map((item) => (
                <div className="flex items-center justify-between rounded-xl bg-sand px-4 py-3" key={item.name}>
                  <span className="font-medium">{item.name}</span>
                  <span className="rounded-full bg-leaf/10 px-3 py-1 text-sm text-leaf">{item.bookings} booking</span>
                </div>
              ))}
            </div>
          </div>

          <MutationForm action={createAdminUserInlineAction} className="card p-6" resetOnSuccess>
            <h2 className="font-heading text-2xl text-brand">Tạo tài khoản đối tác/nhân viên</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-ink-soft">
                Tên hiển thị
                <input className="field" name="name" placeholder="Ví dụ: Owner Demo" required />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-ink-soft">
                Email
                <input className="field" name="email" placeholder="owner@email.com" required type="email" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-ink-soft">
                Số điện thoại
                <input className="field" name="phone" pattern="[0-9+\\-\\s().]{8,20}" placeholder="0901234567" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-ink-soft">
                Vai trò
                <select className="field" name="role" defaultValue="OWNER">
                  {roles.filter((role) => role !== "CUSTOMER").map((role) => <option key={role}>{role}</option>)}
                </select>
              </label>
              <ActionButton className="btn-primary w-full md:col-span-2" pendingLabel="Đang tạo...">Tạo tài khoản</ActionButton>
            </div>
          </MutationForm>
        </section>

        <section className="card p-6">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <h2 className="font-heading text-2xl text-brand">Quản lý user và phân quyền</h2>
            <p className="text-sm text-leaf">Admin, Staff, Owner, Owner Staff, Customer</p>
          </div>
          <div className="mt-5 overflow-x-auto">
            <div className="sticky left-0 mb-3 w-fit rounded-full bg-leaf-soft px-4 py-2 text-xs font-bold text-leaf md:hidden">
              Vuốt ngang để xem đầy đủ phân quyền và hành động
            </div>
            <table className="w-full min-w-[860px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-leaf">
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
                {users.map((user) => {
                  const isCurrentUser = user.id === currentUser.id;

                  return (
                  <tr className="bg-sand" key={user.id}>
                    <td className="rounded-l-xl px-3 py-3 font-semibold">{user.name}</td>
                    <td className="px-3 py-3">{user.email}</td>
                    <td className="px-3 py-3">{user.role}</td>
                    <td className="px-3 py-3">{user.authLinked ? "Đã liên kết" : "Chờ đăng nhập Google"}</td>
                    <td className="px-3 py-3">{user.banned ? "Bị khóa" : "Hoạt động"}</td>
                    <td className="px-3 py-3">
                      {isCurrentUser ? (
                        <span className="rounded-lg bg-leaf-soft px-3 py-2 text-xs font-bold text-leaf">Tài khoản hiện tại</span>
                      ) : (
                        <MutationForm action={assignRoleInlineAction} className="flex gap-2">
                          <input name="userId" type="hidden" value={user.id} />
                          <select className="rounded-lg border border-line-soft px-2 py-2" name="role" defaultValue={user.role}>
                            {roles.map((role) => <option key={role}>{role}</option>)}
                          </select>
                          <ConfirmActionButton className="rounded-lg border border-leaf px-3 py-2 text-leaf" message="Xác nhận thay đổi vai trò? Người dùng sẽ thấy menu và quyền truy cập mới trong lần tải trang tiếp theo." pendingLabel="Đang lưu...">Lưu</ConfirmActionButton>
                        </MutationForm>
                      )}
                    </td>
                    <td className="rounded-r-xl px-3 py-3">
                      {isCurrentUser ? (
                        <span className="rounded-lg bg-sand-deep px-3 py-2 text-xs font-bold text-muted">Không thể tự khóa</span>
                      ) : (
                        <MutationForm action={user.banned ? unbanUserInlineAction : banUserInlineAction}>
                          <input name="userId" type="hidden" value={user.id} />
                          <ConfirmActionButton className="rounded-lg bg-brand px-3 py-2 text-white" message={user.banned ? "Mở khóa tài khoản này để người dùng có thể đăng nhập và thao tác lại?" : "Khóa tài khoản này? Người dùng sẽ không thể tiếp tục thao tác trong hệ thống."} pendingLabel="Đang xử lý...">
                            {user.banned ? "Mở khóa" : "Khóa"}
                          </ConfirmActionButton>
                        </MutationForm>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
    </>
  );
}
