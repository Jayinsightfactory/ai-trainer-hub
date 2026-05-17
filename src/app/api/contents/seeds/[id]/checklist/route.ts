// GET /api/contents/seeds/[id]/checklist
// 시드 1개에 대한 자동 검증 체크리스트.
// 4개 카테고리 × N항목 → pass/fail/warn 결과.
//
// 검증 원칙 (사용자가 대화에서 강조한 모든 원칙 반영):
//   A. Traceability — root(키워드 → 인사이트 → evidence)까지 추적 가능
//   B. 실데이터 인용 — titleQuoted가 실제 evidence 원문에서 나왔는가
//   C. 카피 품질 — 한국어 자연체, 끝 쉼표·위인전체 금지, 글자수
//   D. UX 메타 — picked 상태, evidence 충분성, source URL 유효성

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CheckStatus = "pass" | "fail" | "warn" | "info";
interface CheckItem {
  id: string;
  category: "traceability" | "real_data" | "copy_quality" | "meta";
  name: string;
  status: CheckStatus;
  detail: string;
  fix?: string;
}

const PREACHY_PATTERNS = [
  /지킨다([\s.!?]|$)/,
  /만든다([\s.!?]|$)/,
  /바꾼다([\s.!?]|$)/,
  /해야한다([\s.!?]|$)/,
  /입니다\./,
];
const NATURAL_ENDINGS = /(더라고요|잖아요|거든요|네요|봤어요|해봤|봤더니|하더라구요)/;
const CLICK_HOOKS = /(\d+|진짜|결국|솔직히|드디어|왜|어떻게|언제까지|24일|7일|30일|얼마|만에|개|월|초)/;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const seed = await prisma.seed.findUnique({
    where: { id },
    include: {
      evidenceLinks: { include: { evidence: true } },
      thesis: { include: { insights: true } },
    },
  });
  if (!seed) return NextResponse.json({ ok: false, error: "seed not found" }, { status: 404 });

  const items: CheckItem[] = [];
  const evs = seed.evidenceLinks.map((l) => l.evidence);
  const title = seed.titleQuoted;
  const hook = seed.hookQuoted ?? "";

  // ─── A. Traceability ───────────────────────────
  items.push({
    id: "A1",
    category: "traceability",
    name: "키워드 존재",
    status: seed.keyword ? "pass" : "fail",
    detail: seed.keyword ? `"${seed.keyword}"` : "키워드 누락",
    fix: seed.keyword ? undefined : "시드 생성 시 keyword 필드 채워야 함",
  });
  items.push({
    id: "A2",
    category: "traceability",
    name: "근거 evidence ≥1",
    status: evs.length >= 1 ? (evs.length >= 3 ? "pass" : "warn") : "fail",
    detail: `${evs.length}건 (권장 ≥3)`,
    fix: evs.length === 0 ? "STEP 3에서 사례 검색·채택 필요" : undefined,
  });
  items.push({
    id: "A3",
    category: "traceability",
    name: "Thesis 연결 (주장→시드)",
    status: seed.thesisId ? "pass" : "warn",
    detail: seed.thesisId ? `Thesis "${seed.thesis?.claim?.slice(0, 30) ?? "?"}"` : "독립 시드 (Thesis 없음)",
    fix: seed.thesisId ? undefined : "STEP 3에서 주장 채택하면 자동 연결됨",
  });
  items.push({
    id: "A4",
    category: "traceability",
    name: "Insight 연결 (인사이트→Thesis→시드)",
    status: (seed.thesis?.insights?.length ?? 0) >= 1 ? "pass" : "warn",
    detail: `Thesis에 묶인 인사이트 ${seed.thesis?.insights?.length ?? 0}건`,
  });

  // ─── B. 실데이터 인용 ───────────────────────────
  const titleInEvidence = evs.some((e) => {
    const oneLine = e.textRaw.replace(/\s+/g, " ");
    return oneLine.includes(title.replace(/…$/, "").slice(0, 30));
  });
  items.push({
    id: "B1",
    category: "real_data",
    name: "titleQuoted 실제 evidence 원문 포함",
    status: titleInEvidence ? "pass" : evs.length === 0 ? "fail" : "warn",
    detail: titleInEvidence
      ? "원문 추적됨"
      : "titleQuoted가 evidence 원문과 일치 안 함 (LLM 합성 가능성)",
    fix: titleInEvidence ? undefined : "materializeSeed 다시 실행 또는 evidence 재채택",
  });
  const sourceCount = new Set(evs.map((e) => e.platform)).size;
  items.push({
    id: "B2",
    category: "real_data",
    name: "출처 다양성 (≥2 플랫폼)",
    status: sourceCount >= 2 ? "pass" : sourceCount === 1 ? "warn" : "fail",
    detail: `${sourceCount}개 플랫폼 (${[...new Set(evs.map((e) => e.platform))].join(", ") || "0"})`,
  });
  const allHaveUrl = evs.every((e) => e.sourceUrl?.startsWith("http"));
  items.push({
    id: "B3",
    category: "real_data",
    name: "모든 evidence sourceUrl 유효",
    status: evs.length === 0 ? "info" : allHaveUrl ? "pass" : "fail",
    detail: evs.length === 0 ? "evidence 없음" : allHaveUrl ? `${evs.length}/${evs.length}개 OK` : "일부 URL 누락",
  });

  // ─── C. 카피 품질 ───────────────────────────────
  const titleHasComma = /,\s*$/.test(title.trim());
  items.push({
    id: "C1",
    category: "copy_quality",
    name: "titleQuoted 끝 쉼표 금지",
    status: titleHasComma ? "fail" : "pass",
    detail: titleHasComma ? "끝 쉼표 발견" : "OK",
    fix: titleHasComma ? "rstrip 또는 마침표 변경" : undefined,
  });
  const preachyHit = PREACHY_PATTERNS.find((p) => p.test(title) || p.test(hook));
  items.push({
    id: "C2",
    category: "copy_quality",
    name: "위인전체·명령조 어미 금지",
    status: preachyHit ? "fail" : "pass",
    detail: preachyHit ? `패턴 발견: ${preachyHit.source}` : "OK",
    fix: preachyHit ? "~한다/~만든다/~지킨다 → ~더라고요/~해봤어요" : undefined,
  });
  const naturalHit = NATURAL_ENDINGS.test(title) || NATURAL_ENDINGS.test(hook);
  items.push({
    id: "C3",
    category: "copy_quality",
    name: "자연체 어미 사용 (~요, ~네 등)",
    status: naturalHit ? "pass" : "warn",
    detail: naturalHit ? "OK" : "친근한 자연체 어미 없음 (선택 사항)",
  });
  const clickHit = CLICK_HOOKS.test(title);
  items.push({
    id: "C4",
    category: "copy_quality",
    name: "헤드라인 클릭 요소 (숫자/자백/미스터리)",
    status: clickHit ? "pass" : "warn",
    detail: clickHit ? "숫자/시간/감정 단어 포함" : "구체적 단어 약함 (예: 7일, 결국, 진짜)",
  });
  items.push({
    id: "C5",
    category: "copy_quality",
    name: "titleQuoted 길이 적절 (10~80자)",
    status: title.length >= 10 && title.length <= 80 ? "pass" : "warn",
    detail: `${title.length}자`,
  });

  // ─── D. UX 메타 ───────────────────────────────
  items.push({
    id: "D1",
    category: "meta",
    name: "사용자 채택 (picked) 상태",
    status: seed.status === "picked" ? "pass" : seed.status === "rejected" ? "fail" : "warn",
    detail: seed.status,
  });
  items.push({
    id: "D2",
    category: "meta",
    name: "realityScore > 0",
    status: seed.realityScore > 0 ? "pass" : "warn",
    detail: `${seed.realityScore.toFixed(2)}`,
  });

  const summary = items.reduce(
    (a, c) => {
      a[c.status]++;
      return a;
    },
    { pass: 0, fail: 0, warn: 0, info: 0 } as Record<CheckStatus, number>,
  );
  const total = items.length;
  const score = Math.round(((summary.pass + summary.warn * 0.5) / (total - summary.info)) * 100);

  return NextResponse.json({
    ok: true,
    seedId: id,
    score,
    summary,
    total,
    items,
    seedSnapshot: {
      keyword: seed.keyword,
      titleQuoted: title,
      hookQuoted: hook,
      status: seed.status,
      evidenceCount: evs.length,
      realityScore: seed.realityScore,
    },
  });
}
