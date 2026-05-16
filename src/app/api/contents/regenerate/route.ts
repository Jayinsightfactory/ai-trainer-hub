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

// ───────────────────────────────────────────────────────────────
// 카피 후처리(sanitizeCardnewsPayload) — LLM 응답을 한국 카드뉴스 룰에 강제 정렬.
// 1) 끝 쉼표 제거  2) accent 검증·자동 보정  3) 글자수 한도 줄바꿈
// 4) 위인전 톤 어미 1차 치환  5) 변경 로그 changes[]에 누적
// ───────────────────────────────────────────────────────────────

const HEADLINE_LINE_LIMIT = 10;
const SUB_LIMIT = 18;
const BODY_LINE_LIMIT = 15;
const HOOK_LIMIT = 18;

const TRAIL_PUNCT = /[\s,，、]+$/;

function stripTrailingComma(s: string): string {
  if (!s) return s;
  return s.replace(TRAIL_PUNCT, (m) => (m.includes(",") || m.includes("，") || m.includes("、") ? "" : m));
}

/** "~한다 / ~지킨다 / ~됐어요" 등 위인전 톤 1차 치환 (LLM 1차 출력 정정용) */
function softenPreachyTone(s: string): string {
  if (!s) return s;
  return s
    .replace(/지킨다([\s.!?]|$)/g, "지키더라고요$1")
    .replace(/만든다([\s.!?]|$)/g, "만들어봤어요$1")
    .replace(/바꾼다([\s.!?]|$)/g, "바뀌더라고요$1")
    .replace(/됐어요([\s.!?]|$)/g, "되더라고요$1")
    .replace(/달라졌네([\s.!?]|$)/g, "달라졌더라고요$1");
}

/** 일상에서 안 쓰는 단어 → 한국 직장인 실제 단어로 치환 */
function naturalizeWords(s: string): string {
  if (!s) return s;
  return s
    .replace(/글체/g, "말투")
    .replace(/문체/g, "말투")
    .replace(/톤앤매너/g, "말투")
    .replace(/솔루션/g, "방법")
    .replace(/인사이트/g, "팁")
    .replace(/런칭/g, "공개")
    .replace(/에센셜/g, "꼭 필요한")
    .replace(/디테일/g, "세부사항")
    .replace(/퀄리티/g, "품질")
    .replace(/트렌디/g, "요즘 유행하는")
    .replace(/마인드셋/g, "마음가짐");
}

/** 본문 안에 @mamurs.ai.lab 외 다른 @계정명 자동 제거 (핸들은 좌하단 모서리 한 번만) */
function removeForeignHandles(s: string): string {
  if (!s) return s;
  // @ai_contents_lab, @anything 같은 다른 계정명 제거 (mamurs.ai.lab 외)
  return s
    .replace(/@(?!mamurs\.ai\.lab\b)[A-Za-z0-9._-]+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** 한 줄 글자수 초과 시 어절 단위로 가장 균형 가까운 위치에 \n 삽입 (1회만) */
function wrapIfTooLong(line: string, limit: number): string {
  if (!line || line.length <= limit) return line;
  if (line.includes("\n")) return line; // 이미 줄바꿈 있으면 손대지 않음
  const tokens = line.split(/(\s+)/);
  if (tokens.length < 3) return line; // 끊을 곳 없음
  // 누적 길이가 limit 근처에 가장 가까운 공백 위치 찾기
  let best = -1;
  let bestDiff = Infinity;
  let acc = 0;
  for (let i = 0; i < tokens.length; i++) {
    acc += tokens[i].length;
    if (/^\s+$/.test(tokens[i])) {
      const diff = Math.abs(acc - limit);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = i;
      }
    }
  }
  if (best < 0) return line;
  return tokens.slice(0, best).join("") + "\n" + tokens.slice(best + 1).join("");
}

function wrapMultiline(text: string, limit: number): string {
  if (!text) return text;
  return text
    .split("\n")
    .map((l) => wrapIfTooLong(l, limit))
    .join("\n");
}

/** accent 단어가 headline에 존재하는지 검증 후, 없으면 l2의 첫 핵심 어절로 대체 */
function fixAccent(l1: string, l2: string, accent: string): string {
  const headline = `${l1 || ""} ${l2 || ""}`;
  const a = (accent || "").trim();
  if (a && headline.includes(a)) return a;
  // 자동 후보: l2의 1~5자 한글 어절 중 첫 것
  const pool = (l2 || l1 || "").split(/\s+/).filter((w) => /^[가-힣0-9]{1,5}$/.test(w));
  if (pool.length > 0) return pool[0];
  return "";
}

interface CardCover {
  l1?: string;
  l2?: string;
  accent?: string;
  hook?: string;
  accentColor?: string;
}
interface CardBodyPage {
  p?: string;
  h?: string;
  sub?: string;
  body?: string;
  accent?: string;
}

const BRAND_ACCENT_COLOR = "#6C63FF"; // 메인 보라 — 모든 카드뉴스 고정

function sanitizeCover(cover: CardCover, changes: string[]): CardCover {
  const out: CardCover = { ...cover };
  // 위인전 톤 + 어색한 단어 치환
  if (out.l1) out.l1 = naturalizeWords(softenPreachyTone(out.l1));
  if (out.l2) out.l2 = naturalizeWords(softenPreachyTone(out.l2));
  if (out.hook) out.hook = naturalizeWords(softenPreachyTone(out.hook));
  // 브랜드 컬러 강제 — accentColor를 보라 #6C63FF로 통일
  if (out.accentColor !== BRAND_ACCENT_COLOR) {
    if (out.accentColor) changes.push(`커버 accentColor "${out.accentColor}" → "${BRAND_ACCENT_COLOR}" (브랜드 보라 고정)`);
    out.accentColor = BRAND_ACCENT_COLOR;
  }
  // 끝 쉼표 제거
  const beforeHook = out.hook;
  if (out.l1) out.l1 = stripTrailingComma(out.l1);
  if (out.l2) out.l2 = stripTrailingComma(out.l2);
  if (out.hook) out.hook = stripTrailingComma(out.hook);
  if (beforeHook && beforeHook !== out.hook) changes.push("후크 끝 쉼표 제거");
  // 글자수 한도 줄바꿈
  if (out.l1) out.l1 = wrapIfTooLong(out.l1, HEADLINE_LINE_LIMIT);
  if (out.l2) out.l2 = wrapIfTooLong(out.l2, HEADLINE_LINE_LIMIT);
  if (out.hook) out.hook = wrapIfTooLong(out.hook, HOOK_LIMIT);
  // accent 검증·보정
  const fixed = fixAccent(out.l1 || "", out.l2 || "", out.accent || "");
  if (fixed !== (out.accent || "")) {
    changes.push(`커버 accent "${out.accent || ""}" → "${fixed}" (헤드라인 내부 단어로 자동 보정)`);
    out.accent = fixed;
  }
  return out;
}

function sanitizeBodyPage(b: CardBodyPage, idx: number, changes: string[]): CardBodyPage {
  const out: CardBodyPage = { ...b };
  if (out.h) out.h = naturalizeWords(softenPreachyTone(out.h));
  if (out.sub) out.sub = naturalizeWords(softenPreachyTone(out.sub));
  if (out.body) {
    const before = out.body;
    out.body = removeForeignHandles(naturalizeWords(softenPreachyTone(out.body)));
    if (before !== out.body && before.match(/@(?!mamurs\.ai\.lab\b)[A-Za-z0-9._-]+/)) {
      changes.push(`P${idx + 2} 본문에서 외부 @계정명 자동 제거 (핸들은 @mamurs.ai.lab만)`);
    }
  }
  if (out.h) out.h = wrapMultiline(stripTrailingComma(out.h), HEADLINE_LINE_LIMIT);
  if (out.sub) out.sub = stripTrailingComma(out.sub);
  if (out.sub) out.sub = wrapIfTooLong(out.sub, SUB_LIMIT);
  if (out.body) out.body = wrapMultiline(out.body, BODY_LINE_LIMIT);
  // accent: h(헤드라인) 안에서 검증
  const hCombined = (out.h || "").split("\n");
  const l1 = hCombined[0] || "";
  const l2 = hCombined.slice(1).join(" ") || "";
  const fixed = fixAccent(l1, l2, out.accent || "");
  if (fixed !== (out.accent || "")) {
    changes.push(`P${idx + 2} accent "${out.accent || ""}" → "${fixed}" (헤드라인 내부 단어로 자동 보정)`);
    out.accent = fixed;
  }
  return out;
}

function sanitizeCardnewsPayload(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...data };
  const changes: string[] = Array.isArray(data.changes) ? [...(data.changes as string[])] : [];
  if (data.cover && typeof data.cover === "object") {
    out.cover = sanitizeCover(data.cover as CardCover, changes);
  }
  if (Array.isArray(data.body)) {
    out.body = (data.body as CardBodyPage[]).map((b, i) => sanitizeBodyPage(b, i, changes));
  }
  out.changes = changes;
  return out;
}

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
8. **글자수 한도 엄수**: 헤드라인 한 줄 12자 이내, 부연 22자 이내, 본문 1줄 18자 이내, 후크 22자 이내. 초과 시 \\n 줄바꿈 또는 축약
9. 강조 단어(accent)는 l1 또는 l2 안에 **그대로 존재하는** 1~5자 한글 단어. 없으면 절대 지정 금지
10. body 페이지 수는 입력과 동일 유지 (P2~P7 = 6장)
11. **클릭 요소 필수**: 모든 헤드라인은 [숫자 충격 / 약속·미스터리 / 자백·공감 / 시간압박·소속감 / 역설] 중 최소 1개 포함. 정보 나열만 있으면 재작성
12. **위인전 톤 금지**: "~한다", "~지킨다", "~됐어요", "~달라졌네", 명언/슬로건체(2줄 대구) ❌. "~더라고요", "~해봤더니", "~잖아요", "~거든요" ✅
13. **쉼표 룰**: 헤드라인·후크·부연 끝에 쉼표 ❌ (마침표 또는 무문장부호). 한 줄에 쉼표 2개 이상 ❌

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
    const sanitized = sanitizeCardnewsPayload(parsed.data);
    return NextResponse.json({ ok: true, ...sanitized });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
