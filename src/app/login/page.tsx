import Link from "next/link";

function errorMessage(error?: string) {
  if (error === "api_env") return "Chưa cấu hình máy chủ dữ liệu nên chưa thể đăng nhập.";
  if (error === "google_env") return "Chưa cấu hình Google OAuth.";
  if (error === "auth_required") return "Bạn cần đăng nhập trước khi thực hiện thao tác này.";
  if (error === "oauth") return "Không tạo được phiên đăng nhập Google. Vui lòng thử lại.";
  if (error === "callback") return "Google callback không hợp lệ hoặc phiên đăng nhập không được tạo.";
  if (error === "backend_oauth") return "Google đã xác thực thành công, nhưng hệ thống chưa xác minh được tài khoản.";
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
    <main className="flex min-h-screen items-center justify-center px-4 py-10 text-[#2b211d]">
      <section className="w-full max-w-xl rounded-2xl border border-[#dcc0ba] bg-white p-8 shadow-[0_30px_90px_rgba(123,41,20,0.12)]">
        <div className="text-center">
          <p className="eyebrow">Terra & Leaf</p>
          <h1 className="mt-3 font-heading text-5xl text-[#9a4029]">Đăng nhập hệ thống</h1>
          <p className="mt-3 text-sm leading-6 text-[#75675f]">
            Đăng nhập để đặt phòng, xem lịch sử booking và truy cập portal theo vai trò đã được cấp.
          </p>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {message}
          </div>
        )}

        <form action="/auth/login/password" className="mt-7 grid gap-3" method="post">
          <input type="hidden" name="next" value={next} />
          <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
            Email
            <input className="field" name="email" type="email" defaultValue="demo@gmail.com" autoComplete="email" required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
            Mật khẩu
            <input className="field" name="password" type="password" defaultValue="demo123" autoComplete="current-password" required />
          </label>
          <button className="btn-primary w-full" type="submit">Đăng nhập bằng tài khoản</button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase text-[#89726c]">
          <span className="h-px flex-1 bg-[#dcc0ba]" />
          hoặc
          <span className="h-px flex-1 bg-[#dcc0ba]" />
        </div>

        <a className="btn-secondary w-full" href={googleLoginHref}>
          Đăng nhập với Google
        </a>
        <Link className="btn-secondary mt-3 w-full" href="/">
          Quay về trang chủ
        </Link>

        <p className="mt-6 text-center text-xs leading-5 text-[#89726c]">
          Tài khoản demo: demo@gmail.com / demo123
        </p>
      </section>
    </main>
  );
}
