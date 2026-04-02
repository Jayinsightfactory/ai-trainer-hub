"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Database, Mic, FileSpreadsheet, ChevronRight, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";

interface LearningItem {
  icon: React.ReactNode;
  label: string;
  unlock: string;
  connected: boolean;
}

const items: LearningItem[] = [
  {
    icon: <Database className="size-4" />,
    label: "POS 데이터 연결",
    unlock: "매출 예측 가능",
    connected: false,
  },
  {
    icon: <Mic className="size-4" />,
    label: "사장님 음성 녹음",
    unlock: "답글 톤 개선",
    connected: false,
  },
  {
    icon: <FileSpreadsheet className="size-4" />,
    label: "메뉴 원가표",
    unlock: "수익성 분석 가능",
    connected: false,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function LearningProgress() {
  const connectedCount = items.filter((i) => i.connected).length;
  const level = connectedCount === 0 ? 35 : connectedCount === 1 ? 55 : connectedCount === 2 ? 75 : 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">AI가 더 똑똑해지려면</CardTitle>
        <CardDescription>
          데이터를 연결할수록 AI가 사장님 사업을 더 잘 이해해요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Learning Level Gauge */}
        <div className="space-y-1">
          <Progress value={level}>
            <ProgressLabel>AI 학습 레벨</ProgressLabel>
            <ProgressValue />
          </Progress>
          <p className="text-xs text-muted-foreground">
            {level < 50
              ? "기본 정보만으로 운영 중. 데이터를 추가하면 훨씬 정확해져요!"
              : level < 80
                ? "좋아요! 조금만 더 연결하면 고급 분석이 가능해요."
                : "거의 완벽해요! AI가 최고 성능으로 동작 중입니다."}
          </p>
        </div>

        {/* Checklist */}
        <motion.ul
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {items.map((dataItem, i) => (
            <motion.li
              key={i}
              variants={item}
              className="flex items-center justify-between rounded-lg border px-3 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center size-8 rounded-full ${
                    dataItem.connected
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {dataItem.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{dataItem.label}</p>
                  <p className="text-xs text-muted-foreground">
                    <ChevronRight className="inline size-3" /> {dataItem.unlock}
                  </p>
                </div>
              </div>
              <Button size="sm" variant={dataItem.connected ? "secondary" : "outline"}>
                {dataItem.connected ? "연결됨" : "미리보기"}
              </Button>
            </motion.li>
          ))}
        </motion.ul>

        <Link href="/templates" className="block mt-4">
          <Button variant="outline" className="w-full gap-2">
            학습 템플릿으로 강화하기 <ArrowRight className="size-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
