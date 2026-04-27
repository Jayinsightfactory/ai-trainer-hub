"use client";

import { useState } from "react";
import { INSTALL_PACKAGES, type InstallPackageId } from "@/app/api/service/install/route";

const BUSINESS_TYPES = [
  "카페/음식점", "쇼핑몰/이커머스", "부동산", "병원/의원",
  "학원/교육", "피트니스/헬스", "미용실/네일", "반려동물 케어",
  "자동차 정비", "기타",
];

const REGION_OPTIONS = [
  { value: "seoul", label: "서울", surcharge: 0 },
  { value: "gyeonggi", label: "경기도", surcharge: 0 },
  { value: "incheon", label: "인천", surcharge: 0 },
  { value: "other", label: "그 외 지역", surcharge: 60000 },
];

const TIME_OPTIONS = [
  "오전 10:00~12:00", "오후 13:00~15:00", "오후 15:00~17:00", "오후 17:00~19:00",
];

type FormState = {
  name: string; phone: string; email: string;
  businessName: string; businessType: string;
  address: string; region: string;
  packageId: InstallPackageId | "";
  preferDate: string; preferTime: string; memo: string;
};

const initialForm: FormState = {
  name: "", phone: "", email: "",
  businessName: "", businessType: "",
  address: "", region: "seoul",
  packageId: "",
  preferDate: "", preferTime: "", memo: "",
};

export default function InstallPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ requestId: string; totalAmount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const packages = Object.values(INSTALL_PACKAGES);
  const selectedPkg = form.packageId ? INSTALL_PACKAGES[form.packageId] : null;
  const selectedRegion = REGION_OPTIONS.find((r) => r.value === form.region);
  const totalAmount = selectedPkg
    ? selectedPkg.basePrice + (selectedRegion?.surcharge ?? 0)
    : 0;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.packageId) { setError("서비스 패키지를 선택해주세요."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/service/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSubmitted({ requestId: data.requestId, totalAmount: data.totalAmount });
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">신청 완료!</h2>
          <p className="text-gray-500 text-sm mb-4">
            영업일 1일 이내에 담당자가 연락드립니다.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left text-sm mb-6">
            <div className="flex justify-between mb-1">
              <span className="text-gray-500">신청번호</span>
              <span className="font-mono text-xs text-gray-700">{submitted.requestId.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">예상 견적</span>
              <span className="font-semibold text-indigo-600">₩{submitted.totalAmount.toLocaleString("ko-KR")}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            * 최종 금액은 현장 확인 후 조정될 수 있습니다.<br />
            * 결제는 서비스 완료 후 현장에서 진행됩니다.
          </p>
          <button
            onClick={() => { setSubmitted(null); setForm(initialForm); }}
            className="mt-6 w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
          >
            처음으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* 헤더 */}
        <div className="text-center mb-10">
          <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full mb-3">출장 설치 서비스</span>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            AI 직접 설치하기 어려우신가요?
          </h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            전문가가 직접 방문하여 로컬 AI 환경을 설치하고, 업종에 맞게 학습까지 완료해드립니다.
            <br />설치 후에는 <strong>별도 API 요금 없이</strong> 무제한으로 사용하실 수 있습니다.
          </p>
        </div>

        {/* 요금 비교 배너 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">💻</span>
              <span className="font-bold text-green-800">로컬 설치 후 사용</span>
            </div>
            <p className="text-sm text-green-700">내 PC · 서버에서 직접 AI 실행</p>
            <p className="text-2xl font-extrabold text-green-600 mt-2">
              월 추가 요금 ₩0
            </p>
            <p className="text-xs text-green-600 mt-1">설치비 1회만 → 이후 무제한 사용</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">☁️</span>
              <span className="font-bold text-amber-800">API 경유 사용</span>
            </div>
            <p className="text-sm text-amber-700">플랫폼 프록시로 AI API 호출</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-2">
              토큰 크레딧 차감
            </p>
            <p className="text-xs text-amber-600 mt-1">Haiku 기준 대화 1회 ≈ ₩1.6</p>
          </div>
        </div>

        {/* 패키지 선택 */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">서비스 패키지 선택</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setField("packageId", pkg.id as InstallPackageId)}
                className={`relative text-left border-2 rounded-xl p-5 transition-all hover:shadow-md ${
                  form.packageId === pkg.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-100 bg-white hover:border-gray-300"
                }`}
              >
                {"popular" in pkg && pkg.popular && (
                  <span className="absolute -top-2.5 left-4 bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    인기
                  </span>
                )}
                <p className="font-bold text-gray-900 mb-0.5">{pkg.name}</p>
                <p className="text-xs text-gray-400 mb-3">{pkg.duration}</p>
                <p className="text-xl font-extrabold text-indigo-600 mb-3">
                  ₩{pkg.basePrice.toLocaleString("ko-KR")}
                  <span className="text-xs text-gray-400 font-normal ml-1">(기본)</span>
                </p>
                <ul className="space-y-1">
                  {pkg.includes.map((item, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-gray-400 italic">{pkg.best}</p>
              </button>
            ))}
          </div>
          {/* 지역 추가비 안내 */}
          <p className="text-xs text-gray-400 mt-3">
            * 서울·경기·인천: 출장비 포함 / 그 외 지역: +₩60,000
          </p>
        </div>

        {/* 신청 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">신청 정보 입력</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">신청자 이름 *</label>
              <input
                type="text" required value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="홍길동"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">연락처 *</label>
              <input
                type="tel" required value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="010-0000-0000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">이메일 *</label>
              <input
                type="email" required value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="owner@example.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">업체명 *</label>
              <input
                type="text" required value={form.businessName}
                onChange={(e) => setField("businessName", e.target.value)}
                placeholder="홍길동 카페"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">업종 *</label>
              <select
                required value={form.businessType}
                onChange={(e) => setField("businessType", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">선택해주세요</option>
                {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">지역 *</label>
              <select
                required value={form.region}
                onChange={(e) => setField("region", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {REGION_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}{r.surcharge > 0 ? ` (+₩${r.surcharge.toLocaleString("ko-KR")})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">방문 주소 *</label>
            <input
              type="text" required value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              placeholder="서울시 강남구 테헤란로 123, 2층"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">희망 방문일 *</label>
              <input
                type="date" required value={form.preferDate}
                min={new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0]}
                onChange={(e) => setField("preferDate", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">희망 시간대 *</label>
              <select
                required value={form.preferTime}
                onChange={(e) => setField("preferTime", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">선택해주세요</option>
                {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">추가 요청사항</label>
            <textarea
              value={form.memo} rows={3}
              onChange={(e) => setField("memo", e.target.value)}
              placeholder="PC 사양, 특이사항, 원하는 기능 등을 자유롭게 적어주세요."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* 예상 금액 요약 */}
          {selectedPkg && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">{selectedPkg.name} 기본가</span>
                <span className="font-medium">₩{selectedPkg.basePrice.toLocaleString("ko-KR")}</span>
              </div>
              {(selectedRegion?.surcharge ?? 0) > 0 && (
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">지방 출장비</span>
                  <span className="font-medium">+₩{(selectedRegion!.surcharge).toLocaleString("ko-KR")}</span>
                </div>
              )}
              <div className="border-t border-indigo-200 pt-2 mt-2 flex items-center justify-between">
                <span className="font-bold text-gray-900">예상 견적</span>
                <span className="text-xl font-extrabold text-indigo-600">
                  ₩{totalAmount.toLocaleString("ko-KR")}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                * 결제는 서비스 완료 후 현장에서 진행됩니다 (카드·현금·계좌이체 가능)
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !form.packageId}
            className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                신청 처리 중...
              </span>
            ) : (
              "출장 설치 신청하기"
            )}
          </button>

          <p className="text-xs text-gray-400 text-center mt-3">
            신청 후 영업일 1일 이내 담당자가 연락드려 일정을 확정합니다
          </p>
        </form>

        {/* FAQ */}
        <div className="mt-8 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">자주 묻는 질문</h3>
          <div className="space-y-4 text-sm">
            {[
              { q: "설치 후 월 사용료가 없나요?", a: "네, 로컬 AI는 내 PC·서버에서 실행되어 API 요금이 발생하지 않습니다. 플랫폼 구독료(월 최대 ₩79,900)만 있습니다." },
              { q: "PC 사양이 낮아도 괜찮나요?", a: "기본 설치 패키지는 일반 노트북(RAM 8GB+)에서도 동작합니다. 방문 전 사양 확인 후 적합한 모델을 선택해드립니다." },
              { q: "설치 후 학습 데이터는 직접 추가할 수 있나요?", a: "네, 플랫폼 온보딩 화면에서 사장님이 직접 추가·수정 가능합니다. 표준 패키지 이상은 사용법 교육이 포함됩니다." },
              { q: "나중에 모델을 업그레이드하고 싶으면?", a: "추가 방문 없이 플랫폼에서 모델 교체가 가능합니다. 필요 시 재방문 서비스(₩80,000~)도 제공합니다." },
            ].map(({ q, a }) => (
              <div key={q}>
                <p className="font-semibold text-gray-800">Q. {q}</p>
                <p className="text-gray-500 mt-0.5">A. {a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
