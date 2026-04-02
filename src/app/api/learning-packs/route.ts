import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/learning-packs — 학습 팩 저장
 * GET /api/learning-packs — 학습 팩 목록 조회
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId = "demo-user",
      templateId,
      name,
      systemPrompt,
      knowledgeBase,
      level,
      qualityScore,
      status = "draft",
    } = body as {
      userId?: string;
      templateId?: string;
      name: string;
      systemPrompt: string;
      knowledgeBase: Record<string, string>;
      level: number;
      qualityScore: number;
      status?: string;
    };

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    // Ensure demo user exists
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: { id: userId, name: "데모 사용자", email: "demo@aitrainerhub.com" },
      });
    }

    const filledItems = Object.values(knowledgeBase || {}).filter(
      (v) => typeof v === "string" && v.trim().length > 0
    );

    const pack = await prisma.learningPack.create({
      data: {
        userId: user.id,
        templateId: templateId || null,
        name,
        status,
        level,
        qualityScore,
        contextData: filledItems.length,
        systemPrompt: systemPrompt || "",
        knowledgeBase: JSON.stringify(knowledgeBase || {}),
      },
    });

    return NextResponse.json({ id: pack.id, status: "saved", pack });
  } catch (error) {
    console.error("Error saving learning pack:", error);
    return NextResponse.json(
      { error: "Failed to save learning pack" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "demo-user";
    const status = request.nextUrl.searchParams.get("status");

    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;

    const packs = await prisma.learningPack.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { template: true },
    });

    return NextResponse.json({ packs });
  } catch (error) {
    console.error("Error fetching learning packs:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning packs" },
      { status: 500 }
    );
  }
}
