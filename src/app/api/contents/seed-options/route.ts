import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { KOREAN_CARDNEWS_PLAYBOOK, SEED_OPTION_TONES } from "@/lib/korean-cardnews-playbook";
import { parseLLMJson } from "@/lib/parse-llm-json";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

// ───────────────────────────────────────────────────────────────
// mainOptions/hookOptions 후처리 — 끝 쉼표·위인전 톤·accent 검증·글자수 한도 강제.
// regenerate route의 sanitizeCardnewsPayload와 동일 정책 (중복 정의는 의도적 —
// 두 API의 응답 schema가 달라 공통화 시 분기 비용이 더 큼).
// ───────────────────────────────────────────────────────────────
const HEADLINE_LINE_LIMIT = 12;
const HOOK_LIMIT = 22;
const TRAIL_PUNCT = /[\s,，、]+$/;

function stripTrailingComma(s: string): string {
  if (!s) return s;
  return s.replace(TRAIL_PUNCT, (m) =>
    m.includes(",") || m.includes("，") || m.includes("、") ? "" : m,
  );
}
function softenPreachyTone(s: string): string {
  if (!s) return s;
  return s
    .replace(/지킨다([\s.!?]|$)/g, "지키더라고요$1")
    .replace(/만든다([\s.!?]|$)/g, "만들어봤어요$1")
    .replace(/바꾼다([\s.!?]|$)/g, "바뀌더라고요$1")
    .replace(/됐어요([\s.!?]|$)/g, "되더라고요$1")
    .replace(/달라졌네([\s.!?]|$)/g, "달라졌더라고요$1");
}
function wrapIfTooLong(line: string, limit: number): string {
  if (!line || line.length <= limit) return line;
  if (line.includes("\n")) return line;
  const tokens = line.split(/(\s+)/);
  if (tokens.length < 3) return line;
  let best = -1, bestDiff = Infinity, acc = 0;
  for (let i = 0; i < tokens.length; i++) {
    acc += tokens[i].length;
    if (/^\s+$/.test(tokens[i])) {
      const diff = Math.abs(acc - limit);
      if (diff < bestDiff) { bestDiff = diff; best = i; }
    }
  }
  if (best < 0) return line;
  return tokens.slice(0, best).join("") + "\n" + tokens.slice(best + 1).join("");
}
function fixAccent(l1: string, l2: string, accent: string): string {
  const headline = `${l1 || ""} ${l2 || ""}`;
  const a = (accent || "").trim();
  if (a && headline.includes(a)) return a;
  const pool = (l2 || l1 || "").split(/\s+/).filter((w) => /^[가-힣0-9]{1,5}$/.test(w));
  return pool[0] || "";
}

interface MainOpt { l1?: string; l2?: string; accent?: string; accentColor?: string }

function sanitizeSeedOptions(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...data };
  if (Array.isArray(data.mainOptions)) {
    out.mainOptions = (data.mainOptions as MainOpt[]).map((m) => {
      const next: MainOpt = { ...m };
      if (next.l1) next.l1 = wrapIfTooLong(stripTrailingComma(softenPreachyTone(next.l1)), HEADLINE_LINE_LIMIT);
      if (next.l2) next.l2 = wrapIfTooLong(stripTrailingComma(softenPreachyTone(next.l2)), HEADLINE_LINE_LIMIT);
      next.accent = fixAccent(next.l1 || "", next.l2 || "", next.accent || "");
      return next;
    });
  }
  if (Array.isArray(data.hookOptions)) {
    out.hookOptions = (data.hookOptions as string[]).map((h) =>
      wrapIfTooLong(stripTrailingComma(softenPreachyTone(h || "")), HOOK_LIMIT),
    );
  }
  return out;
}

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
- packages: 다른 mainIdx×hookIdx 조합 10개 (중복 ❌)

[강제 룰 — 위반 시 재작성]
- 각 l1, l2: **12자 이내** (초과하면 자연스러운 분할로 짧게)
- 각 hookOption: **22자 이내**
- accent: 반드시 l1 또는 l2에 **그대로 존재**하는 1~5자 한글 단어 (없는 단어 ❌)
- 끝 쉼표(,) 절대 금지 — 마침표 또는 무문장부호로 종료
- 위인전 톤 어미 ❌: "~한다", "~지킨다", "~만든다", "~됐어요", "~달라졌네", "~입니다" 과다
- 명언/슬로건체 2줄 대구 ❌ (예: "AI는 도구 / 내 말투는 내가 지킨다")
- 권장 어미 ✅: "~더라고요", "~해봤더니", "~잖아요", "~거든요", "~네요"
- 모든 헤드라인은 클릭 요소 5종 [숫자/약속·미스터리/자백·공감/시간압박/역설] 중 1개 이상 포함`;

  try {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      system: SYSTEM_PROMPT,
      prompt: `[시드 #${n ?? "?"}]\n키워드: ${kw}\n주장: ${claim}\n후크 예시: ${hook || ""}\n톤: ${tone || ""}\n\n위 시드 기반 main 10안 + hook 10안 + packages 10안을 JSON 객체로 반환하세요.`,
      temperature: 0.7,
    });

    const parsed = parseLLMJson<Record<string, unknown>>(text);
    if (!parsed.ok) {
      return NextResponse.json(
        { ok: false, error: `JSON 파싱 실패: ${parsed.error}`, raw: parsed.raw },
        { status: 500 },
      );
    }
    const sanitized = sanitizeSeedOptions(parsed.data);
    return NextResponse.json({ ok: true, ...sanitized });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
