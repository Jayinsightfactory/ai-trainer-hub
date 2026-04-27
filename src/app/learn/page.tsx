"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Bot, Lock, LogIn } from "lucide-react";
import LearnWizard from "@/components/learn/LearnWizard";
import { PricingNotice } from "@/components/pricing-notice";

/* ── 로그인 유도 화면 ── */
function LoginRequired({ templateId }: { templateId: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <Image src="/images/empty-states/start-learning.svg" alt="" width={200} height={160} className="mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">
        AI 학습을 시작하려면 소셜 계정으로 로그인하세요.
        <br />학습 내역과 결과가 자동으로 저장됩니다.
      </p>
      <button
        onClick={() => router.push(`/auth/signin?callbackUrl=/learn?template=${templateId}`)}
        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        <LogIn className="size-4" />
        로그인하고 학습 시작하기
      </button>
      <button
        onClick={() => router.push("/templates")}
        className="mt-3 text-sm text-gray-400 hover:text-gray-600"
      >
        템플릿 둘러보기
      </button>
    </div>
  );
}

/* ── 실제 학습 콘텐츠 ── */
function LearnContent() {
  const params = useSearchParams();
  const { data: session, status } = useSession();
  const templateId = params.get("template") || "cafe_customer_service";

  // 로딩 중
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Bot className="size-10 text-indigo-400 animate-pulse" />
          <p className="text-sm text-gray-500">불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 비로그인 → 로그인 유도
  if (!session) {
    return <LoginRequired templateId={templateId} />;
  }

  // 로그인 → 위저드 표시
  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <PricingNotice variant="banner" showInstallCta />
      </div>
      <LearnWizard templateId={templateId} />
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Bot className="size-8 text-indigo-400 animate-pulse" />
      </div>
    }>
      <LearnContent />
    </Suspense>
  );
}
