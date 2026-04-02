"use client";

import { useWorkspace } from "@/store/workspace";
import {
  Activity,
  Bot,
  TrendingUp,
  Zap,
  Brain,
  Eye,
  Mic,
  Globe,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

function HomeSidebar() {
  const cases = [
    { label: "카페 고객응대", score: "87%", badge: "인기" },
    { label: "쇼핑몰 CS", score: "92%", badge: "" },
    { label: "영어학원 상담", score: "78%", badge: "" },
    { label: "부동산 매물설명", score: "85%", badge: "" },
    { label: "건강식품 CS", score: "93%", badge: "최고" },
  ];

  return (
    <div className="flex flex-col gap-4 p-3">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">학습 성과</div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-800 rounded-lg p-2.5">
          <div className="text-lg font-bold text-emerald-400">87%</div>
          <div className="text-[10px] text-gray-500">평균 정확도</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-2.5">
          <div className="text-lg font-bold text-indigo-400">21</div>
          <div className="text-[10px] text-gray-500">학습 사례</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-2.5">
          <div className="text-lg font-bold text-amber-400">42</div>
          <div className="text-[10px] text-gray-500">템플릿</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-2.5">
          <div className="text-lg font-bold text-pink-400">15</div>
          <div className="text-[10px] text-gray-500">카테고리</div>
        </div>
      </div>

      {/* Top Cases */}
      <div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">성과 TOP 사례</div>
        <div className="space-y-1">
          {cases.map((c) => (
            <div key={c.label} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-2.5 py-2 hover:bg-gray-800 cursor-pointer transition-colors">
              <span className="text-xs text-gray-300">{c.label}</span>
              <div className="flex items-center gap-1.5">
                {c.badge && <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400">{c.badge}</span>}
                <span className="text-xs font-bold text-emerald-400">{c.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">빠른 시작</div>
        <div className="space-y-1">
          {["새 학습 시작", "템플릿 둘러보기", "사례 더 보기"].map((action) => (
            <button
              key={action}
              className="w-full text-left text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded px-2 py-1.5 transition-colors"
            >
              <Zap className="size-3 inline mr-1.5" />
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplateSidebar() {
  const categories = [
    "전체", "텍스트 학습", "이미지 학습", "이미지 생성", "영상/모션",
    "데이터 학습", "음성 학습", "음성 클로닝", "멀티모달", "AI 에이전트",
    "RAG", "파인튜닝", "Edge AI", "합성 데이터", "코드 생성", "행동 학습",
  ];
  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">카테고리</div>
      <div className="space-y-0.5">
        {categories.map((c, i) => (
          <button
            key={c}
            className={`w-full text-left text-xs rounded px-2 py-1.5 transition-colors ${
              i === 0 ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

function DefaultSidebar() {
  return (
    <div className="p-3 text-xs text-gray-500">
      <p>사이드바 콘텐츠</p>
    </div>
  );
}

export default function Sidebar() {
  const { activeView, sidebarCollapsed } = useWorkspace();

  if (sidebarCollapsed) return null;

  return (
    <div className="h-full bg-gray-900 border-r border-gray-800 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
      {activeView === "home" && <HomeSidebar />}
      {activeView === "templates" && <TemplateSidebar />}
      {activeView !== "home" && activeView !== "templates" && <HomeSidebar />}
    </div>
  );
}
