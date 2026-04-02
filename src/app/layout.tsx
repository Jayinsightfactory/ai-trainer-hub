import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppShell from "@/components/shell/AppShell";
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
  title: "AI Trainer Hub — AI 학습 운영 플랫폼",
  description:
    "AI 에이전트 운영, 학습 템플릿 관리, 실시간 퍼포먼스 모니터링을 한 화면에서.",
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
      <body className="h-screen overflow-hidden font-[family-name:var(--font-geist-sans)]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
