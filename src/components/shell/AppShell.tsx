"use client";

import ActivityBar from "./ActivityBar";
import Sidebar from "./Sidebar";
import BottomPanel from "./BottomPanel";
import MobileNav from "./MobileNav";
import UserButton from "./UserButton";
import { useWorkspace } from "@/store/workspace";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, bottomPanelOpen } = useWorkspace();

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-white text-gray-800">

      {/* ── 모바일 상단 헤더 (md 미만에서만) ── */}
      <header className="flex md:hidden items-center justify-between px-4 h-11 border-b border-gray-200 bg-white shrink-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-indigo-600">AI Trainer Hub</span>
        </div>
        <UserButton />
      </header>

      {/* ── 메인 레이아웃 ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* 데스크탑: 왼쪽 ActivityBar */}
        <div className="hidden md:flex">
          <ActivityBar />
        </div>

        {/* 데스크탑: 사이드바 */}
        {!sidebarCollapsed && (
          <div className="hidden md:block w-56 shrink-0 border-r border-gray-200">
            <Sidebar />
          </div>
        )}

        {/* 메인 콘텐츠 + 하단 패널 */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* 데스크탑 전용 상단 우측 유저버튼 */}
          <div className="hidden md:flex items-center justify-end px-4 py-2 border-b border-gray-100 shrink-0">
            <UserButton />
          </div>

          {/* 스크롤 가능한 콘텐츠 */}
          <div
            className="flex-1 overflow-y-auto pb-16 md:pb-0"
            style={{ scrollbarWidth: "thin" }}
          >
            {children}
          </div>

          {/* 데스크탑: 하단 패널 */}
          <div className="hidden md:block">
            {bottomPanelOpen ? (
              <div className="h-52 shrink-0">
                <BottomPanel />
              </div>
            ) : (
              <BottomPanel />
            )}
          </div>
        </div>
      </div>

      {/* 모바일: 하단 탭 네비게이션 */}
      <MobileNav />
    </div>
  );
}
