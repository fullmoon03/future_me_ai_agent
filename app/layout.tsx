import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import RegisterSW from "@/components/RegisterSW";
import "./globals.css";

// 본문·제목·카드 — 읽기 좋은 명조(Noto Serif KR). 편지/저널 감성.
const notoSerif = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-noto-serif",
  display: "swap",
});

// 버튼·작은 UI 라벨 — 단정한 산세리프(Noto Sans KR).
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
  themeColor: "#FAFAFC",
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
    <html
      lang="ko"
      className={`${notoSerif.variable} ${notoSans.variable}`}
    >
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
