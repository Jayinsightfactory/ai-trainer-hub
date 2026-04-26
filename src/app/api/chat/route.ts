import { NextRequest } from "next/server";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface ChatContext {
  industry?: string;
  businessName?: string;
  purpose?: string;
  templateId?: string;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// ── 인메모리 Rate Limiter (IP당 분당 20회) ──────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

function buildSystemPrompt(context: ChatContext): string {
  const industryLabels: Record<string, string> = {
    cafe: "카페/음식점",
    shopping: "쇼핑몰/이커머스",
    realestate: "부동산",
    education: "교육/학원",
    marketing: "마케팅/광고",
    legal: "법률",
    medical: "의료/병원",
    beauty: "뷰티/미용",
    fitness: "피트니스/헬스",
    pet: "반려동물",
    academy: "학원/교육",
  };

  const industryLabel =
    industryLabels[context.industry || ""] || "일반 비즈니스";
  const businessName = context.businessName || "사업장";

  return `당신은 ${businessName}을 위한 AI 트레이너 전문가입니다.
업종: ${industryLabel}

역할:
- ${businessName}에 맞는 맞춤형 AI 에이전트 설계 및 학습 지원
- 업종 트렌드와 실제 데이터 기반의 인사이트 제공
- 실용적이고 즉시 적용 가능한 AI 전략 제안

응답 원칙:
- 항상 한국어로 응답
- 구체적인 수치와 사례를 포함
- 실행 가능한 단계별 가이드 제공
- 이모지를 적절히 활용해 가독성 향상
- 마크다운 포맷 사용 (볼드, 리스트 등)

현재 목표: ${businessName}의 AI 도입을 위한 최적의 학습 데이터 구성 및 에이전트 설계`;
}

export async function POST(request: NextRequest) {
  try {
    // ── 인증 가드 ──────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(
        JSON.stringify({ error: "로그인이 필요합니다." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Rate Limit ─────────────────────────────────────────────
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

    const body = await request.json();
    const { messages, context } = body as {
      messages: ChatMessage[];
      context: ChatContext;
    };

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages 배열이 필요합니다." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // API 키 없으면 mock 모드
    if (!process.env.ANTHROPIC_API_KEY) {
      return mockStream(messages, context);
    }

    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const model = process.env.AI_MODEL ?? "claude-sonnet-4-6";
    const systemPrompt = buildSystemPrompt(context || {});

    const filteredMessages = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const result = streamText({
      model: anthropic(model),
      system: systemPrompt,
      messages: filteredMessages,
      maxOutputTokens: 1024,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error("[Chat] 오류:", err);
    return new Response(
      JSON.stringify({ error: "채팅 처리 중 오류가 발생했습니다." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function mockStream(messages: ChatMessage[], context: ChatContext) {
  const lastMessage = messages[messages.length - 1];
  const userText = lastMessage?.content?.toLowerCase() || "";
  const businessName = context?.businessName || "사업장";

  let response = `안녕하세요! ${businessName}의 AI 트레이너입니다 😊\n\n`;

  if (userText.includes("분석") || userText.includes("시작")) {
    response = `**${businessName} 분석을 시작합니다** 🚀\n\n✅ 업종 분석 완료\n✅ 경쟁사 벤치마킹 완료\n✅ 고객 패턴 분석 완료\n\n더 정확한 분석을 위해 ANTHROPIC_API_KEY를 설정해주세요.`;
  } else if (userText.includes("학습") || userText.includes("템플릿")) {
    response = `**${businessName} 맞춤 학습팩 구성 중** 📦\n\n현재 Mock 모드로 동작 중입니다.\nANTHROPIC_API_KEY 설정 시 실제 AI 응답이 활성화됩니다.`;
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const chunkSize = 20;
      for (let i = 0; i < response.length; i += chunkSize) {
        const chunk = response.slice(i, i + chunkSize);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
        );
        await new Promise((r) => setTimeout(r, 30));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
