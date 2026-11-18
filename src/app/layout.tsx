import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import { RevealObserver } from "@/components/motion";
import "./globals.css";

// Playfair Display ships a Vietnamese subset, so headings keep their diacritics in one typeface.
const heading = Playfair_Display({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], variable: "--font-playfair", display: "swap" });
const body = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], weight: ["300", "400", "500", "600", "700"], variable: "--font-bevietnam", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://tayninhhomestay.id.vn"),
  title: {
    default: "Homestay Tây Ninh – Nghỉ dưỡng giữa thiên nhiên",
    template: "%s · Homestay Tây Ninh"
  },
  description: "Tìm và đặt homestay, lều glamping, nhà nguyên căn tại Tây Ninh. Thanh toán VietQR qua ApiPay, theo dõi đơn theo thời gian thực.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Homestay Tây Ninh",
    images: ["/images/demo/tay-ninh-5.jpg"]
  }
};

export const viewport: Viewport = {
  themeColor: "#10261d"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${heading.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        {/* Marks JS as available so scroll-reveal content is only hidden when it can be revealed. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a className="skip-link" href="#main">Bỏ qua, đến nội dung chính</a>
        {children}
        <RevealObserver />
      </body>
    </html>
  );
}
