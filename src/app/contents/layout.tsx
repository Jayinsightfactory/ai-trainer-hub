import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

/**
 * /contents 와 그 하위 라우트는 관리자 전용.
 * - 비로그인 → 로그인 페이지로 redirect (404로 가리지 않음)
 * - 로그인했으나 관리자 아님 → 안내 페이지 표시 (왜 막혔는지 명시)
 */
export default async function ContentsLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    redirect("/api/auth/signin?callbackUrl=%2Fcontents");
  }
  if (!isAdmin(email)) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#06060c", color: "#e6e6f0", fontFamily: "system-ui, sans-serif", padding: 24 }}>
        <div style={{ maxWidth: 520, background: "#0e0e18", border: "1px solid #2a2a3a", borderRadius: 12, padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>관리자 전용 페이지</h1>
          <p style={{ fontSize: 13, color: "#9a9ab0", lineHeight: 1.6, marginBottom: 16 }}>
            현재 로그인 계정 <code style={{ background: "#1a1a28", padding: "2px 6px", borderRadius: 4, color: "#FFD93D" }}>{email}</code>은 카드뉴스 파이프라인 접근 권한이 없습니다.
            <br />Railway <code>ADMIN_EMAILS</code> 환경변수에 이 이메일을 추가하면 접근 가능합니다.
          </p>
          <a href="/" style={{ display: "inline-block", padding: "10px 18px", background: "#6C63FF", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>← 홈으로</a>
        </div>
      </main>
    );
  }
  return <>{children}</>;
}

// 검색엔진/사이트맵 노출 차단
export const metadata = {
  title: "Contents Pipeline · NowLink",
  robots: { index: false, follow: false },
};
