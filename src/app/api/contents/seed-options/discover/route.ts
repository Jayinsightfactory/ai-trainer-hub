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
 * Stage 1 — 연관 키워드 발굴 (사용자가 직접 조합해서 시드 작성용).
 * 키워드 1개 → 연관 키워드 풀 30개+ 단일 평면 배열.
 *
 * Body: { keyword: string }
 *
 * Response: {
 *   ok: true,
 *   keywords: [
 *     { text: string, kind: "tool"|"persona"|"time"|"result"|"failure"|"action"|"compare"|"other" },
 *     ... 30개+
 *   ]
 * }
 *
 * 사용자가 칩 다중 선택 → 직접 시드 작성 → Stage 2(카드 기획)로 이동.
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
keywords 배열의 length는 **반드시 30~50개**. 29개 이하 ❌.
모두 한국어 (외래어 도구명은 OK), 1~12자 짧은 키워드/표현.
중복 ❌. 동의어 ❌.

당신은 한국 인스타그램 1인칭 AI 큐레이터 채널(@mamurs.ai.lab)의 연관 키워드 발굴기입니다.
입력 키워드 1개를 받아, 사용자가 직접 조합해서 시드를 작성할 수 있도록 다양한 연관 키워드 풀을 평면 배열로 발굴합니다.

[다양성 — 다음 8가지 kind를 골고루 섞을 것]
- tool: 검증된 도구/서비스 이름 (NotebookLM·Cursor·Claude·Perplexity·Notion AI·ChatGPT Canvas·Gamma 등)
- persona: 페르소나/대상 (30대 직장인·1인 마케터·비개발자·자영업자·학생·기획자·디자이너·프리랜서 등)
- time: 시간/주기 (한 달·일주일·30일·3개월·매일·점심·출근 전·주말·새벽 등)
- result: 측정 가능한 결과 표현 (30분→3분·5시간 절약·1시간이 20분·매주 3건·월 30만→15만 등)
- failure: 실패/문제 표현 (30개 깔고 4개·구독 정리·삭제했어요·환불·결국 안 씀·실패작 10개 등)
- action: 1인칭 행동 (해봤더니·만들어봤어요·정리했어요·끊었어요·돌려봤어요·자동화·세팅 등)
- compare: 비교 표현 (5개 1주씩·VS 비교·맞붙여봤더니·3개 비교·진짜 쓸만한 1개 등)
- other: 트렌드 어휘 (신기능·후기·꿀팁 ❌·핵심·솔직·환상 깨짐·진짜 효과·반전 등)

[키워드 작성 규칙]
- 1~12자 짧게 (긴 문장 ❌)
- 한국 직장인 카톡 톤 (광고체 ❌, "꿀팁/꼭 알아야 할" ❌)
- 검증된 실데이터 표현만 (87% 같은 가짜 통계 ❌)
- 시드 조합용 재료 → 다른 키워드와 합쳐서 자연스러운 시드명이 만들어질 수 있어야

[출력 — JSON 객체만, markdown 코드블록 ❌]
{
  "keywords": [
    { "text": "NotebookLM", "kind": "tool" },
    { "text": "30대 직장인", "kind": "persona" },
    { "text": "한 달 써봤더니", "kind": "time" },
    { "text": "30분→3분", "kind": "result" },
    { "text": "30개 깔고 4개", "kind": "failure" },
    { "text": "해봤거든요", "kind": "action" },
    { "text": "VS 비교", "kind": "compare" },
    { "text": "솔직 후기", "kind": "other" }
    // ... 총 30~50개
  ]
}

[self-check 출력 직전 필수 확인]
- keywords.length >= 30 ✅
- 8가지 kind 모두 ≥3개 포함 ✅
- 중복 ❌`;

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
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `[입력 키워드]\n${keyword}\n\n위 키워드 기반 연관 키워드 풀 30~50개를 8가지 kind 골고루 섞어서 JSON으로 발굴하세요.`,
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

    const parsed = parseLLMJson<{ keywords: unknown[] }>(text);
    if (!parsed.ok) {
      return NextResponse.json(
        { ok: false, error: `JSON 파싱 실패: ${parsed.error}`, raw: parsed.raw },
        { status: 500 },
      );
    }

    const keywords = Array.isArray(parsed.data.keywords) ? parsed.data.keywords : [];
    return NextResponse.json({ ok: true, keywords });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
