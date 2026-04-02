"use client";

import { Progress } from "@/components/ui/progress";
import { useOnboardingStore } from "@/store/onboarding";
import { Check, Lock } from "lucide-react";

const levels = [
  {
    level: 1,
    title: "기본 설정",
    description: "간단한 문의 응대",
    condition: () => true,
  },
  {
    level: 2,
    title: "+자료 업로드",
    description: "정확한 정보 안내",
    condition: (data: string[]) =>
      data.some((d) => ["사진/영상", "문서/파일", "고객 리뷰", "음성 녹음"].includes(d)),
  },
  {
    level: 3,
    title: "+말투 학습",
    description: "자연스러운 응대",
    condition: (data: string[]) => data.length >= 2 && !data.includes("없음"),
  },
  {
    level: 4,
    title: "+분석+트렌드",
    description: "마케팅 콘텐츠 자동 생성",
    condition: (data: string[]) => data.length >= 3 && !data.includes("없음"),
  },
];

export function LearningGauge() {
  const existingData = useOnboardingStore((s) => s.existingData);

  const currentLevel = levels.reduce((acc, lvl) => {
    return lvl.condition(existingData) ? lvl.level : acc;
  }, 0);

  const progressValue = (currentLevel / 4) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">학습 레벨</span>
        <span className="text-xs text-muted-foreground">
          Lv.{currentLevel} / 4
        </span>
      </div>

      <Progress value={progressValue} />

      <div className="grid grid-cols-4 gap-2">
        {levels.map((lvl) => {
          const isActive = currentLevel >= lvl.level;
          return (
            <div
              key={lvl.level}
              className={`flex flex-col items-center gap-1 rounded-lg p-2 text-center transition-all ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "bg-muted/50 text-muted-foreground"
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isActive ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Lock className="h-3 w-3" />
                )}
              </div>
              <span className="text-[10px] font-semibold leading-tight">
                Lv.{lvl.level}
              </span>
              <span className="text-[10px] leading-tight">{lvl.title}</span>
              <span className="text-[9px] leading-tight opacity-70">
                {lvl.description}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
