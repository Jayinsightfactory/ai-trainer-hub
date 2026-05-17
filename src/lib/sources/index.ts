// 모든 어댑터 한 곳에서. 신규 추가 시 여기 한 줄 + types의 Platform union 갱신.

import type { Platform, SourceAdapter } from "./types";
import { youtubeAdapter } from "./youtube";
import { redditAdapter } from "./reddit";
import { clienAdapter } from "./clien";

export const ADAPTERS: Record<string, SourceAdapter> = {
  youtube: youtubeAdapter,
  reddit: redditAdapter,
  clien: clienAdapter,
};

export function availablePlatforms(): Platform[] {
  return Object.entries(ADAPTERS)
    .filter(([, a]) => a.isAvailable())
    .map(([, a]) => a.platform);
}

export { youtubeAdapter, redditAdapter, clienAdapter };
export type { SourceAdapter, Platform } from "./types";
