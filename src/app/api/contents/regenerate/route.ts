import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { KOREAN_CARDNEWS_PLAYBOOK } from "@/lib/korean-cardnews-playbook";
import { parseLLMJson } from "@/lib/parse-llm-json";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

/**
 * POST /api/contents/regenerate
 * 검증 결과를 받아 critical/high 이슈를 해결한 새 카피를 반환.
 * 기본 톤·페르소나는 유지하면서 약속-보상·후크·외래어·우회 등 자동 정정.
 *
 * Body: {
 *   cover: {l1, l2, accent, hook},
 *   body: [{p, h, sub, body, accent}],
 *   validation: { overallScore, categoryScores, issues, koreanFit }
 * }
 * Response: {
 *   cover: {l1, l2, accent, hook},
 *   body: [{p, h, sub, body, accent}],
 *   changes: ["이슈 #1 해결: ...", ...]
 * }
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { cover, body: bodyPages, validation } = body as {
    cover?: { l1?: string; l2?: string; accent?: string; hook?: string };
    body?: Array<{ p?: string; h?: string; sub?: string; body?: string; accent?: string }>;
    validation?: unknown;
  };

  if (!cover || !Array.isArray(bodyPages) || !validation) {
    return NextResponse.json(
      { ok: false, error: "cover · body · validation 모두 필요합니다." },
      { status: 400 },
    );
  }

  const currentText = JSON.stringify({ cover, body: bodyPages }, null, 2);
  const validationText = JSON.stringify(validation, null, 2);

  const SYSTEM_PROMPT = `당신은 한국 인스타그램 카드뉴스 톱 계정(뉴닉·어피티·캐릿·부읽남) 수준의 콘텐츠 수정 전문가입니다.
현재 카드뉴스와 검증 결과를 받아 한국 문화 코드에 완벽히 맞는 새 버전을 생성합니다.

${KOREAN_CARDNEWS_PLAYBOOK}

위 플레이북을 모든 수정/생성에 반영하세요.

[수정 규칙]
1. critical / high 이슈는 반드시 해결
2. medium / low 이슈는 가능한 해결
3. 기본 톤·페르소나·시각 흐름은 유지 (드라마틱 재작성 ❌)
4. 약속-보상 매칭 보장: 커버 약속(예: "7가지")의 숫자 = 본문 실제 항목 수
5. 후크 미스터리는 본문에서 반드시 해결 (예: "7번째" 후크면 7번째 팁 명시)
6. 외래어 비율 ≤15% (GPT → 지피티 또는 한글 표현으로 일부 대체)
7. 한국 직장 문화 우회 톤 (직설 "끊었습니다" → "더 맞더라고요")
8. 헤드라인 25자 이내, 본문 1줄 30자 이내
9. 강조 단어(accent)는 헤드라인 안에 실제로 포함된 단어만
10. body 페이지 수는 입력과 동일 유지 (P2~P7 = 6장)

[출력 형식 — 정확히 다음 JSON만, markdown 코드블록 ❌, 설명 ❌]
{
  "cover": {
    "l1": "메인 1줄",
    "l2": "메인 2줄",
    "accent": "강조 단어",
    "hook": "후크 한 줄"
  },
  "body": [
    {
      "p": "P2 ...",
      "h": "메인 (줄바꿈 \\n 가능)",
      "sub": "부연 1줄",
      "body": "5줄 본문 (\\n 구분)",
      "accent": "강조 단어"
    }
  ],
  "changes": [
    "이슈 #1 해결: ...",
    "이슈 #2 해결: ..."
  ]
}`;

  try {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      system: SYSTEM_PROMPT,
      prompt: `[현재 카드뉴스]\n${currentText}\n\n[검증 결과]\n${validationText}\n\n위 검증 결과를 반영한 새 카드뉴스를 JSON 객체만으로 반환하세요.`,
      temperature: 0.5,
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
