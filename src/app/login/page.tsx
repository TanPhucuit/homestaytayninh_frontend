import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, ChevronDown, Leaf, ShieldCheck } from "lucide-react";

const demoAccounts = [
  { role: "Customer", email: "demo@gmail.com", note: "Đặt phòng và theo dõi booking" },
  { role: "Owner", email: "ownerdemo@gmail.com", note: "Quản lý homestay, phòng, dịch vụ" },
  { role: "Owner Staff", email: "ownerstaff.demo@homestay.local", note: "Vận hành booking, đặt hộ khách" },
  { role: "Staff", email: "staff.demo@homestay.local", note: "CMS nội dung, kiểm soát người dùng" },
  { role: "Admin", email: "admindemo@gmail.com", note: "Thống kê, tài khoản, phân quyền" }
];

function errorMessage(error?: string) {
  if (error === "api_env") return "Hệ thống đăng nhập chưa sẵn sàng. Vui lòng thử lại sau.";
  if (error === "google_env") return "Đăng nhập Google chưa sẵn sàng. Vui lòng thử cách khác.";
  if (error === "auth_required") return "Bạn cần đăng nhập trước khi thực hiện thao tác này.";
  if (error === "oauth") return "Không tạo được phiên đăng nhập Google. Vui lòng thử lại.";
  if (error === "google_access_denied") return "Google chưa cho phép tài khoản này đăng nhập vào ứng dụng. Nếu ứng dụng đang ở chế độ thử nghiệm, hãy thêm email này vào danh sách test users hoặc chuyển OAuth consent screen sang production.";
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

  // Demo accounts share a public password; never advertise them on production.
  const showDemoLogin = process.env.SHOW_DEMO_LOGIN === "true" || process.env.NODE_ENV !== "production";

  return (
    <main id="main" className="grid min-h-screen bg-cream text-ink lg:grid-cols-[1.05fr_1fr]">
      <section className="relative isolate hidden overflow-hidden bg-forest text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative static image */}
        <img alt="" aria-hidden="true" className="ken-burns absolute inset-0 -z-20 size-full object-cover" src="/images/demo/tay-ninh-5.jpg" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest via-forest/50 to-forest/20" aria-hidden="true" />
        <Link className="flex items-center gap-3" href="/">
          <span className="grid size-11 place-items-center rounded-full bg-brand shadow-cta" aria-hidden="true"><Leaf className="size-5" /></span>
          <span className="font-heading text-2xl">Terra <span className="italic text-gold">&amp;</span> Leaf</span>
        </Link>
        <div className="max-w-md">
          <p className="eyebrow eyebrow-light">Homestay Tây Ninh</p>
          <blockquote className="display mt-5 text-4xl xl:text-5xl">“Một buổi sáng yên bình dưới chân núi Bà Đen là đủ để <span className="italic text-gold">nạp lại năng lượng</span>.”</blockquote>
          <p className="mt-6 flex items-center gap-2 text-sm text-white/70"><ShieldCheck className="size-4 text-gold" aria-hidden="true" /> Đăng nhập an toàn qua Google, phiên được mã hóa</p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-12 md:px-10">
        <div className="animate-fade-up w-full max-w-md">
          <Link className="mb-10 flex items-center gap-3 lg:hidden" href="/">
            <span className="grid size-10 place-items-center rounded-full bg-brand text-white" aria-hidden="true"><Leaf className="size-5" /></span>
            <span className="font-heading text-xl">Terra <span className="italic text-gold">&amp;</span> Leaf</span>
          </Link>
          <p className="eyebrow">Chào mừng trở lại</p>
          <h1 className="display mt-4 text-4xl md:text-5xl">Đăng nhập hệ thống</h1>
          <p className="mt-4 text-base leading-7 text-muted">
            Truy cập đặt phòng, lịch sử booking và khu vực làm việc theo vai trò đã được cấp.
          </p>

          {message && (
            <div className="mt-6 flex gap-3 rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm font-medium text-danger" role="alert">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {message}
            </div>
          )}

          <a className="btn-secondary mt-8 w-full min-h-12" href={googleLoginHref}>
            <GoogleMark />
            Đăng nhập với Google
          </a>

          {showDemoLogin && (
            <>
              <div className="my-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-subtle">
                <span className="h-px flex-1 bg-line" />
                hoặc dùng tài khoản demo
                <span className="h-px flex-1 bg-line" />
              </div>

              <form action="/auth/login/password" className="grid gap-4" method="post">
                <input type="hidden" name="next" value={next} />
                <label className="grid gap-2 text-sm font-medium text-ink-soft">
                  Email
                  <input className="field" name="email" type="email" defaultValue="demo@gmail.com" autoComplete="email" required />
                </label>
                <label className="grid gap-2 text-sm font-medium text-ink-soft">
                  Mật khẩu
                  <input className="field" name="password" type="password" defaultValue="demo123" autoComplete="current-password" required />
                </label>
                <button className="btn-primary mt-1 w-full min-h-12" type="submit">Đăng nhập demo <ArrowRight className="size-4" aria-hidden="true" /></button>
              </form>

              <details className="group mt-5 rounded-2xl border border-line-soft bg-white text-xs leading-5 text-muted">
                <summary className="flex list-none items-center justify-between px-4 py-3 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
                  Tài khoản demo (mật khẩu chung: demo123)
                  <ChevronDown className="size-4 transition group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="grid gap-2 px-4 pb-4">
                  {demoAccounts.map((account) => (
                    <div className="rounded-xl bg-cream px-3 py-2" key={account.role}>
                      <p className="font-semibold text-brand">{account.role}</p>
                      <p><strong>{account.email}</strong></p>
                      <p>{account.note}</p>
                    </div>
                  ))}
                  <p className="mt-1">
                    Có thể nhập nhanh <strong>ownerstaffdemo</strong> hoặc <strong>staffdemo</strong>, hệ thống sẽ tự đổi sang email demo đúng.
                  </p>
                </div>
              </details>
            </>
          )}

          <Link className="btn-ghost mt-6 w-full" href="/">
            <ArrowLeft className="size-4" aria-hidden="true" /> Quay về trang chủ
          </Link>
        </div>
      </section>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
