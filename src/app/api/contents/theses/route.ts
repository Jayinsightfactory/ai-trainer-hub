// GET  /api/contents/theses                       — 주장 목록 (rank ASC, status)
// POST /api/contents/theses  body:{ keyword? }    — 같은 키워드의 Insight들을 클러스터링 → Thesis N개 생성
// PATCH/api/contents/theses  body:{ id, status }  — 사용자가 주장 선택/제외
//
// 클러스터링 v1: Claude로 의미 그룹화 + 각 그룹의 대표 topic·claim 1줄 생성.
// 임베딩 기반 자동 클러스터링은 v2 (현재는 Insight 풀이 작으니 LLM 직접 그룹화로 충분).

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { parseLLMJson } from "@/lib/parse-llm-json";
import { materializeSeedsForThesis } from "@/lib/sources/materializer";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const CLUSTER_SYSTEM = `당신은 한국 콘텐츠 큐레이터입니다.
인사이트 목록을 받아 의미가 가까운 것끼리 묶고, 각 묶음의 주제(topic)·주장(claim)을 한 줄씩 뽑습니다.

규칙:
1. topic: 명사구 1~2어절 (예: "GPT 무료 대체", "엑셀 함수 없이 분석")
2. claim: 주장 한 줄, 22자 이내 (예: "유료 GPT 끊고 무료 4개로 충분")
3. 한 묶음에 insight 최소 2개. 단독 insight는 묶음 만들지 말 것.
4. 묶음 개수는 데이터에 비례 — 인사이트 6개면 2~3 묶음, 12개면 3~5 묶음. 강제 5개 ❌.

출력 — JSON 객체만:
{
  "theses": [
    { "topic":"GPT 무료 대체", "claim":"유료 끊고 무료 4개로 충분", "insightIds":["abc","def","ghi"] },
    ...
  ]
}`;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const status = req.nextUrl.searchParams.get("status");
  const theses = await prisma.thesis.findMany({
    where: status ? { status } : {},
    orderBy: [{ rank: "asc" }, { realityScore: "desc" }],
    include: {
      insights: {
        select: { id: true, text: true, signalSum: true, evidenceIds: true },
      },
      _count: { select: { seeds: true } },
    },
  });
  return NextResponse.json({
    ok: true,
    count: theses.length,
    theses: theses.map((t) => ({
      id: t.id,
      topic: t.topic,
      claim: t.claim,
      rank: t.rank,
      status: t.status,
      insightCount: t.insightCount,
      realityScore: Number(t.realityScore.toFixed(2)),
      seedCount: t._count.seeds,
      insights: t.insights,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { keyword?: string };
  const where = body.keyword?.trim() ? { keyword: body.keyword.trim(), thesisId: null } : { thesisId: null };
  const insights = await prisma.insight.findMany({
    where,
    orderBy: { signalSum: "desc" },
    take: 50,
  });
  if (insights.length < 2) {
    return NextResponse.json(
      { ok: false, error: `unassigned insights too few (${insights.length})` },
      { status: 400 },
    );
  }

  const compact = insights.map((i) => ({ id: i.id, t: i.text, s: i.signalSum }));

  let parsed: { ok: true; data: { theses?: Array<{ topic?: string; claim?: string; insightIds?: string[] }> } } | { ok: false; error: string; raw?: string };
  try {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      system: CLUSTER_SYSTEM,
      prompt: `[Insight ${insights.length}개]\n${compact.map((c) => `- ${c.id} (signal=${c.s.toFixed(1)}): ${c.t}`).join("\n")}\n\n위 인사이트들을 의미 묶음으로 클러스터링하고 각 묶음의 topic·claim을 뽑아 JSON으로.`,
      temperature: 0.4,
    });
    parsed = parseLLMJson(text);
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error, raw: parsed.raw }, { status: 500 });
  }

  const validInsightIds = new Set(insights.map((i) => i.id));
  const signalByInsightId = new Map(insights.map((i) => [i.id, i.signalSum]));
  const platformsByInsightId = new Map<string, Set<string>>();
  // platform 다양성 계산을 위해 evidence 한번 더 lookup (적은 N이므로 OK)
  for (const i of insights) {
    if (i.evidenceIds.length === 0) continue;
    const evs = await prisma.evidence.findMany({
      where: { id: { in: i.evidenceIds } },
      select: { platform: true },
    });
    platformsByInsightId.set(i.id, new Set(evs.map((e) => e.platform)));
  }

  const theses = (parsed.data.theses ?? [])
    .map((t) => ({
      topic: (t.topic ?? "").trim().slice(0, 50),
      claim: (t.claim ?? "").trim().slice(0, 100),
      insightIds: (t.insightIds ?? []).filter((id) => validInsightIds.has(id)),
    }))
    .filter((t) => t.topic && t.claim && t.insightIds.length >= 2);

  if (theses.length === 0) {
    return NextResponse.json({ ok: false, error: "no valid theses produced" }, { status: 500 });
  }

  // 기존 candidate thesis 제거 (재실행 가능) — picked/rejected는 보존
  await prisma.thesis.deleteMany({ where: { status: "candidate" } });

  const created = [];
  let rank = 1;
  for (const t of theses) {
    const platforms = new Set<string>();
    let signalSum = 0;
    for (const iid of t.insightIds) {
      signalSum += signalByInsightId.get(iid) ?? 0;
      platformsByInsightId.get(iid)?.forEach((p) => platforms.add(p));
    }
    const realityScore = signalSum * (1 + 0.3 * Math.max(0, platforms.size - 1));

    const thesis = await prisma.thesis.create({
      data: {
        topic: t.topic,
        claim: t.claim,
        rank: rank++,
        insightCount: t.insightIds.length,
        realityScore,
      },
    });
    await prisma.insight.updateMany({
      where: { id: { in: t.insightIds } },
      data: { thesisId: thesis.id },
    });
    created.push(thesis);
  }

  return NextResponse.json({
    ok: true,
    insightsConsidered: insights.length,
    thesesCreated: created.length,
    theses: created,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as { id?: string; status?: string };
  if (!body.id || !body.status || !["candidate", "picked", "rejected"].includes(body.status)) {
    return NextResponse.json({ ok: false, error: "id + status(candidate|picked|rejected) required" }, { status: 400 });
  }
  const updated = await prisma.thesis.update({
    where: { id: body.id },
    data: { status: body.status },
  });
  // picked 즉시 시드 materialize — STEP 3 선택 → STEP 4 시드 자동 등장
  let seedResult: Awaited<ReturnType<typeof materializeSeedsForThesis>> = null;
  if (body.status === "picked") {
    seedResult = await materializeSeedsForThesis(body.id);
  }
  return NextResponse.json({ ok: true, thesis: updated, seed: seedResult });
}
