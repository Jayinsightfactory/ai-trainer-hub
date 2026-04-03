import { create } from "zustand";

export type ViewId = "home" | "templates" | "learn" | "my-learning" | "onboarding" | "settings" | "camera";
export type BottomTab = "chat" | "logs" | "notifications";
export type RightContent = "preview" | "properties" | "details" | null;

interface WorkspaceState {
  activeView: ViewId;
  setActiveView: (v: ViewId) => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  bottomPanelOpen: boolean;
  bottomPanelTab: BottomTab;
  toggleBottomPanel: () => void;
  setBottomPanelTab: (t: BottomTab) => void;

  rightPanelOpen: boolean;
  rightPanelContent: RightContent;
  toggleRightPanel: () => void;
  setRightPanel: (content: RightContent) => void;

  selectedTemplateId: string | null;
  setSelectedTemplateId: (id: string | null) => void;

  // Agent logs
  agentLogs: { time: string; agent: string; message: string; status: "info" | "success" | "error" | "warning" }[];
  addAgentLog: (log: Omit<WorkspaceState["agentLogs"][0], "time">) => void;
}

export const useWorkspace = create<WorkspaceState>((set, get) => ({
  activeView: "home",
  setActiveView: (v) => set({ activeView: v }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  bottomPanelOpen: true,
  bottomPanelTab: "logs",
  toggleBottomPanel: () => set((s) => ({ bottomPanelOpen: !s.bottomPanelOpen })),
  setBottomPanelTab: (t) => set({ bottomPanelTab: t, bottomPanelOpen: true }),

  rightPanelOpen: false,
  rightPanelContent: null,
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setRightPanel: (content) => set({ rightPanelOpen: content !== null, rightPanelContent: content }),

  selectedTemplateId: null,
  setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),

  agentLogs: [
    { time: "09:15:32", agent: "context_weaver", message: "해피카페 지식베이스 처리 시작", status: "info" },
    { time: "09:15:35", agent: "context_weaver", message: "완료 (2.3s) — 12개 문서 인덱싱", status: "success" },
    { time: "09:16:01", agent: "synthesis", message: "주간 브리핑 생성 중...", status: "info" },
    { time: "09:16:08", agent: "synthesis", message: "브리핑 완료 — 인사이트 5건 발견", status: "success" },
    { time: "09:17:22", agent: "quality_auditor", message: "트렌드샵 품질 점수 30→42 개선", status: "warning" },
    { time: "09:18:00", agent: "visual_scout", message: "경쟁사 모니터링 시작 (3개 브랜드)", status: "info" },
    { time: "09:18:15", agent: "visual_scout", message: "경쟁사 A 가격 변동 감지: -15%", status: "warning" },
    { time: "09:19:01", agent: "audio_digester", message: "고객 피드백 감성 분석 완료 — 긍정 72%", status: "success" },
  ],
  addAgentLog: (log) =>
    set((s) => ({
      agentLogs: [...s.agentLogs, { ...log, time: new Date().toLocaleTimeString("ko-KR", { hour12: false }) }],
    })),
}));
