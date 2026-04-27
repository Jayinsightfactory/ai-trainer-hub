/**
 * 수집된 업체 사장님들에게 온보딩 링크 + 질문 발송 시뮬레이션
 * 실행: node scripts/send-onboarding.mjs
 *
 * 실제 발송은 KAKAO_CHANNEL_ACCESS_TOKEN / SMS_API_KEY 설정 시 활성화
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BUSINESSES_PATH = path.join(ROOT, "data", "businesses.json");

const BASE_URL = process.env.NEXTAUTH_URL || "https://www.nowlink.kr";

// ── 업종별 핵심 질문 미리보기 (카카오 메시지에 포함) ────────────────

const PREVIEW_QUESTIONS = {
  cafe:       ["영업시간은요?", "주차 가능한가요?", "와이파이 있나요?", "대표 메뉴와 가격은요?"],
  restaurant: ["점심/저녁 메뉴가 뭔가요?", "예약 필요한가요?", "단체 가능한가요?", "휴무일은요?"],
  fitness:    ["월 이용권 가격은요?", "PT 가격은요?", "1일권 있나요?", "무료 체험 가능한가요?"],
  pilates:    ["수업 종류가 어떻게 되나요?", "초보도 괜찮나요?", "체험 수업 있나요?", "가격은요?"],
  study_cafe: ["이용 요금은요?", "24시간인가요?", "스터디룸 있나요?", "음식 반입 돼요?"],
  beauty:     ["커트/염색 가격은요?", "예약 필요한가요?", "소요 시간은요?", "남성도 가능한가요?"],
  nail:       ["젤네일 가격은요?", "얼마나 걸려요?", "예약 필수인가요?", "발 케어도 하나요?"],
  academy:    ["어떤 과목 가르치나요?", "수업료는요?", "레벨테스트 있나요?", "체험 수업 있나요?"],
};

// ── 카카오 메시지 템플릿 ────────────────────────────────────────────

function buildKakaoMessage(biz, onboardingUrl) {
  const questions = PREVIEW_QUESTIONS[biz.category] || PREVIEW_QUESTIONS.cafe;
  const qList = questions.map((q, i) => `  ${i + 1}. ${q}`).join("\n");

  return `[나우링크] ${biz.name} 사장님, 안녕하세요! 👋

나우링크 AI 챗봇이 고객 질문에 자동으로 답변해 드립니다.

지금 고객들이 가장 많이 묻는 질문들입니다:
${qList}

아래 링크에서 답변을 입력하시면 챗봇이 즉시 학습해서 24시간 자동으로 응대합니다.

👉 답변하기 (3분 소요): ${onboardingUrl}

* 입력하신 정보는 챗봇 답변에만 사용됩니다.`;
}

// ── SMS 템플릿 (90자 이내) ──────────────────────────────────────────

function buildSmsMessage(biz, onboardingUrl) {
  return `[나우링크] ${biz.name} 사장님! 챗봇 답변 설정하시면 고객문의 자동처리됩니다(3분) → ${onboardingUrl}`;
}

// ── 메인 ────────────────────────────────────────────────────────────

async function main() {
  const businesses = JSON.parse(fs.readFileSync(BUSINESSES_PATH, "utf-8"));
  const targets = businesses.slice(0, 10);

  console.log("=".repeat(65));
  console.log("  나우링크 사장님 온보딩 메시지 발송");
  console.log(`  대상: ${targets.length}개 업체`);
  console.log("=".repeat(65) + "\n");

  const report = [];

  for (const biz of targets) {
    // 실제 환경에선 DB의 StoreAgent.id를 사용
    const onboardingUrl = `${BASE_URL}/onboarding/${biz.id}`;
    const kakaoMsg = buildKakaoMessage(biz, onboardingUrl);
    const smsMsg = buildSmsMessage(biz, onboardingUrl);

    console.log(`  📱 ${biz.name} (${biz.categoryLabel})`);
    console.log(`     전화: ${biz.phone || "없음"}`);
    console.log(`     온보딩 URL: ${onboardingUrl}`);

    let sent = false;

    // 카카오 발송 시도
    if (process.env.KAKAO_CHANNEL_ACCESS_TOKEN && biz.phone) {
      console.log(`     → 카카오 알림톡 발송 시도...`);
      // 실제 카카오 API 호출 (생략, 운영 환경에서 활성화)
      sent = false; // API 키 설정 후 true
    }

    // SMS 발송 시도
    if (!sent && process.env.SMS_API_KEY && biz.phone) {
      console.log(`     → SMS 발송 시도...`);
      sent = false; // API 키 설정 후 true
    }

    if (!sent) {
      console.log(`     ⚠️  발송 API 미설정 → 메시지 미리보기만 출력`);
    }

    report.push({
      id: biz.id,
      name: biz.name,
      category: biz.categoryLabel,
      phone: biz.phone || null,
      onboardingUrl,
      kakaoMessage: kakaoMsg,
      smsMessage: smsMsg,
      sent,
    });

    console.log();
  }

  // 리포트 저장
  const reportPath = path.join(ROOT, "data", "onboarding-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

  // 카카오 메시지 샘플 출력
  console.log("─".repeat(65));
  console.log("  카카오 메시지 샘플 (첫 번째 업체)");
  console.log("─".repeat(65));
  console.log(report[0]?.kakaoMessage);

  console.log("\n" + "─".repeat(65));
  console.log("  온보딩 링크 목록 (사장님에게 전달)");
  console.log("─".repeat(65));
  report.forEach((r) => {
    console.log(`  ${r.name}: ${r.onboardingUrl}`);
  });

  console.log("\n" + "─".repeat(65));
  console.log("  발송 활성화 방법");
  console.log("─".repeat(65));
  console.log("  카카오: .env.local에 KAKAO_CHANNEL_ACCESS_TOKEN + KAKAO_SENDER_KEY 설정");
  console.log("  SMS:    .env.local에 SMS_API_KEY + SMS_FROM_NUMBER 설정");
  console.log(`  리포트: data/onboarding-report.json`);
  console.log("=".repeat(65) + "\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
