import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as _prisma } from "@/lib/prisma";

// ─── 패키지 정의 ────────────────────────────────────────────────

export const INSTALL_PACKAGES = {
  basic_install: {
    id: "basic_install",
    name: "기본 설치",
    duration: "1~2시간",
    basePrice: 150000,
    includes: [
      "Ollama 설치 및 환경 설정",
      "한국어 최적화 모델 다운로드 (Qwen2.5 7B)",
      "기본 챗봇 시스템 프롬프트 설정",
      "동작 확인 테스트",
    ],
    best: "간단한 챗봇 응대가 목적인 매장",
  },
  standard: {
    id: "standard",
    name: "표준 패키지",
    duration: "3~4시간",
    basePrice: 320000,
    includes: [
      "기본 설치 포함 전체",
      "업종별 RAG 지식베이스 구성",
      "메뉴·FAQ·정책 데이터 입력 지원",
      "카카오 채널 또는 웹 위젯 연동",
      "에스컬레이션 알림 설정",
      "담당자 1시간 사용법 교육",
    ],
    best: "업종 맞춤 AI를 빠르게 운영하고 싶은 매장",
    popular: true,
  },
  expert: {
    id: "expert",
    name: "전문가 패키지",
    duration: "1일 (6~8시간)",
    basePrice: 650000,
    includes: [
      "표준 패키지 포함 전체",
      "LoRA 파인튜닝 환경 구축 (GPU 서버 포함)",
      "맞춤 데이터 수집·정제 가이드",
      "1회 파인튜닝 학습 완료 및 배포",
      "모델 성능 평가 리포트",
      "추후 재학습 방법 교육 (2시간)",
    ],
    best: "고품질 전용 AI 모델이 필요한 기업·브랜드",
  },
} as const;

export type InstallPackageId = keyof typeof INSTALL_PACKAGES;

// 지역별 출장비 추가
const REGION_SURCHARGE: Record<string, number> = {
  seoul: 0,
  gyeonggi: 0,
  incheon: 0,
  other: 60000,
};

function calcTotal(packageId: InstallPackageId, region: string): number {
  const base = INSTALL_PACKAGES[packageId]?.basePrice ?? 0;
  const surcharge = REGION_SURCHARGE[region] ?? 60000;
  return base + surcharge;
}

// Prisma 타입 확장 (migrate 전)
type EP = typeof _prisma & {
  installRequest: {
    create: (a: object) => Promise<{ id: string; totalAmount: number }>;
    findMany: (a: object) => Promise<Array<{ id: string; name: string; status: string; packageId: string; preferDate: string; createdAt: Date }>>;
    findUnique: (a: object) => Promise<{ id: string; status: string } | null>;
    update: (a: object) => Promise<{ id: string }>;
  };
};
const prisma = _prisma as EP;

// ─── POST: 출장 설치 신청 ─────────────────────────────────────

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  try {
    const body = await request.json() as {
      name: string;
      phone: string;
      email: string;
      businessName: string;
      businessType: string;
      address: string;
      region: string;
      packageId: string;
      preferDate: string;
      preferTime: string;
      memo?: string;
    };

    const { name, phone, email, businessName, businessType, address, region, packageId, preferDate, preferTime, memo } = body;

    // 필수 필드 검증
    if (!name || !phone || !email || !businessName || !address || !packageId || !preferDate || !preferTime) {
      return NextResponse.json({ error: "필수 항목을 모두 입력해주세요." }, { status: 400 });
    }
    if (!(packageId in INSTALL_PACKAGES)) {
      return NextResponse.json({ error: "유효하지 않은 서비스 패키지입니다." }, { status: 400 });
    }

    const totalAmount = calcTotal(packageId as InstallPackageId, region);

    const record = await prisma.installRequest.create({
      data: {
        userId: session?.user?.id,
        name,
        phone,
        email,
        businessName,
        businessType,
        address,
        region,
        packageId,
        preferDate,
        preferTime,
        memo: memo ?? "",
        totalAmount,
        status: "pending",
      },
    });

    // 관리자 알림 (실제 환경에서는 이메일/슬랙 발송)
    console.log(`[install-request] 새 출장 신청: ${businessName} / ${packageId} / ₩${totalAmount.toLocaleString("ko-KR")} / ${preferDate} ${preferTime}`);

    return NextResponse.json({
      ok: true,
      requestId: record.id,
      totalAmount,
      totalAmountFormatted: `₩${totalAmount.toLocaleString("ko-KR")}`,
      package: INSTALL_PACKAGES[packageId as InstallPackageId],
      message: "출장 설치 신청이 완료되었습니다. 영업일 1일 이내에 연락드리겠습니다.",
    });
  } catch (error) {
    console.error("[service/install]", error);
    return NextResponse.json({ error: "신청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// ─── GET: 신청 목록 (관리자용) ────────────────────────────────

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const requests = await prisma.installRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json({ requests: [], mode: "mock" });
  }
}

// ─── PATCH: 상태 업데이트 (관리자용) ────────────────────────────

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json() as { id: string; status: string; adminNote?: string };
    const { id, status, adminNote } = body;

    await prisma.installRequest.update({
      where: { id },
      data: { status, adminNote: adminNote ?? "" },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "업데이트 실패" }, { status: 500 });
  }
}

// 패키지 정보 외부 노출용 re-export
export { calcTotal };
