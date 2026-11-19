import Link from "next/link";
import { ArrowLeft, Leaf, LifeBuoy, LockKeyhole } from "lucide-react";

export function AccessDenied({ description = "Bạn cần đăng nhập đúng vai trò để truy cập khu vực này." }: { description?: string }) {
  return (
    <main id="main" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-4 py-14 text-ink">
      <div className="pointer-events-none absolute -right-32 -top-32 size-[30rem] rounded-full bg-brand-tint/60 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 size-[28rem] rounded-full bg-leaf-soft blur-3xl" aria-hidden="true" />
      <section className="animate-fade-up relative w-full max-w-2xl rounded-[32px] border border-line-soft bg-white p-8 text-center shadow-lift md:p-12">
        <Link className="mx-auto mb-8 flex w-fit items-center gap-2 font-heading text-lg text-ink" href="/">
          <Leaf className="size-4 text-brand" aria-hidden="true" /> Homestay <span className="italic text-brand">Tây Ninh</span>
        </Link>
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-bark text-gold shadow-lift" aria-hidden="true">
          <LockKeyhole className="size-9" />
        </div>
        <p className="eyebrow mt-8 justify-center">Thông báo truy cập</p>
        <h1 className="display mt-4 text-4xl text-ink md:text-5xl">Không có quyền truy cập</h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-muted">{description}</p>
        <div className="mx-auto mt-7 flex max-w-md gap-3 rounded-2xl bg-cream p-5 text-left text-sm text-ink-muted">
          <LifeBuoy className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden="true" />
          <div>
            <p className="font-semibold text-ink">Cần hỗ trợ?</p>
            <p className="mt-1">Đăng nhập lại bằng tài khoản đã được phân quyền hoặc liên hệ Admin để kiểm tra role.</p>
          </div>
        </div>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="btn-primary" href="/login">Đăng nhập đúng vai trò</Link>
          <Link className="btn-secondary" href="/"><ArrowLeft className="size-4" aria-hidden="true" /> Về trang chủ</Link>
        </div>
      </section>
    </main>
  );
}
