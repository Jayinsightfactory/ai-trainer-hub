"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  ShoppingBag,
  GraduationCap,
  Building2,
  Stethoscope,
  Scissors,
  Dumbbell,
  UtensilsCrossed,
  Car,
  Briefcase,
  Dog,
  Camera,
  ArrowRight,
  Bot,
  MessageSquare,
  Database,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/*  업종별 데모 데이터                                                   */
/* ------------------------------------------------------------------ */
interface IndustryDemo {
  id: string;
  icon: React.ElementType;
  name: string;
  color: string;
  bg: string;
  tier: "free" | "pro";
  inputSummary: string;
  processSummary: string;
  resultExample: { question: string; answer: string };
}

const INDUSTRIES: IndustryDemo[] = [
  {
    id: "cafe",
    icon: Coffee,
    name: "카페/음식점",
    color: "text-orange-600",
    bg: "bg-orange-50",
    tier: "free",
    inputSummary: "메뉴판 · 영업시간 · FAQ 20개 · 말투 예시",
    processSummary: "역할 설정 → 지식 업로드 → 톤 학습",
    resultExample: {
      question: "메뉴 추천해주세요",
      answer: "시그니처 라떼 추천드려요! 매일 아침 로스팅한 콜롬비아 원두에 수제 바닐라시럽이 들어가서 다른 데서 못 드시는 맛이에요 ☕ 달달한 거 좋으시면 바닐라라떼도 추천! 세트로 마들렌이랑 드시면 1,000원 할인이에요 🧁",
    },
  },
  {
    id: "shopping",
    icon: ShoppingBag,
    name: "쇼핑몰",
    color: "text-pink-600",
    bg: "bg-pink-50",
    tier: "free",
    inputSummary: "환불정책 · 상품 카탈로그 · CS 기록 100건",
    processSummary: "정책 학습 → FAQ 패턴 추출 → 에스컬레이션 규칙",
    resultExample: {
      question: "이거 환불 가능한가요?",
      answer: "주문번호 알려주시면 바로 확인해드릴게요! 미개봉+7일 이내면 전액 환불, 개봉 후엔 교환 가능합니다. 불량이시면 30일 이내 무료 반품이에요. 혹시 상품에 문제 있으셨나요?",
    },
  },
  {
    id: "academy",
    icon: GraduationCap,
    name: "학원/교육",
    color: "text-violet-600",
    bg: "bg-violet-50",
    tier: "free",
    inputSummary: "커리큘럼 · 레벨 기준표 · 상담 매뉴얼 · FAQ",
    processSummary: "학부모 공감 규칙 → 커리큘럼 학습 → 레벨 매칭",
    resultExample: {
      question: "7살 영어 시작하려고요",
      answer: "딱 좋은 시기예요! 파닉스반(월수금 3:30, 40분)이 맞아요 — 원어민+한국인 2인 티칭이라 아이들이 좋아해요. 무료 레벨테스트(15분) 먼저 받아보시겠어요? 이번 주 목금 가능합니다 📝",
    },
  },
  {
    id: "realestate",
    icon: Building2,
    name: "부동산",
    color: "text-sky-600",
    bg: "bg-sky-50",
    tier: "pro",
    inputSummary: "매물 DB · 지역 특성 · 실거래가 · 매물 설명 200개",
    processSummary: "매물 스펙 학습 → 패턴 추출 → 자동 설명 생성",
    resultExample: {
      question: "역삼동 30평대 추천해주세요",
      answer: "역삼역 도보 7분, 실평수 28평 남향 4Bay 매물 있습니다. 2024년 풀 리모델링, 학군 OO초 300m. 최근 실거래 9.2억, 관리비 28만원. 주차 1.5대. 현장 방문 가능하세요?",
    },
  },
  {
    id: "medical",
    icon: Stethoscope,
    name: "병원/의원",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    tier: "pro",
    inputSummary: "진료과목 · 의료진 소개 · 예약 시스템 · 주의사항",
    processSummary: "의료 규정 학습 → 안전 답변 규칙 → 예약 연동",
    resultExample: {
      question: "피부과 예약하고 싶어요",
      answer: "어떤 시술이 궁금하세요? 여드름/기미/리프팅 등 분야별 전문의가 계세요. 초진이시면 상담 포함 30분 잡아드릴게요. 이번 주 수목 오후 가능한데 편하신 시간 알려주세요!",
    },
  },
  {
    id: "beauty",
    icon: Scissors,
    name: "미용/뷰티",
    color: "text-rose-600",
    bg: "bg-rose-50",
    tier: "free",
    inputSummary: "시술 메뉴 · 가격표 · 포트폴리오 · 예약 규정",
    processSummary: "시술 지식 학습 → 추천 로직 → 예약 안내",
    resultExample: {
      question: "볼륨 매직 가격이 어떻게 돼요?",
      answer: "기장별로 달라요! 숏 8만원 / 미디엄 10만원 / 롱 12만원이에요. 지금 4월 이벤트로 첫 방문 20% 할인 중이에요 ✨ 모발 상태 보고 상담 먼저 드리는데, 원하시는 날짜 있으세요?",
    },
  },
  {
    id: "fitness",
    icon: Dumbbell,
    name: "헬스/PT",
    color: "text-amber-600",
    bg: "bg-amber-50",
    tier: "pro",
    inputSummary: "PT 프로그램 · 가격표 · 트레이너 소개 · 후기",
    processSummary: "프로그램 매칭 → 목표별 추천 → 체험 안내",
    resultExample: {
      question: "다이어트 PT 알아보고 있어요",
      answer: "목표 체중이나 기간이 있으세요? 저희 3개월 다이어트 프로그램이 평균 -8kg 달성 중이에요. 주 3회 PT + 식단 관리 포함 월 39만원. 무료 체험 PT 1회 가능한데 해보시겠어요? 💪",
    },
  },
  {
    id: "restaurant",
    icon: UtensilsCrossed,
    name: "식당/배달",
    color: "text-red-600",
    bg: "bg-red-50",
    tier: "free",
    inputSummary: "메뉴판 · 원산지 · 알레르기 정보 · 배달 정책",
    processSummary: "메뉴 학습 → 추천 조합 → 배달/포장 안내",
    resultExample: {
      question: "2인 세트 뭐가 좋아요?",
      answer: "2인이시면 한우 갈비탕 세트(32,000원) 추천드려요! 갈비탕 2그릇 + 공기밥 2 + 반찬 6종이에요. 국물이 24시간 뽑아서 진해요. 매운 거 좋으시면 육개장 세트도 인기예요 🔥",
    },
  },
  {
    id: "car",
    icon: Car,
    name: "자동차/정비",
    color: "text-slate-600",
    bg: "bg-slate-50",
    tier: "pro",
    inputSummary: "정비 항목 · 가격표 · 차종별 매뉴얼 · 후기",
    processSummary: "정비 지식 학습 → 증상별 진단 → 견적 안내",
    resultExample: {
      question: "엔진오일 교환 얼마예요?",
      answer: "차종이 어떻게 되세요? 일반 합성유 기준 7~9만원, 풀합성유 12~15만원이에요. 주행거리 1만km 또는 6개월마다 추천드려요. 지금 예약하시면 에어컨 필터 무료 점검도 해드립니다!",
    },
  },
  {
    id: "consulting",
    icon: Briefcase,
    name: "전문 서비스",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    tier: "pro",
    inputSummary: "서비스 목록 · 사례 · 자격/경력 · FAQ",
    processSummary: "전문 지식 학습 → 상담 시뮬레이션 → 예약 연동",
    resultExample: {
      question: "세무상담 받고 싶어요",
      answer: "어떤 분야 상담이 필요하세요? 종합소득세/부가세/법인세/양도세 등 분야별 세무사가 계세요. 초기 상담은 30분 무료이고, 자료 준비하실 것도 안내드릴게요. 편하신 시간대 알려주세요!",
    },
  },
  {
    id: "pet",
    icon: Dog,
    name: "반려동물",
    color: "text-teal-600",
    bg: "bg-teal-50",
    tier: "free",
    inputSummary: "서비스 목록 · 품종별 정보 · 가격표 · 주의사항",
    processSummary: "품종 지식 → 서비스 매칭 → 예약/상담 안내",
    resultExample: {
      question: "소형견 미용 가격이요?",
      answer: "품종이 어떻게 되나요? 말티즈 기준 전체 미용 4만원, 부분(얼굴+발) 2만원이에요. 첫 방문이시면 10% 할인! 예민한 아이는 1:1 케어도 가능해요. 원하시는 날짜 있으세요? 🐕",
    },
  },
  {
    id: "studio",
    icon: Camera,
    name: "스튜디오/사진",
    color: "text-purple-600",
    bg: "bg-purple-50",
    tier: "pro",
    inputSummary: "촬영 패키지 · 포트폴리오 · 가격표 · 예약 정책",
    processSummary: "패키지 학습 → 용도별 추천 → 예약 안내",
    resultExample: {
      question: "증명사진 촬영 가능한가요?",
      answer: "네! 증명사진 패키지 2만원이에요 — 촬영 + 보정 + 6장 인화 + 파일 제공. 취업용이시면 정장 대여도 무료예요. 보통 20분 소요되고, 당일 예약도 가능합니다. 오늘 오실 수 있으세요? 📸",
    },
  },
];

/* ------------------------------------------------------------------ */
/*  업종 카드 컴포넌트                                                   */
/* ------------------------------------------------------------------ */
function IndustryCard({ demo, index }: { demo: IndustryDemo; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group ${
        expanded ? "row-span-2" : ""
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 ${demo.bg}`}>
        <div className="flex items-center gap-2">
          <demo.icon className={`size-5 ${demo.color}`} />
          <span className="text-sm font-bold text-gray-800">{demo.name}</span>
        </div>
        <Badge
          variant="secondary"
          className={`text-[10px] ${
            demo.tier === "free"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {demo.tier === "free" ? "무료" : "프로"}
        </Badge>
      </div>

      {/* 3-Step Flow */}
      <div className="px-4 py-3 space-y-2">
        {/* Step 1: Input */}
        <div className="flex items-start gap-2">
          <div className="flex items-center justify-center size-5 rounded bg-blue-50 shrink-0 mt-0.5">
            <Database className="size-3 text-blue-500" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-blue-600">학습 데이터</div>
            <div className="text-[11px] text-gray-500 leading-snug">{demo.inputSummary}</div>
          </div>
        </div>

        {/* Step 2: Process */}
        <div className="flex items-start gap-2">
          <div className="flex items-center justify-center size-5 rounded bg-amber-50 shrink-0 mt-0.5">
            <Sparkles className="size-3 text-amber-500" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-amber-600">학습 과정</div>
            <div className="text-[11px] text-gray-500 leading-snug">{demo.processSummary}</div>
          </div>
        </div>

        {/* Step 3: Result */}
        <div className="flex items-start gap-2">
          <div className="flex items-center justify-center size-5 rounded bg-emerald-50 shrink-0 mt-0.5">
            <MessageSquare className="size-3 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold text-emerald-600">결과</div>
            <div className="mt-1 bg-gray-50 rounded-lg p-2">
              <div className="text-[10px] text-gray-400 mb-1">고객: "{demo.resultExample.question}"</div>
              <div className={`text-[11px] leading-snug ${expanded ? "text-gray-700" : "text-gray-600 line-clamp-2"}`}>
                AI: {demo.resultExample.answer}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">
          {expanded ? "접기" : "전체 응답 보기"}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/learn?template=text-cs-${demo.id}`;
          }}
          className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
        >
          학습 시작 <ChevronRight className="size-3" />
        </button>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  메인                                                               */
/* ------------------------------------------------------------------ */
export default function HomeView() {
  return (
    <div className="h-full overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              AI가 고객을 응대합니다
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              업종을 선택하세요. 학습 데이터 → 학습 과정 → 결과를 바로 확인할 수 있습니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-xs">
              무료 업종 6개
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-xs">
              전체 12개 업종
            </Badge>
          </div>
        </div>
      </div>

      {/* Grid: 4 columns × 3 rows */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-4 gap-4">
          {INDUSTRIES.map((demo, i) => (
            <IndustryCard key={demo.id} demo={demo} index={i} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-8">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-800">네이버 플레이스에 AI 상담을 연결하세요</h3>
            <p className="text-xs text-gray-500 mt-1">홈페이지 URL만 등록하면, 고객이 방문할 때 학습된 AI가 자동 응대합니다.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shrink-0">
            무료로 시작하기 <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
