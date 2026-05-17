import { createHash } from "node:crypto";
import type { RawEvidence } from "./types";

/** Evidence 안정적 ID — 같은 (url, author, ts) 재수집해도 upsert로 처리되게. */
export function evidenceId(e: RawEvidence): string {
  const key = `${e.sourceUrl}|${e.author}|${e.postedAt.toISOString()}`;
  return createHash("sha1").update(key).digest("hex").slice(0, 24);
}

/** 한국어 경험 표지 (1차 휴리스틱 — 후에 분류기로 교체 가능). */
const KO_EXPERIENCE = /(해봤|써봤|돌려봤|돌려봄|결제|끊었|끊고|결국|진짜|개인적|저는|제가|솔직히|후기|체감|한\s?달|일주일)/;

export function classifyIsExperience(text: string): boolean {
  return KO_EXPERIENCE.test(text);
}

/** 최근성 decay — 7일 1.0, 30일 0.8, 90일 0.5, 365일 0.2. */
export function recencyWeight(postedAt: Date, now: Date = new Date()): number {
  const days = (now.getTime() - postedAt.getTime()) / 86_400_000;
  if (days <= 7) return 1;
  if (days <= 30) return 0.8;
  if (days <= 90) return 0.5;
  if (days <= 365) return 0.2;
  return 0.05;
}

/** signals 합 — 플랫폼별 likes/upvotes/replies 가중합. */
export function signalSum(e: { likes?: number; upvotes?: number; replies?: number }): number {
  return (e.upvotes ?? 0) + (e.likes ?? 0) + (e.replies ?? 0) * 0.5;
}
