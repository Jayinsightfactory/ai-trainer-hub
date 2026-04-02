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

  // 사용자가 입력한 실제 데이터 추출
  const menuData = filledData.find((i) => i.id.includes("menu"))?.value || "";
  const hoursData = filledData.find((i) => i.id.includes("hour") || i.id.includes("location"))?.value || "";

  const tests = [
    {
      question: "메뉴 추천해주세요",
      beforeAnswer: "저희 매장의 메뉴를 확인해주세요. 다양한 메뉴가 준비되어 있습니다.",
      afterAnswer: hasMenu
        ? `${name} 메뉴 추천드릴게요! 😊\n\n` +
          `저희 시그니처는 ${menuData.slice(0, 30)}인데요, ` +
          `이게 사장님이 직접 매일 아침 원두를 로스팅해서 만드는 거라 ` +
          `다른 데서는 못 드시는 깊은 풍미가 있어요.\n\n` +
          `만약 달달한 거 좋아하시면 바닐라라떼를 시그니처 원두로 내리는데, ` +
          `여기에 수제 바닐라시럽이 들어가서 기성품이랑은 맛이 완전 달라요!\n\n` +
          `혹시 커피를 못 드시면 자몽에이드 추천드려요 — ` +
          `생자몽을 직접 짜서 만들고, 탄산 세기도 조절 가능합니다.\n\n` +
          `시그니처 + 수제 마들렌 세트가 2,000원 할인이라 같이 드시면 가성비 최고예요! 🧁`
        : `${name}에 오신 걸 환영합니다! 😊\n\n` +
          `메뉴 추천을 드리고 싶은데, 아직 저에게 메뉴 정보가 학습되지 않았어요.\n\n` +
          `💡 '지식 입력'에서 메뉴 데이터를 추가하시면:\n` +
          `• 메뉴별 특징과 재료를 설명하고\n` +
          `• 고객 취향에 맞는 맞춤 추천을 하고\n` +
          `• 세트 메뉴나 페어링까지 제안할 수 있어요!`,
    },
    {
      question: "영업시간이 어떻게 돼요?",
      beforeAnswer: "영업시간은 매장에 직접 문의해주세요.",
      afterAnswer: hasHours
        ? `${name} 영업시간 안내드릴게요! ⏰\n\n` +
          `${hoursData.slice(0, 80)}\n\n` +
          `참고로 라스트오더는 마감 30분 전이에요!\n` +
          `주말에는 웨이팅이 있을 수 있어서, 오전 중에 오시면 여유롭게 즐기실 수 있어요.\n\n` +
          `혹시 예약도 가능하니까, 인원수 알려주시면 자리 확인해드릴게요! 😊`
        : `${name}의 정확한 영업시간을 아직 학습하지 못했어요 😅\n\n` +
          `💡 '지식 입력'에서 영업시간/위치 정보를 추가하시면:\n` +
          `• 요일별 영업시간 안내\n` +
          `• 라스트오더 시간 안내\n` +
          `• 주말/공휴일 운영 여부까지 답변할 수 있어요!`,
    },
    {
      question: "주차 가능한가요?",
      beforeAnswer: "주차 관련 정보는 매장에 문의해주세요.",
      afterAnswer: hasFaq
        ? `네, 주차 가능합니다! 🚗\n\n` +
          `건물 지하 1층에 주차장이 있고, ${name} 이용 시 2시간 무료 주차 가능해요.\n` +
          `주차 등록은 카운터에서 해드리니까 차량번호만 말씀해주세요.\n\n` +
          `다만 주말 점심시간(12~2시)에는 주차장이 꽉 찰 수 있어서,\n` +
          `그때는 건너편 공영주차장(도보 3분)도 괜찮아요 — 시간당 1,000원입니다.\n\n` +
          `대중교통으로는 2호선 OO역 3번출구에서 도보 5분이에요! 🚶`
        : `${name}의 주차 정보를 아직 모르겠어요.\n\n` +
          `💡 FAQ에 주차, 위치, 예약 등의 정보를 추가하시면\n` +
          `이런 질문에도 상세하게 답변할 수 있어요!`,
    },
    {
      question: "별점 2개 리뷰에 답글 달아줘",
      beforeAnswer: "감사합니다. 불편을 드려 죄송합니다. 더 나은 서비스를 제공하겠습니다.",
      afterAnswer: hasReview || hasTone
        ? `고객님, 먼저 소중한 후기 남겨주셔서 감사드려요 🙏\n\n` +
          `맛이 기대에 못 미치셨다니 정말 속상합니다.\n` +
          `혹시 어떤 메뉴를 드셨는지 알려주시면, ` +
          `저희가 직접 확인하고 개선하겠습니다.\n\n` +
          `${name}은 매일 아침 원두 상태를 체크하고, ` +
          `바리스타가 직접 테이스팅한 후에 오픈하는데요 — ` +
          `혹시 그날 컨디션이 안 좋았을 수도 있어요.\n\n` +
          `다음에 방문하시면 사장이 직접 내린 시그니처 한 잔 서비스로 드릴게요! ☕\n` +
          `다시 한번 기회 주시면, 꼭 만족시켜 드리겠습니다!`
        : `고객님, 불편을 드려 죄송합니다.\n말씀하신 부분 개선하겠습니다.\n\n` +
          `💡 리뷰 응대 톤/말투 데이터를 추가하시면:\n` +
          `• 별점별로 다른 톤으로 대응하고\n` +
          `• 가게 특색을 살린 진정성 있는 답글을\n` +
          `• 자동으로 생성할 수 있어요!`,
    },
    {
      question: "오늘의 추천 콘텐츠 만들어줘",
      beforeAnswer: "오늘의 추천 콘텐츠입니다. [일반적인 내용]",
      afterAnswer:
        filledData.length >= 3
          ? `📸 ${name} 인스타그램 포스팅 초안\n\n` +
            `비 오는 수요일 오후,\n` +
            `창가 자리에 앉아 빗소리 들으며\n` +
            `따뜻한 시그니처 라떼 한 잔. ☔️\n\n` +
            `오늘은 특별히 수제 마들렌을 갓 구워냈어요.\n` +
            `버터 향이 카페 안 가득~ 🧈\n\n` +
            `라떼 + 마들렌 세트 8,500원\n` +
            `(비 오는 날 한정 1,000원 할인!)\n\n` +
            `📍 ${name}\n` +
            `⏰ 오늘 22시까지\n\n` +
            `#${name.replace(/\s/g, "")} #비오는날카페 #수제마들렌\n` +
            `#카페추천 #라떼아트 #감성카페`
          : `콘텐츠를 만들려면 더 많은 정보가 필요해요!\n\n` +
            `현재 입력된 데이터: ${filledData.length}개\n` +
            `최소 필요: 3개 (메뉴, 분위기, 톤)\n\n` +
            `💡 지식을 추가하면 이런 게 가능해요:\n` +
            `• 날씨/시간대별 맞춤 콘텐츠\n` +
            `• 시그니처 메뉴 스토리텔링\n` +
            `• 해시태그 자동 생성\n` +
            `• 이벤트/프로모션 포스팅`,
    },
    {
      question: "비건 메뉴 있어요?",
      beforeAnswer: "비건 메뉴에 대해서는 매장에 문의해주세요.",
      afterAnswer: hasMenu
        ? `비건 메뉴 안내드릴게요! 🌱\n\n` +
          `저희 ${name}에서 비건으로 드실 수 있는 건:\n\n` +
          `☕ 음료\n` +
          `• 오트밀크 라떼 — 바리스타 오트밀크 사용, 거품 잘 나요!\n` +
          `• 아메리카노 / 콜드브루 — 당연히 비건이죠 😄\n` +
          `• 자몽에이드 / 레몬에이드 — 생과일이라 안심하세요\n\n` +
          `🍰 디저트\n` +
          `• 현재 비건 디저트는 준비 중인데,\n` +
          `  알러지가 있으시면 미리 말씀해주시면 확인해드릴게요.\n\n` +
          `혹시 유제품만 피하시는 건지, 완전 비건이신지에 따라\n` +
          `추천이 달라질 수 있어요!`
        : `비건 메뉴 문의 감사해요!\n\n아직 메뉴 정보가 학습되지 않아서 정확한 안내가 어려워요.\n\n` +
          `💡 메뉴 데이터에 재료/알러지 정보를 포함하시면\n비건, 글루텐프리 등 맞춤 안내가 가능해요!`,
    },
    {
      question: "단체석 예약하고 싶어요 (8명)",
      beforeAnswer: "예약은 매장에 전화로 문의해주세요.",
      afterAnswer: hasFaq
        ? `8명 단체석 예약 도와드릴게요! 🎉\n\n` +
          `${name}에 8인 테이블이 있어요:\n` +
          `• 2층 단체석 (최대 10인) — 프라이빗하고 조용해요\n` +
          `• 1층 큰 테이블 연결 (최대 12인) — 개방감 있어요\n\n` +
          `📅 원하시는 날짜와 시간을 알려주시면 확인해드릴게요!\n\n` +
          `참고로 단체 예약 시 혜택이 있어요:\n` +
          `• 8인 이상: 음료 1잔 서비스\n` +
          `• 사전 메뉴 선택 시 대기시간 없이 바로 제공\n\n` +
          `생일이나 기념일이시면 케이크 반입도 가능해요! 🎂\n` +
          `추가 문의 있으시면 편하게 말씀해주세요~`
        : `단체 예약 문의 감사합니다!\n\n아직 예약/좌석 정보가 학습되지 않았어요.\n\n` +
          `💡 FAQ에 좌석 정보, 예약 규정을 추가하시면\n예약 안내까지 AI가 자동으로 처리할 수 있어요!`,
    },
    {
      question: "근처에 가볼만한 곳 있어요?",
      beforeAnswer: "주변 관광지에 대해서는 잘 모르겠습니다.",
      afterAnswer: hasHours
        ? `${name} 근처 추천 장소 알려드릴게요! 🗺️\n\n` +
          `🚶 도보 5분 이내\n` +
          `• OO공원 — 산책하기 좋고, 벚꽃 시즌에 예쁨\n` +
          `• OO서점 — 인디 서점, 커피 마신 후 들르기 좋아요\n\n` +
          `🚗 차로 10분\n` +
          `• OO시장 — 먹거리 투어 맛집 많아요\n` +
          `• OO미술관 — 이번 달 무료 전시 중!\n\n` +
          `저희 카페에서 먹고 → 공원 산책 → 서점 코스가\n` +
          `단골 고객님들 사이에서 인기예요 😄`
        : `근처 추천 장소를 알려드리고 싶은데,\n아직 위치/주변 정보가 학습되지 않았어요.\n\n` +
          `💡 위치 데이터를 추가하시면 주변 맛집, 관광지 등\n지역 밀착형 안내도 가능해요!`,
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
        .replace(/습니다/g, "어")
        .replace(/에요/g, "야")
        .replace(/해주세요/g, "해줘")
        .replace(/있어요/g, "있어")
        .replace(/없어요/g, "없어")
        .replace(/같아요/g, "같아")
        .replace(/거예요/g, "거야")
        .replace(/세요/g, "셈"),
    }));
  }

  return tests;
}
