import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { parseLLMJson } from "@/lib/parse-llm-json";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

/**
 * POST /api/contents/seed-options/discover
 *
 * Stage 1 — 키워드 1개 → 3그룹 칩 풀.
 * 사용자가 그룹별로 칩 선택해서 직접 시드 조합.
 *
 * Body: { keyword: string }
 *
 * Response: {
 *   ok: true,
 *   groups: {
 *     seeds:    [{ text }, ...]   // 🌱 시드명 후보 (명사형 짧은 주제 — 회의록 자동화·강의 환상 깨기 같은)
 *     related:  [{ text, kind }]  // 🔗 연관 키워드 (도구·대상·시간·결과·실패·행동·비교)
 *     suggest:  [{ text }, ...]   // 🔥 자동완성 (사람들이 실제 검색하는 짧은 완성형)
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { keyword } = body as { keyword?: string };

  if (!keyword) {
    return NextResponse.json(
      { ok: false, error: "keyword 필요" },
      { status: 400 },
    );
  }

  const SYSTEM_PROMPT = `⚠️ ABSOLUTE RULE
3그룹 출력. 각 그룹 length:
- seeds: 12~16개 (시드명 후보 = 명사형 짧은 주제. 예: "회의록 자동화", "AI 도구 정리", "강의 환상 깨기")
- related: 30~40개 (연관 키워드. 도구·대상·시간·결과·실패·행동·비교 골고루)
- suggest: 15~20개 (자동완성. 사람들이 실제로 입력하는 짧은 검색 표현)

당신은 한국 인스타그램 1인칭 AI 큐레이터 채널(@mamurs.ai.lab)의 키워드 풀 발굴기입니다.
입력 키워드 1개를 받아, 사용자가 3그룹에서 칩 골라 조합해서 시드 작성할 수 있도록 발굴합니다.

[그룹 정의]
🌱 seeds = 명사형 시드명 후보
  - 1~5어절 짧은 주제 (예: "회의록 자동화", "AI 강의 환상 깨기", "구독료 정리")
  - 행동/결과 X, 주제·소재만
  - 12~16개

🔗 related = 연관 키워드 (kind 분류)
  - tool: 검증된 도구 이름 (NotebookLM·Cursor·Claude·Perplexity 등)
  - persona: 페르소나 (30대 직장인·1인 마케터·비개발자 등)
  - time: 시간/주기 (한 달·3개월·매일 등)
  - result: 측정 결과 (30분→3분·5시간 절약 등)
  - failure: 실패 표현 (30개 깔고 4개·환불·결국 안 씀 등)
  - action: 1인칭 행동 어미 (해봤더니·만들어봤어요 등)
  - compare: 비교 표현 (VS·5개 1주씩 등)
  - other: 트렌드 어휘 (신기능·환상 깨짐·반전 등)
  - 30~40개, 8가지 kind 골고루

🔥 suggest = 자동완성 (사람들 실제 검색 표현)
  - 입력 키워드 뒤에 자주 붙는 표현 (예: "ai 활용법", "ai 자동화 후기", "ai 부수익", "ai 자소서")
  - 1~5어절, 짧고 검색 친화적
  - 15~20개

[공통 규칙]
- 한국어 (외래어 도구명은 OK)
- 광고체·꿀팁/꼭 알아야 할 ❌
- 가짜 통계 ❌

[출력 JSON 형식, markdown 코드블록 ❌]
{
  "groups": {
    "seeds": [{ "text": "회의록 자동화" }, ...],
    "related": [{ "text": "NotebookLM", "kind": "tool" }, ...],
    "suggest": [{ "text": "ai 활용법" }, ...]
  }
}

[self-check 직전 확인]
- seeds.length >= 12 ✅
- related.length >= 30 ✅
- suggest.length >= 15 ✅`;

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "ANTHROPIC_API_KEY missing" }, { status: 500 });
    }

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 6000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `[입력 키워드]\n${keyword}\n\n위 키워드 기반 3그룹 풀 (seeds·related·suggest)을 JSON으로 발굴하세요.`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!r.ok) {
      const errBody = await r.text();
      return NextResponse.json(
        { ok: false, error: `Anthropic ${r.status}: ${errBody.slice(0, 300)}` },
        { status: 500 },
      );
    }

    const data = (await r.json()) as { content?: Array<{ type: string; text?: string }> };
    const text = data.content?.filter((c) => c.type === "text").map((c) => c.text || "").join("\n") || "";

    const parsed = parseLLMJson<{ groups: { seeds?: unknown[]; related?: unknown[]; suggest?: unknown[] } }>(text);
    if (!parsed.ok) {
      return NextResponse.json(
        { ok: false, error: `JSON 파싱 실패: ${parsed.error}`, raw: parsed.raw },
        { status: 500 },
      );
    }

    const g = parsed.data.groups || {};
    return NextResponse.json({
      ok: true,
      groups: {
        seeds: Array.isArray(g.seeds) ? g.seeds : [],
        related: Array.isArray(g.related) ? g.related : [],
        suggest: Array.isArray(g.suggest) ? g.suggest : [],
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
