// POST /api/contents/automate
// Body: { keyword: string, options?: { ingestLimit?, perKeyword?, generateImages? } }
//
// 한 키워드 → 6단계 자동 chain → 최종 카드뉴스 + (옵션) Gemini 이미지 8장.
// 사용자가 nowlink UI에서 클릭 안 하고 한 줄 입력만으로 전체 흐름 처리.
//
// 흐름:
//   1) ingest        — 키워드 수집 (YT/Reddit/Clien)
//   2) propose       — 인사이트 후보 생성 (evidence-grounded)
//   3) cluster       — 인사이트 → 주제·주장
//   4) materialize   — 주장 → 시드 (가장 높은 realityScore 1개 선택)
//   5) cardnews      — 시드 → 8장 카피 + Gemini 프롬프트
//   6) images        — (옵션) Gemini Imagen으로 이미지 8장 (GEMINI_API_KEY 있을 때)

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ADAPTERS, availablePlatforms } from "@/lib/sources";
import { classifyIsExperience, evidenceId } from "@/lib/sources/util";
import { materializeSeedForInsight } from "@/lib/sources/materializer";
import { generateCardnews, buildCoverPrompt, buildBodyPrompt, generateImageWithFallback } from "@/lib/cardnews-generator";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { parseLLMJson } from "@/lib/parse-llm-json";
import type { RawEvidence } from "@/lib/sources/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5분 (이미지 8장까지 포함 가능)

interface AutomateOpts {
  ingestLimit?: number;
  perKeyword?: number;
  generateImages?: boolean; // default true (키 있으면 시도)
}

interface StepLog {
  step: string;
  ok: boolean;
  elapsedSec: number;
  detail?: unknown;
  error?: string;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!isAdmin(email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as { keyword?: string; options?: AutomateOpts };
  const keyword = body.keyword?.trim();
  if (!keyword) {
    return NextResponse.json({ ok: false, error: "keyword required" }, { status: 400 });
  }
  const opt: AutomateOpts = body.options ?? {};
  const ingestLimit = opt.ingestLimit ?? 8;
  const perKeyword = opt.perKeyword ?? 3;
  const wantImages = opt.generateImages !== false;
  const startedAt = Date.now();
  const steps: StepLog[] = [];

  function logStep<T>(step: string, t0: number, ok: boolean, detail?: T, error?: string) {
    steps.push({ step, ok, elapsedSec: Math.round((Date.now() - t0) / 1000), detail, error });
  }

  // ─── 1) INGEST — YT/Reddit/Clien 수집 ─────────────────────
  const t1 = Date.now();
  const platforms = availablePlatforms().filter((p) => ADAPTERS[p].isAvailable());
  let evidenceUpserted = 0;
  for (const platform of platforms) {
    try {
      const raw = await ADAPTERS[platform].fetchByKeyword(keyword, { limit: ingestLimit });
      for (const e of raw) {
        if (!e.sourceUrl || !e.textRaw?.trim()) continue;
        const id = evidenceId(e);
        await prisma.evidence.upsert({
          where: { id },
          create: {
            id,
            platform: e.platform,
            sourceUrl: e.sourceUrl,
            author: e.author,
            authorUrl: e.authorUrl,
            textRaw: e.textRaw,
            lang: e.lang ?? "ko",
            postedAt: e.postedAt,
            upvotes: e.upvotes ?? 0,
            likes: e.likes ?? 0,
            replies: e.replies ?? 0,
            parentTitle: e.parentTitle,
            parentChannel: e.parentChannel,
            parentViews: e.parentViews,
            keyword,
            isExperience: classifyIsExperience(e.textRaw),
          },
          update: { upvotes: e.upvotes ?? 0, likes: e.likes ?? 0, replies: e.replies ?? 0 },
        });
        evidenceUpserted++;
      }
    } catch {
      // 한 플랫폼 실패해도 다음 진행
    }
  }
  logStep("ingest", t1, evidenceUpserted > 0, { keyword, evidenceUpserted, platforms });

  // ─── 2) PROPOSE — 인사이트 후보 (evidence-grounded) ────────
  const t2 = Date.now();
  const evs = await prisma.evidence.findMany({
    where: { keyword },
    orderBy: [{ upvotes: "desc" }, { likes: "desc" }, { postedAt: "desc" }],
    take: 10,
    select: { id: true, textRaw: true, platform: true, upvotes: true, likes: true },
  });
  const insightIds: string[] = [];
  if (evs.length === 0) {
    logStep("propose", t2, false, undefined, "no evidence to ground insights");
  } else {
    // 옛 후보 정리
    await prisma.insight.deleteMany({ where: { keyword, source: "ai", thesisId: null } });
    const compact = evs.map((e) => ({
      id: e.id,
      text: e.textRaw.replace(/\s+/g, " ").slice(0, 180),
      sig: (e.upvotes ?? 0) + (e.likes ?? 0),
      p: e.platform,
    }));
    const SYSTEM = `한국 직장인 콘텐츠 기획자. 키워드 + 실제 발언 보고 사람들이 클릭할 인사이트 N개 1줄씩.
규칙: 한국어 45자 이내, 구체적 숫자/시간/직장인 앵커, 자연체 어미(~더라고요), 위인전체/광고체 금지.
출력: {"insights":[{"text":"...","evidenceIds":["..."]}]} JSON만.`;
    try {
      const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const { text } = await generateText({
        model: anthropic("claude-sonnet-4-5"),
        system: SYSTEM,
        prompt: `[키워드] ${keyword}\n[실 발언 ${compact.length}건]\n${compact.map((c) => `[${c.id}](${c.p}/${c.sig}↑) ${c.text}`).join("\n")}\n\n${perKeyword}개 인사이트를 JSON으로. evidenceIds에 근거 ID 1개 이상.`,
        temperature: 0.5,
      });
      const parsed = parseLLMJson<{ insights?: Array<{ text?: string; evidenceIds?: string[] }> }>(text);
      if (parsed.ok) {
        const validIds = new Set(evs.map((e) => e.id));
        const valid = (parsed.data.insights ?? [])
          .map((i) => ({
            text: (i.text ?? "").trim().slice(0, 200),
            evidenceIds: (i.evidenceIds ?? []).filter((id) => validIds.has(id)),
          }))
          .filter((i) => i.text.length >= 5);
        for (const v of valid) {
          const created = await prisma.insight.create({
            data: { keyword, text: v.text, evidenceIds: v.evidenceIds, source: "ai" },
          });
          insightIds.push(created.id);
        }
      }
      logStep("propose", t2, insightIds.length > 0, { insightsCreated: insightIds.length });
    } catch (e) {
      logStep("propose", t2, false, undefined, (e as Error).message);
    }
  }

  // ─── 3) CLUSTER — 인사이트 → 주제·주장 ─────────────────────
  const t3 = Date.now();
  let thesisId: string | null = null;
  if (insightIds.length >= 2) {
    try {
      await prisma.thesis.deleteMany({ where: { status: "candidate" } });
      const insights = await prisma.insight.findMany({ where: { id: { in: insightIds } } });
      const compact = insights.map((i) => ({ id: i.id, t: i.text, s: i.signalSum }));
      const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const { text } = await generateText({
        model: anthropic("claude-sonnet-4-5"),
        system: `한국 카드뉴스 큐레이터. 인사이트들을 묶어 주제·주장으로. topic 1-2어절(15자), claim 22자 이내, 자연체. 출력 JSON: {"theses":[{"topic":"...","claim":"...","insightIds":["..."]}]}`,
        prompt: `[인사이트 ${insights.length}개]\n${compact.map((c) => `- ${c.id}: ${c.t}`).join("\n")}\n\n1개 주장으로 통합 (가장 강한 결).`,
        temperature: 0.4,
      });
      const parsed = parseLLMJson<{ theses?: Array<{ topic?: string; claim?: string; insightIds?: string[] }> }>(text);
      if (parsed.ok && parsed.data.theses?.[0]) {
        const t = parsed.data.theses[0];
        const validIns = new Set(insightIds);
        const linked = (t.insightIds ?? []).filter((id) => validIns.has(id));
        if (t.topic && t.claim) {
          const thesis = await prisma.thesis.create({
            data: {
              topic: t.topic.slice(0, 80),
              claim: t.claim.slice(0, 200),
              rank: 1,
              insightCount: linked.length,
              status: "picked",
              source: "ai",
            },
          });
          thesisId = thesis.id;
          await prisma.insight.updateMany({ where: { id: { in: linked } }, data: { thesisId: thesis.id } });
        }
      }
      logStep("cluster", t3, !!thesisId, { thesisId });
    } catch (e) {
      logStep("cluster", t3, false, undefined, (e as Error).message);
    }
  } else {
    logStep("cluster", t3, false, undefined, "insufficient insights");
  }

  // ─── 4) MATERIALIZE — 시드 생성 ───────────────────────────
  const t4 = Date.now();
  let seedId: string | null = null;
  for (const iid of insightIds) {
    try {
      const r = await materializeSeedForInsight(iid);
      if (r?.seedId) seedId = r.seedId; // 마지막 것 또는 가장 높은 점수 (단순화: last)
    } catch {
      // skip
    }
  }
  // 가장 높은 realityScore 시드 선택
  if (insightIds.length > 0) {
    const top = await prisma.seed.findFirst({
      where: { keyword },
      orderBy: { realityScore: "desc" },
    });
    if (top) seedId = top.id;
  }
  logStep("materialize", t4, !!seedId, { seedId });
  if (!seedId) {
    return NextResponse.json({
      ok: false,
      error: "materialize failed — no seed produced. check ingest/propose logs.",
      elapsedSec: Math.round((Date.now() - startedAt) / 1000),
      steps,
    }, { status: 500 });
  }

  // ─── 5) CARDNEWS — 8장 카피 + Gemini 프롬프트 ─────────────
  const t5 = Date.now();
  const seed = await prisma.seed.findUnique({
    where: { id: seedId },
    include: { evidenceLinks: { include: { evidence: true } }, thesis: { include: { insights: true } } },
  });
  if (!seed) {
    return NextResponse.json({ ok: false, error: "seed not found after materialize", steps }, { status: 500 });
  }
  const cardnews = await generateCardnews({
    keyword: seed.keyword,
    titleQuoted: seed.titleQuoted,
    hookQuoted: seed.hookQuoted,
    evidenceSnippets: seed.evidenceLinks.map((l) => l.evidence.textRaw).slice(0, 6),
    thesisTopic: seed.thesis?.topic,
    thesisClaim: seed.thesis?.claim,
    insightTexts: seed.thesis?.insights?.map((i) => i.text) ?? [],
  });
  if (!cardnews.ok) {
    logStep("cardnews", t5, false, undefined, cardnews.error);
    return NextResponse.json({ ok: false, error: cardnews.error, steps, seedId }, { status: 500 });
  }
  const payload = cardnews.payload;
  const prompts = {
    cover: buildCoverPrompt(payload.cover, seed.keyword),
    body: payload.body.map((b, i) => buildBodyPrompt(b, i, seed.keyword)),
    identity: buildBodyPrompt(payload.identity, 6, seed.keyword),
  };
  logStep("cardnews", t5, true, { totalPages: 1 + payload.body.length + 1 });

  // ─── 6) IMAGES — Gemini Imagen (옵션) ─────────────────────
  const t6 = Date.now();
  const allPrompts = [
    { page: "P1 커버", prompt: prompts.cover },
    ...payload.body.map((b, i) => ({ page: b.p || `P${i + 2}`, prompt: prompts.body[i] })),
    { page: payload.identity.p || "P8 정체성", prompt: prompts.identity },
  ];
  const images: Array<{ page: string; dataUrl?: string; provider?: string; error?: string }> = [];
  const hasImgKey = !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
  let imageUsable = hasImgKey;
  if (wantImages && hasImgKey) {
    for (const { page, prompt } of allPrompts) {
      const r = await generateImageWithFallback(prompt);
      if (r.ok) {
        images.push({ page, provider: r.provider, dataUrl: `data:${r.mimeType};base64,${r.imageBase64}` });
      } else {
        images.push({ page, error: r.error });
        if (/key|api/i.test(r.error)) imageUsable = false;
      }
      await new Promise((res) => setTimeout(res, 800));
    }
    logStep("images", t6, images.some((i) => i.dataUrl), {
      generated: images.filter((i) => i.dataUrl).length,
      total: images.length,
      providers: [...new Set(images.filter((i) => i.provider).map((i) => i.provider))],
    });
  } else {
    logStep("images", t6, false, undefined,
      wantImages ? "no image API key (GEMINI_API_KEY or OPENAI_API_KEY)" : "skipped by request");
    imageUsable = false;
  }

  // ─── 응답 ──────────────────────────────────────────────────
  return NextResponse.json({
    ok: true,
    keyword,
    seedId,
    elapsedSec: Math.round((Date.now() - startedAt) / 1000),
    steps,
    result: {
      cover: payload.cover,
      body: payload.body,
      identity: payload.identity,
      prompts,
      images,
      imageUsable,
    },
    summary: {
      ingest: { evidenceUpserted, platforms },
      insights: insightIds.length,
      thesis: thesisId ? { id: thesisId } : null,
      seed: { id: seedId, keyword: seed.keyword, titleQuoted: seed.titleQuoted },
      cardnews: { pages: 1 + payload.body.length + 1 },
      images: { generated: images.filter((i) => i.dataUrl).length, total: images.length, imageUsable },
    },
  });
}

// GET — health/status (사용 가능 키 확인)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json({
    ok: true,
    capabilities: {
      adapters: availablePlatforms(),
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
      gemini: Boolean(process.env.GEMINI_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
      youtubeApi: Boolean(process.env.YOUTUBE_API_KEY),
      imageProvider: process.env.GEMINI_API_KEY
        ? "gemini (preferred)"
        : process.env.OPENAI_API_KEY
          ? "openai (dall-e-3 fallback)"
          : "none",
    },
    note: "POST { keyword: string } → 6-step chain → cardnews + images",
  });
}

// 미사용 import suppress (RawEvidence는 타입 참고용)
void ({} as RawEvidence);
