import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 | 나우링크",
  description: "나우링크 서비스 이용약관",
};

export default function TermsPage() {
  return (
    <article className="space-y-8 text-gray-700 leading-relaxed">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">이용약관</h1>
        <p className="text-sm text-gray-400">시행일: 2026년 4월 27일</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">제1조 (목적)</h2>
        <p>
          이 약관은 나우링크(이하 &ldquo;회사&rdquo;)가 제공하는 AI 학습 운영 플랫폼
          서비스(이하 &ldquo;서비스&rdquo;)의 이용 조건 및 절차, 회사와 이용자 간의 권리·의무
          및 책임사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">제2조 (정의)</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>&ldquo;서비스&rdquo;란 회사가 제공하는 AI 학습·배포·운영 플랫폼 일체를 말합니다.</li>
          <li>&ldquo;이용자&rdquo;란 이 약관에 동의하고 서비스를 이용하는 자를 말합니다.</li>
          <li>&ldquo;유료 서비스&rdquo;란 베이직·스탠다드·프리미엄 요금제 등 월 구독 결제가 필요한 서비스를 말합니다.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">제3조 (약관의 게시 및 개정)</h2>
        <p>
          회사는 이 약관을 서비스 화면에 게시합니다. 약관을 개정할 경우 최소 7일 전에
          공지하며, 불이익한 변경의 경우 30일 전에 공지합니다.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">제4조 (서비스 이용)</h2>
        <p>
          서비스는 소셜 계정(카카오·네이버·구글) 로그인 후 이용할 수 있습니다. 무료 플랜은
          월 100건의 AI 응답을 제공하며, 초과 시 유료 요금제 전환이 필요합니다.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">제5조 (금지행위)</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>서비스를 이용한 불법·유해 콘텐츠 생성</li>
          <li>타인의 정보를 도용하거나 허위 정보 입력</li>
          <li>서비스 시스템에 과부하를 일으키는 행위</li>
          <li>회사의 사전 동의 없는 상업적 재판매</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">제6조 (서비스 중단)</h2>
        <p>
          회사는 시스템 점검·장애·천재지변 등의 사유로 서비스를 일시 중단할 수 있습니다.
          예정된 중단은 사전에 공지합니다.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">제7조 (책임 제한)</h2>
        <p>
          회사는 AI 출력물의 정확성·완전성을 보증하지 않습니다. AI 결과물을 기반으로 한
          이용자의 결정 및 행위에 대한 책임은 이용자에게 있습니다.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">제8조 (분쟁 해결)</h2>
        <p>
          서비스 이용과 관련한 분쟁은 회사 소재지를 관할하는 법원을 1심 법원으로 합니다.
        </p>
      </section>

      <div className="text-sm text-gray-400 pt-4 border-t border-gray-100">
        문의: support@nowlink.kr
      </div>
    </article>
  );
}
