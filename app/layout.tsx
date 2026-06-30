import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Nanum_Myeongjo } from "next/font/google";
import RegisterSW from "@/components/RegisterSW";
import "./globals.css";

// UI 서체 — 산세리프 (라벨·버튼·시간)
const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500"], // 굵기는 400/500 두 단계만
  variable: "--font-noto-sans",
  display: "swap",
});

// 미래의 나 목소리 — 명조(serif).
// "시스템 알림이 아니라 누군가의 목소리"라는 느낌을 만든다.
const myeongjo = Nanum_Myeongjo({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-myeongjo",
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
  themeColor: "#FAF4EA",
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
    <html lang="ko" className={`${notoSans.variable} ${myeongjo.variable}`}>
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
