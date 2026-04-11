"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Database,
  Zap,
  TrendingUp,
  CheckCircle2,
  Brain,
  Search,
  Filter,
  BarChart3,
  Wrench,
  MapPin,
  DollarSign,
} from "lucide-react";
import {
  SOLUTIONS,
  CATEGORIES,
  DATA_TYPE_COLORS,
  AUTOMATION_COLORS,
  AUTOMATION_LABELS,
  COMMON_AI_CAPABILITIES,
  ROI_ESTIMATES,
  KOREAN_TOOLS,
  IMPLEMENTATION_PHASES,
  type Industry,
  type DataSource,
  type SolutionFlow,
} from "@/lib/solutions-data";

// ─────────────────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────────────────

type PageTab = "industries" | "roi" | "capabilities" | "tools" | "guide";

export default function SolutionsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndustry, setExpandedIndustry] = useState<string | null>("cafe");
  const [activeTab, setActiveTab] = useState<"data" | "flow">("data");
  const [pageTab, setPageTab] = useState<PageTab>("industries");

  const filtered = useMemo(() => {
    return SOLUTIONS.filter((s) => {
      const matchCat = activeCategory === "all" || s.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.tags.some((t) => t.includes(q)) ||
        s.dataSources.some(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.aiUseCases.some((u) => u.name.toLowerCase().includes(q))
        );
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100">
      {/* ── 헤더 ─────────────────────────────────────── */}
      <div className="border-b border-slate-800 bg-[#0d1117]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-400" />
              AI 솔루션 가이드
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              내 데이터로 AI 학습 시 얻을 수 있는 모든 가능성
            </p>
          </div>
          <div className="text-xs text-slate-500">
            {SOLUTIONS.reduce((s, i) => s + i.dataSources.length, 0)}개 데이터 소스 ·{" "}
            {SOLUTIONS.reduce(
              (s, i) => s + i.dataSources.reduce((ss, d) => ss + d.aiUseCases.length, 0),
              0
            )}개 AI 솔루션
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* ── 페이지 탭 ────────────────────────────────── */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {([
            { id: "industries", label: "업종별 솔루션", icon: Brain },
            { id: "roi", label: "ROI 추정", icon: DollarSign },
            { id: "capabilities", label: "공통 AI 역량", icon: BarChart3 },
            { id: "tools", label: "한국 툴 생태계", icon: Wrench },
            { id: "guide", label: "도입 가이드", icon: MapPin },
          ] as { id: PageTab; label: string; icon: React.ElementType }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setPageTab(t.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                pageTab === t.id
                  ? "bg-violet-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── 업종별 솔루션 탭 ─────────────────────────── */}
        {pageTab === "industries" && (
          <>
        {/* 검색 + 필터 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="업종, 데이터 유형, AI 기능 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-slate-500 shrink-0 mt-2.5" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-violet-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 업종 카드 목록 */}
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((industry) => (
              <IndustryCard
                key={industry.id}
                industry={industry}
                isExpanded={expandedIndustry === industry.id}
                onToggle={() =>
                  setExpandedIndustry(
                    expandedIndustry === industry.id ? null : industry.id
                  )
                }
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <Image src="/images/empty-states/no-results.svg" alt="" width={180} height={144} className="mx-auto mb-4" />
              <p>검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
          </>
        )}

        {/* ── ROI 추정 탭 ─────────────────────────────── */}
        {pageTab === "roi" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">업종별 AI 도입 시 예상 투자 대비 수익 (실제 사례 기반)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ROI_ESTIMATES.map((roi) => (
                <div key={roi.industry} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{roi.emoji}</span>
                    <h3 className="font-semibold text-white">{roi.industry}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-2">
                      <div className="text-[10px] text-red-400 mb-0.5">월 투자</div>
                      <div className="text-xs font-bold text-red-300">{roi.monthlyInvestment}</div>
                    </div>
                    <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-2">
                      <div className="text-[10px] text-emerald-400 mb-0.5">월 효과</div>
                      <div className="text-xs font-bold text-emerald-300">{roi.monthlyReturn}</div>
                    </div>
                  </div>
                  <div className="bg-violet-900/20 border border-violet-700/30 rounded-lg px-3 py-2 mb-3">
                    <div className="text-[10px] text-violet-400 mb-0.5">투자 회수</div>
                    <div className="text-sm font-bold text-violet-300">{roi.paybackPeriod}</div>
                  </div>
                  <div className="space-y-1">
                    {roi.mainBenefits.map((b) => (
                      <div key={b} className="flex items-center gap-1.5 text-xs text-slate-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 공통 AI 역량 탭 ─────────────────────────── */}
        {pageTab === "capabilities" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">업종 무관하게 적용 가능한 6가지 핵심 AI 역량</p>
            {COMMON_AI_CAPABILITIES.map((cap) => (
              <div key={cap.id} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{cap.capability}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{cap.applicability}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-500">평균 정확도</div>
                    <div className="text-sm font-bold text-blue-400">{cap.avgAccuracy}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                  <div className="bg-slate-900 border border-slate-700/60 rounded-lg p-2">
                    <div className="text-[9px] text-slate-500 mb-1">최소 필요 데이터</div>
                    <div className="text-[11px] text-slate-300">{cap.minDataRequired}</div>
                  </div>
                  <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-2 sm:col-span-2">
                    <div className="text-[9px] text-emerald-400 mb-1">평균 효과</div>
                    <div className="text-[11px] text-emerald-300 font-medium">{cap.avgEfficiency}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {cap.industries.map((ind) => (
                    <span key={ind} className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 한국 툴 생태계 탭 ────────────────────────── */}
        {pageTab === "tools" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">국내 자영업자가 이미 사용 중인 플랫폼 — AI 연동 시 즉시 데이터 활용 가능</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {KOREAN_TOOLS.map((tool) => (
                <div key={tool.name} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{tool.logo}</span>
                    <div>
                      <div className="font-medium text-white text-sm">{tool.name}</div>
                      <div className="text-[11px] text-slate-400">{tool.type}</div>
                    </div>
                    <span className={`ml-auto text-[10px] px-2 py-0.5 rounded font-medium ${
                      tool.cost === "무료" ? "bg-emerald-900/40 text-emerald-400" : "bg-amber-900/40 text-amber-400"
                    }`}>
                      {tool.cost}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tool.dataAvailable.map((d) => (
                      <span key={d} className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 도입 가이드 탭 ───────────────────────────── */}
        {pageTab === "guide" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">자영업자를 위한 단계별 AI 도입 로드맵 — 할루시네이션 없이 현실적으로 가능한 것만</p>
            <div className="space-y-3">
              {IMPLEMENTATION_PHASES.map((phase) => (
                <div key={phase.phase} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      phase.difficulty === "easy" ? "bg-emerald-600" :
                      phase.difficulty === "medium" ? "bg-amber-600" : "bg-red-600"
                    }`}>
                      {phase.phase}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h3 className="font-semibold text-white">{phase.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{phase.duration}</span>
                          <span className="text-xs font-bold text-violet-400">{phase.cost}</span>
                        </div>
                      </div>
                      <ul className="mt-2 space-y-1">
                        {phase.actions.map((action) => (
                          <li key={action} className="flex items-center gap-1.5 text-xs text-slate-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* CTA */}
            <div className="bg-gradient-to-r from-violet-900/30 to-blue-900/30 border border-violet-700/40 rounded-xl p-5 text-center">
              <h3 className="font-bold text-white mb-1">Phase 1부터 지금 바로 시작하세요</h3>
              <p className="text-xs text-slate-400 mb-3">4단계 위저드로 10분 안에 첫 번째 AI 에이전트 셋업 완료</p>
              <a
                href="/learn"
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                무료로 시작하기 <TrendingUp className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 업종 카드
// ─────────────────────────────────────────────────────────

function IndustryCard({
  industry,
  isExpanded,
  onToggle,
  activeTab,
  onTabChange,
}: {
  industry: Industry;
  isExpanded: boolean;
  onToggle: () => void;
  activeTab: "data" | "flow";
  onTabChange: (t: "data" | "flow") => void;
}) {
  const totalUseCases = industry.dataSources.reduce(
    (s, d) => s + d.aiUseCases.length,
    0
  );

  return (
    <motion.div
      layout
      className="rounded-xl border border-slate-700/60 bg-slate-900/60 overflow-hidden"
    >
      {/* 헤더 */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-800/40 transition-colors text-left"
      >
        <span className="text-3xl">{industry.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-white">{industry.name}</h2>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
              {industry.category}
            </span>
            <span className="text-xs text-slate-500">{industry.marketSize}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{industry.description}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-violet-400">{totalUseCases}개</div>
            <div className="text-xs text-slate-500">AI 솔루션</div>
          </div>
          <div className="flex flex-wrap gap-1 max-w-[160px] hidden md:flex">
            {industry.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* 확장 콘텐츠 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-slate-700/60 px-5 pb-5">
              {/* 탭 */}
              <div className="flex gap-1 mt-4 mb-4">
                <button
                  onClick={() => onTabChange("data")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    activeTab === "data"
                      ? "bg-violet-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  <Database className="w-3.5 h-3.5" /> 데이터 × AI 매핑
                </button>
                <button
                  onClick={() => onTabChange("flow")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    activeTab === "flow"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" /> 실행 플로우
                </button>
              </div>

              {activeTab === "data" ? (
                <DataMappingView dataSources={industry.dataSources} />
              ) : (
                <FlowView flows={industry.topFlows} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// 데이터 × AI 매핑 뷰
// ─────────────────────────────────────────────────────────

function DataMappingView({ dataSources }: { dataSources: DataSource[] }) {
  const [activeSource, setActiveSource] = useState(dataSources[0]?.id);
  const source = dataSources.find((d) => d.id === activeSource);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 좌측: 데이터 소스 목록 */}
      <div className="space-y-2">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
          수집 가능한 데이터
        </div>
        {dataSources.map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveSource(d.id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all text-xs ${
              activeSource === d.id
                ? "border-violet-500/60 bg-violet-500/10 text-white"
                : "border-slate-700/60 bg-slate-800/40 text-slate-400 hover:bg-slate-800"
            }`}
          >
            <div className="font-medium">{d.name}</div>
            <div className="text-[10px] mt-0.5 opacity-70">{d.source}</div>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded ${DATA_TYPE_COLORS[d.dataType] || "bg-slate-700 text-slate-400"}`}
              >
                {d.dataType}
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded ${
                  d.collectionEase === "easy"
                    ? "bg-green-900/40 text-green-400"
                    : d.collectionEase === "medium"
                      ? "bg-amber-900/40 text-amber-400"
                      : "bg-red-900/40 text-red-400"
                }`}
              >
                수집{" "}
                {d.collectionEase === "easy"
                  ? "쉬움"
                  : d.collectionEase === "medium"
                    ? "보통"
                    : "어려움"}
              </span>
              <span className="text-[9px] text-slate-500">
                AI {d.aiUseCases.length}개
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* 우측: AI 활용 사례 */}
      <div className="md:col-span-2 space-y-3">
        {source && (
          <>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
              학습 데이터 예시
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {source.examples.map((ex) => (
                <span
                  key={ex}
                  className="text-[11px] bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700/60"
                >
                  {ex}
                </span>
              ))}
            </div>

            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
              AI 학습 시 가능한 것들
            </div>
            <div className="space-y-3">
              {source.aiUseCases.map((uc) => (
                <div
                  key={uc.id}
                  className="bg-slate-800/50 border border-slate-700/60 rounded-lg p-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-white">{uc.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${AUTOMATION_COLORS[uc.automationLevel]}`}
                        >
                          {AUTOMATION_LABELS[uc.automationLevel]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{uc.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="bg-emerald-900/20 border border-emerald-700/30 rounded px-2 py-1.5">
                      <div className="text-[9px] text-emerald-400 mb-0.5">효율성</div>
                      <div className="text-[11px] text-emerald-300 font-medium">{uc.efficiency}</div>
                    </div>
                    <div className="bg-blue-900/20 border border-blue-700/30 rounded px-2 py-1.5">
                      <div className="text-[9px] text-blue-400 mb-0.5">적용까지</div>
                      <div className="text-[11px] text-blue-300 font-medium">{uc.timeToValue}</div>
                    </div>
                    <div className="bg-slate-800 border border-slate-700/60 rounded px-2 py-1.5">
                      <div className="text-[9px] text-slate-500 mb-0.5">필요 데이터</div>
                      <div className="text-[11px] text-slate-300">{uc.requiredData}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 실행 플로우 뷰
// ─────────────────────────────────────────────────────────

function FlowView({ flows }: { flows: SolutionFlow[] }) {
  return (
    <div className="space-y-6">
      {flows.map((flow) => (
        <div
          key={flow.id}
          className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-white text-sm">{flow.title}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Database className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-slate-400">{flow.trigger}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] text-slate-500">기대 효과</div>
              <div className="text-xs font-bold text-emerald-400">{flow.totalEfficiency}</div>
            </div>
          </div>

          {/* 플로우 단계 */}
          <div className="flex items-start gap-2 overflow-x-auto pb-2">
            {flow.steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 shrink-0">
                <div className="flex flex-col items-center">
                  <div className="w-28 bg-slate-900 border border-slate-700/60 rounded-lg p-3 text-center">
                    <div className="text-xl mb-1">{step.icon}</div>
                    <div className="text-[11px] font-semibold text-white">{step.step}</div>
                    <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">{step.detail}</div>
                  </div>
                </div>
                {idx < flow.steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-600 shrink-0 mt-6" />
                )}
              </div>
            ))}
          </div>

          {/* 실제 사례 */}
          <div className="mt-3 flex items-start gap-2 bg-emerald-900/10 border border-emerald-700/30 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-xs text-emerald-300">
              <span className="font-medium">실제 사례:</span> {flow.realWorldExample}
            </p>
          </div>
        </div>
      ))}

      {/* 지금 시작하기 CTA */}
      <div className="bg-gradient-to-r from-violet-900/30 to-blue-900/30 border border-violet-700/40 rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="font-semibold text-white text-sm">이 플로우, 지금 내 매장에 적용해볼까요?</div>
          <div className="text-xs text-slate-400 mt-0.5">4단계 위저드로 10분 안에 AI 셋업 완료</div>
        </div>
        <a
          href="/learn"
          className="shrink-0 bg-violet-600 hover:bg-violet-500 text-white text-xs px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
        >
          학습 시작 <TrendingUp className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
