import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "환불정책 | 나우링크",
  description: "나우링크 환불 및 취소 정책",
};

export default function RefundPage() {
  return (
    <article className="space-y-8 text-gray-700 leading-relaxed">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">환불정책</h1>
        <p className="text-sm text-gray-400">시행일: 2026년 4월 27일</p>
      </div>

      <section className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
        <h2 className="text-base font-semibold text-indigo-800 mb-2">핵심 요약</h2>
        <ul className="text-sm text-indigo-700 space-y-1 list-disc list-inside">
          <li>구독 결제일로부터 <strong>7일 이내</strong> 미사용 시 전액 환불</li>
          <li>7일 초과 또는 서비스 이용 내역이 있는 경우 환불 불가</li>
          <li>월 구독은 취소 즉시 다음 결제 중단 (당월 잔여 기간 이용 가능)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">1. 환불 가능 조건</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>전액 환불:</strong> 결제일로부터 7일 이내이고, AI 학습팩을 1회도 생성하지
            않은 경우
          </li>
          <li>
            <strong>부분 환불 불가:</strong> 월 정기 구독 특성상 일할 계산 환불은 제공되지
            않습니다.
          </li>
          <li>
            <strong>회사 귀책 사유:</strong> 서비스 장애로 24시간 이상 서비스 이용이 불가한
            경우 장애 시간 비율에 따라 환불합니다.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">2. 환불 신청 방법</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>support@nowlink.kr로 이메일 발송</li>
          <li>제목: [환불신청] 가입 이메일 + 결제일</li>
          <li>영업일 기준 3일 이내 처리 (카드사 환불은 3~5 영업일 추가 소요)</li>
        </ol>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">3. 구독 취소 방법</h2>
        <p>
          서비스 내 <strong>설정 → 요금제 → 구독 취소</strong>에서 직접 취소할 수 있습니다.
          취소 즉시 다음 결제가 중단되며, 당월 잔여 기간은 계속 이용 가능합니다.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">4. 전자상거래법 준수</h2>
        <p>
          본 환불정책은 전자상거래 등에서의 소비자보호에 관한 법률 제17조(청약철회 등)에
          따라 운영됩니다. 디지털 콘텐츠 특성상 이용이 개시된 경우 청약철회가 제한될 수
          있으며, 이 경우 사전에 명확히 고지합니다.
        </p>
      </section>

      <div className="text-sm text-gray-400 pt-4 border-t border-gray-100">
        환불 문의: support@nowlink.kr | 운영시간: 평일 10:00~18:00
      </div>
    </article>
  );
}
