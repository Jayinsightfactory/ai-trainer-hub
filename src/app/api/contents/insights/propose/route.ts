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

const SYSTEM = `당신은 한국 콘텐츠 기획자입니다.
주어진 키워드 N개에 대해 각각 "사람들이 궁금해 할 만한 인사이트 후보"를 한 줄씩 제안합니다.

규칙:
1. 각 인사이트는 한국어 한 줄 (40자 이내).
2. 광고·위인전체·자랑투 ❌. 친근한 발견 톤.
3. 추측이 아니라 "이런 결이 있을 것 같다" 정도. 사용자가 STEP 3에서 실제 사례로 검증할 거니까 부담 적게.
4. 키워드 N개 × perKeyword개 = 총 N×perKeyword개 후보.

출력 — JSON 객체만 (markdown 금지):
{
  "insights": [
    { "keyword": "AI 자동화", "text": "n8n으로 1시간 만에 첫 자동화 워크플로우 가능" },
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
  };
  const keywords = (body.keywords ?? []).map((s) => s.trim()).filter(Boolean).slice(0, 5);
  if (keywords.length === 0) {
    return NextResponse.json({ ok: false, error: "keywords required" }, { status: 400 });
  }
  const per = Math.max(1, Math.min(body.perKeyword ?? 3, 5));

  let parsed: { ok: true; data: { insights?: Array<{ keyword?: string; text?: string }> } } | { ok: false; error: string; raw?: string };
  try {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      system: SYSTEM,
      prompt: `[키워드 ${keywords.length}개]\n${keywords.map((k) => `- ${k}`).join("\n")}\n\n각 키워드별 ${per}개 인사이트 후보를 JSON으로.`,
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
