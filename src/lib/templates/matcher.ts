import { TEMPLATES, type TemplateData } from "./index";

// ─── Template Matching ────────────────────────────────────

/**
 * Find the best matching template for given industry + purpose.
 * Falls back to the first template if no exact match found.
 */
export function matchTemplate(
  industry: string,
  purpose: string
): TemplateData {
  // Exact match
  const exact = TEMPLATES.find(
    (t) => t.industry === industry && t.purpose === purpose
  );
  if (exact) return exact;

  // Industry match (any purpose)
  const industryMatch = TEMPLATES.find((t) => t.industry === industry);
  if (industryMatch) return industryMatch;

  // Purpose match (any industry)
  const purposeMatch = TEMPLATES.find((t) => t.purpose === purpose);
  if (purposeMatch) return purposeMatch;

  // Fallback
  return TEMPLATES[0]!;
}

// ─── Before/After Examples ────────────────────────────────

interface BeforeAfterPair {
  before: string[];
  after: string[];
}

const LEVEL_EXAMPLES: Record<string, Record<number, BeforeAfterPair>> = {
  "cafe_customer_service": {
    1: {
      before: [
        "고객: 메뉴 추천해주세요 → '아메리카노 맛있어요'",
        "고객: 몇 시까지 해요? → '10시에서 9시까지요'",
        "고객: 주차 되나요? → '네, 됩니다'",
      ],
      after: [
        "고객: 메뉴 추천해주세요 → 취향 파악 질문 → 맞춤 3종 추천 + 시즌 메뉴 소개",
        "고객: 몇 시까지 해요? → 영업시간 + 라스트오더 + 주말 특이사항 + 주차 안내",
        "고객: 주차 되나요? → 주차 가능 여부 + 위치 + 무료 시간 + 대중교통 대안",
      ],
    },
    2: {
      before: [
        "컴플레인: 커피가 미지근해요 → '죄송합니다'",
        "단체 예약 문의 → '전화주세요'",
        "알러지 문의 → '직원에게 물어봐주세요'",
      ],
      after: [
        "컴플레인: 커피가 미지근해요 → 공감 + 즉시 재제조 안내 + 보상 쿠폰 + 재발 방지 약속",
        "단체 예약 문의 → 가능 인원 + 메뉴 패키지 + 가격 + 예약 가능 일정 즉시 안내",
        "알러지 문의 → 해당 메뉴 알러지 성분 목록 + 대체 메뉴 추천 + 주의사항 안내",
      ],
    },
    3: {
      before: [
        "리뷰 답변: '감사합니다' 일괄 답변",
        "재방문 유도: 없음",
        "고객 취향 기억: 불가",
      ],
      after: [
        "리뷰 답변: 주문 메뉴 언급 + 맞춤 감사 + 신메뉴 추천 + 재방문 인센티브",
        "재방문 유도: 방문 주기 분석 → 적절한 시점에 맞춤 메시지 + 쿠폰",
        "고객 취향 기억: 이전 주문 기반 '지난번 드셨던 OO 어떠셨어요?' 개인화 응대",
      ],
    },
    4: {
      before: [
        "매출 연계: CS와 매출 데이터 분리",
        "트렌드 반영: 수동 업데이트",
        "다국어: 영어 응대 불가",
      ],
      after: [
        "매출 연계: CS 데이터 분석 → 인기 메뉴/컴플레인 패턴 → 메뉴 개선 제안",
        "트렌드 반영: 카페 트렌드 자동 수집 → 시즌 메뉴/이벤트 제안",
        "다국어: 영어·일본어·중국어 자동 응대 → 관광지 카페 외국인 CS 해결",
      ],
    },
  },
  "cafe_content": {
    1: {
      before: [
        "인스타 포스팅: '새 메뉴 나왔어요. 맛있어요.'",
        "해시태그: #카페 #커피 2개만 사용",
        "블로그: 메뉴 사진 + 가격만 나열",
      ],
      after: [
        "인스타 포스팅: 감성 카피 + 메뉴 스토리 + 한정 요소 + 15개 최적화 해시태그",
        "해시태그: 대형/중형/소형 전략적 배합 + 지역 태그 + 시즌 태그",
        "블로그: SEO 키워드 최적화 + 방문 후기 형식 + 지도 연계 + CTA",
      ],
    },
    2: {
      before: [
        "리뷰 답변: 복붙 '감사합니다'",
        "콘텐츠 캘린더: 없음, 생각날 때 포스팅",
        "릴스: 제작 안 함",
      ],
      after: [
        "리뷰 답변: 주문 메뉴 맞춤 + 스토리텔링 + 재방문 유도 쿠폰 안내",
        "콘텐츠 캘린더: 주 5회 자동 생성 (신메뉴/일상/이벤트/리뷰/비하인드)",
        "릴스: 15초 구성안 + 자막 텍스트 + 트렌드 음원 추천 자동 생성",
      ],
    },
    3: {
      before: [
        "이벤트 홍보: 단순 공지형",
        "카카오톡: 미활용",
      ],
      after: [
        "이벤트 홍보: 카운트다운 + 티저 → 본 공개 → 리마인더 시리즈 자동 생성",
        "카카오톡: 세그먼트별 맞춤 알림 (신규/단골/휴면) + 자동 쿠폰 발송",
      ],
    },
    4: {
      before: [
        "성과 분석: 감으로 판단",
        "콘텐츠 최적화: 없음",
      ],
      after: [
        "성과 분석: 게시물별 도달/저장/전환 자동 리포트 + 인사이트 도출",
        "콘텐츠 최적화: A/B 테스트 자동 실행 → 최적 포맷/시간대/해시태그 도출",
      ],
    },
  },
  "shopping_customer_service": {
    1: {
      before: [
        "배송 문의: '택배사에 확인해보세요'",
        "사이즈 문의: '상세페이지 참고해주세요'",
        "반품 문의: '7일 이내 가능합니다'",
      ],
      after: [
        "배송 문의: 주문번호 → 실시간 추적 링크 + 예상 도착일 + 지연 시 사과/보상",
        "사이즈 문의: 키/몸무게 기반 추천 + 착용 리뷰 요약 + 교환 무료 안내",
        "반품 문의: 사유 파악 → 반품 접수 → 수거 일정 → 환불 예정일 원스톱 안내",
      ],
    },
    2: {
      before: [
        "컴플레인: '규정상 어렵습니다'",
        "재구매 유도: 없음",
      ],
      after: [
        "컴플레인: 공감 → 해결책 제시 → 보상 안내 → VIP 등급업 제안",
        "재구매 유도: 구매 이력 기반 맞춤 추천 + 적립금 안내 + 쿠폰 발급",
      ],
    },
    3: {
      before: [
        "야간 CS: 응대 불가",
        "멀티채널: 채널별 답변 다름",
      ],
      after: [
        "야간 CS: 24시간 자동 응대 → 복잡 건 접수 후 익일 오전 우선 처리",
        "멀티채널: 모든 채널 동일 품질 응대 + 이력 통합 관리",
      ],
    },
    4: {
      before: [
        "CS 데이터 활용: 없음",
        "프로모션 연계: 수동",
      ],
      after: [
        "CS 데이터 활용: 문의 패턴 분석 → 상품 개선/상세페이지 수정 제안",
        "프로모션 연계: 고객 세그먼트별 자동 프로모션 추천 + 발송",
      ],
    },
  },
  "shopping_content": {
    1: {
      before: [
        "상세페이지: 사진 + 스펙 나열",
        "SNS: '신상 입고! 구경오세요'",
      ],
      after: [
        "상세페이지: USP 헤드라인 + 착용 시나리오 + 사이즈 가이드 + 리뷰 하이라이트",
        "SNS: 시즌 키워드 + 스타일링 팁 + 한정 프로모션 + 최적화 해시태그",
      ],
    },
    2: {
      before: [
        "이메일: 전체 동일 발송",
        "프로모션: 일괄 할인 공지",
      ],
      after: [
        "이메일: 세그먼트별 개인화 제목 + 큐레이션 + 장바구니 이탈 리마인더",
        "프로모션: 타겟별 차별화 + FOMO 요소 + A/B 테스트 2종",
      ],
    },
    3: {
      before: [
        "숏폼: 제작 안 함",
        "라이브커머스: 대본 없이 진행",
      ],
      after: [
        "숏폼: 15초 구성안 + 스크립트 + 자막 + 트렌드 음원 추천",
        "라이브커머스: 상품별 스크립트 + 타임라인 + 프로모션 시나리오 자동 생성",
      ],
    },
    4: {
      before: [
        "콘텐츠 ROI: 측정 불가",
      ],
      after: [
        "콘텐츠 ROI: 게시물별 매출 기여도 추적 + 자동 최적화 리포트",
      ],
    },
  },
  "realestate_customer_service": {
    1: {
      before: [
        "매물 문의: '한번 오세요'",
        "가격 문의: '집주인한테 물어볼게요'",
      ],
      after: [
        "매물 문의: 조건 정리 → 맞춤 매물 3건 + 위치/교통/학군 정보 구조화 제공",
        "가격 문의: 실거래가 데이터 기반 시세 설명 + 협의 여지 + 구체적 제안 요청",
      ],
    },
    2: {
      before: [
        "방문 예약: 전화로만 가능",
        "계약 안내: 구두 설명만",
      ],
      after: [
        "방문 예약: 카카오톡 자동 일정 조율 + 방문 전 매물 정보 패키지 발송",
        "계약 안내: 절차별 체크리스트 + 필요 서류 + 예상 비용 구조화 안내",
      ],
    },
    3: {
      before: [
        "시세 분석: 경험에 의존",
        "고객 관리: 수기 메모",
      ],
      after: [
        "시세 분석: 실거래가 + 호가 + 개발 호재 통합 리포트 자동 생성",
        "고객 관리: CRM 연동 → 조건 변경 시 자동 매물 매칭 알림",
      ],
    },
    4: {
      before: [
        "마케팅: 네이버 매물 등록만",
      ],
      after: [
        "마케팅: 매물별 콘텐츠 자동 생성 → 네이버+인스타+블로그 동시 배포",
      ],
    },
  },
  "education_content": {
    1: {
      before: [
        "학원 소개: '수학 전문 학원입니다'",
        "학습 리포트: '이번 주 분수 했습니다. 숙제 해오세요'",
      ],
      after: [
        "학원 소개: 차별점 3가지 + 실적 데이터 + 학부모 후기 + 무료 체험 CTA",
        "학습 리포트: 이해도 수치 + 잘한 점/보완점 + 선생님 코멘트 + 가정 학습 가이드",
      ],
    },
    2: {
      before: [
        "SNS: 수업 사진만 올림",
        "학부모 소통: 분기 1회 상담",
      ],
      after: [
        "SNS: 학습 팁 숏폼 + 성적 향상 사례 + 이벤트 홍보 주 3회 자동 생성",
        "학부모 소통: 주간 리포트 + 월간 성장 분석 + 시험 대비 가이드 자동 발송",
      ],
    },
    3: {
      before: [
        "교육 콘텐츠: 교재 내용 반복",
        "성과 관리: 시험 점수만 기록",
      ],
      after: [
        "교육 콘텐츠: 학생 수준별 맞춤 보충 자료 + 숏폼 개념 설명 자동 생성",
        "성과 관리: 영역별 성취도 추적 + 약점 분석 + 맞춤 보완 학습 경로 자동 생성",
      ],
    },
    4: {
      before: [
        "입시 분석: 수동 데이터 정리",
      ],
      after: [
        "입시 분석: 성적 추이 + 대학 합격 예측 + 맞춤 전략 리포트 자동 생성",
      ],
    },
  },
};

/**
 * Get before/after examples for a template at a specific learning level.
 */
export function getBeforeAfter(
  template: TemplateData,
  level: number
): { before: string[]; after: string[] } {
  const key = `${template.industry}_${template.purpose}`;
  const levelData = LEVEL_EXAMPLES[key];

  if (!levelData) {
    // Fallback to cafe_customer_service level 1
    const fallback = LEVEL_EXAMPLES["cafe_customer_service"]!;
    return fallback[1]!;
  }

  // Find exact level or closest lower level
  const available = Object.keys(levelData)
    .map(Number)
    .sort((a, b) => a - b);

  let targetLevel = available[0]!;
  for (const l of available) {
    if (l <= level) targetLevel = l;
  }

  return levelData[targetLevel]!;
}
