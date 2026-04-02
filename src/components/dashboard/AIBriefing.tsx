"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Lightbulb, Eye, Pencil, ThumbsUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type BriefingType = "success" | "warning" | "insight";

interface BriefingItem {
  type: BriefingType;
  label: string;
  message: string;
  detail?: string;
}

const briefings: BriefingItem[] = [
  {
    type: "success",
    label: "성과",
    message: "인스타 릴스 조회수 1,200회! 평소 대비 3배.",
    detail: "어제 올린 '라떼아트 비하인드' 릴스가 반응 폭발. 댓글 32개, 저장 89회.",
  },
  {
    type: "warning",
    label: "주의",
    message: '네이버 리뷰에 "웨이팅 길다" 3건',
    detail: "최근 일주일간 비슷한 리뷰 3건. 자동 답글 초안을 준비했어요.",
  },
  {
    type: "insight",
    label: "인사이트",
    message: "경쟁사 B카페가 '오후 할인' 시작",
    detail: "B카페가 오후 2-4시 20% 할인 시작. 우리도 대응 전략을 제안해드릴까요?",
  },
];

const typeConfig: Record<
  BriefingType,
  { icon: React.ReactNode; bg: string; border: string; badgeCls: string; iconCls: string }
> = {
  success: {
    icon: <CheckCircle2 className="size-5" />,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badgeCls: "bg-emerald-100 text-emerald-700 border-emerald-200",
    iconCls: "text-emerald-600",
  },
  warning: {
    icon: <AlertTriangle className="size-5" />,
    bg: "bg-amber-50",
    border: "border-amber-200",
    badgeCls: "bg-amber-100 text-amber-700 border-amber-200",
    iconCls: "text-amber-600",
  },
  insight: {
    icon: <Lightbulb className="size-5" />,
    bg: "bg-blue-50",
    border: "border-blue-200",
    badgeCls: "bg-blue-100 text-blue-700 border-blue-200",
    iconCls: "text-blue-600",
  },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function AIBriefing() {
  return (
    <section className="space-y-5">
      {/* AI Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-start gap-3"
      >
        <Avatar size="lg">
          <AvatarFallback className="bg-primary text-primary-foreground text-base font-bold">
            AI
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1 pt-1">
          <p className="text-lg font-semibold">
            사장님, 오늘 <span className="text-primary">3가지</span> 알려드릴게요:
          </p>
          <p className="text-sm text-muted-foreground">
            오늘 오전 9시 기준 브리핑이에요.
          </p>
        </div>
      </motion.div>

      {/* Briefing Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {briefings.map((b, i) => {
          const cfg = typeConfig[b.type];
          return (
            <motion.div key={i} variants={item}>
              <Card className={`${cfg.bg} ${cfg.border} border`}>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 ${cfg.iconCls}`}>{cfg.icon}</span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={cfg.badgeCls}>{b.label}</Badge>
                      </div>
                      <p className="font-medium leading-snug">{b.message}</p>
                      {b.detail && (
                        <p className="text-sm text-muted-foreground">{b.detail}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 pl-8">
                    <Button size="sm" variant="default">
                      <ThumbsUp className="size-3.5" />
                      승인
                    </Button>
                    <Button size="sm" variant="outline">
                      <Pencil className="size-3.5" />
                      수정
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Eye className="size-3.5" />
                      보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
