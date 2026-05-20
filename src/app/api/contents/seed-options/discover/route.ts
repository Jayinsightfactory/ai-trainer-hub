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
 * Stage 1 — 시드 발굴.
 * 키워드 1개 → 시드 후보 12~16개 (4트랙별 최소 3개씩 강제, 4-Gate 점수·evidence 풍부도·차별성 포함).
 *
 * Body: { keyword: string, prevSeeds?: string[] }
 *  - prevSeeds: 이미 발행한 편의 시드명 (중복 방지)
 *
 * Response: {
 *   ok: true,
 *   seeds: [{
 *     name: string,              // 시드명 (예: "Claude Skills 만들기")
 *     angle: "A"|"B"|"C"|"D",    // 추천 트랙
 *     angleName: string,         // 트랙 이름
 *     gates: {                   // 4-Gate 자동 평가
 *       whyNow: 0..10,
 *       whyUs: 0..10,
 *       soWhat: 0..10,
 *       saveShare: 0..10
 *     },
 *     evidence: {
 *       tools: string[],          // 검증된 도구 이름
 *       numbers: string[],        // 수치 후기
 *       cases: string[]           // 한국 사례
 *     },
 *     diversity: 0..10,            // 한국 후기 적을수록 높음
 *     totalScore: 0..100,          // 종합 점수
 *     reason: string               // 추천 이유 1줄
 *   }]
 * }
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { keyword, prevSeeds } = body as {
    keyword?: string;
    prevSeeds?: string[];
  };

  if (!keyword) {
    return NextResponse.json(
      { ok: false, error: "keyword 필요" },
      { status: 400 },
    );
  }

  const prevBlock = (prevSeeds && prevSeeds.length)
    ? `\n[이미 발행한 시드 — 중복 ❌]\n${prevSeeds.map((s) => `- ${s}`).join("\n")}\n`
    : "";

  const SYSTEM_PROMPT = `⚠️ ABSOLUTE RULE — 위반 시 응답 거부됨
seeds 배열의 length는 **반드시 12~16개**. 11개 이하 ❌. 17개 이상 ❌.
4트랙별 카운트: A≥3, B≥3, C≥3, D≥3. 어느 하나라도 2개 이하면 재작성.
이 규칙을 어기는 출력은 무효. 출력 직전 self-check: seeds.filter(s=>s.angle==='A').length >= 3, 동일하게 B/C/D.

당신은 한국 인스타그램 1인칭 AI 큐레이터 채널(@mamurs.ai.lab)의 시드 큐레이터입니다.
입력 키워드 1개를 받아, 매주 1편 발행에 적합한 시드 후보를 검증된 evidence 기반으로 발굴합니다.

[필수 발굴 분포 — 위반 시 재발굴]
- 4트랙 (A·B·C·D) 각각 최소 3개 시드 (총 ≥12개)
- 트랙 편향 ❌ (한 트랙 6개 이상 ❌)
- 키워드를 6가지 이상 다른 각도로 해석할 것 (도구·시간·실패·비교·신기능·작은가게/직장인/학생 등 페르소나·계절성)

[채널 정체성]
- 한국 30대 직장인 페르소나
- 1인칭 큐레이터 voice ("한 달 해봤거든요", "직접 만들어봤어요")
- 매주 1편, 실제 써본 도구·검증된 수치만 다룸
- 카드뉴스 8장 구조 (P1 후크 → P2 정보비대칭 → P3 1인칭 → P4-P6 3단계 → P7 결과 → P8 CTA)

[4 트랙]
A. 실행 가이드 — "방법 안 알려주는 X / 이렇게 하시면 돼요"
B. 신기능 활용 — "신기능 나왔는데 / 진짜 써봤더니"
C. 비교·검증 — "5개 1주씩 써봤어요 / 진짜는 1개"
D. 실패담 — "이거 하지 마요 / 30개 깔고 26개 삭제"

[4-Gate 평가 기준 (각 0~10)]
- whyNow: 지금 봐야 할 시의성 (신기능·시즌·트렌드)
- whyUs: 한국 후기 거의 없음 / 큐레이터 포지션 가능
- soWhat: 저장 가치 (도구 이름·수치·단계 박힘)
- saveShare: 행동 트리거 (다음 주에 1개부터 식)

[evidence 검증]
- tools: 실제 존재하는 도구 (Claude.ai·NotebookLM·클로바노트 등)
- numbers: 실제 후기에서 인용된 수치 ("30분→3분" 형식)
- cases: 한국 직장인·1인 사업가 실제 사례

[diversity 점수]
- 한국어 후기·블로그가 적을수록 높음 (10 = 거의 없음)
- viral 가능성과 직결

[totalScore]
totalScore = whyNow*2 + whyUs*2 + soWhat*3 + saveShare*2 + diversity*1

[금지]
- 이미 발행한 시드와 메시지 중복
- 가짜 통계 (87%·CEO 면담·3개월 인생역전)
- 광고체·강의팔이 톤
- 한국 직장인이 실제로 쓰지 않는 단어 (솔루션·인사이트·런칭 등)

[출력 — JSON 객체만, markdown 코드블록 ❌]
{
  "seeds": [
    {
      "name": "시드명 (10~20자, 명확)",
      "angle": "A|B|C|D",
      "angleName": "실행 가이드|신기능 활용|비교·검증|실패담",
      "gates": { "whyNow": 8, "whyUs": 7, "soWhat": 9, "saveShare": 8 },
      "evidence": {
        "tools": ["도구1", "도구2"],
        "numbers": ["30분→3분"],
        "cases": ["1인 마케터 사례"]
      },
      "diversity": 7,
      "totalScore": 75,
      "reason": "추천 이유 1줄"
    },
    ... 총 12~16개 (4트랙 각 ≥3개)
  ]
}

[정렬]
- totalScore 내림차순
- 12~16개 전부 반환 (5~10개로 잘라내지 말 것)`;

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
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `[입력 키워드]\n${keyword}\n${prevBlock}\n위 키워드 기반 시드 후보 5~10개를 검증된 evidence와 함께 JSON으로 발굴하세요.`,
          },
        ],
        temperature: 0.6,
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

    const parsed = parseLLMJson<{ seeds: unknown[] }>(text);
    if (!parsed.ok) {
      return NextResponse.json(
        { ok: false, error: `JSON 파싱 실패: ${parsed.error}`, raw: parsed.raw },
        { status: 500 },
      );
    }

    const seeds = Array.isArray(parsed.data.seeds) ? parsed.data.seeds : [];
    return NextResponse.json({ ok: true, seeds });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
