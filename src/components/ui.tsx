import { ReactNode } from "react";
import { UserRole } from "@/lib/types";

export function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 text-3xl leading-tight text-[#466550] sm:text-4xl md:text-6xl">{title}</h1>
      {description && <p className="mt-4 max-w-3xl text-base leading-7 text-[#75675f]">{description}</p>}
    </div>
  );
}

export function Pill({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "clay" | "sand" | "red" }) {
  const styles = {
    green: "bg-[#466550]/10 text-[#466550]",
    clay: "bg-[#9a4029]/10 text-[#9a4029]",
    sand: "bg-[#fdf9f4] text-[#75675f]",
    red: "bg-red-50 text-red-700"
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles[tone]}`}>{children}</span>;
}

export function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#75675f]">{label}</p>
      <p className="mt-3 text-2xl font-bold text-[#2b211d] sm:text-3xl">{value}</p>
      <p className="mt-2 text-sm font-medium text-[#466550]">{note}</p>
    </div>
  );
}

export function AdminShell({ active, title, role = "ADMIN", children }: { active: string; title: string; role?: UserRole; children: ReactNode }) {
  const items = [
    { label: "Dashboard", href: "/owner", roles: ["OWNER", "OWNER_STAFF", "ADMIN"] },
    { label: "Homestay", href: "/owner/manage", roles: ["OWNER", "ADMIN"] },
    { label: "Phòng", href: "/owner/manage", roles: ["OWNER", "ADMIN"] },
    { label: "Dịch vụ", href: "/owner/manage", roles: ["OWNER", "ADMIN"] },
    { label: "Booking", href: "/owner", roles: ["OWNER", "OWNER_STAFF", "ADMIN"] },
    { label: "Đặt hộ", href: "/owner", roles: ["OWNER_STAFF", "ADMIN"] },
    { label: "CMS", href: "/staff", roles: ["STAFF", "ADMIN"] },
    { label: "Users", href: "/staff", roles: ["STAFF", "ADMIN"] },
    { label: "Reports", href: "/admin", roles: ["ADMIN"] }
  ].filter((item) => item.roles.includes(role));

  return (
    <main className="min-h-screen bg-[#fdf9f4]">
      <div className="mx-auto max-w-[1440px] lg:grid lg:grid-cols-[248px_1fr]">
        <aside className="hidden min-h-screen bg-[#466550] px-5 py-7 text-white lg:block">
          <h2 className="text-2xl">Terra & Leaf</h2>
          <nav className="mt-10 space-y-2">
            {items.map((item) => (
              <a key={item.label} href={item.href} className={`block rounded-2xl px-4 py-3 text-sm ${item.label === active ? "bg-white/15 font-bold" : "text-white/78"}`}>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>
        <section className="px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          <div className="-mx-4 mb-6 border-b border-[#eadfd3] bg-[#466550] px-4 py-4 text-white sm:-mx-6 sm:px-6 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl">Terra & Leaf</h2>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{active}</span>
            </div>
            <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {items.map((item) => (
                <a key={item.label} href={item.href} className={`shrink-0 rounded-full px-3 py-2 text-xs ${item.label === active ? "bg-white text-[#466550] font-bold" : "bg-white/10 text-white"}`}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow">Terra & Leaf Operations</p>
              <h1 className="mt-2 text-3xl text-[#466550] sm:text-4xl">{title}</h1>
              <p className="mt-2 text-sm font-bold text-[#75675f]">Đang xem với role: {role}</p>
            </div>
            <button className="btn-primary w-full sm:w-auto" type="button">
              Lưu thay đổi
            </button>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}

