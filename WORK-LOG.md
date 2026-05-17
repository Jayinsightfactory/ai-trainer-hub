# AI Trainer Hub — 작업 내역 & 이어서 작업 가이드

## 프로젝트 개요
자영업자 대상 AI 고객응대 SaaS 플랫폼
- **라이브 URL**: https://ai-trainer-app-production.up.railway.app
- **GitHub**: https://github.com/Jayinsightfactory/ai-trainer-hub
- **Railway**: https://railway.com/project/8ffb9add-8ed6-457f-9a7a-7edac774b6d3

## 기술 스택
- Next.js 16.2 + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Prisma + PostgreSQL (Railway)
- Zustand (상태관리)
- Framer Motion (애니메이션)
- Lucide Icons

## 현재 구현 상태

### 페이지 구조 (VS Code + N8N 하이브리드 레이아웃)
```
src/app/
├── layout.tsx          — AppShell (IDE 레이아웃)
├── page.tsx            — HomeView (3×2 업종 그리드)
├── templates/page.tsx  — 템플릿 카탈로그 (42개)
├── learn/page.tsx      — 학습 위저드 (4단계)
├── my-learning/page.tsx — 내 학습 관리
├── dashboard/page.tsx  — 대시보드
├── onboarding/page.tsx — 온보딩
├── store/[slug]/page.tsx — ★ 고객용 AI 챗봇 (네이버 플레이스 연동)
└── api/
    ├── agents/route.ts
    ├── chat/route.ts
    └── learning-packs/route.ts
```

### 핵심 컴포넌트
```
src/components/
├── shell/              — IDE 레이아웃
│   ├── AppShell.tsx    — 전체 쉘 (Activity Bar + Sidebar + Content + Bottom Panel)
│   ├── ActivityBar.tsx — 좌측 아이콘 네비게이션
│   ├── Sidebar.tsx     — 접이식 사이드바 (뷰별 다른 콘텐츠)
│   └── BottomPanel.tsx — 하단 패널 (에이전트 로그/AI채팅/알림)
├── views/
│   └── HomeView.tsx    — 3×2 업종 그리드 (학습데이터→과정→결과)
├── learn/              — 학습 위저드 컴포넌트
│   ├── LearnWizard.tsx — 메인 위저드 (샘플 데이터 프리필)
│   ├── IdentityStep.tsx
│   ├── KnowledgeStep.tsx
│   ├── TestStep.tsx
│   ├── DeployStep.tsx
│   └── LivePreview.tsx — 실시간 미리보기 채팅
└── landing/
    └── CaseShowcase.tsx — 학습 사례 카드 21개
```

### 데이터 파일
```
src/lib/
├── template-catalog.ts  — 15개 카테고리, 42개 템플릿 (2000줄+)
├── templates/index.ts   — 런타임 템플릿 데이터
├── templates/matcher.ts — 템플릿 매칭 로직
├── sample-data.ts       — 데모용 프리필 데이터 (카페 풀 데이터)
├── learning-data.ts     — 학습 전/후 비교 대화 (8개 시나리오)
├── prisma.ts            — Prisma 클라이언트
└── auth.ts              — NextAuth 설정
```

### 스토어
```
src/store/
├── workspace.ts — IDE 레이아웃 상태 (뷰, 패널, 에이전트 로그)
├── learn.ts     — 학습 위저드 상태
├── dashboard.ts — 대시보드 상태
└── onboarding.ts — 온보딩 상태
```

## 템플릿 카테고리 (15개)
1. 텍스트 학습 (12개) — 고객응대, 콘텐츠, 교육, 워크플로우 등
2. 이미지 학습 (5개) — 불량 검출, 진열 모니터링
3. 데이터 학습 (4개) — 수요 예측, 이상 탐지
4. 음성 학습 (2개)
5. 행동 학습 (2개) — 자율주행 포함
6. 이미지 생성 (2개) — LoRA/DreamBooth
7. 영상/모션 (2개) — 영상 생성, 동작 인식
8. 음성 클로닝/TTS (1개)
9. 멀티모달 AI (1개)
10. AI 에이전트 (1개)
11. RAG + Knowledge Graph (2개)
12. 파인튜닝 (2개) — LoRA, DPO
13. Edge AI (2개) — 경량화, 온디바이스
14. 합성 데이터 (2개)
15. AI 코드 생성 (2개)

## 사업 모델
```
네이버 플레이스 업체 → 홈페이지 URL: yourplatform.com/store/매장이름
→ 고객 클릭 → 학습된 AI 챗봇 자동 응대
→ AI 한계 시 → "사장님께 직접 연결" (에스컬레이션)
→ 사장님 실시간 알림 → 1:1 대화 이어받기
```

### 네이밍 후보
- 응대리, 알바봇, 똑봇

### 가격
- 무료: 월 100건
- 베이직 19,900원: 월 500건
- 스탠다드 39,900원: 월 2,000건 + 멀티채널
- 프리미엄 79,900원: 무제한

### 실제 비용 (직접 개발 시)
- 월 서버: $5~20 (Railway)
- 월 AI API: 3~10만원
- 손익분기: 유료 고객 30명

## 다음 작업 (TODO)

### 즉시 해야 할 것
1. **실제 학습 시스템 구현** (현재 설계 에이전트 진행 중)
   - 텍스트 학습: pgvector + RAG 파이프라인
   - /api/learn/text → 임베딩 → 벡터 DB 저장
   - /api/chat/[storeId] → RAG 검색 → Claude API 응답
2. **에스컬레이션 기능** — 사장님 실시간 알림 + 대화 이어받기
3. **사용자 인증** — Google OAuth (NextAuth 세팅 완료, 키만 필요)
4. **결제 연동** — 토스페이먼츠 or 스트라이프

### 리서치 진행 중 (에이전트 3개 실행 중)
- 기업·로봇 AI 학습 실제 사례 (테슬라/삼성/네이버 등)
- 데이터셋·비용·벤치마크 (모델별 학습 비용, ROI)
- 실제 학습 시스템 아키텍처 설계 (API, DB, 서비스 비용)

### 중기
- 카카오톡 채널 연동
- 인스타그램 DM 자동화
- AI 음성봇 (전화 대체)
- 다국어 지원

## 환경 설정 (다른 PC에서 이어서 작업)
```bash
git clone https://github.com/Jayinsightfactory/ai-trainer-hub.git
cd ai-trainer-hub
npm install
cp .env.example .env  # 환경변수 설정
npx prisma generate
npx prisma db push
npm run dev
```

### 환경변수 (.env)
```
DATABASE_URL=postgresql://...  # Railway PostgreSQL
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=change-me
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ANTHROPIC_API_KEY=
```

### Railway 배포
```bash
railway login
railway link --project ai-trainer-hub --service ai-trainer-app
railway up
```

## 커밋 히스토리
- b77e62e — 3×2 그리드 + 좌우 분할 카드 레이아웃
- dfbe373 — /store/[slug] 고객용 AI 챗봇 데모
- 4089f1c — 4×3 업종 그리드
- 1019325 — 밝은 테마 + 대화 프리필
- bc6a822 — 인터랙티브 학습 데모 홈
- 475c688 — N8N + VS Code IDE 레이아웃
- ce033d3 — 5개 카테고리, 5개 사례, 10개 템플릿 추가
- 05e627d — 샘플 데이터 프리필 + 글로벌 트렌드 5개 카테고리
- 73a26bc — 사례 디테일 업그레이드 + 라이브 프리뷰 8개 시나리오
- 7649ff0 — 사례→템플릿 링크 연결
- 70e6ef1 — 글로벌 네비바 추가
- 7020727~3191f61 — Railway 배포 설정 + 초기 커밋
