"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { CREDIT_PACKAGES, MODEL_PRICING } from "@/lib/token-broker";
import { PricingNotice } from "@/components/pricing-notice";

interface BalanceData {
  balance: number;
  balanceFormatted: string;
  monthlySpentKrw: number;
  estimatedCalls: Record<string, number>;
  recentUsages: Array<{
    id: string;
    feature: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    costKrw: number;
    createdAt: string;
  }>;
  recentPurchases: Array<{
    id: string;
    packageId: string;
    amount: number;
    credit: number;
    bonus: number;
    createdAt: string;
  }>;
}

const FEATURE_LABELS: Record<string, string> = {
  chat: "챗봇 대화",
  learn: "학습팩 생성",
  agent: "에이전트",
  rag: "RAG 검색",
};

function CreditsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const charged = searchParams.get("charged");
    if (statusParam === "success" && charged) {
      showToast(`₩${Number(charged).toLocaleString("ko-KR")} 크레딧이 충전되었습니다! 🎉`, "success");
    } else if (statusParam === "fail") {
      showToast("결제에 실패했습니다. 다시 시도해주세요.", "error");
    } else if (statusParam === "already") {
      showToast("이미 처리된 결제입니다.", "info");
    }
  }, [searchParams, showToast]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/tokens/balance")
      .then((r) => r.json())
      .then((d) => setBalanceData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  async function handlePurchase(packageId: string) {
    setPurchasing(packageId);
    try {
      const res = await fetch("/api/tokens/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "오류가 발생했습니다.", "error");
        return;
      }

      // Toss 결제창 SDK 호출 (script 태그로 로드된 경우)
      const toss = (window as Window & { TossPayments?: (key: string) => { requestPayment: (method: string, params: object) => Promise<void> } }).TossPayments;
      if (toss && data.tossParams?.clientKey) {
        const tossPayments = toss(data.tossParams.clientKey);
        await tossPayments.requestPayment("카드", {
          orderId: data.tossParams.orderId,
          orderName: data.tossParams.orderName,
          amount: data.tossParams.amount,
          successUrl: data.tossParams.successUrl,
          failUrl: data.tossParams.failUrl,
          customerName: session?.user?.name ?? "사용자",
          customerEmail: session?.user?.email ?? "",
        });
      } else {
        // SDK 미로드 시 시뮬레이션 안내
        showToast(
          `테스트 모드: 결제 완료 시 ₩${data.package.credit.toLocaleString("ko-KR")} 크레딧이 충전됩니다.`,
          "info"
        );
      }
    } catch (err) {
      if (err instanceof Error && err.message !== "Payment window closed") {
        showToast("결제 중 오류가 발생했습니다.", "error");
      }
    } finally {
      setPurchasing(null);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">로딩 중...</p>
        </div>
      </div>
    );
  }

  const packages = Object.values(CREDIT_PACKAGES);
  const models = Object.entries(MODEL_PRICING);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toss SDK */}
      <script src="https://js.tosspayments.com/v1/payment" async />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : toast.type === "error"
              ? "bg-red-500 text-white"
              : "bg-blue-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">토큰 크레딧</h1>
          <p className="text-sm text-gray-500 mt-1">
            직접 API 키 없이 크레딧으로 AI 기능을 바로 사용하세요
          </p>
        </div>

        {/* 요금 명시 배너 */}
        <PricingNotice variant="banner" showInstallCta className="mb-6" />

        {/* 잔액 카드 */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-sm font-medium mb-1">현재 크레딧 잔액</p>
              <p className="text-4xl font-bold">
                {balanceData?.balanceFormatted ?? "₩0"}
              </p>
              <p className="text-indigo-200 text-sm mt-2">
                이번 달 사용: ₩{(balanceData?.monthlySpentKrw ?? 0).toLocaleString("ko-KR")}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-white/10 rounded-xl px-4 py-3">
                <p className="text-indigo-200 text-xs mb-1">Haiku 기준 잔여 대화</p>
                <p className="text-2xl font-bold">
                  {(balanceData?.estimatedCalls["claude-haiku-4-5-20251001"] ?? 0).toLocaleString("ko-KR")}
                  <span className="text-base font-normal text-indigo-200">회</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 패키지 선택 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">크레딧 충전</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-white rounded-xl border-2 p-5 transition-all hover:shadow-md ${
                  pkg.popular
                    ? "border-indigo-500 shadow-indigo-100 shadow-md"
                    : "border-gray-100"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    인기
                  </span>
                )}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">{pkg.label}</span>
                  {pkg.bonusPct > 0 && (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      +{pkg.bonusPct}% 보너스
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-0.5">
                  ₩{pkg.amount.toLocaleString("ko-KR")}
                </p>
                {pkg.bonus > 0 && (
                  <p className="text-xs text-green-600 mb-2">
                    ₩{pkg.credit.toLocaleString("ko-KR")} 충전 (₩{pkg.bonus.toLocaleString("ko-KR")} 보너스)
                  </p>
                )}
                <p className="text-xs text-gray-400 mb-4">{pkg.description}</p>
                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={purchasing !== null}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    pkg.popular
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200 active:scale-95"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {purchasing === pkg.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      처리 중
                    </span>
                  ) : (
                    "충전하기"
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 모델별 단가표 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">모델별 사용 단가</h2>
          <p className="text-xs text-gray-400 mb-4">
            Anthropic / OpenAI 공식 단가 기준, 환율 적용 + 서비스 수수료 포함
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 text-xs text-gray-400 font-medium">모델</th>
                  <th className="text-right py-2 pr-4 text-xs text-gray-400 font-medium">입력 (1K토큰)</th>
                  <th className="text-right py-2 pr-4 text-xs text-gray-400 font-medium">출력 (1K토큰)</th>
                  <th className="text-right py-2 text-xs text-gray-400 font-medium">일반 대화 1회</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {models.map(([modelId, pricing]) => {
                  const perCall = (800 / 1000) * pricing.input + (600 / 1000) * pricing.output;
                  return (
                    <tr key={modelId} className="hover:bg-gray-50">
                      <td className="py-3 pr-4 font-medium text-gray-800">{pricing.label}</td>
                      <td className="py-3 pr-4 text-right text-gray-600">
                        ₩{pricing.input.toFixed(1)}
                      </td>
                      <td className="py-3 pr-4 text-right text-gray-600">
                        ₩{pricing.output.toFixed(1)}
                      </td>
                      <td className="py-3 text-right text-gray-500 text-xs">
                        ≈ ₩{perCall.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            * 일반 대화 1회 = 입력 800토큰 + 출력 600토큰 기준. 한국어는 영어 대비 토큰 3~4배 소모.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 최근 사용 내역 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">최근 사용 내역</h2>
            {balanceData?.recentUsages.length ? (
              <div className="space-y-2">
                {balanceData.recentUsages.map((u) => (
                  <div key={u.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        {FEATURE_LABELS[u.feature] ?? u.feature}
                      </span>
                      <span className="text-gray-400 text-xs ml-2">{u.model.split("-").slice(1, 3).join(" ")}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-red-500 font-medium">-₩{u.costKrw}</span>
                      <p className="text-xs text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">아직 사용 내역이 없습니다</p>
            )}
          </div>

          {/* 충전 이력 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">충전 이력</h2>
            {balanceData?.recentPurchases.length ? (
              <div className="space-y-2">
                {balanceData.recentPurchases.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        ₩{p.amount.toLocaleString("ko-KR")} 충전
                      </span>
                      {p.bonus > 0 && (
                        <span className="text-xs text-green-600 ml-2">
                          +₩{p.bonus.toLocaleString("ko-KR")} 보너스
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-green-600 font-medium">
                        +₩{p.credit.toLocaleString("ko-KR")}
                      </span>
                      <p className="text-xs text-gray-400">
                        {new Date(p.createdAt).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">아직 충전 이력이 없습니다</p>
            )}
          </div>
        </div>

        {/* 안내 */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
          <p className="font-semibold mb-1">크레딧 이용 안내</p>
          <ul className="space-y-0.5 list-disc list-inside text-blue-600">
            <li>크레딧은 충전 후 1년간 유효합니다</li>
            <li>미사용 크레딧은 환불이 가능합니다 (결제일 7일 이내, 미사용분에 한해)</li>
            <li>구독 플랜과 크레딧은 별도로 운영됩니다</li>
            <li>API 프록시 사용 시 실제 토큰 사용량 기준으로 차감됩니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function CreditsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CreditsContent />
    </Suspense>
  );
}
