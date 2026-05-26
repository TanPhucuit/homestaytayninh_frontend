import Link from "next/link";

function errorMessage(error?: string) {
  if (error === "supabase_env") return "Chưa cấu hình Supabase Auth public URL/key trên Vercel. Đây là cấu hình đăng nhập Google, không phải database secret.";
  if (error === "oauth") return "Không tạo được phiên đăng nhập Google. Kiểm tra Google provider và Redirect URL trong Supabase.";
  if (error === "callback") return "Google callback không hợp lệ hoặc session không được tạo.";
  return "";
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const message = errorMessage(params.error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fdf9f4] px-4 py-10 text-[#2b211d]">
      <section className="w-full max-w-xl rounded-3xl border border-[#eadfd3] bg-white p-8 text-center shadow-sm">
        <p className="eyebrow">Terra & Leaf</p>
        <h1 className="mt-3 text-4xl text-[#9a4029]">Đăng nhập hệ thống</h1>
        <p className="mt-3 text-sm leading-6 text-[#75675f]">
          Đăng nhập bằng Google để đặt phòng, xem lịch sử booking và truy cập portal theo vai trò đã được cấp trong hệ thống.
        </p>
        {message && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {message}
          </div>
        )}
        <Link className="btn-primary mt-6 w-full" href="/auth/login/google?next=%2Fhomestays">
          Đăng nhập với Google
        </Link>
        <Link className="btn-secondary mt-3 w-full" href="/">
          Quay về trang chủ
        </Link>
      </section>
    </main>
  );
}
