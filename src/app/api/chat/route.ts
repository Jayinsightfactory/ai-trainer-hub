import { NextRequest } from "next/server";

// ─── Mock AI Responses ────────────────────────────────────

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

function generateMockResponse(
  messages: ChatMessage[],
  context: ChatContext
): string {
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) return "안녕하세요! 무엇을 도와드릴까요?";

  const userText = lastMessage.content.toLowerCase();
  const businessName = context.businessName || "사업장";
  const industry = context.industry || "cafe";

  // Greeting
  if (
    userText.includes("안녕") ||
    userText.includes("시작") ||
    userText.includes("hello")
  ) {
    return `안녕하세요! ${businessName}의 AI 트레이너입니다 😊

저는 ${businessName}만을 위한 맞춤형 AI를 만들어드리는 역할을 하고 있어요.

현재 준비된 정보를 바탕으로 몇 가지 제안을 드릴 수 있는데요:

1. **맞춤 시스템 프롬프트** — ${businessName}의 톤앤매너에 딱 맞는 AI 성격을 설계해드려요
2. **업종 트렌드 분석** — ${getIndustryLabel(industry)} 업종의 최신 트렌드를 반영해요
3. **Before/After 미리보기** — AI 적용 전후가 어떻게 달라지는지 보여드려요

어떤 부분이 가장 궁금하세요? 또는 "전체 분석 시작"이라고 하시면 에이전트가 자동으로 분석을 시작합니다!`;
  }

  // Analysis request
  if (
    userText.includes("분석") ||
    userText.includes("시작") ||
    userText.includes("에이전트")
  ) {
    return `좋아요! ${businessName}을 위한 종합 분석을 시작하겠습니다 🚀

**분석 진행 상황:**
✅ 업종 분석: ${getIndustryLabel(industry)} 시장 동향 수집 완료
✅ 경쟁사 분석: 주요 경쟁사 5곳 벤치마킹 완료
✅ 고객 패턴: 타겟 고객 행동 패턴 분석 완료

**핵심 발견사항:**

📊 **트렌드 인사이트**
${getIndustryInsight(industry)}

💡 **추천 전략**
${getIndustryStrategy(industry)}

더 자세한 내용을 보시려면 "상세 리포트"라고 말씀해주세요.
또는 바로 "학습팩 생성"을 시작할 수도 있어요!`;
  }

  // Template/learning pack
  if (
    userText.includes("학습") ||
    userText.includes("템플릿") ||
    userText.includes("생성")
  ) {
    return `${businessName} 맞춤 학습팩을 구성하고 있어요 📦

**학습팩 구성 요소:**

1. **시스템 프롬프트** — ${businessName}의 브랜드 톤앤매너를 반영한 AI 성격
2. **응대 시나리오** — 실제 발생할 수 있는 상황별 대응 가이드
3. **Before/After 예시** — AI 적용 전후 비교 3건
4. **데이터 체크리스트** — AI 품질을 높이기 위해 추가로 필요한 데이터 목록

**현재 품질 점수: 75/100** 📈

추가 데이터를 제공해주시면 품질 점수를 90점 이상까지 올릴 수 있어요!

필요한 데이터:
- [ ] 자주 묻는 질문 TOP 10
- [ ] 기존 고객 응대 매뉴얼
- [ ] 현재 진행 중인 이벤트/프로모션

어떤 데이터를 먼저 준비하시겠어요?`;
  }

  // Report
  if (userText.includes("리포트") || userText.includes("상세")) {
    return `📋 **${businessName} AI 분석 상세 리포트**

---

**1. 시장 현황**
${getIndustryLabel(industry)} 업종은 2026년 현재 디지털 전환이 가속화되고 있습니다.
AI 도입 사업장의 고객 만족도가 평균 34% 높은 것으로 확인됩니다.

**2. 경쟁 환경**
주요 경쟁사들이 이미 AI 기반 고객 응대를 도입하고 있어,
빠른 대응이 필요한 시점입니다.

**3. 고객 분석**
타겟 고객의 주요 접점과 문의 패턴을 분석한 결과,
자동화 가능한 문의의 비율이 약 65%로 나타났습니다.

**4. 개선 기회**
- 응답 시간: 현재 평균 2시간 → AI 적용 시 30초 이내
- 일관성: 담당자별 응대 편차 → 통일된 브랜드 경험
- 24시간 운영: 야간/주말 문의 → 즉시 자동 응대

**5. ROI 예측**
- CS 비용 40% 절감
- 고객 만족도 30% 향상
- 재구매율 15% 증가

다음 단계로 "학습팩 생성"을 시작하시겠어요?`;
  }

  // Before/After
  if (userText.includes("before") || userText.includes("after") || userText.includes("비교") || userText.includes("전후")) {
    return `📊 **${businessName} AI 적용 Before/After**

---

**시나리오 1: 기본 문의 응대**

❌ Before:
"네, 확인해보고 연락드릴게요."

✅ After:
"안녕하세요! 말씀하신 부분 바로 확인해드릴게요 😊
[구체적 정보 즉시 제공]
추가로 궁금하신 점 있으시면 편하게 물어봐주세요!"

---

**시나리오 2: 컴플레인 대응**

❌ Before:
"죄송합니다. 다음에 잘하겠습니다."

✅ After:
"정말 죄송합니다, 불편하셨겠어요 😢
[구체적 원인 파악 + 해결책 제시]
보상으로 [구체적 보상 안내] 드리겠습니다.
소중한 피드백 감사드려요!"

---

**시나리오 3: 프로모션 연계**

❌ Before:
(프로모션 안내 없음)

✅ After:
"참고로 이번 주에 [이벤트명] 진행 중이에요!
[구체적 혜택] 받으실 수 있답니다 ✨"

---

이런 품질의 응대를 24시간 자동으로 제공할 수 있어요!
"학습팩 생성"으로 시작해볼까요?`;
  }

  // Default helpful response
  return `네, 알겠습니다! 😊

${businessName}을 위해 제가 도와드릴 수 있는 것들이에요:

• **"분석 시작"** — 업종 트렌드, 경쟁사, 고객 패턴 종합 분석
• **"전후 비교"** — AI 적용 Before/After 예시 보기
• **"학습팩 생성"** — 맞춤 AI 학습 데이터 구성 시작
• **"상세 리포트"** — 분석 결과 상세 리포트 보기

어떤 것을 해볼까요?`;
}

function getIndustryLabel(industry: string): string {
  const labels: Record<string, string> = {
    cafe: "카페/음식점",
    shopping: "쇼핑몰",
    realestate: "부동산",
    education: "교육",
    marketing: "마케팅",
    legal: "법률",
    medical: "의료",
  };
  return labels[industry] || "일반";
}

function getIndustryInsight(industry: string): string {
  const insights: Record<string, string> = {
    cafe: "2026년 스페셜티 커피 시장이 18% 성장하면서, 무인 카페보다 '대면 응대 품질'이 차별화 핵심으로 떠오르고 있어요. 특히 네이버 리뷰 4.5점 이상 카페의 신규 고객 유입이 3.2배 높습니다.",
    shopping: "AI 기반 개인화 추천을 도입한 쇼핑몰의 객단가가 평균 23% 상승했어요. 또한 장바구니 이탈 후 24시간 내 리타게팅 시 복귀율이 31%에 달합니다.",
    realestate: "비대면 매물 투어(VR/3D) 활용률이 42%를 돌파했고, 매물 문의 후 48시간 내 응답이 없으면 83%가 다른 중개사로 이동하는 것으로 나타났어요.",
    education: "마이크로러닝 콘텐츠의 완료율이 기존 강의 대비 3.1배 높고, 학습 리포트를 제공하는 학원의 학부모 만족도가 4.6점으로 미제공 학원(3.2점) 대비 월등히 높습니다.",
    marketing: "AI 마케팅 도구 도입률이 67%를 넘어섰고, 숏폼 영상 광고의 ROI가 디스플레이 광고 대비 2.4배 높은 것으로 확인됐어요.",
    legal: "법률 상담 챗봇 이용이 전년 대비 89% 증가했고, AI 판례 분석 도구를 활용하는 변호사의 리서치 시간이 55% 단축되었습니다.",
    medical: "비대면 진료가 정착되면서, 예약 리마인더 발송만으로 노쇼율이 15%에서 7%로 크게 감소하는 효과가 확인됐어요.",
  };
  return insights[industry] || insights.cafe!;
}

function getIndustryStrategy(industry: string): string {
  const strategies: Record<string, string> = {
    cafe: "1️⃣ 네이버 리뷰 자동 감사 답글 시스템으로 평점 관리\n2️⃣ 카카오톡 채널 연동으로 신메뉴 알림 + 생일 할인 자동화\n3️⃣ AI 챗봇으로 영업시간·메뉴·예약 문의 즉시 응대",
    shopping: "1️⃣ AI 챗봇으로 배송조회·교환접수 자동화 (CS 비용 40% 절감)\n2️⃣ 장바구니 이탈 고객 자동 리타게팅 알림\n3️⃣ 고객별 개인화 상품 추천 자동화",
    realestate: "1️⃣ 매물 조건 매칭 AI로 즉시 맞춤 추천\n2️⃣ 매물별 학군·교통 자동 분석 리포트\n3️⃣ 카카오톡 연동 신규 매물 자동 알림",
    education: "1️⃣ AI 기반 학습 진도 리포트 자동 생성·발송\n2️⃣ 숏폼 교육 콘텐츠 자동 기획·제작\n3️⃣ 체험 수업 신청자 자동 팔로업 시스템",
    marketing: "1️⃣ AI 콘텐츠 자동 생성으로 SNS 주 5회 포스팅\n2️⃣ 고객 세그먼트별 이메일 캠페인 자동화\n3️⃣ 광고 소재 A/B 테스트 자동 최적화",
    legal: "1️⃣ AI 챗봇으로 분야 판별 + 초기 상담 예약 자동화\n2️⃣ 법률 상식 콘텐츠 자동 생성으로 전문성 노출\n3️⃣ 고객 사건 진행 상황 자동 알림 시스템",
    medical: "1️⃣ AI 사전 문진 + 적합 진료과 자동 안내\n2️⃣ 예약 리마인더 + 대기 시간 실시간 알림\n3️⃣ 진료 후 관리 안내 자동 발송",
  };
  return strategies[industry] || strategies.cafe!;
}

// ─── Route Handler ────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
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

    const fullResponse = generateMockResponse(messages, context || {});

    // Stream the response in chunks for realistic UX
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Split into chunks of ~20 characters for natural typing effect
        const chunkSize = 20;
        for (let i = 0; i < fullResponse.length; i += chunkSize) {
          const chunk = fullResponse.slice(i, i + chunkSize);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
          );
          // Simulate typing delay
          await new Promise((resolve) => setTimeout(resolve, 30));
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
  } catch {
    return new Response(
      JSON.stringify({ error: "채팅 처리 중 오류가 발생했습니다." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
