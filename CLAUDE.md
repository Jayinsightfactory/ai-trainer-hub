# AI Trainer Hub — Claude Code 작업 가이드

> 이 파일을 읽은 Claude는 즉시 프로젝트 컨텍스트를 파악하고 작업을 이어갈 수 있습니다.
> 새 PC에서 시작할 때: `git clone` → `./setup.sh` → `claude` 실행

---

## 🔗 핵심 링크

| 항목 | URL |
|------|-----|
| **라이브** | https://ai-trainer-app-production.up.railway.app |
| **GitHub** | https://github.com/Jayinsightfactory/ai-trainer-hub (계정 이메일: dlaww584@gmail.com) |
| **Railway** | https://railway.com/project/8ffb9add-8ed6-457f-9a7a-7edac774b6d3 |
| **배포방식** | GitHub master 브랜치 push → Railway 자동 배포 |

---

## 🏗️ 프로젝트 개요

**자영업자/기업 대상 AI 학습 운영 플랫폼**
- 업종별 템플릿으로 AI 고객응대·품질검사·공정최적화 학습
- 4단계 위저드로 데이터 입력 → AI 즉시 배포
- 103개 템플릿 (무료 7 / 스타터 32 / 프로 64)

**비즈니스 모델:** 네이버 플레이스 업체 → URL 등록 → AI 챗봇 자동 응대
**가격:** 무료(100건/월) / 베이직 19,900 / 스탠다드 39,900 / 프리미엄 79,900

---

## 🛠️ 기술 스택

```
Frontend:  Next.js 16.2 + React 19 + TypeScript
Style:     Tailwind CSS 4 + shadcn/ui + Framer Motion
State:     Zustand (workspace.ts, learn.ts, dashboard.ts, onboarding.ts)
Auth:      NextAuth v4 (Kakao + Naver + Google OAuth)
Database:  Prisma + PostgreSQL (Railway)
AI:        @ai-sdk/anthropic (claude-sonnet-4-6) — API키 없으면 Mock 모드
Voice:     ElevenLabs TTS
Icons:     Lucide React
```

---

## 📁 핵심 파일 구조

```
src/
├── app/
│   ├── layout.tsx              — SessionProvider + AppShell 래핑
│   ├── page.tsx                — HomeView 렌더링
│   ├── auth/signin/page.tsx    — 카카오/네이버/구글 로그인 페이지
│   ├── templates/page.tsx      — 템플릿 카탈로그 (IndustryCard 레이아웃)
│   ├── learn/page.tsx          — 학습 위저드 (로그인 가드 포함)
│   ├── my-learning/page.tsx    — 내 학습 현황
│   ├── onboarding/page.tsx     — 온보딩
│   ├── camera/page.tsx         — 카메라 실시간 학습
│   ├── dashboard/page.tsx      — 대시보드
│   ├── store/[slug]/page.tsx   — 고객용 AI 챗봇 (네이버 플레이스 연동)
│   └── api/
│       ├── auth/[...nextauth]/ — NextAuth 핸들러
│       ├── chat/route.ts       — Claude 스트리밍 채팅
│       ├── learning-packs/     — 학습팩 CRUD
│       ├── agents/route.ts     — 에이전트 시뮬레이션
│       └── tts/route.ts        — ElevenLabs TTS
│
├── components/
│   ├── shell/
│   │   ├── AppShell.tsx        — 전체 레이아웃 (모바일/데스크탑 분기)
│   │   ├── ActivityBar.tsx     — 좌측 아이콘 네비 (데스크탑만)
│   │   ├── MobileNav.tsx       — 하단 탭 네비 (모바일만, md 미만)
│   │   ├── Sidebar.tsx         — 접이식 사이드바 (학습성과/카테고리)
│   │   ├── BottomPanel.tsx     — 에이전트 로그/AI채팅/알림
│   │   ├── UserButton.tsx      — 로그인 상태 버튼 + 드롭다운
│   │   └── SessionProviderWrapper.tsx — NextAuth Provider
│   ├── views/
│   │   └── HomeView.tsx        — 퍼포먼스 페이지 (업종별 카드 그리드)
│   ├── learn/
│   │   ├── LearnWizard.tsx     — 4단계 위저드 메인
│   │   ├── IdentityStep.tsx    — 1단계: AI 역할 설정
│   │   ├── KnowledgeStep.tsx   — 2단계: 데이터 입력 (텍스트+이미지 업로드)
│   │   ├── TestStep.tsx        — 3단계: 테스트 & 피드백
│   │   ├── DeployStep.tsx      — 4단계: 배포 & 저장
│   │   └── LivePreview.tsx     — 우측 실시간 채팅 미리보기
│   └── onboarding/
│       └── OnboardingWizard.tsx
│
├── lib/
│   ├── template-catalog.ts     — ★ 핵심: 103개 템플릿 정의 (2700줄)
│   ├── auth.ts                 — NextAuth 설정 (Kakao + Naver + Google)
│   ├── prisma.ts               — Prisma 클라이언트 싱글톤
│   ├── learning-data.ts        — 학습 벤치마크 & 테스트 대화
│   ├── sample-data.ts          — 카페 데모용 프리필 데이터
│   └── templates/
│       ├── index.ts            — 런타임 학습 템플릿 (카페/쇼핑몰/의료 등)
│       └── matcher.ts          — URL 파라미터 → 템플릿 매칭
│
└── store/
    ├── workspace.ts            — 뷰/패널 상태 (sidebarCollapsed 기본 true)
    ├── learn.ts                — 위저드 상태 (KnowledgeItem에 type/imageUrls)
    └── onboarding.ts           — 온보딩 상태
```

---

## 📊 템플릿 카탈로그 구조 (template-catalog.ts)

```typescript
// 카테고리 6개 (CATALOG 배열)
CATALOG = [
  { id: "text-learning",    name: "텍스트로 학습",  subcategories: [...] },
  { id: "image-learning",   name: "이미지로 학습",  subcategories: [...] },  // CCTV 포함
  { id: "data-learning",    name: "데이터로 학습",  subcategories: [...] },
  { id: "audio-learning",   name: "음성으로 학습",  subcategories: [...] },
  { id: "action-learning",  name: "행동으로 학습",  subcategories: [...] },  // 로봇 포함
  { id: "factory-workflow", name: "공장 워크플로우", subcategories: [...] },  // 5개 subcategory
]

// 추가된 주요 subcategory
- image-cctv: 사람인식, 이상행동, 군중밀도, 번호판인식
- action-home-robot: 수건접기(ACT/Diffusion/VLA 등 5가지 방법), 설거지, 물건분류
- action-service-robot: 서빙로봇
- factory-vision-qc: YOLOv8 시각 품질검사
- factory-predictive-maintenance: LSTM 예측정비
- factory-process-optimization: XGBoost 공정최적화
- factory-n8n-automation: n8n 자동화
- factory-digital-twin: 디지털트윈

// LearningMethod 인터페이스 (methods 필드로 복수 학습법 제공)
interface LearningMethod {
  id, name, tag, summary, pros, cons, dataNeeded, difficulty, bestFor, paperRef
}
```

---

## 🔐 인증 시스템 (NextAuth v4)

```typescript
// src/lib/auth.ts
providers: [KakaoProvider, NaverProvider, GoogleProvider]
strategy: "jwt"
adapter: PrismaAdapter

// 환경변수 필요:
KAKAO_CLIENT_ID / KAKAO_CLIENT_SECRET
NAVER_CLIENT_ID / NAVER_CLIENT_SECRET
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
NEXTAUTH_SECRET / NEXTAUTH_URL

// Redirect URIs:
/api/auth/callback/kakao
/api/auth/callback/naver
/api/auth/callback/google
```

---

## 🗄️ 데이터베이스 (Prisma)

```
prisma/schema.prisma — User, Account, Session, LearningPack, AgentRun, ChatMessage
DATABASE_URL = Railway PostgreSQL 자동 연결
마이그레이션: npx prisma migrate deploy (Railway startup에 포함)
```

---

## 📱 모바일 반응형 전략

```
md 미만 (< 768px):
  - ActivityBar 숨김 → MobileNav (하단 고정 탭 5개)
  - Sidebar 숨김
  - BottomPanel 숨김
  - 상단 헤더: "AI Trainer Hub" + UserButton
  - 그리드: grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3
  - 카드 바디: flex-col (위: 데이터, 아래: 미리보기)
  - 모달: 하단 시트 방식 (h-[92vh], rounded-t-2xl)

md 이상 (≥ 768px):
  - 기존 레이아웃 유지 (ActivityBar + Sidebar + BottomPanel)
  - 우측 상단 UserButton
```

---

## 🚀 현재 상태 & 다음 작업

### ✅ 완료된 작업
- [x] IDE 레이아웃 (ActivityBar + Sidebar + BottomPanel)
- [x] 퍼포먼스 페이지 (업종별 9개 + 기업·공장 3개 카드)
- [x] 템플릿 카탈로그 (103개, IndustryCard 레이아웃)
- [x] 4단계 학습 위저드 (역할→지식→테스트→배포)
- [x] 모바일 반응형 (하단 탭 네비게이션)
- [x] OAuth 로그인 (카카오/네이버/구글)
- [x] 이미지 업로드 학습 (드래그앤드롭, 최대 20장)
- [x] 파일 업로드 (txt/pdf/csv → 텍스트 변환)
- [x] 로봇 AI 학습 템플릿 (수건접기, 설거지 + 5가지 학습법)
- [x] CCTV 특화 템플릿 (사람인식/이상행동/군중밀도/번호판)
- [x] 공장 워크플로우 5개 카테고리
- [x] 자동 템플릿 탐색 엔진 (6시간마다 실행, ~/.claude/agent/)

### 🔜 다음 우선순위
1. **실제 RAG 학습 파이프라인**
   - `/api/learn/text` — 텍스트 임베딩 → pgvector 저장
   - `/api/chat/[storeId]` — RAG 검색 → Claude 응답
   - 현재는 Mock 모드 (ANTHROPIC_API_KEY 없으면 고정 응답)

2. **OAuth 키 실제 등록** (API_CONNECTIONS.md 참고)
   - Railway Variables에 KAKAO/NAVER/NEXTAUTH 등록 필요

3. **결제 연동** (토스페이먼츠)
   - `/api/payment/` 라우트 추가
   - 플랜별 기능 제한 적용

4. **에스컬레이션 기능**
   - AI 한계 → 사장님 실시간 알림
   - 카카오톡 알림톡 연동

5. **카카오톡 채널 연동**
   - 카카오 채널 Webhook → `/api/webhook/kakao`

---

## ⚙️ 로컬 개발 환경 설정

```bash
# 1. 클론
git clone https://github.com/Jayinsightfactory/ai-trainer-hub.git
cd ai-trainer-hub

# 2. 의존성
npm install

# 3. 환경변수 (최소 설정으로 로컬 실행 가능)
cp .env.example .env.local
# .env.local 편집:
# NEXTAUTH_SECRET=any-random-string
# NEXTAUTH_URL=http://localhost:3000
# DATABASE_URL=없으면 DB 없이 동작 (학습팩 저장 불가)

# 4. DB (선택 - DATABASE_URL 있을 때만)
npx prisma generate
npx prisma db push

# 5. 실행
npm run dev
# → http://localhost:3000
```

---

## 🌐 Railway 배포

```bash
git add .
git commit -m "feat: 변경사항"
git push origin master
# → Railway 자동 배포 (2~3분 소요)
```

---

## 🔑 환경변수 전체 목록

```bash
# 필수 (로그인 작동)
NEXTAUTH_SECRET=        # openssl rand -base64 32
NEXTAUTH_URL=           # Railway 도메인

# OAuth (API_CONNECTIONS.md 참고)
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI
ANTHROPIC_API_KEY=      # 없으면 Mock 모드

# DB
DATABASE_URL=           # Railway PostgreSQL

# 선택
ELEVENLABS_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 🤖 자동화 에이전트 (로컬 전용)

```
~/.claude/agent/scripts/
├── template_engine.py      — 무한 반복 탐색 엔진 (6시간마다)
├── research_agent.py       — 산업 AI 사례 검색
├── template_generator.py   — TypeScript 템플릿 코드 생성
├── validator.py            — 빌드 검증 (tsc --noEmit)
├── telegram_approval.py    — 위험 명령 텔레그램 승인
└── telegram_stream.py      — 작업 진행상황 텔레그램 스트림

# 수동 실행:
python3 ~/.claude/agent/scripts/template_engine.py --once
# launchd 자동 실행: 6시간마다 (com.aitrainer.template-engine)
```

---

## 💡 작업 시 주의사항

1. **template-catalog.ts** 수정 후 반드시 TypeScript 체크:
   ```bash
   npx tsc --noEmit --skipLibCheck
   ```

2. **레이아웃 원칙**: 모바일(flex-col) + 데스크탑(flex-row) 반응형 유지

3. **카드 패턴**: 모든 템플릿/업종 카드는 `IndustryCard` 스타일 유지
   - 헤더: 그라데이션 배경
   - 바디 좌: 학습 데이터 + 과정
   - 바디 우: Before/After 또는 채팅 미리보기

4. **상태관리**: Zustand만 사용 (Redux 금지)

5. **배포 즉시 반영**: `git push origin master`만으로 Railway 자동 배포

---

## 🗂️ 관련 문서

- `API_CONNECTIONS.md` — OAuth/API 키 발급 및 설정 가이드
- `WORK-LOG.md` — 상세 작업 내역
- `AGENTS.md` — 에이전트 아키텍처
- `docs/` — 추가 문서
