"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  Sparkles,
  Settings,
  Bot,
  PanelLeft,
  Camera,
  Lightbulb,
  BarChart3,
} from "lucide-react";
import { useWorkspace, type ViewId } from "@/store/workspace";

const NAV_ITEMS: { id: ViewId; icon: React.ElementType; label: string; href: string }[] = [
  { id: "home", icon: LayoutDashboard, label: "추천 템플릿", href: "/" },
  { id: "templates", icon: Layers, label: "템플릿", href: "/templates" },
  { id: "my-learning", icon: BookOpen, label: "내 학습", href: "/my-learning" },
  { id: "onboarding", icon: Sparkles, label: "온보딩", href: "/onboarding" },
  { id: "camera" as ViewId, icon: Camera, label: "카메라 학습", href: "/camera" },
  { id: "home" as ViewId, icon: Lightbulb, label: "AI 솔루션", href: "/solutions" },
  { id: "home" as ViewId, icon: BarChart3, label: "요금제", href: "/pricing" },
];

export default function ActivityBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeView, setActiveView, toggleSidebar } = useWorkspace();

  const handleClick = (item: (typeof NAV_ITEMS)[0]) => {
    setActiveView(item.id);
    router.push(item.href);
  };

  return (
    <div className="flex flex-col items-center w-16 bg-gray-50 border-r border-gray-200 py-2 shrink-0">
      {/* Logo */}
      <button onClick={() => handleClick(NAV_ITEMS[0])} className="mb-4 p-1.5">
        <Bot className="size-6 text-indigo-400" />
      </button>

      {/* Nav */}
      <div className="flex flex-col gap-1 flex-1 w-full px-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            activeView === item.id ||
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className={`relative flex flex-col items-center gap-0.5 w-full py-2 px-1 rounded-lg transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-indigo-400 rounded-r" />
              )}
              <item.icon className="size-4" />
              <span className="text-[9px] font-medium leading-tight text-center">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-1 w-full px-1">
        <button
          onClick={toggleSidebar}
          className="flex flex-col items-center gap-0.5 w-full py-2 px-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <PanelLeft className="size-4" />
          <span className="text-[9px] font-medium">패널</span>
        </button>
        <button
          onClick={() => { setActiveView("settings"); router.push("/"); }}
          className="flex flex-col items-center gap-0.5 w-full py-2 px-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <Settings className="size-4" />
          <span className="text-[9px] font-medium">설정</span>
        </button>
      </div>
    </div>
  );
}
