// GET /api/contents/trending-keywords[?limit=20]
// 사람들이 *원하는 것* 자동 발견.
// 소스:
//   1) YouTube Data API v3 — seed 카테고리 → 최근 7일 조회수 상위 영상 → 제목 토큰 빈도
//      (이전엔 Google suggestqueries 사용했으나 Railway US에서 차단되어 폐기)
//   2) 최근 30일 DB Evidence 키워드 빈도
//   3) 정적 seed (cold start fallback)
//
// YT Data API 호출은 비용 큼 (100 units × seed 수). 1시간 메모리 캐시로 호출 절약.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// 카테고리별 시드 — 카드뉴스 만들 만한 한국 콘텐츠 도메인 전반.
// 6 카테고리 × 약 8 시드 = 50+ (사용자가 폭넓게 선택 가능)
const SEED_GROUPS: { name: string; emoji: string; seeds: string[] }[] = [
  {
    name: "AI/IT",
    emoji: "🤖",
    seeds: ["챗GPT", "Claude", "AI 자동화", "프롬프트", "n8n 자동화", "노션 AI", "노코드", "AI 영상"],
  },
  {
    name: "재테크",
    emoji: "💰",
    seeds: ["부동산", "주식", "ETF", "부수익", "사이드프로젝트", "파킹통장", "청약", "절세"],
  },
  {
    name: "직장/커리어",
    emoji: "💼",
    seeds: ["직장인 노하우", "이직", "연봉협상", "보고서", "회의록", "업무 자동화", "신입 적응", "면접"],
  },
  {
    name: "자기계발",
    emoji: "📚",
    seeds: ["독서법", "공부법", "시간관리", "생산성", "습관 만들기", "글쓰기", "영어 공부", "자격증"],
  },
  {
    name: "라이프",
    emoji: "🏠",
    seeds: ["다이어트", "홈트", "요리", "자취", "인테리어", "미니멀", "여행", "카페"],
  },
  {
    name: "관계/소통",
    emoji: "💬",
    seeds: ["연애", "결혼", "육아", "친구관계", "직장 인간관계", "갈등 해결", "거절하는 법", "심리"],
  },
];
// 평탄화 (호환성 — 기존 코드가 SEED_CATEGORIES를 단일 배열로 기대하는 경우)
const SEED_CATEGORIES: string[] = SEED_GROUPS.flatMap((g) => g.seeds);

// ─── YT Data API search.list 기반 트렌드 키워드 추출 ───
type YtSearchItem = { id: { videoId: string }; snippet: { title: string; channelTitle: string } };
type YtSearchResp = { items?: YtSearchItem[] };

// 시드별 캐시 — 시드 1개 클릭 시 자동완성 확장 동적 로드
const _ytCacheBySeed: Map<string, { ts: number; titles: string[] }> = new Map();
const YT_CACHE_TTL = 60 * 60 * 1000; // 1시간

async function fetchYtTitlesForSeed(seed: string): Promise<string[]> {
  const cached = _ytCacheBySeed.get(seed);
  if (cached && Date.now() - cached.ts < YT_CACHE_TTL) return cached.titles;
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];
  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
  try {
    const url =
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=12` +
      `&order=viewCount&publishedAfter=${since}&relevanceLanguage=ko&regionCode=KR` +
      `&q=${encodeURIComponent(seed)}&key=${key}`;
    const r = await fetch(url);
    if (!r.ok) return [];
    const d = (await r.json()) as YtSearchResp;
    const titles = (d.items ?? [])
      .map((it) => it.snippet?.title)
      .filter((t): t is string => Boolean(t));
    _ytCacheBySeed.set(seed, { ts: Date.now(), titles });
    return titles;
  } catch {
    return [];
  }
}

// 모든 시드 통합 (옛 동작 — overview 모드)
async function fetchAllYtTitles(seeds: string[]): Promise<string[]> {
  const titles: string[] = [];
  for (const seed of seeds) {
    const t = await fetchYtTitlesForSeed(seed);
    titles.push(...t);
  }
  return titles;
}

// ─── 한국어 친화 토큰화 (unigram + bigram) ───
const STOPWORDS = new Set([
  // 일반 어휘
  "이렇게", "이런", "저런", "그런", "어떻게", "정말", "진짜", "완전", "엄청", "너무",
  "있다", "없다", "한다", "하는", "있는", "없는", "되면", "되는",
  "나는", "너는", "내가", "제가", "저는", "우리", "그게", "이게",
  "만약", "그냥", "그리고", "그러나", "하지만",
  "방법", "이유", "결과", "차이", "비교", "정리", "추천", "최고", "최신",
  // YT 흔한 단어
  "shorts", "short", "live", "official", "vlog", "video", "videos",
  "trending", "tutorial", "review", "reviews", "guide", "guides",
  "episode", "ep", "channel", "subscribe", "stream",
  "오늘", "어제", "내일", "이번", "지난", "다음",
  // 숫자 단위
  "분", "초", "시간", "일", "월", "년", "원",
  // 너무 일반적인 영문 단일 단어 (bigram 컨텍스트에선 OK, unigram에선 노이즈)
  "ai", "api", "app", "vs", "new", "best", "top", "how", "why", "what",
  "prompt", "prompts", "model", "models", "tool", "tools", "agent", "agents",
  "tip", "tips", "trick", "tricks", "hack", "hacks", "secret", "secrets",
]);

function tokenize(title: string): string[] {
  const cleaned = title
    .replace(/[\[\]【】「」『』()（）{}<>《》"'!?.,…·•|\\/-]/g, " ")
    .replace(/[#@]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(/\s+/).filter((w) => w.length >= 2 && w.length <= 14);
  const tokens: string[] = [];

  // unigrams — 한국어 2자+ / 영문 5자+ (짧은 영문 단어는 bigram으로만)
  for (const w of words) {
    if (STOPWORDS.has(w.toLowerCase())) continue;
    if (!/[가-힣A-Za-z0-9]/.test(w)) continue;
    if (/^\d+$/.test(w)) continue;
    const hasKo = /[가-힣]/.test(w);
    if (hasKo ? w.length >= 2 : w.length >= 5) tokens.push(w);
  }
  // bigrams — 양쪽 다 stopword일 때만 제외 (한쪽이 의미어면 OK)
  for (let i = 0; i < words.length - 1; i++) {
    const a = words[i];
    const b = words[i + 1];
    if (STOPWORDS.has(a.toLowerCase()) && STOPWORDS.has(b.toLowerCase())) continue;
    if (/^\d+$/.test(a) && /^\d+$/.test(b)) continue;
    const bi = `${a} ${b}`;
    if (bi.length >= 4 && bi.length <= 24) tokens.push(bi);
  }
  return tokens;
}

// ─── 후처리: case-insensitive dedup + substring 흡수 ───
type KwItem = { keyword: string; sources: string[]; weight: number; evidenceCount: number };
// 정규화: lowercase + 공백/하이픈 제거 → "Chat GPT" "chat-gpt" "ChatGPT" 모두 같은 키
function normalizeKw(s: string): string {
  return s.toLowerCase().replace(/[\s\-_]+/g, "");
}

function dedupAndCollapse(list: KwItem[]): KwItem[] {
  // 1) 정규화 키로 합치기 — 공백/대소문자 변종 흡수
  const byLower = new Map<string, KwItem[]>();
  for (const item of list) {
    const k = normalizeKw(item.keyword);
    const arr = byLower.get(k) ?? [];
    arr.push(item);
    byLower.set(k, arr);
  }
  const cased: KwItem[] = [];
  byLower.forEach((group) => {
    group.sort((a, b) => b.weight - a.weight);
    cased.push({
      keyword: group[0].keyword,
      sources: [...new Set(group.flatMap((g) => g.sources))],
      weight: group.reduce((s, g) => s + g.weight, 0),
      evidenceCount: Math.max(...group.map((g) => g.evidenceCount)),
    });
  });

  // 2) substring 흡수 — 더 긴 토큰이 짧은 토큰을 단어 단위로 포함하면 짧은 거 흡수
  cased.sort((a, b) => b.keyword.length - a.keyword.length);
  const final: KwItem[] = [];
  for (const cand of cased) {
    const lower = cand.keyword.toLowerCase();
    const subsumer = final.find((longer) => {
      const longerL = longer.keyword.toLowerCase();
      if (longerL === lower) return false;
      return longerL.split(/\s+/).some((tok) => tok === lower);
    });
    if (subsumer) {
      subsumer.weight += cand.weight * 0.3;
      cand.sources.forEach((s) => {
        if (!subsumer.sources.includes(s)) subsumer.sources.push(s);
      });
    } else {
      final.push(cand);
    }
  }
  return final;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const limit = Math.max(1, Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 24), 50));
  const refresh = req.nextUrl.searchParams.get("refresh") === "1";
  const seedParam = req.nextUrl.searchParams.get("seed");
  if (refresh) _ytCacheBySeed.clear();

  // ─── 시드 목록 모드: 사용자에게 보여줄 시드 카테고리 ───
  if (req.nextUrl.searchParams.get("mode") === "seeds") {
    return NextResponse.json({
      ok: true,
      mode: "seeds",
      seeds: SEED_CATEGORIES,
      groups: SEED_GROUPS, // [{name, emoji, seeds[]}, ...]
    });
  }

  // ─── 단일 시드 자동완성 모드: ?seed=AI 자동화 ───
  if (seedParam) {
    const titles = await fetchYtTitlesForSeed(seedParam);
    const freq: Map<string, number> = new Map();
    for (const title of titles) {
      for (const tok of tokenize(title)) {
        freq.set(tok, (freq.get(tok) ?? 0) + 1);
      }
    }
    // 시드 자체는 보통 토큰화 결과 안에 포함됨 → 제외
    freq.delete(seedParam);
    const list: KwItem[] = [...freq.entries()]
      .filter(([, n]) => n >= 1)
      .map(([k, n]) => {
        const isBigram = k.includes(" ");
        const hasKo = /[가-힣]/.test(k);
        const boost = (isBigram ? 1.6 : 1.0) * (hasKo ? 1.4 : 1.0);
        return {
          keyword: k,
          sources: ["youtube_autocomplete"],
          weight: Math.log(1 + n) * 1.5 * boost,
          evidenceCount: 0,
        };
      });
    const cleaned = dedupAndCollapse(list)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit);
    return NextResponse.json({
      ok: true,
      mode: "seed",
      seed: seedParam,
      count: cleaned.length,
      keywords: cleaned,
      info: { ytTitlesFetched: titles.length, ytUniqueTokens: freq.size },
    });
  }

  // ─── 기본 (overview) 모드: 모든 시드 통합 ───
  const titles = await fetchAllYtTitles(SEED_CATEGORIES);
  const ytFreq: Map<string, number> = new Map();
  for (const title of titles) {
    for (const tok of tokenize(title)) {
      ytFreq.set(tok, (ytFreq.get(tok) ?? 0) + 1);
    }
  }

  // 2) 최근 30일 DB 키워드 빈도
  const since = new Date(Date.now() - 30 * 86_400_000);
  const dbAgg = await prisma.evidence.groupBy({
    by: ["keyword"],
    where: { fetchedAt: { gte: since } },
    _count: { _all: true },
    _sum: { upvotes: true, likes: true },
    orderBy: { _count: { keyword: "desc" } },
    take: 30,
  });
  const dbKws = new Map<string, { weight: number; evidenceCount: number }>();
  dbAgg.forEach((row) => {
    const sig = (row._sum.upvotes ?? 0) + (row._sum.likes ?? 0);
    dbKws.set(row.keyword, {
      weight: Math.log(1 + sig) + row._count._all * 0.1,
      evidenceCount: row._count._all,
    });
  });

  // 3) 합치기
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
  // 우선순위: DB 빈도 (사용자 실제 관심) > YT 트렌드 > seed
  dbKws.forEach((v, k) => add(k, "db_frequency", v.weight, v.evidenceCount));
  // YT 토큰은 빈도 ≥ 2만. bigram (공백 포함 + 한국어 포함)에 가중치 부스트.
  [...ytFreq.entries()]
    .filter(([, n]) => n >= 2)
    .forEach(([k, n]) => {
      const isBigram = k.includes(" ");
      const hasKo = /[가-힣]/.test(k);
      const boost = (isBigram ? 1.6 : 1.0) * (hasKo ? 1.4 : 1.0);
      add(k, "youtube_trend", Math.log(1 + n) * 1.5 * boost);
    });
  // cold start fallback
  if (merged.size < Math.ceil(limit / 2)) {
    SEED_CATEGORIES.forEach((k) => add(k, "seed", 0.3));
  }

  // dedup + substring collapse + 최종 정렬
  const list = dedupAndCollapse([...merged.values()])
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);

  return NextResponse.json({
    ok: true,
    count: list.length,
    keywords: list,
    info: {
      ytTitlesFetched: titles.length,
      ytUniqueTokens: ytFreq.size,
      dbFrequencyKeywords: dbKws.size,
      cacheSeedsCount: _ytCacheBySeed.size,
    },
  });
}
