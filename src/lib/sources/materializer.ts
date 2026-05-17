// Evidence n개 → Seed 1장.
// v1 전략: (keyword) 버킷마다 reality_score 가중 정렬 → top evidence 의 textRaw 발췌로 titleQuoted,
// 2등 evidence 로 hookQuoted. 같은 키워드의 기존 Seed 있으면 갱신(upsert).
//
// 더 똑똑한 클러스터링(embedding 유사도)은 v2 — 지금은 단순 그룹화로 시작.

import { prisma } from "@/lib/prisma";
import { recencyWeight, signalSum } from "./util";
import type { Platform } from "./types";

interface EvidenceRow {
  id: string;
  platform: string;
  textRaw: string;
  postedAt: Date;
  upvotes: number;
  likes: number;
  replies: number;
}

/** 발췌 — 인용은 변형 금지. 80자 컷 + 줄바꿈 정규화. */
function quote(text: string, max = 80): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  if (oneLine.length <= max) return oneLine;
  // 한국어 문장 끊김 우선
  const cut = oneLine.slice(0, max);
  const lastSep = Math.max(cut.lastIndexOf("."), cut.lastIndexOf("!"), cut.lastIndexOf("?"), cut.lastIndexOf("요"));
  return (lastSep > max * 0.5 ? cut.slice(0, lastSep + 1) : cut) + "…";
}

function realityScore(evs: EvidenceRow[]): { score: number; diversity: number } {
  const now = new Date();
  let sum = 0;
  const platforms = new Set<string>();
  for (const e of evs) {
    sum += Math.log(1 + signalSum(e)) * recencyWeight(e.postedAt, now);
    platforms.add(e.platform);
  }
  const diversity = platforms.size;
  return { score: sum * (1 + 0.3 * (diversity - 1)), diversity };
}

/**
 * 단일 키워드에 대해 evidence 풀을 갱신/생성된 seed 1장으로 materialize.
 * (키워드를 더 잘게 쪼개는 클러스터링은 v2)
 */
export async function materializeSeedForKeyword(keyword: string): Promise<{ seedId: string; evidenceCount: number; score: number } | null> {
  const evs = await prisma.evidence.findMany({
    where: { keyword },
    select: {
      id: true,
      platform: true,
      textRaw: true,
      postedAt: true,
      upvotes: true,
      likes: true,
      replies: true,
    },
    orderBy: { postedAt: "desc" },
    take: 200,
  });
  if (evs.length === 0) return null;

  // signal 가중 정렬 (인용용 top 2 뽑기)
  const ranked = [...evs].sort(
    (a, b) =>
      Math.log(1 + signalSum(b)) * recencyWeight(b.postedAt) -
      Math.log(1 + signalSum(a)) * recencyWeight(a.postedAt),
  );
  const top = ranked[0];
  const second = ranked[1];

  const { score, diversity } = realityScore(evs);

  // 기존 seed 갱신 또는 생성
  const existing = await prisma.seed.findFirst({ where: { keyword }, select: { id: true } });
  const seed = existing
    ? await prisma.seed.update({
        where: { id: existing.id },
        data: {
          titleQuoted: quote(top.textRaw),
          hookQuoted: second ? quote(second.textRaw) : null,
          realityScore: score,
          sourceDiversity: diversity,
          evidenceCount: evs.length,
        },
      })
    : await prisma.seed.create({
        data: {
          keyword,
          titleQuoted: quote(top.textRaw),
          hookQuoted: second ? quote(second.textRaw) : null,
          realityScore: score,
          sourceDiversity: diversity,
          evidenceCount: evs.length,
        },
      });

  // SeedEvidence 매핑 (idempotent — duplicate skip)
  await prisma.seedEvidence.deleteMany({ where: { seedId: seed.id } });
  await prisma.seedEvidence.createMany({
    data: evs.map((e) => ({ seedId: seed.id, evidenceId: e.id })),
    skipDuplicates: true,
  });

  return { seedId: seed.id, evidenceCount: evs.length, score };
}

/**
 * Thesis 단위 시드 빌더 — 선택된 주장(picked) 에 묶인 Insight들의 evidenceIds 풀에서
 * 가장 강한 인용을 뽑아 Seed 1장으로 만든다. 시드는 thesisId 로 묶여 STEP 4에서 필터링 가능.
 */
export async function materializeSeedsForThesis(thesisId: string): Promise<{ seedId: string; evidenceCount: number; score: number } | null> {
  const thesis = await prisma.thesis.findUnique({
    where: { id: thesisId },
    include: { insights: true },
  });
  if (!thesis) return null;

  const evIds = Array.from(new Set(thesis.insights.flatMap((i) => i.evidenceIds)));
  if (evIds.length === 0) return null;

  const evs = await prisma.evidence.findMany({
    where: { id: { in: evIds } },
    select: { id: true, platform: true, textRaw: true, postedAt: true, upvotes: true, likes: true, replies: true, keyword: true },
  });
  if (evs.length === 0) return null;

  const ranked = [...evs].sort(
    (a, b) =>
      Math.log(1 + signalSum(b)) * recencyWeight(b.postedAt) -
      Math.log(1 + signalSum(a)) * recencyWeight(a.postedAt),
  );
  const top = ranked[0];
  const second = ranked[1];
  const { score, diversity } = realityScore(evs);

  // 1 Thesis = 1 Seed (재실행 시 upsert)
  const existing = await prisma.seed.findFirst({ where: { thesisId }, select: { id: true } });
  const seed = existing
    ? await prisma.seed.update({
        where: { id: existing.id },
        data: {
          keyword: top.keyword,
          titleQuoted: quote(top.textRaw),
          hookQuoted: second ? quote(second.textRaw) : null,
          realityScore: score,
          sourceDiversity: diversity,
          evidenceCount: evs.length,
        },
      })
    : await prisma.seed.create({
        data: {
          thesisId,
          keyword: top.keyword,
          titleQuoted: quote(top.textRaw),
          hookQuoted: second ? quote(second.textRaw) : null,
          realityScore: score,
          sourceDiversity: diversity,
          evidenceCount: evs.length,
        },
      });

  await prisma.seedEvidence.deleteMany({ where: { seedId: seed.id } });
  await prisma.seedEvidence.createMany({
    data: evs.map((e) => ({ seedId: seed.id, evidenceId: e.id })),
    skipDuplicates: true,
  });

  return { seedId: seed.id, evidenceCount: evs.length, score };
}

export type { Platform };
