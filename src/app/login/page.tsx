import Link from "next/link";
import { LoginRegisterForm } from "@/components/validated-forms";
import { Pill, SectionHeading } from "@/components/ui";

const roles = [
  ["CUSTOMER", "/homestays", "Tìm kiếm, đặt phòng, theo dõi booking"],
  ["OWNER", "/owner", "Quản lý homestay, phòng, giá và dịch vụ"],
  ["OWNER_STAFF", "/owner", "Xác nhận booking, check-in/out, đặt hộ"],
  ["STAFF", "/staff", "CMS, kiểm duyệt nội dung và người dùng"],
  ["ADMIN", "/admin", "Phân quyền, báo cáo, quản trị hệ thống"]
];

export default function LoginPage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[0.85fr_1fr]">
      <section className="card p-8">
        <SectionHeading
          eyebrow="Supabase Auth"
          title="Đăng nhập hệ thống"
          description="Một luồng đăng nhập cho Customer, Owner, Owner Staff, Staff và Admin. Demo hiện dùng cookie role; khi nối Supabase Auth sẽ thay bằng session/JWT thật."
        />
        <div className="mt-8 grid gap-4">
          <button className="btn-primary w-full" type="button">
            Tiếp tục với Google
          </button>
          <LoginRegisterForm />
          <Link href="/auth/logout" className="btn-secondary text-center">
            Đăng xuất demo role
          </Link>
        </div>
      </section>
      <section className="rounded-2xl bg-[#466550] p-8 text-white">
        <h2 className="text-4xl">Điều hướng theo phân quyền</h2>
        <div className="mt-8 grid gap-4">
          {roles.map(([role, path, desc]) => (
            <Link key={role} href={`/auth/mock-login/${role}`} className="block rounded-2xl bg-white/92 p-5 text-[#2b211d] transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <Pill tone="clay">{role}</Pill>
                <span className="font-bold text-[#466550]">{path}</span>
              </div>
              <p className="mt-3 text-sm text-[#75675f]">{desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
