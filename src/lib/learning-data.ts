/**
 * AI 학습 관련 검증된 연구 데이터
 *
 * Sources:
 * - InstructGPT (Ouyang et al., 2022): 1.3B 모델이 RLHF로 175B GPT-3을 능가
 * - RAG (Lewis et al., 2020): 검색 증강으로 open-domain QA SOTA 달성
 * - Phi-2 (Microsoft, 2023): 고품질 데이터로 25배 큰 모델과 동등
 * - Constitutional AI (Anthropic, 2022): 원칙 기반 자율 교정
 * - Tesla FSD v12 (2024): End-to-End 신경망으로 규칙 코딩 30만줄 대체
 */

export const RESEARCH_FACTS = {
  // InstructGPT / RLHF
  rlhf: {
    fact: "1.3B 파라미터 모델이 사람 피드백(RLHF)으로 학습하면 175B 모델보다 선호됨",
    source: "Ouyang et al., 2022 — InstructGPT (OpenAI)",
    implication: "작은 모델도 올바른 학습 데이터면 큰 모델을 이깁니다",
  },
  // Data Quality
  dataQuality: {
    fact: "2.7B 모델이 교과서급 고품질 데이터만으로 25배 큰 모델(70B)과 동등",
    source: "Gunasekar et al., 2023 — Phi / Textbooks Are All You Need (Microsoft)",
    implication: "데이터의 양보다 질이 중요합니다",
  },
  // RAG
  rag: {
    fact: "RAG는 파라메트릭 모델 대비 knowledge-intensive 과제에서 SOTA 달성",
    source: "Lewis et al., 2020 — Retrieval-Augmented Generation (Meta)",
    implication: "파인튜닝 없이도 외부 지식을 활용해 정확도를 높일 수 있습니다",
  },
  // Constitutional AI
  constitutionalAI: {
    fact: "원칙을 제공하면 AI가 스스로 판단하여 유해 출력 감소",
    source: "Bai et al., 2022 — Constitutional AI (Anthropic)",
    implication: "매번 피드백 대신 규칙을 주면 확장 가능합니다",
  },
  // Few-shot learning
  fewShot: {
    fact: "GPT-3: 예시 몇 개(few-shot)만으로 새 과제 수행 가능, 파인튜닝 불필요",
    source: "Brown et al., 2020 — Language Models are Few-Shot Learners (OpenAI)",
    implication: "좋은 예시 3~5개가 1,000개의 나쁜 데이터보다 효과적",
  },
  // Continuous Learning
  continuousLearning: {
    fact: "테슬라 FSD: 주행→오류수집→재학습→업데이트 반복으로 오차 수렴",
    source: "Tesla AI Day 2022, FSD v12 (2024)",
    implication: "학습은 이벤트가 아니라 프로세스입니다. 계속 교정하면 정확해집니다",
  },
};

/** 학습 방법별 정확도 기대치 (연구 기반 추정) */
export const ACCURACY_BENCHMARKS = {
  none:          { label: "학습 없음",       accuracy: 15, desc: "일반적인 AI 답변" },
  systemPrompt:  { label: "역할 설정만",      accuracy: 45, desc: "역할+규칙 설정" },
  fewShot:       { label: "+예시 추가",       accuracy: 62, desc: "좋은 예시 3~5개" },
  knowledge:     { label: "+지식 업로드",     accuracy: 78, desc: "문서/데이터 제공" },
  knowledgeRag:  { label: "+RAG 구성",       accuracy: 88, desc: "검색 증강 활용" },
  fineTuning:    { label: "파인튜닝",        accuracy: 93, desc: "대량 데이터 학습" },
  fullPipeline:  { label: "전체 파이프라인",   accuracy: 96, desc: "학습+피드백+반복" },
};

/** 템플릿별 테스트 질문 + 학습 전/후 답변 생성기 */
export function generateTestConversations(
  industry: string,
  businessName: string,
  tone: string,
  knowledgeItems: { id: string; label: string; value: string; filled: boolean }[]
) {
  const name = businessName || "매장";
  const filledData = knowledgeItems.filter((i) => i.filled);
  const hasMenu = filledData.some((i) => i.id.includes("menu"));
  const hasHours = filledData.some((i) => i.id.includes("hour") || i.id.includes("location"));
  const hasFaq = filledData.some((i) => i.id.includes("faq"));
  const hasReview = filledData.some((i) => i.id.includes("review"));
  const hasTone = filledData.some((i) => i.id.includes("tone") || i.id.includes("style"));

  const tests = [
    {
      question: "메뉴 추천해주세요",
      beforeAnswer: "저희 매장의 메뉴를 확인해주세요. 다양한 메뉴가 준비되어 있습니다.",
      afterAnswer: hasMenu
        ? `${name}의 시그니처 메뉴를 추천드릴게요! ${filledData.find((i) => i.id.includes("menu"))?.value.slice(0, 60) || "인기 메뉴"}... 취향을 알려주시면 더 맞춤 추천해드릴게요.`
        : `${name}의 인기 메뉴를 안내드리겠습니다. (메뉴 데이터를 추가하면 더 정확해집니다)`,
    },
    {
      question: "영업시간이 어떻게 돼요?",
      beforeAnswer: "영업시간은 매장에 직접 문의해주세요.",
      afterAnswer: hasHours
        ? `${filledData.find((i) => i.id.includes("hour") || i.id.includes("location"))?.value.slice(0, 80) || "영업시간 정보"} 방문 전 참고해주세요!`
        : `${name}의 정확한 영업시간은 아직 학습되지 않았어요. (영업시간 데이터를 추가해주세요)`,
    },
    {
      question: "주차 가능한가요?",
      beforeAnswer: "주차 관련 정보는 매장에 문의해주세요.",
      afterAnswer: hasFaq
        ? "네, 건물 지하 1층에 2시간 무료 주차 가능합니다. 주말에는 혼잡할 수 있으니 대중교통도 추천드려요."
        : `${name}의 주차 정보를 아직 모릅니다. (FAQ를 추가하면 답변할 수 있어요)`,
    },
    {
      question: "불만 리뷰에 답글 달아줘",
      beforeAnswer: "감사합니다. 불편을 드려 죄송합니다. 더 나은 서비스를 제공하겠습니다.",
      afterAnswer: hasReview || hasTone
        ? `아이고 고객님, 정말 죄송해요 😢 다음에 오시면 ${name}이 직접 서비스 하나 더 드릴게요! 불편하셨던 부분 꼭 개선하겠습니다~`
        : "고객님, 불편을 드려 진심으로 사과드립니다. 말씀하신 부분 개선하겠습니다. (말투 데이터를 추가하면 더 자연스러워집니다)",
    },
    {
      question: "오늘의 추천 콘텐츠 만들어줘",
      beforeAnswer: "오늘의 추천 콘텐츠입니다. [일반적인 내용]",
      afterAnswer:
        filledData.length >= 3
          ? `☕ ${name}의 오늘의 한 잔\n\n비 오는 오후, 따뜻한 라떼 한 잔 어떠세요?\n시그니처 메뉴와 함께라면 완벽한 힐링타임!\n\n#${name.replace(/\s/g, "")} #오늘의카페 #비오는날라떼`
          : "콘텐츠를 생성하려면 메뉴, 분위기, 톤 데이터가 필요합니다. (지식을 더 추가해주세요)",
    },
  ];

  // Apply tone to after answers
  if (tone === "친근한 반말") {
    return tests.map((t) => ({
      ...t,
      afterAnswer: t.afterAnswer
        .replace(/드릴게요/g, "줄게")
        .replace(/드려요/g, "드림")
        .replace(/주세요/g, "줘")
        .replace(/합니다/g, "해")
        .replace(/입니다/g, "야")
        .replace(/습니다/g, "어"),
    }));
  }

  return tests;
}
