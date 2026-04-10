import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/payment/toss/webhook?status=success&paymentKey=...&orderId=...&amount=...
 * 토스페이먼츠 결제 완료 콜백 (successUrl)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = Number(searchParams.get("amount") || "0");

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (status !== "success" || !paymentKey || !orderId) {
    return NextResponse.redirect(`${baseUrl}/pricing?status=fail`);
  }

  try {
    // 토스 서버에서 결제 승인 요청
    const secretKey = process.env.TOSS_SECRET_KEY || "";
    const encoded = Buffer.from(`${secretKey}:`).toString("base64");

    const confirmRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${encoded}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    if (!confirmRes.ok) {
      const err = await confirmRes.json() as { message?: string };
      console.error("[toss webhook] 승인 실패:", err);
      return NextResponse.redirect(`${baseUrl}/pricing?status=fail&reason=${encodeURIComponent(err.message || "승인실패")}`);
    }

    // DB 구독 활성화
    try {
      const billingEnd = new Date();
      billingEnd.setMonth(billingEnd.getMonth() + 1);

      await prisma.subscription.update({
        where: { tossOrderId: orderId },
        data: {
          status: "active",
          tossPaymentKey: paymentKey,
          billingStart: new Date(),
          billingEnd,
          usedChats: 0,
        },
      });
    } catch (dbErr) {
      console.error("[toss webhook] DB 업데이트 실패:", dbErr);
    }

    return NextResponse.redirect(`${baseUrl}/pricing?status=success`);
  } catch (error) {
    console.error("[toss webhook] 처리 오류:", error);
    return NextResponse.redirect(`${baseUrl}/pricing?status=fail`);
  }
}

/**
 * POST /api/payment/toss/webhook
 * 토스 서버 → 우리 서버 이벤트 웹훅 (결제 취소, 실패 등)
 */
export async function POST(request: NextRequest) {
  try {
    const event = await request.json() as {
      eventType: string;
      data?: { orderId?: string; status?: string };
    };
    console.log("[toss webhook POST]", event.eventType, event.data?.orderId);

    if (event.eventType === "PAYMENT_STATUS_CHANGED" && event.data?.orderId) {
      const { orderId, status } = event.data;
      if (status === "CANCELED" || status === "EXPIRED") {
        try {
          await prisma.subscription.update({
            where: { tossOrderId: orderId },
            data: { status: "cancelled" },
          });
        } catch {
          // DB 없음 무시
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[toss webhook POST] 오류:", error);
    return NextResponse.json({ error: "처리 실패" }, { status: 500 });
  }
}
