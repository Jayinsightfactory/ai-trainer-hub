// =============================================================================
// RAG 기업 문서 검색 학습 데이터 — 사내 지식베이스 AI 검색
// =============================================================================

export const RAG_ENTERPRISE_TRAINING = {
  // ---------------------------------------------------------------------------
  // 샘플 문서 세트 (10개 사내 문서)
  // ---------------------------------------------------------------------------
  sampleDocuments: [
    {
      id: "DOC-HR-001",
      title: "인사 규정",
      category: "HR",
      lastUpdated: "2025-01-15",
      version: "3.2",
      content: `제1장 총칙
제1조 (목적) 이 규정은 주식회사 OO테크(이하 "회사")의 인사 관리에 필요한 사항을 정함을 목적으로 한다.
제2조 (적용범위) 이 규정은 회사에 소속된 모든 임직원에게 적용한다.
제3조 (채용) 1. 채용은 공개 채용을 원칙으로 한다. 2. 수습기간은 3개월로 한다. 3. 수습기간 중 급여는 정규직의 100%를 지급한다.
제2장 근무
제4조 (근무시간) 1. 정규 근무시간은 09:00~18:00 (점심 12:00~13:00)으로 한다. 2. 유연근무제를 시행하며 코어타임은 10:00~16:00이다.
제5조 (재택근무) 1. 주 2회까지 재택근무가 가능하다. 2. 재택근무 신청은 전일 17:00까지 Slack에서 한다. 3. 재택근무 시에도 코어타임에는 응답 가능해야 한다.`,
      chunks: [
        "인사 규정 — 채용은 공개 채용 원칙, 수습기간 3개월, 수습 급여 100%",
        "근무시간 09:00~18:00, 유연근무제 코어타임 10:00~16:00",
        "재택근무 주 2회 가능, 전일 17:00까지 Slack 신청, 코어타임 응답 필수",
      ],
    },
    {
      id: "DOC-HR-002",
      title: "휴가 정책",
      category: "HR",
      lastUpdated: "2025-03-01",
      version: "2.1",
      content: `제1조 (연차) 1. 입사 1년 미만: 매월 1일 발생 (최대 11일). 2. 1년 이상: 15일 + 매 2년마다 1일 추가 (최대 25일).
제2조 (특별휴가) 1. 결혼: 5일. 2. 출산: 배우자 10일, 본인 90일. 3. 자녀 돌봄: 연 10일 (무급). 4. 경조사: 부모상 5일, 조부모상 3일.
제3조 (반차) 오전반차(09~13), 오후반차(13~18) 사용 가능. 반차 2회 = 연차 1일 차감.
제4조 (휴가 신청) HR Portal에서 최소 3일 전 신청, 팀장 승인 필요. 긴급 시 당일 Slack 연락.`,
      chunks: [
        "연차: 1년 미만 매월 1일(최대 11일), 1년 이상 15일 + 2년마다 1일 추가(최대 25일)",
        "특별휴가: 결혼 5일, 배우자 출산 10일, 본인 출산 90일, 자녀돌봄 연 10일(무급)",
        "경조사: 부모상 5일, 조부모상 3일",
        "반차: 오전(09~13)/오후(13~18), 2회=연차1일. 신청은 HR Portal, 3일 전, 팀장승인",
      ],
    },
    {
      id: "DOC-IT-001",
      title: "IT 장비 신청 및 관리 가이드",
      category: "IT",
      lastUpdated: "2024-11-20",
      version: "1.5",
      content: `1. 신규 입사자 장비: MacBook Pro M3 또는 ThinkPad X1 (선택), 27인치 모니터, 키보드/마우스.
2. 장비 교체: 사용 3년 초과 시 교체 가능, IT팀에 Jira 티켓으로 요청.
3. 소프트웨어: 기본 설치 — Slack, Notion, VS Code, Chrome. 추가 유료 SW는 팀장 승인 → IT팀 설치.
4. VPN: 재택근무 시 WireGuard VPN 필수, 초기 설정은 IT팀 가이드 참조.
5. 분실/파손: 즉시 IT팀 + 보안팀 연락. 과실 파손 시 감가상각 잔여분 변상.
6. 퇴직 시: 마지막 근무일에 IT팀에 전 장비 반납, 데이터 완전 초기화.`,
      chunks: [
        "신규 입사자 장비: MacBook Pro M3 or ThinkPad X1, 27인치 모니터, 키보드/마우스",
        "장비 교체: 3년 초과 시 가능, Jira 티켓 요청",
        "기본 SW: Slack, Notion, VS Code, Chrome. 추가 유료 SW는 팀장승인 → IT팀 설치",
        "VPN: 재택 시 WireGuard 필수, 분실 시 즉시 IT+보안팀 연락",
        "퇴직 시 마지막 근무일 전 장비 반납, 데이터 초기화",
      ],
    },
    {
      id: "DOC-HR-003",
      title: "온보딩 가이드",
      category: "HR",
      lastUpdated: "2025-02-10",
      version: "4.0",
      content: `Day 1: 1. HR에서 출입카드/계정 수령. 2. IT팀에서 장비 수령 + 초기설정. 3. 팀장 면담 (30분). 4. 버디 배정.
Week 1: 1. 필수 온라인 교육 (정보보안, 성희롱예방, 개인정보보호). 2. 팀 소개 미팅. 3. 주요 시스템 접근권한 설정.
Month 1: 1. 1:1 중간 피드백 (팀장). 2. OKR 설정. 3. 전사 타운홀 참석.
Month 3: 1. 수습 평가 (팀장 + HR). 2. 정규직 전환 여부 결정. 3. 개발 계획 수립.
버디 제도: 같은 팀 선임 1명이 버디로 3개월간 1:1 서포트. 주 1회 커피챗 권장.`,
      chunks: [
        "Day 1: 출입카드/계정 수령 → IT 장비 수령 → 팀장 면담 → 버디 배정",
        "Week 1: 필수 교육(정보보안, 성희롱예방, 개인정보보호), 팀 소개, 접근권한 설정",
        "Month 1: 팀장 1:1 피드백, OKR 설정, 타운홀 참석",
        "Month 3: 수습 평가(팀장+HR), 정규직 전환 결정, 개발 계획 수립",
        "버디 제도: 같은 팀 선임 3개월 서포트, 주 1회 커피챗",
      ],
    },
    {
      id: "DOC-FIN-001",
      title: "경비 처리 규정",
      category: "Finance",
      lastUpdated: "2025-01-05",
      version: "2.3",
      content: `제1조 (법인카드) 1. 팀장 이상 법인카드 지급. 2. 팀원은 팀 공용카드 사용 또는 개인 선결제 후 정산.
제2조 (식대) 1. 야근식대: 20:00 이후 근무 시 1만5천원 한도. 2. 팀 회식: 1인 5만원 한도, 분기 1회.
제3조 (출장비) 1. 국내: 교통비 실비 + 일비 3만원/일. 2. 해외: 항공 비즈니스(임원)/이코노미(일반), 숙박 실비(상한 15만원/박 국내, $200/박 해외).
제4조 (정산) 1. 지출 후 5영업일 내 SAP에서 정산. 2. 영수증 원본 첨부 필수. 3. 30만원 초과 시 팀장+재무팀 이중 승인.
제5조 (교육비) 1. 직무 관련 교육: 연 200만원 한도 지원. 2. 자격증 취득: 합격 시 응시료 전액 지원.`,
      chunks: [
        "법인카드: 팀장 이상 지급, 팀원은 공용카드 or 개인선결제 후 정산",
        "야근식대: 20시 이후 1만5천원 한도. 팀 회식: 1인 5만원 분기 1회",
        "출장비 국내: 교통 실비+일비 3만원. 해외: 비즈니스(임원)/이코노미(일반), 숙박 상한 $200/박",
        "정산: 5영업일 내 SAP, 영수증 원본 필수, 30만원 초과 시 이중승인",
        "교육비: 직무교육 연 200만원, 자격증 합격 시 응시료 전액 지원",
      ],
    },
    {
      id: "DOC-SEC-001",
      title: "정보보안 정책",
      category: "Security",
      lastUpdated: "2025-02-28",
      version: "5.1",
      content: `제1조 (비밀번호) 1. 최소 12자, 영문+숫자+특수문자 조합. 2. 90일마다 변경 필수. 3. 이전 5회 비밀번호 재사용 불가.
제2조 (접근 통제) 1. 최소 권한 원칙 적용. 2. 퇴직/이동 시 24시간 내 권한 회수. 3. 관리자 계정은 MFA 필수.
제3조 (데이터 분류) Confidential(기밀), Internal(내부), Public(공개) 3등급. 기밀 문서는 암호화 저장 필수.
제4조 (외부 전송) 1. 기밀 데이터 외부 전송 금지. 2. 내부 데이터 전송 시 DLP 승인 필요. 3. USB 사용 금지 (예외: IT팀 승인).
제5조 (사고 보고) 보안 사고 인지 즉시 보안팀 (security@company.com) 신고. 24시간 내 보고서 작성.`,
      chunks: [
        "비밀번호: 12자 이상, 영문+숫자+특수문자, 90일 변경, 최근 5회 재사용 불가",
        "접근 통제: 최소 권한 원칙, 퇴직/이동 24시간 내 회수, 관리자 MFA 필수",
        "데이터 3등급: Confidential/Internal/Public, 기밀은 암호화 저장",
        "외부 전송: 기밀 금지, 내부 DLP 승인 필요, USB 사용 금지(IT 예외)",
        "보안 사고: 즉시 security@company.com 신고, 24시간 내 보고서",
      ],
    },
    {
      id: "DOC-HR-004",
      title: "성과 평가 제도",
      category: "HR",
      lastUpdated: "2025-01-20",
      version: "2.0",
      content: `제1조 (평가 주기) 반기 1회 (6월, 12월).
제2조 (평가 항목) 1. 업무 성과 (OKR 달성률) 60%. 2. 역량 평가 (리더십/협업/전문성) 30%. 3. 동료 평가 10%.
제3조 (평가 등급) S(상위 10%), A(20%), B(40%), C(20%), D(10%).
제4조 (보상) 1. S등급: 기본급의 300% 성과급. 2. A등급: 200%. 3. B등급: 100%. 4. C등급: 50%. 5. D등급: 없음.
제5조 (승진) 1. 2회 연속 A 이상 시 승진 후보. 2. 승진 심사위원회 (CEO, HR, 해당부서장). 3. 최소 재직기간: 대리 2년, 과장 3년, 차장 3년, 부장 4년.`,
      chunks: [
        "성과 평가: 반기 1회(6월, 12월), OKR 달성률 60% + 역량 30% + 동료평가 10%",
        "평가 등급: S(10%) A(20%) B(40%) C(20%) D(10%)",
        "성과급: S 300%, A 200%, B 100%, C 50%, D 없음",
        "승진: A 이상 2회 연속 시 후보, 심사위원회(CEO/HR/부서장), 최소 재직기간 있음",
      ],
    },
    {
      id: "DOC-IT-002",
      title: "개발 환경 설정 가이드",
      category: "IT",
      lastUpdated: "2025-03-10",
      version: "3.1",
      content: `1. Git: GitHub Enterprise 사용. branch 전략 — main, develop, feature/*, hotfix/*.
2. CI/CD: GitHub Actions. PR 시 자동 테스트/린트, develop 머지 시 staging 배포, main 머지 시 production 배포.
3. 코드 리뷰: 최소 2명 approve 필요. CODEOWNERS 파일로 자동 리뷰어 할당.
4. 환경변수: .env 파일 금지, AWS Secrets Manager 사용.
5. 모니터링: Datadog (APM, Logs), PagerDuty (on-call 알림).
6. DB: PostgreSQL (main), Redis (cache), Elasticsearch (search).`,
      chunks: [
        "Git: GitHub Enterprise, branch — main/develop/feature/hotfix",
        "CI/CD: GitHub Actions, PR 자동테스트, develop→staging, main→production",
        "코드리뷰: 최소 2명 approve, CODEOWNERS 자동 리뷰어",
        "환경변수: .env 금지 → AWS Secrets Manager. 모니터링: Datadog+PagerDuty",
        "DB: PostgreSQL(main), Redis(cache), Elasticsearch(search)",
      ],
    },
    {
      id: "DOC-LEGAL-001",
      title: "개인정보처리방침",
      category: "Legal",
      lastUpdated: "2025-02-01",
      version: "4.2",
      content: `제1조 (수집 항목) 필수: 이름, 이메일, 전화번호. 선택: 생년월일, 주소.
제2조 (수집 목적) 서비스 제공, 본인 확인, 고객 상담, 마케팅(동의 시).
제3조 (보유 기간) 회원 탈퇴 후 30일 내 파기. 법적 의무 보관: 계약 5년, 결제 5년, 통신 3개월.
제4조 (제3자 제공) 동의 없이 제3자 제공 금지. 예외: 법적 요구, 수사 목적.
제5조 (파기) 보유 기간 만료 즉시 파기. 전자 파일은 복구 불가능 방법으로 삭제.
제6조 (DPO) 개인정보보호책임자: 법무팀장 (privacy@company.com).`,
      chunks: [
        "수집: 필수(이름/이메일/전화), 선택(생년월일/주소). 목적: 서비스/본인확인/상담/마케팅(동의시)",
        "보유기간: 탈퇴 후 30일 파기. 법적 보관: 계약 5년, 결제 5년, 통신 3개월",
        "제3자 제공: 동의 없이 금지(법적요구/수사 예외). 파기: 복구불가 삭제",
        "DPO: 법무팀장 privacy@company.com",
      ],
    },
    {
      id: "DOC-HR-005",
      title: "복리후생 안내",
      category: "HR",
      lastUpdated: "2025-03-15",
      version: "2.4",
      content: `1. 건강검진: 연 1회, 본인+배우자 종합검진 (상한 50만원).
2. 사내 동호회: 5인 이상 결성, 월 10만원 활동비 지원.
3. 자기개발비: 도서구입, 온라인 강의 등 월 10만원 한도.
4. 경조금: 결혼 20만원, 출산 20만원, 부모상 30만원, 조부모상 10만원.
5. 통신비: 월 5만원 지원.
6. 식대: 점심 1만2천원/일 (사내식당 or 식대카드).
7. 명절 선물: 설/추석 각 10만원 상당 선물 지급.
8. 워케이션: 연 1회, 최대 5일, 회사 지정 장소에서 원격근무.`,
      chunks: [
        "건강검진: 연 1회 본인+배우자 종합검진 50만원 한도",
        "동호회: 5인+, 월 10만원. 자기개발비: 월 10만원",
        "경조금: 결혼 20만, 출산 20만, 부모상 30만, 조부모상 10만",
        "통신비 월 5만, 식대 1만2천/일, 명절선물 10만원씩",
        "워케이션: 연 1회 최대 5일 회사지정장소",
      ],
    },
  ],

  // ---------------------------------------------------------------------------
  // 청킹 설정
  // ---------------------------------------------------------------------------
  chunkingConfig: {
    strategies: [
      {
        name: "fixed_size",
        chunkSize: 500,
        overlap: 50,
        description: "고정 크기 분할 — 단순하지만 문맥 단절 가능",
        bestFor: "구조화되지 않은 긴 텍스트",
      },
      {
        name: "sentence_based",
        maxSentences: 5,
        overlap: 1,
        description: "문장 단위 분할 — 문맥 보존 우수",
        bestFor: "정책 문서, FAQ",
      },
      {
        name: "semantic",
        model: "text-embedding-3-small",
        similarityThreshold: 0.7,
        description: "의미 기반 분할 — 같은 주제끼리 묶임",
        bestFor: "주제가 혼합된 긴 문서",
      },
      {
        name: "heading_based",
        headingLevels: ["h1", "h2", "h3", "제X조"],
        description: "제목/조항 기반 분할 — 구조화된 문서에 최적",
        bestFor: "사내 규정, 법률 문서",
      },
    ],
    recommended: "heading_based",
    preprocessSteps: [
      "HTML/마크다운 태그 제거",
      "표(table)는 텍스트로 변환",
      "이미지는 OCR 또는 alt text 추출",
      "페이지 번호, 헤더/푸터 제거",
      "중복 공백/줄바꿈 정리",
    ],
  },

  // ---------------------------------------------------------------------------
  // 임베딩 모델 선택 가이드
  // ---------------------------------------------------------------------------
  embeddingModels: [
    {
      name: "OpenAI text-embedding-3-small",
      dimensions: 1536,
      maxTokens: 8191,
      costPer1MTokens: "$0.02",
      koreanSupport: "good",
      speed: "fast",
      recommendation: "가성비 최고, 대부분 사용 사례에 적합",
    },
    {
      name: "OpenAI text-embedding-3-large",
      dimensions: 3072,
      maxTokens: 8191,
      costPer1MTokens: "$0.13",
      koreanSupport: "good",
      speed: "medium",
      recommendation: "높은 정확도 필요 시",
    },
    {
      name: "Cohere embed-multilingual-v3.0",
      dimensions: 1024,
      maxTokens: 512,
      costPer1MTokens: "$0.10",
      koreanSupport: "excellent",
      speed: "fast",
      recommendation: "한국어 특화, 다국어 환경에 최적",
    },
    {
      name: "BAAI/bge-m3",
      dimensions: 1024,
      maxTokens: 8192,
      costPer1MTokens: "self-hosted (~$0.005)",
      koreanSupport: "excellent",
      speed: "medium",
      recommendation: "자체 호스팅 가능, 비용 최소화",
    },
  ],

  // ---------------------------------------------------------------------------
  // 벡터 DB 설정
  // ---------------------------------------------------------------------------
  vectorDBConfig: {
    options: [
      {
        name: "Pinecone",
        type: "managed",
        freeTier: true,
        maxVectors: "100K (free)",
        pricing: "$0.096/hr (s1.x1)",
        recommendation: "빠른 시작, 관리 불필요",
      },
      {
        name: "Supabase pgvector",
        type: "managed",
        freeTier: true,
        maxVectors: "unlimited (storage 기반)",
        pricing: "$25/month (Pro)",
        recommendation: "이미 Supabase 사용 중이면 최적",
      },
      {
        name: "Chroma",
        type: "self-hosted",
        freeTier: true,
        maxVectors: "unlimited",
        pricing: "server cost only",
        recommendation: "로컬 개발/프로토타입",
      },
    ],
    selected: "Supabase pgvector",
    indexType: "ivfflat",
    distanceMetric: "cosine",
    listsCount: 100,
  },

  // ---------------------------------------------------------------------------
  // 테스트 쿼리 + 기대 결과
  // ---------------------------------------------------------------------------
  testQueries: [
    {
      query: "연차 몇 일이야?",
      expectedChunks: ["DOC-HR-002"],
      expectedAnswer:
        "입사 1년 미만: 매월 1일 발생(최대 11일), 1년 이상: 15일 + 매 2년마다 1일 추가(최대 25일)",
      difficulty: "easy",
    },
    {
      query: "재택근무 신청 방법",
      expectedChunks: ["DOC-HR-001"],
      expectedAnswer:
        "주 2회까지 가능, 전일 17:00까지 Slack에서 신청, 코어타임(10-16) 응답 필수",
      difficulty: "easy",
    },
    {
      query: "노트북 교체하고 싶어요",
      expectedChunks: ["DOC-IT-001"],
      expectedAnswer:
        "사용 3년 초과 시 교체 가능, IT팀에 Jira 티켓으로 요청",
      difficulty: "easy",
    },
    {
      query: "결혼하면 뭐가 있어?",
      expectedChunks: ["DOC-HR-002", "DOC-HR-005"],
      expectedAnswer:
        "결혼 특별휴가 5일 + 경조금 20만원",
      difficulty: "medium",
      note: "cross-document: 휴가+복리후생 문서 모두 참조 필요",
    },
    {
      query: "해외 출장 갈 때 비행기 비즈니스 타도 되나요?",
      expectedChunks: ["DOC-FIN-001"],
      expectedAnswer:
        "임원은 비즈니스, 일반 직원은 이코노미. 숙박은 $200/박 상한",
      difficulty: "medium",
    },
    {
      query: "USB 써도 돼?",
      expectedChunks: ["DOC-SEC-001"],
      expectedAnswer: "USB 사용 금지. 예외적으로 IT팀 승인 시 가능",
      difficulty: "easy",
    },
    {
      query: "신입사원인데 첫날 뭐 해야 하나요?",
      expectedChunks: ["DOC-HR-003"],
      expectedAnswer:
        "Day 1: HR에서 출입카드/계정 수령 → IT팀 장비 수령 → 팀장 면담 → 버디 배정",
      difficulty: "easy",
    },
    {
      query: "S등급 받으면 보너스 얼마야?",
      expectedChunks: ["DOC-HR-004"],
      expectedAnswer: "S등급: 기본급의 300% 성과급",
      difficulty: "easy",
    },
    {
      query: "비밀번호 규칙이랑 보안 사고 보고는 어떻게?",
      expectedChunks: ["DOC-SEC-001"],
      expectedAnswer:
        "비밀번호: 12자 이상, 영문+숫자+특수문자, 90일 변경. 보안사고: 즉시 security@company.com 신고, 24시간 내 보고서",
      difficulty: "medium",
      note: "동일 문서 내 다른 섹션 참조",
    },
    {
      query: "우리 회사 DB는 뭐 쓰나요?",
      expectedChunks: ["DOC-IT-002"],
      expectedAnswer:
        "PostgreSQL(메인), Redis(캐시), Elasticsearch(검색)",
      difficulty: "easy",
    },
    {
      query: "개인정보 보관 기간이 어떻게 되나요?",
      expectedChunks: ["DOC-LEGAL-001"],
      expectedAnswer:
        "탈퇴 후 30일 파기. 법적 보관: 계약 5년, 결제 5년, 통신 3개월",
      difficulty: "easy",
    },
    {
      query: "내가 쓸 수 있는 자기개발 지원금이 뭐가 있어?",
      expectedChunks: ["DOC-HR-005", "DOC-FIN-001"],
      expectedAnswer:
        "자기개발비 월 10만원(도서/강의) + 직무교육 연 200만원 + 자격증 합격 시 응시료 전액",
      difficulty: "hard",
      note: "cross-document: 복리후생 + 경비처리 문서 모두 참조",
    },
    {
      query: "퇴사할 때 해야 할 것들",
      expectedChunks: ["DOC-IT-001", "DOC-SEC-001"],
      expectedAnswer:
        "IT: 마지막 근무일 장비 반납 + 데이터 초기화. 보안: 24시간 내 접근 권한 회수",
      difficulty: "hard",
      note: "cross-document: IT장비 + 보안 문서 참조",
    },
  ],

  // ---------------------------------------------------------------------------
  // 엣지 케이스
  // ---------------------------------------------------------------------------
  edgeCases: [
    {
      scenario: "문서 간 교차 질문",
      issue: "답변이 여러 문서에 분산되어 있음",
      solution: "multi-hop retrieval: top-k를 높이고 (k=10), reranking 적용",
    },
    {
      scenario: "모호한 쿼리 ('그거 알려줘')",
      issue: "의도 파악 불가",
      solution: "대화 컨텍스트 참조 or 명확화 질문 생성",
    },
    {
      scenario: "구버전 문서와 신버전 문서 충돌",
      issue: "동일 주제에 대해 상반된 정보 검색",
      solution: "문서 버전 메타데이터로 최신 우선, 구버전은 archived 마킹",
    },
    {
      scenario: "문서에 없는 질문",
      issue: "할루시네이션 위험",
      solution:
        "relevance score threshold (0.75) 미만 시 '해당 정보를 찾을 수 없습니다' 응답",
    },
    {
      scenario: "매우 긴 답변이 필요한 질문",
      issue: "여러 청크를 조합해야 하지만 토큰 제한",
      solution: "hierarchical summarization: 청크 요약 → 최종 조합",
    },
    {
      scenario: "표/차트가 포함된 문서",
      issue: "임베딩이 표 구조를 제대로 인코딩하지 못함",
      solution: "표를 자연어로 변환 후 별도 청킹, 원본 표는 참조 링크",
    },
    {
      scenario: "동음이의어 쿼리 ('지원'이 뭐야?)",
      issue: "'지원'이 복리후생 지원인지 기술 지원인지 모호",
      solution: "부서/맥락 기반 disambiguation, 후보 2-3개 제시",
    },
  ],

  // ---------------------------------------------------------------------------
  // 에러 시나리오
  // ---------------------------------------------------------------------------
  errorScenarios: [
    {
      code: "RAG_ERR_001",
      name: "청크 크기 초과",
      trigger: "chunk_tokens > model_max_tokens",
      message: "청크가 모델 입력 한도를 초과합니다. 청킹 설정을 조정해 주세요.",
      recovery: "자동 re-chunking with smaller size",
    },
    {
      code: "RAG_ERR_002",
      name: "임베딩 드리프트",
      trigger: "avg_similarity_drop > 15% over 30 days",
      message:
        "임베딩 품질이 저하되었습니다. 문서가 크게 변경되었다면 재인덱싱이 필요합니다.",
      recovery: "전체 재인덱싱 트리거",
    },
    {
      code: "RAG_ERR_003",
      name: "관련성 임계값 미달",
      trigger: "top_score < relevance_threshold (0.75)",
      message:
        "관련 문서를 찾을 수 없습니다. 질문을 더 구체적으로 해 주세요.",
      recovery: "fallback: LLM 일반 지식으로 답변 + disclaimer",
    },
    {
      code: "RAG_ERR_004",
      name: "문서 파싱 실패",
      trigger: "parse_error on upload",
      message: "문서를 읽을 수 없습니다. 지원 형식: PDF, DOCX, TXT, MD, HTML",
      recovery: "OCR fallback for scanned PDFs",
    },
    {
      code: "RAG_ERR_005",
      name: "인덱싱 타임아웃",
      trigger: "indexing_time > 300s",
      message: "문서 인덱싱이 오래 걸리고 있습니다. 백그라운드 처리로 전환합니다.",
      recovery: "async queue 전환 + 완료 시 알림",
    },
  ],

  // ---------------------------------------------------------------------------
  // 비용 추정
  // ---------------------------------------------------------------------------
  costs: {
    embedding: {
      "text-embedding-3-small": "$0.02 / 1M tokens",
      "text-embedding-3-large": "$0.13 / 1M tokens",
    },
    vectorDB: {
      supabase: "$25/month (Pro plan)",
      pinecone: "$70/month (s1.x1)",
    },
    llm: {
      "gpt-4o-mini": "$0.15 / 1M input tokens",
      "gpt-4o": "$2.50 / 1M input tokens",
    },
    estimatedMonthly: {
      small: "$30 (100 docs, 1000 queries/month)",
      medium: "$100 (1000 docs, 10000 queries/month)",
      enterprise: "$500+ (10000+ docs, unlimited queries)",
    },
  },
} as const;

export type RAGEnterpriseTraining = typeof RAG_ENTERPRISE_TRAINING;
export type SampleDocument =
  (typeof RAG_ENTERPRISE_TRAINING.sampleDocuments)[number];
export type TestQuery = (typeof RAG_ENTERPRISE_TRAINING.testQueries)[number];
