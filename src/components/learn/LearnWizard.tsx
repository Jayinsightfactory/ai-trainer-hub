"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Check, ChevronLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLearnStore } from "@/store/learn";
import { TEMPLATES } from "@/lib/templates";
import { matchTemplate } from "@/lib/templates/matcher";

import IdentityStep from "./IdentityStep";
import KnowledgeStep from "./KnowledgeStep";
import TestStep from "./TestStep";
import DeployStep from "./DeployStep";
import LivePreview from "./LivePreview";

const TABS = [
  { label: "역할 설정", desc: "AI의 정체성" },
  { label: "지식 입력", desc: "데이터 학습" },
  { label: "테스트", desc: "학습 검증" },
  { label: "적용", desc: "완료" },
];

export default function LearnWizard({ templateId }: { templateId: string }) {
  const { currentTab, setCurrentTab, setTemplateId, setSystemPrompt, setKnowledgeItems } =
    useLearnStore();

  // Initialize template data
  useEffect(() => {
    const tpl =
      TEMPLATES.find((t) => t.id === templateId) ||
      matchTemplate(templateId.split("_")[0] || "cafe", "customer_service");

    setTemplateId(tpl.id);
    setSystemPrompt(tpl.systemPrompt);

    const items = tpl.dataChecklist.map((d, i) => ({
      id: `item_${i}`,
      label: d.item,
      required: d.required,
      effectBefore: d.effectBefore,
      effectAfter: d.effectAfter,
      value: "",
      filled: false,
    }));
    setKnowledgeItems(items);
  }, [templateId, setTemplateId, setSystemPrompt, setKnowledgeItems]);

  const overallProgress = Math.min(100, currentTab * 25 + 10);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/templates" className="text-gray-400 hover:text-gray-600">
            <ChevronLeft className="size-5" />
          </Link>
          <Bot className="size-6 text-indigo-600" />
          <div>
            <h1 className="text-sm font-bold">AI 학습 위저드</h1>
            <p className="text-[11px] text-gray-400">템플릿으로 학습하기</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">학습 진행률</span>
          <Progress value={overallProgress} className="w-24 h-2 [&>div]:bg-indigo-500" />
          <span className="text-xs font-bold text-indigo-600">{overallProgress}%</span>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white border-b border-gray-100 px-4 shrink-0">
        <div className="flex gap-0 max-w-4xl mx-auto">
          {TABS.map((tab, i) => {
            const isActive = currentTab === i;
            const isDone = currentTab > i;
            return (
              <button
                key={tab.label}
                onClick={() => setCurrentTab(i)}
                className={`relative flex-1 py-3 px-2 text-center transition-colors ${
                  isActive
                    ? "text-indigo-600"
                    : isDone
                      ? "text-emerald-600"
                      : "text-gray-400"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  {isDone ? (
                    <span className="flex items-center justify-center size-5 rounded-full bg-emerald-500 text-white">
                      <Check className="size-3" />
                    </span>
                  ) : (
                    <span
                      className={`flex items-center justify-center size-5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {i + 1}
                    </span>
                  )}
                  <span className="text-xs font-semibold hidden sm:inline">{tab.label}</span>
                </div>
                <p className="text-[10px] mt-0.5 hidden sm:block">{tab.desc}</p>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content: Split Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Wizard Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {currentTab === 0 && <IdentityStep />}
                {currentTab === 1 && <KnowledgeStep />}
                {currentTab === 2 && <TestStep />}
                {currentTab === 3 && <DeployStep />}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            {currentTab < 3 && (
              <div className="flex justify-between mt-8 pb-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentTab === 0}
                  onClick={() => setCurrentTab(currentTab - 1)}
                >
                  이전
                </Button>
                <Button
                  size="sm"
                  onClick={() => setCurrentTab(currentTab + 1)}
                  className="gap-1"
                >
                  다음 단계 <ArrowRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Preview (desktop only) */}
        <div className="hidden lg:block w-[380px] border-l border-gray-200 bg-white overflow-y-auto">
          <LivePreview />
        </div>
      </div>
    </div>
  );
}
