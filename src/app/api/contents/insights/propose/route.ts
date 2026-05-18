// POST /api/contents/insights/propose
// Body: { keywords: string[], perKeyword?: number }
// STEP 2: 키워드만으로 (evidence 없이) AI 인사이트 후보 제안.
// 평범한 LLM 컨텐츠라 사용자가 수정·삭제·본인 인사이트 추가로 차별화 (STEP 3에서 사례 검색으로 검증).

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { parseLLMJson } from "@/lib/parse-llm-json";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM = `당신은 한국 직장인 콘텐츠 기획자입니다.
주어진 키워드 N개에 대해, 사람들이 "어 이거 진짜?" 하고 클릭할 인사이트 후보를 한 줄씩 제안합니다.

좋은 인사이트의 조건:
- **구체적 숫자/시간/조건** 포함 (예: "Day 7에", "월 28K", "3일째에")
- **반전·역설·자백 톤** (예: "결국 결제 끊었다", "유료보다 무료가 나았다")
- **직장인 일상 앵커** (예: "팀장이", "사수가", "회사에서")
- **명령조 ❌, 위인전체 ❌, 광고체 ❌**
- **자연체 어미** (~더라고요, ~했어요, ~네요, ~잖아요)

피해야 할 패턴:
- "~하면 ~된다" (당위적, 뻔함)
- "~할 수 있다" (가능성만 말함, 약함)
- "~을 추천한다" (광고체)
- "AI는 ~다" (선언적, 진부)

좋은 예 (참고만, 그대로 베끼지 말 것):
- 키워드 "GPT 결제" → "월 28,000원 GPT 끊고 무료 4개 조합으로 일주일 버텨봤어요"
- 키워드 "AI 자동화" → "n8n 첫 자동화 만들고 24일째에 매출 50만원 찍은 후기"
- 키워드 "엑셀 함수" → "VLOOKUP 평생 못 외워도 ChatGPT한테 한 줄 시키면 끝나더라고요"

규칙:
1. 한국어 한 줄 (45자 이내).
2. 키워드별 perKeyword개 (요청 받은 수).
3. 추측이 아니라 "이런 결이 사람들 사이에 있을 것 같다" 톤. 사용자가 STEP 3에서 실제 사례로 검증할 거니 부담 적게.

출력 — JSON 객체만 (markdown 금지):
{
  "insights": [
    { "keyword": "AI 자동화", "text": "..." },
    ...
  ]
}`;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    keywords?: string[];
    perKeyword?: number;
    context?: string[]; // STEP 1에서 본 자동완성 확장 결과 — Claude가 트렌드 방향성 참고
  };
  const keywords = (body.keywords ?? []).map((s) => s.trim()).filter(Boolean).slice(0, 5);
  if (keywords.length === 0) {
    return NextResponse.json({ ok: false, error: "keywords required" }, { status: 400 });
  }
  const per = Math.max(1, Math.min(body.perKeyword ?? 3, 5));
  let context = (body.context ?? [])
    .map((s) => s.trim())
    .filter((s) => s && !keywords.includes(s))
    .slice(0, 30);

  // ⭐ 안전망: context 비어있으면 백엔드에서 자동으로 YT 자동완성 fetch
  if (context.length === 0 && process.env.YOUTUBE_API_KEY) {
    const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const collected = new Set<string>();
    for (const kw of keywords) {
      try {
        const url =
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8` +
          `&order=viewCount&publishedAfter=${since}&relevanceLanguage=ko&regionCode=KR` +
          `&q=${encodeURIComponent(kw)}&key=${process.env.YOUTUBE_API_KEY}`;
        const r = await fetch(url);
        if (!r.ok) continue;
        const d = (await r.json()) as { items?: Array<{ snippet?: { title?: string } }> };
        for (const it of d.items ?? []) {
          const t = it.snippet?.title;
          if (t && t.length <= 80) collected.add(t);
        }
      } catch {
        // skip
      }
    }
    context = [...collected].slice(0, 20);
  }

  // ⭐ 핵심: 각 키워드의 실제 수집 evidence를 fetch → prompt에 원문 포함
  //   → Claude가 "발견되는" 인사이트로 만듦 (합성이 아니라 추출에 가깝게)
  const evidenceByKw: Record<string, Array<{ id: string; text: string; platform: string; signal: number }>> = {};
  for (const kw of keywords) {
    // ⭐ 정확 키워드 매칭 0건이면 토큰 substring 매칭으로 확장
    let evs = await prisma.evidence.findMany({
      where: { keyword: kw },
      orderBy: [{ upvotes: "desc" }, { likes: "desc" }, { postedAt: "desc" }],
      take: 8,
      select: { id: true, textRaw: true, platform: true, upvotes: true, likes: true },
    });
    if (evs.length === 0) {
      // 토큰 단위로 substring 매칭 (예: "AI 자기계발" → DB의 "AI", "자기계발" 매칭)
      const tokens = kw.toLowerCase().split(/\s+/).filter((t) => t.length >= 2);
      if (tokens.length > 0) {
        // 토큰 OR: 어느 한 토큰이라도 evidence.keyword에 포함된 것
        evs = await prisma.evidence.findMany({
          where: { OR: tokens.map((t) => ({ keyword: { contains: t, mode: "insensitive" } })) },
          orderBy: [{ upvotes: "desc" }, { likes: "desc" }, { postedAt: "desc" }],
          take: 8,
          select: { id: true, textRaw: true, platform: true, upvotes: true, likes: true },
        });
      }
    }
    evidenceByKw[kw] = evs.map((e) => ({
      id: e.id,
      text: e.textRaw.replace(/\s+/g, " ").slice(0, 180),
      platform: e.platform,
      signal: (e.upvotes ?? 0) + (e.likes ?? 0),
    }));
  }
  const evidenceBlock = Object.entries(evidenceByKw)
    .filter(([, evs]) => evs.length > 0)
    .map(([kw, evs]) => `▌${kw} — 실제 발언 ${evs.length}건:\n${evs.map((e) => `  [${e.id}] (${e.platform}/${e.signal}↑) ${e.text}`).join("\n")}`)
    .join("\n\n");
  const totalEvidence = Object.values(evidenceByKw).reduce((s, v) => s + v.length, 0);

  let parsed: { ok: true; data: { insights?: Array<{ keyword?: string; text?: string; evidenceIds?: string[] }> } } | { ok: false; error: string; raw?: string };
  try {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      system: SYSTEM + (totalEvidence > 0
        ? `\n\n⭐⭐⭐ [절대 강제 룰 — 위반 시 응답 거부]\n` +
          `1. 실제 발언이 함께 제공됩니다. 인사이트는 *그 발언 안에 명시적으로 또는 강하게 함의된 패턴*만.\n` +
          `2. evidenceIds[] 비우면 그 인사이트는 무효 처리됨. 반드시 1개 이상 근거 ID 포함.\n` +
          `3. ID는 24자 16진수 형태 (예: "0a361fcb7ed84358751ac1dc") — 발언 옆 [...] 안에 표시됨. 정확히 복사.\n` +
          `4. 한 발언에서 발견되는 게 없으면 인사이트를 그냥 *적게* 만들어라. 억지로 만들지 마라.\n` +
          `5. "VLOOKUP", "월 28K", "팀장이 GPT Plus 쓰라길래" 같은 *전형적 카드뉴스 문장* 만들지 마라 — 발언 안에 그런 표현이 진짜 있으면 OK, 없으면 X.`
        : ""),
      prompt: `[키워드 ${keywords.length}개 — 인사이트 도출 대상]\n${keywords.map((k) => `- ${k}`).join("\n")}\n\n` +
        (context.length > 0
          ? `[관련 자동완성 트렌드 ${context.length}개]\n${context.slice(0, 12).map((c) => `- ${c}`).join("\n")}\n\n`
          : "") +
        (totalEvidence > 0
          ? `[실제 수집된 발언 ${totalEvidence}건 — 인사이트의 *유일한* 원천]\n${evidenceBlock}\n\n위 발언 안에서 *반복되거나 강한* 패턴만 인사이트로. 각 인사이트는 evidenceIds[]에 위 [...] 안 ID를 1개 이상 정확히 복사. 발언과 무관한 일반론 ❌. perKeyword=${per}는 *최대치*이며, 발견되는 게 적으면 더 적게 출력.`
          : `각 키워드별 ${per}개 인사이트 후보를 JSON으로.`),
      temperature: 0.3,
    });
    parsed = parseLLMJson(text);
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error, raw: parsed.raw }, { status: 500 });
  }

  const validKw = new Set(keywords);
  const allEvidenceIds = new Set(Object.values(evidenceByKw).flat().map((e) => e.id));
  const hadEvidence = totalEvidence > 0;
  let candidates = (parsed.data.insights ?? [])
    .map((i) => ({
      keyword: (i.keyword ?? "").trim(),
      text: (i.text ?? "").trim().slice(0, 200),
      evidenceIds: (i.evidenceIds ?? []).filter((id) => allEvidenceIds.has(id)),
    }))
    .filter((i) => validKw.has(i.keyword) && i.text.length >= 5);

  // ⭐ Grounding 강제: evidence가 있었는데 evidenceIds 0인 인사이트 = 합성. 제거.
  if (hadEvidence) {
    candidates = candidates.filter((c) => c.evidenceIds.length > 0);
  }

  // ⭐ Fallback: AI grounding 실패면 evidence 원문 직접 발췌로 인사이트 생성
  // (LLM 합성 컨텐츠 대신 실제 사람 발언 인용)
  if (hadEvidence && candidates.length === 0) {
    const fallbackCands: typeof candidates = [];
    for (const [kw, evs] of Object.entries(evidenceByKw)) {
      const top = evs.slice(0, Math.min(per, evs.length));
      for (const e of top) {
        const oneLine = e.text.replace(/\s+/g, " ").trim();
        const quoted = oneLine.length <= 80 ? oneLine : oneLine.slice(0, 78) + "…";
        fallbackCands.push({
          keyword: kw,
          text: `"${quoted}" (${e.platform} ${e.signal}↑)`,
          evidenceIds: [e.id],
        });
      }
    }
    candidates = fallbackCands;
  }

  // 기존 동일-키워드 AI 후보(미채택, thesisId null) 정리 — 재실행 시 깨끗하게
  await prisma.insight.deleteMany({
    where: { keyword: { in: keywords }, source: "ai", thesisId: null },
  });

  const created = await Promise.all(
    candidates.map((c) =>
      prisma.insight.create({
        data: {
          keyword: c.keyword,
          text: c.text,
          evidenceIds: c.evidenceIds, // ⭐ 근거 evidence id 보존 (추적성)
          source: "ai",
        },
      }),
    ),
  );

  const groundedCount = created.filter((c) => c.evidenceIds.length > 0).length;
  return NextResponse.json({
    ok: true,
    keywords,
    insightsCreated: created.length,
    grounding: {
      hadEvidence,
      totalEvidence,
      groundedCount,
      note: hadEvidence && groundedCount < created.length
        ? "일부 인사이트가 evidence 근거 없이 생성됨 (LLM 합성). 사용자 확인 필요."
        : hadEvidence
          ? "모든 인사이트가 실제 evidence에 근거"
          : "수집된 evidence 없음 — LLM 일반 컨텐츠",
    },
    insights: created,
  });
}
