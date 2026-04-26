export interface BusinessInfo {
  id: string;
  name: string;
  category: string;
  address: string;
  phone?: string;
  naverPlaceUrl: string;
  naverPlaceId: string;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  contactStatus: "pending" | "contacted" | "responded" | "converted";
  collectedAt: string;
}

export interface MarketingMessage {
  subject: string;
  body: string;
  shortUrl: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  cafe: "카페",
  restaurant: "식당",
  fitness: "헬스장",
  pilates: "필라테스",
  study_cafe: "스터디카페",
  beauty: "미용실",
  nail: "네일샵",
  academy: "학원",
};

function toSlug(name: string): string {
  return name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9가-힣-]/g, "")
    .toLowerCase();
}

const CATEGORY_BENEFITS: Record<string, string[]> = {
  cafe: [
    '"영업시간 언제예요?", "주차 되나요?" 등 반복 질문 자동 처리',
    "메뉴 소개 및 오늘의 음료 추천 AI 자동 안내",
    "테이블 예약 및 픽업 주문 연결",
  ],
  restaurant: [
    '"예약 가능한가요?", "단체석 있나요?" 자동 응답',
    "메뉴 및 가격 안내 자동화",
    "웨이팅 현황 실시간 안내",
  ],
  fitness: [
    '"PT 가격이 얼마예요?", "무료 체험 있나요?" 자동 응답',
    "회원권 안내 및 등록 연결",
    "수업 스케줄 및 트레이너 정보 제공",
  ],
  pilates: [
    '"수업 시간표 어떻게 돼요?", "체험 수업 있나요?" 자동 안내',
    "회원 등록 및 상담 예약 자동 연결",
    "강사 소개 및 수업 정보 제공",
  ],
  study_cafe: [
    '"현재 자리 있나요?", "이용요금이 어떻게 돼요?" 자동 응답',
    "할인 쿠폰 및 정기권 안내 자동화",
    "혼잡도 실시간 안내",
  ],
  beauty: [
    '"예약 되나요?", "가격표 보내주세요" 자동 처리',
    "시술 메뉴 및 가격 안내 자동화",
    "예약 확인 및 리마인더 발송",
  ],
  nail: [
    '"오늘 예약 가능해요?", "가격이 얼마예요?" 자동 응답',
    "디자인 카탈로그 자동 제공",
    "예약 대기 및 취소 처리",
  ],
  academy: [
    '"수강료가 어떻게 돼요?", "커리큘럼 알 수 있나요?" 자동 안내',
    "무료 상담 예약 자동 연결",
    "개강일 및 등록 안내 자동화",
  ],
};

export function generateMarketingMessage(
  business: BusinessInfo
): MarketingMessage {
  const categoryLabel =
    CATEGORY_LABELS[business.category] || business.category;
  const slug = toSlug(business.name);
  const shortUrl = `https://www.nowlink.kr/store/${slug}`;

  const benefits = CATEGORY_BENEFITS[business.category] ||
    CATEGORY_BENEFITS["cafe"] || [];

  const benefitLines = benefits
    .map((b) => `✅ ${b}`)
    .join("\n");

  const subject = `[나우링크] ${business.name} 사장님, AI 고객응대 무료로 시작해보세요`;

  const body = `안녕하세요, ${business.name} 사장님! 👋

저희는 ${categoryLabel} 사장님들을 위한 AI 고객응대 서비스 '나우링크'입니다.

바쁜 영업 중에도 카카오톡·네이버 플레이스로 들어오는 고객 문의,
AI가 24시간 자동으로 처리해드립니다.

${benefitLines}
✅ 무료로 시작 가능 (월 100건 무료, 신용카드 불필요)

${business.name} 전용 AI 챗봇 체험 링크:
👉 ${shortUrl}

지금 바로 무료로 시작하시고, 고객 응대에 쏟는 시간을 아껴보세요!

궁금하신 점은 언제든 연락주세요.
나우링크 팀 드림 🙏

─────────────────────────
수신 거부: 위 링크에서 '수신 거부' 클릭
`;

  return { subject, body, shortUrl };
}
