"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, MessageSquare, ShieldCheck, ChevronDown, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useLearnStore } from "@/store/learn";
import { RESEARCH_FACTS } from "@/lib/learning-data";

const TONES = [
  { value: "정중한 존댓말", emoji: "🤝", desc: "~입니다, ~해드리겠습니다" },
  { value: "친근한 반말", emoji: "😊", desc: "~야, ~해줄게, ~거든" },
  { value: "전문적", emoji: "🎓", desc: "~사항입니다, ~검토하겠습니다" },
  { value: "직접 입력", emoji: "✏️", desc: "원하는 말투를 직접 설정" },
];

export default function IdentityStep() {
  const { businessName, setBusinessName, tone, setTone, rules, setRules, systemPrompt, setSystemPrompt } =
    useLearnStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const [customTone, setCustomTone] = useState("");

  return (
    <div className="space-y-6">
      {/* Research Insight */}
      <div className="flex items-start gap-3 rounded-lg bg-indigo-50 p-4">
        <Lightbulb className="size-5 text-indigo-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-indigo-700">왜 역할 설정이 중요한가요?</p>
          <p className="text-xs text-indigo-600 mt-1">{RESEARCH_FACTS.rlhf.fact}</p>
          <p className="text-[10px] text-indigo-400 mt-1">— {RESEARCH_FACTS.rlhf.source}</p>
        </div>
      </div>

      {/* Business Name */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold mb-2">
          <User className="size-4 text-gray-500" />
          사업장 이름 <Badge variant="destructive" className="text-[9px] px-1.5 py-0">필수</Badge>
        </label>
        <Input
          placeholder="예: 해피카페, 트렌드샵, 우리동네부동산..."
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />
        <p className="text-[11px] text-gray-400 mt-1">
          AI가 &quot;저는 {businessName || "OO"}의 AI 어시스턴트입니다&quot;로 자기소개합니다
        </p>
      </div>

      {/* Tone Selector */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold mb-2">
          <MessageSquare className="size-4 text-gray-500" />
          말투 선택
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TONES.map((t) => (
            <motion.button
              key={t.value}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTone(t.value)}
              className={`p-3 rounded-lg border text-left transition-all ${
                tone === t.value
                  ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-lg">{t.emoji}</span>
              <p className="text-xs font-semibold mt-1">{t.value}</p>
              <p className="text-[10px] text-gray-400">{t.desc}</p>
            </motion.button>
          ))}
        </div>
        {tone === "직접 입력" && (
          <Textarea
            className="mt-2"
            placeholder="예: '서울 사투리 섞어서, ~요 체로, 이모지 많이 사용'"
            value={customTone}
            onChange={(e) => setCustomTone(e.target.value)}
            rows={2}
          />
        )}
      </div>

      {/* Rules */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold mb-2">
          <ShieldCheck className="size-4 text-gray-500" />
          규칙 설정 <Badge variant="secondary" className="text-[9px] px-1.5 py-0">선택</Badge>
        </label>
        <Textarea
          placeholder={`AI가 절대 하면 안 되는 것을 적어주세요.\n\n예:\n- 경쟁사 언급 금지\n- 가격 할인 약속 금지\n- 의학적 효능 주장 금지\n- 개인정보 요청 금지`}
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          rows={4}
        />
        <div className="flex items-start gap-2 mt-2 rounded bg-amber-50 p-2">
          <ShieldCheck className="size-3.5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-[10px] text-amber-700">
            <strong>Constitutional AI 원리:</strong> {RESEARCH_FACTS.constitutionalAI.implication}
          </p>
        </div>
      </div>

      {/* System Prompt (Collapsible) */}
      <Card className="overflow-hidden">
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <span className="text-sm font-semibold">시스템 프롬프트 (고급)</span>
          <ChevronDown
            className={`size-4 text-gray-400 transition-transform ${showPrompt ? "rotate-180" : ""}`}
          />
        </button>
        {showPrompt && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            className="border-t"
          >
            <div className="p-4">
              <p className="text-[11px] text-gray-500 mb-2">
                템플릿에서 자동 생성된 프롬프트입니다. 직접 수정할 수 있습니다.
              </p>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={10}
                className="text-xs font-mono"
              />
            </div>
          </motion.div>
        )}
      </Card>
    </div>
  );
}
