import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/payment/toss
 * 토스페이먼츠 결제 요청 생성
 *
 * Body:
 *   userId: string
 *   plan: "basic" | "standard" | "premium"
 */

const PLAN_CONFIG = {
  basic: {
    name: "베이직",
    amount: 19900,
    monthlyChats: 500,
    description: "AI Trainer Hub 베이직 (월 500건)",
  },
  standard: {
    name: "스탠다드",
    amount: 39900,
    monthlyChats: 2000,
    description: "AI Trainer Hub 스탠다드 (월 2,000건 + 멀티채널)",
  },
  premium: {
    name: "프리미엄",
    amount: 79900,
    monthlyChats: 999999,
    description: "AI Trainer Hub 프리미엄 (무제한)",
  },
} as const;

type PlanKey = keyof typeof PLAN_CONFIG;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = "demo-user", plan } = body as { userId?: string; plan: PlanKey };

    if (!plan || !(plan in PLAN_CONFIG)) {
      return NextResponse.json(
        { error: "유효하지 않은 플랜입니다. (basic | standard | premium)" },
        { status: 400 }
      );
    }

    const config = PLAN_CONFIG[plan];
    const orderId = `order_${userId}_${plan}_${Date.now()}`;

    // DB에 pending 구독 생성
    try {
      await prisma.subscription.upsert({
        where: { userId },
        update: {
          plan,
          status: "pending",
          amount: config.amount,
          tossOrderId: orderId,
          monthlyChats: config.monthlyChats,
        },
        create: {
          userId,
          plan,
          status: "pending",
          amount: config.amount,
          tossOrderId: orderId,
          monthlyChats: config.monthlyChats,
          billingStart: new Date(),
        },
      });
    } catch {
      // DB 없음 → mock 결제 URL 반환
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // 토스 결제창 파라미터
    const tossParams = new URLSearchParams({
      clientKey: process.env.TOSS_CLIENT_KEY || "test_ck_placeholder",
      orderId,
      orderName: config.description,
      amount: String(config.amount),
      successUrl: `${baseUrl}/api/payment/toss/webhook?status=success`,
      failUrl: `${baseUrl}/pricing?status=fail`,
      customerEmail: "",
      customerName: "",
    });

    return NextResponse.json({
      ok: true,
      orderId,
      amount: config.amount,
      orderName: config.description,
      // 프론트에서 토스페이먼츠 SDK로 결제창 호출에 필요한 데이터
      tossParams: {
        clientKey: process.env.TOSS_CLIENT_KEY || "test_ck_ZlFKR1JGbnp3d05EWWF2YkFnbzN3Wnk=",
        orderId,
        orderName: config.description,
        amount: config.amount,
        successUrl: `${baseUrl}/api/payment/toss/webhook?status=success`,
        failUrl: `${baseUrl}/pricing?status=fail`,
      },
    });
  } catch (error) {
    console.error("[payment/toss] 오류:", error);
    return NextResponse.json(
      { error: "결제 요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId") || "demo-user";

  try {
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    return NextResponse.json({ subscription: sub });
  } catch {
    return NextResponse.json({
      subscription: { plan: "free", status: "active", usedChats: 0, monthlyChats: 100 },
      mode: "mock",
    });
  }
}
