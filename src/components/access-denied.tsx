import Link from "next/link";
import { UserRole } from "@/lib/types";

export function AccessDenied({ role, allowed }: { role: UserRole; allowed: UserRole[] }) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-12">
      <section className="card w-full p-8 text-center">
        <p className="eyebrow">Role guard</p>
        <h1 className="mt-3 text-4xl text-[#466550]">Bạn không có quyền truy cập màn hình này</h1>
        <p className="mt-4 text-[#75675f]">
          Role hiện tại là <strong>{role}</strong>. Màn hình này chỉ dành cho <strong>{allowed.join(", ")}</strong>.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/login" className="btn-primary">
            Đổi role demo
          </Link>
          <Link href="/" className="btn-secondary">
            Về trang chủ
          </Link>
        </div>
      </section>
    </main>
  );
}

