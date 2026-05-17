// POST /api/contents/insights/extract
// Body: { keyword: string, limit?: number }
// 동작: 해당 키워드의 Evidence를 묶음 단위로 Claude에 던져 "한 줄 인사이트 N개" 추출.
// 각 인사이트는 어떤 evidence들에서 나왔는지 evidenceIds 보존 (출처 추적).
//
// 원칙: Claude는 evidence 원문 안에서 *발견*만 한다. 새 사실 생성 ❌.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { parseLLMJson } from "@/lib/parse-llm-json";
import { signalSum } from "@/lib/sources/util";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const SYSTEM = `당신은 한국 콘텐츠 리서처입니다.
주어진 사람들의 실제 발언(댓글/포스트) 묶음에서 "반복적으로 나타나는 인사이트"만 한 줄로 뽑습니다.

규칙:
1. 인사이트는 evidence 원문 안에 *명시적으로 또는 강하게 함의되어* 있어야 합니다. 추측 ❌, 합성 ❌, 일반론 ❌.
2. 각 인사이트는 evidenceIds[] 로 어떤 발언에서 나왔는지 명시 (최소 2개 이상 동의해야 인사이트).
3. 1개 evidence에만 나오는 의견은 인사이트가 아닙니다 (개인 일화로 처리, 제외).
4. 한국어 한 줄 (50자 이내), 광고체·위인전체 ❌.

출력 — JSON 객체만 (markdown 금지):
{
  "insights": [
    { "text": "월 28,000원 GPT 결제는 무료 조합으로 대체 가능", "evidenceIds": ["abc123","def456","ghi789"] },
    ...
  ]
}`;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    keyword?: string;
    evidenceIds?: string[]; // STEP 1에서 사용자가 체크한 Evidence만 사용
    limit?: number;
  };
  const keyword = body.keyword?.trim();
  if (!keyword && !body.evidenceIds?.length) {
    return NextResponse.json({ ok: false, error: "keyword or evidenceIds required" }, { status: 400 });
  }
  const limit = Math.min(body.limit ?? 60, 100);

  // 1) Evidence 묶음 — evidenceIds 우선, 없으면 keyword 풀
  const where = body.evidenceIds?.length
    ? { id: { in: body.evidenceIds } }
    : { keyword: keyword! };
  const evs = await prisma.evidence.findMany({
    where,
    orderBy: [{ upvotes: "desc" }, { likes: "desc" }, { postedAt: "desc" }],
    take: limit,
    select: { id: true, platform: true, textRaw: true, upvotes: true, likes: true, replies: true, parentTitle: true, keyword: true },
  });
  const resolvedKeyword = keyword || evs[0]?.keyword || "unknown";

  if (evs.length < 2) {
    return NextResponse.json(
      { ok: false, error: `evidence too few (${evs.length}) — run /ingest first` },
      { status: 400 },
    );
  }

  // 2) Claude 프롬프트용 evidence 압축 (id + 80자 발췌)
  const compact = evs.map((e) => ({
    id: e.id,
    p: e.platform,
    t: e.textRaw.replace(/\s+/g, " ").slice(0, 200),
  }));

  let parsed: { ok: true; data: { insights?: Array<{ text?: string; evidenceIds?: string[] }> } } | { ok: false; error: string; raw?: string };
  try {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      system: SYSTEM,
      prompt: `[키워드] ${resolvedKeyword}\n\n[Evidence ${evs.length}개]\n${compact.map((c) => `- ${c.id} (${c.p}): ${c.t}`).join("\n")}\n\n위 발언들에서 반복되는 인사이트만 JSON으로 추출. 최소 2개 이상 evidence가 동의한 것만.`,
      temperature: 0.3,
    });
    parsed = parseLLMJson(text);
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error, raw: parsed.raw }, { status: 500 });
  }

  const validEvIds = new Set(evs.map((e) => e.id));
  const signalById = new Map(evs.map((e) => [e.id, signalSum(e)]));

  const insights = (parsed.data.insights ?? [])
    .map((i) => ({
      text: (i.text ?? "").trim().slice(0, 200),
      evidenceIds: (i.evidenceIds ?? []).filter((id) => validEvIds.has(id)),
    }))
    .filter((i) => i.text.length >= 5 && i.evidenceIds.length >= 2);

  // 기존 동일-키워드 후보 AI insight 삭제 후 재생성 (재실행 가능하게, 사용자 입력 보존)
  await prisma.insight.deleteMany({ where: { keyword: resolvedKeyword, thesisId: null, source: "ai" } });

  const created = await Promise.all(
    insights.map((i) =>
      prisma.insight.create({
        data: {
          keyword: resolvedKeyword,
          text: i.text,
          evidenceIds: i.evidenceIds,
          signalSum: i.evidenceIds.reduce((s, id) => s + (signalById.get(id) ?? 0), 0),
          source: "ai",
        },
      }),
    ),
  );

  return NextResponse.json({
    ok: true,
    keyword: resolvedKeyword,
    evidenceConsidered: evs.length,
    insightsCreated: created.length,
    insights: created,
  });
}

// GET — 키워드별 insight 목록
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const keyword = req.nextUrl.searchParams.get("keyword");
  const where = keyword ? { keyword } : {};
  const insights = await prisma.insight.findMany({
    where,
    orderBy: { signalSum: "desc" },
    take: 100,
  });
  return NextResponse.json({ ok: true, count: insights.length, insights });
}
