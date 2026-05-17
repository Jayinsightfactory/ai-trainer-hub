"use client";
import { useState } from "react";

export interface SystemInfo {
  buildTime: string;
  nodeEnv: string;
  pageUrl: string;
  iframeSrc: string;
  enginePath: string;
  engineExists: boolean;
  envPresence: Record<string, boolean>;
  adminEmails: string[];
  apiEndpoints: { method: string; path: string; desc: string }[];
  filePaths: { label: string; path: string; desc: string }[];
}

/**
 * /contents 우상단 부유 [⚙] 버튼 → 슬라이드아웃 사이드바.
 * 모든 서버 구성·env 존재여부·API 경로·파일 경로를 한 화면에 표시.
 * 관리자 전용 페이지이므로 안전하게 노출 가능.
 */
export default function SystemInfoPanel({ info }: { info: SystemInfo }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        title="시스템 정보 / 서버 구성"
        className="fixed top-3 right-3 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white shadow-lg backdrop-blur transition hover:bg-black/90"
      >
        {open ? "✕" : "⚙"}
      </button>
      {open && (
        <aside className="fixed top-0 right-0 z-40 h-screen w-[420px] overflow-y-auto border-l border-white/10 bg-[#0a0a0f] p-5 text-[12px] leading-relaxed text-white shadow-2xl">
          <h2 className="mb-3 mt-1 text-[15px] font-bold tracking-tight">
            🛠 시스템 정보
            <span className="ml-2 text-[10px] font-normal text-white/40">관리자 전용</span>
          </h2>

          <Section title="📦 서버 구성">
            <Row k="환경" v={info.nodeEnv} />
            <Row k="빌드 시각" v={info.buildTime} />
            <Row k="페이지 URL" v={info.pageUrl} />
            <Row k="iframe src" v={info.iframeSrc} mono />
          </Section>

          <Section title="🔐 관리자 게이팅">
            <Row k="관리자 이메일" v={info.adminEmails.length > 0 ? info.adminEmails.join(", ") : "(없음)"} />
            <Row k="검사 위치" v="src/app/contents/layout.tsx" mono />
            <Row k="헬퍼" v="src/lib/admin.ts → isAdmin(email)" mono />
            <Row k="비관리자 응답" v="404 (notFound)" />
          </Section>

          <Section title="🪄 콘텐츠 파이프라인 엔진">
            <Row k="엔진 경로" v={info.enginePath} mono />
            <Row k="파일 존재" v={info.engineExists ? "✓" : "✗ (없음)"} bad={!info.engineExists} />
            <Row k="언어" v="Python 3 (표준 라이브러리만)" />
            <Row k="실행 방식" v="child_process.spawn — 비동기, 180s 타임아웃" />
          </Section>

          <Section title="🌐 API 엔드포인트">
            {info.apiEndpoints.map((e) => (
              <div key={e.path} className="mb-2 rounded border border-white/10 bg-white/5 p-2">
                <div className="font-mono text-[11px]">
                  <span className="mr-2 text-[#FFD93D]">{e.method}</span>
                  <span className="text-[#00D4AA]">{e.path}</span>
                </div>
                <div className="mt-1 text-[10px] text-white/60">{e.desc}</div>
              </div>
            ))}
          </Section>

          <Section title="📁 수정할 파일 위치">
            {info.filePaths.map((f) => (
              <div key={f.path} className="mb-2 rounded border border-white/10 bg-white/5 p-2">
                <div className="font-mono text-[10px] break-all text-[#00D4AA]">{f.path}</div>
                <div className="mt-1 text-[10px] text-white/60">{f.desc}</div>
                <div className="mt-1 text-[10px] text-white/40">{f.label}</div>
              </div>
            ))}
          </Section>

          <Section title="🔑 환경변수 존재 여부">
            <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
              {Object.entries(info.envPresence).map(([k, ok]) => (
                <div
                  key={k}
                  className={`rounded px-2 py-1 ${ok ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}
                >
                  {ok ? "✓" : "✗"} {k}
                </div>
              ))}
            </div>
            <div className="mt-2 text-[10px] text-white/40">
              값은 보안상 노출하지 않음. 누락된 키는 .env.local 에 추가하거나 Railway 환경변수에 등록.
            </div>
          </Section>

          <Section title="📌 빠른 참조 (재배포 트리거)">
            <Row k="GitHub" v="Jayinsightfactory/ai-trainer-hub" mono />
            <Row k="브랜치" v="master" mono />
            <Row k="배포" v="Railway (Dockerfile)" />
            <Row k="Python 설치" v="alpine apk add python3 (Dockerfile 내)" />
          </Section>
        </aside>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5 border-t border-white/10 pt-3">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/50">{title}</h3>
      {children}
    </section>
  );
}

function Row({ k, v, mono = false, bad = false }: { k: string; v: string; mono?: boolean; bad?: boolean }) {
  return (
    <div className="mb-1 grid grid-cols-[100px_1fr] items-baseline gap-2">
      <div className="text-[10px] text-white/40">{k}</div>
      <div className={`break-all text-[11px] ${mono ? "font-mono" : ""} ${bad ? "text-red-300" : "text-white/90"}`}>
        {v}
      </div>
    </div>
  );
}
