"use client";

import Link from "next/link";
import { motion, type Easing } from "framer-motion";
import {
  BookOpen,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Lock,
  BarChart3,
  Brain,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/* ───────────────────────── Mock Data ───────────────────────── */

const inProgressPacks = [
  {
    id: "happy-cafe-cs",
    name: "해피카페 고객응대 AI",
    level: 2,
    maxLevel: 4,
    quality: 62,
    startedAgo: "3일 전 시작",
    progressPercent: 50,
    templateSlug: "happy-cafe-cs",
  },
  {
    id: "trend-shop-desc",
    name: "트렌드샵 상품설명 AI",
    level: 1,
    maxLevel: 4,
    quality: 30,
    startedAgo: "오늘 시작",
    progressPercent: 25,
    templateSlug: "trend-shop-desc",
  },
];

const completedPacks = [
  {
    id: "happy-cafe-sns",
    name: "해피카페 SNS 콘텐츠",
    level: 4,
    maxLevel: 4,
    quality: 92,
    completedAgo: "일주일 전 완료",
    before: "SNS 글 작성에 2시간 소요, 반응 저조",
    after: "AI가 5분 내 초안 생성, 참여율 3배 증가",
  },
  {
    id: "realestate-consult",
    name: "동네부동산 매물상담",
    level: 3,
    maxLevel: 4,
    quality: 85,
    completedAgo: "2주 전 완료",
    before: "매물 문의 응대에 하루 평균 3시간",
    after: "AI 자동응대로 응대 시간 80% 절감",
  },
  {
    id: "english-academy",
    name: "영어학원 학부모상담",
    level: 3,
    maxLevel: 4,
    quality: 88,
    completedAgo: "3주 전 완료",
    before: "학부모 문의에 일일이 수동 답변",
    after: "AI가 맞춤형 상담 답변 자동 생성",
  },
];

const savedTemplates = [
  {
    id: "manufacturing-defect",
    name: "제조 불량 검출 AI",
    tier: "pro" as const,
    icon: Brain,
  },
  {
    id: "restaurant-demand",
    name: "음식점 수요 예측",
    tier: "starter" as const,
    icon: BarChart3,
  },
  {
    id: "meeting-notes",
    name: "회의록 자동화",
    tier: "starter" as const,
    icon: BookOpen,
  },
  {
    id: "robot-manipulation",
    name: "로봇 매니퓰레이션 가이드",
    tier: "pro" as const,
    icon: Brain,
  },
];

/* ───────────────────────── Helpers ──────────────────────────── */

function qualityColor(q: number) {
  if (q >= 85) return "text-emerald-600 dark:text-emerald-400";
  if (q >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-500 dark:text-red-400";
}


/* ───────────────────────── Animations ──────────────────────── */

const easeOut: Easing = [0, 0, 0.58, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: easeOut },
  }),
};

/* ───────────────────────── Components ──────────────────────── */

function StatsRow() {
  const stats = [
    { label: "진행 중", value: "2개", icon: Clock, color: "text-blue-500" },
    {
      label: "완료",
      value: "3개",
      icon: CheckCircle,
      color: "text-emerald-500",
    },
    {
      label: "총 학습 데이터",
      value: "47건",
      icon: BarChart3,
      color: "text-violet-500",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <Card size="sm">
              <CardContent className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center size-9 rounded-lg bg-muted ${s.color}`}
                >
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold leading-tight">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

function InProgressCard({
  pack,
  index,
}: {
  pack: (typeof inProgressPacks)[0];
  index: number;
}) {
  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={fadeUp}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{pack.name}</CardTitle>
            <Badge variant="secondary">
              Lv.{pack.level}/{pack.maxLevel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{pack.startedAgo}</span>
            <span className={qualityColor(pack.quality)}>
              품질 {pack.quality}점
            </span>
          </div>

          <Progress value={pack.progressPercent}>
            <ProgressLabel>진행률</ProgressLabel>
            <ProgressValue />
          </Progress>

          <Link href={`/learn?template=${pack.templateSlug}`}>
            <Button className="w-full gap-2">
              계속 학습하기
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CompletedCard({
  pack,
  index,
}: {
  pack: (typeof completedPacks)[0];
  index: number;
}) {
  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={fadeUp}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{pack.name}</CardTitle>
            <Badge variant="default">
              <CheckCircle className="size-3 mr-1" />
              Lv.{pack.level}/{pack.maxLevel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{pack.completedAgo}</span>
            <span className={qualityColor(pack.quality)}>
              품질 {pack.quality}점
            </span>
          </div>

          {/* Before / After summary */}
          <div className="rounded-lg bg-muted/60 p-3 space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="shrink-0 font-medium text-red-500">Before</span>
              <span className="text-muted-foreground">{pack.before}</span>
            </div>
            <div className="flex gap-2">
              <span className="shrink-0 font-medium text-emerald-500">
                After
              </span>
              <span className="text-muted-foreground">{pack.after}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full gap-1.5">
                <BarChart3 className="size-3.5" />
                대시보드에서 보기
              </Button>
            </Link>
            <Link href={`/learn?template=${pack.id}`} className="flex-1">
              <Button variant="secondary" className="w-full gap-1.5">
                <Star className="size-3.5" />
                더 학습시키기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TemplateCard({
  template,
  index,
}: {
  template: (typeof savedTemplates)[0];
  index: number;
}) {
  const Icon = template.icon;
  const isPro = template.tier === "pro";

  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={fadeUp}>
      <Card size="sm">
        <CardContent className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-muted">
            <Icon className="size-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{template.name}</p>
              <Badge variant={isPro ? "default" : "secondary"}>
                {isPro ? "pro" : "starter"}
              </Badge>
            </div>
          </div>
          {isPro ? (
            <Button variant="outline" size="sm" disabled className="gap-1.5 shrink-0">
              <Lock className="size-3" />
              구독 필요
            </Button>
          ) : (
            <Link href={`/learn?template=${template.id}`}>
              <Button size="sm" className="gap-1.5 shrink-0">
                학습 시작
                <ArrowRight className="size-3" />
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ───────────────────────── Page ─────────────────────────────── */

export default function MyLearningPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">내 학습</h1>
        <p className="text-sm text-muted-foreground mt-1">
          내 AI 에이전트들의 학습 현황과 저장한 템플릿을 한눈에 확인하세요.
        </p>
      </div>

      {/* Stats */}
      <StatsRow />

      {/* Tabs */}
      <Tabs defaultValue={0}>
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value={0}>
            <Clock className="size-3.5" />
            진행 중
          </TabsTrigger>
          <TabsTrigger value={1}>
            <CheckCircle className="size-3.5" />
            완료
          </TabsTrigger>
          <TabsTrigger value={2}>
            <Star className="size-3.5" />
            저장한 템플릿
          </TabsTrigger>
        </TabsList>

        {/* 진행 중 */}
        <TabsContent value={0} className="mt-4 space-y-4">
          {inProgressPacks.map((pack, i) => (
            <InProgressCard key={pack.id} pack={pack} index={i} />
          ))}
        </TabsContent>

        {/* 완료 */}
        <TabsContent value={1} className="mt-4 space-y-4">
          {completedPacks.map((pack, i) => (
            <CompletedCard key={pack.id} pack={pack} index={i} />
          ))}
        </TabsContent>

        {/* 저장한 템플릿 */}
        <TabsContent value={2} className="mt-4 space-y-3">
          {savedTemplates.map((t, i) => (
            <TemplateCard key={t.id} template={t} index={i} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
