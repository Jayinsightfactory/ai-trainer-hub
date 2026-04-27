import { NextRequest } from "next/server";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/chat/store
 * RAG 기반 매장 챗봇 — KnowledgeChunk 검색 → Claude 스트리밍 응답
 *
 * Body:
 *   slug: string           (매장 슬러그)
 *   messages: ChatMessage[]
 *   sessionId?: string
 */

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      slug,
      messages,
      sessionId = crypto.randomUUID(),
    } = body as {
      slug: string;
      messages: Message[];
      sessionId?: string;
    };

    if (!slug || !messages?.length) {
      return new Response(
        JSON.stringify({ error: "slug 와 messages 가 필요합니다." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const userQuery = messages[messages.length - 1]?.content || "";

    // ── 1. StoreAgent 조회 ────────────────────────────────
    let agent: { id: string; businessName: string; systemPrompt: string; businessType: string } | null = null;
    let knowledgeChunks: { content: string; category: string }[] = [];

    try {
      agent = await prisma.storeAgent.findUnique({
        where: { slug },
        select: { id: true, businessName: true, systemPrompt: true, businessType: true },
      });

      if (agent) {
        // ── 2. RAG: 관련 청크 검색 (키워드 기반) ────────────
        type RawChunk = { content: string; category: string };
        const allChunks: RawChunk[] = await prisma.knowledgeChunk.findMany({
          where: { storeAgentId: agent.id },
          orderBy: { chunkIndex: "asc" },
          select: { content: true, category: true },
        });

        // 간단한 키워드 매칭으로 관련 청크 우선 선택
        const queryWords = extractKeywords(userQuery);
        type ScoredChunk = RawChunk & { score: number };
        const scored: ScoredChunk[] = allChunks.map((chunk: RawChunk) => ({
          content: chunk.content,
          category: chunk.category,
          score: queryWords.filter((w: string) =>
            chunk.content.toLowerCase().includes(w.toLowerCase())
          ).length,
        }));

        // 관련도 높은 순으로 정렬, 최대 8개 청크 (약 4000 토큰)
        scored.sort((a: ScoredChunk, b: ScoredChunk) => b.score - a.score);
        knowledgeChunks = scored.slice(0, 8);

        // 전혀 매칭 없으면 카테고리별 1개씩 포함
        const allZero = scored.every((c: ScoredChunk) => c.score === 0);
        if (allZero) {
          const byCategory: Record<string, RawChunk> = {};
          for (const chunk of allChunks) {
            if (!byCategory[chunk.category]) byCategory[chunk.category] = chunk;
          }
          knowledgeChunks = Object.values(byCategory).slice(0, 6);
        }

        // 채팅 수 업데이트
        await prisma.storeAgent.update({
          where: { id: agent.id },
          data: { totalChats: { increment: 1 }, monthlyChats: { increment: 1 } },
        });
      }
    } catch {
      // DB 없음 → Mock 모드
    }

    // ── 3. 시스템 프롬프트 구성 ───────────────────────────
    const systemPrompt = buildSystemPrompt(
      agent?.businessName || slug,
      agent?.businessType || "general",
      agent?.systemPrompt || "",
      knowledgeChunks
    );

    // ── 4. API 키 없으면 Mock ─────────────────────────────
    if (!process.env.ANTHROPIC_API_KEY) {
      return mockStoreStream(userQuery, agent?.businessName || slug, knowledgeChunks);
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
      onFinish: async ({ usage }) => {
        // 토큰 사용량 기록
        if (agent) {
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

            // 대화 기록 저장
            await prisma.storeConversation.upsert({
              where: { id: sessionId },
              update: {
                messages: JSON.stringify([
                  ...messages,
                  { role: "assistant", content: "[streaming]" },
                ]),
                updatedAt: new Date(),
              },
              create: {
                id: sessionId,
                storeAgentId: agent.id,
                sessionId,
                messages: JSON.stringify(messages),
              },
            });
          } catch {
            // 기록 실패 무시
          }
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error("[chat/store] 오류:", err);
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
  chunks: { content: string; category: string }[]
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
      ? `\n\n## 학습된 매장 정보\n${chunks
          .map((c) => `[${c.category}]\n${c.content}`)
          .join("\n\n---\n\n")}`
      : "";

  return `당신은 ${businessName}의 전담 AI 응대 직원입니다.
업종: ${typeLabel[businessType] || businessType}

## 응대 원칙
- 항상 친절하고 자연스러운 한국어로 응답
- 학습된 매장 정보를 최대한 활용해 정확한 답변 제공
- 모르는 정보는 솔직히 인정하고 "사장님께 직접 확인해 드릴게요"로 안내
- 답변은 간결하게 (3-4문장 이내), 필요 시 리스트 사용
- 예약/주문/결제는 직접 처리 불가 → 전화번호/링크로 안내
- 할루시네이션 금지: 학습된 정보에 없는 내용은 지어내지 않음

## 에스컬레이션 기준
다음 상황 시 "사장님 연결" 버튼 표시를 위해 [ESCALATE] 태그 추가:
- 고객 불만/환불/분쟁
- 특수 요청 (단체 예약, 케이터링 등)
- 학습 정보에 없는 질문이 반복될 때
${customPrompt ? `\n## 추가 지침\n${customPrompt}` : ""}${knowledgeSection}`;
}

// ─── 키워드 추출 ─────────────────────────────────────────

function extractKeywords(text: string): string[] {
  // 불용어 제거 후 2글자 이상 단어 추출
  const stopWords = new Set(["이", "가", "을", "를", "은", "는", "에", "의", "와", "과", "도", "만", "로", "으로", "있어", "있나요", "있나", "해주세요", "해줘", "알려주세요", "알려줘", "어떻게", "무엇", "뭐가", "뭐야", "언제", "어디", "얼마", "있어요"]);
  return text
    .split(/[\s,.!?]+/)
    .filter((w) => w.length >= 2 && !stopWords.has(w));
}

// ─── Mock 스트림 ─────────────────────────────────────────

function mockStoreStream(
  query: string,
  businessName: string,
  chunks: { content: string; category: string }[]
) {
  const hasKnowledge = chunks.length > 0;
  let response: string;

  if (hasKnowledge) {
    response = `안녕하세요! ${businessName} AI 안내원입니다 😊\n\n학습된 정보를 바탕으로 답변드릴게요.\n\n실제 AI 응답을 위해서는 ANTHROPIC_API_KEY 설정이 필요합니다.\n현재 Mock 모드로 동작 중입니다.`;
  } else {
    response = `안녕하세요! ${businessName}입니다 😊\n\n"${query}"에 대해 문의해 주셨군요.\n\n아직 학습 데이터가 없어서 자세한 안내가 어렵네요.\n사장님께 직접 연락해 주시면 도움을 드릴 수 있어요!`;
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const chunkSize = 15;
      for (let i = 0; i < response.length; i += chunkSize) {
        controller.enqueue(
          encoder.encode(response.slice(i, i + chunkSize))
        );
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
