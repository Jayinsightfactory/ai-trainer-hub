"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  ChevronDown,
  CheckCircle,
  Circle,
  Lightbulb,
  Brain,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useLearnStore } from "@/store/learn";
import { RESEARCH_FACTS, ACCURACY_BENCHMARKS } from "@/lib/learning-data";

export default function KnowledgeStep() {
  const { knowledgeItems, updateKnowledgeItem, qualityScore, filledCount } = useLearnStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [learningItemId, setLearningItemId] = useState<string | null>(null);

  const requiredItems = knowledgeItems.filter((i) => i.required);
  const optionalItems = knowledgeItems.filter((i) => !i.required);
  const requiredFilled = requiredItems.filter((i) => i.filled).length;

  // Determine current accuracy level
  const currentAccuracy =
    filledCount === 0
      ? ACCURACY_BENCHMARKS.systemPrompt
      : filledCount <= 2
        ? ACCURACY_BENCHMARKS.fewShot
        : filledCount <= 4
          ? ACCURACY_BENCHMARKS.knowledge
          : ACCURACY_BENCHMARKS.knowledgeRag;

  const handleInputChange = useCallback(
    (id: string, value: string) => {
      updateKnowledgeItem(id, value);
      if (value.trim().length > 0) {
        setLearningItemId(id);
        setTimeout(() => setLearningItemId(null), 1500);
      }
    },
    [updateKnowledgeItem]
  );

  return (
    <div className="space-y-6">
      {/* Research Insight */}
      <div className="flex items-start gap-3 rounded-lg bg-emerald-50 p-4">
        <Lightbulb className="size-5 text-emerald-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-700">데이터 품질이 곧 AI 품질</p>
          <p className="text-xs text-emerald-600 mt-1">{RESEARCH_FACTS.dataQuality.fact}</p>
          <p className="text-[10px] text-emerald-400 mt-1">— {RESEARCH_FACTS.dataQuality.source}</p>
        </div>
      </div>

      {/* Accuracy Meter */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">예상 정확도</span>
          <span className="text-lg font-extrabold text-indigo-600">{currentAccuracy.accuracy}%</span>
        </div>
        <Progress value={currentAccuracy.accuracy} className="h-3 [&>div]:bg-indigo-500" />
        <div className="flex justify-between mt-2">
          {Object.entries(ACCURACY_BENCHMARKS)
            .filter(([k]) => k !== "none" && k !== "fineTuning" && k !== "fullPipeline")
            .map(([key, val]) => (
              <div
                key={key}
                className={`text-center ${
                  val.accuracy <= currentAccuracy.accuracy
                    ? "text-indigo-600"
                    : "text-gray-300"
                }`}
              >
                <div className="text-[9px] font-bold">{val.accuracy}%</div>
                <div className="text-[8px]">{val.label}</div>
              </div>
            ))}
        </div>
        <div className="mt-3 rounded bg-gray-50 p-2">
          <p className="text-[10px] text-gray-500">
            현재: <strong>{currentAccuracy.label}</strong> — {currentAccuracy.desc}.
            {filledCount < knowledgeItems.length && " 지식을 더 추가하면 정확도가 올라갑니다."}
          </p>
        </div>
      </Card>

      {/* Quality Score */}
      <div className="flex items-center gap-4 rounded-lg border p-4">
        <div className="relative size-16">
          <svg viewBox="0 0 36 36" className="size-16 -rotate-90">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#6366f1"
              strokeWidth="3"
              strokeDasharray={`${qualityScore}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-indigo-600">
            {qualityScore}
          </span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">학습 품질 점수</p>
          <p className="text-xs text-gray-500">
            필수 {requiredFilled}/{requiredItems.length}개 완료 · 선택 {filledCount - requiredFilled}개 추가
          </p>
        </div>
      </div>

      {/* Required Items */}
      <div>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Upload className="size-4 text-red-500" />
          필수 데이터
          <Badge variant="destructive" className="text-[9px]">
            {requiredFilled}/{requiredItems.length}
          </Badge>
        </h3>
        <div className="space-y-2">
          {requiredItems.map((item) => (
            <KnowledgeItemCard
              key={item.id}
              item={item}
              expanded={expandedId === item.id}
              learning={learningItemId === item.id}
              onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
              onChange={handleInputChange}
            />
          ))}
        </div>
      </div>

      {/* Optional Items */}
      {optionalItems.length > 0 && (
        <div>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Upload className="size-4 text-blue-500" />
            선택 데이터
            <Badge variant="secondary" className="text-[9px]">추가하면 정확도 UP</Badge>
          </h3>
          <div className="space-y-2">
            {optionalItems.map((item) => (
              <KnowledgeItemCard
                key={item.id}
                item={item}
                expanded={expandedId === item.id}
                learning={learningItemId === item.id}
                onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                onChange={handleInputChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
function KnowledgeItemCard({
  item,
  expanded,
  learning,
  onToggle,
  onChange,
}: {
  item: { id: string; label: string; required: boolean; effectBefore: string; effectAfter: string; value: string; filled: boolean };
  expanded: boolean;
  learning: boolean;
  onToggle: () => void;
  onChange: (id: string, value: string) => void;
}) {
  return (
    <div
      className={`rounded-lg border transition-all ${
        item.filled
          ? "border-emerald-200 bg-emerald-50/50"
          : expanded
            ? "border-indigo-200 bg-white"
            : "border-gray-200 bg-white"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        {item.filled ? (
          <CheckCircle className="size-5 text-emerald-500 shrink-0" />
        ) : (
          <Circle className="size-5 text-gray-300 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{item.label}</span>
            {item.required && (
              <Badge variant="destructive" className="text-[8px] px-1 py-0">필수</Badge>
            )}
          </div>
          {!expanded && item.filled && (
            <p className="text-[10px] text-emerald-600 truncate mt-0.5">
              학습 완료 — {item.value.slice(0, 40)}...
            </p>
          )}
        </div>
        <ChevronDown
          className={`size-4 text-gray-400 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3">
              {/* Before/After Preview */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded bg-red-50 p-2">
                  <span className="text-[9px] font-bold text-red-400 uppercase">Before</span>
                  <p className="text-[10px] text-gray-600 mt-1">{item.effectBefore}</p>
                </div>
                <div className="rounded bg-emerald-50 p-2">
                  <span className="text-[9px] font-bold text-emerald-500 uppercase">After</span>
                  <p className="text-[10px] text-gray-600 mt-1">{item.effectAfter}</p>
                </div>
              </div>

              {/* Input */}
              <Textarea
                placeholder={`${item.label} 데이터를 입력하세요...`}
                value={item.value}
                onChange={(e) => onChange(item.id, e.target.value)}
                rows={3}
                className="text-xs"
              />

              {/* Learning Animation */}
              {learning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 rounded bg-indigo-50 p-2"
                >
                  <Loader2 className="size-4 text-indigo-500 animate-spin" />
                  <div>
                    <p className="text-xs font-semibold text-indigo-600">AI가 학습 중...</p>
                    <p className="text-[10px] text-indigo-400">데이터를 분석하고 있습니다</p>
                  </div>
                  <Brain className="size-4 text-indigo-400 ml-auto animate-pulse" />
                </motion.div>
              )}

              {item.filled && !learning && (
                <div className="flex items-center gap-2 rounded bg-emerald-50 p-2">
                  <CheckCircle className="size-4 text-emerald-500" />
                  <p className="text-xs text-emerald-600">학습 완료! 오른쪽 미리보기에서 변화를 확인하세요.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
