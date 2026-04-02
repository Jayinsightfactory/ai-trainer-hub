import type { Industry, Purpose, LearningLevel } from "@/types";
import type { ContextWeaverOutput } from "./context-weaver";

// ─── Types ────────────────────────────────────────────────

export interface UserProfile {
  businessName: string;
  industry: Industry;
  purpose: Purpose;
  level: LearningLevel;
  additionalContext?: string;
}

export interface BeforeAfterExample {
  scenario: string;
  before: string;
  after: string;
  improvement: string;
}

export interface LearningPackResult {
  title: string;
  description: string;
  systemPrompt: string;
  examples: BeforeAfterExample[];
  checklist: string[];
  qualityScore: number;
  level: LearningLevel;
  estimatedReadyTime: string;
  tags: string[];
}

// ─── Before/After Example Data ────────────────────────────

const BEFORE_AFTER_DATA: Record<string, BeforeAfterExample[]> = {
  "cafe_customer_service": [
    {
      scenario: "메뉴 추천 요청",
      before: "저희 아메리카노가 맛있어요. 한번 드셔보세요.",
      after: "안녕하세요! 어떤 스타일을 좋아하시는지 여쭤봐도 될까요? 산미가 있는 걸 좋아하시면 에티오피아 싱글오리진을, 고소하고 깊은 맛을 원하시면 시그니처 블렌드를 추천드려요. 지금 시즌 한정 봄 딸기 라떼도 인기가 많답니다! 🍓",
      improvement: "고객 취향 파악 → 맞춤 추천 → 시즌 메뉴 자연스러운 업셀링",
    },
    {
      scenario: "영업시간 문의",
      before: "10시에서 9시까지요.",
      after: "저희 매장은 매일 오전 10시부터 밤 9시까지 운영하고 있어요! 😊 참고로 라스트 오더는 8시 30분입니다. 주말에는 브런치 메뉴도 준비하고 있으니 여유롭게 방문해주세요. 주차는 건물 뒤편에 2시간 무료 가능합니다!",
      improvement: "핵심 정보 + 부가 정보(라스트오더, 주말 특이사항, 주차) 선제 제공",
    },
    {
      scenario: "컴플레인 대응",
      before: "죄송합니다. 다음에 잘하겠습니다.",
      after: "정말 죄송합니다, 불편하셨겠어요 😢 말씀하신 부분 바로 확인해서 개선하겠습니다. 보상으로 다음 방문 시 음료 한 잔 무료 쿠폰을 드릴게요. 쿠폰은 카카오톡으로 바로 보내드리겠습니다. 소중한 피드백 감사드려요, 더 나은 모습 보여드리겠습니다!",
      improvement: "공감 표현 → 구체적 조치 약속 → 보상 제안 → 감사 표현",
    },
  ],
  "cafe_content": [
    {
      scenario: "인스타그램 신메뉴 홍보",
      before: "새로운 딸기 라떼 출시했습니다. 많이 와주세요.",
      after: "🍓 봄이 컵에 담겼어요\n\n딸기 농장에서 매일 아침 배송받는\n생딸기 12알이 통째로 들어간\n#시그니처봄딸기라떼\n\n입안 가득 퍼지는 상큼함,\n올봄 이 한 잔이면 충분해요 ✨\n\n📍 [카페명] | 한정 수량 50잔/일\n🔗 프로필 링크에서 선주문 가능!\n\n#카페추천 #봄신메뉴 #딸기라떼 #카페스타그램",
      improvement: "감성 카피 + 구체적 스펙 + 한정성 강조 + CTA + 해시태그 최적화",
    },
    {
      scenario: "네이버 블로그 후기 관리",
      before: "방문해주셔서 감사합니다.",
      after: "소중한 후기 남겨주셔서 정말 감사합니다! 💛 말씀하신 크로플, 저희 파티시에가 매일 아침 직접 구워내는 자부심 메뉴인데 맛있게 드셨다니 기쁘네요. 다음 방문 시에는 새로 출시된 바질토마토 크로플도 꼭 드셔보세요! DM 주시면 음료 사이즈업 쿠폰 보내드릴게요 😊",
      improvement: "구체적 메뉴 언급 + 스토리텔링 + 신메뉴 추천 + 재방문 유도 인센티브",
    },
  ],
  "shopping_customer_service": [
    {
      scenario: "배송 지연 문의",
      before: "택배사 문제입니다. 조금만 기다려주세요.",
      after: "배송이 늦어져서 정말 죄송합니다 😥 바로 확인해보니, 현재 [택배사] 물류센터에서 날씨 영향으로 소폭 지연이 있었어요. 내일 오전 중 배송 예정입니다! 실시간 배송 추적 링크 보내드릴게요 → [링크]. 혹시 내일까지 수령이 어려우시면 배송지 변경도 가능하니 편하게 말씀해주세요!",
      improvement: "원인 설명 + 구체적 배송 예정일 + 추적 링크 + 대안 제시",
    },
    {
      scenario: "사이즈 교환 요청",
      before: "교환 신청은 마이페이지에서 해주세요.",
      after: "사이즈가 맞지 않으셨군요! 교환 도와드릴게요 😊 현재 입으신 사이즈와 원하시는 사이즈를 알려주시면, 재고 확인 후 바로 교환 접수해드릴게요. 참고로 이 상품은 약간 크게 나오는 편이라, 평소보다 한 사이즈 작게 추천드려요. 교환 배송비는 무료입니다!",
      improvement: "공감 + 필요 정보 안내 + 사이즈 팁 + 무료 교환 안내로 부담 해소",
    },
    {
      scenario: "반품/환불 요청",
      before: "반품 규정상 7일 이내에만 가능합니다.",
      after: "반품 원하시는군요, 혹시 불편하셨던 부분이 있을까요? 제품 수령일 기준 7일 이내라 반품 가능하세요! 제가 바로 반품 접수 도와드릴게요. 수거는 내일 중 방문 예정이고, 환불은 수거 확인 후 1-2영업일 내 원결제 수단으로 처리됩니다. 다른 상품으로 교환도 가능한데, 혹시 관심 있으실까요?",
      improvement: "불편 사항 경청 → 즉시 처리 → 일정 안내 → 교환 대안 제시",
    },
  ],
  "shopping_content": [
    {
      scenario: "신상품 출시 콘텐츠",
      before: "새로운 봄 신상 입고했습니다. 구경오세요.",
      after: "🌸 2026 S/S 봄 컬렉션 드롭\n\n올봄 키워드는 #소프트미니멀\n불필요한 건 빼고, 핏에 집중했어요\n\n✔ 오버핏 린넨 블레이저 — 출근룩 → 퇴근 후 데이트룩 원픽\n✔ 와이드 밴딩 슬랙스 — 하루종일 편한 착용감\n✔ 크롭 니트 가디건 — 레이어드 만능 아이템\n\n💡 출시 기념 72시간 한정 15% OFF\n🔗 지금 바로 → 프로필 링크\n\n#봄코디 #데일리룩 #미니멀패션 #신상입고",
      improvement: "시즌 키워드 + 각 아이템 활용법 + 한정 프로모션 + CTA",
    },
  ],
  "realestate_customer_service": [
    {
      scenario: "매물 문의",
      before: "네, 그 매물 있습니다. 한번 오세요.",
      after: "관심 가져주셔서 감사합니다! 해당 매물 정보 정리해서 보내드릴게요 😊\n\n📍 위치: 강남역 도보 7분\n🏠 구조: 23평 / 방2 욕1 / 남향\n💰 전세: 3.2억 (협의 가능)\n🏫 학군: 00초 도보 5분\n🚇 교통: 2호선 강남역 + 신분당선 더블 역세권\n\n현재 실입주 가능하고, 이번 주 토요일 오후에 방문 가능하세요? 시간 맞춰 직접 안내해드리겠습니다!",
      improvement: "핵심 정보 구조화 + 학군/교통 정보 선제 제공 + 방문 일정 제안",
    },
    {
      scenario: "가격 협상 문의",
      before: "집주인한테 물어볼게요.",
      after: "네, 가격 협의 의사 여쭤보겠습니다! 참고로 해당 단지 최근 3개월 실거래가가 3.0-3.3억 사이인데, 현재 매물이 3.2억으로 시세 범위 내에 있어요. 다만 입주 시기를 조율하시면 협의 여지가 더 있을 수 있습니다. 희망하시는 금액과 입주 희망일을 알려주시면 집주인 측과 최선으로 협의해보겠습니다!",
      improvement: "실거래가 근거 제시 → 협의 여지 안내 → 구체적 정보 요청",
    },
  ],
  "education_content": [
    {
      scenario: "학원 소개 콘텐츠",
      before: "저희 학원은 수학 전문 학원입니다. 등록 문의 주세요.",
      after: "📐 \"수학이 재미있어졌어요\" — 학부모 후기 387건의 공통 키워드\n\n[학원명]이 다른 이유:\n\n1️⃣ AI 진단 → 아이별 약점 정확히 파악\n2️⃣ 1:4 소수정예 → 모르는 거 바로바로 해결\n3️⃣ 주간 리포트 → 카톡으로 학습 현황 실시간 공유\n\n📊 2025 실적:\n- 내신 1등급 상승 학생 78명\n- 수학 자신감 향상 학부모 만족도 4.8/5.0\n\n🎁 3월 무료 레벨테스트 + 1주 체험수업\n📞 상담 예약: 프로필 링크 클릭!\n\n#수학학원 #초등수학 #중등수학 #내신대비",
      improvement: "실제 후기 활용 + 차별점 3가지 + 실적 데이터 + 무료 체험 CTA",
    },
    {
      scenario: "학습 리포트 발송",
      before: "이번 주 수학 진도: 분수 덧셈. 숙제 잘 해오세요.",
      after: "📚 [학생명] 주간 학습 리포트 (3/24~3/28)\n\n✅ 이번 주 학습 내용: 분수의 덧셈·뺄셈\n📈 이해도: 85% (지난주 72% → 13%p 향상!)\n⭐ 잘한 점: 통분 개념을 정확히 이해하고 있어요\n📌 보완할 점: 대분수 변환에서 실수가 가끔 있어요\n🏠 이번 주 숙제: 교재 P.42~45 (매일 10분씩)\n\n💬 선생님 한마디: \"분수 개념을 빠르게 잡아가고 있어요! 이번 주 숙제만 꾸준히 하면 다음 주 소수 단원도 수월할 거예요 😊\"\n\n궁금하신 점은 편하게 답장해주세요!",
      improvement: "정량 데이터 + 구체적 잘한 점/보완점 + 학습 연계 + 격려 메시지",
    },
  ],
};

// ─── Synthesis Function ───────────────────────────────────

export async function synthesize(
  contextOutput: ContextWeaverOutput,
  userProfile: UserProfile
): Promise<LearningPackResult> {
  // Simulate processing
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const key = `${userProfile.industry}_${userProfile.purpose}`;
  const examples = BEFORE_AFTER_DATA[key] ?? BEFORE_AFTER_DATA["cafe_customer_service"]!;

  const industryLabels: Record<Industry, string> = {
    cafe: "카페/음식점",
    shopping: "쇼핑몰",
    realestate: "부동산",
    education: "교육",
    marketing: "마케팅",
    legal: "법률",
    medical: "의료",
  };

  const purposeLabels: Record<Purpose, string> = {
    customer_service: "고객 응대",
    content: "콘텐츠 생성",
    analytics: "데이터 분석",
    automation: "업무 자동화",
  };

  const industryLabel = industryLabels[userProfile.industry];
  const purposeLabel = purposeLabels[userProfile.purpose];

  const title = `${userProfile.businessName} ${purposeLabel} AI 학습팩`;
  const description = `${industryLabel} 업종 맞춤 ${purposeLabel} AI를 위한 학습 데이터입니다. ${contextOutput.knowledge.trends[0]} 등 최신 트렌드를 반영하여 구성했습니다.`;

  const checklist = [
    "사업장 기본 정보 (이름, 위치, 영업시간)",
    "주요 상품/서비스 목록 및 가격",
    "자주 받는 고객 질문 TOP 10",
    "기존 고객 응대 매뉴얼 또는 가이드",
    "브랜드 톤앤매너 가이드",
    "경쟁사 대비 차별화 포인트",
    "최근 3개월 고객 리뷰/피드백",
    "프로모션·이벤트 일정",
  ];

  const tags = [
    industryLabel,
    purposeLabel,
    `레벨 ${userProfile.level}`,
    "MVP",
    "2026 트렌드 반영",
  ];

  // Quality score: combine context weaver score with synthesis adjustments
  const qualityScore = Math.min(
    contextOutput.qualityScore + Math.floor(Math.random() * 5) + 3,
    98
  );

  return {
    title,
    description,
    systemPrompt: contextOutput.systemPrompt,
    examples,
    checklist,
    qualityScore,
    level: userProfile.level,
    estimatedReadyTime: "약 3분",
    tags,
  };
}
