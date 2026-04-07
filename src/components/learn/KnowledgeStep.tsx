"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  ChevronDown,
  CheckCircle,
  Circle,
  Lightbulb,
  Brain,
  Loader2,
  ImagePlus,
  X,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useLearnStore, type KnowledgeItem } from "@/store/learn";
import { RESEARCH_FACTS, ACCURACY_BENCHMARKS } from "@/lib/learning-data";
import Image from "next/image";

export default function KnowledgeStep() {
  const { knowledgeItems, updateKnowledgeItem, qualityScore, filledCount } = useLearnStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [learningItemId, setLearningItemId] = useState<string | null>(null);

  const requiredItems = knowledgeItems.filter((i) => i.required);
  const optionalItems = knowledgeItems.filter((i) => !i.required);
  const requiredFilled = requiredItems.filter((i) => i.filled).length;

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
                className={`text-center ${val.accuracy <= currentAccuracy.accuracy ? "text-indigo-600" : "text-gray-300"}`}
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
              fill="none" stroke="#e5e7eb" strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="#6366f1" strokeWidth="3"
              strokeDasharray={`${qualityScore}, 100`} strokeLinecap="round"
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

/* ─────────────────────────────────────────────────────────── */
/*  이미지 업로드 컴포넌트                                        */
/* ─────────────────────────────────────────────────────────── */
function ImageUploader({ item }: { item: KnowledgeItem }) {
  const { updateKnowledgeImages } = useLearnStore();
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const images = item.imageUrls || [];

  const processFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const url = URL.createObjectURL(file);
        newUrls.push(url);
      }

      if (newUrls.length === 0) return;

      const merged = [...images, ...newUrls].slice(0, 20); // 최대 20장
      updateKnowledgeImages(item.id, merged);

      // 업로드 후 잠깐 분석 중 표시
      setAnalyzing(true);
      setTimeout(() => setAnalyzing(false), 1800);
    },
    [images, item.id, updateKnowledgeImages]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const removeImage = (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    updateKnowledgeImages(item.id, next);
  };

  return (
    <div className="space-y-3">
      {/* 드롭존 */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
          ${dragging
            ? "border-indigo-500 bg-indigo-50"
            : images.length > 0
              ? "border-emerald-300 bg-emerald-50/40"
              : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"
          }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
        <ImagePlus className={`size-8 mx-auto mb-2 ${images.length > 0 ? "text-emerald-500" : "text-gray-300"}`} />
        <p className="text-sm font-medium text-gray-600">
          {images.length > 0 ? `${images.length}장 업로드됨 · 더 추가하기` : "이미지를 끌어다 놓거나 클릭하여 업로드"}
        </p>
        <p className="text-[11px] text-gray-400 mt-1">JPG, PNG, WebP · 최대 20장</p>
      </div>

      {/* 분석 중 표시 */}
      {analyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 rounded-lg bg-indigo-50 p-3"
        >
          <Loader2 className="size-4 text-indigo-500 animate-spin" />
          <div>
            <p className="text-xs font-semibold text-indigo-600">이미지 분석 중...</p>
            <p className="text-[10px] text-indigo-400">특징을 추출하고 있습니다</p>
          </div>
          <Brain className="size-4 text-indigo-400 ml-auto animate-pulse" />
        </motion.div>
      )}

      {/* 이미지 그리드 */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={url}
                alt={`학습 이미지 ${i + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              <button
                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="size-2.5" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[8px] text-center py-0.5">
                #{i + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length >= 4 && !analyzing && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2">
          <CheckCircle className="size-4 text-emerald-500" />
          <p className="text-xs text-emerald-600">
            {images.length}장 학습 완료! 더 많은 이미지일수록 정확도가 높아집니다.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  지식 아이템 카드                                             */
/* ─────────────────────────────────────────────────────────── */
function KnowledgeItemCard({
  item,
  expanded,
  learning,
  onToggle,
  onChange,
}: {
  item: KnowledgeItem;
  expanded: boolean;
  learning: boolean;
  onToggle: () => void;
  onChange: (id: string, value: string) => void;
}) {
  const isImageType = item.type === "image";
  const hasImages = (item.imageUrls?.length ?? 0) > 0;
  const isFilled = item.filled;

  return (
    <div
      className={`rounded-lg border transition-all ${
        isFilled
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
        {isFilled ? (
          <CheckCircle className="size-5 text-emerald-500 shrink-0" />
        ) : (
          <Circle className="size-5 text-gray-300 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium truncate">{item.label}</span>
            {item.required && (
              <Badge variant="destructive" className="text-[8px] px-1 py-0">필수</Badge>
            )}
            {isImageType && (
              <Badge className="bg-purple-100 text-purple-700 border-0 text-[8px] px-1 py-0 flex items-center gap-0.5">
                <ImagePlus className="size-2.5" /> 이미지
              </Badge>
            )}
          </div>
          {!expanded && isFilled && (
            <p className="text-[10px] text-emerald-600 truncate mt-0.5">
              {isImageType
                ? `✓ 이미지 ${item.imageUrls?.length}장 학습 완료`
                : `✓ ${item.value.slice(0, 40)}...`}
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

              {/* 입력 UI: 이미지 or 텍스트 */}
              {isImageType ? (
                <ImageUploader item={item} />
              ) : (
                <>
                  <Textarea
                    placeholder={`${item.label} 데이터를 입력하세요...`}
                    value={item.value}
                    onChange={(e) => onChange(item.id, e.target.value)}
                    rows={3}
                    className="text-xs"
                  />

                  {/* 파일 업로드 보조 (텍스트 타입에서도 파일 첨부 가능) */}
                  <label className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 cursor-pointer w-fit">
                    <FileText className="size-3.5" />
                    <span>파일로 업로드 (txt, pdf, csv)</span>
                    <input
                      type="file"
                      accept=".txt,.pdf,.csv,.doc,.docx"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const text = await file.text().catch(() => "");
                        if (text) onChange(item.id, text.slice(0, 5000));
                      }}
                    />
                  </label>
                </>
              )}

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

              {isFilled && !learning && !isImageType && (
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
