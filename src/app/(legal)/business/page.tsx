import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "사업자 정보 | 나우링크",
  description: "나우링크 사업자 등록 정보",
};

export default function BusinessPage() {
  const info = [
    { label: "상호명", value: "나우링크 (NowLink)" },
    { label: "서비스명", value: "나우링크 AI 학습 플랫폼" },
    { label: "대표자", value: "임재용" },
    { label: "사업자등록번호", value: "등록 예정" },
    { label: "통신판매업 신고번호", value: "신고 예정" },
    { label: "소재지", value: "대한민국" },
    { label: "이메일", value: "support@nowlink.kr" },
    { label: "서비스 URL", value: "https://www.nowlink.kr" },
    { label: "호스팅 제공자", value: "Railway Inc." },
  ];

  return (
    <article className="space-y-8 text-gray-700 leading-relaxed">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">사업자 정보</h1>
        <p className="text-sm text-gray-400">전자상거래법 제10조에 따른 사업자 정보 고지</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {info.map(({ label, value }, i) => (
              <tr key={label} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="px-5 py-3.5 font-medium text-gray-600 w-40 border-r border-gray-100">
                  {label}
                </td>
                <td className="px-5 py-3.5 text-gray-800">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500">
        사업자등록번호 및 통신판매업 신고번호는 사업자 등록 완료 후 업데이트됩니다.
        이전까지 서비스 이용 시 발생하는 법적 관계는 대표자 임재용과 이용자 간에
        성립합니다.
      </p>
    </article>
  );
}
