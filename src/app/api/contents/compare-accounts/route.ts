import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { KOREAN_CARDNEWS_PLAYBOOK } from "@/lib/korean-cardnews-playbook";
import { parseLLMJson } from "@/lib/parse-llm-json";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/contents/compare-accounts
 * 카드뉴스를 한국 톱 4대 계정(뉴닉·어피티·캐릿·부읽남) 각각 톤으로 채점.
 * 각 계정 대비 우수/열위 항목과 종합 평가 반환.
 *
 * Body: { cover, body }
 * Response: {
 *   accounts: [
 *     { name:"뉴닉", score:0-100, strengths:[], weaknesses:[], verdict:"우수|동급|열위" },
 *     ... 4개
 *   ],
 *   overall: { score:0-100, summary:"...", topAccount:"캐릿", isCompetitive: true|false }
 * }
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { cover, body: bodyPages } = body as {
    cover?: { l1?: string; l2?: string; accent?: string; hook?: string };
    body?: Array<{ p?: string; h?: string; sub?: string; body?: string; accent?: string }>;
  };

  if (!cover || !Array.isArray(bodyPages) || bodyPages.length === 0) {
    return NextResponse.json(
      { ok: false, error: "cover · body 필요" },
      { status: 400 },
    );
  }

  const contentText = [
    `[P1 COVER] 메인: ${cover.l1 || ""} / ${cover.l2 || ""} · 강조: ${cover.accent || ""} · 후크: ${cover.hook || ""}`,
    ...bodyPages.map(
      (b) =>
        `[${b.p}] 메인: ${(b.h || "").replace(/\n/g, " / ")} · 부연: ${b.sub || ""} · 본문: ${(b.body || "").replace(/\n/g, " / ")} · 강조: ${b.accent || ""}`,
    ),
  ].join("\n");

  const SYSTEM_PROMPT = `당신은 한국 인스타그램 카드뉴스 콘텐츠 평가 전문가입니다.
입력된 카드뉴스를 한국 톱 4대 계정의 각 화법 기준으로 채점하고, 우수/열위 항목과 종합 경쟁력을 평가합니다.

${KOREAN_CARDNEWS_PLAYBOOK}

[4대 계정 채점 기준]
1. 뉴닉(32만, 시사 큐레이션)
   - 친구 톤 "~한대" 사용 여부 / 정보 비대칭 해소 / 사건→배경→의미→영향 흐름

2. 어피티(27만, 머니)
   - 충격 숫자 시작 / "친한 누나" 친근 조언체 / 사례→원리→액션 / 정확한 금액·퍼센트

3. 캐릿(35만, MZ 트렌드)
   - 신조어/페르소나 명명력 (OO족, OO러) / 또래 위트 / 현상→분석→인사이트
   - 핵심 무기 — 이름 붙이기로 현상 정의

4. 부읽남(24만, 부동산/투자)
   - 신중한 멘토 톤 / 위기-기회 대비 / "이것 모르면 손해" / 결론→근거→행동

[채점 규칙]
- 각 계정마다 0~100점 (그 계정에 응모한다면 얼마나 어울리는지)
- strengths: 그 계정 패턴 대비 잘된 점 (1~3개)
- weaknesses: 부족한 점 (1~3개)
- verdict: "우수"(85+) / "동급"(70~84) / "열위"(<70)

[전체 평가]
- overall.score: 4계정 평균
- overall.summary: 한국 인스타 카드뉴스 시장 경쟁력 종합 2~3줄
- overall.topAccount: 가장 잘 맞는 계정 (이 콘텐츠는 OO 스타일에 가장 적합)
- overall.isCompetitive: overall.score >= 75 이면 true (즉 톱 계정과 경쟁 가능)

[출력 형식 — JSON 객체만, markdown 코드블록 ❌, 설명 ❌]
{
  "accounts": [
    {"name":"뉴닉","score":0-100,"strengths":["..."],"weaknesses":["..."],"verdict":"우수|동급|열위"},
    {"name":"어피티","score":0-100,"strengths":[],"weaknesses":[],"verdict":""},
    {"name":"캐릿","score":0-100,"strengths":[],"weaknesses":[],"verdict":""},
    {"name":"부읽남","score":0-100,"strengths":[],"weaknesses":[],"verdict":""}
  ],
  "overall": {
    "score": 0-100,
    "summary": "종합 평가 2~3줄",
    "topAccount": "캐릿",
    "isCompetitive": true|false
  }
}`;

  try {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      system: SYSTEM_PROMPT,
      prompt: `다음 카드뉴스를 4대 계정 기준으로 채점하고 JSON 객체만 반환하세요.\n\n${contentText}`,
      temperature: 0.3,
    });

    const parsed = parseLLMJson<Record<string, unknown>>(text);
    if (!parsed.ok) {
      return NextResponse.json(
        { ok: false, error: `JSON 파싱 실패: ${parsed.error}`, raw: parsed.raw },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, ...parsed.data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
