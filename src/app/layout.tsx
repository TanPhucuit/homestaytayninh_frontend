import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import "./globals.css";

// Playfair Display ships a Vietnamese subset, so headings keep their diacritics in one typeface.
const heading = Playfair_Display({ subsets: ["latin", "vietnamese"], weight: ["500", "600", "700"], variable: "--font-playfair", display: "swap" });
const body = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700"], variable: "--font-bevietnam", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://tayninhhomestay.id.vn"),
  title: {
    default: "Terra & Leaf – Homestay Tây Ninh",
    template: "%s · Terra & Leaf"
  },
  description: "Tìm và đặt homestay, lều glamping, nhà nguyên căn tại Tây Ninh. Thanh toán VietQR qua ApiPay, theo dõi đơn theo thời gian thực.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Terra & Leaf – Homestay Tây Ninh",
    images: ["/images/demo/tay-ninh-5.jpg"]
  }
};

export const viewport: Viewport = {
  themeColor: "#fdf9f4"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${heading.variable} ${body.variable}`}>
      <body>
        <a className="skip-link" href="#main">Bỏ qua, đến nội dung chính</a>
        {children}
      </body>
    </html>
  );
}
