"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  Lightbulb,
  Camera,
} from "lucide-react";
import { useWorkspace, type ViewId } from "@/store/workspace";

const NAV_ITEMS: { id: ViewId; icon: React.ElementType; label: string; href: string }[] = [
  { id: "home",        icon: LayoutDashboard, label: "홈",       href: "/" },
  { id: "templates",   icon: Layers,          label: "템플릿",   href: "/templates" },
  { id: "my-learning", icon: BookOpen,         label: "내 학습",  href: "/my-learning" },
  { id: "home" as ViewId, icon: Lightbulb,    label: "솔루션",   href: "/solutions" },
  { id: "camera",      icon: Camera,           label: "카메라",   href: "/camera" },
];

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeView, setActiveView } = useWorkspace();

  const handleClick = (item: (typeof NAV_ITEMS)[0]) => {
    setActiveView(item.id);
    router.push(item.href);
  };

  return (
    <nav className="
      fixed bottom-0 left-0 right-0 z-50
      flex md:hidden
      bg-white border-t border-gray-200
      safe-area-pb
    ">
      {NAV_ITEMS.map((item) => {
        const isActive =
          activeView === item.id ||
          pathname === item.href ||
          (item.href !== "/" && pathname?.startsWith(item.href));

        return (
          <button
            key={item.id}
            onClick={() => handleClick(item)}
            className={`
              flex-1 flex flex-col items-center justify-center
              py-3 min-h-[56px] gap-0.5 relative
              transition-colors
              ${isActive ? "text-indigo-600" : "text-gray-400"}
            `}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-500 rounded-b-full" />
            )}
            <item.icon className="size-5" strokeWidth={isActive ? 2.5 : 1.8} />
            <span className={`text-[10px] font-medium ${isActive ? "text-indigo-600" : "text-gray-400"}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
