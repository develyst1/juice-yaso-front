import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const thai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Juice Yaso — สั่งน้ำเกร็ดหิมะ",
  description: "สั่งลังน้ำเกร็ดหิมะ รับที่ร้าน",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${thai.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-orange-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold text-orange-600">
              Juice Yaso
            </Link>
            <p className="text-sm text-orange-800/70">รับที่ร้าน · ไม่ต้อง login</p>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
