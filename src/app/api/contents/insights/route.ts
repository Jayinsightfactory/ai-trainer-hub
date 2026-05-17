// GET  /api/contents/insights[?keyword=...]  — 인사이트 목록 (ai + user 모두)
// POST /api/contents/insights                — 사용자가 직접 인사이트 추가 (source='user')
//   Body: { keyword, text, evidenceIds?: string[] }

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
  const insights = await prisma.insight.findMany({
    where: keyword ? { keyword } : {},
    orderBy: [{ source: "asc" }, { signalSum: "desc" }, { createdAt: "desc" }],
    take: 200,
  });
  return NextResponse.json({ ok: true, count: insights.length, insights });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!isAdmin(email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    keyword?: string;
    text?: string;
    evidenceIds?: string[];
  };
  const keyword = body.keyword?.trim();
  const text = body.text?.trim();
  if (!keyword || !text) {
    return NextResponse.json({ ok: false, error: "keyword + text required" }, { status: 400 });
  }
  if (text.length > 300) {
    return NextResponse.json({ ok: false, error: "text too long (max 300)" }, { status: 400 });
  }
  const created = await prisma.insight.create({
    data: {
      keyword,
      text,
      evidenceIds: body.evidenceIds ?? [],
      source: "user",
      createdBy: email!.toLowerCase(),
    },
  });
  return NextResponse.json({ ok: true, insight: created });
}
