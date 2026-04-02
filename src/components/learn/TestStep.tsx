"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Lightbulb,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLearnStore } from "@/store/learn";
import { generateTestConversations } from "@/lib/learning-data";

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
    </div>
  );
}
