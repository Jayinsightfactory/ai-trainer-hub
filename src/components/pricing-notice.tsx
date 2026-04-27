"use client";

import Link from "next/link";

interface PricingNoticeProps {
  variant?: "banner" | "card" | "inline";
  showInstallCta?: boolean;
  className?: string;
}

/**
 * 로컬 도구 vs API 사용 요금 명시 컴포넌트
 * template 페이지, learn 페이지, credits 페이지 등에 삽입
 */
export function PricingNotice({
  variant = "banner",
  showInstallCta = true,
  className = "",
}: PricingNoticeProps) {
  if (variant === "inline") {
    return (
      <div className={`flex flex-wrap gap-3 text-xs ${className}`}>
        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          로컬 실행 — 별도 요금 없음
        </span>
        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
          API 사용 — 토큰 크레딧 차감
        </span>
        {showInstallCta && (
          <Link
            href="/install"
            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            로컬 설치 출장 신청 →
          </Link>
        )}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`bg-white border border-gray-100 rounded-xl p-5 ${className}`}>
        <p className="text-sm font-semibold text-gray-800 mb-3">요금 안내</p>
        <div className="space-y-2.5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
            <div>
              <p className="text-sm font-medium text-gray-800">로컬 도구 사용</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Ollama, LLaMA Factory 등 내 PC·서버에서 직접 실행<br />
                <span className="text-green-600 font-medium">토큰 크레딧 소모 없음</span>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0">₩</span>
            <div>
              <p className="text-sm font-medium text-gray-800">API 경유 사용</p>
              <p className="text-xs text-gray-400 mt-0.5">
                플랫폼 프록시를 통해 Anthropic/OpenAI API 호출<br />
                <span className="text-amber-600 font-medium">토큰 크레딧 차감</span>{" "}
                (Haiku ≈ ₩1.6/회)
              </p>
            </div>
          </div>
        </div>
        {showInstallCta && (
          <Link
            href="/install"
            className="mt-4 flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <span>로컬 환경 설치가 어려우신가요?</span>
            <span className="text-xs bg-indigo-600 text-white rounded-md px-2 py-1">출장 설치 신청</span>
          </Link>
        )}
      </div>
    );
  }

  // banner variant (default)
  return (
    <div className={`bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl p-5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 로컬 */}
          <div className="flex items-start gap-3 bg-white/5 rounded-lg px-4 py-3">
            <span className="text-xl mt-0.5">💻</span>
            <div>
              <p className="text-sm font-semibold text-white">로컬 도구 사용</p>
              <p className="text-xs text-slate-300 mt-0.5">
                내 PC · 서버에서 직접 실행
              </p>
              <p className="text-xs font-bold text-green-400 mt-1">
                별도 요금 없음
              </p>
            </div>
          </div>
          {/* API */}
          <div className="flex items-start gap-3 bg-white/5 rounded-lg px-4 py-3">
            <span className="text-xl mt-0.5">☁️</span>
            <div>
              <p className="text-sm font-semibold text-white">API 경유 사용</p>
              <p className="text-xs text-slate-300 mt-0.5">
                플랫폼 프록시로 AI API 호출
              </p>
              <p className="text-xs font-bold text-amber-400 mt-1">
                토큰 크레딧 차감
              </p>
            </div>
          </div>
        </div>
        {showInstallCta && (
          <Link
            href="/install"
            className="flex-shrink-0 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors text-center whitespace-nowrap"
          >
            출장 설치 신청 →
          </Link>
        )}
      </div>
    </div>
  );
}
