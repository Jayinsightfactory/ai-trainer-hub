// 플랜별 월간 한도
export const PLAN_LIMITS: Record<string, number> = {
  free: 100,
  basic: 500,
  standard: 2000,
  premium: Infinity,
};

export type UsageStatus = "ok" | "warning" | "exceeded";

export interface UsageInfo {
  used: number;
  limit: number;
  percent: number;
  status: UsageStatus;
  plan: string;
}

// localStorage 기반 클라이언트 사이드 사용량 추적 (MVP)
// 프로덕션에서는 DB로 교체 필요
const STORAGE_KEY = "nowlink_usage";

interface StoredUsage {
  count: number;
  plan: string;
  resetAt: number; // 다음 월 1일 타임스탬프
}

function getNextMonthStart(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
}

export function getUsage(): StoredUsage {
  if (typeof window === "undefined") return { count: 0, plan: "free", resetAt: 0 };

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { count: 0, plan: "free", resetAt: getNextMonthStart() };

  const stored: StoredUsage = JSON.parse(raw);
  // 월 초과 시 자동 리셋
  if (Date.now() > stored.resetAt) {
    const reset = { count: 0, plan: stored.plan, resetAt: getNextMonthStart() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
    return reset;
  }
  return stored;
}

export function incrementUsage(): UsageInfo {
  const stored = getUsage();
  stored.count++;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  return computeUsageInfo(stored);
}

export function computeUsageInfo(stored: StoredUsage): UsageInfo {
  const limit = PLAN_LIMITS[stored.plan] ?? PLAN_LIMITS.free;
  const percent = limit === Infinity ? 0 : Math.min(100, (stored.count / limit) * 100);

  let status: UsageStatus = "ok";
  if (stored.count >= limit) status = "exceeded";
  else if (percent >= 80) status = "warning";

  return { used: stored.count, limit, percent, status, plan: stored.plan };
}

export function getCurrentUsageInfo(): UsageInfo {
  return computeUsageInfo(getUsage());
}
