"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface BusinessInfo {
  id: string;
  name: string;
  category: string;
  address: string;
  phone?: string;
  naverPlaceUrl: string;
  naverPlaceId: string;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  contactStatus: "pending" | "contacted" | "responded" | "converted";
  collectedAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  cafe: "카페",
  restaurant: "식당",
  fitness: "헬스장",
  pilates: "필라테스",
  study_cafe: "스터디카페",
  beauty: "미용실",
  nail: "네일샵",
  academy: "학원",
};

const STATUS_CONFIG: Record<
  BusinessInfo["contactStatus"],
  { label: string; className: string }
> = {
  pending: {
    label: "대기중",
    className: "bg-gray-100 text-gray-700",
  },
  contacted: {
    label: "연락완료",
    className: "bg-blue-100 text-blue-700",
  },
  responded: {
    label: "응답함",
    className: "bg-yellow-100 text-yellow-700",
  },
  converted: {
    label: "전환완료",
    className: "bg-green-100 text-green-700",
  },
};

const CHANNEL_OPTIONS = [
  { value: "kakao", label: "카카오" },
  { value: "naver", label: "네이버" },
  { value: "sms", label: "SMS" },
  { value: "email", label: "이메일" },
] as const;

type Channel = "kakao" | "naver" | "email" | "sms";

export default function MarketingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [businesses, setBusinesses] = useState<BusinessInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sending, setSending] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel>("kakao");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchBusinesses();
  }, [status]);

  async function fetchBusinesses() {
    setLoading(true);
    try {
      const res = await fetch("/api/marketing/businesses");
      if (res.ok) {
        const data = await res.json();
        setBusinesses(data);
      } else {
        // Fallback: load from public path or use empty
        setBusinesses([]);
      }
    } catch {
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleOutreach(businessId: string) {
    setSending(businessId);
    try {
      const res = await fetch("/api/marketing/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, channel: selectedChannel }),
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: data.message, type: "success" });
        setBusinesses((prev) =>
          prev.map((b) =>
            b.id === businessId ? { ...b, contactStatus: "contacted" } : b
          )
        );
      } else {
        setToast({ message: data.error || "전송 실패", type: "error" });
      }
    } catch {
      setToast({ message: "네트워크 오류가 발생했습니다", type: "error" });
    } finally {
      setSending(null);
      setTimeout(() => setToast(null), 3000);
    }
  }

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      const catOk = filterCategory === "all" || b.category === filterCategory;
      const statusOk = filterStatus === "all" || b.contactStatus === filterStatus;
      return catOk && statusOk;
    });
  }, [businesses, filterCategory, filterStatus]);

  const stats = useMemo(() => {
    const total = businesses.length;
    const contacted = businesses.filter((b) => b.contactStatus !== "pending").length;
    const responded = businesses.filter((b) =>
      ["responded", "converted"].includes(b.contactStatus)
    ).length;
    const converted = businesses.filter((b) => b.contactStatus === "converted").length;
    return { total, contacted, responded, converted };
  }, [businesses]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(businesses.map((b) => b.category)));
  }, [businesses]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">마케팅 자동화</h1>
          <p className="text-sm text-gray-500 mt-1">
            네이버 플레이스 업체 자동 수집 및 마케팅 연락 관리
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "총 수집", value: stats.total, color: "text-gray-900" },
            { label: "연락완료", value: stats.contacted, color: "text-blue-600" },
            { label: "응답", value: stats.responded, color: "text-yellow-600" },
            { label: "전환", value: stats.converted, color: "text-green-600" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
            >
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters & Channel Selector */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center">
          {/* Category filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">업종</label>
            <select
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">전체</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat] || cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">상태</label>
            <select
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">전체</option>
              {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                <option key={val} value={val}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>

          {/* Channel selector */}
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-xs text-gray-500 whitespace-nowrap">발송 채널</label>
            <div className="flex gap-1">
              {CHANNEL_OPTIONS.map((ch) => (
                <button
                  key={ch.value}
                  onClick={() => setSelectedChannel(ch.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    selectedChannel === ch.value
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </div>

          {/* Collect button */}
          <button
            onClick={() => window.open("/api/marketing/collect", "_blank")}
            className="text-sm px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
          >
            + 업체 수집
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    업체명
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    업종
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    주소
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    평점
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    수집일
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-gray-400 text-sm"
                    >
                      조건에 맞는 업체가 없습니다
                    </td>
                  </tr>
                ) : (
                  filtered.map((business) => {
                    const statusCfg = STATUS_CONFIG[business.contactStatus];
                    const isLoading = sending === business.id;
                    return (
                      <tr key={business.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <a
                            href={business.naverPlaceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                          >
                            {business.name}
                          </a>
                          {business.phone && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {business.phone}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                            {CATEGORY_LABELS[business.category] || business.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell max-w-[200px] truncate">
                          {business.address}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {business.rating ? (
                            <span className="text-xs text-gray-700">
                              ⭐ {business.rating}
                              {business.reviewCount && (
                                <span className="text-gray-400 ml-1">
                                  ({business.reviewCount.toLocaleString()})
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.className}`}
                          >
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 hidden sm:table-cell">
                          {new Date(business.collectedAt).toLocaleDateString("ko-KR")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleOutreach(business.id)}
                            disabled={
                              isLoading || business.contactStatus === "converted"
                            }
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              business.contactStatus === "converted"
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : isLoading
                                ? "bg-indigo-100 text-indigo-400 cursor-not-allowed"
                                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
                            }`}
                          >
                            {isLoading ? (
                              <>
                                <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                                전송중
                              </>
                            ) : business.contactStatus === "converted" ? (
                              "전환완료"
                            ) : (
                              "연락 보내기"
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-50 text-xs text-gray-400">
              총 {filtered.length}개 업체 표시 중 (전체 {businesses.length}개)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
