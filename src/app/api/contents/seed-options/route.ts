import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { KOREAN_CARDNEWS_PLAYBOOK, SEED_OPTION_TONES } from "@/lib/korean-cardnews-playbook";

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

  const SYSTEM_PROMPT = `당신은 한국 인스타그램 카드뉴스 톱 4대 계정(뉴닉·어피티·캐릿·부읽남) 수준의 카피라이터입니다.
시드(주제)를 받아 메인 헤드라인 10안, 후크 10안, 패키지 10안을 한국 문화 코드에 맞춰 생성합니다.

${KOREAN_CARDNEWS_PLAYBOOK}

[mainOptions 10안 톤 매핑 — 반드시 각 인덱스에 해당 톤 적용]
${SEED_OPTION_TONES.map((t, i) => `  [${i}] ${t}`).join("\n")}

[hookOptions 10안 — 후킹 공식 A~H를 다양하게 조합]
- 각 후크는 본문에서 풀릴 미스터리·역설·숫자·자백 중 1개 이상 포함
- "직장인만 아는", "월급날", "회사에서 티 안 내고" 같은 한국 직장인 앵커 활용
- 외래어 ≤15%, 명령조 ❌, 자연스러운 친구 톤

[packages 10안 — main × hook 조합 톤 페어링]
- 자백+숫자 / 시크릿+위기 / 신조어+공감 / 권위폭로+해법 등
- name은 1~3어절 (예: "새벽 지피티족 자백", "월급 지키는 비밀")
- tone은 한국 문화 코드 기반 한 줄 설명

[출력 형식 — JSON 객체만, markdown 코드블록 ❌, 설명 ❌]
{
  "mainOptions": [
    {"l1":"메인 1줄(25자↓)","l2":"메인 2줄 (accent 단어 반드시 포함, 25자↓)","accent":"강조 단어(1~5자)","accentColor":"#FF3B3B|#FF8A3D|#FFD93D|#00D4AA"},
    ... 총 10개
  ],
  "hookOptions": ["후크 한 줄 1", ... 총 10개],
  "packages": [
    {"name":"패키지 이름(1~3어절)","mainIdx":0,"hookIdx":0,"tone":"톤 한 줄"},
    ... 총 10개
  ]
}

[규칙 요약]
- mainOptions: 시드 주장을 [톤 매핑]에 따라 10가지 각도로 표현. l2에 accent 단어 실제 포함.
- accentColor: 빨강=경고/위기, 앰버=강조, 골드=돈/이득, 민트=신뢰/해법
- hookOptions: 본문에서 풀릴 미스터리. 직설 ❌, 우회 ✅
- packages: 다른 mainIdx×hookIdx 조합 10개 (중복 ❌)`;

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
