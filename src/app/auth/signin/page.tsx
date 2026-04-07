"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { Bot, Shield, Zap, BarChart3 } from "lucide-react";

/* ── 실제 로그인 폼 ── */
function SignInForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  // 이미 로그인 된 경우 리다이렉트
  useEffect(() => {
    if (session) router.replace(callbackUrl);
  }, [session, callbackUrl, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* 카드 */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

          {/* 헤더 그라데이션 */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-center">
            <div className="flex items-center justify-center size-14 bg-white/20 rounded-2xl mx-auto mb-3">
              <Bot className="size-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">AI Trainer Hub</h1>
            <p className="text-indigo-200 text-sm mt-1">AI 학습 운영 플랫폼</p>
          </div>

          <div className="p-6 space-y-3">
            <p className="text-center text-sm text-gray-500 mb-4">소셜 계정으로 1초 로그인</p>

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 text-red-600 text-xs rounded-lg p-3 text-center mb-2">
                {error === "OAuthAccountNotLinked"
                  ? "이미 다른 방법으로 가입된 이메일입니다."
                  : error === "Configuration"
                    ? "로그인 설정 오류입니다. 관리자에게 문의하세요."
                    : "로그인 중 오류가 발생했습니다."}
              </div>
            )}

            {/* ── 카카오 (최우선) ── */}
            <button
              onClick={() => signIn("kakao", { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-[#3C1E1E] transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: "#FEE500" }}
            >
              {/* 카카오 공식 로고 */}
              <svg className="size-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3C6.477 3 2 6.477 2 10.8c0 2.709 1.617 5.094 4.065 6.552L5.1 20.682a.3.3 0 0 0 .45.312l4.213-2.812A10.968 10.968 0 0 0 12 18.6c5.523 0 10-3.477 10-7.8S17.523 3 12 3z"
                  fill="#3C1E1E"
                />
              </svg>
              카카오로 로그인
            </button>

            {/* ── 네이버 ── */}
            <button
              onClick={() => signIn("naver", { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: "#03C75A" }}
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="white">
                <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z" />
              </svg>
              네이버로 로그인
            </button>

            {/* ── 구분선 ── */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] text-gray-400">또는</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* ── 구글 ── */}
            <button
              onClick={() => signIn("google", { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all active:scale-[0.98]"
            >
              <svg className="size-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google로 로그인
            </button>
          </div>

          {/* 푸터 */}
          <div className="px-6 pb-6 text-center">
            <p className="text-[11px] text-gray-400">
              로그인 시{" "}
              <span className="underline cursor-pointer text-gray-500">이용약관</span>
              {" "}및{" "}
              <span className="underline cursor-pointer text-gray-500">개인정보처리방침</span>
              에 동의합니다
            </p>
          </div>
        </div>

        {/* 하단 기능 소개 */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: Bot, label: "AI 학습", desc: "업종별 템플릿" },
            { icon: BarChart3, label: "성과 분석", desc: "실시간 대시보드" },
            { icon: Zap, label: "즉시 배포", desc: "원클릭 적용" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white">
              <Icon className="size-5 text-indigo-500 mx-auto mb-1" />
              <p className="text-xs font-semibold text-gray-700">{label}</p>
              <p className="text-[10px] text-gray-400">{desc}</p>
            </div>
          ))}
        </div>

        {/* 보안 배지 */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          <Shield className="size-3.5 text-gray-400" />
          <span className="text-[11px] text-gray-400">SSL 암호화 · 개인정보 안전 보호</span>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
