// 시드 → 카드뉴스 8장 (cover + body 6 + 정체성) + Gemini 이미지 프롬프트.
// 한국어 카드뉴스 룰: 12자 이내 헤드라인, accent 단어, 자연체 어미, 위인전체 금지.

import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { parseLLMJson } from "@/lib/parse-llm-json";

export interface SeedInput {
  keyword: string;
  titleQuoted: string;
  hookQuoted: string | null;
  evidenceSnippets: string[]; // 채택된 evidence 원문 일부 (인용 참고용)
  thesisTopic?: string;
  thesisClaim?: string;
  insightTexts?: string[]; // 채택된 인사이트 텍스트
}

export interface CoverCopy {
  l1: string;
  l2: string;
  accent: string;
  accentColor: string; // #FF3B3B | #FF8A3D | #FFD93D | #00D4AA
  hook: string;
}

export interface BodyPage {
  p: string; // "P2 Day 1" 같은 라벨
  h: string; // 헤드라인 (두 줄 가능)
  sub: string; // 부연
  body: string; // 본문 (4-6줄)
  accent: string;
}

export interface CardnewsPayload {
  cover: CoverCopy;
  body: BodyPage[]; // P2~P7 (6장)
  identity: BodyPage; // P8 정체성 페이지
  meta: { keyword: string; usedInsightCount: number; usedEvidenceCount: number };
}

const SYSTEM = `당신은 한국 인스타그램 카드뉴스 톱 4대 계정(뉴닉·어피티·캐릿·부읽남) 수준의 콘텐츠 작가입니다.
주어진 시드(주제·핵심 인용·채택 인사이트·근거 발언)로 카드뉴스 8장을 한 번에 작성합니다.

[강제 룰 — 모두 통과해야 함]
- l1, l2 각 12자 이내. accent 단어는 반드시 l1 또는 l2에 그대로 존재.
- accentColor: 빨강 #FF3B3B(경고) / 앰버 #FF8A3D(강조) / 골드 #FFD93D(돈·이득) / 민트 #00D4AA(신뢰)
- hook: 22자 이내. 본문에서 풀릴 미스터리.
- 위인전체 ❌: ~한다, ~지킨다, ~만든다, ~됐어요, ~달라졌네, ~입니다 과다 금지
- 권장 어미: ~더라고요, ~해봤어요, ~잖아요, ~거든요, ~네요
- 명령조 ❌, 광고체 ❌, 자랑투 ❌
- 본문 페이지(P2~P7): 각 4~6줄, 구체적 숫자/시간/조건 포함
- 헤드라인은 클릭 요소 [숫자/약속·미스터리/자백·공감/시간압박/역설] 중 1개 이상
- 외래어 ≤15%, 한국 직장인 앵커 자주 ("팀장이", "사수가", "회사에서")

[구조]
P1 커버: l1, l2, accent, accentColor, hook
P2~P7: 6장의 본문 페이지 (시간순/단계순/방식순 자연 흐름)
P8 정체성: 채널 정체성 + 다음 콘텐츠 예고

[출력 — JSON 객체만, markdown 금지]
{
  "cover": {"l1":"...","l2":"...","accent":"...","accentColor":"#...","hook":"..."},
  "body": [
    {"p":"P2 Day 1","h":"두 줄\\n헤드라인","sub":"부연 한 줄","body":"본문 4-6줄","accent":"강조 단어"},
    ... 총 6개 (P2~P7)
  ],
  "identity": {"p":"P8 정체성","h":"채널 정체성","sub":"매주 1편 ...","body":"우리는 ...","accent":"인사이트"}
}`;

export async function generateCardnews(input: SeedInput): Promise<{ ok: true; payload: CardnewsPayload } | { ok: false; error: string; raw?: string }> {
  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const evidenceBlock = input.evidenceSnippets.length
    ? `\n[채택된 실제 발언 ${input.evidenceSnippets.length}건 — 본문에 자연스럽게 녹여서 인용]\n${input.evidenceSnippets.slice(0, 6).map((e, i) => `${i + 1}. ${e.slice(0, 200)}`).join("\n")}\n`
    : "";
  const insightBlock = input.insightTexts?.length
    ? `\n[채택된 인사이트 ${input.insightTexts.length}건 — 컨텐츠 방향성]\n${input.insightTexts.map((t) => `- ${t}`).join("\n")}\n`
    : "";
  const thesisBlock = input.thesisClaim
    ? `\n[주장 (STEP 3 채택)]\n주제: ${input.thesisTopic}\n주장: ${input.thesisClaim}\n`
    : "";

  const prompt = `[시드]\n키워드: ${input.keyword}\n핵심 인용: "${input.titleQuoted}"\n후크: "${input.hookQuoted ?? ""}"${thesisBlock}${insightBlock}${evidenceBlock}\n\n위 시드로 카드뉴스 8장(P1 커버 + P2~P7 본문 + P8 정체성)을 JSON으로 생성하세요.`;

  try {
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      system: SYSTEM,
      prompt,
      temperature: 0.6,
    });
    const parsed = parseLLMJson<CardnewsPayload>(text);
    if (!parsed.ok) return { ok: false, error: parsed.error, raw: parsed.raw };
    const payload = sanitize(parsed.data, input);
    return { ok: true, payload };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

function sanitize(p: CardnewsPayload, input: SeedInput): CardnewsPayload {
  const COLORS = new Set(["#FF3B3B", "#FF8A3D", "#FFD93D", "#00D4AA"]);
  if (!COLORS.has(p.cover.accentColor)) p.cover.accentColor = "#FFD93D";
  // 끝 쉼표 제거
  p.cover.l1 = stripTail(p.cover.l1).slice(0, 16);
  p.cover.l2 = stripTail(p.cover.l2).slice(0, 16);
  p.cover.hook = stripTail(p.cover.hook).slice(0, 30);
  p.cover.accent = (p.cover.accent || "").trim();
  // accent가 l1/l2에 없으면 첫 단어로 fallback
  const both = `${p.cover.l1} ${p.cover.l2}`;
  if (!both.includes(p.cover.accent)) {
    p.cover.accent = (p.cover.l2 || p.cover.l1).split(/\s+/)[0] || input.keyword.slice(0, 4);
  }
  p.body = (p.body || []).slice(0, 6).map((b) => ({
    p: b.p || "P?",
    h: stripTail(b.h || ""),
    sub: stripTail(b.sub || "").slice(0, 80),
    body: (b.body || "").slice(0, 600),
    accent: (b.accent || "").trim(),
  }));
  if (p.identity) {
    p.identity.p = p.identity.p || "P8 정체성";
    p.identity.h = stripTail(p.identity.h || "");
    p.identity.sub = stripTail(p.identity.sub || "");
    p.identity.body = (p.identity.body || "").slice(0, 600);
  }
  p.meta = {
    keyword: input.keyword,
    usedInsightCount: input.insightTexts?.length ?? 0,
    usedEvidenceCount: input.evidenceSnippets.length,
  };
  return p;
}
function stripTail(s: string): string {
  return (s || "").replace(/[\s,，、]+$/g, "").trim();
}

// ─── Gemini 이미지 프롬프트 빌더 (한국어 카드뉴스 9:16) ───
export function buildCoverPrompt(c: CoverCopy, keyword: string): string {
  return `한국어 인스타그램 카드뉴스 커버 이미지 1장. 비율 9:16 (1080x1920).

배경 사진: ${inferBackgroundForKeyword(keyword)}. 35mm 다큐멘터리 사진 스타일, 얕은 심도, 자연스러운 순간. 인물은 상단 55% 영역, 하단 45%는 어두운 공간 — 이 어두운 공간 위에 텍스트.

이미지 하단 45% 영역에 다음 한글 텍스트를 정확히 렌더링 (Korean Hangul, 영어 번역 ❌, 글자 깨짐 ❌, 받침 정확히):

Headline — VERY LARGE bold white #F5F5F5 sans-serif (Pretendard Black style), 화면 폭의 80% 큰 크기:
"${c.l1}"
"${c.l2}"

Highlight only the word "${c.accent}" inside the headline above with a rounded rectangle background in ${c.accentColor} and white text on top.

Sub-line — directly under headline (tight spacing), medium gold #FFD93D italic, 헤드라인의 약 50% 크기:
"${c.hook}"

Bottom corner: small @nowlink_official handle in white #888888 7% size.

스타일: 한국 인스타그램 톱 카드뉴스 계정 풍 (뉴닉/어피티/캐릿). 차분한 색감, 노이즈 없음, 글자 선명.`;
}

export function buildBodyPrompt(b: BodyPage, index: number, keyword: string): string {
  return `한국어 인스타그램 카드뉴스 본문 ${b.p} 이미지 1장. 비율 9:16 (1080x1920).

배경: 단색 또는 미니멀 패턴 (P${index + 2}번째 페이지 톤). 키워드 "${keyword}" 관련 미니멀 그래픽 또는 아이콘 상단 30%.

중앙 65% 영역에 다음 한글 텍스트 (Pretendard, 글자 선명·받침 정확):

상단 라벨 (작게): "${b.p}"

큰 헤드라인 (white #F5F5F5, Bold, 폭 80%):
${b.h.split("\n").map((l) => `"${l}"`).join("\n")}

부연 (gold #FFD93D, italic, 헤드라인 60%):
"${b.sub}"

본문 (white #C7CED8, regular, 줄간격 넉넉히):
${b.body
  .split("\n")
  .map((l) => `"${l}"`)
  .join("\n")}

Highlight "${b.accent}" with ${index % 2 === 0 ? "#FF8A3D" : "#00D4AA"} 배경 강조.

하단 코너: 작게 페이지 번호 "${index + 2}/8" white #888888 5% 크기.`;
}

function inferBackgroundForKeyword(keyword: string): string {
  const k = keyword.toLowerCase();
  if (/gpt|claude|ai|llm|챗|클로드|인공지능|자동화|n8n|노코드|프롬프트/.test(k))
    return "평범한 30대 한국 직장인이 어두운 방에서 노트북을 보다가 깜짝 놀란 표정. 따뜻한 책상 조명 + 차가운 모니터 빛이 얼굴에 섞임";
  if (/부동산|주식|투자|돈|결제|부수익|재테크/.test(k))
    return "한국 카페에서 노트북 화면 + 카카오뱅크 잔액 알림 보고 미소 짓는 30대";
  if (/다이어트|홈트|운동|건강/.test(k))
    return "한국 가정 거실에서 매트 위 스트레칭하는 30대, 거울에 비친 자기 모습 보기";
  if (/요리|자취|인테리어/.test(k))
    return "원룸 작은 부엌에서 만든 한식 한 그릇 클로즈업, 따뜻한 백색 조명";
  if (/연애|결혼|육아|관계/.test(k))
    return "한국 카페 창가에서 휴대폰 보다가 한숨 쉬는 20-30대";
  if (/이직|연봉|보고서|회의|직장|커리어|면접/.test(k))
    return "한국 오피스 책상에서 모니터 보다가 인상 찌푸린 직장인";
  if (/독서|공부|영어|자격증|글쓰기/.test(k))
    return "한국 도서관 또는 카페 책상 위 노트와 책 클로즈업, 자연광";
  return "한국 일상 장면 (카페/사무실/집), 자연광, 평범한 30대 한 명";
}

// ─── Gemini Image API 호출 (Imagen 3 또는 Gemini 2.5 Flash Image) ───
export async function callGeminiImageAPI(prompt: string): Promise<{ ok: true; imageBase64: string; mimeType: string } | { ok: false; error: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false, error: "GEMINI_API_KEY missing" };
  try {
    // Imagen 3 generate endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${key}`;
    const body = {
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: "9:16" },
    };
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const errText = await r.text();
      return { ok: false, error: `Imagen ${r.status}: ${errText.slice(0, 200)}` };
    }
    const data = (await r.json()) as {
      predictions?: Array<{ bytesBase64Encoded?: string; mimeType?: string }>;
    };
    const p = data.predictions?.[0];
    if (!p?.bytesBase64Encoded) {
      return { ok: false, error: "no image in response" };
    }
    return { ok: true, imageBase64: p.bytesBase64Encoded, mimeType: p.mimeType ?? "image/png" };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
