"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  ChevronLeft,
  Coffee,
  ShoppingBag,
  Building2,
  GraduationCap,
  Megaphone,
  Briefcase,
  Pencil,
  MessageSquare,
  FileText,
  BarChart3,
  Zap,
  Camera,
  FileArchive,
  Star,
  Mic,
  XCircle,
  Sparkles,
  Clock,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useOnboardingStore } from "@/store/onboarding";
import { BeforeAfterPreview } from "./BeforeAfterPreview";
import { LearningGauge } from "./LearningGauge";

/* ─── animation variants ─── */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

const bubbleVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

/* ─── data ─── */
const industryOptions = [
  { label: "카페/음식점", icon: Coffee },
  { label: "쇼핑몰", icon: ShoppingBag },
  { label: "부동산", icon: Building2 },
  { label: "교육", icon: GraduationCap },
  { label: "마케팅/크리에이터", icon: Megaphone },
  { label: "전문 도메인", icon: Briefcase },
  { label: "직접 입력", icon: Pencil },
];

const purposeOptions = [
  { label: "고객 응대 자동화", icon: MessageSquare },
  { label: "콘텐츠 제작", icon: FileText },
  { label: "데이터 분석", icon: BarChart3 },
  { label: "업무 효율화", icon: Zap },
];

const dataOptions = [
  { label: "사진/영상", icon: Camera },
  { label: "문서/파일", icon: FileArchive },
  { label: "고객 리뷰", icon: Star },
  { label: "음성 녹음", icon: Mic },
  { label: "없음", icon: XCircle },
];

const templateMap: Record<string, string> = {
  "카페/음식점": "카페 AI 어시스턴트",
  "쇼핑몰": "이커머스 AI 상담봇",
  "부동산": "부동산 매물 AI 안내",
  "교육": "교육 AI 튜터",
  "마케팅/크리에이터": "마케팅 AI 크리에이터",
  "전문 도메인": "전문 도메인 AI 어시스턴트",
};

/* industry+purpose → template ID mapping for learn page */
const templateIdMap: Record<string, string> = {
  "카페/음식점_고객 응대 자동화": "cafe_customer_service",
  "카페/음식점_콘텐츠 제작": "text-content-sns",
  "쇼핑몰_고객 응대 자동화": "text-cs-ecommerce",
  "교육_콘텐츠 제작": "text-edu-tutor",
};

function getTemplateId(industry: string, purpose: string): string {
  return templateIdMap[`${industry}_${purpose}`] ?? "text-cs-cafe";
}

/* ─── sub-components ─── */
function AiMessage({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      className="flex items-start gap-2.5"
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.35, delay }}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Bot className="h-4 w-4" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm leading-relaxed">
        {children}
      </div>
    </motion.div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <motion.div
      className="flex justify-end"
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.25 }}
    >
      <div className="max-w-[70%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
        {text}
      </div>
    </motion.div>
  );
}

/* ─── step components ─── */
function Step0() {
  const { industry, setIndustry, nextStep } = useOnboardingStore();
  const [customInput, setCustomInput] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const handleSelect = useCallback(
    (label: string) => {
      if (label === "직접 입력") {
        setShowCustom(true);
        return;
      }
      setIndustry(label);
      nextStep();
    },
    [setIndustry, nextStep]
  );

  const handleCustomSubmit = useCallback(() => {
    if (customInput.trim()) {
      setIndustry(customInput.trim());
      nextStep();
    }
  }, [customInput, setIndustry, nextStep]);

  return (
    <div className="flex flex-col gap-4">
      <AiMessage>
        안녕하세요! 👋
        <br />
        어떤 분야의 AI를 만들고 싶으세요?
      </AiMessage>

      <motion.div
        className="ml-10 grid grid-cols-2 gap-2 sm:grid-cols-3"
        variants={bubbleVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {industryOptions.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => handleSelect(label)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all hover:border-primary hover:bg-primary/5 ${
              industry === label
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence>
        {showCustom && (
          <motion.div
            className="ml-10 flex gap-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Input
              placeholder="분야를 입력해 주세요"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
              className="h-9"
              autoFocus
            />
            <Button size="sm" onClick={handleCustomSubmit} disabled={!customInput.trim()}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Step1() {
  const { industry, purpose, setPurpose, nextStep } = useOnboardingStore();

  const handleSelect = useCallback(
    (label: string) => {
      setPurpose(label);
      nextStep();
    },
    [setPurpose, nextStep]
  );

  return (
    <div className="flex flex-col gap-4">
      <UserBubble text={industry} />
      <AiMessage delay={0.15}>
        좋아요! <strong>{industry}</strong>이시군요! 🎉
        <br />
        AI가 어떤 일을 하면 좋겠어요?
      </AiMessage>

      <motion.div
        className="ml-10 grid grid-cols-2 gap-2"
        variants={bubbleVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.3, delay: 0.35 }}
      >
        {purposeOptions.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => handleSelect(label)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all hover:border-primary hover:bg-primary/5 ${
              purpose === label
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </motion.div>
    </div>
  );
}

function Step2() {
  const {
    purpose,
    businessName,
    setBusinessName,
    existingData,
    setExistingData,
    nextStep,
  } = useOnboardingStore();

  const toggleData = useCallback(
    (item: string) => {
      if (item === "없음") {
        setExistingData(["없음"]);
        return;
      }
      const next = existingData.includes(item)
        ? existingData.filter((d) => d !== item)
        : [...existingData.filter((d) => d !== "없음"), item];
      setExistingData(next);
    },
    [existingData, setExistingData]
  );

  const canProceed = businessName.trim().length > 0 && existingData.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <UserBubble text={purpose} />
      <AiMessage delay={0.15}>
        <strong>{purpose}</strong>, 좋은 선택이에요! ✨
        <br />
        매장/사업장 이름이 뭐예요?
      </AiMessage>

      <motion.div
        className="ml-10"
        variants={bubbleVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Input
          placeholder="예: 해피카페, 트렌드샵..."
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="h-9"
          autoFocus
        />
      </motion.div>

      {businessName.trim() && (
        <>
          <AiMessage delay={0.1}>
            이미 가지고 있는 자료가 있나요? (여러 개 선택 가능)
          </AiMessage>

          <motion.div
            className="ml-10 flex flex-wrap gap-2"
            variants={bubbleVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            {dataOptions.map(({ label, icon: Icon }) => {
              const isSelected = existingData.includes(label);
              return (
                <button
                  key={label}
                  onClick={() => toggleData(label)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:border-primary hover:bg-primary/5 ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              );
            })}
          </motion.div>

          <motion.div
            className="ml-10"
            variants={bubbleVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.25, delay: 0.4 }}
          >
            <Button onClick={nextStep} disabled={!canProceed} size="lg" className="w-full">
              다음으로
            </Button>
          </motion.div>
        </>
      )}
    </div>
  );
}

function Step3() {
  const { industry, purpose, businessName, existingData } =
    useOnboardingStore();

  const matchedTemplate =
    templateMap[industry] ?? `${industry} AI 어시스턴트`;

  const templateId = getTemplateId(industry, purpose);

  const estimatedMinutes = useMemo(() => {
    let t = 3;
    if (existingData.includes("사진/영상")) t += 2;
    if (existingData.includes("문서/파일")) t += 1;
    if (existingData.includes("고객 리뷰")) t += 1;
    if (existingData.includes("음성 녹음")) t += 2;
    return t;
  }, [existingData]);

  return (
    <div className="flex flex-col gap-4">
      <UserBubble
        text={`${businessName} / ${existingData.join(", ")}`}
      />

      <AiMessage delay={0.1}>
        완벽해요! 🚀 모든 준비가 끝났어요.
        <br />
        <strong>{businessName}</strong>을 위한 AI를 만들어 볼게요!
      </AiMessage>

      <motion.div
        className="ml-10 flex flex-col gap-4"
        variants={bubbleVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        {/* Summary card */}
        <Card>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{industry}</Badge>
              <Badge variant="secondary">{purpose}</Badge>
              <Badge variant="outline">{businessName}</Badge>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>
                자동 매칭 템플릿: <strong>{matchedTemplate}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>예상 소요 시간: 약 {estimatedMinutes}분</span>
            </div>
          </CardContent>
        </Card>

        {/* Before / After */}
        <BeforeAfterPreview />

        {/* Learning Gauge */}
        <Card>
          <CardContent>
            <LearningGauge />
          </CardContent>
        </Card>

        {/* CTA */}
        <Link href={`/learn?template=${templateId}`} className="block">
          <Button size="lg" className="w-full text-base font-semibold">
            <Sparkles className="mr-2 h-4 w-4" />
            시작하기
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

/* ─── main wizard ─── */
export function OnboardingWizard() {
  const { currentStep, prevStep } = useOnboardingStore();
  const [direction, setDirection] = useState(1);

  const handleBack = useCallback(() => {
    setDirection(-1);
    prevStep();
  }, [prevStep]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        {currentStep > 0 && (
          <Button variant="ghost" size="icon-sm" onClick={handleBack}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i <= currentStep ? "w-8 bg-primary" : "w-4 bg-muted"
              }`}
            />
          ))}
        </div>
        <span className="ml-auto text-xs text-muted-foreground">
          {currentStep + 1} / 4
        </span>
      </div>

      {/* Chat area */}
      <div className="min-h-[480px] rounded-2xl border bg-card/50 p-4 sm:p-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onAnimationComplete={() => setDirection(1)}
          >
            {currentStep === 0 && <Step0 />}
            {currentStep === 1 && <Step1 />}
            {currentStep === 2 && <Step2 />}
            {currentStep === 3 && <Step3 />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
