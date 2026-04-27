/**
 * 고객용 공개 챗봇 엔드포인트 (인증 불필요)
 *
 * GET  /api/chat/[storeId]  — Store 정보 + 첫인사 반환
 * POST /api/chat/[storeId]  — RAG 검색 → Claude 스트리밍 응답
 */

import { NextRequest } from "next/server";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { prisma } from "@/lib/prisma";
import { searchChunks } from "@/lib/rag";
import { isUnanswered, escalate } from "@/lib/escalation";

// ── 인메모리 Rate Limiter (IP당 분당 30회) ─────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 30) return false;
  entry.count++;
  return true;
}

// ── GET: Store 정보 조회 ───────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params;

  try {
    const store = await prisma.storeAgent.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        slug: true,
        businessName: true,
        businessType: true,
        status: true,
      },
    });

    if (!store) {
      return new Response(
        JSON.stringify({ error: "스토어를 찾을 수 없습니다." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (store.status !== "active") {
      return new Response(
        JSON.stringify({ error: "현재 서비스 중이 아닙니다." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const greeting = `안녕하세요! ${store.businessName} AI 안내원입니다 😊\n무엇을 도와드릴까요?`;

    return new Response(
      JSON.stringify({
        id: store.id,
        slug: store.slug,
        businessName: store.businessName,
        businessType: store.businessType,
        greeting,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[chat/storeId GET] 오류:", err);
    return new Response(
      JSON.stringify({ error: "서버 오류가 발생했습니다." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ── POST: RAG 챗봇 응답 ────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params;

  // Rate Limit
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await request.json();
    const { messages } = body as { messages: Message[] };

    if (!messages?.length) {
      return new Response(
        JSON.stringify({ error: "messages 배열이 필요합니다." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── 1. Store 조회 ──────────────────────────────────────
    let store: {
      id: string;
      businessName: string;
      businessType: string;
      systemPrompt: string;
      status: string;
    } | null = null;

    let knowledgeChunks: string[] = [];

    try {
      store = await prisma.storeAgent.findUnique({
        where: { id: storeId },
        select: {
          id: true,
          businessName: true,
          businessType: true,
          systemPrompt: true,
          status: true,
        },
      });

      if (!store) {
        return new Response(
          JSON.stringify({ error: "스토어를 찾을 수 없습니다." }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      if (store.status !== "active") {
        return new Response(
          JSON.stringify({ error: "현재 서비스 중이 아닙니다." }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      // ── 2. RAG 검색 ─────────────────────────────────────
      const userQuery = messages[messages.length - 1]?.content ?? "";
      knowledgeChunks = await searchChunks(store.id, userQuery, 5);

      // 채팅 수 증가
      await prisma.storeAgent.update({
        where: { id: store.id },
        data: {
          totalChats: { increment: 1 },
          monthlyChats: { increment: 1 },
        },
      });
    } catch (err) {
      console.warn("[chat/storeId POST] DB 오류, mock 모드:", err);
    }

    // ── 3. 시스템 프롬프트 구성 ────────────────────────────
    const systemPrompt = buildSystemPrompt(
      store?.businessName ?? storeId,
      store?.businessType ?? "general",
      store?.systemPrompt ?? "",
      knowledgeChunks
    );

    // ── 4. API 키 없으면 Mock ──────────────────────────────
    if (!process.env.ANTHROPIC_API_KEY) {
      return mockStream(
        messages[messages.length - 1]?.content ?? "",
        store?.businessName ?? storeId,
        knowledgeChunks.length > 0
      );
    }

    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const result = streamText({
      model: anthropic("claude-sonnet-4-6"),
      system: systemPrompt,
      messages,
      maxOutputTokens: 800,
      temperature: 0.5,
      onFinish: async ({ text, usage }) => {
        if (!store) return;

        // ── 미답변 감지 → 사장님 카카오 알림 ─────────────
        if (isUnanswered(text)) {
          const userQuery = messages[messages.length - 1]?.content ?? "";
          const sessionId = request.headers.get("x-session-id") ?? `anon_${Date.now()}`;
          escalate({
            storeAgentId: store.id,
            sessionId,
            customerMsg: userQuery,
            aiResponse: text,
          }).catch(() => {});
        }

        // ── 토큰 사용량 기록 ──────────────────────────────
        try {
          const inputTok = usage.inputTokens ?? 0;
          const outputTok = usage.outputTokens ?? 0;
          const cost = (inputTok * 3 + outputTok * 15) / 1_000_000;
          await prisma.tokenUsage.create({
            data: {
              userId: "system",
              feature: "chat",
              model: "claude-sonnet-4-6",
              inputTokens: inputTok,
              outputTokens: outputTok,
              cost,
            },
          });
        } catch {
          // 토큰 기록 실패 무시
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error("[chat/storeId POST] 오류:", err);
    return new Response(
      JSON.stringify({ error: "채팅 처리 중 오류가 발생했습니다." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ─── 시스템 프롬프트 빌더 ─────────────────────────────────

function buildSystemPrompt(
  businessName: string,
  businessType: string,
  customPrompt: string,
  chunks: string[]
): string {
  const typeLabel: Record<string, string> = {
    cafe: "카페/음료",
    restaurant: "음식점",
    retail: "소매점",
    beauty: "미용/뷰티",
    fitness: "피트니스/헬스",
    pilates: "필라테스",
    study_cafe: "스터디카페",
    nail: "네일샵",
    education: "교육/학원",
    academy: "학원/교육",
    medical: "의료/병원",
    pet: "반려동물 케어",
    realestate: "부동산",
    shopping: "쇼핑몰/이커머스",
    car_repair: "자동차 정비",
    general: "일반 매장",
  };

  const knowledgeSection =
    chunks.length > 0
      ? `\n\n## 학습된 지식베이스\n${chunks.join("\n\n---\n\n")}`
      : "";

  return `당신은 ${businessName}의 전담 AI 응대 직원입니다.
업종: ${typeLabel[businessType] || businessType}

## 응답 원칙
- 항상 친절하고 자연스러운 한국어로 응답
- 학습된 지식베이스를 우선 참고하여 정확한 답변 제공
- 모르는 내용은 "잘 모르겠습니다. 직접 문의해주세요"라고 답변
- 답변은 간결하게 (3-4문장 이내), 필요 시 리스트 사용
- 예약/주문/결제는 직접 처리 불가 → 전화번호/링크로 안내
- 학습된 정보에 없는 내용은 절대 지어내지 않음
${customPrompt ? `\n## 추가 지침\n${customPrompt}` : ""}${knowledgeSection}`;
}

// ─── Mock 스트림 ──────────────────────────────────────────

function mockStream(query: string, businessName: string, hasKnowledge: boolean) {
  const response = hasKnowledge
    ? `안녕하세요! ${businessName} AI 안내원입니다 😊\n\n"${query}"에 대해 학습된 정보를 바탕으로 답변드리겠습니다.\n\n실제 AI 응답을 위해 ANTHROPIC_API_KEY 설정이 필요합니다.`
    : `안녕하세요! ${businessName}입니다 😊\n\n"${query}"에 대해 문의해 주셨군요.\n아직 학습 데이터가 없어 자세한 안내가 어렵습니다.\n직접 연락 주시면 도움드릴게요!`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const chunkSize = 15;
      for (let i = 0; i < response.length; i += chunkSize) {
        controller.enqueue(encoder.encode(response.slice(i, i + chunkSize)));
        await new Promise((r) => setTimeout(r, 25));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Vercel-AI-Data-Stream": "v1",
    },
  });
}
