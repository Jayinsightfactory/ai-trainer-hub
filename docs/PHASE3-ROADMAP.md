# 🚀 Phase 3: AI Trainer Hub 고급 기능 로드맵

**기간**: 2026-04-11 ~ (진행 중)
**목표**: 협업, 다국어, 모바일 지원 + 마켓플레이스

---

## 1️⃣ 실시간 협업 학습 (WebSocket)

### 개요
여러 사용자가 동시에 같은 학습 세션에 참여하고 실시간으로 결과를 공유하는 기능.

### 기술 스택
```
Backend
├─ WebSocket: Socket.io 또는 ws
├─ 메시지 브로드캐스팅: Redis Pub/Sub
└─ 세션 관리: Zustand + Context API

Frontend
├─ 실시간 상태 동기화
├─ 다중 사용자 커서 추적
└─ 협업 캔버스 (웹캠 + 드로우)
```

### 구현 단계
1. Socket.io 서버 구축 (Next.js API)
2. 실시간 학습 세션 생성/조인
3. 사용자 활동 동기화
4. 결과 공유 및 분석

### 예상 일정
- Week 1-2: Socket.io 기본 구축
- Week 3: 동기화 로직
- Week 4: UI 통합

---

## 2️⃣ 다중 언어 지원 (i18n)

### 목표 언어
- English (en)
- 한국어 (ko) ← 기본
- 日本語 (ja)
- 中文 (zh)
- Español (es)

### 기술 스택
```
next-intl (Next.js 전용)
├─ 라우트 기반 언어 분리 (/en, /ko, /ja)
├─ 자동 언어 감지
└─ SEO 최적화 (hreflang 메타 태그)
```

### 구현 계획
1. next-intl 설치 및 설정
2. 메시지 파일 번역 (JSON)
3. UI 컴포넌트 다국어화
4. 환경별 언어 설정 (클라이언트 + 서버)

### 예상 일정
- Week 1: next-intl 통합
- Week 2-3: 컨텐츠 번역
- Week 4: 언어 전환 UI

---

## 3️⃣ 모바일 앱 (React Native)

### 플랫폼
- iOS (14+)
- Android (10+)

### 핵심 기능
```
학습 화면
├─ 웹캠 기반 이미지 학습
├─ 음성 입력 (STT)
└─ 실시간 피드백

대시보드
├─ 학습 진행률
├─ 알림
└─ 오프라인 모드
```

### 기술 스택
```
Frontend
├─ React Native + Expo
├─ React Navigation (라우팅)
└─ Redux Toolkit (상태관리)

Backend 공유
└─ 기존 REST API 그대로 사용
```

### 구현 계획
1. Expo 프로젝트 초기화
2. 핵심 화면 3개 구현 (홈, 템플릿, 학습)
3. API 통합
4. 웹캠/마이크 권한 처리

### 예상 일정
- Week 1: Expo 셋업
- Week 2-3: 핵심 기능
- Week 4: 테스트 및 배포

---

## 4️⃣ 마켓플레이스 (커뮤니티 템플릿)

### 개요
사용자들이 직접 만든 학습 템플릿을 공유/판매하는 플랫폼.

### 기능
```
Template Creator
├─ 템플릿 제작 빌더
├─ 미리보기
└─ 배포 & 관리

Marketplace
├─ 검색 및 필터
├─ 평점 & 리뷰
├─ 구매 (결제 연동)
└─ 라이센싱
```

### 기술 스택
```
Database
├─ templates 테이블 (creator_id FK)
├─ template_reviews (평점)
└─ template_purchases (판매 기록)

Payment
├─ Stripe API (결제)
└─ Webhook (판매 추적)
```

### 구현 계획
1. 데이터베이스 확장 (Prisma)
2. 템플릿 제작 UI
3. 마켓플레이스 검색/필터
4. 결제 처리

### 예상 일정
- Week 1-2: DB 및 API
- Week 3: 제작 UI
- Week 4: 마켓플레이스 UI
- Week 5: 결제 통합

---

## 📊 우선순위 및 일정

```
Q2 2026 (현재)
├─ 실시간 협업 (High)    → Week 1-4
└─ 다중 언어 (High)      → Week 2-4 (병렬)

Q3 2026
├─ 모바일 앱 (Medium)    → Week 1-4
└─ 마켓플레이스 (Medium) → Week 3-5 (병렬)

Q4 2026
└─ 성능 최적화 & 보안 강화
```

---

## 🎯 Phase 3 첫 번째 마일스톤

**목표**: 실시간 협업 학습 최소 기능 제품(MVP) 출시

**구현 범위**:
1. Socket.io 기반 2명 협업 세션
2. 실시간 웹캠 영상 공유
3. 학습 결과 동기화

**성공 기준**:
- [ ] 협업 세션 생성/참여 가능
- [ ] 2명 이상 실시간 데이터 동기화
- [ ] 단계별 결과 공유
- [ ] 라이브 테스트 완료

---

## 📚 학습 리소스

### WebSocket
- Socket.io 공식 문서: https://socket.io/docs/
- Real-time with Next.js: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes

### i18n
- next-intl: https://next-intl-docs.vercel.app/
- Internationalization best practices

### React Native
- React Native docs: https://reactnative.dev/
- Expo docs: https://docs.expo.dev/

---

**작성자**: @Jayinsightfactory
**마지막 업데이트**: 2026-04-11

