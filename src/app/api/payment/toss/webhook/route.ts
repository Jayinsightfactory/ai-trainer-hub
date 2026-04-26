import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

function verifySignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");
  try {
    return timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * GET /api/payment/toss/webhook?status=success&paymentKey=...&orderId=...&amount=...
 * 토스페이먼츠 결제 완료 콜백 (successUrl 리다이렉트)
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
      console.error("[Toss] 승인 실패:", err);
      return NextResponse.redirect(
        `${baseUrl}/pricing?status=fail&reason=${encodeURIComponent(err.message || "승인실패")}`
      );
    }

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
      console.error("[Toss] DB 업데이트 실패:", dbErr);
    }

    return NextResponse.redirect(`${baseUrl}/pricing?status=success`);
  } catch (error) {
    console.error("[Toss] 처리 오류:", error);
    return NextResponse.redirect(`${baseUrl}/pricing?status=fail`);
  }
}

/**
 * POST /api/payment/toss/webhook
 * 토스 서버 → 우리 서버 이벤트 웹훅 (HMAC-SHA256 서명 검증 포함)
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.TOSS_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Toss] TOSS_WEBHOOK_SECRET 미설정");
    return NextResponse.json({ error: "misconfiguration" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("toss-signature");

  if (!verifySignature(rawBody, signature, webhookSecret)) {
    console.warn("[Toss] 서명 검증 실패 — 위조 요청 차단");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { eventType: string; data?: { orderId?: string; status?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("[Toss Webhook]", event.eventType, event.data?.orderId);

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
}
