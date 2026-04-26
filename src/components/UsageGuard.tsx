"use client";

import { useEffect, useState } from "react";
import { Zap, X } from "lucide-react";
import { getCurrentUsageInfo, incrementUsage, type UsageInfo } from "@/lib/usage";

interface UsageGuardProps {
  onAllowed: () => void;
  children?: React.ReactNode;
}

// 사용량 카운트 + 한도 초과 시 모달 표시
export function useUsageGuard() {
  const [showModal, setShowModal] = useState(false);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);

  const checkAndConsume = (): boolean => {
    const info = incrementUsage();
    setUsageInfo(info);
    if (info.status === "exceeded") {
      setShowModal(true);
      return false;
    }
    if (info.status === "warning") {
      // 80% 도달 시 토스트는 별도 처리
    }
    return true;
  };

  return { checkAndConsume, showModal, setShowModal, usageInfo };
}

// 사용량 표시 배지 (사이드바 하단 등에 삽입)
export function UsageBadge() {
  const [info, setInfo] = useState<UsageInfo | null>(null);

  useEffect(() => {
    setInfo(getCurrentUsageInfo());
  }, []);

  if (!info || info.limit === Infinity) return null;

  const barColor =
    info.status === "exceeded"
      ? "bg-red-500"
      : info.status === "warning"
        ? "bg-amber-400"
        : "bg-indigo-500";

  return (
    <div className="px-3 py-2 space-y-1">
      <div className="flex justify-between text-[11px] text-gray-400">
        <span>이번 달 사용량</span>
        <span className={info.status === "exceeded" ? "text-red-500 font-semibold" : ""}>
          {info.used} / {info.limit}건
        </span>
      </div>
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${info.percent}%` }}
        />
      </div>
    </div>
  );
}

// 한도 초과 업그레이드 모달
export function UpgradeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  const plans = [
    { name: "베이직", price: "19,900원", limit: "500건/월", highlight: false },
    { name: "스탠다드", price: "39,900원", limit: "2,000건/월", highlight: true },
    { name: "프리미엄", price: "79,900원", limit: "무제한", highlight: false },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-base">이번 달 한도 도달</p>
            <p className="text-indigo-200 text-xs mt-0.5">더 많은 AI 응답을 사용하려면 업그레이드하세요</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                plan.highlight
                  ? "border-indigo-300 bg-indigo-50"
                  : "border-gray-100 bg-gray-50"
              }`}
            >
              <div>
                <p className={`font-semibold text-sm ${plan.highlight ? "text-indigo-700" : "text-gray-700"}`}>
                  {plan.name}
                  {plan.highlight && (
                    <span className="ml-2 text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">추천</span>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{plan.limit}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800">{plan.price}</p>
                <p className="text-[10px] text-gray-400">/월</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 pb-5">
          <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2">
            <Zap className="size-4" />
            요금제 업그레이드
          </button>
          <button onClick={onClose} className="w-full mt-2 py-2 text-xs text-gray-400 hover:text-gray-600">
            다음에 하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsageGuard({ onAllowed }: UsageGuardProps) {
  const { checkAndConsume, showModal, setShowModal } = useUsageGuard();

  const handleClick = () => {
    if (checkAndConsume()) onAllowed();
  };

  return (
    <>
      <button onClick={handleClick} className="hidden" />
      <UpgradeModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
