"use client";

import { useMemo, useState } from "react";
import { apiMutation } from "@/lib/api-client";
import { endpoints } from "@/lib/endpoints";
import { UserProfile, UserRole } from "@/lib/types";
import { Pill } from "./ui";

const roles: UserRole[] = ["CUSTOMER", "OWNER", "OWNER_STAFF", "STAFF", "ADMIN"];
const creatableRoles: UserRole[] = ["OWNER", "OWNER_STAFF", "STAFF"];

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function AdminUserManagement({ initialUsers }: { initialUsers: UserProfile[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [name, setName] = useState("Đối tác Homestay");
  const [email, setEmail] = useState("owner-new@homestay.vn");
  const [phone, setPhone] = useState("0901000099");
  const [role, setRole] = useState<UserRole>("OWNER");
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const createErrors = useMemo(() => {
    const errors: string[] = [];
    if (name.trim().length < 2) errors.push("Tên tài khoản phải có ít nhất 2 ký tự.");
    if (!validEmail(email)) errors.push("Email không hợp lệ.");
    if (!creatableRoles.includes(role)) errors.push("Admin chỉ tạo nhanh Owner, Owner Staff hoặc Staff tại màn hình này.");
    return errors;
  }, [name, email, role]);
  const canCreate = createErrors.length === 0 && !busy;

  async function runAction<T>(actionKey: string, fallback: () => T, request: () => Promise<T>, success: string): Promise<T> {
    setBusy(actionKey);
    try {
      const result = await request();
      setToast(success);
      return result;
    } catch {
      const result = fallback();
      setToast(`${success} (mock fallback)`);
      return result;
    } finally {
      setBusy(null);
      window.setTimeout(() => setToast(null), 2600);
    }
  }

  return (
    <section className="mt-6 card p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#466550]">Quản lý user & phân quyền</h2>
          <p className="mt-1 text-sm text-[#75675f]">Admin tạo tài khoản Owner/Staff/Owner Staff, đổi role và ban/unban user qua API admin.</p>
        </div>
        <Pill tone="clay">{users.length} users</Pill>
      </div>

      <form
        className="mt-5 grid gap-3 rounded-2xl bg-[#fdf9f4] p-4 md:grid-cols-[1fr_1fr_0.8fr_0.8fr_auto]"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!canCreate) return;
          const created = await runAction(
            "create-user",
            () => ({ id: `mock-${Date.now()}`, name, email, phone, role, banned: false }),
            () => apiMutation<UserProfile>(endpoints.admin.users, "POST", { name, email, phone, role }, "ADMIN"),
            "Tạo tài khoản thành công"
          );
          setUsers((current) => [created, ...current.filter((user) => user.email !== created.email)]);
        }}
      >
        <input className="field" value={name} onChange={(event) => setName(event.target.value)} aria-label="Tên tài khoản" />
        <input className="field" value={email} onChange={(event) => setEmail(event.target.value)} aria-label="Email tài khoản" />
        <input className="field" value={phone} onChange={(event) => setPhone(event.target.value)} aria-label="Số điện thoại" />
        <select className="field" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
          {creatableRoles.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <button className="btn-primary disabled:opacity-50" type="submit" disabled={!canCreate}>
          {busy === "create-user" ? "Đang tạo..." : "Tạo tài khoản"}
        </button>
        {createErrors.length > 0 && <p className="text-xs font-bold text-red-700 md:col-span-5">{createErrors.join(" ")}</p>}
      </form>

      <div className="mt-5 overflow-hidden rounded-2xl border border-[#eadfd3] bg-white">
        <div className="hidden grid-cols-[1.1fr_1fr_0.8fr_0.7fr_1.2fr] gap-3 bg-[#fdf9f4] p-4 text-xs font-bold uppercase tracking-wide text-[#75675f] md:grid">
          <span>User</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {users.map((user) => (
          <div key={user.id} className="grid gap-3 border-t border-[#eadfd3] p-4 text-sm md:grid-cols-[1.1fr_1fr_0.8fr_0.7fr_1.2fr] md:items-center">
            <div>
              <p className="font-bold">{user.name}</p>
              <p className="text-xs text-[#75675f] md:hidden">{user.email}</p>
            </div>
            <span className="hidden md:block">{user.email}</span>
            <select
              className="field py-2 text-xs"
              value={user.role}
              disabled={busy === `role-${user.id}`}
              onChange={async (event) => {
                const nextRole = event.target.value as UserRole;
                const updated = await runAction(
                  `role-${user.id}`,
                  () => ({ ...user, role: nextRole }),
                  () => apiMutation<UserProfile>(endpoints.admin.role(user.id), "POST", { role: nextRole }, "ADMIN"),
                  "Cập nhật role thành công"
                );
                setUsers((current) => current.map((item) => (item.id === user.id ? updated : item)));
              }}
            >
              {roles.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <Pill tone={user.banned ? "red" : "green"}>{user.banned ? "Bị khóa" : "Hoạt động"}</Pill>
            <div className="flex flex-wrap gap-2">
              <button
                className="btn-secondary"
                type="button"
                disabled={Boolean(busy)}
                onClick={async () => {
                  const updated = await runAction(
                    `${user.banned ? "unban" : "ban"}-${user.id}`,
                    () => ({ ...user, banned: !user.banned }),
                    () => apiMutation<UserProfile>(user.banned ? endpoints.admin.unban(user.id) : endpoints.admin.ban(user.id), "POST", undefined, "ADMIN"),
                    user.banned ? "Unban user thành công" : "Ban user thành công"
                  );
                  setUsers((current) => current.map((item) => (item.id === user.id ? updated : item)));
                }}
              >
                {busy === `ban-${user.id}` || busy === `unban-${user.id}` ? "Đang xử lý..." : user.banned ? "Unban" : "Ban"}
              </button>
            </div>
          </div>
        ))}
      </div>
      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-2xl bg-[#466550] px-4 py-3 text-sm font-bold text-white shadow-lg">{toast}</div>}
    </section>
  );
}
