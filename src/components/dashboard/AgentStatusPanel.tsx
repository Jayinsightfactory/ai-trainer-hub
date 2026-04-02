"use client";

import { motion } from "framer-motion";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";

interface AgentTask {
  label: string;
  detail: string;
  status: "done" | "running";
}

const tasks: AgentTask[] = [
  { label: "리뷰 답글 자동 생성", detail: "오늘 12건 처리", status: "done" },
  { label: "인스타 포스팅 예약", detail: "내일 오전 11시", status: "done" },
  { label: "경쟁사 모니터링", detail: "매일 자동", status: "done" },
  { label: "트렌드 추적", detail: "이번 주: 디카페인, 비건", status: "done" },
  { label: "식재료 발주 추천", detail: "POS 연동 대기 중", status: "running" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function AgentStatusPanel() {
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const totalCount = tasks.length;
  const progressValue = Math.round((doneCount / totalCount) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-lg">자동으로 돌아가고 있는 것들</span>
          <Badge variant="secondary" className="text-xs">
            {doneCount}/{totalCount} 활성
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progressValue}>
          <ProgressLabel>에이전트 가동률</ProgressLabel>
          <ProgressValue />
        </Progress>

        <motion.ul
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {tasks.map((task, i) => (
            <motion.li
              key={i}
              variants={item}
              className="flex items-center justify-between rounded-lg border px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                {task.status === "done" ? (
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                ) : (
                  <RefreshCw className="size-4 text-amber-500 animate-spin shrink-0" />
                )}
                <span className="font-medium text-sm">{task.label}</span>
              </div>
              <Badge
                variant={task.status === "done" ? "secondary" : "outline"}
                className="text-xs"
              >
                {task.detail}
              </Badge>
            </motion.li>
          ))}
        </motion.ul>
      </CardContent>
    </Card>
  );
}
