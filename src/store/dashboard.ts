import { create } from "zustand";
import type { AgentType, AgentStatus, BriefingItem, LearningPackStatus } from "@/types";

interface CurrentLearningPack {
  id: string;
  name: string;
  status: LearningPackStatus;
  level: number;
  contextData: number;
  visualData: number;
  audioData: number;
  qualityScore: number;
}

interface DashboardState {
  briefings: BriefingItem[];
  agentStatuses: Partial<Record<AgentType, AgentStatus>>;
  learningPack: CurrentLearningPack | null;

  isBriefingsLoading: boolean;
  isAgentsLoading: boolean;
  isLearningPackLoading: boolean;

  setBriefings: (briefings: BriefingItem[]) => void;
  addBriefing: (briefing: BriefingItem) => void;
  removeBriefing: (id: string) => void;

  setAgentStatus: (agentType: AgentType, status: AgentStatus) => void;
  setAgentStatuses: (statuses: Partial<Record<AgentType, AgentStatus>>) => void;

  setLearningPack: (pack: CurrentLearningPack | null) => void;

  setLoading: (key: "briefings" | "agents" | "learningPack", loading: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  briefings: [],
  agentStatuses: {},
  learningPack: null,

  isBriefingsLoading: false,
  isAgentsLoading: false,
  isLearningPackLoading: false,

  setBriefings: (briefings) => set({ briefings }),

  addBriefing: (briefing) =>
    set((state) => ({
      briefings: [briefing, ...state.briefings],
    })),

  removeBriefing: (id) =>
    set((state) => ({
      briefings: state.briefings.filter((b) => b.id !== id),
    })),

  setAgentStatus: (agentType, status) =>
    set((state) => ({
      agentStatuses: { ...state.agentStatuses, [agentType]: status },
    })),

  setAgentStatuses: (statuses) => set({ agentStatuses: statuses }),

  setLearningPack: (learningPack) => set({ learningPack }),

  setLoading: (key, loading) => {
    const map = {
      briefings: "isBriefingsLoading",
      agents: "isAgentsLoading",
      learningPack: "isLearningPackLoading",
    } as const;
    set({ [map[key]]: loading });
  },
}));
