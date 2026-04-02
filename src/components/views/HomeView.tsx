"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  ShoppingBag,
  GraduationCap,
  Building2,
  Stethoscope,
  Code,
  Bot,
  User,
  Send,
  Pencil,
  ArrowRight,
  Sparkles,
  Brain,
  Loader2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/*  사례별 데모 데이터                                                   */
/* ------------------------------------------------------------------ */
interface DemoCase {
  id: string;
  icon: React.ElementType;
  label: string;
  businessName: string;
  tone: string;
  fields: { key: string; label: string; value: string }[];
  conversations: { question: string; before: string; after: string }[];
}

const DEMO_CASES: DemoCase[] = [
  {
    id: "cafe",
    icon: Coffee,
    label: "카페",
    businessName: "소울브루 커피",
    tone: "친근한 존댓말",
    fields: [
      {
        key: "menu",
        label: "메뉴 데이터",
        value: `☕ 시그니처 라떼 — 6,000원
→ 매일 아침 로스팅한 콜롬비아 수프리모 원두, 수제 바닐라시럽
☕ 아메리카노 — 4,500원 (에스프레소 2샷)
☕ 콜드브루 — 5,000원 (24시간 저온 추출)
🧁 수제 마들렌 — 3,500원 (에시레 버터, 매일 오전 11시 갓 구움)
🎉 라떼+마들렌 세트 8,500원 (1,000원 할인)`,
      },
      {
        key: "tone",
        label: "말투 스타일",
        value: `이모지 적절히 사용, "~해요" 체, 따뜻하고 편안한 카페 톤
추천할 때는 이유를 꼭 설명 (왜 맛있는지, 어떤 재료인지)
대안도 함께 제시 ("이게 싫으시다면 이것도 좋아요")`,
      },
      {
        key: "info",
        label: "매장 정보",
        value: `📍 서울 마포구 연남로 27길 15, 2층
⏰ 월~금 08-22시 / 토 09-22시 / 일 10-21시
🚗 건물 뒤 3대 (1시간 무료)
📶 와이파이: soulbrew_5G / coffee2024
🐕 소형견 동반 가능 (리드줄 필수)`,
      },
    ],
    conversations: [
      {
        question: "메뉴 추천해주세요",
        before: "저희 매장에는 다양한 메뉴가 준비되어 있습니다. 매장에 방문하시면 확인하실 수 있습니다.",
        after: `소울브루 커피 메뉴 추천드릴게요! 😊

저희 시그니처 라떼가 제일 인기예요 — 매일 아침 로스팅한 콜롬비아 수프리모 원두에 수제 바닐라시럽을 넣어서, 다른 데서는 못 드시는 깊은 풍미가 있거든요.

달달한 거 좋아하시면 바닐라라떼 추천! 마다가스카르산 바닐라빈으로 직접 만든 시럽이라 기성품이랑 맛이 완전 달라요 ✨

커피를 못 드시면 자몽에이드도 좋아요 — 생자몽 직접 짜서 만들고, 탄산 세기도 조절 가능합니다.

시그니처 라떼 + 수제 마들렌 세트가 8,500원(1,000원 할인)이라 같이 드시면 가성비 최고예요! 🧁`,
      },
      {
        question: "주차 가능한가요?",
        before: "주차 관련 정보는 매장에 직접 문의해주세요.",
        after: `네, 주차 가능합니다! 🚗

건물 뒤편에 주차장이 있고, 소울브루 이용 시 1시간 무료 주차예요.
카운터에서 차량번호만 말씀해주시면 등록해드릴게요.

주말 점심에는 만차일 수 있어서, 연남동 공영주차장(도보 3분)도 괜찮아요.
대중교통으로는 홍대입구역 3번 출구에서 도보 8분이에요! 🚶`,
      },
      {
        question: "비건 메뉴 있어요?",
        before: "비건 메뉴에 대해서는 잘 모르겠습니다. 매장에 문의해주세요.",
        after: `비건으로 드실 수 있는 메뉴 안내드릴게요! 🌱

☕ 음료
• 오트밀크 라떼 — 바리스타 오트밀크 사용, 거품도 잘 나요!
• 아메리카노 / 콜드브루 — 당연히 비건이죠 😄
• 자몽에이드 — 생과일이라 안심하세요

현재 비건 디저트는 준비 중인데, 알러지 있으시면 미리 말씀해주시면 확인해드릴게요!`,
      },
    ],
  },
  {
    id: "shopping",
    icon: ShoppingBag,
    label: "쇼핑몰",
    businessName: "트렌드샵",
    tone: "정중한 존댓말",
    fields: [
      {
        key: "policy",
        label: "환불/교환 정책",
        value: `수령 후 7일 이내 미개봉 → 전액 환불
개봉 후 7일 이내 → 교환만 가능 (불량 제외)
불량품 → 수령 후 30일 이내 전액 환불 + 무료 반품
배송비: 무료 (3만원 이상), 반품 배송비 3,000원`,
      },
      {
        key: "tone",
        label: "응대 톤",
        value: `정중하되 딱딱하지 않게, 주문번호 먼저 확인
법적 문구("100% 보장") 사용 금지
3회 이상 불만 → 담당자 연결`,
      },
      {
        key: "products",
        label: "인기 상품",
        value: `1. 오버핏 린넨셔츠 — 39,000원 (S/M/L/XL, 화이트/베이지/네이비)
2. 와이드 데님팬츠 — 49,000원 (26~34사이즈)
3. 캔버스 토트백 — 25,000원 (에코백 대체, 내부 포켓 3개)`,
      },
    ],
    conversations: [
      {
        question: "이거 환불 가능한가요?",
        before: "환불 관련 문의는 고객센터에 연락해주세요.",
        after: `환불 도와드릴게요! 📦

주문번호 알려주시면 바로 확인해드리겠습니다.

기본 규정 안내드리면:
• 미개봉 상태 + 수령 7일 이내 → 전액 환불 가능
• 개봉 후 7일 이내 → 교환 가능 (불량 제외)
• 불량품이라면 30일 이내 전액 환불 + 반품비 무료예요

혹시 상품에 문제가 있으셨나요? 자세히 말씀해주시면 빠르게 처리해드리겠습니다 🙏`,
      },
      {
        question: "린넨셔츠 M이랑 L 차이가 어때요?",
        before: "사이즈 관련 정보는 상품 페이지를 확인해주세요.",
        after: `오버핏 린넨셔츠 사이즈 비교해드릴게요! 👕

M: 어깨 52cm / 가슴 118cm / 총장 72cm
L: 어깨 54cm / 가슴 122cm / 총장 74cm

이 셔츠가 오버핏이라 평소 M 입으시는 분은 M으로도 넉넉해요.
키 175cm 이상이시면 L 추천드리고, 170cm 이하시면 M이 예쁘게 떨어져요.

혹시 평소 입으시는 사이즈 알려주시면 더 정확하게 추천드릴게요! 😊`,
      },
    ],
  },
  {
    id: "academy",
    icon: GraduationCap,
    label: "학원",
    businessName: "브라이트 영어학원",
    tone: "전문적이면서 따뜻한",
    fields: [
      {
        key: "curriculum",
        label: "커리큘럼",
        value: `레벨1 (파닉스): 알파벳→기초 발음, 주 3회 40분
레벨2 (기초회화): 일상 대화, 원어민 선생님, 주 3회 50분
레벨3 (중급): 토론+프레젠테이션, 주 2회 60분
레벨테스트: 무료, 15분, 결과 즉시 안내`,
      },
      {
        key: "tone",
        label: "상담 원칙",
        value: `학부모 불안감 공감 우선, 과장 금지
등록 강요 X → 정보 제공 후 자연스러운 안내
아이 수준에 맞는 반 추천 (무리한 레벨업 금지)`,
      },
    ],
    conversations: [
      {
        question: "7살 아이인데 영어 시작하려고요",
        before: "저희 학원에 다양한 프로그램이 있습니다. 방문 상담 예약해주세요.",
        after: `7살이면 딱 영어 시작하기 좋은 시기예요! 😊

이 나이대는 파닉스(알파벳 소리 규칙)부터 시작하는 게 가장 효과적이에요. 저희 레벨1반이 딱 맞는데요 —

✅ 레벨1 파닉스반
• 주 3회 (월수금) 오후 3:30, 40분 수업
• 원어민+한국인 선생님 2인 티칭
• 게임/노래 기반이라 아이들이 정말 좋아해요

무료 레벨테스트(15분)를 먼저 받아보시면, 아이 수준에 딱 맞는 반을 안내드릴 수 있어요.

이번 주 목/금 오후에 테스트 가능한데, 원하시는 시간 있으세요? 📝`,
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  메인 컴포넌트                                                       */
/* ------------------------------------------------------------------ */
export default function HomeView() {
  const [selectedCase, setSelectedCase] = useState(0);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showBefore, setShowBefore] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);

  const demo = DEMO_CASES[selectedCase];

  // Initialize field values + pre-fill conversations when case changes
  useEffect(() => {
    const vals: Record<string, string> = {};
    demo.fields.forEach((f) => { vals[f.key] = f.value; });
    setFieldValues(vals);
    setShowBefore(true);

    // Pre-fill chat with first 2 conversations
    const prefilled: { role: "user" | "ai"; text: string }[] = [];
    demo.conversations.slice(0, 2).forEach((c) => {
      prefilled.push({ role: "user", text: c.question });
      prefilled.push({ role: "ai", text: c.after });
    });
    setChatMessages(prefilled);
  }, [selectedCase]);

  // Auto-scroll chat
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages, isTyping]);

  // Simulate AI response
  const getAIResponse = useCallback((question: string) => {
    const conv = demo.conversations.find((c) =>
      question.toLowerCase().includes(c.question.slice(0, 4).toLowerCase())
    );
    if (conv) return conv.after;

    const name = demo.businessName;
    const menuData = fieldValues["menu"] || fieldValues["products"] || fieldValues["curriculum"] || "";
    return `${name}에 대해 답변드릴게요! 😊\n\n${menuData.slice(0, 150)}...\n\n더 자세한 내용이 궁금하시면 편하게 물어봐주세요!`;
  }, [demo, fieldValues]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    const q = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: q }]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages((prev) => [...prev, { role: "ai", text: getAIResponse(q) }]);
    }, 800 + Math.random() * 600);
  };

  const handleFieldChange = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  // Auto-demo: show first conversation
  const firstConv = demo.conversations[0];

  return (
    <div className="flex h-full">
      {/* ===== LEFT: 학습 입력 영역 ===== */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">
        {/* Case Selector */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50/50">
          <Sparkles className="size-4 text-indigo-400" />
          <span className="text-xs font-semibold text-gray-700">학습 데모</span>
          <div className="flex gap-1 ml-2">
            {DEMO_CASES.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setSelectedCase(i)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${
                  selectedCase === i
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                <c.icon className="size-3" />
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-500">
            {demo.businessName} · {demo.tone}
          </Badge>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "thin" }}>
          <div className="text-[11px] text-gray-500 mb-1">
            아래 데이터를 수정하면 오른쪽 AI 응답이 즉시 바뀝니다
          </div>

          {demo.fields.map((field) => (
            <div key={field.key} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
              <div
                className="flex items-center justify-between px-3 py-2 bg-gray-100 cursor-pointer"
                onClick={() => setEditingField(editingField === field.key ? null : field.key)}
              >
                <div className="flex items-center gap-2">
                  <Pencil className="size-3 text-indigo-400" />
                  <span className="text-xs font-medium text-gray-700">{field.label}</span>
                </div>
                {editingField === field.key ? (
                  <ChevronUp className="size-3.5 text-gray-500" />
                ) : (
                  <ChevronDown className="size-3.5 text-gray-500" />
                )}
              </div>
              {editingField === field.key ? (
                <textarea
                  value={fieldValues[field.key] || ""}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="w-full bg-white text-xs text-gray-700 p-3 outline-none resize-none font-mono leading-relaxed"
                  rows={8}
                />
              ) : (
                <div className="px-3 py-2 text-[11px] text-gray-500 line-clamp-3 font-mono whitespace-pre-line">
                  {(fieldValues[field.key] || "").slice(0, 120)}...
                </div>
              )}
            </div>
          ))}

          {/* Before/After Toggle */}
          <div className="pt-2">
            <div className="text-[11px] text-gray-500 mb-2">학습 전/후 비교 — "{firstConv.question}"</div>
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setShowBefore(true)}
                className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
                  showBefore ? "bg-red-500/20 text-red-400 font-semibold" : "bg-gray-100 text-gray-500"
                }`}
              >
                학습 전
              </button>
              <button
                onClick={() => setShowBefore(false)}
                className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
                  !showBefore ? "bg-emerald-500/20 text-emerald-400 font-semibold" : "bg-gray-100 text-gray-500"
                }`}
              >
                학습 후
              </button>
            </div>
            <div className={`rounded-lg p-3 text-xs leading-relaxed whitespace-pre-line ${
              showBefore ? "bg-red-500/5 border border-red-500/20 text-gray-500" : "bg-emerald-500/5 border border-emerald-500/20 text-gray-700"
            }`}>
              {showBefore ? firstConv.before : firstConv.after}
            </div>
          </div>

          {/* Quick Questions */}
          <div className="pt-2">
            <div className="text-[11px] text-gray-500 mb-2">질문을 눌러서 바로 테스트</div>
            <div className="flex flex-wrap gap-1.5">
              {demo.conversations.map((c) => (
                <button
                  key={c.question}
                  onClick={() => {
                    setChatMessages((prev) => [...prev, { role: "user", text: c.question }]);
                    setIsTyping(true);
                    setTimeout(() => {
                      setIsTyping(false);
                      setChatMessages((prev) => [...prev, { role: "ai", text: c.after }]);
                    }, 800);
                  }}
                  className="text-[11px] px-2.5 py-1 bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-indigo-600/30 rounded-full transition-colors"
                >
                  {c.question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT: 실시간 미리보기 ===== */}
      <div className="w-[420px] shrink-0 flex flex-col bg-gray-50/30">
        {/* Preview Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-indigo-400" />
            <span className="text-xs font-semibold text-gray-700">실시간 미리보기</span>
          </div>
          <button
            onClick={() => setChatMessages([])}
            className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700"
          >
            <RotateCcw className="size-3" />
            초기화
          </button>
        </div>

        {/* Chat Area */}
        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "thin" }}>
          {/* System badge */}
          <div className="text-center">
            <Badge variant="secondary" className="text-[9px] bg-gray-100 text-gray-500">
              {demo.businessName} AI · {demo.tone}
            </Badge>
          </div>

          {/* Welcome */}
          {chatMessages.length === 0 && (
            <div className="flex gap-2">
              <div className="size-7 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Bot className="size-4 text-indigo-400" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 max-w-[85%]">
                <p className="text-xs text-gray-700 leading-relaxed">
                  안녕하세요! {demo.businessName} AI입니다 😊{"\n"}
                  왼쪽에서 데이터를 수정하거나, 아래에 질문을 입력해보세요!
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
          {chatMessages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "ai" && (
                <div className="size-7 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Bot className="size-4 text-indigo-400" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-700 rounded-bl-sm"
              }`}>
                <p className="text-xs leading-relaxed whitespace-pre-line">{msg.text}</p>
              </div>
              {msg.role === "user" && (
                <div className="size-7 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                  <User className="size-4 text-gray-500" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Typing */}
          <AnimatePresence>
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2">
                <div className="size-7 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Brain className="size-4 text-indigo-400 animate-pulse" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-1.5">
                  <Loader2 className="size-3 text-gray-500 animate-spin" />
                  <span className="text-xs text-gray-500">학습된 AI가 답변 중...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-200">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="직접 질문해보세요..."
              className="flex-1 bg-gray-100 text-xs text-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button type="submit" className="size-8 rounded-lg bg-indigo-600 text-gray-900 flex items-center justify-center hover:bg-indigo-700 shrink-0">
              <Send className="size-3.5" />
            </button>
          </form>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[9px] text-gray-400">왼쪽 데이터를 수정하면 응답이 즉시 바뀝니다</span>
            <button
              onClick={() => { window.location.href = `/learn?template=text-cs-cafe`; }}
              className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300"
            >
              이 템플릿으로 학습 시작 <ArrowRight className="size-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
