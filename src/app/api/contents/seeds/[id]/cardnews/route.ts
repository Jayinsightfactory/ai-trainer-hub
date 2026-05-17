// POST /api/contents/seeds/[id]/cardnews
// 시드 1개 → 카드뉴스 8장 (cover + body 6 + identity) + Gemini 이미지 프롬프트 7개 자동 생성.
// 이미지 자체 생성은 별도 endpoint (/cardnews/image) — quota 비용 분리.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { generateCardnews, buildCoverPrompt, buildBodyPrompt } from "@/lib/cardnews-generator";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const seed = await prisma.seed.findUnique({
    where: { id },
    include: {
      evidenceLinks: { include: { evidence: true } },
      thesis: { include: { insights: true } },
    },
  });
  if (!seed) return NextResponse.json({ ok: false, error: "seed not found" }, { status: 404 });

  // 채택된 evidence 원문 (인용 후보)
  const evidenceSnippets = seed.evidenceLinks
    .map((l) => l.evidence.textRaw)
    .filter(Boolean)
    .slice(0, 6);
  const insightTexts = seed.thesis?.insights?.map((i) => i.text) ?? [];

  const result = await generateCardnews({
    keyword: seed.keyword,
    titleQuoted: seed.titleQuoted,
    hookQuoted: seed.hookQuoted,
    evidenceSnippets,
    thesisTopic: seed.thesis?.topic,
    thesisClaim: seed.thesis?.claim,
    insightTexts,
  });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error, raw: result.raw }, { status: 500 });
  }

  const payload = result.payload;
  const coverPrompt = buildCoverPrompt(payload.cover, seed.keyword);
  const bodyPrompts = payload.body.map((b, i) => buildBodyPrompt(b, i, seed.keyword));
  // identity 페이지도 별도 프롬프트
  const identityPrompt = buildBodyPrompt(
    { ...payload.identity, p: payload.identity.p || "P8 정체성" },
    6,
    seed.keyword,
  );

  return NextResponse.json({
    ok: true,
    seedId: id,
    keyword: seed.keyword,
    payload, // {cover, body[], identity, meta}
    prompts: {
      cover: coverPrompt,
      body: bodyPrompts, // 6개 (P2~P7)
      identity: identityPrompt, // P8
    },
    totalPages: 1 + payload.body.length + 1, // cover + body + identity
  });
}
