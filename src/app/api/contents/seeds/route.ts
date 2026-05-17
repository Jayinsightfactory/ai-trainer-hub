// GET /api/contents/seeds — DB의 실시드 목록 (reality_score DESC).
// 카드 UI(contents-app/index.html)는 이 응답이 비어있지 않으면 하드코딩 CONTENT_SEEDS 대신 사용.
// 응답에 evidence 출처 배지 데이터 포함 (platform, parent_title, signals, url).

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const limit = Math.max(1, Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 20), 50));
  const status = req.nextUrl.searchParams.get("status") ?? "candidate";
  const thesisId = req.nextUrl.searchParams.get("thesisId"); // 특정 주장에 묶인 시드만

  const seeds = await prisma.seed.findMany({
    where: {
      status,
      ...(thesisId ? { thesisId } : {}),
    },
    orderBy: { realityScore: "desc" },
    take: limit,
    include: {
      evidenceLinks: {
        take: 3, // 카드당 출처 배지 최대 3개
        include: {
          evidence: {
            select: {
              platform: true,
              sourceUrl: true,
              author: true,
              parentTitle: true,
              parentChannel: true,
              upvotes: true,
              likes: true,
              postedAt: true,
            },
          },
        },
      },
      decisions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { rating: true, userEmail: true, createdAt: true },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    count: seeds.length,
    seeds: seeds.map((s) => ({
      id: s.id,
      thesisId: s.thesisId,
      keyword: s.keyword,
      titleQuoted: s.titleQuoted,
      hookQuoted: s.hookQuoted,
      realityScore: Number(s.realityScore.toFixed(2)),
      sourceDiversity: s.sourceDiversity,
      evidenceCount: s.evidenceCount,
      status: s.status,
      lastDecision: s.decisions[0] ?? null,
      evidence: s.evidenceLinks.map((l) => ({
        platform: l.evidence.platform,
        url: l.evidence.sourceUrl,
        author: l.evidence.author,
        parentTitle: l.evidence.parentTitle,
        parentChannel: l.evidence.parentChannel,
        signal: (l.evidence.upvotes ?? 0) + (l.evidence.likes ?? 0),
        postedAt: l.evidence.postedAt,
      })),
    })),
  });
}
