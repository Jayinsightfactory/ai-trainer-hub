"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, LayoutDashboard, BookOpen, GraduationCap, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/templates", label: "템플릿", icon: Layers },
  { href: "/my-learning", label: "내 학습", icon: BookOpen },
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Bot className="size-7 text-indigo-600" />
            <span className="text-lg font-bold tracking-tight">AI Trainer Hub</span>
          </Link>

          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-1.5 text-sm ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-semibold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <link.icon className="size-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/onboarding">
            <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700">
              <Sparkles className="size-3.5" />
              시작하기
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="flex sm:hidden items-center justify-around border-t border-gray-100 px-2 py-1.5">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
          return (
            <Link key={link.href} href={link.href} className="flex flex-col items-center gap-0.5">
              <link.icon className={`size-4 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
              <span className={`text-[10px] ${isActive ? "text-indigo-600 font-semibold" : "text-gray-500"}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
