import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <Link href="/" className="text-indigo-600 font-semibold text-sm hover:underline">
          ← 나우링크 홈으로
        </Link>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12 prose prose-gray">
        {children}
      </main>
      <footer className="border-t border-gray-200 mt-16 py-8 text-center text-xs text-gray-400 space-x-4">
        <Link href="/terms" className="hover:text-gray-600">이용약관</Link>
        <Link href="/privacy" className="hover:text-gray-600">개인정보처리방침</Link>
        <Link href="/refund" className="hover:text-gray-600">환불정책</Link>
        <Link href="/business" className="hover:text-gray-600">사업자정보</Link>
      </footer>
    </div>
  );
}
