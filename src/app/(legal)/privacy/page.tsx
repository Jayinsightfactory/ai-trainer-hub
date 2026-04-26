import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 나우링크",
  description: "나우링크 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <article className="space-y-8 text-gray-700 leading-relaxed">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">개인정보처리방침</h1>
        <p className="text-sm text-gray-400">시행일: 2026년 4월 27일</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">1. 수집하는 개인정보 항목</h2>
        <p>회사는 서비스 제공을 위해 아래와 같이 개인정보를 수집합니다.</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>소셜 로그인 시: 이름, 이메일 주소, 프로필 사진 (OAuth 제공 범위 내)</li>
          <li>서비스 이용 시: 학습 데이터, 채팅 이력, 결제 정보(카드 번호 제외)</li>
          <li>자동 수집: IP 주소, 접속 일시, 브라우저 정보, 서비스 이용 기록</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">2. 개인정보 수집·이용 목적</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>서비스 제공 및 계정 관리</li>
          <li>결제 처리 및 요금 청구</li>
          <li>서비스 품질 개선 및 통계 분석</li>
          <li>법령상 의무 이행</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">3. 개인정보 보유·이용 기간</h2>
        <p>
          회원 탈퇴 시 즉시 파기하는 것을 원칙으로 합니다. 단, 관계 법령에 따라 일정 기간
          보존이 필요한 정보는 해당 기간 동안 보관합니다.
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>계약·청약 철회 기록: 5년 (전자상거래법)</li>
          <li>소비자 불만·분쟁 처리 기록: 3년 (전자상거래법)</li>
          <li>접속 로그: 3개월 (통신비밀보호법)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">4. 개인정보 제3자 제공</h2>
        <p>
          회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 단, 결제 처리를 위해
          토스페이먼츠(주)에 최소한의 결제 정보를 제공합니다.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">5. 개인정보 처리 위탁</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Railway Inc. — 서버 호스팅</li>
          <li>Anthropic PBC — AI API 처리 (입력 데이터 학습에 미사용)</li>
          <li>토스페이먼츠(주) — 결제 처리</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">6. 이용자의 권리</h2>
        <p>
          이용자는 언제든지 본인의 개인정보 조회·수정·삭제·처리 정지를 요청할 수 있습니다.
          요청은 support@nowlink.kr로 이메일 발송하거나, 서비스 내 계정 설정에서 직접 처리할 수 있습니다.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">7. 개인정보 보호책임자</h2>
        <p>성명: 나우링크 개인정보 보호팀<br />이메일: privacy@nowlink.kr</p>
      </section>

      <div className="text-sm text-gray-400 pt-4 border-t border-gray-100">
        개인정보 침해 신고: 개인정보보호위원회 (www.pipc.go.kr / 국번없이 182)
      </div>
    </article>
  );
}
