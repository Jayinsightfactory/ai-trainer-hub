"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Database,
  FileText,
  MessageCircle,
  Mic,
  Upload,
  Brain,
  Zap,
  AlertTriangle,
  ChefHat,
  ShoppingBag,
  Stethoscope,
  GraduationCap,
  Building2,
  Utensils,
  Video,
  Camera,
  BarChart3,
  ArrowDown,
  ArrowRight,
  Megaphone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

/* ------------------------------------------------------------------ */
/*  학습 방법 타입                                                      */
/* ------------------------------------------------------------------ */
type LearningMethod =
  | "system_prompt"   // Instructions에 역할/규칙 설정
  | "knowledge"       // Knowledge에 문서/데이터 업로드
  | "fine_tuning"     // 파인튜닝 (대량 데이터 학습)
  | "rag"             // RAG (검색 증강 생성)
  | "memory"          // Memory 축적
  | "few_shot";       // 예시 몇 개로 학습

const METHOD_INFO: Record<LearningMethod, { label: string; color: string; desc: string }> = {
  system_prompt: { label: "역할 설정", color: "bg-blue-100 text-blue-700", desc: "AI에게 역할과 규칙을 알려줌" },
  knowledge:     { label: "지식 업로드", color: "bg-emerald-100 text-emerald-700", desc: "문서/데이터를 AI에게 먹임" },
  fine_tuning:   { label: "파인튜닝", color: "bg-purple-100 text-purple-700", desc: "대량 데이터로 모델 자체를 학습" },
  rag:           { label: "RAG", color: "bg-amber-100 text-amber-700", desc: "검색해서 답변에 활용" },
  memory:        { label: "Memory", color: "bg-pink-100 text-pink-700", desc: "대화하며 점점 기억이 쌓임" },
  few_shot:      { label: "예시 학습", color: "bg-cyan-100 text-cyan-700", desc: "좋은 예시 몇 개로 패턴 학습" },
};

/* ------------------------------------------------------------------ */
/*  학습 사례 데이터                                                     */
/* ------------------------------------------------------------------ */
type Case = {
  id: number;
  icon: React.ElementType;
  who: string;
  title: string;
  // 학습 핵심
  methods: LearningMethod[];
  whatFed: string[];           // AI에게 뭘 넣었나
  howTaught: string;           // 어떻게 가르쳤나 (핵심 한줄)
  learningInsight: string;     // 학습 과정에서 발견한 것
  // Before/After
  before: { label: string; example: string };
  after:  { label: string; example: string };
  // 학습 레벨
  level: number;               // 1-4
  levelLabel: string;
  // 메타
  category: string;
  gradient: string;
};

const cases: Case[] = [
  {
    id: 1,
    icon: ChefHat,
    who: "OO치킨 사장님",
    title: "치킨집 AI에게 사투리 가르치기",
    methods: ["system_prompt", "few_shot"],
    whatFed: [
      "사장님 말투 규칙 (Instructions)",
      "사투리 표현 30개 예시",
      "이모지 규칙: 🐔❤️만 사용",
      "별점별 답글 톤 차이 설정",
    ],
    howTaught: "\"나는 OO치킨 사장님입니다\" + 사투리 예시 30개를 Instructions에 넣음",
    learningInsight: "처음엔 '표준어 존댓말'로 답해서 어색했음. 사투리 예시를 추가하자 자연스러워짐",
    before: { label: "학습 전 AI", example: "감사합니다. 맛있게 드셨다니 기쁩니다. 좋은 하루 되세요." },
    after:  { label: "학습 후 AI", example: "앗 고마워유~ 🐔 우리 치킨 맛있쥬? ❤️ 담에 또 오세유~ 양념도 드셔봐유!" },
    level: 2,
    levelLabel: "+말투 학습",
    category: "역할 학습",
    gradient: "from-orange-400 to-amber-500",
  },
  {
    id: 2,
    icon: Stethoscope,
    who: "건강식품 스마트스토어",
    title: "CS봇에게 환불 규정 가르치기",
    methods: ["system_prompt", "knowledge"],
    whatFed: [
      "환불/교환 정책 문서 (PDF)",
      "식약처 인증 문구 목록",
      "\"의학적 효능 질문 → 답변 불가\" 규칙",
      "자주 묻는 질문 150개",
    ],
    howTaught: "System Prompt에 역할 + Knowledge에 정책 문서와 FAQ를 업로드",
    learningInsight: "\"이 제품 먹으면 살 빠져요?\" 같은 효능 질문을 식약처 규정에 맞게 거절하는 법을 학습시키는 게 핵심",
    before: { label: "학습 전", example: "네, 다이어트에 효과적입니다! (← 법적 문제 가능)" },
    after:  { label: "학습 후", example: "식약처 인증 문구 외 효능 안내는 어려워요. 인증 정보를 안내드릴까요?" },
    level: 3,
    levelLabel: "+규정 학습",
    category: "지식 학습",
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    id: 3,
    icon: GraduationCap,
    who: "영어학원 원장님",
    title: "학부모 상담 매뉴얼 통째로 학습",
    methods: ["knowledge", "system_prompt"],
    whatFed: [
      "학부모 상담 매뉴얼 30페이지 (PDF)",
      "레벨 테스트 기준표",
      "커리큘럼 설명 자료",
      "자주 묻는 질문 200개",
    ],
    howTaught: "Knowledge에 매뉴얼+커리큘럼+FAQ 업로드 → \"학부모 불안감을 공감하되 과장 금지\" 규칙 설정",
    learningInsight: "AI가 등록을 지나치게 유도하면 학부모가 불쾌해함. \"공감 우선, 정보 제공\" 원칙이 전환율에 더 효과적",
    before: { label: "학습 전", example: "영어 학원에 대해 잘 모르겠습니다. 원장님께 문의해주세요." },
    after:  { label: "학습 후", example: "아이가 파닉스 단계시군요! 저희 레벨2 반이 딱이에요. 무료 레벨테스트 예약해드릴까요?" },
    level: 3,
    levelLabel: "+전문지식",
    category: "지식 학습",
    gradient: "from-violet-400 to-purple-500",
  },
  {
    id: 4,
    icon: Camera,
    who: "교토 카페 체인",
    title: "인스타 감성 글쓰기 학습",
    methods: ["knowledge", "few_shot"],
    whatFed: [
      "인기 게시물(좋아요 100+) 캡션 50개",
      "해시태그 패턴 분석 결과",
      "게시 시간대별 인게이지먼트 데이터",
      "브랜드 톤: \"교토 감성, 차분하고 시적\"",
    ],
    howTaught: "잘 된 게시물 50개를 \"이런 식으로 써줘\"라고 예시로 제공 (Few-shot)",
    learningInsight: "해시태그는 5~8개가 최적. 10개 넘으면 오히려 도달률 감소. AI가 데이터에서 이 패턴을 찾아냄",
    before: { label: "학습 전", example: "오늘의 라떼입니다. 맛있습니다. #카페 #라떼 #맛집" },
    after:  { label: "학습 후", example: "비 오는 교토의 오후, 라떼 한 잔에 시간이 멈추다. ☔🍵 #교토카페일상 #雨の日カフェ" },
    level: 2,
    levelLabel: "+톤 학습",
    category: "패턴 학습",
    gradient: "from-pink-400 to-rose-500",
  },
  {
    id: 5,
    icon: Video,
    who: "IT 테크 유튜버",
    title: "내 말투로 대본 쓰게 만들기",
    methods: ["knowledge", "system_prompt", "few_shot"],
    whatFed: [
      "기존 대본 50개 (말투, 구성 패턴)",
      "인기 영상(상위 20%) 도입부 분석",
      "타겟 시청자 분석 데이터",
      "\"한국어 존댓말 금지, ~거든 자주 사용\" 규칙",
    ],
    howTaught: "대본 50개를 Knowledge에 넣고, \"이 유튜버의 말투와 전개 방식으로 써줘\" 지시",
    learningInsight: "AI 대본을 그대로 읽으면 부자연스러움 → 반드시 리라이팅 필요. 70% 초안 + 30% 본인 수정이 최적",
    before: { label: "학습 전", example: "안녕하세요. 오늘은 M4 칩에 대해 알아보겠습니다." },
    after:  { label: "학습 후", example: "야 이거 진짜 미쳤거든? M4 칩 벤치 돌려봤는데 이건 좀..." },
    level: 3,
    levelLabel: "+말투+구성",
    category: "패턴 학습",
    gradient: "from-red-400 to-orange-500",
  },
  {
    id: 6,
    icon: Utensils,
    who: "김밥 프랜차이즈",
    title: "POS 데이터로 수요 예측 학습",
    methods: ["knowledge", "rag"],
    whatFed: [
      "POS 데이터 6개월치 (CSV)",
      "날씨 데이터 (기상청 API)",
      "주변 행사/이벤트 캘린더",
      "식재료 단가표",
    ],
    howTaught: "CSV 데이터를 업로드하고 \"요일별, 시간대별, 날씨별 주문 패턴을 분석해줘\" 요청",
    learningInsight: "비 오는 날 따뜻한 메뉴(라면, 떡볶이) 수요가 35% 급증하는 패턴 발견 → 사전 준비로 폐기율 절반",
    before: { label: "학습 전", example: "매일 같은 양 발주 → 폐기율 15%" },
    after:  { label: "학습 후", example: "\"내일 비 예보. 어묵/라면 30% 추가 발주 추천\" → 폐기율 7%" },
    level: 4,
    levelLabel: "+데이터분석",
    category: "데이터 학습",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    id: 7,
    icon: ShoppingBag,
    who: "아마존 셀러",
    title: "경쟁사 리뷰 7,000개 비교 학습",
    methods: ["knowledge", "rag"],
    whatFed: [
      "자사 상품 리뷰 2,000개 (CSV)",
      "경쟁사 상위 5개 리뷰 각 1,000개",
      "반품 사유 데이터",
      "상품 스펙 비교표",
    ],
    howTaught: "리뷰 CSV를 넣고 \"우리 제품 vs 경쟁사 불만 포인트를 비교 분석해줘\" 요청",
    learningInsight: "\"포장이 약하다\" 불만이 자사에만 집중 → 포장 개선 후 반품률 12%→7%. AI가 사람이 놓친 패턴을 찾아냄",
    before: { label: "분석 전", example: "리뷰 7,000개를 사람이 읽을 수 없음" },
    after:  { label: "분석 후", example: "\"포장 불만 자사 23% vs 경쟁사 5%. 포장 개선이 최우선\"" },
    level: 4,
    levelLabel: "+패턴 발견",
    category: "데이터 학습",
    gradient: "from-teal-400 to-cyan-500",
  },
  {
    id: 8,
    icon: Building2,
    who: "공인중개사",
    title: "매물 설명 200개로 글쓰기 학습",
    methods: ["knowledge", "few_shot"],
    whatFed: [
      "기존 매물 설명 200개 (잘 쓴 것)",
      "매물 스펙 템플릿 (면적, 교통, 학군)",
      "지역별 특성 키워드 목록",
      "\"과장 금지, 팩트 기반\" 규칙",
    ],
    howTaught: "잘 쓴 매물 설명 200개를 예시로 주고, 새 매물 스펙만 입력하면 자동 생성",
    learningInsight: "처음엔 모든 매물을 \"역세권 명당\"으로 포장 → \"과장 금지\" 규칙 추가 후 신뢰도 상승",
    before: { label: "학습 전", example: "34평 아파트입니다. 역에서 가깝습니다." },
    after:  { label: "학습 후", example: "실평수 28평, 남향 4Bay. 2호선 도보 7분. 학군: OO초 300m. 최근 실거래 9.2억" },
    level: 2,
    levelLabel: "+패턴 학습",
    category: "패턴 학습",
    gradient: "from-sky-400 to-blue-500",
  },
  {
    id: 9,
    icon: GraduationCap,
    who: "온라인 강의 크리에이터",
    title: "수강생 Q&A 500개로 강의력 학습",
    methods: ["knowledge", "system_prompt"],
    whatFed: [
      "기존 강의 스크립트 20개",
      "수강생 Q&A 500개",
      "수강평 분석 결과",
      "\"비유 많이, 전문용어는 쉬운 설명 병기\"",
    ],
    howTaught: "스크립트+Q&A를 Knowledge에 넣고, \"이 강사의 설명 방식으로 새 강의를 써줘\" 지시",
    learningInsight: "수강생이 자주 묻는 질문 = 설명이 부족한 부분. Q&A를 학습시키자 AI가 \"여기서 헷갈리시죠?\"를 미리 넣어줌",
    before: { label: "학습 전", example: "API는 Application Programming Interface의 약자입니다." },
    after:  { label: "학습 후", example: "API는 식당의 메뉴판이에요. 주방에 직접 들어가지 않아도 메뉴판만 보면 주문할 수 있죠?" },
    level: 3,
    levelLabel: "+설명법 학습",
    category: "패턴 학습",
    gradient: "from-indigo-400 to-violet-500",
  },
  {
    id: 10,
    icon: Megaphone,
    who: "프리랜서 마케터",
    title: "고객 10명의 톤을 각각 기억",
    methods: ["memory", "system_prompt"],
    whatFed: [
      "고객별 브랜드 톤앤매너 가이드",
      "과거 캠페인 히스토리",
      "선호 채널/키워드 목록",
      "피드백 이력 (수정 요청들)",
    ],
    howTaught: "고객별로 대화하며 Memory에 자동 축적. 다음 대화에서 이전 맥락을 기억",
    learningInsight: "A고객은 \"~입니다\" 체, B고객은 \"~요\" 체. Memory가 쌓일수록 고객별 톤 전환이 자동화됨",
    before: { label: "Memory 없이", example: "두 고객 모두 같은 톤으로 작성 → 매번 수정 요청" },
    after:  { label: "Memory 쌓인 후", example: "A고객: \"브랜드 가치를 전합니다\" / B고객: \"이거 진짜 좋아요~\"" },
    level: 3,
    levelLabel: "+맥락 축적",
    category: "기억 학습",
    gradient: "from-purple-400 to-fuchsia-500",
  },
  {
    id: 11,
    icon: BarChart3,
    who: "법률 스타트업",
    title: "판례 10만 건으로 법률 AI 학습",
    methods: ["fine_tuning", "rag"],
    whatFed: [
      "대한민국 판례 10만 건",
      "법률 상담 사례 5만 건",
      "법률 용어 사전",
      "변호사 답변 패턴 1만 건",
    ],
    howTaught: "대량 데이터로 모델 자체를 파인튜닝 + RAG로 최신 판례 실시간 검색",
    learningInsight: "프롬프트만으로는 법률 전문성 부족 → 파인튜닝해야 \"이 사안은 민법 제750조 불법행위에 해당\" 수준 가능",
    before: { label: "일반 AI", example: "법적 문제는 변호사와 상담하시는 것을 추천드립니다." },
    after:  { label: "학습된 AI", example: "이 사안은 민법 750조 불법행위 해당 가능성. 유사 판례 3건 있으며, 위자료 평균 500만원..." },
    level: 4,
    levelLabel: "파인튜닝+RAG",
    category: "전문 학습",
    gradient: "from-gray-500 to-slate-700",
  },
  {
    id: 12,
    icon: Stethoscope,
    who: "대학병원 의료팀",
    title: "환자 교육 자료 자동 생성 학습",
    methods: ["knowledge", "rag", "system_prompt"],
    whatFed: [
      "질환별 교육 자료 200건",
      "복약 안내문 표준 양식",
      "수술 전후 가이드 50건",
      "\"의학 용어 → 쉬운 말 변환\" 규칙",
    ],
    howTaught: "기존 교육 자료를 Knowledge에 넣고, 새 질환명만 입력하면 환자용 자료 자동 생성",
    learningInsight: "의료 AI의 핵심은 \"하면 안 되는 말\"을 가르치는 것. 진단/처방 표현을 절대 사용 못 하게 규칙 설정",
    before: { label: "학습 전", example: "고혈압에 대해 설명해드리겠습니다..." },
    after:  { label: "학습 후", example: "혈압약은 매일 같은 시간에 드세요. 어지러우면 천천히 일어나시고, 이런 증상이 있으면 즉시 내원..." },
    level: 3,
    levelLabel: "+의료 지식",
    category: "전문 학습",
    gradient: "from-rose-400 to-pink-600",
  },
  {
    id: 13,
    icon: ShoppingBag,
    who: "이커머스 기업",
    title: "자연어 상품 검색 AI 학습",
    methods: ["rag", "fine_tuning"],
    whatFed: [
      "상품 DB 전체 (10만 SKU)",
      "고객 리뷰 50만 건",
      "검색어 로그 100만 건",
      "문의 데이터 5만 건",
    ],
    howTaught: "상품+리뷰를 벡터DB에 넣고 RAG 구성. \"여름에 입기 좋은 린넨\" 같은 자연어 검색 가능하게",
    learningInsight: "키워드 검색 정확도 45% → 벡터 검색으로 82%. 핵심은 chunk 크기를 500토큰으로 설정한 것",
    before: { label: "키워드 검색", example: "\"린넨\" 검색 → 린넨 아무거나 45건 (정확도 45%)" },
    after:  { label: "AI 검색", example: "\"여름에 입기 좋은 린넨\" → 통기성 좋은 린넨 셔츠 상위 8건 (정확도 82%)" },
    level: 4,
    levelLabel: "RAG+파인튜닝",
    category: "전문 학습",
    gradient: "from-emerald-400 to-green-600",
  },
  {
    id: 14,
    icon: AlertTriangle,
    who: "쇼핑몰 운영자",
    title: "실패: 데이터 정제 없이 전부 넣기",
    methods: ["knowledge"],
    whatFed: [
      "고객 문의 1만 건 (정제 없이 전부)",
      "오래된 정보, 오타, 욕설 포함",
      "중복 데이터 다수",
    ],
    howTaught: "\"많이 넣으면 잘 되겠지\" → 1만 건을 그대로 Knowledge에 투입",
    learningInsight: "⚠️ Garbage In, Garbage Out. 정제 안 된 데이터 → AI가 엉뚱한 답변. 데이터 품질이 곧 AI 품질",
    before: { label: "기대", example: "1만 건이나 넣었으니 완벽하겠지!" },
    after:  { label: "현실", example: "\"배송은 보통 2~3일...아 아니 5일...그건 작년 기준인데...\" (혼란)" },
    level: 1,
    levelLabel: "⚠️ 실패",
    category: "실패 사례",
    gradient: "from-red-400 to-red-600",
  },
  {
    id: 15,
    icon: AlertTriangle,
    who: "블로그 운영자",
    title: "실패: AI 글 그대로 게시",
    methods: ["system_prompt"],
    whatFed: [
      "\"SEO 최적화 블로그 글 써줘\" 한 줄",
    ],
    howTaught: "프롬프트 한 줄만 주고 나온 글을 검수 없이 그대로 블로그에 게시",
    learningInsight: "⚠️ 구글이 AI 글을 탐지. 검색 순위 폭락. 핵심: AI는 초안 도구이지 완성품이 아님. 사람 검수 필수",
    before: { label: "기대", example: "매일 자동으로 글이 올라가면 트래픽 폭증!" },
    after:  { label: "현실", example: "동일 패턴 반복 → 구글 AI 탐지 → 검색 순위 90% 하락" },
    level: 1,
    levelLabel: "⚠️ 실패",
    category: "실패 사례",
    gradient: "from-red-500 to-rose-700",
  },
  {
    id: 16,
    icon: AlertTriangle,
    who: "소상공인",
    title: "실패: 파인튜닝에 돈만 날림",
    methods: ["fine_tuning"],
    whatFed: [
      "대화 데이터 500건 (최소 기준 미달)",
      "비용: $800+ 지출",
    ],
    howTaught: "\"파인튜닝하면 더 똑똑해지겠지\" → 소량 데이터로 파인튜닝 시도",
    learningInsight: "⚠️ 파인튜닝은 최소 수천 건 필요. 500건으로는 프롬프트보다 못한 결과. 대부분의 경우 프롬프트+RAG로 충분",
    before: { label: "기대", example: "파인튜닝 = 완벽한 AI!" },
    after:  { label: "현실", example: "$800 날리고 프롬프트보다 못한 결과. Knowledge 업로드가 정답이었음" },
    level: 1,
    levelLabel: "⚠️ 실패",
    category: "실패 사례",
    gradient: "from-orange-500 to-red-600",
  },
];

/* ------------------------------------------------------------------ */
/*  Learning Method Badge                                              */
/* ------------------------------------------------------------------ */
function MethodBadge({ method }: { method: LearningMethod }) {
  const info = METHOD_INFO[method];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${info.color}`}>
      {info.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Card Component — 학습 중심 디자인                                    */
/* ------------------------------------------------------------------ */
function CaseCard({ c, index }: { c: Case; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const isFailure = c.category === "실패 사례";

  return (
    <motion.div
      className="relative flex-shrink-0 w-[300px] sm:w-[340px] h-[460px] cursor-pointer perspective-[1000px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {/* ===== Front: 학습 과정 ===== */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Top gradient strip */}
          <div className={`h-2 bg-gradient-to-r ${c.gradient}`} />

          <div className="p-5 flex flex-col h-[calc(100%-8px)]">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`flex items-center justify-center size-9 rounded-lg bg-gradient-to-br ${c.gradient}`}>
                  <c.icon className="size-4 text-white" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">{c.who}</p>
                  <h3 className="text-sm font-bold leading-tight">{c.title}</h3>
                </div>
              </div>
              <Badge variant={isFailure ? "destructive" : "secondary"} className="text-[10px] shrink-0">
                {c.category}
              </Badge>
            </div>

            {/* 학습 방법 태그 */}
            <div className="flex flex-wrap gap-1 mb-3">
              {c.methods.map((m) => (
                <MethodBadge key={m} method={m} />
              ))}
            </div>

            {/* AI에게 넣은 것 */}
            <div className="rounded-lg bg-gray-50 p-3 mb-3 flex-1">
              <div className="flex items-center gap-1.5 mb-2">
                <Upload className="size-3.5 text-gray-500" />
                <span className="text-[11px] font-semibold text-gray-600">AI에게 넣은 것</span>
              </div>
              <ul className="space-y-1">
                {c.whatFed.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-600">
                    <span className="text-gray-300 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 학습 레벨 */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1">
                <Progress
                  value={isFailure ? 10 : c.level * 25}
                  className={`h-2 ${isFailure ? "[&>div]:bg-red-500" : "[&>div]:bg-indigo-500"}`}
                />
              </div>
              <span className={`text-[10px] font-bold ${isFailure ? "text-red-500" : "text-indigo-600"}`}>
                Lv.{c.level} {c.levelLabel}
              </span>
            </div>

            <p className="text-[10px] text-gray-400 text-center">탭하여 Before/After 보기 →</p>
          </div>
        </div>

        {/* ===== Back: Before/After + 인사이트 ===== */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className={`h-2 bg-gradient-to-r ${c.gradient}`} />

          <div className="p-5 flex flex-col h-[calc(100%-8px)]">
            {/* Title */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`flex items-center justify-center size-7 rounded-md bg-gradient-to-br ${c.gradient}`}>
                <c.icon className="size-3.5 text-white" />
              </div>
              <h4 className="text-sm font-bold">{c.title}</h4>
            </div>

            {/* How taught */}
            <div className="rounded-lg bg-indigo-50 p-3 mb-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Brain className="size-3.5 text-indigo-600" />
                <span className="text-[11px] font-semibold text-indigo-700">어떻게 가르쳤나</span>
              </div>
              <p className="text-[11px] text-indigo-600 leading-relaxed">{c.howTaught}</p>
            </div>

            {/* Before / After */}
            <div className="flex-1 space-y-2">
              <div className={`rounded-lg p-3 ${isFailure ? "bg-amber-50" : "bg-red-50"}`}>
                <span className="text-[10px] font-bold text-red-400 uppercase">{c.before.label}</span>
                <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{c.before.example}</p>
              </div>

              <div className="flex justify-center">
                <ArrowDown className={`size-4 ${isFailure ? "text-red-400" : "text-emerald-400"}`} />
              </div>

              <div className={`rounded-lg p-3 ${isFailure ? "bg-red-50" : "bg-emerald-50"}`}>
                <span className={`text-[10px] font-bold uppercase ${isFailure ? "text-red-500" : "text-emerald-500"}`}>{c.after.label}</span>
                <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{c.after.example}</p>
              </div>
            </div>

            {/* Key Insight */}
            <div className={`rounded-lg p-3 mt-3 ${isFailure ? "bg-red-50" : "bg-amber-50"}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className={`size-3.5 ${isFailure ? "text-red-500" : "text-amber-600"}`} />
                <span className={`text-[10px] font-semibold ${isFailure ? "text-red-600" : "text-amber-700"}`}>
                  {isFailure ? "실패 교훈" : "학습 인사이트"}
                </span>
              </div>
              <p className="text-[10px] text-gray-600 leading-relaxed">{c.learningInsight}</p>
            </div>

            <p className="text-[10px] text-gray-400 text-center mt-2">탭하여 돌아가기</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Filter Tabs                                                        */
/* ------------------------------------------------------------------ */
const categories = [
  { key: "all", label: "전체 학습 사례" },
  { key: "역할 학습", label: "역할 설정" },
  { key: "지식 학습", label: "지식 업로드" },
  { key: "패턴 학습", label: "패턴 학습" },
  { key: "데이터 학습", label: "데이터 분석" },
  { key: "기억 학습", label: "Memory 축적" },
  { key: "전문 학습", label: "전문 도메인" },
  { key: "실패 사례", label: "실패 사례" },
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function CaseShowcase() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState("all");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const filtered = filter === "all" ? cases : cases.filter((c) => c.category === filter);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    // reset scroll on filter change
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, [filter]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -360 : 360, behavior: "smooth" });
    setTimeout(checkScroll, 400);
  };

  return (
    <section className="relative py-16 sm:py-24 bg-gray-50 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4 text-xs">학습 = AI의 품질</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            AI를 이렇게 학습시킵니다
          </h2>
          <p className="mt-3 text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
            뭘 넣었고, 어떻게 가르쳤고, 어떻게 달라졌는지.
            <br className="hidden sm:block" />
            카드를 탭하면 Before/After와 학습 인사이트를 볼 수 있습니다.
          </p>
        </div>

        {/* Learning Method Legend */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {Object.entries(METHOD_INFO).map(([key, info]) => (
            <div key={key} className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <span className={`inline-block size-2 rounded-full ${info.color.split(" ")[0]}`} />
              <span>{info.label}: {info.desc}</span>
            </div>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6 justify-start sm:justify-center">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === cat.key
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Carousel */}
        <div className="relative group">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center size-12 rounded-full bg-white/90 shadow-lg border border-gray-200 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="size-6 text-gray-700" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center size-12 rounded-full bg-white/90 shadow-lg border border-gray-200 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="size-6 text-gray-700" />
            </button>
          )}

          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 to-transparent z-[5] pointer-events-none" />
          )}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 to-transparent z-[5] pointer-events-none" />
          )}

          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-5 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex-shrink-0 w-1 sm:w-4" />
            {filtered.map((c, i) => (
              <div key={c.id} className="snap-start">
                <CaseCard c={c} index={i} />
              </div>
            ))}
            <div className="flex-shrink-0 w-1 sm:w-4" />
          </div>
        </div>

        {/* Bottom: 학습의 6대 법칙 요약 */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: Database, title: "데이터 품질", desc: "쓰레기 넣으면\n쓰레기 나온다" },
            { icon: FileText, title: "라벨이 교사", desc: "기준을 정해주는\n사람이 곧 선생님" },
            { icon: Upload, title: "양보다 질", desc: "적은 데이터면\n질에 집중" },
            { icon: Brain, title: "다양성 = 일반화", desc: "편향된 데이터는\n편향된 AI" },
            { icon: MessageCircle, title: "피드백이 진화", desc: "한번 학습으로\n끝이 아니다" },
            { icon: Mic, title: "원칙 > 개별교정", desc: "규칙을 주면\nAI가 스스로 판단" },
          ].map((law) => (
            <div key={law.title} className="text-center p-4 rounded-xl bg-white border border-gray-100">
              <law.icon className="size-5 text-indigo-500 mx-auto mb-2" />
              <div className="text-xs font-bold text-gray-800">{law.title}</div>
              <div className="text-[10px] text-gray-500 mt-1 whitespace-pre-line">{law.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/templates">
            <Button variant="outline" size="lg" className="gap-2">
              전체 학습 템플릿 보기 <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
