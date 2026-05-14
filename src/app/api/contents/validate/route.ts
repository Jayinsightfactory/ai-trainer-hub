import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { KOREAN_CARDNEWS_PLAYBOOK } from "@/lib/korean-cardnews-playbook";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/contents/validate
 * 카드뉴스 8장 전체 텍스트를 받아 한국 인스타 카드뉴스 10대 항목으로 검증.
 * 한국 톱 계정(뉴닉·어피티·캐릿·부읽남) 패턴 기준.
 *
 * Body: { cover: {main, hook, accent, l1, l2}, body: [{p, h, sub, body, accent}] }
 * Response: { overallScore, categoryScores, issues, koreanFit }
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { cover, body: bodyPages } = body as {
    cover?: { l1?: string; l2?: string; main?: string; hook?: string; accent?: string };
    body?: Array<{ p?: string; h?: string; sub?: string; body?: string; accent?: string }>;
  };

  if (!cover || !Array.isArray(bodyPages) || bodyPages.length === 0) {
    return NextResponse.json(
      { ok: false, error: "cover 와 body 가 필요합니다." },
      { status: 400 },
    );
  }

  // 검증 대상 텍스트 정리
  const contentText = [
    `[P1 COVER]`,
    `메인: ${cover.l1 || cover.main || ""} / ${cover.l2 || ""}`,
    `강조: ${cover.accent || ""}`,
    `후크: ${cover.hook || ""}`,
    "",
    ...bodyPages.map((b) =>
      [
        `[${b.p || ""}]`,
        `메인: ${(b.h || "").replace(/\n/g, " / ")}`,
        `부연: ${b.sub || ""}`,
        `강조: ${b.accent || ""}`,
        `본문:`,
        b.body || "",
      ].join("\n"),
    ),
  ].join("\n");

  const SYSTEM_PROMPT = `당신은 한국 인스타그램 카드뉴스 콘텐츠 검증 전문가입니다.
한국 톱 4대 계정(뉴닉·어피티·캐릿·부읽남)의 화법·후킹·문화 코드를 기준으로
입력된 카드뉴스(P1 커버 + 본문 페이지들)를 10대 항목으로 평가합니다.

${KOREAN_CARDNEWS_PLAYBOOK}

위 플레이북을 기준으로, 다음 10대 항목별로 0~10점 평가하세요.

[검증 카테고리]
1. promise — 약속-보상 매칭 (커버에서 약속한 것을 본문이 이행)
2. hook — 후크 미스터리 해결 (커버 후크가 본문에서 풀림)
3. target — 타깃 페르소나 일관성 (시크릿/분석/일반 섞임 ❌)
4. numbers — 시간·숫자 일관성 (Day 누락, 가지수 매칭)
5. tone — 톤 일관성 (자백/시크릿/광고 섞임 ❌)
6. prudence — 신중함 vs 충동성 (한국은 신중함 선호)
7. indirect — 적당한 우회 (한국 = 직설 과도 ❌)
8. english — 외래어 비율 (낮을수록 점수 ↑, 30% 넘으면 거부감)
9. social — 사회적 맥락 (눈치·상사·동료 톤 적절)
10. credibility — 수치 근거 (60%, ₩28,000 등 출처 신뢰)

[출력 형식 — 정확히 다음 JSON 만, markdown 코드블록 ❌, 설명 ❌]
{
  "overallScore": 0-100 정수,
  "categoryScores": {
    "promise": 0-10, "hook": 0-10, "target": 0-10, "numbers": 0-10,
    "tone": 0-10, "prudence": 0-10, "indirect": 0-10,
    "english": 0-10, "social": 0-10, "credibility": 0-10
  },
  "issues": [
    {
      "severity": "critical" | "high" | "medium" | "low",
      "category": "promise" | "hook" | "target" | "numbers" | "tone" | "prudence" | "indirect" | "english" | "social" | "credibility",
      "page": "P1" 또는 "P3" 또는 "P1↔P2~P7" 또는 "전체",
      "message": "발견된 문제 한 줄 (한국어)",
      "fix": "구체적인 수정 제안 한 줄 (한국어)"
    }
  ],
  "koreanFit": {
    "score": 0-10,
    "notes": "한국 문화 관점 종합 코멘트 1~3줄"
  }
}

[규칙]
- overallScore = categoryScores 평균 × 10 (반올림)
- issues는 발견된 것만 (없으면 빈 배열)
- severity 우선순위: critical > high > medium > low
- 절대 markdown 코드블록 사용 ❌, JSON 객체 자체만 출력`;

  try {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      system: SYSTEM_PROMPT,
      prompt: `다음 카드뉴스 8장을 검증하고 JSON 객체만 반환하세요.\n\n${contentText}`,
      temperature: 0.3,
    });

    // JSON 파싱 — markdown fence 제거 후 시도
    const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
    let result: unknown;
    try {
      result = JSON.parse(cleaned);
    } catch {
      // fallback: extract first {...} block
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        result = JSON.parse(match[0]);
      } else {
        return NextResponse.json(
          { ok: false, error: "JSON 파싱 실패", raw: text.slice(0, 500) },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ ok: true, ...(result as Record<string, unknown>) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
