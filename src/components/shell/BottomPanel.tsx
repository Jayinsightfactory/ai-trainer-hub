"use client";

import { useState } from "react";
import { useWorkspace } from "@/store/workspace";
import {
  MessageSquare,
  ScrollText,
  Bell,
  Send,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
} from "lucide-react";

function AgentLogsTab() {
  const { agentLogs } = useWorkspace();
  const statusIcon = {
    info: <Info className="size-3 text-blue-400" />,
    success: <CheckCircle2 className="size-3 text-emerald-400" />,
    warning: <AlertTriangle className="size-3 text-amber-400" />,
    error: <XCircle className="size-3 text-red-400" />,
  };

  return (
    <div className="font-mono text-[11px] leading-relaxed p-2 space-y-0.5 overflow-y-auto h-full" style={{ scrollbarWidth: "thin" }}>
      {agentLogs.map((log, i) => (
        <div key={i} className="flex items-start gap-2 hover:bg-gray-100 px-1 rounded">
          <span className="text-gray-400 shrink-0">[{log.time}]</span>
          {statusIcon[log.status]}
          <span className="text-indigo-400 shrink-0">{log.agent}:</span>
          <span className="text-gray-700">{log.message}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 px-1 text-gray-400 animate-pulse">
        <span>[{new Date().toLocaleTimeString("ko-KR", { hour12: false })}]</span>
        <span>대기 중...</span>
      </div>
    </div>
  );
}

function AIChatTab() {
  const [input, setInput] = useState("");
  const [messages] = useState([
    { role: "system" as const, text: "AI Trainer Hub 어시스턴트입니다. 무엇을 도와드릴까요?" },
  ]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2 space-y-2" style={{ scrollbarWidth: "thin" }}>
        {messages.map((m, i) => (
          <div key={i} className="text-xs text-gray-500">
            <span className="text-indigo-400 font-semibold">AI:</span> {m.text}
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); setInput(""); }}
        className="flex gap-1 p-2 border-t border-gray-200"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="질문을 입력하세요..."
          className="flex-1 bg-gray-100 text-xs text-gray-700 rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button type="submit" className="p-1.5 bg-indigo-600 rounded hover:bg-indigo-700">
          <Send className="size-3 text-white" />
        </button>
      </form>
    </div>
  );
}

function NotificationsTab() {
  const notifications = [
    { type: "success", text: "해피카페 학습 팩 — 품질 점수 62점 달성", time: "2분 전" },
    { type: "warning", text: "트렌드샵 — 경쟁사 가격 변동 감지 (-15%)", time: "5분 전" },
    { type: "info", text: "인스타그램 릴스 조회수 1,200회 (3배 증가)", time: "12분 전" },
    { type: "success", text: "주간 브리핑 자동 생성 완료", time: "30분 전" },
  ];

  return (
    <div className="p-2 space-y-1 overflow-y-auto h-full" style={{ scrollbarWidth: "thin" }}>
      {notifications.map((n, i) => (
        <div key={i} className="flex items-start gap-2 text-xs p-1.5 hover:bg-gray-100 rounded">
          {n.type === "success" && <CheckCircle2 className="size-3.5 text-emerald-400 mt-0.5 shrink-0" />}
          {n.type === "warning" && <AlertTriangle className="size-3.5 text-amber-400 mt-0.5 shrink-0" />}
          {n.type === "info" && <Info className="size-3.5 text-blue-400 mt-0.5 shrink-0" />}
          <div className="flex-1">
            <span className="text-gray-700">{n.text}</span>
            <span className="text-gray-400 ml-2">{n.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

const TABS = [
  { id: "logs" as const, icon: ScrollText, label: "에이전트 로그" },
  { id: "chat" as const, icon: MessageSquare, label: "AI 채팅" },
  { id: "notifications" as const, icon: Bell, label: "알림" },
];

export default function BottomPanel() {
  const { bottomPanelOpen, bottomPanelTab, toggleBottomPanel, setBottomPanelTab } = useWorkspace();

  if (!bottomPanelOpen) {
    return (
      <div className="flex items-center gap-2 px-2 h-7 bg-gray-50 border-t border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setBottomPanelTab(tab.id)}
            className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700"
          >
            <tab.icon className="size-3" />
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 border-t border-gray-200">
      {/* Tab bar */}
      <div className="flex items-center h-8 border-b border-gray-200 px-1 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setBottomPanelTab(tab.id)}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-t transition-colors ${
              bottomPanelTab === tab.id
                ? "text-gray-900 bg-gray-100"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="size-3" />
            {tab.label}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={toggleBottomPanel} className="p-1 text-gray-500 hover:text-gray-700">
          <ChevronDown className="size-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {bottomPanelTab === "logs" && <AgentLogsTab />}
        {bottomPanelTab === "chat" && <AIChatTab />}
        {bottomPanelTab === "notifications" && <NotificationsTab />}
      </div>
    </div>
  );
}
