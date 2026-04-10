import { NextRequest, NextResponse } from "next/server";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/webhook/kakao
 * 카카오 채널(플러스친구) Webhook 수신 → RAG 응답 → 카카오 메시지 발송
 *
 * 카카오 챗봇 빌더 → 스킬 URL로 등록:
 * https://your-domain.up.railway.app/api/webhook/kakao
 *
 * 카카오 Skill Request 형식:
 * {
 *   "userRequest": { "utterance": "메뉴 알려주세요", "user": { "id": "xxx" } },
 *   "bot": { "id": "bot_id" },
 *   "action": { "params": { "storeSlug": "soulbrew" } }
 * }
 */

interface KakaoSkillRequest {
  userRequest: {
    utterance: string;
    user: { id: string };
    callbackUrl?: string;
  };
  bot?: { id?: string };
  action?: {
    params?: Record<string, string>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as KakaoSkillRequest;
    const utterance = body.userRequest?.utterance?.trim() || "";
    const userId = body.userRequest?.user?.id || "anonymous";
    const storeSlug = body.action?.params?.storeSlug || "";

    if (!utterance) {
      return kakaoResponse("안녕하세요! 무엇이 궁금하신가요? 😊");
    }

    // 매장 에이전트 조회
    let systemPrompt = "당신은 친절한 AI 안내 직원입니다. 항상 한국어로 짧고 명확하게 답변하세요.";
    let knowledgeContext = "";

    if (storeSlug) {
      try {
        const agent = await prisma.storeAgent.findUnique({
          where: { slug: storeSlug },
          include: {
            chunks: {
              orderBy: { chunkIndex: "asc" },
              take: 10,
              select: { content: true, category: true },
            },
          },
        });

        if (agent) {
          systemPrompt = `당신은 ${agent.businessName}의 AI 안내 직원입니다.
항상 한국어로 친절하고 간결하게 답변하세요 (3문장 이내).
모르는 것은 솔직히 말하고 "사장님께 문의해 주세요"로 안내하세요.`;

          if (agent.chunks.length > 0) {
            // 키워드 기반 관련 청크 필터링
            const words = utterance.split(/\s+/).filter((w) => w.length >= 2);
            const relevant = agent.chunks
              .filter((c) => words.some((w) => c.content.includes(w)))
              .slice(0, 5);
            const context = (relevant.length > 0 ? relevant : agent.chunks.slice(0, 3))
              .map((c) => c.content)
              .join("\n\n");
            knowledgeContext = `\n\n매장 정보:\n${context}`;
          }

          // 채팅 수 업데이트
          await prisma.storeAgent.update({
            where: { slug: storeSlug },
            data: { totalChats: { increment: 1 }, monthlyChats: { increment: 1 } },
          }).catch(() => {});
        }
      } catch {
        // DB 없음 → 기본 응답
      }
    }

    // API 키 없으면 Mock
    if (!process.env.ANTHROPIC_API_KEY) {
      return kakaoResponse(
        `안녕하세요! 😊 "${utterance}"에 대해 문의해 주셨군요.\n\n현재 AI 응답 설정 중입니다. 잠시 후 다시 시도해 주세요!`
      );
    }

    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"), // 카카오 응답은 속도 우선 → Haiku
      system: systemPrompt + knowledgeContext,
      prompt: utterance,
      maxOutputTokens: 300,
      temperature: 0.5,
    });

    // 에스컬레이션 감지
    if (text.includes("[ESCALATE]") && storeSlug) {
      const cleanText = text.replace("[ESCALATE]", "").trim();
      try {
        const agent = await prisma.storeAgent.findUnique({ where: { slug: storeSlug } });
        if (agent) {
          await prisma.escalationEvent.create({
            data: {
              storeAgentId: agent.id,
              sessionId: `kakao_${userId}_${Date.now()}`,
              customerMsg: utterance,
              aiResponse: cleanText,
              status: "pending",
              notifyMethod: "kakao-channel",
            },
          });
        }
      } catch {
        // 에스컬레이션 기록 실패 무시
      }

      return kakaoResponse(cleanText + "\n\n사장님께 연결 요청을 보냈습니다. 잠시만 기다려 주세요! ⏳");
    }

    return kakaoResponse(text);
  } catch (error) {
    console.error("[webhook/kakao] 오류:", error);
    return kakaoResponse("잠시 오류가 발생했습니다. 다시 시도해 주시거나 전화로 문의해 주세요. 😊");
  }
}

// GET - 카카오 웹훅 등록 시 검증용
export async function GET() {
  return NextResponse.json({ status: "ok", service: "AI Trainer Hub Kakao Webhook" });
}

// ─── 카카오 스킬 응답 포맷 ────────────────────────────────

function kakaoResponse(text: string) {
  return NextResponse.json({
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: text.slice(0, 1000), // 카카오 최대 1000자
          },
        },
      ],
    },
  });
}
