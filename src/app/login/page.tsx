import Link from "next/link";

function errorMessage(error?: string) {
  if (error === "supabase_env") return "Chưa cấu hình Supabase Auth public URL/key trên Vercel. Đây là cấu hình đăng nhập Google, không phải database secret.";
  if (error === "provider_disabled") return "Google provider chưa được bật trong Supabase Auth. Vào Supabase Dashboard > Authentication > Providers > Google để bật và nhập Client ID/Secret.";
  if (error === "auth_required") return "Bạn cần đăng nhập trước khi thực hiện thao tác này.";
  if (error === "oauth") return "Không tạo được phiên đăng nhập Google. Kiểm tra Google provider và Redirect URL trong Supabase.";
  if (error === "callback") return "Google callback không hợp lệ hoặc session không được tạo.";
  if (error === "role_lookup") return "Bạn đã xác thực Google nhưng hệ thống chưa xác minh được quyền truy cập. Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.";
  return "";
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const message = errorMessage(params.error);
  const next = typeof params.next === "string" && params.next.startsWith("/") && !params.next.startsWith("//") ? params.next : undefined;
  const googleLoginHref = next ? `/auth/login/google?next=${encodeURIComponent(next)}` : "/auth/login/google";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 text-[#2b211d]">
      <section className="w-full max-w-xl rounded-[32px] border border-[#dcc0ba] bg-white p-8 text-center shadow-[0_30px_90px_rgba(123,41,20,0.12)]">
        <p className="eyebrow">Terra & Leaf</p>
        <h1 className="mt-3 font-heading text-5xl text-[#9a4029]">Đăng nhập hệ thống</h1>
        <p className="mt-3 text-sm leading-6 text-[#75675f]">
          Đăng nhập bằng Google để đặt phòng, xem lịch sử booking và truy cập portal theo vai trò đã được cấp trong hệ thống.
        </p>

        {message && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {message}
          </div>
        )}

        <a className="btn-primary mt-7 w-full" href={googleLoginHref}>
          Đăng nhập với Google
        </a>
        <Link className="btn-secondary mt-3 w-full" href="/">
          Quay về trang chủ
        </Link>

        <p className="mt-6 text-xs leading-5 text-[#89726c]">
          Email 23521197@gm.uit.edu.vn được backend gán quyền Admin. Các email khác mặc định là Customer.
        </p>
      </section>
    </main>
  );
}
