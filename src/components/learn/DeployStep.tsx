"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Copy,
  Download,
  ArrowRight,
  Sparkles,
  BarChart3,
  Database,
  Brain,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLearnStore } from "@/store/learn";
import { RESEARCH_FACTS } from "@/lib/learning-data";

export default function DeployStep() {
  const {
    businessName,
    templateId,
    qualityScore,
    learningLevel,
    filledCount,
    testResults,
    systemPrompt,
    knowledgeItems,
  } = useLearnStore();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const positiveTests = testResults.filter((r) => r.feedback === "up").length;

  const copyPrompt = () => {
    navigator.clipboard.writeText(systemPrompt);
  };

  const saveToDb = async () => {
    setSaving(true);
    try {
      const knowledgeBase: Record<string, string> = {};
      knowledgeItems.forEach((item) => {
        if (item.filled) knowledgeBase[item.id] = item.value;
      });

      await fetch("/api/learning-packs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          name: `${businessName || "AI"} 학습팩`,
          systemPrompt,
          knowledgeBase,
          level: learningLevel,
          qualityScore,
          status: "ready",
        }),
      });
      setSaved(true);
    } catch {
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Completion Header */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-flex items-center justify-center size-16 rounded-full bg-emerald-100 mb-4"
        >
          <CheckCircle className="size-8 text-emerald-600" />
        </motion.div>
        <h2 className="text-2xl font-bold">학습 완료!</h2>
        <p className="text-gray-500 mt-1">
          <strong>{businessName || "AI"}</strong>의 학습이 준비되었습니다
        </p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: Database,
            label: "학습 데이터",
            value: `${filledCount}건`,
            color: "text-blue-600",
          },
          {
            icon: BarChart3,
            label: "품질 점수",
            value: `${qualityScore}/100`,
            color: "text-indigo-600",
          },
          {
            icon: Brain,
            label: "학습 레벨",
            value: `Lv.${learningLevel}`,
            color: "text-purple-600",
          },
          {
            icon: Sparkles,
            label: "테스트 정확도",
            value:
              testResults.length > 0
                ? `${Math.round((positiveTests / Math.max(testResults.filter((r) => r.feedback).length, 1)) * 100)}%`
                : "-",
            color: "text-emerald-600",
          },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 text-center">
            <stat.icon className={`size-5 mx-auto mb-2 ${stat.color}`} />
            <div className={`text-lg font-extrabold ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-gray-500">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Learning Level Detail */}
      <Card className="p-4">
        <h3 className="text-sm font-bold mb-3">학습 레벨 달성</h3>
        <div className="space-y-2">
          {[
            { lv: 1, label: "기본 설정", desc: "역할과 규칙 설정 완료" },
            { lv: 2, label: "지식 입력", desc: "핵심 데이터 학습 완료" },
            { lv: 3, label: "말투 학습", desc: "톤과 스타일까지 학습" },
            { lv: 4, label: "전체 학습", desc: "분석+트렌드까지 반영" },
          ].map((l) => (
            <div key={l.lv} className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center size-7 rounded-full ${
                  learningLevel >= l.lv
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {learningLevel >= l.lv ? (
                  <CheckCircle className="size-4" />
                ) : (
                  <span className="text-xs font-bold">{l.lv}</span>
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-xs font-semibold ${
                    learningLevel >= l.lv ? "text-gray-800" : "text-gray-400"
                  }`}
                >
                  Lv.{l.lv} {l.label}
                </p>
                <p className="text-[10px] text-gray-400">{l.desc}</p>
              </div>
              {learningLevel >= l.lv && (
                <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[9px]">완료</Badge>
              )}
            </div>
          ))}
        </div>
        <Progress
          value={learningLevel * 25}
          className="mt-4 h-2 [&>div]:bg-indigo-500"
        />
      </Card>

      {/* Research Note */}
      <div className="rounded-lg bg-amber-50 p-4">
        <p className="text-xs text-amber-700">
          <strong>지속적 학습의 원리:</strong> {RESEARCH_FACTS.continuousLearning.implication}
          <br />
          <span className="text-[10px] text-amber-500">
            대시보드에서 피드백을 계속 주면 AI가 점점 더 정확해집니다.
          </span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Save to DB */}
        {!saved ? (
          <Button
            className="w-full h-12 gap-2 text-base bg-emerald-600 hover:bg-emerald-700"
            onClick={saveToDb}
            disabled={saving}
          >
            {saving ? (
              <><Loader2 className="size-5 animate-spin" /> 저장 중...</>
            ) : (
              <><Save className="size-5" /> 학습 결과 저장하기</>
            )}
          </Button>
        ) : (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-center">
            <CheckCircle className="size-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-emerald-700">저장 완료!</p>
            <p className="text-xs text-emerald-500 mt-1">&lsquo;내 학습&rsquo;에서 확인할 수 있습니다</p>
          </div>
        )}

        <Link href="/my-learning" className="block">
          <Button className="w-full h-12 gap-2 text-base" variant={saved ? "default" : "outline"}>
            내 학습에서 관리하기 <ArrowRight className="size-5" />
          </Button>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="gap-2" onClick={copyPrompt}>
            <Copy className="size-4" /> 프롬프트 복사
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="size-4" /> 학습 데이터 다운로드
          </Button>
        </div>

        <Button
          variant="ghost"
          className="w-full text-sm text-gray-500"
          onClick={() => useLearnStore.getState().setCurrentTab(1)}
        >
          더 학습시키기 (지식 추가)
        </Button>
      </div>
    </div>
  );
}
