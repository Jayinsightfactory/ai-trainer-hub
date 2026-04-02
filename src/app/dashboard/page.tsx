"use client";

import AIBriefing from "@/components/dashboard/AIBriefing";
import AgentStatusPanel from "@/components/dashboard/AgentStatusPanel";
import LearningProgress from "@/components/dashboard/LearningProgress";
import QuickActions from "@/components/dashboard/QuickActions";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">오늘의 브리핑</h1>
        <p className="text-sm text-muted-foreground mt-1">
          2026년 4월 1일 화요일
        </p>
      </div>

      {/* AI Briefing - the main attraction */}
      <AIBriefing />

      {/* Two-column grid for panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgentStatusPanel />
        <LearningProgress />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
