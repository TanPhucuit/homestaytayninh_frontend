import Link from "next/link";
import { banUserAction, createAdminUserAction, assignRoleAction, unbanUserAction } from "@/app/admin/actions";
import { money } from "@/lib/api";
import { DashboardSummary, UserProfile, UserRole } from "@/lib/types";

const roles: UserRole[] = ["CUSTOMER", "OWNER", "OWNER_STAFF", "STAFF", "ADMIN"];

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#eadfd4] bg-white p-5 shadow-sm">
      <p className="font-body text-sm text-[#466550]">{label}</p>
      <p className="mt-2 font-heading text-3xl text-[#9a4029]">{value}</p>
    </div>
  );
}

export function AdminPortal({ dashboard, users }: { dashboard: DashboardSummary; users: UserProfile[] }) {
  return (
    <main className="min-h-screen bg-[#fdf9f4] px-4 py-8 text-[#2f2926] md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col justify-between gap-4 rounded-2xl bg-[#466550] p-6 text-white md:flex-row md:items-center">
          <div>
            <p className="font-body text-sm uppercase tracking-[0.25em] text-white/70">Admin Portal</p>
            <h1 className="mt-2 font-heading text-4xl">Quản trị Homestay Tây Ninh</h1>
            <p className="mt-2 max-w-2xl font-body text-sm text-white/80">
              Dashboard tổng quan, quản lý tài khoản, phân quyền và kiểm soát trạng thái người dùng theo BA.
            </p>
          </div>
          <Link className="rounded-xl bg-[#fdf9f4] px-4 py-3 text-center font-body text-sm font-semibold text-[#9a4029]" href="/">
            Về trang chủ
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="Doanh thu đã thanh toán" value={money(dashboard.revenue)} />
          <StatCard label="Số giao dịch" value={String(dashboard.transactions)} />
          <StatCard label="Tỷ lệ lấp đầy" value={`${dashboard.occupancyRate}%`} />
          <StatCard label="Booking hoàn thành" value={String(dashboard.completed)} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-[#eadfd4] bg-white p-6 shadow-sm">
            <h2 className="font-heading text-2xl text-[#9a4029]">Hiệu suất homestay</h2>
            <div className="mt-5 space-y-3">
              {dashboard.homestayPerformance.map((item) => (
                <div className="flex items-center justify-between rounded-xl bg-[#fdf9f4] px-4 py-3" key={item.name}>
                  <span className="font-body font-medium">{item.name}</span>
                  <span className="rounded-full bg-[#466550]/10 px-3 py-1 font-body text-sm text-[#466550]">{item.bookings} booking</span>
                </div>
              ))}
            </div>
          </div>

          <form action={createAdminUserAction} className="rounded-2xl border border-[#eadfd4] bg-white p-6 shadow-sm">
            <h2 className="font-heading text-2xl text-[#9a4029]">Tạo tài khoản đối tác/nhân viên</h2>
            <div className="mt-5 grid gap-3">
              <input className="rounded-xl border border-[#eadfd4] px-4 py-3 font-body" name="name" placeholder="Tên hiển thị" required />
              <input className="rounded-xl border border-[#eadfd4] px-4 py-3 font-body" name="email" placeholder="Email" required type="email" />
              <input className="rounded-xl border border-[#eadfd4] px-4 py-3 font-body" name="phone" placeholder="Số điện thoại" />
              <select className="rounded-xl border border-[#eadfd4] px-4 py-3 font-body" name="role" defaultValue="OWNER">
                {roles.filter((role) => role !== "CUSTOMER").map((role) => <option key={role}>{role}</option>)}
              </select>
              <button className="rounded-xl bg-[#9a4029] px-4 py-3 font-body font-semibold text-white" type="submit">
                Tạo tài khoản
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-[#eadfd4] bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <h2 className="font-heading text-2xl text-[#9a4029]">Quản lý user và phân quyền</h2>
            <p className="font-body text-sm text-[#466550]">Admin, Staff, Owner, Owner Staff, Customer</p>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[860px] border-separate border-spacing-y-2 text-left font-body text-sm">
              <thead className="text-[#466550]">
                <tr>
                  <th className="px-3 py-2">Tên</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Role</th>
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
                    <td className="px-3 py-3">{user.banned ? "Bị khóa" : "Hoạt động"}</td>
                    <td className="px-3 py-3">
                      <form action={assignRoleAction} className="flex gap-2">
                        <input name="userId" type="hidden" value={user.id} />
                        <select className="rounded-lg border border-[#eadfd4] px-2 py-2" name="role" defaultValue={user.role}>
                          {roles.map((role) => <option key={role}>{role}</option>)}
                        </select>
                        <button className="rounded-lg border border-[#466550] px-3 py-2 text-[#466550]" type="submit">Lưu</button>
                      </form>
                    </td>
                    <td className="rounded-r-xl px-3 py-3">
                      <form action={user.banned ? unbanUserAction : banUserAction}>
                        <input name="userId" type="hidden" value={user.id} />
                        <button className="rounded-lg bg-[#9a4029] px-3 py-2 text-white" type="submit">
                          {user.banned ? "Unban" : "Ban"}
                        </button>
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
