import Link from "next/link";

export function AccessDenied({ description = "Bạn cần đăng nhập đúng vai trò để truy cập khu vực này." }: { description?: string }) {
  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-sand px-4 py-10 text-ink">
      <section className="w-full max-w-2xl rounded-[32px] border border-line bg-white p-8 text-center shadow-card md:p-10">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-danger-soft text-3xl font-bold text-danger">!</div>
        <p className="eyebrow mt-7">Thông báo truy cập</p>
        <h1 className="mt-3 font-heading text-4xl text-brand md:text-5xl">Không có quyền truy cập</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted">{description}</p>
        <div className="mx-auto mt-6 max-w-md rounded-3xl bg-sand p-5 text-left text-sm text-ink-muted">
          <p className="font-bold text-leaf">Cần hỗ trợ?</p>
          <p className="mt-1">Đăng nhập lại bằng tài khoản đã được phân quyền hoặc liên hệ Admin để kiểm tra role.</p>
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="btn-primary" href="/login">Đăng nhập đúng vai trò</Link>
          <Link className="btn-secondary" href="/">Về trang chủ</Link>
        </div>
      </section>
    </main>
  );
}
