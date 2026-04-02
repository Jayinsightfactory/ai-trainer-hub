"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOnboardingStore } from "@/store/onboarding";
import { Bot, User } from "lucide-react";

const industryExamples: Record<
  string,
  { before: { q: string; a: string }; after: { q: string; a: string } }
> = {
  "카페/음식점": {
    before: {
      q: "디카페인 메뉴 있나요?",
      a: "죄송합니다. 해당 정보는 확인이 어렵습니다. 매장에 직접 문의해 주세요.",
    },
    after: {
      q: "디카페인 메뉴 있나요?",
      a: "네! 저희 카페에는 디카페인 아메리카노(4,500원), 디카페인 라떼(5,000원)가 있어요. 오늘의 추천은 디카페인 바닐라 라떼입니다 ☕",
    },
  },
  쇼핑몰: {
    before: {
      q: "이 바지 M사이즈 재입고 언제 되나요?",
      a: "재입고 일정은 미정입니다. 나중에 다시 확인해 주세요.",
    },
    after: {
      q: "이 바지 M사이즈 재입고 언제 되나요?",
      a: "슬림핏 데님(M) 4월 5일 재입고 예정이에요! 알림 설정해드릴까요? 비슷한 핏의 치노 팬츠도 인기가 많아요 👖",
    },
  },
  부동산: {
    before: {
      q: "강남역 근처 투룸 있나요?",
      a: "강남역 근처 매물을 확인해 보겠습니다.",
    },
    after: {
      q: "강남역 근처 투룸 있나요?",
      a: "강남역 도보 5분 투룸 3건 있어요! 월세 80/60 (24평, 신축), 전세 3.2억 (22평) 등. 사진과 함께 보내드릴까요?",
    },
  },
  교육: {
    before: {
      q: "중학교 수학 과외 가능한가요?",
      a: "네, 가능합니다. 자세한 내용은 문의 주세요.",
    },
    after: {
      q: "중학교 수학 과외 가능한가요?",
      a: "중2 수학 전문 선생님 3분 매칭 가능해요! 내신 대비 주 2회 기준 월 32만원부터. 무료 레벨테스트 먼저 받아보실래요? 📚",
    },
  },
  "마케팅/크리에이터": {
    before: {
      q: "인스타 릴스 아이디어 추천해줘",
      a: "트렌디한 콘텐츠를 만들어 보세요.",
    },
    after: {
      q: "인스타 릴스 아이디어 추천해줘",
      a: "최근 팔로워 반응 분석 결과, '비하인드' 콘텐츠가 3.2배 높은 참여율이에요! 이번 주 트렌드 사운드와 함께 제작 과정 릴스는 어때요? 🎬",
    },
  },
  "전문 도메인": {
    before: {
      q: "계약서 검토 부탁드려요",
      a: "계약서 내용을 확인하겠습니다.",
    },
    after: {
      q: "계약서 검토 부탁드려요",
      a: "계약서 3페이지 위약금 조항에서 수정이 필요해 보여요. 업계 표준 대비 2배 높은 위약금이 설정되어 있습니다. 수정 제안서를 작성해 드릴까요?",
    },
  },
};

function ChatBubble({
  role,
  text,
  variant,
}: {
  role: "user" | "ai";
  text: string;
  variant: "before" | "after";
}) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-muted text-muted-foreground"
            : variant === "before"
              ? "bg-red-100 text-red-500"
              : "bg-emerald-100 text-emerald-600"
        }`}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div
        className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
          isUser
            ? "bg-muted text-foreground"
            : variant === "before"
              ? "bg-red-50 text-red-800 ring-1 ring-red-200"
              : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

export function BeforeAfterPreview() {
  const industry = useOnboardingStore((s) => s.industry);
  const example =
    industryExamples[industry] ?? industryExamples["카페/음식점"];

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Before */}
      <Card className="border-red-200 bg-red-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-red-600">
            Before (기본 AI)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <ChatBubble role="user" text={example.before.q} variant="before" />
          <ChatBubble role="ai" text={example.before.a} variant="before" />
        </CardContent>
      </Card>

      {/* After */}
      <Card className="border-emerald-200 bg-emerald-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-emerald-600">
            After (학습된 AI)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <ChatBubble role="user" text={example.after.q} variant="after" />
          <ChatBubble role="ai" text={example.after.a} variant="after" />
        </CardContent>
      </Card>
    </div>
  );
}
