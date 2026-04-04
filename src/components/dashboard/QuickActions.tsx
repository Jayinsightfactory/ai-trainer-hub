"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Video, MessageSquareText, BarChart3, TrendingUp, ArrowRight, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickAction {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  href: string;
}

const actions: QuickAction[] = [
  {
    icon: <Video className="size-5" />,
    title: "숏폼 대본 생성",
    description: "30초 릴스/숏츠 대본을 AI가 작성",
    color: "bg-violet-100 text-violet-600",
    href: "/learn?template=text-content-creation",
  },
  {
    icon: <MessageSquareText className="size-5" />,
    title: "리뷰 답글 작성",
    description: "네이버/구글 리뷰에 맞춤 답글",
    color: "bg-emerald-100 text-emerald-600",
    href: "/learn?template=text-cs-cafe",
  },
  {
    icon: <BarChart3 className="size-5" />,
    title: "경쟁사 분석",
    description: "주변 경쟁사 동향 한눈에 보기",
    color: "bg-amber-100 text-amber-600",
    href: "/templates",
  },
  {
    icon: <TrendingUp className="size-5" />,
    title: "트렌드 리포트",
    description: "업종별 최신 트렌드 요약",
    color: "bg-blue-100 text-blue-600",
    href: "/templates",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

export default function QuickActions() {
  const router = useRouter();

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">빠른 작업</h2>

      {/* Prominent learn more card */}
      <Link href="/templates">
        <Card className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-all cursor-pointer mb-3">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">AI 더 학습시키기</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                학습 템플릿으로 AI를 더 똑똑하게 만들어 보세요
              </p>
            </div>
            <ArrowRight className="size-5 text-primary" />
          </CardContent>
        </Card>
      </Link>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {actions.map((action, i) => (
          <motion.div key={i} variants={item}>
            <Card
              className="hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer group"
              onClick={() => router.push(action.href)}
            >
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className={`flex items-center justify-center size-10 rounded-xl ${action.color}`}>
                    {action.icon}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {action.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full justify-between text-xs"
                  onClick={(e) => { e.stopPropagation(); router.push(action.href); }}
                >
                  시작하기
                  <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
