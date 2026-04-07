#!/bin/bash
# ============================================================
# AI Trainer Hub — 새 PC 원클릭 셋업 스크립트
# 사용법: ./setup.sh
# ============================================================

set -e  # 에러 시 즉시 중단

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

echo ""
echo -e "${CYAN}${BOLD}=================================================${RESET}"
echo -e "${CYAN}${BOLD}   AI Trainer Hub — 개발 환경 셋업              ${RESET}"
echo -e "${CYAN}${BOLD}=================================================${RESET}"
echo ""

# ── 1. Node.js 확인 ─────────────────────────────────────────
echo -e "${BOLD}[1/6] Node.js 확인...${RESET}"
if ! command -v node &>/dev/null; then
  echo -e "${RED}Node.js가 설치되어 있지 않습니다.${RESET}"
  echo "  → https://nodejs.org 에서 v20 이상 설치 후 재실행하세요."
  exit 1
fi
NODE_VERSION=$(node --version)
echo -e "  ${GREEN}✓ Node.js ${NODE_VERSION}${RESET}"

# ── 2. 의존성 설치 ───────────────────────────────────────────
echo -e "${BOLD}[2/6] 패키지 설치 (npm install)...${RESET}"
npm install --silent
echo -e "  ${GREEN}✓ 완료${RESET}"

# ── 3. 환경변수 설정 ─────────────────────────────────────────
echo -e "${BOLD}[3/6] 환경변수 설정...${RESET}"
if [ ! -f ".env.local" ]; then
  cp .env.example .env.local
  # NEXTAUTH_SECRET 자동 생성
  if command -v openssl &>/dev/null; then
    SECRET=$(openssl rand -base64 32)
    sed -i.bak "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=${SECRET}|" .env.local
    rm -f .env.local.bak
    echo -e "  ${GREEN}✓ .env.local 생성 + NEXTAUTH_SECRET 자동 설정${RESET}"
  else
    echo -e "  ${YELLOW}⚠ .env.local 생성됨. NEXTAUTH_SECRET을 직접 입력하세요.${RESET}"
  fi
else
  echo -e "  ${YELLOW}⚠ .env.local 이미 존재 — 건너뜀${RESET}"
fi

# ── 4. Prisma 설정 ──────────────────────────────────────────
echo -e "${BOLD}[4/6] Prisma 클라이언트 생성...${RESET}"
npx prisma generate --silent 2>/dev/null || true
echo -e "  ${GREEN}✓ 완료${RESET}"

# DATABASE_URL 있으면 DB 마이그레이션
if grep -q "^DATABASE_URL=postgresql" .env.local 2>/dev/null; then
  echo -e "  DATABASE_URL 감지됨 → DB 마이그레이션 실행..."
  npx prisma db push --skip-generate 2>/dev/null && \
    echo -e "  ${GREEN}✓ DB 마이그레이션 완료${RESET}" || \
    echo -e "  ${YELLOW}⚠ DB 마이그레이션 실패 (연결 확인 필요)${RESET}"
else
  echo -e "  ${YELLOW}⚠ DATABASE_URL 없음 → DB 기능 비활성화 (로컬 테스트는 가능)${RESET}"
fi

# ── 5. TypeScript 빌드 확인 ──────────────────────────────────
echo -e "${BOLD}[5/6] TypeScript 타입 체크...${RESET}"
npx tsc --noEmit --skipLibCheck 2>/dev/null && \
  echo -e "  ${GREEN}✓ 타입 오류 없음${RESET}" || \
  echo -e "  ${YELLOW}⚠ 타입 경고 있음 (실행에는 지장 없음)${RESET}"

# ── 6. 완료 안내 ────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}=================================================${RESET}"
echo -e "${GREEN}${BOLD}   ✅ 셋업 완료!${RESET}"
echo -e "${GREEN}${BOLD}=================================================${RESET}"
echo ""
echo -e "  ${BOLD}개발 서버 실행:${RESET}"
echo -e "  ${CYAN}npm run dev${RESET}  →  http://localhost:3000"
echo ""
echo -e "  ${BOLD}OAuth 키 등록 필요 (.env.local):${RESET}"
echo -e "  ${YELLOW}KAKAO_CLIENT_ID / KAKAO_CLIENT_SECRET${RESET}  ← 카카오 로그인"
echo -e "  ${YELLOW}NAVER_CLIENT_ID / NAVER_CLIENT_SECRET${RESET}  ← 네이버 로그인"
echo -e "  ${YELLOW}ANTHROPIC_API_KEY${RESET}                      ← AI 실제 응답"
echo ""
echo -e "  ${BOLD}자세한 API 키 발급 방법:${RESET}  cat API_CONNECTIONS.md"
echo ""
echo -e "  ${BOLD}배포:${RESET}"
echo -e "  ${CYAN}git push origin master${RESET}  →  Railway 자동 배포"
echo ""
