/**
 * 업종별 고객 질문 뱅크 — 글로벌 기업 표준 적용
 *
 * 참고: Intercom, Zendesk, Tidio, ManyChat, Naver Smart Place FAQ 기준
 * 한국 특화: 배달앱(배민/쿠팡이츠/요기요), 예약금/노쇼 정책, 카카오페이,
 *            네이버 예약, 위생 기준, 장애인 편의시설, 외국어 서비스
 *
 * 업종 목록 (13개):
 *   cafe, restaurant, fitness, pilates, study_cafe,
 *   beauty, nail, academy, medical, pet, realestate, shopping, car_repair
 */

export interface Question {
  id: string;
  category: string; // faq | hours | menu | price | policy | reservation | hygiene | delivery
  question: string;
  placeholder: string;
  required: boolean;
}

export interface QuestionSection {
  title: string;
  icon: string;
  questions: Question[];
}

// ── 공통 질문 (모든 업종) ────────────────────────────────────────────────────

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
        question: "정기 휴무일이 있나요? 명절(설/추석) 운영 여부도 알려주세요.",
        placeholder: "예) 매주 월요일 휴무. 설날·추석 당일 휴무, 전후일 정상 운영",
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
        placeholder: "예) 카드, 현금, 카카오페이, 네이버페이, 삼성페이 모두 가능",
        required: false,
      },
      {
        id: "location_tip",
        category: "faq",
        question: "찾아오시는 길 / 주변 랜드마크가 있나요?",
        placeholder: "예) 2호선 홍대입구역 3번 출구 도보 5분, 파리바게뜨 옆 건물 2층",
        required: false,
      },
      {
        id: "sns_link",
        category: "faq",
        question: "인스타그램이나 네이버 블로그 등 SNS 채널이 있나요?",
        placeholder: "예) 인스타그램 @my_store / 네이버 블로그 '홍대 맛집 찾기'",
        required: false,
      },
      {
        id: "foreign_language",
        category: "faq",
        question: "영어/중국어 등 외국어 응대가 가능한가요?",
        placeholder: "예) 영어 응대 가능 / 한국어만 가능 / 구글 번역기 활용",
        required: false,
      },
      {
        id: "accessibility",
        category: "faq",
        question: "장애인 편의시설(엘리베이터, 휠체어 경사로, 장애인 화장실)이 있나요?",
        placeholder: "예) 1층 매장, 휠체어 진입 가능, 장애인 화장실 있음 / 2층이라 엘리베이터 없음",
        required: false,
      },
    ],
  },
  {
    title: "예약 & 노쇼 정책",
    icon: "📅",
    questions: [
      {
        id: "reservation_method",
        category: "reservation",
        question: "예약은 어떻게 하나요?",
        placeholder: "예) 나우링크 앱 온라인 예약 / 전화 예약 / 카카오 채널로 예약",
        required: true,
      },
      {
        id: "reservation_walkin",
        category: "reservation",
        question: "예약 없이 방문해도 되나요?",
        placeholder: "예) 가능하지만 대기 발생 / 예약 필수",
        required: false,
      },
      {
        id: "deposit_policy",
        category: "policy",
        question: "예약 시 예약금(계약금)이 있나요?",
        placeholder: "예) 서비스 금액의 50% 예약금 필요 / 예약금 없음",
        required: false,
      },
      {
        id: "cancel_policy",
        category: "policy",
        question: "예약 취소/변경은 언제까지 가능한가요?",
        placeholder: "예) 하루 전까지 무료 취소, 당일 취소 시 예약금 환불 불가",
        required: false,
      },
      {
        id: "noshow_policy",
        category: "policy",
        question: "노쇼(무단 불참) 시 어떻게 처리되나요?",
        placeholder: "예) 노쇼 시 예약금 환불 불가, 2회 노쇼 시 예약 제한 / 노쇼 페널티 없음",
        required: false,
      },
    ],
  },
];

// ── 업종별 특화 질문 ─────────────────────────────────────────────────────────

const CATEGORY_SECTIONS: Record<string, QuestionSection[]> = {
  // ────── 카페 ──────────────────────────────────────────────────────────────
  cafe: [
    {
      title: "메뉴 & 음료",
      icon: "☕",
      questions: [
        { id: "menu_signature", category: "menu", question: "대표 메뉴나 시그니처 음료가 있나요?", placeholder: "예) 직접 로스팅한 아메리카노(5,000원), 딸기라떼(7,000원)가 인기", required: true },
        { id: "menu_price_range", category: "price", question: "메뉴 가격대가 어떻게 되나요?", placeholder: "예) 음료 4,500원~8,500원, 디저트 3,000원~8,000원", required: true },
        { id: "menu_food", category: "menu", question: "음식(베이커리/케이크 등)도 판매하나요?", placeholder: "예) 크루아상, 스콘 등 직접 구운 베이커리 운영 / 음료만 판매", required: false },
        { id: "menu_seasonal", category: "menu", question: "시즌 한정 메뉴가 있나요?", placeholder: "예) 여름: 복숭아라떼, 겨울: 뱅쇼 운영", required: false },
        { id: "menu_takeout", category: "faq", question: "포장(테이크아웃) 되나요?", placeholder: "예) 가능합니다 / 일부 메뉴만 가능", required: false },
        { id: "menu_allergy", category: "menu", question: "알레르기 정보 안내나 비건/채식 메뉴가 있나요?", placeholder: "예) 비건 메뉴 2종 운영, 알레르기 성분은 메뉴판에 표시 / 별도 안내 없음", required: false },
        { id: "menu_custom", category: "menu", question: "음료 커스터마이징(시럽 조절, 우유 변경 등)이 가능한가요?", placeholder: "예) 당도 조절, 오트밀크/두유 변경 가능(+500원) / 기본 레시피만 제공", required: false },
      ],
    },
    {
      title: "공간 & 편의시설",
      icon: "🛋️",
      questions: [
        { id: "wifi", category: "faq", question: "와이파이가 있나요? 비밀번호는요?", placeholder: "예) 무료 와이파이, 비밀번호 방문 시 안내 / 없음", required: false },
        { id: "outlet", category: "faq", question: "콘센트 사용 가능한가요?", placeholder: "예) 전 좌석 콘센트 있음 / 일부 좌석만 가능", required: false },
        { id: "pet", category: "faq", question: "반려동물 동반 가능한가요?", placeholder: "예) 테라스 좌석 가능 / 실내 불가", required: false },
        { id: "study", category: "faq", question: "공부/작업하기 좋은 환경인가요?", placeholder: "예) 노트북 작업 환경 좋음, 주말 혼잡 / 일반 카페", required: false },
        { id: "group_seat", category: "faq", question: "단체석이나 프라이빗룸 있나요?", placeholder: "예) 8인 이상 단체석 예약 가능 / 최대 4인 좌석", required: false },
        { id: "min_stay", category: "policy", question: "최소 체류시간이나 '1인 1음료' 규정이 있나요?", placeholder: "예) 최소 체류시간 없음, 1인 1음료 부탁 / 2시간 이용 후 추가 주문 요청", required: false },
      ],
    },
    {
      title: "배달 & 멤버십",
      icon: "🛵",
      questions: [
        { id: "delivery_app", category: "delivery", question: "배달 서비스(배민, 쿠팡이츠, 요기요)를 이용할 수 있나요?", placeholder: "예) 배달의민족, 쿠팡이츠 입점, 최소 주문금액 15,000원 / 배달 없음", required: false },
        { id: "membership", category: "policy", question: "멤버십이나 스탬프 카드 혜택이 있나요?", placeholder: "예) 10잔 적립 시 무료 음료 1잔 / 없음", required: false },
      ],
    },
  ],

  // ────── 음식점 ────────────────────────────────────────────────────────────
  restaurant: [
    {
      title: "메뉴 & 가격",
      icon: "🍽️",
      questions: [
        { id: "menu_main", category: "menu", question: "대표 메뉴와 가격을 알려주세요.", placeholder: "예) 된장찌개 세트 12,000원, 불고기 정식 15,000원, 갈비탕 13,000원", required: true },
        { id: "menu_lunch", category: "menu", question: "점심 특선 메뉴가 있나요?", placeholder: "예) 평일 점심 11:30~14:00 런치 특선 12,000원", required: false },
        { id: "menu_vegetarian", category: "faq", question: "채식/비건 메뉴나 알레르기 대응이 가능한가요?", placeholder: "예) 채식 메뉴 3종, 알레르기 재료 요청 시 제거 가능 / 별도 대응 어려움", required: false },
        { id: "menu_alcohol", category: "menu", question: "주류 판매하나요? 코르키지(반입 주류) 가능한가요?", placeholder: "예) 소주·맥주 판매, 와인 반입 코르키지 10,000원 / 주류 없음", required: false },
      ],
    },
    {
      title: "배달 & 포장",
      icon: "🛵",
      questions: [
        { id: "delivery_app", category: "delivery", question: "배달 서비스(배민, 쿠팡이츠, 요기요)가 가능한가요?", placeholder: "예) 배달의민족·요기요 입점, 최소 주문 20,000원, 배달비 3,000원 / 배달 없음", required: false },
        { id: "takeout_restaurant", category: "faq", question: "포장 주문이 가능한가요?", placeholder: "예) 가능, 포장 시 10% 할인 / 일부 메뉴만 포장 가능", required: false },
      ],
    },
    {
      title: "좌석 & 단체",
      icon: "👥",
      questions: [
        { id: "capacity", category: "faq", question: "수용 인원이 어떻게 되나요?", placeholder: "예) 최대 50명, 30명 이상 단체는 사전 예약 필수", required: false },
        { id: "private_room", category: "faq", question: "개인실/룸이 있나요?", placeholder: "예) 8인 개인실 1개, 예약 필수 / 홀 좌석만 운영", required: false },
        { id: "kids", category: "faq", question: "아이 동반 가능한가요? 유아 의자가 있나요?", placeholder: "예) 유아 의자·아이 메뉴 있음 / 조용한 매장으로 영아 자제 부탁", required: false },
        { id: "dress_code", category: "policy", question: "드레스코드나 입장 제한 사항이 있나요?", placeholder: "예) 없음 / 정장 권장 / 슬리퍼 입장 불가", required: false },
        { id: "waiting", category: "faq", question: "웨이팅(대기)이 있나요? 웨이팅 방법은요?", placeholder: "예) 주말 런치 30분~1시간 대기, 나우링크 원격 웨이팅 가능 / 대기 없음", required: false },
      ],
    },
  ],

  // ────── 피트니스/헬스장 ──────────────────────────────────────────────────
  fitness: [
    {
      title: "이용권 & 가격",
      icon: "💪",
      questions: [
        { id: "membership_price", category: "price", question: "월 이용권 가격이 어떻게 되나요?", placeholder: "예) 1개월 59,000원, 3개월 149,000원, 6개월 269,000원", required: true },
        { id: "day_pass", category: "price", question: "1일권/1회권 있나요?", placeholder: "예) 1일권 12,000원 / 없음", required: true },
        { id: "pt_price", category: "price", question: "PT(퍼스널 트레이닝) 가격은요?", placeholder: "예) 10회 450,000원, 20회 800,000원, 회당 50,000원", required: false },
        { id: "gx_class", category: "menu", question: "GX 수업(요가, 스피닝, 줌바 등)이 있나요?", placeholder: "예) 요가·스피닝·줌바 운영, 스케줄은 앱 참고 / 없음", required: false },
      ],
    },
    {
      title: "시설 & 서비스",
      icon: "🏋️",
      questions: [
        { id: "locker", category: "faq", question: "락커 제공되나요?", placeholder: "예) 개인 락커 무료 / 1일 락커 500원", required: false },
        { id: "shower", category: "faq", question: "샤워실 이용 가능한가요? 수건 제공되나요?", placeholder: "예) 샤워실 있음, 샴푸·바디워시 구비, 수건 무료 대여 / 샤워실 없음", required: false },
        { id: "free_trial", category: "faq", question: "무료 체험이 가능한가요?", placeholder: "예) 첫 방문 1회 무료 체험 / 3일 체험권 30,000원", required: false },
        { id: "pause", category: "policy", question: "회원권 정지/양도가 가능한가요? 해지 환불 정책은요?", placeholder: "예) 월 1회 최대 1개월 정지 가능, 중도 해지 시 사용일 차감 후 환불 / 양도 불가", required: false },
        { id: "age_limit", category: "policy", question: "이용 가능한 나이 제한이 있나요?", placeholder: "예) 만 14세 이상 / 만 18세 미만 보호자 동의 필요 / 나이 제한 없음", required: false },
        { id: "guest_pass", category: "policy", question: "회원이 아닌 지인을 동반할 수 있나요?", placeholder: "예) 월 2회 게스트 입장 가능(1일권 금액 적용) / 불가", required: false },
        { id: "peak_hours", category: "faq", question: "혼잡한 시간대가 언제인가요? 한산한 시간은요?", placeholder: "예) 저녁 6~9시 혼잡, 오전 10~12시·평일 낮이 한산", required: false },
      ],
    },
  ],

  // ────── 필라테스 ──────────────────────────────────────────────────────────
  pilates: [
    {
      title: "수업 & 가격",
      icon: "🧘",
      questions: [
        { id: "class_type", category: "menu", question: "어떤 수업을 운영하나요?", placeholder: "예) 그룹 필라테스(4인), 1:1 개인 레슨, 기구/매트 선택 가능", required: true },
        { id: "group_price", category: "price", question: "그룹 수업 가격은요?", placeholder: "예) 월 10회 150,000원, 월 15회 200,000원", required: true },
        { id: "pt_price", category: "price", question: "1:1 개인 레슨 가격은요?", placeholder: "예) 회당 70,000원, 10회 패키지 600,000원", required: false },
        { id: "beginner", category: "faq", question: "처음이어도 괜찮은가요? 입문 과정이 있나요?", placeholder: "예) 초보자 전용 입문 과정 있음, 체형 분석 후 배치", required: true },
        { id: "trial", category: "faq", question: "체험 수업이 있나요?", placeholder: "예) 첫 방문 1회 체험(30,000원) / 무료 체험 가능", required: true },
      ],
    },
    {
      title: "수업 환경 & 정책",
      icon: "✨",
      questions: [
        { id: "dress_code_pilates", category: "faq", question: "복장이나 준비물이 있나요?", placeholder: "예) 편한 운동복, 양말 필수, 매트는 제공 / 개인 매트 지참 권장", required: false },
        { id: "cancel_class", category: "policy", question: "수업 취소/변경은 언제까지 가능한가요?", placeholder: "예) 수업 3시간 전까지 취소 시 환불 / 당일 취소 차감", required: false },
        { id: "late_arrival", category: "policy", question: "늦게 도착해도 수업 참여가 가능한가요?", placeholder: "예) 5분 이내 지각은 참여 가능, 이후 결석 처리 / 정시 시작", required: false },
        { id: "injury_accommodation", category: "faq", question: "부상이나 임산부 수업이 가능한가요?", placeholder: "예) 강도 조절 개별 지도 가능, 임산부 전용 과정 있음 / 의사 확인 후 참여 가능", required: false },
        { id: "pause_pilates", category: "policy", question: "수강권 정지가 가능한가요?", placeholder: "예) 부상·출장 시 최대 1개월 정지 가능 / 정지 불가", required: false },
      ],
    },
  ],

  // ────── 스터디카페 ────────────────────────────────────────────────────────
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
        { id: "noise_policy", category: "policy", question: "소음 규정이 있나요? 전화 통화는요?", placeholder: "예) 조용한 환경 유지, 통화는 야외 또는 통화 부스 이용 / 자유롭게 이용 가능", required: false },
        { id: "companion_ok", category: "faq", question: "동행인과 함께 방문해서 같은 자리에 앉을 수 있나요?", placeholder: "예) 개인 자리 배정으로 동행인은 별도 이용 / 2인 자리 선택 가능", required: false },
      ],
    },
  ],

  // ────── 미용/헤어살롱 ────────────────────────────────────────────────────
  beauty: [
    {
      title: "서비스 & 가격",
      icon: "✂️",
      questions: [
        { id: "cut_price", category: "price", question: "커트 가격이 어떻게 되나요?", placeholder: "예) 여성 커트 20,000~40,000원, 남성 커트 15,000~25,000원", required: true },
        { id: "color_price", category: "price", question: "염색 가격은요? 기장별로 다른가요?", placeholder: "예) 전체 염색 60,000원~(기장·모발 상태에 따라 다름), 탈색 추가 50,000원~", required: true },
        { id: "perm_price", category: "price", question: "파마 가격은요?", placeholder: "예) 일반 파마 80,000원~, 매직스트레이트 100,000원~", required: false },
        { id: "treatment", category: "price", question: "트리트먼트/두피 케어 메뉴가 있나요?", placeholder: "예) 두피 케어 40,000원, 모발 트리트먼트 30,000원~", required: false },
      ],
    },
    {
      title: "예약 & 서비스 정책",
      icon: "💇",
      questions: [
        { id: "designer", category: "faq", question: "디자이너 지명이 가능한가요?", placeholder: "예) 가능, 나우링크 예약 시 선택 / 선착순 배정", required: false },
        { id: "time_required", category: "faq", question: "서비스별 소요 시간은요?", placeholder: "예) 커트 30분, 염색 2시간, 파마 2~3시간", required: false },
        { id: "patch_test", category: "policy", question: "첫 염색 고객에게 패치 테스트를 진행하나요?", placeholder: "예) 첫 방문 시 48시간 전 패치 테스트 권장 / 테스트 없이 진행, 알레르기 반응 시 즉시 중단", required: false },
        { id: "first_visit", category: "faq", question: "첫 방문 시 상담 과정은 어떻게 되나요?", placeholder: "예) 방문 후 모발 진단 10분 상담 후 시술 진행 / 바로 시술 시작", required: false },
        { id: "kids_ok", category: "faq", question: "아이 커트도 가능한가요?", placeholder: "예) 가능, 어린이 커트 15,000원 / 성인만 가능", required: false },
        { id: "color_correction", category: "faq", question: "타 샵 시술 후 컬러 교정도 가능한가요?", placeholder: "예) 가능, 상태 확인 후 견적 안내 / 자체 시술 고객만 교정 가능", required: false },
      ],
    },
  ],

  // ────── 네일샵 ───────────────────────────────────────────────────────────
  nail: [
    {
      title: "서비스 & 가격",
      icon: "💅",
      questions: [
        { id: "gel_price", category: "price", question: "젤네일 가격이 어떻게 되나요?", placeholder: "예) 단색 젤 35,000원, 투톤 45,000원, 그라데이션 55,000원", required: true },
        { id: "art_price", category: "price", question: "네일아트 가격은요?", placeholder: "예) 기본 아트 +5,000원, 풀아트 +15,000원~", required: false },
        { id: "foot_price", category: "price", question: "발 케어/페디큐어도 하나요?", placeholder: "예) 발 젤 45,000원, 기본 케어 25,000원 / 손만 가능", required: false },
        { id: "remove_price", category: "price", question: "제거(오프) 비용은요?", placeholder: "예) 본인 매장 오프 무료, 타샵 제거 15,000원", required: false },
        { id: "extension", category: "faq", question: "손톱 연장(아크릴/젤 연장)도 되나요?", placeholder: "예) 가능, 상담 후 진행 / 불가", required: false },
      ],
    },
    {
      title: "위생 & 예약 정책",
      icon: "⏱️",
      questions: [
        { id: "time_gel", category: "faq", question: "젤네일 소요시간은요?", placeholder: "예) 단색 60분, 아트 90~120분", required: true },
        { id: "booking_required", category: "faq", question: "예약이 꼭 필요한가요?", placeholder: "예) 예약 권장, 워크인 가능(대기 발생) / 예약 필수", required: true },
        { id: "deposit_nail", category: "policy", question: "예약금이 필요한가요?", placeholder: "예) 시술비 50% 예약금 필요 / 예약금 없음", required: false },
        { id: "hygiene", category: "hygiene", question: "도구 위생/소독은 어떻게 관리하나요?", placeholder: "예) 고압증기 멸균기(오토클레이브) 사용, 1회용 파일 사용 / 자외선 소독기 사용", required: false },
        { id: "pregnant_ok", category: "faq", question: "임산부도 시술이 가능한가요?", placeholder: "예) 임산부 가능(단, 아세톤 사용 최소화 권장) / 임산부 시술 자제", required: false },
        { id: "instagram", category: "faq", question: "디자인 포트폴리오 어디서 볼 수 있나요?", placeholder: "예) 인스타그램 @nail_shop / 방문 시 앨범 확인", required: false },
      ],
    },
  ],

  // ────── 학원 / 교육 ──────────────────────────────────────────────────────
  academy: [
    {
      title: "수업 & 커리큘럼",
      icon: "📖",
      questions: [
        { id: "subjects", category: "menu", question: "어떤 과목/분야를 가르치나요?", placeholder: "예) 초중고 수학, 영어, 과학 / 성인 영어회화, 토익", required: true },
        { id: "class_size", category: "menu", question: "수업 방식이 어떻게 되나요? (소그룹/1:1/강의식)", placeholder: "예) 소그룹 4인 이하 / 1:1 개인 과외 / 강의식 10인 이하", required: true },
        { id: "level_test", category: "faq", question: "레벨 테스트가 있나요? 결과는 어떻게 안내해 드리나요?", placeholder: "예) 무료 레벨 테스트 후 적정 반 배치, 결과 당일 학부모 안내", required: true },
        { id: "schedule", category: "hours", question: "수업 시간표가 어떻게 되나요?", placeholder: "예) 주 2회 (화목 or 월수금), 오후 2시~밤 10시 중 선택", required: true },
        { id: "online_class", category: "faq", question: "온라인/비대면 수업도 가능한가요?", placeholder: "예) 대면 + 온라인 병행 가능 / 대면 수업만 운영", required: false },
      ],
    },
    {
      title: "수업료 & 혜택",
      icon: "💰",
      questions: [
        { id: "tuition", category: "price", question: "월 수업료가 어떻게 되나요?", placeholder: "예) 주 2회 250,000원, 주 3회 350,000원", required: true },
        { id: "textbook_fee", category: "price", question: "교재비가 별도인가요?", placeholder: "예) 교재비 별도(월 20,000원~) / 수업료에 포함", required: true },
        { id: "discount", category: "policy", question: "할인 혜택이 있나요?", placeholder: "예) 형제 할인 10%, 첫 달 20% 할인, 나우링크 예약 시 할인", required: false },
        { id: "makeup_class", category: "policy", question: "결석 시 보강이 되나요?", placeholder: "예) 월 2회까지 보강 제공 / 결석 시 영상 강의로 대체", required: false },
        { id: "trial_class", category: "faq", question: "체험 수업이 있나요?", placeholder: "예) 1회 무료 체험 수업 가능 / 첫 달 할인으로 대체", required: false },
        { id: "parent_report", category: "policy", question: "학부모에게 학습 현황 리포트를 제공하나요?", placeholder: "예) 월 1회 카카오톡으로 성취도 리포트 발송 / 분기별 상담 운영", required: false },
      ],
    },
  ],

  // ────── 병원/의원 (NEW) ───────────────────────────────────────────────────
  medical: [
    {
      title: "진료 & 예약",
      icon: "🏥",
      questions: [
        { id: "departments", category: "menu", question: "어떤 진료과/전문 분야가 있나요?", placeholder: "예) 내과, 피부과, 가정의학과 / 산부인과 전문", required: true },
        { id: "reservation_medical", category: "reservation", question: "예약은 어떻게 하나요? 당일 접수도 가능한가요?", placeholder: "예) 전화 예약, 나우링크 앱 예약 가능, 당일 접수도 가능 / 예약제 운영", required: true },
        { id: "waiting_time", category: "faq", question: "평균 대기 시간이 어느 정도인가요?", placeholder: "예) 예약 시 30분 이내, 당일 접수 1~2시간 / 예약제로 대기 없음", required: false },
        { id: "telemedicine", category: "faq", question: "비대면(전화/영상) 진료가 가능한가요?", placeholder: "예) 재진 환자 대상 전화 진료 가능 / 대면 진료만 운영", required: false },
      ],
    },
    {
      title: "보험 & 비용",
      icon: "💊",
      questions: [
        { id: "insurance", category: "policy", question: "건강보험 적용이 되나요? 비급여 항목은요?", placeholder: "예) 일반 진료 건강보험 적용, 미용 시술·도수치료 등 비급여 별도", required: true },
        { id: "prescription", category: "faq", question: "처방전 발급 후 어디서 약을 받나요?", placeholder: "예) 인근 약국에서 처방전 제출 후 조제 / 원내 약국 운영", required: false },
        { id: "health_checkup", category: "menu", question: "건강검진(일반/종합) 프로그램이 있나요?", placeholder: "예) 일반 건강검진, 직장인 검진 패키지(150,000원~) 운영 / 진료만 가능", required: false },
        { id: "medical_cert", category: "faq", question: "진단서/소견서 발급이 가능한가요?", placeholder: "예) 가능, 진단서 20,000원 / 당일 발급 가능", required: false },
      ],
    },
    {
      title: "시설 & 안내",
      icon: "🩺",
      questions: [
        { id: "parking_medical", category: "faq", question: "주차가 가능한가요?", placeholder: "예) 건물 주차장 2시간 무료(주차 도장 필수) / 근처 공영주차장 이용", required: false },
        { id: "specialist", category: "faq", question: "전문의가 상주하나요? 의사 선생님을 지정할 수 있나요?", placeholder: "예) 전문의 2인 상주, 예약 시 원하는 의사 지정 가능 / 당일 배정", required: false },
        { id: "emergency", category: "faq", question: "응급 상황 발생 시 어떻게 해야 하나요?", placeholder: "예) 119 신고 후 원 방문 / 응급 처치 가능, 중증은 대형 병원 이송", required: false },
      ],
    },
  ],

  // ────── 반려동물 미용/병원 (NEW) ──────────────────────────────────────────
  pet: [
    {
      title: "서비스 & 가격",
      icon: "🐾",
      questions: [
        { id: "grooming_service", category: "menu", question: "반려동물 미용 서비스가 어떻게 되나요?", placeholder: "예) 목욕+드라이 / 전체 미용(컷+목욕) / 부분 미용(발바닥, 귀 청소)", required: true },
        { id: "grooming_price", category: "price", question: "미용 가격이 어떻게 되나요? (견종/체중별)", placeholder: "예) 소형견(~5kg) 40,000원, 중형견(5~10kg) 60,000원, 대형견 80,000원~", required: true },
        { id: "vet_service", category: "menu", question: "동물병원 진료도 가능한가요? 수의사가 상주하나요?", placeholder: "예) 수의사 상주, 예방접종·건강검진·수술 가능 / 미용 전문, 진료 불가", required: false },
        { id: "hotel_service", category: "menu", question: "펫호텔(위탁) 서비스가 있나요?", placeholder: "예) 당일~장기 위탁 가능, 1박 40,000원~ / 없음", required: false },
      ],
    },
    {
      title: "예약 & 주의사항",
      icon: "🐶",
      questions: [
        { id: "vaccination_required", category: "policy", question: "예방접종 확인이 필요한가요?", placeholder: "예) 광견병·종합백신 접종 확인 필수(접종증명서 지참) / 확인 없이 이용 가능", required: true },
        { id: "aggressive_pet", category: "policy", question: "예민하거나 공격적인 반려동물도 가능한가요?", placeholder: "예) 사전 상담 후 1:1 케어 진행 / 안전 이유로 서비스 불가", required: false },
        { id: "senior_pet", category: "faq", question: "노령 동물이나 기저질환이 있는 동물도 미용 가능한가요?", placeholder: "예) 수의사 상담 후 가능 여부 판단 / 건강한 동물만 가능", required: false },
        { id: "pet_registration", category: "faq", question: "동물 등록(마이크로칩) 관련 안내가 가능한가요?", placeholder: "예) 동물 등록 대행 가능(수수료 별도) / 등록 안내만 제공", required: false },
        { id: "emergency_pet", category: "faq", question: "미용/위탁 중 응급 상황 시 어떻게 대처하나요?", placeholder: "예) 즉시 보호자 연락 후 인근 동물병원 이송 / 원내 수의사 1차 처치", required: false },
      ],
    },
  ],

  // ────── 부동산 (NEW) ──────────────────────────────────────────────────────
  realestate: [
    {
      title: "매물 & 거래",
      icon: "🏠",
      questions: [
        { id: "property_types", category: "menu", question: "주로 어떤 유형의 매물을 취급하나요?", placeholder: "예) 아파트·오피스텔 매매/전세/월세, 상가 임대", required: true },
        { id: "area_coverage", category: "faq", question: "담당 지역(동네)이 어디인가요?", placeholder: "예) 마포구 전역, 은평구 일부 / 서울 전 지역", required: true },
        { id: "jeonse_guide", category: "faq", question: "전세/월세 계약 시 주의사항을 알려주실 수 있나요?", placeholder: "예) 전세사기 예방 체크리스트, 계약 전 등기부등본 확인 방법 안내 가능", required: false },
        { id: "viewing_booking", category: "reservation", question: "매물 방문(임장) 예약은 어떻게 하나요?", placeholder: "예) 나우링크 앱 또는 전화로 원하는 날짜 예약 / 카카오 채널 문의", required: true },
      ],
    },
    {
      title: "계약 & 수수료",
      icon: "📋",
      questions: [
        { id: "agent_fee", category: "price", question: "중개 수수료(복비)가 어떻게 되나요?", placeholder: "예) 법정 중개보수율 적용, 매매 0.4~0.9% / 임대 0.3~0.8% (거래 금액에 따라 상이)", required: true },
        { id: "contract_process", category: "faq", question: "계약 진행 절차가 어떻게 되나요?", placeholder: "예) 매물 확인 → 계약서 작성 → 계약금 입금 → 잔금 → 등기 이전 순서로 진행", required: false },
        { id: "management_fee", category: "price", question: "관리비는 얼마나 되나요?", placeholder: "예) 매물마다 다름, 평균 10~20만원 / 관리비 포함 월세 형태", required: false },
        { id: "move_in_date", category: "faq", question: "입주 가능 날짜를 확인할 수 있나요?", placeholder: "예) 매물별로 상이, 방문 상담 시 확인 가능", required: false },
      ],
    },
  ],

  // ────── 쇼핑몰/이커머스 (NEW) ──────────────────────────────────────────
  shopping: [
    {
      title: "주문 & 배송",
      icon: "📦",
      questions: [
        { id: "shipping_info", category: "delivery", question: "배송 방법과 소요 기간은 어떻게 되나요?", placeholder: "예) 기본 배송 2~3일, 새벽배송/당일배송 서울 일부 지역 가능", required: true },
        { id: "shipping_fee", category: "price", question: "배송비는 얼마인가요? 무료 배송 기준은요?", placeholder: "예) 3,000원, 30,000원 이상 구매 시 무료 배송", required: true },
        { id: "overseas_shipping", category: "delivery", question: "해외 배송이 가능한가요?", placeholder: "예) 불가 / 일부 국가 가능, 배송비 별도 안내", required: false },
        { id: "order_tracking", category: "faq", question: "주문 배송 현황은 어디서 확인할 수 있나요?", placeholder: "예) 주문 완료 문자의 링크 또는 마이페이지에서 확인 가능", required: false },
      ],
    },
    {
      title: "교환 & 환불",
      icon: "🔄",
      questions: [
        { id: "return_policy", category: "policy", question: "교환/반품이 가능한가요? 기한은요?", placeholder: "예) 수령일로부터 7일 이내, 고객 변심 시 왕복 배송비 부담 / 불량품은 무료 교환", required: true },
        { id: "return_exception", category: "policy", question: "교환/환불이 불가능한 경우가 있나요?", placeholder: "예) 착용 흔적·세탁 후·태그 제거 시 교환 불가", required: false },
        { id: "refund_period", category: "policy", question: "환불 처리는 얼마나 걸리나요?", placeholder: "예) 반품 확인 후 3~5 영업일 내 환불 / 카드 취소는 카드사 정책에 따라 상이", required: false },
        { id: "size_guide", category: "faq", question: "사이즈 선택에 어려움이 있을 때 도움받을 수 있나요?", placeholder: "예) 상세 사이즈표 제공, 1:1 문의로 추천 가능 / 고객 후기 참고 권장", required: false },
        { id: "gift_wrap", category: "faq", question: "선물 포장이나 메시지 카드 서비스가 있나요?", placeholder: "예) 선물 포장 2,000원(주문 시 요청) / 없음", required: false },
      ],
    },
  ],

  // ────── 자동차 수리/정비 (NEW) ────────────────────────────────────────────
  car_repair: [
    {
      title: "정비 서비스 & 가격",
      icon: "🔧",
      questions: [
        { id: "service_types", category: "menu", question: "어떤 정비/수리 서비스를 제공하나요?", placeholder: "예) 엔진 오일 교체, 타이어 교체, 브레이크 점검, 에어컨 수리, 사고 수리 등", required: true },
        { id: "oil_price", category: "price", question: "엔진오일 교환 가격은요?", placeholder: "예) 차종에 따라 50,000~150,000원, 부품 포함 가격", required: false },
        { id: "tire_price", category: "price", question: "타이어 교체 서비스가 가능한가요? 가격은요?", placeholder: "예) 타이어 교체 가능, 부품값 + 공임비 별도 / 타이어 판매도 가능", required: false },
        { id: "estimate", category: "faq", question: "수리 전 견적을 받을 수 있나요?", placeholder: "예) 차량 입고 후 무료 진단, 견적 확인 후 진행 여부 결정", required: true },
      ],
    },
    {
      title: "예약 & 안내",
      icon: "🚗",
      questions: [
        { id: "appointment_car", category: "reservation", question: "예약 없이 방문할 수 있나요?", placeholder: "예) 가능하지만 대기 발생, 예약 우선 / 예약 필수", required: true },
        { id: "waiting_car", category: "faq", question: "정비 중 대기 공간이 있나요?", placeholder: "예) 대기실 TV·커피 제공 / 인근 카페 이용 권장", required: false },
        { id: "duration_car", category: "faq", question: "주요 정비 소요 시간은요?", placeholder: "예) 오일 교환 30분, 타이어 교체 1시간, 에어컨 수리 2~4시간", required: false },
        { id: "warranty_car", category: "policy", question: "수리 후 보증 기간이 있나요?", placeholder: "예) 부품 교체 후 6개월/10,000km 이내 하자 발생 시 무상 AS / 보증 없음", required: false },
        { id: "insurance_car", category: "faq", question: "보험 수리도 가능한가요?", placeholder: "예) 가능, 보험사 협력업체, 렌트카 연계 서비스도 제공 / 자비 수리만 가능", required: false },
      ],
    },
  ],
};

// ── 공개 함수 ────────────────────────────────────────────────────────────────

export function getQuestionsForCategory(category: string): QuestionSection[] {
  const specific = CATEGORY_SECTIONS[category] ?? CATEGORY_SECTIONS["cafe"];
  return [...COMMON_SECTIONS, ...specific];
}

export function getAllQuestions(category: string): Question[] {
  return getQuestionsForCategory(category).flatMap((s) => s.questions);
}

export function getSupportedCategories(): string[] {
  return Object.keys(CATEGORY_SECTIONS);
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

  const label: Record<string, string> = {
    hours:    "영업시간 정보",
    menu:     "메뉴/서비스 안내",
    price:    "가격 안내",
    reservation: "예약 안내",
    policy:   "정책 안내",
    faq:      "자주 묻는 질문",
    hygiene:  "위생/안전 안내",
    delivery: "배달/배송 안내",
  };

  for (const [cat, qas] of Object.entries(byCategory)) {
    if (qas.length === 0) continue;

    const content =
      `[${label[cat] ?? cat} - ${businessName}]\n\n` +
      qas.map((qa) => `Q: ${qa.q}\nA: ${qa.a}`).join("\n\n");

    chunks.push({ content, category: cat, source: "owner_onboarding" });
  }

  return chunks;
}
