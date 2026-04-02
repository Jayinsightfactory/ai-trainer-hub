"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Coffee,
  ShoppingBag,
  Building2,
  GraduationCap,
  Megaphone,
  Briefcase,
  Brain,
  Eye,
  Mic,
  Globe,
  Sparkles,
  Check,
  ArrowRight,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CaseShowcase from "@/components/landing/CaseShowcase";

/* ------------------------------------------------------------------ */
/*  Fade-in wrapper                                                    */
/* ------------------------------------------------------------------ */
function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const steps = [
  { num: "01", title: "온보딩 (3분)", desc: "업종, 고객, 톤앤매너를 알려주세요" },
  { num: "02", title: "AI 에이전트 가동", desc: "5개 전문 에이전트가 깨어납니다" },
  { num: "03", title: "학습 팩 생성", desc: "당신만의 사업 지식이 자동 정리됩니다" },
  { num: "04", title: "결과물 자동 생성", desc: "콘텐츠, 응대, 분석이 매일 나옵니다" },
];

const industries = [
  { icon: Coffee, name: "카페 / 음식점", desc: "메뉴 소개, SNS 콘텐츠, 리뷰 응대" },
  { icon: ShoppingBag, name: "쇼핑몰", desc: "상품 설명, 고객 문의, 마케팅 문구" },
  { icon: Building2, name: "부동산", desc: "매물 설명, 고객 상담, 시장 분석" },
  { icon: GraduationCap, name: "교육", desc: "커리큘럼 설계, 학습 콘텐츠, 상담" },
  { icon: Megaphone, name: "마케팅", desc: "캠페인 기획, 카피라이팅, 리포트" },
  { icon: Briefcase, name: "전문 도메인", desc: "법률, 의료, 컨설팅 등 맞춤 지원" },
];

const agents = [
  { icon: Brain, name: "브레인 에이전트", desc: "사업 지식 학습 및 정리" },
  { icon: Eye, name: "인사이트 에이전트", desc: "트렌드 분석 및 기회 발굴" },
  { icon: Mic, name: "콘텐츠 에이전트", desc: "블로그, SNS, 이메일 자동 생성" },
  { icon: Globe, name: "고객응대 에이전트", desc: "FAQ, 채팅, 리뷰 응답 자동화" },
  { icon: Sparkles, name: "성장 에이전트", desc: "성과 분석 및 개선 제안" },
];

const pricing = [
  {
    name: "무료",
    price: "₩0",
    period: "영구 무료",
    features: [
      "AI 에이전트 1개",
      "월 30건 콘텐츠 생성",
      "기본 온보딩",
      "커뮤니티 지원",
    ],
    cta: "무료로 시작",
    highlight: false,
  },
  {
    name: "스타터",
    price: "₩29,000",
    period: "/ 월",
    features: [
      "AI 에이전트 3개",
      "월 300건 콘텐츠 생성",
      "학습 팩 5개",
      "이메일 지원",
      "기본 분석 대시보드",
    ],
    cta: "스타터 시작",
    highlight: true,
  },
  {
    name: "프로",
    price: "₩89,000",
    period: "/ 월",
    features: [
      "AI 에이전트 5개 전체",
      "무제한 콘텐츠 생성",
      "학습 팩 무제한",
      "우선 지원 (24h)",
      "고급 분석 + 인사이트",
      "커스텀 에이전트 설정",
    ],
    cta: "프로 시작",
    highlight: false,
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      {/* ===== Nav ===== */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Bot className="size-7 text-indigo-600" />
            <span className="text-lg font-bold tracking-tight">AI Trainer Hub</span>
          </Link>
          <Link href="/onboarding">
            <Button size="sm">시작하기</Button>
          </Link>
        </div>
      </nav>

      {/* ===== Mini Hero — 한줄 메시지 ===== */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-500 text-white">
        <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16 text-center">
          <FadeIn>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              AI는 <span className="text-yellow-300">학습</span>시키는 만큼 똑똑해집니다
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="mx-auto mt-4 max-w-2xl text-base text-indigo-100 sm:text-lg">
              뭘 넣었고, 어떻게 가르쳤고, 어떻게 달라졌는지 — 실제 사례를 구경하세요.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ===== Case Showcase — 학습 사례 (메인 콘텐츠, 최상단) ===== */}
      <CaseShowcase />

      {/* ===== How it works ===== */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              어떻게 작동하나요?
            </h2>
          </FadeIn>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <FadeIn key={s.num} delay={i * 0.1}>
                <div className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                  <span className="text-4xl font-extrabold text-indigo-100">{s.num}</span>
                  <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{s.desc}</p>
                  {i < steps.length - 1 && (
                    <ArrowRight className="absolute -right-5 top-1/2 hidden size-5 -translate-y-1/2 text-indigo-300 lg:block" />
                  )}
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4}>
            <div className="mt-12 text-center">
              <Link href="/learn?template=cafe_customer_service">
                <Button
                  size="lg"
                  className="h-12 gap-2 rounded-full bg-indigo-600 px-8 text-base font-semibold text-white hover:bg-indigo-700"
                >
                  지금 템플릿으로 학습 시작하기
                  <ArrowRight className="size-5" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== Industry Showcase ===== */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              어떤 업종이든, AI가 맞춰드립니다
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-gray-500">
              온보딩에서 업종만 선택하면 전문 학습 팩이 자동 구성됩니다.
            </p>
          </FadeIn>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((ind, i) => (
              <FadeIn key={ind.name} delay={i * 0.08}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="mb-2 flex size-11 items-center justify-center rounded-lg bg-indigo-50">
                      <ind.icon className="size-5 text-indigo-600" />
                    </div>
                    <CardTitle>{ind.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">{ind.desc}</p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Agents ===== */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              AI가 하는 일
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-gray-500">
              5개의 전문 에이전트가 24시간 당신의 사업을 돕습니다.
            </p>
          </FadeIn>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {agents.map((a, i) => (
              <FadeIn key={a.name} delay={i * 0.08}>
                <div className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-100">
                  <div className="flex size-12 items-center justify-center rounded-full bg-indigo-100">
                    <a.icon className="size-6 text-indigo-600" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold">{a.name}</h3>
                  <p className="mt-1 text-xs text-gray-500">{a.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <FadeIn>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              심플한 요금제
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-center text-gray-500">
              무료로 시작하고, 사업이 성장하면 업그레이드하세요.
            </p>
          </FadeIn>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {pricing.map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 0.1}>
                <Card
                  className={
                    plan.highlight
                      ? "relative border-2 border-indigo-500 shadow-lg ring-0"
                      : ""
                  }
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-medium text-white">
                      인기
                    </span>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold">{plan.price}</span>
                      <span className="text-sm text-gray-500">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <ul className="space-y-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                          <Check className="mt-0.5 size-4 shrink-0 text-indigo-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link href="/onboarding" className="mt-2">
                      <Button
                        variant={plan.highlight ? "default" : "outline"}
                        className="w-full"
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold sm:text-4xl">
              지금 바로 시작하세요
            </h2>
            <p className="mt-4 text-indigo-100">
              5분 온보딩이면 AI가 당신의 사업 파트너가 됩니다.
            </p>
            <div className="mt-8">
              <Link href="/onboarding">
                <Button
                  size="lg"
                  className="h-12 gap-2 rounded-full bg-white px-8 text-base font-semibold text-indigo-700 hover:bg-indigo-50"
                >
                  지금 5분 만에 시작하기
                  <ArrowRight className="size-5" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <Bot className="size-5 text-indigo-600" />
              <span className="font-semibold">AI Trainer Hub</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/terms" className="hover:text-gray-900">이용약관</Link>
              <Link href="/privacy" className="hover:text-gray-900">개인정보처리방침</Link>
              <Link href="/contact" className="hover:text-gray-900">문의하기</Link>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-gray-400">
            &copy; 2026 AI Trainer Hub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
