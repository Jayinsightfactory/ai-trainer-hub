// POST /api/contents/ingest
// Body: { keywords: string[], platforms?: Platform[], limit?: number }
// 동작: 각 (keyword × platform) 어댑터 호출 → Evidence upsert → Seed materialize.
// 관리자 전용 (ADMIN_EMAILS).

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ADAPTERS, availablePlatforms } from "@/lib/sources";
import { classifyIsExperience, evidenceId } from "@/lib/sources/util";
import { materializeSeedForKeyword } from "@/lib/sources/materializer";
import type { Platform, RawEvidence } from "@/lib/sources/types";

export const dynamic = "force-dynamic";
export const maxDuration = 180;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    keywords?: string[];
    platforms?: Platform[];
    limit?: number;
  };
  const keywords = (body.keywords ?? []).map((s) => s.trim()).filter(Boolean);
  if (keywords.length === 0) {
    return NextResponse.json({ ok: false, error: "keywords required" }, { status: 400 });
  }

  const requested = body.platforms ?? availablePlatforms();
  const platforms = requested.filter((p) => ADAPTERS[p]?.isAvailable());
  if (platforms.length === 0) {
    return NextResponse.json(
      { ok: false, error: "no available adapter (check env keys)" },
      { status: 400 },
    );
  }

  const limit = Math.max(1, Math.min(body.limit ?? 10, 25));

  const report: Array<{
    keyword: string;
    platform: Platform;
    fetched: number;
    upserted: number;
    error?: string;
  }> = [];
  let totalEvidence = 0;

  // 키워드 × 플랫폼 — 직렬 (rate-limit 보호)
  for (const keyword of keywords) {
    for (const platform of platforms) {
      const adapter = ADAPTERS[platform];
      try {
        const raw = await adapter.fetchByKeyword(keyword, { limit });
        const upserted = await persistEvidence(raw);
        totalEvidence += upserted;
        report.push({ keyword, platform, fetched: raw.length, upserted });
      } catch (e) {
        report.push({
          keyword,
          platform,
          fetched: 0,
          upserted: 0,
          error: (e as Error).message,
        });
      }
    }
    // 키워드 완료 시 시드 materialize
    await materializeSeedForKeyword(keyword);
  }

  return NextResponse.json({
    ok: true,
    summary: { keywords: keywords.length, platforms: platforms.length, evidenceUpserted: totalEvidence },
    report,
  });
}

async function persistEvidence(raw: RawEvidence[]): Promise<number> {
  if (raw.length === 0) return 0;
  let n = 0;
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
        keyword: e.keyword,
        isExperience: classifyIsExperience(e.textRaw),
      },
      update: {
        // 갱신: 반응 수만 업데이트 (원문/메타는 첫 수집 시점 보존)
        upvotes: e.upvotes ?? 0,
        likes: e.likes ?? 0,
        replies: e.replies ?? 0,
      },
    });
    n++;
  }
  return n;
}

// GET — 상태 확인 (관리자 전용)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const [evCount, seedCount, platforms] = await Promise.all([
    prisma.evidence.count(),
    prisma.seed.count(),
    Promise.resolve(availablePlatforms()),
  ]);
  return NextResponse.json({
    ok: true,
    counts: { evidence: evCount, seed: seedCount },
    availablePlatforms: platforms,
  });
}
