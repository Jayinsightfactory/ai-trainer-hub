// POST /api/contents/evidence/search-for-insight
// Body: { insightId, sources?: ('youtube'|'reddit'|'clien')[], limit?: number }
//
// "내 인사이트를 뒷받침할 실제 사례·전문 정보를 찾아라" — STEP 3 핵심.
// 인사이트 텍스트를 검색어로 변환 → 3개 어댑터 → 새 Evidence DB 저장 → insight.evidenceIds에 추가.
//
// 검색어 변환: 인사이트 text가 한 줄(<60자)이면 그대로, 길면 Claude로 핵심 쿼리 추출.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ADAPTERS, availablePlatforms } from "@/lib/sources";
import { classifyIsExperience, evidenceId } from "@/lib/sources/util";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import type { Platform } from "@/lib/sources/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

async function deriveQuery(insightText: string): Promise<string> {
  if (insightText.length <= 40) return insightText;
  // 길면 핵심 키워드 1줄 추출
  if (!process.env.ANTHROPIC_API_KEY) return insightText.slice(0, 40);
  try {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5"),
      system: "주어진 한 줄 인사이트를 검색하기 좋은 짧은 키워드 1줄(15자 이내)로 변환. 따옴표·설명 없이 키워드만.",
      prompt: insightText,
      temperature: 0,
    });
    return text.trim().replace(/^["']|["']$/g, "").slice(0, 40) || insightText.slice(0, 40);
  } catch {
    return insightText.slice(0, 40);
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    insightId?: string;
    sources?: Platform[];
    limit?: number;
  };
  if (!body.insightId) {
    return NextResponse.json({ ok: false, error: "insightId required" }, { status: 400 });
  }

  const insight = await prisma.insight.findUnique({ where: { id: body.insightId } });
  if (!insight) return NextResponse.json({ ok: false, error: "insight not found" }, { status: 404 });

  const requested = body.sources ?? availablePlatforms();
  const platforms = requested.filter((p) => ADAPTERS[p]?.isAvailable());
  if (platforms.length === 0) {
    return NextResponse.json({ ok: false, error: "no adapter available" }, { status: 400 });
  }

  const limit = Math.max(1, Math.min(body.limit ?? 6, 15));
  const query = await deriveQuery(insight.text);

  const newEvidenceIds: string[] = [];
  const report: Array<{ platform: Platform; fetched: number; upserted: number; error?: string }> = [];

  for (const platform of platforms) {
    try {
      const raw = await ADAPTERS[platform].fetchByKeyword(query, { limit });
      let upserted = 0;
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
            keyword: insight.keyword, // 인사이트 키워드로 분류
            isExperience: classifyIsExperience(e.textRaw),
          },
          update: {
            upvotes: e.upvotes ?? 0,
            likes: e.likes ?? 0,
            replies: e.replies ?? 0,
          },
        });
        if (!newEvidenceIds.includes(id)) newEvidenceIds.push(id);
        upserted++;
      }
      report.push({ platform, fetched: raw.length, upserted });
    } catch (e) {
      report.push({ platform, fetched: 0, upserted: 0, error: (e as Error).message });
    }
  }

  return NextResponse.json({
    ok: true,
    insightId: body.insightId,
    derivedQuery: query,
    newEvidenceCount: newEvidenceIds.length,
    evidenceIds: newEvidenceIds,
    report,
  });
}

// GET /api/contents/evidence/search-for-insight?insightId=... — 인사이트 텍스트로 매칭되는 evidence 조회
// (이미 수집된 풀에서 텍스트 substring 매칭, 새로 검색 안 함)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const insightId = req.nextUrl.searchParams.get("insightId");
  if (!insightId) return NextResponse.json({ ok: false, error: "insightId required" }, { status: 400 });
  const insight = await prisma.insight.findUnique({ where: { id: insightId } });
  if (!insight) return NextResponse.json({ ok: false, error: "insight not found" }, { status: 404 });

  // 1) 이미 연결된 evidence
  const linked = insight.evidenceIds.length
    ? await prisma.evidence.findMany({
        where: { id: { in: insight.evidenceIds } },
        orderBy: { upvotes: "desc" },
      })
    : [];
  // 2) 같은 키워드의 다른 evidence (후보)
  const candidates = await prisma.evidence.findMany({
    where: { keyword: insight.keyword, id: { notIn: insight.evidenceIds } },
    orderBy: [{ upvotes: "desc" }, { likes: "desc" }],
    take: 20,
  });

  return NextResponse.json({
    ok: true,
    insightText: insight.text,
    linked,
    candidates,
  });
}

// PATCH — 인사이트에 evidence 추가/제거 (사용자 채택/거름)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    insightId?: string;
    addIds?: string[];
    removeIds?: string[];
  };
  if (!body.insightId) {
    return NextResponse.json({ ok: false, error: "insightId required" }, { status: 400 });
  }
  const insight = await prisma.insight.findUnique({ where: { id: body.insightId } });
  if (!insight) return NextResponse.json({ ok: false, error: "insight not found" }, { status: 404 });

  const set = new Set(insight.evidenceIds);
  (body.addIds ?? []).forEach((id) => set.add(id));
  (body.removeIds ?? []).forEach((id) => set.delete(id));
  const updated = await prisma.insight.update({
    where: { id: insight.id },
    data: { evidenceIds: [...set] },
  });
  return NextResponse.json({ ok: true, insight: updated });
}
