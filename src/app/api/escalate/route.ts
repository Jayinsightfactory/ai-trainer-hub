import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/escalate
 * 에스컬레이션 이벤트 저장 + 사장님 알림 (이메일/Webhook)
 *
 * Body:
 *   storeAgentId: string
 *   sessionId: string
 *   customerMsg: string
 *   aiResponse: string
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeAgentId, sessionId, customerMsg, aiResponse } = body as {
      storeAgentId: string;
      sessionId: string;
      customerMsg: string;
      aiResponse: string;
    };

    if (!storeAgentId || !sessionId) {
      return NextResponse.json(
        { error: "storeAgentId 와 sessionId 가 필요합니다." },
        { status: 400 }
      );
    }

    let event;
    let notifyMethod = "none";

    try {
      // DB에 에스컬레이션 기록
      event = await prisma.escalationEvent.create({
        data: {
          storeAgentId,
          sessionId,
          customerMsg: customerMsg || "",
          aiResponse: aiResponse || "",
          status: "pending",
          notifyMethod: "none",
        },
      });

      // 사장님 알림 발송
      const agent = await prisma.storeAgent.findUnique({
        where: { id: storeAgentId },
        include: { user: { select: { email: true, name: true } } },
      });

      if (agent?.user?.email) {
        // 이메일 알림 (SMTP 없으면 콘솔 로그)
        notifyMethod = await sendOwnerNotification({
          ownerEmail: agent.user.email,
          ownerName: agent.user.name || "사장님",
          businessName: agent.businessName,
          customerMsg,
          sessionId,
        });

        await prisma.escalationEvent.update({
          where: { id: event.id },
          data: { status: "notified", notifyMethod },
        });
      }
    } catch {
      // DB 없음 → mock
      return NextResponse.json({
        ok: true,
        mode: "mock",
        message: "에스컬레이션 기록됨 (DB 없음)",
      });
    }

    return NextResponse.json({
      ok: true,
      eventId: event.id,
      notifyMethod,
      message: "사장님께 알림을 보냈습니다.",
    });
  } catch (error) {
    console.error("[escalate] 오류:", error);
    return NextResponse.json(
      { error: "에스컬레이션 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/escalate?storeAgentId=xxx
 * 에스컬레이션 이벤트 목록 조회 (사장님 대시보드용)
 */
export async function GET(request: NextRequest) {
  const storeAgentId = request.nextUrl.searchParams.get("storeAgentId");
  const status = request.nextUrl.searchParams.get("status");

  if (!storeAgentId) {
    return NextResponse.json(
      { error: "storeAgentId 파라미터가 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const where: Record<string, string> = { storeAgentId };
    if (status) where.status = status;

    const events = await prisma.escalationEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ events, total: events.length });
  } catch {
    return NextResponse.json({ events: [], total: 0, mode: "mock" });
  }
}

/**
 * PATCH /api/escalate
 * 에스컬레이션 상태 업데이트 (resolved/ignored)
 */
export async function PATCH(request: NextRequest) {
  try {
    const { id, status, ownerNote } = await request.json() as {
      id: string;
      status: string;
      ownerNote?: string;
    };

    const data: Record<string, string | Date> = { status };
    if (ownerNote) data.ownerNote = ownerNote;
    if (status === "resolved") data.resolvedAt = new Date();

    const event = await prisma.escalationEvent.update({
      where: { id },
      data,
    });

    return NextResponse.json({ ok: true, event });
  } catch (error) {
    console.error("[escalate PATCH] 오류:", error);
    return NextResponse.json(
      { error: "업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// ─── 사장님 알림 발송 ─────────────────────────────────────

async function sendOwnerNotification(params: {
  ownerEmail: string;
  ownerName: string;
  businessName: string;
  customerMsg: string;
  sessionId: string;
}): Promise<string> {
  const { ownerEmail, ownerName, businessName, customerMsg, sessionId } = params;

  // 1순위: Resend API (RESEND_API_KEY 있을 때)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "AI Trainer Hub <noreply@aitrainerhub.com>",
          to: ownerEmail,
          subject: `[${businessName}] 고객이 직접 연결을 요청했습니다`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <h2 style="color:#4f46e5">📱 사장님, 고객 연결 요청이 있어요!</h2>
              <p>${ownerName}님 안녕하세요.</p>
              <p><strong>${businessName}</strong>의 AI 챗봇이 고객 질문을 처리하지 못해 사장님 연결을 요청했습니다.</p>
              <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:16px;margin:16px 0">
                <p style="color:#6b7280;font-size:12px;margin:0 0 4px">고객 문의 내용</p>
                <p style="margin:0;font-weight:500">"${customerMsg}"</p>
              </div>
              <a href="${process.env.NEXTAUTH_URL}/dashboard?escalation=${sessionId}"
                 style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
                대화 이어받기 →
              </a>
              <p style="font-size:12px;color:#9ca3af;margin-top:16px">AI Trainer Hub · 자동 발송 메일</p>
            </div>
          `,
        }),
      });
      if (res.ok) return "email";
    } catch {
      // 이메일 실패 → 콘솔
    }
  }

  // 2순위: 카카오 알림톡 (KAKAO_BIZMSG_KEY 있을 때)
  if (process.env.KAKAO_BIZMSG_KEY) {
    // TODO: 카카오 비즈메시지 API 연동
    return "kakao";
  }

  // fallback: 콘솔 로그
  console.log(`[ESCALATION] ${businessName} - 고객 문의: "${customerMsg}" → ${ownerEmail}`);
  return "console";
}
