import type { Metadata } from "next";
import { Be_Vietnam_Pro, Libre_Caslon_Text } from "next/font/google";
import "react-datepicker/dist/react-datepicker.css";
import "./globals.css";

const heading = Libre_Caslon_Text({ subsets: ["latin", "latin-ext"], weight: ["400", "700"], variable: "--font-heading" });
const body = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "700"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Homestay Tây Ninh",
  description: "Website đặt phòng homestay Tây Ninh"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${heading.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
