"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import LearnWizard from "@/components/learn/LearnWizard";

function LearnContent() {
  const params = useSearchParams();
  const templateId = params.get("template") || "cafe_customer_service";
  return <LearnWizard templateId={templateId} />;
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
      <LearnContent />
    </Suspense>
  );
}
