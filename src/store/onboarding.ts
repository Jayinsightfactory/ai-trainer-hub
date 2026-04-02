import { create } from "zustand";

interface OnboardingState {
  currentStep: number;
  industry: string;
  purpose: string;
  businessName: string;
  existingData: string[];
  setIndustry: (industry: string) => void;
  setPurpose: (purpose: string) => void;
  setBusinessName: (name: string) => void;
  setExistingData: (data: string[]) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 0,
  industry: "",
  purpose: "",
  businessName: "",
  existingData: [],
  setIndustry: (industry) => set({ industry }),
  setPurpose: (purpose) => set({ purpose }),
  setBusinessName: (name) => set({ businessName: name }),
  setExistingData: (data) => set({ existingData: data }),
  nextStep: () =>
    set((state) => ({ currentStep: Math.min(state.currentStep + 1, 3) })),
  prevStep: () =>
    set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),
}));
