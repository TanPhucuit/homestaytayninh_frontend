import type { Metadata } from "next";
import { Be_Vietnam_Pro, Libre_Caslon_Text } from "next/font/google";
import Link from "next/link";
import { getCurrentUser, navForRole } from "@/lib/rbac";
import "./globals.css";

const heading = Libre_Caslon_Text({ subsets: ["latin", "latin-ext"], weight: ["400", "700"], variable: "--font-heading" });
const body = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "700"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Homestay Tây Ninh",
  description: "Website đặt phòng homestay Tây Ninh MVP demo"
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  const nav = navForRole(user.role);

  return (
    <html lang="vi" className={`${heading.variable} ${body.variable}`}>
      <body>
        <header className="sticky top-0 z-20 border-b border-[#466550]/10 bg-[#fdf9f4]/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4">
            <Link href="/" className="text-xl font-bold text-[#466550]">
              Terra & Leaf
            </Link>
            <nav className="flex w-full gap-2 overflow-x-auto pb-1 text-sm sm:w-auto sm:pb-0">
              {nav.map((item) => (
                <Link key={`${item.href}-${item.label}`} href={item.href} className="shrink-0 rounded-full px-3 py-2 text-[#466550] hover:bg-white">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

