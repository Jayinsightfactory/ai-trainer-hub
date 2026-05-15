import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

/**
 * /contents 와 그 하위 라우트는 관리자 전용.
 * 비관리자는 404로 응답해 페이지 자체가 존재하지 않는 것처럼 보이게 한다.
 */
export default async function ContentsLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    notFound();
  }
  return <>{children}</>;
}

// 검색엔진/사이트맵 노출 차단
export const metadata = {
  title: "Contents Pipeline · NowLink",
  robots: { index: false, follow: false },
};
