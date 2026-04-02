import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/ui/navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Trainer Hub — AI가 당신의 사업을 매일 더 잘 이해합니다",
  description:
    "OK만 누르세요. 나머지는 AI가 알아서 합니다. 온보딩 3분이면 AI 에이전트가 콘텐츠, 마케팅, 고객 응대까지 자동으로 처리합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-geist-sans)]">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
