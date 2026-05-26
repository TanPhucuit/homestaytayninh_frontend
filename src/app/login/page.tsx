import Link from "next/link";

function errorMessage(error?: string) {
  if (error === "api_env") return "Chua cau hinh NEXT_PUBLIC_API_URL cho frontend nen khong the xac minh vai tro sau dang nhap.";
  if (error === "google_env") return "Chua cau hinh GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET cho Google OAuth.";
  if (error === "auth_required") return "Ban can dang nhap truoc khi thuc hien thao tac nay.";
  if (error === "oauth") return "Khong tao duoc phien dang nhap Google. Kiem tra OAuth Client va Redirect URI trong Google Cloud.";
  if (error === "callback") return "Google callback khong hop le hoac session khong duoc tao.";
  if (error === "role_lookup") return "Ban da xac thuc Google nhung he thong chua xac minh duoc quyen truy cap. Vui long dang nhap lai hoac lien he quan tri vien.";
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
        <h1 className="mt-3 font-heading text-5xl text-[#9a4029]">Dang nhap he thong</h1>
        <p className="mt-3 text-sm leading-6 text-[#75675f]">
          Dang nhap bang Google de dat phong, xem lich su booking va truy cap portal theo vai tro da duoc cap trong Redis profile.
        </p>

        {message && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {message}
          </div>
        )}

        <a className="btn-primary mt-7 w-full" href={googleLoginHref}>
          Dang nhap voi Google
        </a>
        <Link className="btn-secondary mt-3 w-full" href="/">
          Quay ve trang chu
        </Link>

        <p className="mt-6 text-xs leading-5 text-[#89726c]">
          Email 23521197@gm.uit.edu.vn duoc Redis profile gan quyen Admin. Cac email khac mac dinh la Customer.
        </p>
      </section>
    </main>
  );
}
