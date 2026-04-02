"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────

type AgentKey =
  | "visual_scout"
  | "audio_digester"
  | "context_weaver"
  | "synthesis"
  | "quality_auditor";

type AgentStatus = "pending" | "running" | "completed" | "failed";

interface AgentState {
  status: AgentStatus;
  progress: number;
  message: string;
}

interface AgentRunViewerProps {
  industry?: string;
  businessName?: string;
  purpose?: string;
  onComplete?: () => void;
  autoStart?: boolean;
}

// ─── Agent Metadata ───────────────────────────────────────

const AGENT_META: Record<
  AgentKey,
  { icon: string; name: string; description: string }
> = {
  visual_scout: {
    icon: "🔍",
    name: "Visual Scout",
    description: "경쟁사 비주얼 콘텐츠 분석",
  },
  audio_digester: {
    icon: "🎙️",
    name: "Audio Digester",
    description: "고객 리뷰 데이터 구조화",
  },
  context_weaver: {
    icon: "🌐",
    name: "Context Weaver",
    description: "업종 트렌드 및 지식 수집",
  },
  synthesis: {
    icon: "🧬",
    name: "Synthesis",
    description: "결과물 통합 및 학습팩 생성",
  },
  quality_auditor: {
    icon: "📊",
    name: "Quality Auditor",
    description: "학습팩 품질 검증",
  },
};

const AGENT_ORDER: AgentKey[] = [
  "visual_scout",
  "audio_digester",
  "context_weaver",
  "synthesis",
  "quality_auditor",
];

// ─── Demo Agent Messages ──────────────────────────────────

function getDemoMessages(
  industry: string
): Record<AgentKey, { message: string; duration: number }[]> {
  const label: Record<string, string> = {
    cafe: "카페",
    shopping: "쇼핑몰",
    realestate: "부동산",
    education: "교육",
    marketing: "마케팅",
    legal: "법률",
    medical: "의료",
  };
  const name = label[industry] || "카페";

  return {
    visual_scout: [
      { message: `경쟁 ${name} 인스타그램 스캔 시작...`, duration: 800 },
      { message: `상위 ${name} 5곳 비주얼 콘텐츠 수집 중...`, duration: 1200 },
      { message: "디자인 패턴 분석 중...", duration: 1000 },
      { message: "비주얼 트렌드 리포트 생성 완료", duration: 600 },
    ],
    audio_digester: [
      { message: `${name} 고객 리뷰 수집 시작...`, duration: 600 },
      { message: "네이버/구글 리뷰 47건 크롤링 중...", duration: 1400 },
      { message: "고객 감성 분석 진행 중...", duration: 1000 },
      { message: "고객 리뷰 47건 구조화 완료", duration: 500 },
    ],
    context_weaver: [
      { message: `2026 ${name} 트렌드 리포트 수집 중...`, duration: 1000 },
      { message: "업종 전문 지식 DB 구축 중...", duration: 1500 },
      { message: "경쟁사 전략 분석 중...", duration: 1200 },
      { message: "고객 행동 패턴 매핑 중...", duration: 800 },
      { message: "컨텍스트 분석 완료", duration: 500 },
    ],
    synthesis: [
      { message: "에이전트 결과물 통합 중...", duration: 800 },
      { message: "학습팩 구조 설계 중...", duration: 1000 },
      { message: "Before/After 시나리오 생성 중...", duration: 1200 },
      { message: "맞춤 학습팩 생성 완료", duration: 500 },
    ],
    quality_auditor: [
      { message: "학습팩 품질 검증 시작...", duration: 600 },
      { message: "응대 시나리오 정확도 확인 중...", duration: 800 },
      { message: "톤앤매너 일관성 검사 중...", duration: 700 },
      { message: "품질 점수: 87/100 — 통과 ✅", duration: 500 },
    ],
  };
}

// ─── Progress Bar Component ───────────────────────────────

function AgentProgressBar({
  agentKey,
  state,
}: {
  agentKey: AgentKey;
  state: AgentState;
}) {
  const meta = AGENT_META[agentKey];
  const isRunning = state.status === "running";
  const isCompleted = state.status === "completed";
  const isPending = state.status === "pending";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border p-4 transition-colors ${
        isCompleted
          ? "border-green-200 bg-green-50"
          : isRunning
          ? "border-blue-200 bg-blue-50"
          : "border-zinc-100 bg-zinc-50"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{meta.icon}</span>
          <span className="font-medium">{meta.name}</span>
          {isCompleted && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              완료
            </Badge>
          )}
          {isRunning && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              실행 중
            </Badge>
          )}
          {isPending && (
            <Badge variant="outline" className="text-zinc-400">
              대기 중
            </Badge>
          )}
        </div>
        <span className="text-sm tabular-nums text-muted-foreground">
          {state.progress}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-2 h-2 overflow-hidden rounded-full bg-zinc-200">
        <motion.div
          className={`h-full rounded-full ${
            isCompleted
              ? "bg-green-500"
              : isRunning
              ? "bg-blue-500"
              : "bg-zinc-300"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${state.progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Status Message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={state.message}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 5 }}
          className={`text-sm ${
            isCompleted
              ? "text-green-600"
              : isRunning
              ? "text-blue-600"
              : "text-zinc-400"
          }`}
        >
          {isPending ? `⏳ ${meta.description}` : `→ ${state.message}`}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────

export default function AgentRunViewer({
  industry = "cafe",
  businessName = "내 사업장",
  onComplete,
  autoStart = false,
}: AgentRunViewerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [agents, setAgents] = useState<Record<AgentKey, AgentState>>(() => {
    const initial: Record<string, AgentState> = {};
    for (const key of AGENT_ORDER) {
      initial[key] = { status: "pending", progress: 0, message: "대기 중" };
    }
    return initial as Record<AgentKey, AgentState>;
  });
  const [overallProgress, setOverallProgress] = useState(0);

  const runAgents = useCallback(() => {
    setIsRunning(true);
    setIsCompleted(false);

    // Reset states
    const resetState: Record<string, AgentState> = {};
    for (const key of AGENT_ORDER) {
      resetState[key] = { status: "pending", progress: 0, message: "대기 중" };
    }
    setAgents(resetState as Record<AgentKey, AgentState>);
    setOverallProgress(0);

    const messages = getDemoMessages(industry);

    // Define start delays for each agent (in ms)
    const startDelays: Record<AgentKey, number> = {
      visual_scout: 300,
      audio_digester: 800,
      context_weaver: 1500,
      synthesis: 6000,
      quality_auditor: 9500,
    };

    let completedCount = 0;

    for (const agentKey of AGENT_ORDER) {
      const agentMessages = messages[agentKey];
      const startDelay = startDelays[agentKey];

      // Calculate cumulative time for each step
      let cumTime = startDelay;

      agentMessages.forEach((step, stepIdx) => {
        const stepTime = cumTime;
        cumTime += step.duration;

        setTimeout(() => {
          setAgents((prev) => {
            const progress = Math.round(
              ((stepIdx + 1) / agentMessages.length) * 100
            );
            const isLast = stepIdx === agentMessages.length - 1;

            const updated = {
              ...prev,
              [agentKey]: {
                status: isLast ? ("completed" as const) : ("running" as const),
                progress,
                message: step.message,
              },
            };

            // Calculate overall
            const totalProgress = Object.values(updated).reduce(
              (sum, a) => sum + a.progress,
              0
            );
            const overall = Math.round(totalProgress / AGENT_ORDER.length);
            setOverallProgress(overall);

            if (isLast) {
              completedCount++;
              if (completedCount === AGENT_ORDER.length) {
                setIsRunning(false);
                setIsCompleted(true);
                onComplete?.();
              }
            }

            return updated;
          });
        }, stepTime);
      });
    }
  }, [industry, onComplete]);

  // Auto-start
  useEffect(() => {
    if (autoStart && !isRunning && !isCompleted) {
      runAgents();
    }
  }, [autoStart, runAgents, isRunning, isCompleted]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI 에이전트 분석</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {businessName}을 위한 맞춤 분석을 실행합니다
            </p>
          </div>
          {!isRunning && (
            <Button
              onClick={runAgents}
              variant={isCompleted ? "outline" : "default"}
            >
              {isCompleted ? "다시 실행" : "분석 시작"}
            </Button>
          )}
        </div>

        {/* Overall Progress */}
        {(isRunning || isCompleted) && (
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">
                {isCompleted ? "분석 완료!" : "전체 진행률"}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {overallProgress}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-200">
              <motion.div
                className={`h-full rounded-full ${
                  isCompleted ? "bg-green-500" : "bg-blue-500"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {AGENT_ORDER.map((key) => (
            <AgentProgressBar key={key} agentKey={key} state={agents[key]} />
          ))}
        </div>

        {/* Completion Summary */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4"
            >
              <h4 className="mb-2 font-semibold text-green-700">
                ✅ 분석 완료
              </h4>
              <p className="mb-3 text-sm text-green-600">
                {businessName}의 AI 학습을 위한 데이터 수집 및 분석이
                완료되었습니다.
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-white p-3">
                  <p className="text-lg font-bold text-green-700">87</p>
                  <p className="text-xs text-muted-foreground">품질 점수</p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <p className="text-lg font-bold text-blue-700">47건</p>
                  <p className="text-xs text-muted-foreground">리뷰 분석</p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <p className="text-lg font-bold text-purple-700">5곳</p>
                  <p className="text-xs text-muted-foreground">경쟁사 분석</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
