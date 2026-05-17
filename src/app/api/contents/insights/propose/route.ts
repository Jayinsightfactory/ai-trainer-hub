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
  const context = (body.context ?? [])
    .map((s) => s.trim())
    .filter((s) => s && !keywords.includes(s))
    .slice(0, 30);

  let parsed: { ok: true; data: { insights?: Array<{ keyword?: string; text?: string }> } } | { ok: false; error: string; raw?: string };
  try {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      system: SYSTEM,
      prompt: `[키워드 ${keywords.length}개 — 인사이트 도출 대상]\n${keywords.map((k) => `- ${k}`).join("\n")}\n\n` +
        (context.length > 0
          ? `[관련 자동완성 트렌드 ${context.length}개 — 사람들 실제 관심 방향. 인사이트에 이 패턴 녹여서 더 구체적으로]\n${context.map((c) => `- ${c}`).join("\n")}\n\n`
          : "") +
        `각 키워드별 ${per}개 인사이트 후보를 JSON으로. 자동완성 트렌드가 있으면 그 구체적 방향성을 반영해서 막연하지 않게.`,
      temperature: 0.6,
    });
    parsed = parseLLMJson(text);
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error, raw: parsed.raw }, { status: 500 });
  }

  const validKw = new Set(keywords);
  const candidates = (parsed.data.insights ?? [])
    .map((i) => ({
      keyword: (i.keyword ?? "").trim(),
      text: (i.text ?? "").trim().slice(0, 200),
    }))
    .filter((i) => validKw.has(i.keyword) && i.text.length >= 5);

  // 기존 동일-키워드 AI 후보 중 evidence 미연결 + thesisId null 만 삭제 (재실행 가능)
  await prisma.insight.deleteMany({
    where: {
      keyword: { in: keywords },
      source: "ai",
      thesisId: null,
      evidenceIds: { isEmpty: true },
    },
  });

  const created = await Promise.all(
    candidates.map((c) =>
      prisma.insight.create({
        data: {
          keyword: c.keyword,
          text: c.text,
          evidenceIds: [],
          source: "ai",
        },
      }),
    ),
  );

  return NextResponse.json({
    ok: true,
    keywords,
    insightsCreated: created.length,
    insights: created,
  });
}
