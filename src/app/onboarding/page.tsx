"use client";

import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { Sparkles } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center gap-2 border-b px-6 py-3">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold tracking-tight">
          AI Trainer Hub
        </span>
      </header>

      {/* Main content */}
      <main className="flex flex-1 items-start justify-center px-4 py-8 sm:py-12">
        <OnboardingWizard />
      </main>
    </div>
  );
}
