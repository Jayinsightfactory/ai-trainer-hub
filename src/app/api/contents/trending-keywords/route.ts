// GET /api/contents/trending-keywords[?limit=20]
// 사람들이 *원하는 것* 자동 발견.
// 소스 3개 합치고 dedup:
//   1) Google/YouTube 자동완성 — 기본 시드 카테고리 8개 확장
//   2) 최근 30일 수집된 Evidence의 keyword 빈도 (이미 사용자가 관심 보인 것)
//   3) 정적 trending seed (cold start fallback)

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// 기본 시드 — 첫 화면 cold start용. AI/콘텐츠 도메인.
const SEED_CATEGORIES = [
  "AI 도구",
  "챗GPT",
  "Claude",
  "AI 자동화",
  "AI 부수익",
  "프롬프트",
  "n8n",
  "GPT 결제",
];

const SUGGEST_URL = "https://suggestqueries.google.com/complete/search";

async function ytSuggest(seed: string): Promise<string[]> {
  try {
    const url = `${SUGGEST_URL}?client=youtube&q=${encodeURIComponent(seed)}&hl=ko&gl=KR&ds=yt`;
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) return [];
    const text = await r.text();
    // JSONP response: window.google.ac.h([...]) — strip wrapper
    const m = text.match(/\[([\s\S]+)\]$/);
    if (!m) return [];
    const arr = JSON.parse("[" + m[1] + "]") as unknown[];
    const items = (arr[1] as unknown[]) ?? [];
    return items
      .map((it) => (Array.isArray(it) ? (it[0] as string) : (it as string)))
      .filter((s) => typeof s === "string" && s.trim().length > 0)
      .slice(0, 8);
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const limit = Math.max(1, Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 24), 50));

  // 1) YT 자동완성 (병렬)
  const expansions = await Promise.all(SEED_CATEGORIES.map(ytSuggest));
  const autoKws: Map<string, { source: string; weight: number }> = new Map();
  expansions.flat().forEach((kw) => {
    const k = kw.trim();
    if (!k) return;
    autoKws.set(k, { source: "youtube_suggest", weight: (autoKws.get(k)?.weight ?? 0) + 1 });
  });

  // 2) 최근 30일 DB 빈도
  const since = new Date(Date.now() - 30 * 86_400_000);
  const dbAgg = await prisma.evidence.groupBy({
    by: ["keyword"],
    where: { fetchedAt: { gte: since } },
    _count: { _all: true },
    _sum: { upvotes: true, likes: true },
    orderBy: { _count: { keyword: "desc" } },
    take: 30,
  });
  const dbKws = new Map<string, { source: string; weight: number; evidenceCount: number }>();
  dbAgg.forEach((row) => {
    const sig = (row._sum.upvotes ?? 0) + (row._sum.likes ?? 0);
    dbKws.set(row.keyword, {
      source: "db_frequency",
      weight: Math.log(1 + sig) + row._count._all * 0.1,
      evidenceCount: row._count._all,
    });
  });

  // 3) 정적 시드 (앞 둘이 비어있을 때 fallback)
  const seeds = SEED_CATEGORIES.map((k) => ({ keyword: k, source: "seed", weight: 0.5, evidenceCount: 0 }));

  // 합치고 정렬: DB 빈도 > 자동완성 > seed
  const merged = new Map<string, { keyword: string; sources: string[]; weight: number; evidenceCount: number }>();
  function add(kw: string, source: string, weight: number, evidenceCount = 0) {
    const k = kw.trim();
    if (!k || k.length > 60) return;
    const cur = merged.get(k);
    if (cur) {
      cur.sources.push(source);
      cur.weight += weight;
      cur.evidenceCount = Math.max(cur.evidenceCount, evidenceCount);
    } else {
      merged.set(k, { keyword: k, sources: [source], weight, evidenceCount });
    }
  }
  dbKws.forEach((v, k) => add(k, v.source, v.weight, v.evidenceCount));
  autoKws.forEach((v, k) => add(k, v.source, v.weight));
  if (merged.size < limit / 2) seeds.forEach((s) => add(s.keyword, s.source, s.weight));

  const list = [...merged.values()]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);

  return NextResponse.json({
    ok: true,
    count: list.length,
    keywords: list,
    info: {
      autoCompleteFetched: autoKws.size,
      dbFrequencyKeywords: dbKws.size,
    },
  });
}
