# 🤖 AI Trainer Hub

**AI 학습 운영 플랫폼** — 기업 업무 자동화를 위한 AI 모델 구축 및 학습 관리 시스템

🌐 **라이브 서비스**: https://ai-trainer-app-production.up.railway.app/

---

## ✨ 주요 특징

### 🎯 AI 워크플로우 템플릿 (42개)
- **15개 업종별** SVG 일러스트 배경으로 직관적 카테고리화
- 텍스트, 이미지, 데이터 기반 학습 템플릿
- 무료 / Pro / Enterprise 플랜 분류
- 즉시 사용 가능한 학습 시나리오

### 🏢 산업별 솔루션
- 소매, 제조, 금융, 교육, 의료 등 **주요 산업 대응**
- ROI 추정치 및 자동화 수준 표시
- 데이터 유형별 필터링 (구조화/비구조화)

### 📚 AI 학습 시스템
- 단계별 가이드 (description, example 필드)
- 웹캠 기반 실시간 피드백 (이미지 학습)
- 학습 진행률 추적 및 결과 분석

### 🎨 사용자 경험
- SVG 일러스트로 빈 상태(empty state) UI 처리
- 반응형 디자인 (모바일/태블릿 최적화)
- 로그인 유도 인터페이스

---

## 🚀 기술 스택

```
Frontend
├─ Framework: Next.js 15 (App Router)
├─ UI: React 19 + TailwindCSS
├─ Animation: Framer Motion
└─ Icons: Lucide React

Backend
├─ Authentication: NextAuth.js
├─ Database: Prisma + PostgreSQL
├─ API: REST (Next.js API Routes)
└─ File Storage: AWS S3

DevOps
├─ Version Control: Git + GitHub
├─ Deployment: Railway (Docker)
└─ CI/CD: GitHub Actions (자동)
```

---

## 📊 프로젝트 현황 (Phase 2 완료)

### ✅ Phase 1: 일러스트 및 UI 개선
- ✓ 15개 업종별 SVG 에셋 추가
- ✓ 워크플로우 카드에 일러스트 배경 적용
- ✓ 검색 결과 없음 상태 UI (no-results.svg)
- ✓ 학습 로그인 유도 화면 (start-learning.svg)
- ✓ Image 이름 충돌 해결 (next/image 별칭)

### ✅ Phase 2: 제품 스크린샷 및 데모 영상
- ✓ Puppeteer 기반 자동 스크린샷 생성 (4개 페이지)
- ✓ FFmpeg 기반 12초 데모 영상 (demo.mp4)
- ✓ 배포 환경 정리 (.gitignore 처리)

### 📈 코드 품질 개선
- ✓ HomeView 구조 단순화 (537 → 366줄)
- ✓ KnowledgeStep description/example 필드 추가
- ✓ template-catalog 타입 내보내기
- ✓ learn store 로직 정리

---

## 🛠️ 설치 및 개발

### 필수 요구사항
- Node.js 18+
- PostgreSQL 14+

### 로컬 개발 환경 설정

```bash
# 1. 저장소 클론
git clone https://github.com/Jayinsightfactory/ai-trainer-hub.git
cd ai-trainer-hub

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에서 DATABASE_URL, NEXTAUTH_SECRET 등 설정

# 4. 데이터베이스 초기화
npx prisma generate
npx prisma migrate dev

# 5. 개발 서버 시작
npm run dev
# http://localhost:3000에서 접속 가능
```

### 빌드 및 테스트

```bash
# 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 검사
npm run lint
```

---

## 📦 배포

### Railway 자동 배포

1. **GitHub에 커밋 및 푸시**
   ```bash
   git add .
   git commit -m "feat: 새 기능"
   git push origin master
   ```

2. **자동 배포** (1-5분 소요)
   - Railway가 GitHub 푸시 감지
   - Dockerfile 빌드
   - 새 버전 배포

**배포 URL**: https://ai-trainer-app-production.up.railway.app/

### 환경 변수 (Railway)
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://ai-trainer-app-production.up.railway.app
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

---

## 📁 프로젝트 구조

```
src/
├── app/                  # Next.js App Router
│   ├── page.tsx         # 홈페이지
│   ├── templates/       # 템플릿 페이지
│   ├── solutions/       # 솔루션 페이지
│   ├── learn/           # 학습 페이지
│   └── dashboard/       # 대시보드
├── components/          # React 컴포넌트
├── lib/                 # 유틸리티
│   ├── template-catalog.ts      # 템플릿 데이터
│   └── template-workflows.ts    # 워크플로우 데이터
└── store/               # Zustand 상태 관리

public/
├── images/
│   └── empty-states/    # 빈 상태 SVG (5개)
└── screenshots/         # 스크린샷 (자동 생성)

scripts/
├── screenshot-fixed.js           # Puppeteer 스크린샷
├── create-demo-video.sh          # FFmpeg 영상 생성
└── verify-live-site.js           # 라이브 검증
```

---

## 📊 주요 메트릭

| 메트릭 | 수치 |
|--------|------|
| 워크플로우 템플릿 | 42개 |
| 업종 분류 | 15개 |
| 산업별 솔루션 | 20개+ |
| 학습 사례 | 21개 |
| 페이지 로드 속도 | 1-4초 |
| SVG 에셋 | 20개 (15 업종 + 5 빈상태) |

---

## 🤝 기여

이슈 제보 및 피드백은 언제든 환영합니다.

```bash
git checkout -b feature/your-feature
git add .
git commit -m "feat: 설명"
git push origin feature/your-feature
```

---

## 📄 라이선스

MIT License

---

**마지막 업데이트**: 2026-04-11 (Phase 2 완료 + Railway 배포)
