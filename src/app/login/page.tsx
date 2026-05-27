import Link from "next/link";

function errorMessage(error?: string) {
  if (error === "api_env") return "Hệ thống đăng nhập chưa sẵn sàng. Vui lòng thử lại sau.";
  if (error === "google_env") return "Đăng nhập Google chưa sẵn sàng. Vui lòng thử cách khác.";
  if (error === "auth_required") return "Bạn cần đăng nhập trước khi thực hiện thao tác này.";
  if (error === "oauth") return "Không tạo được phiên đăng nhập Google. Vui lòng thử lại.";
  if (error === "callback") return "Phiên đăng nhập Google không hợp lệ hoặc chưa được tạo.";
  if (error === "google_verify") return "Google đã xác thực thành công, nhưng hệ thống chưa xác minh được tài khoản.";
  if (error === "role_lookup") return "Hệ thống chưa xác minh được quyền truy cập. Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.";
  if (error === "password_required") return "Vui lòng nhập email và mật khẩu.";
  if (error === "password_login") return "Email hoặc mật khẩu không đúng.";
  return "";
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const message = errorMessage(params.error);
  const next = typeof params.next === "string" && params.next.startsWith("/") && !params.next.startsWith("//") ? params.next : "/";
  const googleLoginHref = next !== "/" ? `/auth/login/google?next=${encodeURIComponent(next)}` : "/auth/login/google";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 text-[#2b211d]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85)" }}
      />
      <div className="absolute inset-0 bg-[#1c1c19]/38" />
      <section className="relative w-full max-w-xl rounded-2xl border border-white/40 bg-[#fdf9f4]/94 p-7 shadow-[0_30px_90px_rgba(0,0,0,0.22)] backdrop-blur md:p-8">
        <div className="text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#e8f0eb] font-heading text-2xl font-bold text-[#466550]">T</div>
          <p className="eyebrow mt-5">Terra & Leaf</p>
          <h1 className="mt-3 font-heading text-4xl text-[#9a4029] md:text-5xl">Đăng nhập hệ thống</h1>
          <p className="mt-3 text-sm leading-6 text-[#75675f]">
            Truy cập đặt phòng, lịch sử booking và khu vực làm việc theo vai trò đã được cấp.
          </p>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {message}
          </div>
        )}

        <a className="btn-secondary mt-7 w-full bg-white" href={googleLoginHref}>
          Đăng nhập với Google
        </a>

        <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase text-[#89726c]">
          <span className="h-px flex-1 bg-[#dcc0ba]" />
          hoặc dùng tài khoản demo
          <span className="h-px flex-1 bg-[#dcc0ba]" />
        </div>

        <form action="/auth/login/password" className="grid gap-3" method="post">
          <input type="hidden" name="next" value={next} />
          <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
            Email
            <input className="field" name="email" type="email" defaultValue="demo@gmail.com" autoComplete="email" required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
            Mật khẩu
            <input className="field" name="password" type="password" defaultValue="demo123" autoComplete="current-password" required />
          </label>
          <button className="btn-primary w-full" type="submit">Đăng nhập demo</button>
        </form>

        <div className="mt-5 rounded-2xl bg-white/78 px-4 py-3 text-center text-xs leading-5 text-[#75675f]">
          Tài khoản demo: <strong>demo@gmail.com</strong> / <strong>demo123</strong>
        </div>
        <Link className="btn-secondary mt-3 w-full bg-white" href="/">
          Quay về trang chủ
        </Link>
      </section>
    </main>
  );
}
