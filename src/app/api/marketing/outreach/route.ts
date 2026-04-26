import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { generateMarketingMessage, type BusinessInfo } from "@/lib/marketing-message";

const BUSINESSES_PATH = path.join(process.cwd(), "data", "businesses.json");

interface OutreachLog {
  businessId: string;
  channel: string;
  sentAt: string;
  messageSubject: string;
  status: "sent" | "failed";
}

function readBusinesses(): BusinessInfo[] {
  try {
    const raw = fs.readFileSync(BUSINESSES_PATH, "utf-8");
    return JSON.parse(raw) as BusinessInfo[];
  } catch {
    return [];
  }
}

function writeBusinesses(businesses: BusinessInfo[]): void {
  fs.writeFileSync(BUSINESSES_PATH, JSON.stringify(businesses, null, 2), "utf-8");
}

function readOutreachLog(): OutreachLog[] {
  const logPath = path.join(process.cwd(), "data", "outreach-log.json");
  try {
    const raw = fs.readFileSync(logPath, "utf-8");
    return JSON.parse(raw) as OutreachLog[];
  } catch {
    return [];
  }
}

function appendOutreachLog(entry: OutreachLog): void {
  const logPath = path.join(process.cwd(), "data", "outreach-log.json");
  const logs = readOutreachLog();
  logs.push(entry);
  fs.writeFileSync(logPath, JSON.stringify(logs, null, 2), "utf-8");
}

async function sendViaKakao(business: BusinessInfo, msg: ReturnType<typeof generateMarketingMessage>): Promise<boolean> {
  // Mock: 실제 카카오 알림톡 API 연동 시 구현
  const token = process.env.KAKAO_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    console.log("[Mock] Kakao 알림톡 전송:", business.name, msg.subject);
    return true;
  }
  // TODO: 실제 카카오 알림톡 API 호출
  console.log("[Kakao] 전송 시도:", business.name);
  return true;
}

async function sendViaSms(business: BusinessInfo, msg: ReturnType<typeof generateMarketingMessage>): Promise<boolean> {
  const apiKey = process.env.SMS_API_KEY;
  if (!apiKey || !business.phone) {
    console.log("[Mock] SMS 전송:", business.name, business.phone, msg.shortUrl);
    return true;
  }
  // TODO: 실제 SMS API 호출
  console.log("[SMS] 전송 시도:", business.name, business.phone);
  return true;
}

async function sendViaEmail(business: BusinessInfo, msg: ReturnType<typeof generateMarketingMessage>): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  console.log("[Mock] Email 전송:", adminEmail || "admin@nowlink.kr", msg.subject);
  return true;
}

async function sendViaNaver(business: BusinessInfo, msg: ReturnType<typeof generateMarketingMessage>): Promise<boolean> {
  // 네이버 플레이스 메시지 전송 (공식 API 없음 — 향후 연동)
  console.log("[Mock] Naver 메시지 전송:", business.name, msg.shortUrl);
  return true;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { businessId: string; channel: "kakao" | "naver" | "email" | "sms" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { businessId, channel } = body;
  if (!businessId || !channel) {
    return NextResponse.json(
      { error: "businessId와 channel은 필수입니다" },
      { status: 400 }
    );
  }

  const businesses = readBusinesses();
  const idx = businesses.findIndex((b) => b.id === businessId);
  if (idx === -1) {
    return NextResponse.json({ error: "업체를 찾을 수 없습니다" }, { status: 404 });
  }

  const business = businesses[idx];
  const msg = generateMarketingMessage(business);

  let success = false;
  switch (channel) {
    case "kakao":
      success = await sendViaKakao(business, msg);
      break;
    case "sms":
      success = await sendViaSms(business, msg);
      break;
    case "email":
      success = await sendViaEmail(business, msg);
      break;
    case "naver":
      success = await sendViaNaver(business, msg);
      break;
    default:
      return NextResponse.json({ error: "지원하지 않는 채널입니다" }, { status: 400 });
  }

  if (success) {
    businesses[idx].contactStatus = "contacted";
    writeBusinesses(businesses);

    const logEntry: OutreachLog = {
      businessId,
      channel,
      sentAt: new Date().toISOString(),
      messageSubject: msg.subject,
      status: "sent",
    };
    appendOutreachLog(logEntry);

    return NextResponse.json({
      success: true,
      message: `${business.name}에게 ${channel} 메시지를 전송했습니다`,
      shortUrl: msg.shortUrl,
      subject: msg.subject,
    });
  }

  return NextResponse.json({ error: "전송에 실패했습니다" }, { status: 500 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = readOutreachLog();
  return NextResponse.json({ logs });
}
