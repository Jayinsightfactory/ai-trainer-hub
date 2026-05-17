// POST /api/contents/insights/merge
// Body: { keywords: string[] }
// 사용자가 STEP 1에서 여러 출처(시드/YT 자동완성/DB 빈도)의 키워드 N개를 선택 →
// Claude가 이것들을 하나의 통합 컨텐츠 아이디어 한 줄로 합쳐 줌.
// 결과는 Insight 1건으로 저장 (source: "ai_merge", evidenceIds: []).

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const SYSTEM = `당신은 한국 콘텐츠 기획자입니다.
사용자가 선택한 키워드 N개를 *하나의 카드뉴스 아이디어* 한 줄로 통합합니다.

규칙:
1. 한국어 한 줄, 45자 이내.
2. 모든 키워드의 공통 결을 잡아 하나의 컨텐츠 시각으로 묶는다.
3. 구체적·반전·자백 톤 선호. 광고체/위인전체 ❌.
4. 자연체 어미 (~더라고요, ~했어요, ~네요).

예시:
- ["AI 자동화 후기", "n8n 워크플로우", "부수익"] → "n8n으로 첫 자동화 만들고 24일째에 50만원 찍은 후기"
- ["챗GPT 후기", "GPT 결제", "무료 대안"] → "월 28K GPT 결제 끊고 무료 4개로 한 달 버텨봤어요"

출력 — JSON만:
{"text": "..."}`;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!isAdmin(email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as { keywords?: string[] };
  const keywords = (body.keywords ?? []).map((s) => s.trim()).filter(Boolean).slice(0, 12);
  if (keywords.length === 0) {
    return NextResponse.json({ ok: false, error: "keywords required" }, { status: 400 });
  }

  try {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      system: SYSTEM,
      prompt: `[키워드 ${keywords.length}개]\n${keywords.map((k) => `- ${k}`).join("\n")}\n\n위 키워드들을 묶어 하나의 카드뉴스 아이디어 1줄로.`,
      temperature: 0.5,
    });
    // 단순 파싱 — {"text":"..."} 형태
    const m = text.match(/"text"\s*:\s*"([^"]+)"/);
    const merged = (m?.[1] ?? text.trim().replace(/^["']|["']$/g, "")).slice(0, 200);
    if (!merged) {
      return NextResponse.json({ ok: false, error: "empty merge result", raw: text }, { status: 500 });
    }

    // 첫 키워드를 대표 keyword로 (STEP 2/3 필터링 호환)
    const insight = await prisma.insight.create({
      data: {
        keyword: keywords[0],
        text: merged,
        evidenceIds: [],
        source: "ai_merge",
        createdBy: email!.toLowerCase(),
      },
    });

    return NextResponse.json({
      ok: true,
      keywordsUsed: keywords,
      insight,
      mergedText: merged,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
