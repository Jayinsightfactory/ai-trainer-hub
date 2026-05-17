// POST /api/contents/seeds/[id]/decision
// Body: { rating: 0..5, note?: string }
//   rating 0 = reject, 1~5 = stars (4~5 → seed.status='picked', 0 → 'rejected')
// 사용자 선택 패턴을 SeedDecision에 누적 → 추후 추천 모델 학습 데이터.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!isAdmin(email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { id: seedId } = await params;
  const body = (await req.json().catch(() => ({}))) as { rating?: number; note?: string };
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
    return NextResponse.json({ ok: false, error: "rating must be 0..5" }, { status: 400 });
  }

  const seed = await prisma.seed.findUnique({ where: { id: seedId }, select: { id: true } });
  if (!seed) return NextResponse.json({ ok: false, error: "seed not found" }, { status: 404 });

  const nextStatus = rating === 0 ? "rejected" : rating >= 4 ? "picked" : "candidate";

  const [decision] = await prisma.$transaction([
    prisma.seedDecision.create({
      data: { seedId, userEmail: email!.toLowerCase(), rating, note: body.note?.slice(0, 500) },
    }),
    prisma.seed.update({ where: { id: seedId }, data: { status: nextStatus } }),
  ]);

  return NextResponse.json({ ok: true, decision, status: nextStatus });
}
