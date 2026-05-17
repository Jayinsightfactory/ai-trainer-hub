// GET /api/contents/evidence?keyword=...&limit=40
// STEP 1 UI에서 키워드 풀의 Evidence 카드 그리드용.

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
  const keyword = req.nextUrl.searchParams.get("keyword");
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 40), 100);
  if (!keyword) {
    return NextResponse.json({ ok: false, error: "keyword required" }, { status: 400 });
  }
  const evidence = await prisma.evidence.findMany({
    where: { keyword },
    orderBy: [{ upvotes: "desc" }, { likes: "desc" }, { postedAt: "desc" }],
    take: limit,
    select: {
      id: true,
      platform: true,
      textRaw: true,
      keyword: true,
      upvotes: true,
      likes: true,
      postedAt: true,
      parentTitle: true,
    },
  });
  return NextResponse.json({ ok: true, count: evidence.length, evidence });
}
