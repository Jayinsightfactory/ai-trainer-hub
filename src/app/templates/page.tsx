"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  Image,
  BarChart3,
  Mic,
  Cpu,
  Lock,
  ArrowRight,
  Check,
  X,
  ChevronDown,
  Sparkles,
  Clock,
  Star,
  Palette,
  Video,
  AudioLines,
  Combine,
  Workflow,
  Wrench,
  Smartphone,
  FlaskConical,
  Code,
  Database,
  MessageSquare,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CATALOG,
  type TopCategory,
  type SubCategory,
  type LearnTemplate,
  type LearningMethod,
  searchTemplates,
  getTotalTemplateCount,
  getFreeTemplates,
} from "@/lib/template-catalog";

/* ------------------------------------------------------------------ */
/*  Icon Map                                                           */
/* ------------------------------------------------------------------ */
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "text-learning": FileText,
  "image-learning": Image,
  "data-learning": BarChart3,
  "audio-learning": Mic,
  "action-learning": Cpu,
  "image-gen-learning": Palette,
  "video-learning": Video,
  "voice-clone-learning": AudioLines,
  "multimodal-learning": Combine,
  "agent-learning": Workflow,
  "rag-learning": Database,
  "finetune-learning": Wrench,
  "edge-learning": Smartphone,
  "synthetic-learning": FlaskConical,
  "code-learning": Code,
};

const TIER_CONFIG = {
  free: { label: "무료", color: "bg-emerald-100 text-emerald-700", icon: Check },
  starter: { label: "스타터", color: "bg-blue-100 text-blue-700", icon: Star },
  pro: { label: "프로", color: "bg-purple-100 text-purple-700", icon: Sparkles },
};

const DIFFICULTY_CONFIG = {
  beginner: { label: "초급", color: "text-emerald-600" },
  intermediate: { label: "중급", color: "text-amber-600" },
  advanced: { label: "고급", color: "text-red-600" },
};

type TierFilter = "all" | "free" | "starter" | "pro";
type DiffFilter = "all" | "beginner" | "intermediate" | "advanced";

/* ------------------------------------------------------------------ */
/*  Template Detail Modal                                              */
/* ------------------------------------------------------------------ */
const DIFFICULTY_BADGE: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-red-100 text-red-700",
};

const TAG_COLOR: Record<string, string> = {
  "모방학습": "bg-indigo-100 text-indigo-700",
  "강화학습": "bg-orange-100 text-orange-700",
  "파운데이션 모델 파인튜닝": "bg-purple-100 text-purple-700",
  "하이브리드": "bg-teal-100 text-teal-700",
};

function MethodCards({ methods }: { methods: LearningMethod[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const active = methods.find((m) => m.id === selected);

  return (
    <div>
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
        학습 방법 선택
        <span className="text-[10px] font-normal text-gray-400">({methods.length}가지 방법)</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {methods.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(selected === m.id ? null : m.id)}
            className={`text-left rounded-xl border-2 p-3 transition-all ${
              selected === m.id
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 hover:border-indigo-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-sm font-bold leading-tight">{m.name}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 font-medium ${TAG_COLOR[m.tag] ?? "bg-gray-100 text-gray-600"}`}>
                {m.tag}
              </span>
            </div>
            <p className="text-[11px] text-gray-500">{m.summary}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[9px] px-1.5 py-0.5 rounded ${DIFFICULTY_BADGE[m.difficulty]}`}>
                {DIFFICULTY_CONFIG[m.difficulty].label}
              </span>
              {selected === m.id && (
                <span className="text-[9px] text-indigo-500 font-medium">선택됨 ▲ 상세보기</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {active && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold text-emerald-600 mb-1">장점</p>
              <ul className="space-y-0.5">
                {active.pros.map((p, i) => (
                  <li key={i} className="text-[11px] text-gray-600 flex gap-1.5">
                    <span className="text-emerald-500 shrink-0">✓</span>{p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold text-red-500 mb-1">단점</p>
              <ul className="space-y-0.5">
                {active.cons.map((c, i) => (
                  <li key={i} className="text-[11px] text-gray-600 flex gap-1.5">
                    <span className="text-red-400 shrink-0">✗</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 pt-2 border-t border-indigo-100">
            <div className="flex gap-2">
              <span className="text-[10px] font-bold text-gray-500 shrink-0">필요 데이터:</span>
              <span className="text-[11px] text-gray-600">{active.dataNeeded}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] font-bold text-gray-500 shrink-0">추천 상황:</span>
              <span className="text-[11px] text-gray-600">{active.bestFor}</span>
            </div>
            {active.paperRef && (
              <div className="flex gap-2">
                <span className="text-[10px] font-bold text-gray-500 shrink-0">참고:</span>
                <span className="text-[11px] text-indigo-600">{active.paperRef}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function TemplateModal({
  template,
  sub,
  cat,
  onClose,
}: {
  template: LearnTemplate;
  sub: SubCategory;
  cat: TopCategory;
  onClose: () => void;
}) {
  const tier = TIER_CONFIG[template.tier];
  const diff = DIFFICULTY_CONFIG[template.difficulty];
  const CatIcon = CATEGORY_ICONS[cat.id] || FileText;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="h-[92vh] sm:max-h-[90vh] w-full sm:max-w-3xl overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${cat.gradient} p-4 md:p-6 text-white rounded-t-2xl`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CatIcon className="size-5" />
                <span className="text-sm opacity-80">{cat.name}</span>
                <span className="opacity-50">›</span>
                <span className="text-sm opacity-80">{sub.name}</span>
              </div>
              <h2 className="text-xl font-bold">{template.name}</h2>
              <p className="text-sm opacity-80 mt-1">{template.description}</p>
            </div>
            <button onClick={onClose} className="p-1 rounded hover:bg-white/20">
              <X className="size-5" />
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            <Badge className={`${tier.color} border-0`}>{tier.label}</Badge>
            <Badge className="bg-white/20 text-white border-0">{diff.label}</Badge>
            <Badge className="bg-white/20 text-white border-0 gap-1">
              <Clock className="size-3" /> {template.estimatedTime}
            </Badge>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-5 md:space-y-6">
          {/* Before/After */}
          <div>
            <h3 className="text-sm font-bold mb-3">학습 전 vs 학습 후</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg bg-red-50 p-4 border border-red-100">
                <span className="text-[10px] font-bold text-red-400 uppercase">Before</span>
                <p className="text-sm text-gray-600 mt-2">{template.beforeAfter.before}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-500 uppercase">After</span>
                <p className="text-sm text-gray-600 mt-2">{template.beforeAfter.after}</p>
              </div>
            </div>
          </div>

          {/* Data Requirements */}
          <div>
            <h3 className="text-sm font-bold mb-3">
              필요한 데이터 ({template.dataRequirements.length}개)
            </h3>
            <div className="space-y-2">
              {template.dataRequirements.map((req, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className={`mt-0.5 size-2 rounded-full shrink-0 ${req.required ? "bg-red-500" : "bg-gray-300"}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{req.item}</span>
                      {req.required && <Badge variant="destructive" className="text-[8px] px-1 py-0">필수</Badge>}
                      <Badge variant="secondary" className="text-[8px] px-1 py-0">{req.type}</Badge>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{req.description}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">예: {req.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step Guide */}
          <div>
            <h3 className="text-sm font-bold mb-3">학습 가이드</h3>
            <div className="space-y-2">
              {template.guide.map((step, i) => (
                <div key={i} className={`flex items-start gap-3 text-sm ${step.startsWith("⚠") ? "text-amber-700 bg-amber-50 rounded-lg p-2" : "text-gray-600"}`}>
                  {!step.startsWith("⚠") && !step.startsWith("참고") && (
                    <span className="flex items-center justify-center size-5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                  )}
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Methods */}
          {template.methods && template.methods.length > 0 && (
            <MethodCards methods={template.methods} />
          )}

          {/* System Prompt Preview */}
          {template.systemPromptPreview && (
            <div>
              <h3 className="text-sm font-bold mb-3">시스템 프롬프트 미리보기</h3>
              <pre className="rounded-lg bg-gray-900 text-gray-100 p-4 text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {template.systemPromptPreview}
              </pre>
            </div>
          )}

          {/* Keywords */}
          <div className="flex flex-wrap gap-1">
            {template.keywords.map((kw) => (
              <Badge key={kw} variant="outline" className="text-[10px]">
                #{kw}
              </Badge>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>닫기</Button>
          {template.tier === "free" ? (
            <Link href={`/learn?template=${template.id}`}>
              <Button className="gap-2">
                이 템플릿으로 학습하기 <ArrowRight className="size-4" />
              </Button>
            </Link>
          ) : (
            <Button className="gap-2" variant="secondary">
              <Lock className="size-4" /> {tier.label} 구독 필요
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Category Section (필터 적용)                                        */
/* ------------------------------------------------------------------ */
function CategorySection({
  cat,
  onSelect,
  tierFilter,
  diffFilter,
  sectionRef,
}: {
  cat: TopCategory;
  onSelect: (t: LearnTemplate, s: SubCategory, c: TopCategory) => void;
  tierFilter: TierFilter;
  diffFilter: DiffFilter;
  sectionRef: (el: HTMLDivElement | null) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const CatIcon = CATEGORY_ICONS[cat.id] || FileText;

  // 필터 적용된 서브카테고리
  const filteredSubs = cat.subcategories
    .map((sub) => ({
      ...sub,
      templates: sub.templates.filter((tpl) => {
        if (tierFilter !== "all" && tpl.tier !== tierFilter) return false;
        if (diffFilter !== "all" && tpl.difficulty !== diffFilter) return false;
        return true;
      }),
    }))
    .filter((sub) => sub.templates.length > 0);

  if (filteredSubs.length === 0) return null;

  const totalVisible = filteredSubs.reduce((a, s) => a + s.templates.length, 0);

  return (
    <div className="mb-10" ref={sectionRef}>
      {/* Category Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 mb-4 group"
      >
        <div className={`flex items-center justify-center size-10 md:size-12 rounded-xl bg-gradient-to-br ${cat.gradient} text-white shrink-0`}>
          <CatIcon className="size-5 md:size-6" />
        </div>
        <div className="text-left flex-1 min-w-0">
          <h2 className="text-base md:text-xl font-bold truncate">{cat.name}</h2>
          <p className="text-xs md:text-sm text-gray-500 hidden sm:block">{cat.description}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="secondary" className="text-[10px] md:text-xs">{totalVisible}개</Badge>
          <ChevronDown className={`size-4 md:size-5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* How it works */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          <div className="rounded-lg bg-gray-50 p-4 mb-4 text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-1">작동 원리:</p>
            <p>{cat.howItWorks}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-[10px] text-gray-400">입력 가능:</span>
              {cat.inputTypes.map((t) => (
                <Badge key={t} variant="outline" className="text-[9px]">{t}</Badge>
              ))}
            </div>
          </div>

          {/* Subcategories */}
          {filteredSubs.map((sub) => (
            <div key={sub.id} className="mb-6">
              <div className="flex items-center gap-2 mb-3 ml-2">
                <div className="size-1.5 rounded-full bg-indigo-500" />
                <h3 className="text-sm font-bold">{sub.name}</h3>
                <Badge variant="secondary" className="text-[9px]">{sub.industry}</Badge>
                {sub.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[9px]">#{tag}</Badge>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 ml-4">
                {sub.templates.map((tpl) => {
                  const tier = TIER_CONFIG[tpl.tier];
                  const diff = DIFFICULTY_CONFIG[tpl.difficulty];
                  const Icon = CATEGORY_ICONS[cat.id] || FileText;
                  return (
                    <div
                      key={tpl.id}
                      className={`rounded-xl border overflow-hidden hover:shadow-lg transition-all ${
                        tpl.tier === "free" ? "border-emerald-200" : "border-gray-200"
                      }`}
                    >
                      {/* 카드 헤더 */}
                      <div className={`flex items-center justify-between px-4 py-2.5 bg-gradient-to-r ${cat.gradient} text-white`}>
                        <div className="flex items-center gap-2">
                          <Icon className="size-4" />
                          <span className="text-sm font-bold">{tpl.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge className={`${tier.color} border-0 text-[9px]`}>{tpl.tier === "free" ? "무료" : tier.label}</Badge>
                          <Badge className="bg-white/20 text-white border-0 text-[9px]">{diff.label}</Badge>
                          <Badge className="bg-white/20 text-white border-0 text-[9px] flex items-center gap-0.5">
                            <Clock className="size-2.5" />{tpl.estimatedTime}
                          </Badge>
                        </div>
                      </div>

                      {/* 카드 바디: 좌 / 우 */}
                      <div className="flex flex-col sm:flex-row sm:divide-x divide-gray-100">
                        {/* 좌: 학습 데이터 + 단계 */}
                        <div className="w-full sm:w-1/2 p-4 space-y-3 border-b border-gray-100 sm:border-b-0">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Database className="size-3.5 text-blue-500" />
                              <span className="text-[11px] font-bold text-blue-600">학습 데이터</span>
                            </div>
                            <ul className="space-y-1">
                              {tpl.dataRequirements.slice(0, 4).map((req, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-600">
                                  <span className={`mt-0.5 shrink-0 ${req.required ? "text-red-400" : "text-gray-300"}`}>•</span>
                                  <span className="leading-snug">{req.item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Sparkles className="size-3.5 text-amber-500" />
                              <span className="text-[11px] font-bold text-amber-600">학습 단계</span>
                            </div>
                            <ol className="space-y-1">
                              {tpl.guide.filter(s => !s.startsWith("참고") && !s.startsWith("⚠")).slice(0, 4).map((step, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-600">
                                  <span className="text-amber-400 font-bold shrink-0 text-[10px] mt-0.5">{i + 1}</span>
                                  <span className="leading-snug">{step.replace(/^\d+단계:\s*/, "")}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>

                        {/* 우: Before → After */}
                        <div className="w-full sm:w-1/2 p-4 flex flex-col">
                          <div className="flex items-center gap-1.5 mb-2">
                            <MessageSquare className="size-3.5 text-emerald-500" />
                            <span className="text-[11px] font-bold text-emerald-600">학습 전 → 후</span>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="rounded-lg bg-red-50 border border-red-100 p-2.5">
                              <span className="text-[9px] font-bold text-red-400 uppercase">Before</span>
                              <p className="text-[11px] text-gray-600 mt-1 leading-snug line-clamp-3">{tpl.beforeAfter.before}</p>
                            </div>
                            <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-2.5">
                              <span className="text-[9px] font-bold text-emerald-500 uppercase">After</span>
                              <p className="text-[11px] text-gray-600 mt-1 leading-snug line-clamp-3">{tpl.beforeAfter.after}</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-2 border-t border-gray-100">
                            {tpl.tier === "free" ? (
                              <Link href={`/learn?template=${tpl.id}`}>
                                <Button size="sm" className="w-full h-7 text-xs gap-1">
                                  학습 시작 <ArrowRight className="size-3" />
                                </Button>
                              </Link>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full h-7 text-xs gap-1"
                                onClick={() => onSelect(tpl, sub, cat)}
                              >
                                <Lock className="size-3" /> 상세보기
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function TemplatesPage() {
  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [diffFilter, setDiffFilter] = useState<DiffFilter>("all");
  const [selected, setSelected] = useState<{
    template: LearnTemplate;
    sub: SubCategory;
    cat: TopCategory;
  } | null>(null);

  // 카테고리별 섹션 ref 맵
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const setSectionRef = useCallback(
    (catId: string) => (el: HTMLDivElement | null) => {
      sectionRefs.current[catId] = el;
    },
    []
  );

  const scrollToCategory = useCallback((catId: string) => {
    const el = sectionRefs.current[catId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // 검색/필터 초기화 시 카테고리 이동
      setQuery("");
    }
  }, []);

  // 검색
  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    let results = searchTemplates(query);
    if (tierFilter !== "all") results = results.filter((t) => t.tier === tierFilter);
    if (diffFilter !== "all") results = results.filter((t) => t.difficulty === diffFilter);
    return results;
  }, [query, tierFilter, diffFilter]);

  // 필터 적용 후 총 개수
  const filteredCount = useMemo(() => {
    let count = 0;
    for (const cat of CATALOG) {
      for (const sub of cat.subcategories) {
        for (const tpl of sub.templates) {
          if (tierFilter !== "all" && tpl.tier !== tierFilter) continue;
          if (diffFilter !== "all" && tpl.difficulty !== diffFilter) continue;
          count++;
        }
      }
    }
    return count;
  }, [tierFilter, diffFilter]);

  const totalCount = getTotalTemplateCount();
  const freeCount = getFreeTemplates().length;
  const hasFilter = tierFilter !== "all" || diffFilter !== "all";

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-500 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-6 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold">학습 템플릿</h1>
          <p className="mt-2 text-indigo-100 max-w-2xl text-sm md:text-base hidden sm:block">
            {totalCount}개 템플릿으로 AI를 학습시키세요.
            텍스트, 이미지, 데이터, 음성, 행동 — 5가지 방법으로 모든 업종의 AI를 만들 수 있습니다.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className="bg-white/20 text-white border-0 text-[10px] md:text-xs">{totalCount}개 템플릿</Badge>
            <Badge className="bg-emerald-400/30 text-white border-0 text-[10px] md:text-xs">{freeCount}개 무료</Badge>
            <Badge className="bg-white/20 text-white border-0 text-[10px] md:text-xs hidden sm:inline-flex">5가지 학습 방법</Badge>
            <Badge className="bg-white/20 text-white border-0 text-[10px] md:text-xs hidden sm:inline-flex">13개 업종</Badge>
          </div>

          {/* Search */}
          <div className="mt-4 relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-indigo-300" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="카페, 불량검출, 로봇, 법률..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-indigo-300 focus:bg-white/20 text-sm"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-white"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 카테고리 퀵 탭 (sticky) ── */}
      <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
            {CATALOG.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] || FileText;
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
                    text-gray-600 hover:text-indigo-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-200"
                >
                  <Icon className="size-3.5 shrink-0" />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 필터 바 ── */}
      <div className="bg-gray-50 border-b">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-2.5 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
            <SlidersHorizontal className="size-3.5" />
            <span className="font-medium">필터</span>
          </div>

          {/* 티어 필터 */}
          <div className="flex items-center gap-1">
            {(["all", "free", "starter", "pro"] as TierFilter[]).map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
                  tierFilter === t
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                }`}
              >
                {t === "all" ? "전체" : TIER_CONFIG[t].label}
              </button>
            ))}
          </div>

          <div className="h-4 border-l border-gray-300 hidden sm:block" />

          {/* 난이도 필터 */}
          <div className="flex items-center gap-1">
            {(["all", "beginner", "intermediate", "advanced"] as DiffFilter[]).map((d) => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
                  diffFilter === d
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                }`}
              >
                {d === "all" ? "전체 난이도" : DIFFICULTY_CONFIG[d].label}
              </button>
            ))}
          </div>

          {/* 필터 결과 카운트 / 초기화 */}
          <div className="ml-auto flex items-center gap-2">
            {hasFilter && (
              <>
                <span className="text-[11px] text-gray-500">
                  {filteredCount}개 표시 중
                </span>
                <button
                  onClick={() => { setTierFilter("all"); setDiffFilter("all"); }}
                  className="text-[11px] text-indigo-600 hover:underline flex items-center gap-0.5"
                >
                  <X className="size-3" /> 초기화
                </button>
              </>
            )}
            {!hasFilter && (
              <span className="text-[11px] text-gray-400">{totalCount}개 전체</span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-4 md:py-8">
        {/* Search Results */}
        {searchResults !== null ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                &quot;{query}&quot; 검색 결과
                <span className="text-base font-normal text-gray-500 ml-2">({searchResults.length}건)</span>
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
                <X className="size-3.5 mr-1" /> 검색 닫기
              </Button>
            </div>
            {searchResults.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                <Search className="size-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">검색 결과가 없습니다.</p>
                <p className="text-sm mt-1">다른 키워드를 시도하거나 필터를 조정해보세요.</p>
                {hasFilter && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => { setTierFilter("all"); setDiffFilter("all"); }}
                  >
                    필터 초기화
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((tpl) => {
                  const tier = TIER_CONFIG[tpl.tier];
                  const diff = DIFFICULTY_CONFIG[tpl.difficulty];
                  // Find parent cat/sub for breadcrumb
                  let breadcrumb = { catName: "", subName: "", catGradient: "from-indigo-500 to-purple-500" };
                  for (const cat of CATALOG) {
                    for (const sub of cat.subcategories) {
                      if (sub.templates.find((t) => t.id === tpl.id)) {
                        breadcrumb = { catName: cat.name, subName: sub.name, catGradient: cat.gradient };
                        break;
                      }
                    }
                  }
                  return (
                    <Card
                      key={tpl.id}
                      className="cursor-pointer hover:shadow-md transition-all border-0 overflow-hidden"
                      onClick={() => {
                        for (const cat of CATALOG) {
                          for (const sub of cat.subcategories) {
                            const found = sub.templates.find((t) => t.id === tpl.id);
                            if (found) { setSelected({ template: found, sub, cat }); return; }
                          }
                        }
                      }}
                    >
                      {/* 카드 상단 그라데이션 띠 */}
                      <div className={`h-1.5 bg-gradient-to-r ${breadcrumb.catGradient}`} />
                      <CardContent className="p-4">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-2">
                          <span>{breadcrumb.catName}</span>
                          <span>›</span>
                          <span>{breadcrumb.subName}</span>
                        </div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-sm font-bold leading-tight">{tpl.name}</h4>
                          <Badge className={`${tier.color} border-0 text-[9px] shrink-0`}>{tier.label}</Badge>
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-2 mb-3">{tpl.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            <Badge variant="outline" className={`text-[9px] ${diff.color}`}>{diff.label}</Badge>
                            <Badge variant="outline" className="text-[9px] text-gray-400">
                              <Clock className="size-2.5 mr-0.5" />{tpl.estimatedTime}
                            </Badge>
                          </div>
                          {tpl.tier === "free" ? (
                            <Link href={`/learn?template=${tpl.id}`} onClick={(e) => e.stopPropagation()}>
                              <Button size="sm" className="h-6 text-[10px] px-2 gap-0.5">
                                학습 시작 <ArrowRight className="size-2.5" />
                              </Button>
                            </Link>
                          ) : (
                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                              <Lock className="size-3" /> 상세보기
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Full Catalog — 필터 적용 */
          <>
            {CATALOG.map((cat) => (
              <CategorySection
                key={cat.id}
                cat={cat}
                onSelect={(t, s, c) => setSelected({ template: t, sub: s, cat: c })}
                tierFilter={tierFilter}
                diffFilter={diffFilter}
                sectionRef={setSectionRef(cat.id)}
              />
            ))}
            {/* 필터 결과 없음 */}
            {hasFilter && filteredCount === 0 && (
              <div className="py-20 text-center text-gray-400">
                <SlidersHorizontal className="size-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">조건에 맞는 템플릿이 없습니다.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => { setTierFilter("all"); setDiffFilter("all"); }}
                >
                  필터 초기화
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <TemplateModal
            template={selected.template}
            sub={selected.sub}
            cat={selected.cat}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
