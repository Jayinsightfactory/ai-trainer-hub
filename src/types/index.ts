// ─── Onboarding ────────────────────────────────────────────

export type OnboardingStep = 0 | 1 | 2 | 3;

// ─── Industry ──────────────────────────────────────────────

export const INDUSTRIES = {
  cafe: "카페/음식점",
  shopping: "쇼핑몰",
  realestate: "부동산",
  education: "교육",
  marketing: "마케팅",
  legal: "법률",
  medical: "의료",
} as const;

export type Industry = keyof typeof INDUSTRIES;

// ─── Purpose ───────────────────────────────────────────────

export const PURPOSES = {
  customer_service: "고객 응대",
  content: "콘텐츠 생성",
  analytics: "데이터 분석",
  automation: "업무 자동화",
} as const;

export type Purpose = keyof typeof PURPOSES;

// ─── Agent ─────────────────────────────────────────────────

export const AGENT_TYPES = {
  context_weaver: "Context Weaver",
  visual_scout: "Visual Scout",
  audio_digester: "Audio Digester",
  synthesis: "Synthesis",
  quality_auditor: "Quality Auditor",
} as const;

export type AgentType = keyof typeof AGENT_TYPES;

export type AgentStatus = "pending" | "running" | "completed" | "failed";

// ─── Learning ──────────────────────────────────────────────

export type LearningLevel = 1 | 2 | 3 | 4;

export type LearningPackStatus = "draft" | "learning" | "ready" | "active";

// ─── Template ──────────────────────────────────────────────

export interface Template {
  id: string;
  name: string;
  industry: Industry;
  purpose: Purpose;
  systemPrompt: string;
  dataChecklist: string; // JSON string
  agentConfig: string;   // JSON string
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Dashboard Briefing ────────────────────────────────────

export interface BriefingItem {
  id: string;
  type: "info" | "warning" | "success" | "action";
  title: string;
  description: string;
  timestamp: Date;
  actionUrl?: string;
}

// ─── NextAuth Extensions ───────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
  }
}
