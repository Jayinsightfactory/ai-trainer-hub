"use client";

/**
 * 사장님 온보딩 폼 — /onboarding/[storeId]
 * 업종별 질문에 답변 → 챗봇 지식베이스 자동 구성
 */

import { useState, useEffect, use } from "react";
import { getQuestionsForCategory, QuestionSection } from "@/lib/question-bank";

interface StoreInfo {
  id: string;
  businessName: string;
  businessType: string;
  slug: string;
}

type SaveStatus = "idle" | "saving" | "done" | "error";

export default function OnboardingPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = use(params);

  const [store, setStore] = useState<StoreInfo | null>(null);
  const [sections, setSections] = useState<QuestionSection[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState(0);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/chat/${storeId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.id) {
          setStore(d);
          const qs = getQuestionsForCategory(d.businessType ?? "cafe");
          setSections(qs);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [storeId]);

  const totalQuestions = sections.flatMap((s) => s.questions).length;
  const answeredCount = Object.values(answers).filter((v) => v.trim()).length;
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  async function handleSave() {
    if (!store) return;
    setStatus("saving");

    try {
      const res = await fetch("/api/knowledge/bulk-ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeAgentId: storeId,
          answers,
          category: store.businessType,
          businessName: store.businessName,
        }),
      });

      const data = await res.json() as { ok?: boolean; saved?: number; error?: string };
      if (data.ok) {
        setSavedCount(data.saved ?? 0);
        setStatus("done");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">로딩 중...</div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">매장 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">챗봇 학습 완료!</h2>
          <p className="text-gray-500 mb-4">
            <strong>{savedCount}개</strong> 카테고리의 답변이 챗봇에 저장됐습니다.
          </p>
          <div className="bg-indigo-50 rounded-xl p-4 text-left mb-6">
            <p className="text-sm text-indigo-700 font-medium mb-2">이제 챗봇이 답변할 수 있어요:</p>
            <ul className="text-sm text-indigo-600 space-y-1">
              <li>✓ 영업시간 & 휴무일</li>
              <li>✓ 메뉴/서비스 & 가격</li>
              <li>✓ 예약 방법 & 취소 정책</li>
              <li>✓ 주차 & 편의시설</li>
              <li>✓ 자주 묻는 모든 질문</li>
            </ul>
          </div>
          <p className="text-xs text-gray-400">
            고객이 챗봇에서 새 질문을 하면 카카오 알림이 옵니다.<br />
            답변하시면 그 답변도 즉시 학습됩니다.
          </p>
        </div>
      </div>
    );
  }

  const currentSection = sections[activeSection];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <span className="text-indigo-600 font-bold text-sm">나우링크</span>
            <span className="text-gray-300 mx-2">|</span>
            <span className="text-gray-600 text-sm">{store.businessName} 챗봇 설정</span>
          </div>
          <span className="text-xs text-gray-400">{answeredCount}/{totalQuestions} 답변</span>
        </div>
        {/* 진행 바 */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-indigo-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* 인트로 */}
        {activeSection === 0 && answeredCount === 0 && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 mb-6 text-white">
            <div className="text-2xl mb-2">👋 안녕하세요, 사장님!</div>
            <p className="text-indigo-100 text-sm leading-relaxed">
              아래 질문들에 답변해 주시면 챗봇이 고객 질문의 <strong>85% 이상</strong>을 자동으로 답변합니다.
              답변할수록 챗봇이 똑똑해지고, 사장님이 직접 응대하는 시간이 줄어듭니다.
            </p>
          </div>
        )}

        {/* 섹션 탭 */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
          {sections.map((s, i) => {
            const filled = s.questions.filter((q) => answers[q.id]?.trim()).length;
            return (
              <button
                key={i}
                onClick={() => setActiveSection(i)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  i === activeSection
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300"
                }`}
              >
                {s.icon} {s.title}
                {filled > 0 && (
                  <span className={`ml-1.5 text-xs ${i === activeSection ? "text-indigo-200" : "text-indigo-500"}`}>
                    {filled}/{s.questions.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 현재 섹션 질문들 */}
        <div className="space-y-4">
          {currentSection?.questions.map((q) => {
            const answered = !!answers[q.id]?.trim();
            return (
              <div
                key={q.id}
                className={`bg-white rounded-xl p-4 border transition-all ${
                  answered ? "border-indigo-200 bg-indigo-50/30" : "border-gray-200"
                }`}
              >
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  {q.required && <span className="text-red-400 mr-1">*</span>}
                  {q.question}
                  {answered && <span className="ml-2 text-indigo-500 text-xs">✓</span>}
                </label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-gray-300 bg-white"
                  rows={2}
                  placeholder={q.placeholder}
                  value={answers[q.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                />
              </div>
            );
          })}
        </div>

        {/* 이전/다음 네비게이션 */}
        <div className="flex gap-3 mt-6">
          {activeSection > 0 && (
            <button
              onClick={() => setActiveSection((i) => i - 1)}
              className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
            >
              ← 이전
            </button>
          )}

          {activeSection < sections.length - 1 ? (
            <button
              onClick={() => setActiveSection((i) => i + 1)}
              className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
            >
              다음 →
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={status === "saving" || answeredCount === 0}
              className="flex-1 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:bg-gray-300 transition"
            >
              {status === "saving" ? "저장 중..." : `💾 챗봇에 학습시키기 (${answeredCount}개 답변)`}
            </button>
          )}
        </div>

        {/* 중간 저장 버튼 */}
        {activeSection < sections.length - 1 && answeredCount > 0 && (
          <button
            onClick={handleSave}
            disabled={status === "saving"}
            className="w-full mt-3 py-2.5 rounded-xl border border-green-400 text-green-600 text-sm font-medium hover:bg-green-50 transition"
          >
            {status === "saving" ? "저장 중..." : `지금 바로 저장하기 (${answeredCount}개)`}
          </button>
        )}

        {status === "error" && (
          <p className="text-center text-red-500 text-sm mt-3">저장 실패. 다시 시도해주세요.</p>
        )}

        <p className="text-center text-xs text-gray-400 mt-5">
          모든 답변을 입력하지 않아도 저장 가능합니다.<br />
          나중에 다시 방문해서 추가 입력하면 덮어써집니다.
        </p>
      </div>
    </div>
  );
}
