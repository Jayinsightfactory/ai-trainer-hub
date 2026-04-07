"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, User, Settings, ChevronDown } from "lucide-react";
import Image from "next/image";

export default function UserButton() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 로딩 중
  if (status === "loading") {
    return <div className="size-7 rounded-full bg-gray-200 animate-pulse" />;
  }

  // 비로그인
  if (!session) {
    return (
      <button
        onClick={() => router.push("/auth/signin")}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
      >
        <LogIn className="size-3.5" />
        <span className="hidden sm:inline">로그인</span>
      </button>
    );
  }

  // 로그인 상태
  const userName = session.user?.name || "사용자";
  const userImage = session.user?.image;
  const userEmail = session.user?.email || "";
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg hover:bg-gray-100 p-1 transition-colors"
      >
        {/* 아바타 */}
        {userImage ? (
          <Image
            src={userImage}
            alt={userName}
            width={28}
            height={28}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="size-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {initial}
          </div>
        )}
        <span className="hidden sm:inline text-xs font-medium text-gray-700 max-w-[80px] truncate">
          {userName}
        </span>
        <ChevronDown className={`size-3 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* 드롭다운 */}
      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {/* 유저 정보 */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800 truncate">{userName}</p>
            <p className="text-[11px] text-gray-400 truncate">{userEmail}</p>
          </div>

          {/* 메뉴 */}
          <div className="py-1">
            <button
              onClick={() => { router.push("/my-learning"); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="size-4 text-gray-400" />
              내 학습 현황
            </button>
            <button
              onClick={() => { router.push("/onboarding"); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="size-4 text-gray-400" />
              설정
            </button>
          </div>

          {/* 로그아웃 */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="size-4" />
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
