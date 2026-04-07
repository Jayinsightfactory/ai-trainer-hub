import { create } from "zustand";

export interface KnowledgeItem {
  id: string;
  label: string;
  required: boolean;
  effectBefore: string;
  effectAfter: string;
  value: string;
  filled: boolean;
  // 이미지 업로드 지원
  type?: "text" | "image" | "file";
  imageUrls?: string[];   // base64 또는 object URL
}

export interface TestResult {
  question: string;
  beforeAnswer: string;
  afterAnswer: string;
  feedback: "up" | "down" | null;
}

interface LearnState {
  // Navigation
  currentTab: number;
  setCurrentTab: (t: number) => void;

  // Tab 1: Identity
  templateId: string;
  businessName: string;
  tone: string;
  rules: string;
  systemPrompt: string;
  setTemplateId: (v: string) => void;
  setBusinessName: (v: string) => void;
  setTone: (v: string) => void;
  setRules: (v: string) => void;
  setSystemPrompt: (v: string) => void;

  // Tab 2: Knowledge
  knowledgeItems: KnowledgeItem[];
  setKnowledgeItems: (items: KnowledgeItem[]) => void;
  updateKnowledgeItem: (id: string, value: string) => void;
  updateKnowledgeImages: (id: string, imageUrls: string[]) => void;
  qualityScore: number;
  filledCount: number;

  // Tab 3: Test
  testResults: TestResult[];
  setTestResults: (r: TestResult[]) => void;
  setFeedback: (index: number, fb: "up" | "down") => void;

  // Tab 4: Deploy
  learningLevel: number;

  // Computed
  identityComplete: boolean;
  knowledgeComplete: boolean;
  testComplete: boolean;
}

export const useLearnStore = create<LearnState>((set, get) => ({
  currentTab: 0,
  setCurrentTab: (t) => set({ currentTab: t }),

  templateId: "",
  businessName: "",
  tone: "정중한 존댓말",
  rules: "",
  systemPrompt: "",
  setTemplateId: (v) => set({ templateId: v }),
  setBusinessName: (v) => set({ businessName: v }),
  setTone: (v) => set({ tone: v }),
  setRules: (v) => set({ rules: v }),
  setSystemPrompt: (v) => set({ systemPrompt: v }),

  knowledgeItems: [],
  setKnowledgeItems: (items) => set({ knowledgeItems: items }),
  updateKnowledgeImages: (id, imageUrls) => {
    const items = get().knowledgeItems.map((item) =>
      item.id === id
        ? { ...item, imageUrls, filled: imageUrls.length > 0, value: `[이미지 ${imageUrls.length}장]` }
        : item
    );
    const filledCount = items.filter((i) => i.filled).length;
    const requiredFilled = items.filter((i) => i.required && i.filled).length;
    const requiredTotal = items.filter((i) => i.required).length;
    const optionalFilled = items.filter((i) => !i.required && i.filled).length;
    const baseScore = requiredTotal > 0 ? (requiredFilled / requiredTotal) * 60 : 0;
    const bonusScore = optionalFilled * 10;
    const qualityScore = Math.min(98, Math.round(baseScore + bonusScore));
    const learningLevel = filledCount === 0 ? 1 : filledCount <= 2 ? 2 : filledCount <= 4 ? 3 : 4;
    set({ knowledgeItems: items, filledCount, qualityScore, learningLevel });
  },
  updateKnowledgeItem: (id, value) => {
    const items = get().knowledgeItems.map((item) =>
      item.id === id ? { ...item, value, filled: value.trim().length > 0 } : item
    );
    const filledCount = items.filter((i) => i.filled).length;
    const requiredFilled = items.filter((i) => i.required && i.filled).length;
    const requiredTotal = items.filter((i) => i.required).length;
    const optionalFilled = items.filter((i) => !i.required && i.filled).length;
    const baseScore = requiredTotal > 0 ? (requiredFilled / requiredTotal) * 60 : 0;
    const bonusScore = optionalFilled * 10;
    const qualityScore = Math.min(98, Math.round(baseScore + bonusScore));
    const learningLevel =
      filledCount === 0 ? 1 : filledCount <= 2 ? 2 : filledCount <= 4 ? 3 : 4;
    set({ knowledgeItems: items, filledCount, qualityScore, learningLevel });
  },
  qualityScore: 0,
  filledCount: 0,

  testResults: [],
  setTestResults: (r) => set({ testResults: r }),
  setFeedback: (index, fb) => {
    const results = [...get().testResults];
    if (results[index]) results[index] = { ...results[index], feedback: fb };
    set({ testResults: results });
  },

  learningLevel: 1,

  get identityComplete() {
    return get().businessName.trim().length > 0;
  },
  get knowledgeComplete() {
    const items = get().knowledgeItems;
    return items.filter((i) => i.required).every((i) => i.filled);
  },
  get testComplete() {
    return get().testResults.some((r) => r.feedback !== null);
  },
}));
