"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Brain, Loader2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useLearnStore } from "@/store/learn";
import { generateTestConversations, ACCURACY_BENCHMARKS } from "@/lib/learning-data";

export default function LivePreview() {
  const {
    businessName,
    tone,
    knowledgeItems,
    qualityScore,
    learningLevel,
    filledCount,
  } = useLearnStore();

  const [messages, setMessages] = useState<
    { role: "user" | "ai" | "system"; text: string }[]
  >([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const name = businessName || "매장";

  // Determine accuracy level
  const currentAccuracy =
    filledCount === 0
      ? ACCURACY_BENCHMARKS.systemPrompt
      : filledCount <= 2
        ? ACCURACY_BENCHMARKS.fewShot
        : filledCount <= 4
          ? ACCURACY_BENCHMARKS.knowledge
          : ACCURACY_BENCHMARKS.knowledgeRag;

  // Auto-update preview when settings change
  const previewConversation = useMemo(() => {
    const conversations = generateTestConversations("cafe", businessName, tone, knowledgeItems);
    return conversations.length > 0 ? conversations[0] : null;
  }, [businessName, tone, knowledgeItems]);

  useEffect(() => {
    if (previewConversation) {
      const timer = setTimeout(() => {
        setMessages([
          { role: "user", text: previewConversation.question },
          { role: "ai", text: previewConversation.afterAnswer },
        ]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [previewConversation]);

  // Scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!userInput.trim()) return;
    const question = userInput.trim();
    setUserInput("");
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setIsTyping(true);

    // Generate response based on available knowledge
    setTimeout(() => {
      const conversations = generateTestConversations(
        "cafe",
        businessName,
        tone,
        knowledgeItems
      );
      const match = conversations.find((c) =>
        question.includes(c.question.slice(0, 4))
      );
      const response = match
        ? match.afterAnswer
        : `${name}에 대한 답변입니다. 더 정확한 답변을 위해 관련 데이터를 '지식 입력'에서 추가해주세요.`;

      setIsTyping(false);
      setMessages((prev) => [...prev, { role: "ai", text: response }]);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="size-5 text-indigo-600" />
          <div>
            <p className="text-sm font-bold">실시간 미리보기</p>
            <p className="text-[10px] text-gray-400">설정이 바뀌면 자동 업데이트</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-md bg-white p-2 text-center border">
            <div className="text-xs font-bold text-indigo-600">{currentAccuracy.accuracy}%</div>
            <div className="text-[8px] text-gray-400">정확도</div>
          </div>
          <div className="rounded-md bg-white p-2 text-center border">
            <div className="text-xs font-bold text-purple-600">Lv.{learningLevel}</div>
            <div className="text-[8px] text-gray-400">레벨</div>
          </div>
          <div className="rounded-md bg-white p-2 text-center border">
            <div className="text-xs font-bold text-emerald-600">{qualityScore}</div>
            <div className="text-[8px] text-gray-400">품질</div>
          </div>
        </div>

        <Progress
          value={currentAccuracy.accuracy}
          className="mt-2 h-1.5 [&>div]:bg-indigo-500"
        />
      </div>

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* System message */}
        <div className="text-center">
          <Badge variant="secondary" className="text-[9px]">
            {name}의 AI 어시스턴트 · {tone}
          </Badge>
        </div>

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "ai" && (
              <div className="flex items-start">
                <div className="size-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <Bot className="size-4 text-indigo-600" />
                </div>
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-700 rounded-bl-sm"
              }`}
            >
              <p className="text-xs leading-relaxed whitespace-pre-line">{msg.text}</p>
            </div>
            {msg.role === "user" && (
              <div className="size-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                <User className="size-4 text-gray-500" />
              </div>
            )}
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="size-7 rounded-full bg-indigo-100 flex items-center justify-center">
                <Brain className="size-4 text-indigo-600 animate-pulse" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-1">
                <Loader2 className="size-3 text-gray-400 animate-spin" />
                <span className="text-xs text-gray-400">학습된 AI가 답변 중...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="질문을 입력해서 테스트..."
            className="text-xs h-9"
          />
          <button
            type="submit"
            className="size-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors shrink-0"
          >
            <Send className="size-4" />
          </button>
        </form>
        <p className="text-[9px] text-gray-400 text-center mt-1">
          입력한 지식을 기반으로 답변합니다
        </p>
      </div>
    </div>
  );
}
