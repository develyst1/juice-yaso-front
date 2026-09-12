import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { BrandHeader } from "@/shared/ui/BrandHeader";
import { theme } from "@/theme";
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
    <html lang="th" className={`${thai.variable} h-full`} suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <div style={{ maxWidth: 840, margin: "0 auto", padding: "0 16px 32px" }}>
            <BrandHeader />
            {children}
          </div>
        </MantineProvider>
      </body>
    </html>
  );
}
