import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import RegisterSW from "@/components/RegisterSW";
import "./globals.css";

// 전체 서체 — 고딕(Noto Sans KR). 명조는 사용하지 않는다.
const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "미래의 나",
  description: "미래의 내가 오늘의 나를 설득한다.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "미래의 나",
  },
};

export const viewport: Viewport = {
  themeColor: "#F8F7F3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={notoSans.variable}>
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
