// POST /api/contents/theses/[id]/refine
// Body: { instruction: string }
// "이렇게 바꿔줘" — 사용자 지시문으로 기존 주제/주장 재생성.
// editedByUser=true 로 저장 (사용자 의도 반영됨).

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { parseLLMJson } from "@/lib/parse-llm-json";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM = `당신은 한국 카드뉴스 편집자입니다.
주어진 기존 주제/주장을 사용자 지시에 맞게 수정합니다.

규칙:
- topic: 명사구 1~2어절 (15자 이내)
- claim: 한 줄, 22자 이내, 친근한 자연체. 위인전체/명령조 ❌
- 사용자 지시를 우선 반영하되, 원본의 핵심 의도 보존
- "더 자극적" / "더 부드럽게" / "숫자 빼고" 등 톤 조정 지시 가능

출력 — JSON만:
{"topic":"...","claim":"..."}`;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { instruction?: string };
  const instruction = body.instruction?.trim();
  if (!instruction) {
    return NextResponse.json({ ok: false, error: "instruction required" }, { status: 400 });
  }
  const thesis = await prisma.thesis.findUnique({ where: { id } });
  if (!thesis) return NextResponse.json({ ok: false, error: "thesis not found" }, { status: 404 });

  let parsed: { ok: true; data: { topic?: string; claim?: string } } | { ok: false; error: string; raw?: string };
  try {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      system: SYSTEM,
      prompt: `[기존]\n주제: ${thesis.topic}\n주장: ${thesis.claim}\n\n[지시]\n${instruction}\n\n위 지시 반영한 새 주제/주장을 JSON으로.`,
      temperature: 0.4,
    });
    parsed = parseLLMJson(text);
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error, raw: parsed.raw }, { status: 500 });
  }
  const newTopic = parsed.data.topic?.trim().slice(0, 80);
  const newClaim = parsed.data.claim?.trim().slice(0, 200);
  if (!newTopic || !newClaim) {
    return NextResponse.json({ ok: false, error: "LLM returned invalid topic/claim" }, { status: 500 });
  }
  const updated = await prisma.thesis.update({
    where: { id },
    data: { topic: newTopic, claim: newClaim, editedByUser: true },
  });
  return NextResponse.json({ ok: true, thesis: updated, instruction });
}
