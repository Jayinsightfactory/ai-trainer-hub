// PATCH  /api/contents/insights/[id]  — 인사이트 텍스트 수정 (editedAt 갱신)
// DELETE /api/contents/insights/[id]  — 삭제 (cascade: 묶인 thesis 영향 없음)

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { text?: string };
  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ ok: false, error: "text required" }, { status: 400 });
  }
  if (text.length > 300) {
    return NextResponse.json({ ok: false, error: "text too long" }, { status: 400 });
  }
  const updated = await prisma.insight.update({
    where: { id },
    data: { text, editedAt: new Date() },
  });
  return NextResponse.json({ ok: true, insight: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.insight.delete({ where: { id } });
  return NextResponse.json({ ok: true, deleted: id });
}
