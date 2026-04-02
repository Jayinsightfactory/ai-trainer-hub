"use client";

import ActivityBar from "./ActivityBar";
import Sidebar from "./Sidebar";
import BottomPanel from "./BottomPanel";
import { useWorkspace } from "@/store/workspace";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, bottomPanelOpen } = useWorkspace();

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-white text-gray-800">
      {/* Activity Bar */}
      <ActivityBar />

      {/* Sidebar */}
      {!sidebarCollapsed && (
        <div className="w-56 shrink-0 border-r border-gray-200">
          <Sidebar />
        </div>
      )}

      {/* Center + Bottom */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {children}
        </div>

        {/* Bottom Panel */}
        {bottomPanelOpen && (
          <div className="h-52 shrink-0">
            <BottomPanel />
          </div>
        )}
        {!bottomPanelOpen && <BottomPanel />}
      </div>
    </div>
  );
}
