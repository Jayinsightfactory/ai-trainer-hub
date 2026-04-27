/**
 * POST /api/knowledge/bulk-ingest
 * 사장님 온보딩 답변 → KnowledgeChunk 일괄 저장
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildKnowledgeChunks } from "@/lib/question-bank";

export async function POST(request: NextRequest) {
  try {
    const { storeAgentId, answers, category, businessName } = await request.json() as {
      storeAgentId: string;
      answers: Record<string, string>;
      category: string;
      businessName: string;
    };

    if (!storeAgentId || !answers || !category) {
      return NextResponse.json({ error: "필수 파라미터 누락" }, { status: 400 });
    }

    const chunks = buildKnowledgeChunks(answers, category, businessName);

    if (chunks.length === 0) {
      return NextResponse.json({ error: "저장할 답변이 없습니다." }, { status: 400 });
    }

    // 기존 owner_onboarding 청크 삭제 (재제출 대비)
    await prisma.knowledgeChunk.deleteMany({
      where: { storeAgentId, source: "owner_onboarding" },
    });

    // 현재 청크 수 조회
    const existingCount = await prisma.knowledgeChunk.count({ where: { storeAgentId } });

    // 새 청크 일괄 저장
    await prisma.knowledgeChunk.createMany({
      data: chunks.map((c, i) => ({
        storeAgentId,
        content: c.content,
        category: c.category,
        source: c.source,
        chunkIndex: existingCount + i,
        tokenCount: Math.ceil(c.content.length / 4),
      })),
    });

    return NextResponse.json({
      ok: true,
      saved: chunks.length,
      message: `${chunks.length}개 카테고리 지식이 챗봇에 저장됐습니다.`,
    });
  } catch (err) {
    console.error("[bulk-ingest]", err);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}
