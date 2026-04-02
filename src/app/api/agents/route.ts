import { NextRequest } from "next/server";
import type { AgentType, AgentStatus } from "@/types";

// ─── Types ────────────────────────────────────────────────

interface AgentRunState {
  id: string;
  agents: Record<
    AgentType,
    {
      status: AgentStatus;
      progress: number;
      message: string;
      result?: Record<string, unknown>;
    }
  >;
  overallProgress: number;
  startedAt: number;
  completedAt?: number;
}

// ─── In-Memory Store (MVP) ────────────────────────────────

const agentRuns = new Map<string, AgentRunState>();

// ─── Agent Simulation Data ────────────────────────────────

function createAgentMessages(industry: string): Record<AgentType, string[]> {
  const industryLabel: Record<string, string> = {
    cafe: "카페",
    shopping: "쇼핑몰",
    realestate: "부동산",
    education: "교육",
    marketing: "마케팅",
    legal: "법률",
    medical: "의료",
  };
  const label = industryLabel[industry] || "카페";

  return {
    visual_scout: [
      `경쟁 ${label} 인스타그램 스캔 시작...`,
      `상위 ${label} 5곳 비주얼 콘텐츠 수집 중...`,
      `경쟁사 디자인 패턴 분석 중...`,
      `비주얼 트렌드 리포트 생성 완료`,
    ],
    audio_digester: [
      `${label} 관련 고객 리뷰 수집 시작...`,
      `네이버/구글 리뷰 47건 구조화 중...`,
      `고객 감성 분석 진행 중...`,
      `고객 리뷰 47건 구조화 완료`,
    ],
    context_weaver: [
      `2026 ${label} 트렌드 리포트 수집 중...`,
      `업종 전문 지식 DB 구축 중...`,
      `경쟁사 전략 분석 중...`,
      `고객 행동 패턴 매핑 완료`,
    ],
    synthesis: [
      "에이전트 결과물 통합 중...",
      "학습팩 구조 설계 중...",
      "Before/After 시나리오 생성 중...",
      "맞춤 학습팩 생성 완료",
    ],
    quality_auditor: [
      "학습팩 품질 검증 시작...",
      "응대 시나리오 정확도 확인 중...",
      "톤앤매너 일관성 검사 중...",
      "품질 점수: 87/100 — 통과",
    ],
  };
}

// ─── Simulate Agent Progress ──────────────────────────────

function simulateAgentRun(runId: string, industry: string) {
  const messages = createAgentMessages(industry);
  const run = agentRuns.get(runId);
  if (!run) return;

  // Define agent execution order and timing
  const timeline: {
    agent: AgentType;
    startDelay: number;
    duration: number;
  }[] = [
    { agent: "visual_scout", startDelay: 0, duration: 4000 },
    { agent: "audio_digester", startDelay: 500, duration: 3500 },
    { agent: "context_weaver", startDelay: 1000, duration: 5000 },
    { agent: "synthesis", startDelay: 5500, duration: 3000 },
    { agent: "quality_auditor", startDelay: 8500, duration: 2500 },
  ];

  for (const item of timeline) {
    const agentMessages = messages[item.agent];
    const stepDuration = item.duration / agentMessages.length;

    // Start the agent
    setTimeout(() => {
      const currentRun = agentRuns.get(runId);
      if (!currentRun) return;
      currentRun.agents[item.agent].status = "running";
      currentRun.agents[item.agent].progress = 0;
      currentRun.agents[item.agent].message = agentMessages[0]!;
    }, item.startDelay);

    // Progress updates
    agentMessages.forEach((msg, idx) => {
      setTimeout(() => {
        const currentRun = agentRuns.get(runId);
        if (!currentRun) return;
        const progress = Math.round(((idx + 1) / agentMessages.length) * 100);
        currentRun.agents[item.agent].progress = progress;
        currentRun.agents[item.agent].message = msg;

        if (idx === agentMessages.length - 1) {
          currentRun.agents[item.agent].status = "completed";
        }

        // Update overall progress
        const totalProgress = Object.values(currentRun.agents).reduce(
          (sum, a) => sum + a.progress,
          0
        );
        currentRun.overallProgress = Math.round(totalProgress / 5);

        // Check if all done
        const allDone = Object.values(currentRun.agents).every(
          (a) => a.status === "completed"
        );
        if (allDone) {
          currentRun.completedAt = Date.now();
        }
      }, item.startDelay + stepDuration * (idx + 1));
    });
  }
}

// ─── POST: Start Agent Run ────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { industry, businessName } = body as {
      industry: string;
      businessName: string;
      purpose: string;
    };

    if (!industry || !businessName) {
      return new Response(
        JSON.stringify({ error: "industry와 businessName이 필요합니다." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const initialState: AgentRunState = {
      id: runId,
      agents: {
        visual_scout: {
          status: "pending",
          progress: 0,
          message: "대기 중",
        },
        audio_digester: {
          status: "pending",
          progress: 0,
          message: "대기 중",
        },
        context_weaver: {
          status: "pending",
          progress: 0,
          message: "대기 중",
        },
        synthesis: {
          status: "pending",
          progress: 0,
          message: "대기 중",
        },
        quality_auditor: {
          status: "pending",
          progress: 0,
          message: "대기 중",
        },
      },
      overallProgress: 0,
      startedAt: Date.now(),
    };

    agentRuns.set(runId, initialState);

    // Start simulation
    simulateAgentRun(runId, industry);

    return new Response(
      JSON.stringify({
        runId,
        status: "started",
        message: `${businessName}을 위한 AI 에이전트 분석을 시작합니다...`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "에이전트 실행 중 오류가 발생했습니다." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ─── GET: Get Agent Run Status ────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get("runId");

  if (!runId) {
    return new Response(
      JSON.stringify({ error: "runId 파라미터가 필요합니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const run = agentRuns.get(runId);

  if (!run) {
    return new Response(
      JSON.stringify({ error: "해당 실행을 찾을 수 없습니다." }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const isCompleted = run.completedAt !== undefined;

  return new Response(
    JSON.stringify({
      ...run,
      status: isCompleted ? "completed" : "running",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
