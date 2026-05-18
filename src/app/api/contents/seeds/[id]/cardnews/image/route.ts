// POST /api/contents/seeds/[id]/cardnews/image
// Body: { prompt: string, page?: string }
// Gemini Imagen 3로 이미지 1장 생성. 결과는 base64.
//
// GEMINI_API_KEY 없으면 503 + 안내 (사용자가 Gemini Studio에 직접 프롬프트 복붙해도 됨).

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { generateImageWithFallback } from "@/lib/cardnews-generator";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as { prompt?: string; page?: string };
  const prompt = body.prompt?.trim();
  if (!prompt) {
    return NextResponse.json({ ok: false, error: "prompt required" }, { status: 400 });
  }
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        ok: false,
        error: "no image API key (GEMINI_API_KEY or OPENAI_API_KEY)",
        fallback: {
          hint: "Railway Variables에 GEMINI_API_KEY 또는 OPENAI_API_KEY 추가하면 자동 생성 가능.",
          studioUrls: {
            gemini: "https://aistudio.google.com/prompts/new",
            openai: "https://platform.openai.com/api-keys",
          },
        },
      },
      { status: 503 },
    );
  }
  const r = await generateImageWithFallback(prompt);
  if (!r.ok) {
    return NextResponse.json({ ok: false, error: r.error, tried: r.tried }, { status: 500 });
  }
  return NextResponse.json({
    ok: true,
    page: body.page ?? null,
    provider: r.provider,
    mimeType: r.mimeType,
    imageBase64: r.imageBase64,
    dataUrl: `data:${r.mimeType};base64,${r.imageBase64}`,
  });
}
