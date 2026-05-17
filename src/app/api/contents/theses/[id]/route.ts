// PATCH  /api/contents/theses/[id]  — topic/claim 자유 편집 (editedByUser=true)
// DELETE /api/contents/theses/[id]  — 주장 삭제 (묶인 시드는 thesisId=null로 풀림)

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
  const body = (await req.json().catch(() => ({}))) as {
    topic?: string;
    claim?: string;
    status?: string;
  };
  const data: { topic?: string; claim?: string; status?: string; editedByUser?: boolean; updatedAt?: Date } = {};
  if (body.topic !== undefined) {
    const t = body.topic.trim();
    if (!t) return NextResponse.json({ ok: false, error: "topic empty" }, { status: 400 });
    data.topic = t.slice(0, 80);
    data.editedByUser = true;
  }
  if (body.claim !== undefined) {
    const c = body.claim.trim();
    if (!c) return NextResponse.json({ ok: false, error: "claim empty" }, { status: 400 });
    data.claim = c.slice(0, 200);
    data.editedByUser = true;
  }
  if (body.status !== undefined) {
    if (!["candidate", "picked", "rejected"].includes(body.status)) {
      return NextResponse.json({ ok: false, error: "invalid status" }, { status: 400 });
    }
    data.status = body.status;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false, error: "no fields to update" }, { status: 400 });
  }
  const updated = await prisma.thesis.update({ where: { id }, data });
  return NextResponse.json({ ok: true, thesis: updated });
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
  await prisma.thesis.delete({ where: { id } });
  return NextResponse.json({ ok: true, deleted: id });
}
