// POST /api/contents/seeds/materialize
// Body: { insightIds?: string[] }  — 비우면 모든 insight 대상
// STEP 3 → STEP 4 진입 시 호출. 인사이트별 시드 1장 upsert.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { materializeSeedForInsight } from "@/lib/sources/materializer";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as { insightIds?: string[] };
  const where = body.insightIds?.length ? { id: { in: body.insightIds } } : {};
  const insights = await prisma.insight.findMany({ where, select: { id: true } });

  const results: Array<{ insightId: string; seedId?: string; evidenceCount?: number; score?: number; error?: string }> = [];
  for (const i of insights) {
    try {
      const r = await materializeSeedForInsight(i.id);
      if (r) results.push({ insightId: i.id, ...r });
    } catch (e) {
      results.push({ insightId: i.id, error: (e as Error).message });
    }
  }
  return NextResponse.json({
    ok: true,
    processed: insights.length,
    created: results.filter((r) => r.seedId).length,
    results,
  });
}
