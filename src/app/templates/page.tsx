"use client";

import { useState, useMemo } from "react";
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

/* ------------------------------------------------------------------ */
/*  Template Detail Modal                                              */
/* ------------------------------------------------------------------ */
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${cat.gradient} p-6 text-white rounded-t-2xl`}>
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

        <div className="p-6 space-y-6">
          {/* Before/After */}
          <div>
            <h3 className="text-sm font-bold mb-3">학습 전 vs 학습 후</h3>
            <div className="grid grid-cols-2 gap-3">
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
/*  Category Section                                                   */
/* ------------------------------------------------------------------ */
function CategorySection({
  cat,
  onSelect,
}: {
  cat: TopCategory;
  onSelect: (t: LearnTemplate, s: SubCategory, c: TopCategory) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const CatIcon = CATEGORY_ICONS[cat.id] || FileText;

  return (
    <div className="mb-10">
      {/* Category Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 mb-4 group"
      >
        <div className={`flex items-center justify-center size-12 rounded-xl bg-gradient-to-br ${cat.gradient} text-white`}>
          <CatIcon className="size-6" />
        </div>
        <div className="text-left flex-1">
          <h2 className="text-xl font-bold">{cat.name}</h2>
          <p className="text-sm text-gray-500">{cat.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{cat.subcategories.reduce((a, s) => a + s.templates.length, 0)}개 템플릿</Badge>
          <ChevronDown className={`size-5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
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
          {cat.subcategories.map((sub) => (
            <div key={sub.id} className="mb-6">
              <div className="flex items-center gap-2 mb-3 ml-2">
                <div className="size-1.5 rounded-full bg-indigo-500" />
                <h3 className="text-sm font-bold">{sub.name}</h3>
                <Badge variant="secondary" className="text-[9px]">{sub.industry}</Badge>
                {sub.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[9px]">#{tag}</Badge>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ml-4">
                {sub.templates.map((tpl) => {
                  const tier = TIER_CONFIG[tpl.tier];
                  const diff = DIFFICULTY_CONFIG[tpl.difficulty];
                  return (
                    <Card
                      key={tpl.id}
                      className="cursor-pointer transition-all hover:shadow-md hover:border-indigo-200"
                      onClick={() => onSelect(tpl, sub, cat)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-bold leading-tight">{tpl.name}</h4>
                          <Badge className={`${tier.color} border-0 text-[9px] shrink-0 ml-2`}>
                            {tpl.tier === "free" ? "무료" : tier.label}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-gray-500 mb-3 line-clamp-2">{tpl.description}</p>

                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <span className={diff.color}>{diff.label}</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5"><Clock className="size-3" />{tpl.estimatedTime}</span>
                          <span>·</span>
                          <span>{tpl.dataRequirements.length}개 데이터</span>
                        </div>

                        {tpl.tier === "free" ? (
                          <Link href={`/learn?template=${tpl.id}`} onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" className="w-full mt-3 h-8 text-xs gap-1">
                              학습 시작 <ArrowRight className="size-3" />
                            </Button>
                          </Link>
                        ) : (
                          <Button size="sm" variant="outline" className="w-full mt-3 h-8 text-xs gap-1">
                            <Lock className="size-3" /> 미리보기
                          </Button>
                        )}
                      </CardContent>
                    </Card>
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
  const [selected, setSelected] = useState<{
    template: LearnTemplate;
    sub: SubCategory;
    cat: TopCategory;
  } | null>(null);

  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    return searchTemplates(query);
  }, [query]);

  const totalCount = getTotalTemplateCount();
  const freeCount = getFreeTemplates().length;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-500 text-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h1 className="text-3xl font-bold">학습 템플릿</h1>
          <p className="mt-2 text-indigo-100 max-w-2xl">
            {totalCount}개 템플릿으로 AI를 학습시키세요.
            텍스트, 이미지, 데이터, 음성, 행동 — 5가지 방법으로 모든 업종의 AI를 만들 수 있습니다.
          </p>
          <div className="flex gap-3 mt-4">
            <Badge className="bg-white/20 text-white border-0">{totalCount}개 템플릿</Badge>
            <Badge className="bg-emerald-400/30 text-white border-0">{freeCount}개 무료</Badge>
            <Badge className="bg-white/20 text-white border-0">5가지 학습 방법</Badge>
            <Badge className="bg-white/20 text-white border-0">13개 업종</Badge>
          </div>

          {/* Search */}
          <div className="mt-6 relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-indigo-300" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="카페, 불량검출, 로봇, 법률, 회의록..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-indigo-300 focus:bg-white/20"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Search Results */}
        {searchResults ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                &quot;{query}&quot; 검색 결과 ({searchResults.length}건)
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
                전체 보기
              </Button>
            </div>
            {searchResults.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                <p>검색 결과가 없습니다.</p>
                <p className="text-sm mt-1">다른 키워드를 시도해보세요.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((tpl) => {
                  const tier = TIER_CONFIG[tpl.tier];
                  return (
                    <Card key={tpl.id} className="cursor-pointer hover:shadow-md" onClick={() => {
                      // Find parent cat/sub
                      for (const cat of CATALOG) {
                        for (const sub of cat.subcategories) {
                          const found = sub.templates.find((t) => t.id === tpl.id);
                          if (found) { setSelected({ template: found, sub, cat }); return; }
                        }
                      }
                    }}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-bold">{tpl.name}</h4>
                          <Badge className={`${tier.color} border-0 text-[9px]`}>{tier.label}</Badge>
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-2">{tpl.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Full Catalog */
          CATALOG.map((cat) => (
            <CategorySection
              key={cat.id}
              cat={cat}
              onSelect={(t, s, c) => setSelected({ template: t, sub: s, cat: c })}
            />
          ))
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
