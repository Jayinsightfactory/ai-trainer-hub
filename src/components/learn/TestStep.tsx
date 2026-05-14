"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Lightbulb,
  Send,
  Bot,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLearnStore } from "@/store/learn";
import { generateTestConversations } from "@/lib/learning-data";

type LiveMsg = { role: "user" | "ai"; text: string };

export default function TestStep() {
  const {
    businessName,
    tone,
    knowledgeItems,
    testResults,
    setTestResults,
    setFeedback,
    qualityScore,
    learningLevel,
  } = useLearnStore();

  // ── 실시간 AI 채팅 상태 ────────────────────────────────────
  const [liveInput, setLiveInput] = useState("");
  const [liveMsgs, setLiveMsgs] = useState<LiveMsg[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveMsgs]);

  async function sendLiveMessage() {
    const q = liveInput.trim();
    if (!q || liveLoading) return;
    setLiveInput("");
    setLiveError(null);
    setLiveMsgs((prev) => [...prev, { role: "user", text: q }]);
    setLiveLoading(true);

    // 학습된 지식으로 시스템 프롬프트 구성
    const knowledge = knowledgeItems
      .filter((k) => k.value?.trim())
      .map((k) => `[${k.label}]\n${k.value}`)
      .join("\n\n");

    const systemPrompt = `당신은 ${businessName || "매장"}의 AI 직원입니다. ${tone || "친절하게"} 응대합니다.\n\n아래 학습된 정보를 바탕으로 답변하세요:\n\n${knowledge || "아직 학습된 정보가 없습니다."}`;

    // Ollama 로컬 모델 우선 시도 (외부 API 비용 없음)
    try {
      const ollamaRes = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: "gemma3:12b",
          prompt: `${systemPrompt}\n\n고객: ${q}\nAI:`,
          stream: false,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (ollamaRes.ok) {
        const data = await ollamaRes.json();
        const answer = data.response?.trim() || "응답을 받지 못했습니다.";
        setLiveMsgs((prev) => [...prev, { role: "ai", text: answer }]);
        setLiveLoading(false);
        return;
      }
    } catch {
      // Ollama 없으면 플랫폼 API로 폴백
    }

    // 플랫폼 API 폴백
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: q }],
          context: { businessName, systemPromptOverride: systemPrompt },
        }),
      });

      if (res.status === 402) {
        setLiveError("크레딧이 부족합니다. /credits 페이지에서 충전해주세요.");
        setLiveMsgs((prev) => prev.slice(0, -1));
        setLiveLoading(false);
        return;
      }

      // 스트리밍 응답 읽기
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let aiText = "";
      setLiveMsgs((prev) => [...prev, { role: "ai", text: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        aiText += decoder.decode(value, { stream: true });
        setLiveMsgs((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "ai", text: aiText };
          return copy;
        });
      }
    } catch (e) {
      setLiveError("AI 응답 중 오류가 발생했습니다. Ollama 실행 여부를 확인해주세요.");
      setLiveMsgs((prev) => prev.slice(0, -1));
    } finally {
      setLiveLoading(false);
    }
  }

  // Generate test conversations based on current learning state
  useEffect(() => {
    const conversations = generateTestConversations(
      "cafe",
      businessName,
      tone,
      knowledgeItems
    );
    setTestResults(
      conversations.map((c) => ({
        question: c.question,
        beforeAnswer: c.beforeAnswer,
        afterAnswer: c.afterAnswer,
        feedback: null,
      }))
    );
  }, [businessName, tone, knowledgeItems, setTestResults]);

  const feedbackCount = testResults.filter((r) => r.feedback !== null).length;
  const positiveCount = testResults.filter((r) => r.feedback === "up").length;

  return (
    <div className="space-y-6">
      {/* Research Insight */}
      <div className="flex items-start gap-3 rounded-lg bg-purple-50 p-4">
        <Lightbulb className="size-5 text-purple-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-purple-700">피드백이 AI를 진화시킵니다</p>
          <p className="text-xs text-purple-600 mt-1">
            InstructGPT: 1.3B 모델이 사람 피드백으로 175B 모델을 능가.
            아래 답변에 피드백을 주면 AI가 더 정확해집니다.
          </p>
        </div>
      </div>

      {/* Score Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <div className="text-xl font-extrabold text-indigo-600">{qualityScore}</div>
          <div className="text-[10px] text-gray-500">품질 점수</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xl font-extrabold text-emerald-600">Lv.{learningLevel}</div>
          <div className="text-[10px] text-gray-500">학습 레벨</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xl font-extrabold text-amber-600">
            {feedbackCount}/{testResults.length}
          </div>
          <div className="text-[10px] text-gray-500">테스트 완료</div>
        </Card>
      </div>

      {/* Test Conversations */}
      <div>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <MessageCircle className="size-4 text-indigo-500" />
          학습 전 vs 학습 후 비교
        </h3>

        <div className="space-y-4">
          {testResults.map((result, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="overflow-hidden">
                {/* Question */}
                <div className="bg-gray-50 px-4 py-2 border-b flex items-center gap-2">
                  <span className="text-sm">💬</span>
                  <span className="text-sm font-medium">고객: &quot;{result.question}&quot;</span>
                </div>

                {/* Before / After */}
                <div className="grid grid-cols-2 divide-x">
                  <div className="p-3">
                    <Badge variant="outline" className="text-[9px] mb-2 text-red-500 border-red-200">
                      학습 전
                    </Badge>
                    <p className="text-xs text-gray-500 leading-relaxed">{result.beforeAnswer}</p>
                  </div>
                  <div className="p-3 bg-emerald-50/30">
                    <Badge variant="outline" className="text-[9px] mb-2 text-emerald-600 border-emerald-200">
                      학습 후
                    </Badge>
                    <p className="text-xs text-gray-700 leading-relaxed">{result.afterAnswer}</p>
                  </div>
                </div>

                {/* Feedback */}
                <div className="border-t px-4 py-2 flex items-center justify-between bg-gray-50">
                  <span className="text-[11px] text-gray-500">이 답변이 맞나요?</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={result.feedback === "up" ? "default" : "outline"}
                      className={`h-7 px-2 text-xs gap-1 ${
                        result.feedback === "up" ? "bg-emerald-500 hover:bg-emerald-600" : ""
                      }`}
                      onClick={() => setFeedback(i, "up")}
                    >
                      <ThumbsUp className="size-3" /> 정확해요
                    </Button>
                    <Button
                      size="sm"
                      variant={result.feedback === "down" ? "default" : "outline"}
                      className={`h-7 px-2 text-xs gap-1 ${
                        result.feedback === "down" ? "bg-red-500 hover:bg-red-600" : ""
                      }`}
                      onClick={() => setFeedback(i, "down")}
                    >
                      <ThumbsDown className="size-3" /> 수정 필요
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feedback Summary */}
      {feedbackCount > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Progress
              value={(positiveCount / Math.max(feedbackCount, 1)) * 100}
              className="flex-1 h-3 [&>div]:bg-emerald-500"
            />
            <span className="text-sm font-bold text-emerald-600">
              {Math.round((positiveCount / Math.max(feedbackCount, 1)) * 100)}% 정확
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            {positiveCount >= 3
              ? "학습이 잘 되었습니다! 다음 단계로 진행하세요."
              : "수정이 필요한 답변이 있으면 '지식 입력'으로 돌아가 데이터를 보강하세요."}
          </p>
        </Card>
      )}

      {/* ── 실시간 AI 직접 테스트 ── */}
      <div>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Bot className="size-4 text-indigo-500" />
          직접 질문해보기
          <span className="text-[10px] font-normal text-gray-400 ml-1">
            (Ollama 로컬 우선 → 플랫폼 API 폴백)
          </span>
        </h3>

        <Card className="flex flex-col h-64">
          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {liveMsgs.length === 0 && (
              <p className="text-xs text-gray-400 text-center mt-6">
                고객 입장에서 질문을 입력하면 학습된 AI가 응답합니다
              </p>
            )}
            {liveMsgs.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {m.text || <span className="animate-pulse">▋</span>}
                </div>
              </div>
            ))}
            {liveLoading && liveMsgs[liveMsgs.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-xl px-3 py-2 text-xs text-gray-500 animate-pulse">
                  AI가 응답 중...
                </div>
              </div>
            )}
            {liveError && (
              <p className="text-xs text-red-500 text-center">{liveError}</p>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* 입력창 */}
          <div className="border-t p-2 flex gap-2">
            <input
              type="text"
              value={liveInput}
              onChange={(e) => setLiveInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendLiveMessage()}
              placeholder="예: 영업시간이 어떻게 되나요?"
              className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              disabled={liveLoading}
            />
            <Button
              size="sm"
              onClick={sendLiveMessage}
              disabled={!liveInput.trim() || liveLoading}
              className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700"
            >
              <Send className="size-3" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
