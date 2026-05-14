import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

/**
 * POST /api/contents/seed-options
 * 시드 메타데이터(kw, claim, hook, tone)를 받아
 * 시드 기반 main 10안 + hook 10안 + 패키지 10안 전체 생성.
 *
 * Body: { n, kw, claim, hook, tone }
 * Response: { mainOptions:[10], hookOptions:[10], packages:[10] }
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { n, kw, claim, hook, tone } = body as {
    n?: number;
    kw?: string;
    claim?: string;
    hook?: string;
    tone?: string;
  };

  if (!kw || !claim) {
    return NextResponse.json(
      { ok: false, error: "kw·claim 필요" },
      { status: 400 },
    );
  }

  const SYSTEM_PROMPT = `당신은 한국 인스타그램 카드뉴스 카피라이터입니다.
시드(주제)를 받아 그 시드에 맞는 메인 헤드라인 10안, 후크 10안, 패키지(메인+후크 조합) 10안을 만듭니다.
기준: 뉴닉·어피티·캐릿·부읽남 패턴, 30~50대 직장인 톤, 외래어 ≤15%, 헤드라인 25자 이내.

[출력 형식 — JSON 객체만, markdown 코드블록 ❌]
{
  "mainOptions": [
    {"l1":"메인 1줄","l2":"메인 2줄 (강조 단어 포함)","accent":"강조 단어","accentColor":"#FF3B3B"},
    ... 총 10개, 톤 다양화 (자백/시크릿/노하우/경고/스토리/숫자 등)
  ],
  "hookOptions": [
    "후크 한 줄 1",
    ... 총 10개, 미스터리·역설·숫자·질문 등 다양
  ],
  "packages": [
    {"name":"패키지 이름","mainIdx":0,"hookIdx":0,"tone":"톤 설명"},
    ... 총 10개, mainOptions/hookOptions 인덱스 조합
  ]
}

[규칙]
- mainOptions: 모두 시드 주장(claim)을 다른 각도에서 표현. l2에 accent 단어 반드시 포함.
- accentColor: #FF3B3B(빨강) / #FF8A3D(앰버) / #FFD93D(골드) / #00D4AA(민트) 중 선택
- hookOptions: 시드 주장이 본문에서 풀릴 것을 암시하는 호기심 미끼
- packages: 10개의 main×hook 조합으로 톤 페어링 (예: 직설+자백, 시크릿+숫자, 경고+스토리 등)`;

  try {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      system: SYSTEM_PROMPT,
      prompt: `[시드 #${n ?? "?"}]\n키워드: ${kw}\n주장: ${claim}\n후크 예시: ${hook || ""}\n톤: ${tone || ""}\n\n위 시드 기반 main 10안 + hook 10안 + packages 10안을 JSON 객체로 반환하세요.`,
      temperature: 0.7,
    });

    const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
    let result: unknown;
    try {
      result = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) result = JSON.parse(match[0]);
      else
        return NextResponse.json(
          { ok: false, error: "JSON 파싱 실패", raw: text.slice(0, 500) },
          { status: 500 },
        );
    }

    return NextResponse.json({ ok: true, ...(result as Record<string, unknown>) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
