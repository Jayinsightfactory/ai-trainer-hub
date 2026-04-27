/**
 * 업종별 고객 질문 뱅크
 * 사장님 온보딩 폼에서 답변 → KnowledgeChunk로 저장
 */

export interface Question {
  id: string;
  category: string;        // faq | hours | menu | price | policy | reservation
  question: string;
  placeholder: string;     // 예시 답변
  required: boolean;
}

export interface QuestionSection {
  title: string;
  icon: string;
  questions: Question[];
}

// ── 공통 질문 (모든 업종) ────────────────────────────────────────────

const COMMON_SECTIONS: QuestionSection[] = [
  {
    title: "영업 기본 정보",
    icon: "🕐",
    questions: [
      {
        id: "hours_weekday",
        category: "hours",
        question: "평일 영업시간이 어떻게 되나요?",
        placeholder: "예) 평일 09:00 ~ 22:00",
        required: true,
      },
      {
        id: "hours_weekend",
        category: "hours",
        question: "주말/공휴일 영업시간은요?",
        placeholder: "예) 토요일 10:00~20:00, 일요일 휴무",
        required: true,
      },
      {
        id: "hours_closed",
        category: "hours",
        question: "정기 휴무일이 있나요?",
        placeholder: "예) 매주 월요일 휴무 / 연중무휴",
        required: true,
      },
      {
        id: "parking",
        category: "faq",
        question: "주차가 가능한가요?",
        placeholder: "예) 건물 지하주차장 2시간 무료 / 근처 공영주차장 이용",
        required: false,
      },
      {
        id: "payment",
        category: "faq",
        question: "결제 수단은 어떻게 되나요?",
        placeholder: "예) 카드, 현금, 카카오페이, 네이버페이 가능",
        required: false,
      },
      {
        id: "location_tip",
        category: "faq",
        question: "찾아오시는 길 / 랜드마크가 있나요?",
        placeholder: "예) 2호선 홍대입구역 3번 출구에서 도보 5분, 파리바게뜨 옆 건물 2층",
        required: false,
      },
    ],
  },
  {
    title: "예약 & 문의",
    icon: "📅",
    questions: [
      {
        id: "reservation_method",
        category: "reservation",
        question: "예약은 어떻게 하나요?",
        placeholder: "예) 나우링크 앱에서 온라인 예약 / 전화 예약 가능",
        required: true,
      },
      {
        id: "reservation_walkin",
        category: "reservation",
        question: "예약 없이 방문해도 되나요?",
        placeholder: "예) 가능하지만 대기가 발생할 수 있습니다 / 예약 필수입니다",
        required: false,
      },
      {
        id: "cancel_policy",
        category: "policy",
        question: "예약 취소/변경 정책이 있나요?",
        placeholder: "예) 하루 전까지 무료 취소, 당일 취소 시 취소 불가",
        required: false,
      },
    ],
  },
];

// ── 업종별 특화 질문 ─────────────────────────────────────────────────

const CATEGORY_SECTIONS: Record<string, QuestionSection[]> = {
  cafe: [
    {
      title: "메뉴 & 음료",
      icon: "☕",
      questions: [
        { id: "menu_signature", category: "menu", question: "대표 메뉴나 시그니처 음료가 있나요?", placeholder: "예) 직접 로스팅한 아메리카노(5,000원), 딸기라떼(7,000원)가 인기", required: true },
        { id: "menu_price_range", category: "price", question: "메뉴 가격대가 어떻게 되나요?", placeholder: "예) 음료 4,500원~8,500원, 디저트 3,000원~8,000원", required: true },
        { id: "menu_food", category: "menu", question: "음식(베이커리/케이크 등)도 파나요?", placeholder: "예) 크루아상, 스콘 등 직접 구운 베이커리 운영 / 음료만 판매", required: false },
        { id: "menu_seasonal", category: "menu", question: "시즌 한정 메뉴가 있나요?", placeholder: "예) 여름: 복숭아라떼, 겨울: 뱅쇼 운영", required: false },
        { id: "menu_takeout", category: "faq", question: "포장(테이크아웃) 되나요?", placeholder: "예) 가능합니다 / 일부 메뉴만 가능", required: false },
      ],
    },
    {
      title: "공간 & 편의시설",
      icon: "🛋️",
      questions: [
        { id: "wifi", category: "faq", question: "와이파이가 있나요? 비밀번호는요?", placeholder: "예) 무료 와이파이 제공, 비밀번호는 방문 시 안내 / 없음", required: false },
        { id: "outlet", category: "faq", question: "콘센트 사용 가능한가요?", placeholder: "예) 전 좌석 콘센트 있음 / 일부 좌석만 가능", required: false },
        { id: "pet", category: "faq", question: "반려동물 동반 가능한가요?", placeholder: "예) 테라스 좌석 가능 / 실내 불가", required: false },
        { id: "study", category: "faq", question: "공부/작업하기 좋은 환경인가요?", placeholder: "예) 노트북 작업 환경 좋음, 단 주말엔 혼잡 / 일반 카페", required: false },
        { id: "group_seat", category: "faq", question: "단체석이나 프라이빗룸 있나요?", placeholder: "예) 8인 이상 단체석 예약 가능 / 최대 4인 좌석", required: false },
      ],
    },
  ],

  restaurant: [
    {
      title: "메뉴 & 가격",
      icon: "🍽️",
      questions: [
        { id: "menu_main", category: "menu", question: "대표 메뉴와 가격을 알려주세요.", placeholder: "예) 된장찌개 세트 12,000원, 불고기 정식 15,000원, 갈비탕 13,000원", required: true },
        { id: "menu_lunch", category: "menu", question: "점심 특선 메뉴가 있나요?", placeholder: "예) 평일 점심 11:30~14:00 런치 특선 12,000원", required: false },
        { id: "menu_vegetarian", category: "faq", question: "채식 메뉴나 알레르기 대응 가능한가요?", placeholder: "예) 채식 메뉴 있음 / 별도 요청 시 조리 가능", required: false },
        { id: "menu_alcohol", category: "menu", question: "주류 판매하나요?", placeholder: "예) 소주, 맥주, 막걸리 판매 / 주류 없음", required: false },
      ],
    },
    {
      title: "좌석 & 단체",
      icon: "👥",
      questions: [
        { id: "capacity", category: "faq", question: "수용 인원이 어떻게 되나요?", placeholder: "예) 최대 50명, 단체 30명 이상은 사전 예약 필수", required: false },
        { id: "private_room", category: "faq", question: "개인실/룸이 있나요?", placeholder: "예) 8인 개인실 1개 운영, 예약 필수 / 홀 좌석만 운영", required: false },
        { id: "kids", category: "faq", question: "아이 동반 가능한가요?", placeholder: "예) 유아 의자 있음, 아이 동반 환영 / 조용한 분위기 매장으로 아이 자제 부탁", required: false },
      ],
    },
  ],

  fitness: [
    {
      title: "이용권 & 가격",
      icon: "💪",
      questions: [
        { id: "membership_price", category: "price", question: "월 이용권 가격이 어떻게 되나요?", placeholder: "예) 1개월 59,000원, 3개월 149,000원, 6개월 269,000원", required: true },
        { id: "day_pass", category: "price", question: "1일권/1회권 있나요?", placeholder: "예) 1일권 12,000원 / 없음", required: true },
        { id: "pt_price", category: "price", question: "PT(퍼스널 트레이닝) 가격은요?", placeholder: "예) 10회 450,000원, 20회 800,000원, 회당 50,000원", required: false },
        { id: "gx_class", category: "menu", question: "GX 수업(요가, 필라테스 등)이 있나요?", placeholder: "예) 요가, 스피닝, 줌바 등 운영. 스케줄은 앱 참고 / 없음", required: false },
      ],
    },
    {
      title: "시설 & 서비스",
      icon: "🏋️",
      questions: [
        { id: "locker", category: "faq", question: "락커 제공되나요?", placeholder: "예) 개인 락커 무료 / 일일 락커 유료(500원)", required: false },
        { id: "shower", category: "faq", question: "샤워실 이용 가능한가요?", placeholder: "예) 샴푸, 바디워시 구비 / 샤워실 없음", required: false },
        { id: "free_trial", category: "faq", question: "무료 체험 가능한가요?", placeholder: "예) 첫 방문 1회 무료 체험 / 3일 체험권 30,000원", required: false },
        { id: "pause", category: "policy", question: "회원권 정지/양도 가능한가요?", placeholder: "예) 월 1회 최대 1개월 정지 가능 / 양도 불가", required: false },
      ],
    },
  ],

  pilates: [
    {
      title: "수업 & 가격",
      icon: "🧘",
      questions: [
        { id: "class_type", category: "menu", question: "어떤 수업을 운영하나요?", placeholder: "예) 그룹 필라테스(4인), 1:1 개인 레슨, 기구/매트 선택 가능", required: true },
        { id: "group_price", category: "price", question: "그룹 수업 가격은요?", placeholder: "예) 월 10회 150,000원, 월 15회 200,000원", required: true },
        { id: "pt_price", category: "price", question: "1:1 개인 레슨 가격은요?", placeholder: "예) 회당 70,000원, 10회 패키지 600,000원", required: false },
        { id: "beginner", category: "faq", question: "처음이어도 괜찮은가요?", placeholder: "예) 초보자 전용 입문 과정 있음, 체형 분석 후 배치", required: true },
        { id: "trial", category: "faq", question: "체험 수업이 있나요?", placeholder: "예) 첫 방문 1회 체험(30,000원) / 무료 체험 가능", required: true },
      ],
    },
    {
      title: "수업 환경",
      icon: "✨",
      questions: [
        { id: "dress_code", category: "faq", question: "복장이나 준비물이 있나요?", placeholder: "예) 편한 운동복, 양말 필수 / 매트는 제공", required: false },
        { id: "cancel_class", category: "policy", question: "수업 취소/변경 정책은요?", placeholder: "예) 수업 3시간 전까지 취소 시 환불 / 당일 취소 차감", required: false },
        { id: "makeup", category: "faq", question: "화장하고 와도 되나요?", placeholder: "예) 가능하지만 수건 지참 권장 / 상관없음", required: false },
      ],
    },
  ],

  study_cafe: [
    {
      title: "이용권 & 가격",
      icon: "📚",
      questions: [
        { id: "price_hour", category: "price", question: "시간당 이용 요금은요?", placeholder: "예) 1시간 2,000원, 2시간 3,500원", required: true },
        { id: "price_day", category: "price", question: "종일권 가격은요?", placeholder: "예) 종일(09:00~익일05:00) 8,000원", required: true },
        { id: "price_month", category: "price", question: "월정액 상품이 있나요?", placeholder: "예) 30일권 80,000원, 6개월 400,000원", required: false },
        { id: "hours_24", category: "hours", question: "24시간 운영인가요?", placeholder: "예) 24시간 365일 운영 / 06:00~24:00 운영", required: true },
      ],
    },
    {
      title: "시설 & 규칙",
      icon: "🖥️",
      questions: [
        { id: "study_room", category: "menu", question: "스터디룸이 있나요? 가격은요?", placeholder: "예) 4인실 시간당 2,000원 추가, 8인실 4,000원 추가 / 없음", required: false },
        { id: "food_policy", category: "policy", question: "음식 반입이 가능한가요?", placeholder: "예) 음료만 허용, 식사는 별도 구역 / 취식 전면 금지", required: true },
        { id: "printer", category: "faq", question: "프린터/복합기 이용 가능한가요?", placeholder: "예) A4 흑백 50원, 컬러 200원 / 없음", required: false },
        { id: "locker_available", category: "faq", question: "개인 물품 보관 가능한가요?", placeholder: "예) 개인 사물함 월 10,000원 / 당일 무료 사물함", required: false },
      ],
    },
  ],

  beauty: [
    {
      title: "서비스 & 가격",
      icon: "✂️",
      questions: [
        { id: "cut_price", category: "price", question: "커트 가격이 어떻게 되나요?", placeholder: "예) 여성 커트 20,000~40,000원, 남성 커트 15,000~25,000원", required: true },
        { id: "color_price", category: "price", question: "염색 가격은요?", placeholder: "예) 전체 염색 60,000~120,000원, 탈색 추가 50,000원~", required: true },
        { id: "perm_price", category: "price", question: "파마 가격은요?", placeholder: "예) 일반 파마 80,000원~, 매직스트레이트 100,000원~", required: false },
        { id: "treatment", category: "price", question: "트리트먼트/케어 메뉴가 있나요?", placeholder: "예) 두피 케어 40,000원, 모발 트리트먼트 30,000원~", required: false },
      ],
    },
    {
      title: "예약 & 서비스",
      icon: "💇",
      questions: [
        { id: "designer", category: "faq", question: "디자이너 지명이 가능한가요?", placeholder: "예) 가능, 나우링크 예약 시 선택 / 선착순 배정", required: false },
        { id: "time_required", category: "faq", question: "서비스별 소요 시간은요?", placeholder: "예) 커트 30분, 염색 2시간, 파마 2~3시간", required: false },
        { id: "kids_ok", category: "faq", question: "아이 커트도 가능한가요?", placeholder: "예) 가능, 어린이 커트 15,000원 / 성인만 가능", required: false },
      ],
    },
  ],

  nail: [
    {
      title: "서비스 & 가격",
      icon: "💅",
      questions: [
        { id: "gel_price", category: "price", question: "젤네일 가격이 어떻게 되나요?", placeholder: "예) 단색 젤 35,000원, 투톤 45,000원, 그라데이션 55,000원", required: true },
        { id: "art_price", category: "price", question: "네일아트 가격은요?", placeholder: "예) 기본 아트 +5,000원, 풀아트 +15,000원~", required: false },
        { id: "foot_price", category: "price", question: "발 케어/페디큐어도 하나요?", placeholder: "예) 발 젤 45,000원, 기본 케어 25,000원 / 손만 가능", required: false },
        { id: "remove_price", category: "price", question: "제거 비용은요?", placeholder: "예) 본인 매장 제거 무료, 타샵 제거 15,000원", required: false },
        { id: "extension", category: "faq", question: "손톱 연장도 되나요?", placeholder: "예) 가능, 상담 후 진행 / 불가", required: false },
      ],
    },
    {
      title: "예약 & 소요시간",
      icon: "⏱️",
      questions: [
        { id: "time_gel", category: "faq", question: "젤네일 소요시간은요?", placeholder: "예) 단색 60분, 아트 90~120분", required: true },
        { id: "booking_required", category: "faq", question: "예약이 꼭 필요한가요?", placeholder: "예) 예약 권장, 워크인 가능(대기 발생) / 예약 필수", required: true },
        { id: "instagram", category: "faq", question: "디자인 포트폴리오 어디서 볼 수 있나요?", placeholder: "예) 인스타그램 @nail_shop / 방문 시 앨범 확인", required: false },
      ],
    },
  ],

  academy: [
    {
      title: "수업 & 커리큘럼",
      icon: "📖",
      questions: [
        { id: "subjects", category: "menu", question: "어떤 과목/분야를 가르치나요?", placeholder: "예) 초중고 수학, 영어, 과학 / 성인 영어회화, 토익", required: true },
        { id: "class_size", category: "menu", question: "수업 방식이 어떻게 되나요?", placeholder: "예) 소그룹 4인 이하 / 1:1 개인 과외 / 강의식", required: true },
        { id: "level_test", category: "faq", question: "레벨 테스트가 있나요?", placeholder: "예) 무료 레벨 테스트 후 적정 반 배치 / 상담 후 결정", required: true },
        { id: "schedule", category: "hours", question: "수업 시간표가 어떻게 되나요?", placeholder: "예) 주 2회 (화목 or 월수금), 오후 2시~밤 10시 중 선택", required: true },
      ],
    },
    {
      title: "수업료 & 혜택",
      icon: "💰",
      questions: [
        { id: "tuition", category: "price", question: "월 수업료가 어떻게 되나요?", placeholder: "예) 주 2회 250,000원, 주 3회 350,000원 (교재비 별도)", required: true },
        { id: "discount", category: "policy", question: "할인 혜택이 있나요?", placeholder: "예) 형제 할인 10%, 첫 달 20% 할인, 나우링크 예약 시 할인", required: false },
        { id: "makeup_class", category: "policy", question: "결석 시 보강이 되나요?", placeholder: "예) 월 2회까지 보강 제공 / 결석 시 영상 강의로 대체", required: false },
        { id: "trial_class", category: "faq", question: "체험 수업이 있나요?", placeholder: "예) 1회 무료 체험 수업 가능 / 첫 달 할인으로 대체", required: false },
      ],
    },
  ],
};

export function getQuestionsForCategory(category: string): QuestionSection[] {
  const specific = CATEGORY_SECTIONS[category] ?? CATEGORY_SECTIONS["cafe"];
  return [...COMMON_SECTIONS, ...specific];
}

export function getAllQuestions(category: string): Question[] {
  return getQuestionsForCategory(category).flatMap((s) => s.questions);
}

export function buildKnowledgeChunks(
  answers: Record<string, string>,
  category: string,
  businessName: string
): Array<{ content: string; category: string; source: string }> {
  const questions = getAllQuestions(category);
  const chunks: Array<{ content: string; category: string; source: string }> = [];

  // 카테고리별로 묶어서 하나의 청크로
  const byCategory: Record<string, Array<{ q: string; a: string }>> = {};

  for (const q of questions) {
    const answer = answers[q.id]?.trim();
    if (!answer) continue;

    if (!byCategory[q.category]) byCategory[q.category] = [];
    byCategory[q.category].push({ q: q.question, a: answer });
  }

  for (const [cat, qas] of Object.entries(byCategory)) {
    if (qas.length === 0) continue;

    const label: Record<string, string> = {
      hours: "영업시간 정보",
      menu: "메뉴/서비스 안내",
      price: "가격 안내",
      reservation: "예약 안내",
      policy: "정책 안내",
      faq: "자주 묻는 질문",
    };

    const content = `[${label[cat] ?? cat} - ${businessName}]\n\n` +
      qas.map((qa) => `Q: ${qa.q}\nA: ${qa.a}`).join("\n\n");

    chunks.push({ content, category: cat, source: "owner_onboarding" });
  }

  return chunks;
}
