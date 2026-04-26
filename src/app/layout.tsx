import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppShell from "@/components/shell/AppShell";
import SessionProviderWrapper from "@/components/shell/SessionProviderWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://www.nowlink.kr";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "나우링크 — 모든 사업장에 AI를 연결하다",
    template: "%s | 나우링크",
  },
  description:
    "업종별 AI 학습 템플릿으로 고객응대·품질검사·공정최적화를 4단계 위저드로 즉시 배포. 자영업자부터 기업까지 103개 템플릿 제공.",
  keywords: ["AI 학습", "자영업 AI", "고객응대 AI", "AI 챗봇", "나우링크", "nowlink"],
  authors: [{ name: "나우링크" }],
  creator: "나우링크",
  publisher: "나우링크",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: BASE_URL,
    siteName: "나우링크",
    title: "나우링크 — 모든 사업장에 AI를 연결하다",
    description:
      "업종별 AI 학습 템플릿으로 고객응대·품질검사·공정최적화를 4단계 위저드로 즉시 배포.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "나우링크 — AI 학습 운영 플랫폼",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "나우링크 — 모든 사업장에 AI를 연결하다",
    description:
      "업종별 AI 학습 템플릿으로 고객응대·품질검사·공정최적화를 4단계 위저드로 즉시 배포.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="h-[100dvh] overflow-hidden font-[family-name:var(--font-geist-sans)]">
        <SessionProviderWrapper>
          <AppShell>{children}</AppShell>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
