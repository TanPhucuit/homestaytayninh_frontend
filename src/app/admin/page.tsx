import { AccessDenied } from "@/components/access-denied";
import { AdminUserManagement } from "@/components/admin-user-management";
import { AdminShell, MetricCard, Pill } from "@/components/ui";
import { getDashboard, getUsers, getViolationReports, money } from "@/lib/api";
import { canAccess, getCurrentUser } from "@/lib/rbac";

export default async function AdminPage() {
  const user = await getCurrentUser();
  const allowed = ["ADMIN"] as const;

  if (!canAccess(user.role, [...allowed])) {
    return <AccessDenied role={user.role} allowed={[...allowed]} />;
  }

  const [dashboard, users, reports] = await Promise.all([getDashboard(), getUsers(), getViolationReports("ADMIN")]);
  const roleCounts = users.reduce<Record<string, number>>((acc, item) => {
    acc[item.role] = (acc[item.role] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AdminShell active="Reports" title="Dashboard quản trị hệ thống" role={user.role}>
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Doanh thu" value={money(dashboard.revenue)} note="Tổng doanh thu demo" />
        <MetricCard label="Booking" value={`${dashboard.transactions}`} note="Tổng giao dịch" />
        <MetricCard label="Lấp đầy" value={`${dashboard.occupancyRate}%`} note="Occupancy rate" />
        <MetricCard label="Hoàn tất" value={`${dashboard.completed}`} note="Completed booking" />
        <MetricCard label="Người dùng" value={`${users.length}`} note="Theo API admin/users" />
      </div>

      <AdminUserManagement initialUsers={users} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="card p-5">
          <h2 className="text-2xl font-bold text-[#466550]">Hiệu suất homestay</h2>
          <div className="mt-4 space-y-3">
            {dashboard.homestayPerformance.map((item: { name: string; bookings: number }) => (
              <div key={item.name} className="rounded-2xl bg-white p-4">
                <div className="flex justify-between">
                  <span className="font-bold">{item.name}</span>
                  <span>{item.bookings} booking</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#466550]/10">
                  <div className="h-full rounded-full bg-[#9a4029]" style={{ width: `${Math.min(100, item.bookings * 12)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-2xl font-bold text-[#466550]">RBAC & báo cáo vận hành</h2>
          <div className="mt-4 space-y-3 text-sm">
            {["CUSTOMER", "OWNER", "OWNER_STAFF", "STAFF", "ADMIN"].map((role) => (
              <div key={role} className="flex justify-between rounded-2xl bg-white p-4">
                <span className="font-bold">{role}</span>
                <Pill>{roleCounts[role] ?? 0} users</Pill>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-[#fdf9f4] p-4">
            <p className="font-bold text-[#466550]">Admin scope</p>
            <p className="mt-2 text-sm text-[#75675f]">Admin được thấy toàn bộ Owner, Staff, user, báo cáo doanh thu, giao dịch và hiệu suất homestay.</p>
          </div>
          <div className="mt-4 space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="rounded-2xl bg-white p-4 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{report.reason}</p>
                    <p className="mt-1 text-xs text-[#75675f]">Reporter {report.reporterId} · User {report.reportedUserId}</p>
                  </div>
                  <Pill tone={report.status === "OPEN" ? "clay" : "green"}>{report.status}</Pill>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
