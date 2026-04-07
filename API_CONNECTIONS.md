# API 연결 가이드 — AI Trainer Hub

> Railway 환경변수 설정 기준. 아래 항목을 Railway Dashboard → Variables에 등록하세요.

---

## 🔐 1. 인증 (OAuth)

### ✅ 카카오 로그인 (최우선)
| 항목 | 값 | 발급처 |
|------|-----|--------|
| `KAKAO_CLIENT_ID` | 앱 REST API 키 | [developers.kakao.com](https://developers.kakao.com) |
| `KAKAO_CLIENT_SECRET` | 보안 → Client Secret | 동일 |

**설정 방법:**
1. kakao developers → 내 애플리케이션 → 앱 추가
2. 플랫폼 → Web → 사이트 도메인 등록 (Railway URL)
3. 카카오 로그인 활성화 ON
4. Redirect URI: `https://YOUR_DOMAIN/api/auth/callback/kakao`
5. 동의항목: 닉네임, 프로필 사진, 이메일(선택) 체크

---

### ✅ 네이버 로그인
| 항목 | 값 | 발급처 |
|------|-----|--------|
| `NAVER_CLIENT_ID` | Client ID | [developers.naver.com](https://developers.naver.com) |
| `NAVER_CLIENT_SECRET` | Client Secret | 동일 |

**설정 방법:**
1. 네이버 개발자센터 → 애플리케이션 등록
2. 서비스 URL: Railway 도메인
3. Callback URL: `https://YOUR_DOMAIN/api/auth/callback/naver`
4. 제공 정보: 이름, 이메일, 프로필사진 체크

---

### ✅ 구글 로그인
| 항목 | 값 | 발급처 |
|------|-----|--------|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 클라이언트 ID | [console.cloud.google.com](https://console.cloud.google.com) |
| `GOOGLE_CLIENT_SECRET` | 클라이언트 보안 비밀번호 | 동일 |

**설정 방법:**
1. Google Cloud Console → API 및 서비스 → 사용자 인증정보
2. OAuth 2.0 클라이언트 ID 생성 (웹 애플리케이션)
3. 승인된 리디렉션 URI: `https://YOUR_DOMAIN/api/auth/callback/google`

---

### ✅ NextAuth 공통
| 항목 | 값 |
|------|-----|
| `NEXTAUTH_SECRET` | 랜덤 32자 이상 문자열 (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://YOUR_RAILWAY_DOMAIN.up.railway.app` |

---

## 🤖 2. AI / LLM

### ✅ Anthropic Claude (핵심 AI)
| 항목 | 값 | 발급처 |
|------|-----|--------|
| `ANTHROPIC_API_KEY` | sk-ant-... | [console.anthropic.com](https://console.anthropic.com) |

**용도:** `/api/chat` — 학습 후 AI 응답 생성, 위저드 어시스턴트
**모델:** `claude-sonnet-4-6`
**없을 때:** Mock 모드로 동작 (기본 응답만)

---

## 🎙️ 3. 음성 (TTS)

### ✅ ElevenLabs (음성 생성)
| 항목 | 값 | 발급처 |
|------|-----|--------|
| `ELEVENLABS_API_KEY` | ... | [elevenlabs.io](https://elevenlabs.io) |

**용도:** `/api/tts` — AI 응답을 음성으로 변환
**없을 때:** 음성 기능 비활성화 (텍스트만 표시)

---

## 🗄️ 4. 데이터베이스

### ✅ Railway PostgreSQL (자동 생성)
| 항목 | 값 |
|------|-----|
| `DATABASE_URL` | Railway가 자동 설정 (PostgreSQL 서비스 추가 시) |

**설정 방법:**
1. Railway Dashboard → New Service → PostgreSQL 추가
2. `DATABASE_URL`이 자동으로 환경변수에 연결됨
3. `npx prisma migrate deploy` 실행 필요

---

## 📁 5. 파일 스토리지 (선택)

### ⬜ Cloudinary (이미지 업로드 저장)
| 항목 | 값 | 발급처 |
|------|-----|--------|
| `CLOUDINARY_CLOUD_NAME` | 클라우드 이름 | [cloudinary.com](https://cloudinary.com) |
| `CLOUDINARY_API_KEY` | API Key | 동일 |
| `CLOUDINARY_API_SECRET` | API Secret | 동일 |

**용도:** 학습 이미지를 영구 저장 (현재는 브라우저 메모리에만 보관)
**없을 때:** 이미지는 세션 동안만 유지됨

### ⬜ AWS S3 (대안)
| 항목 | 값 |
|------|-----|
| `AWS_ACCESS_KEY_ID` | ... |
| `AWS_SECRET_ACCESS_KEY` | ... |
| `AWS_S3_BUCKET` | 버킷 이름 |
| `AWS_REGION` | ap-northeast-2 (서울) |

---

## 💬 6. 메시지 / 알림 (선택)

### ⬜ Slack Webhook (팀 알림)
| 항목 | 값 |
|------|-----|
| `SLACK_WEBHOOK_URL` | Slack Incoming Webhook URL |

**용도:** 새 사용자 가입, 학습 완료 등 운영 알림

### ⬜ Resend (이메일 발송)
| 항목 | 값 | 발급처 |
|------|-----|--------|
| `RESEND_API_KEY` | re_... | [resend.com](https://resend.com) |
| `EMAIL_FROM` | no-reply@yourdomain.com | |

**용도:** 학습 완료 리포트 이메일 발송

---

## 💳 7. 결제 (선택)

### ⬜ 토스페이먼츠
| 항목 | 값 | 발급처 |
|------|-----|--------|
| `TOSS_CLIENT_KEY` | test_ck_... | [developers.tosspayments.com](https://developers.tosspayments.com) |
| `TOSS_SECRET_KEY` | test_sk_... | 동일 |

**용도:** 스타터/프로 플랜 구독 결제

---

## 🔑 우선순위 체크리스트

```
필수 (지금 당장)
 [ ] KAKAO_CLIENT_ID / KAKAO_CLIENT_SECRET     ← 카카오 로그인
 [ ] NAVER_CLIENT_ID / NAVER_CLIENT_SECRET     ← 네이버 로그인
 [ ] NEXTAUTH_SECRET                           ← 세션 암호화
 [ ] NEXTAUTH_URL                              ← Railway 도메인
 [ ] DATABASE_URL                              ← Railway PostgreSQL

핵심 기능
 [ ] ANTHROPIC_API_KEY                         ← AI 실제 응답
 [ ] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET   ← 구글 로그인

추가 기능 (나중에)
 [ ] ELEVENLABS_API_KEY                        ← 음성 출력
 [ ] CLOUDINARY_*                              ← 이미지 영구 저장
 [ ] TOSS_CLIENT_KEY / TOSS_SECRET_KEY         ← 유료 플랜 결제
 [ ] RESEND_API_KEY                            ← 이메일 알림
```

---

## 🚀 Railway 환경변수 설정 방법

1. Railway Dashboard → 해당 서비스 클릭
2. Variables 탭 → New Variable
3. 위 표의 키/값 입력
4. Deploy 자동 트리거 → 완료

**도메인 확인:**
- Settings → Networking → Generate Domain 클릭
- 생성된 URL을 `NEXTAUTH_URL`에 설정
