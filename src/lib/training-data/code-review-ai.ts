// =============================================================================
// AI 코드 리뷰 학습 데이터 — 자동 코드 리뷰 + 보안 검사
// =============================================================================

export const CODE_REVIEW_TRAINING = {
  // ---------------------------------------------------------------------------
  // 코딩 컨벤션 문서
  // ---------------------------------------------------------------------------
  codingConventions: {
    naming: {
      variables: "camelCase (예: userName, itemCount)",
      constants: "UPPER_SNAKE_CASE (예: MAX_RETRY_COUNT, API_BASE_URL)",
      functions: "camelCase, 동사로 시작 (예: getUserById, calculateTotal)",
      classes: "PascalCase (예: UserService, PaymentGateway)",
      interfaces: "PascalCase, I 접두사 없이 (예: UserRepository, not IUserRepository)",
      types: "PascalCase + 접미사 (예: UserDTO, CreateOrderRequest, ApiResponse)",
      files: "kebab-case (예: user-service.ts, payment-gateway.ts)",
      components: "PascalCase.tsx (예: UserProfile.tsx, OrderList.tsx)",
      testFiles: "*.test.ts 또는 *.spec.ts",
      enumValues: "PascalCase (예: Status.Active, Role.Admin)",
    },
    structure: {
      maxFunctionLines: 30,
      maxFileLines: 300,
      maxParameters: 4,
      maxNestingDepth: 3,
      maxCyclomaticComplexity: 10,
      importOrder: [
        "1. Node built-in modules",
        "2. External packages",
        "3. Internal packages (@/)",
        "4. Relative imports (./)",
        "5. Type imports",
      ],
      directoryStructure: {
        "src/app": "Next.js App Router pages",
        "src/components": "UI components",
        "src/lib": "Business logic, utils",
        "src/hooks": "Custom React hooks",
        "src/types": "TypeScript type definitions",
        "src/services": "External API integrations",
        "src/constants": "App constants",
      },
    },
    patterns: {
      errorHandling: "try-catch with typed errors, no bare catch",
      asyncAwait: "async/await 선호 (Promise.then 지양)",
      immutability: "const 기본, let 필요 시만 사용, var 금지",
      nullSafety: "optional chaining (?.) + nullish coalescing (??) 활용",
      earlyReturn: "조건 불만족 시 early return으로 중첩 최소화",
      dryPrinciple: "3회 이상 반복 코드는 함수/유틸로 추출",
    },
  },

  // ---------------------------------------------------------------------------
  // 코드 리뷰 코멘트 패턴 (55개)
  // ---------------------------------------------------------------------------
  reviewPatterns: [
    // ===== 네이밍 =====
    {
      id: "NAME-001",
      category: "naming",
      severity: "suggestion" as const,
      pattern: "한 글자 변수명",
      bad: "const d = new Date();",
      good: "const currentDate = new Date();",
      comment: "변수명이 `d`로 의미를 파악하기 어렵습니다. `currentDate`처럼 의도가 드러나는 이름을 사용해 주세요.",
    },
    {
      id: "NAME-002",
      category: "naming",
      severity: "suggestion" as const,
      pattern: "boolean 변수에 is/has/should 접두사 없음",
      bad: "const active = user.status === 'active';",
      good: "const isActive = user.status === 'active';",
      comment: "Boolean 변수는 `is`, `has`, `should` 접두사로 타입을 명시해 주세요.",
    },
    {
      id: "NAME-003",
      category: "naming",
      severity: "warning" as const,
      pattern: "함수명이 동사로 시작하지 않음",
      bad: "function userData(id: string) { ... }",
      good: "function getUserData(id: string) { ... }",
      comment: "함수명은 `get`, `create`, `update` 등 동사로 시작해야 합니다.",
    },
    {
      id: "NAME-004",
      category: "naming",
      severity: "suggestion" as const,
      pattern: "약어 남용",
      bad: "const usrMgr = new UserManager();",
      good: "const userManager = new UserManager();",
      comment: "약어 대신 완전한 단어를 사용해 가독성을 높여 주세요.",
    },
    {
      id: "NAME-005",
      category: "naming",
      severity: "warning" as const,
      pattern: "매직 넘버",
      bad: "if (retryCount > 3) { ... }",
      good: "const MAX_RETRY_COUNT = 3;\nif (retryCount > MAX_RETRY_COUNT) { ... }",
      comment: "숫자 리터럴 `3`이 무엇을 의미하는지 불분명합니다. 상수로 추출해 주세요.",
    },

    // ===== 구조 =====
    {
      id: "STRUCT-001",
      category: "structure",
      severity: "warning" as const,
      pattern: "함수가 너무 김 (30줄 초과)",
      bad: "function processOrder() { /* 80줄 */ }",
      good: "function processOrder() {\n  validateOrder();\n  calculateTotal();\n  applyDiscount();\n  createInvoice();\n}",
      comment: "함수가 30줄을 초과합니다. 단일 책임 원칙에 따라 작은 함수로 분리해 주세요.",
    },
    {
      id: "STRUCT-002",
      category: "structure",
      severity: "warning" as const,
      pattern: "깊은 중첩 (3레벨 초과)",
      bad: "if (a) { if (b) { if (c) { if (d) { ... } } } }",
      good: "if (!a) return;\nif (!b) return;\nif (!c) return;\nif (d) { ... }",
      comment: "중첩이 너무 깊습니다. Early return 패턴으로 평탄화해 주세요.",
    },
    {
      id: "STRUCT-003",
      category: "structure",
      severity: "error" as const,
      pattern: "순환 의존성",
      bad: "// a.ts imports b.ts, b.ts imports a.ts",
      good: "// 공통 타입을 types.ts로 추출, 양쪽에서 import",
      comment: "순환 의존성이 감지되었습니다. 공통 모듈을 분리해 주세요.",
    },
    {
      id: "STRUCT-004",
      category: "structure",
      severity: "suggestion" as const,
      pattern: "파라미터 4개 초과",
      bad: "function createUser(name, email, phone, address, role, dept) {}",
      good: "function createUser(params: CreateUserParams) {}",
      comment: "파라미터가 4개를 초과합니다. 객체 파라미터로 리팩토링해 주세요.",
    },
    {
      id: "STRUCT-005",
      category: "structure",
      severity: "warning" as const,
      pattern: "God function / God class",
      bad: "class AppManager { /* 500줄, 모든 기능 */ }",
      good: "class UserService { ... }\nclass OrderService { ... }\nclass NotificationService { ... }",
      comment: "클래스가 너무 많은 책임을 가지고 있습니다. 역할별로 분리해 주세요.",
    },

    // ===== 에러 처리 =====
    {
      id: "ERR-001",
      category: "error_handling",
      severity: "error" as const,
      pattern: "빈 catch 블록",
      bad: "try { await save(); } catch (e) {}",
      good: "try { await save(); } catch (error) {\n  logger.error('Failed to save', { error });\n  throw new SaveError('Save failed', { cause: error });\n}",
      comment: "빈 catch 블록은 에러를 숨깁니다. 최소한 로깅하거나 re-throw 해주세요.",
    },
    {
      id: "ERR-002",
      category: "error_handling",
      severity: "warning" as const,
      pattern: "catch(any) 사용",
      bad: "catch (error: any) { console.log(error.message); }",
      good: "catch (error) {\n  if (error instanceof ApiError) {\n    handleApiError(error);\n  } else {\n    throw error;\n  }\n}",
      comment: "`any` 타입 대신 `instanceof`로 에러 타입을 좁혀서 처리해 주세요.",
    },
    {
      id: "ERR-003",
      category: "error_handling",
      severity: "error" as const,
      pattern: "async 함수에 try-catch 없음",
      bad: "async function fetchUser() {\n  const res = await fetch('/api/user');\n  return res.json();\n}",
      good: "async function fetchUser() {\n  try {\n    const res = await fetch('/api/user');\n    if (!res.ok) throw new ApiError(res.status);\n    return res.json();\n  } catch (error) {\n    logger.error('fetchUser failed', { error });\n    throw error;\n  }\n}",
      comment: "외부 API 호출에는 에러 처리가 필수입니다. try-catch를 추가해 주세요.",
    },
    {
      id: "ERR-004",
      category: "error_handling",
      severity: "warning" as const,
      pattern: "에러 메시지가 유저에게 노출",
      bad: "res.status(500).json({ error: error.stack });",
      good: "res.status(500).json({ error: 'Internal server error', requestId });\nlogger.error(error);",
      comment: "에러 스택을 클라이언트에 노출하면 보안 위험입니다. 일반적인 메시지만 반환하세요.",
    },

    // ===== 성능 =====
    {
      id: "PERF-001",
      category: "performance",
      severity: "warning" as const,
      pattern: "루프 안에서 await",
      bad: "for (const id of ids) {\n  const user = await getUser(id);\n}",
      good: "const users = await Promise.all(ids.map(id => getUser(id)));",
      comment: "루프 안에서 await는 순차 실행됩니다. `Promise.all`로 병렬 처리해 주세요.",
    },
    {
      id: "PERF-002",
      category: "performance",
      severity: "warning" as const,
      pattern: "N+1 쿼리",
      bad: "const orders = await getOrders();\nfor (const o of orders) {\n  o.user = await getUser(o.userId);\n}",
      good: "const orders = await getOrdersWithUsers(); // JOIN query",
      comment: "N+1 쿼리 패턴입니다. JOIN 또는 batch fetch로 변경해 주세요.",
    },
    {
      id: "PERF-003",
      category: "performance",
      severity: "suggestion" as const,
      pattern: "불필요한 리렌더링",
      bad: "const Component = () => {\n  const handler = () => { ... };\n  return <Child onClick={handler} />;\n};",
      good: "const Component = () => {\n  const handler = useCallback(() => { ... }, []);\n  return <Child onClick={handler} />;\n};",
      comment: "매 렌더마다 새 함수가 생성됩니다. `useCallback`으로 메모이제이션을 고려해 주세요.",
    },
    {
      id: "PERF-004",
      category: "performance",
      severity: "warning" as const,
      pattern: "거대한 번들 import",
      bad: "import _ from 'lodash';",
      good: "import debounce from 'lodash/debounce';",
      comment: "lodash 전체를 import하면 번들 크기가 증가합니다. 필요한 함수만 import 해주세요.",
    },
    {
      id: "PERF-005",
      category: "performance",
      severity: "suggestion" as const,
      pattern: "메모이제이션 누락",
      bad: "const filtered = items.filter(i => i.active).sort((a,b) => a.name.localeCompare(b.name));",
      good: "const filtered = useMemo(() => items.filter(i => i.active).sort((a,b) => a.name.localeCompare(b.name)), [items]);",
      comment: "비용이 큰 연산은 `useMemo`로 메모이제이션을 고려해 주세요.",
    },

    // ===== 보안 =====
    {
      id: "SEC-001",
      category: "security",
      severity: "critical" as const,
      pattern: "SQL Injection",
      bad: "const query = `SELECT * FROM users WHERE id = '${userId}'`;",
      good: "const query = 'SELECT * FROM users WHERE id = $1';\nawait db.query(query, [userId]);",
      comment: "SQL Injection 취약점! 반드시 파라미터 바인딩을 사용하세요.",
    },
    {
      id: "SEC-002",
      category: "security",
      severity: "critical" as const,
      pattern: "XSS (Cross-Site Scripting)",
      bad: "element.innerHTML = userInput;",
      good: "element.textContent = userInput;\n// or: DOMPurify.sanitize(userInput)",
      comment: "XSS 취약점! `innerHTML` 대신 `textContent`를 사용하거나 DOMPurify로 새니타이즈하세요.",
    },
    {
      id: "SEC-003",
      category: "security",
      severity: "critical" as const,
      pattern: "하드코딩된 시크릿",
      bad: "const API_KEY = 'sk-abc123xyz789';",
      good: "const API_KEY = process.env.API_KEY;",
      comment: "API 키가 코드에 하드코딩되어 있습니다! 환경변수로 이동하세요.",
    },
    {
      id: "SEC-004",
      category: "security",
      severity: "critical" as const,
      pattern: "CSRF 보호 없음",
      bad: "app.post('/api/transfer', handleTransfer);",
      good: "app.post('/api/transfer', csrfProtection, handleTransfer);",
      comment: "상태 변경 API에 CSRF 보호가 없습니다. CSRF 토큰을 추가하세요.",
    },
    {
      id: "SEC-005",
      category: "security",
      severity: "error" as const,
      pattern: "민감 데이터 로깅",
      bad: "logger.info('Login', { email, password });",
      good: "logger.info('Login', { email, password: '[REDACTED]' });",
      comment: "비밀번호가 로그에 기록됩니다. 민감 데이터는 마스킹해 주세요.",
    },
    {
      id: "SEC-006",
      category: "security",
      severity: "error" as const,
      pattern: "인증 없는 API",
      bad: "router.delete('/api/users/:id', deleteUser);",
      good: "router.delete('/api/users/:id', authenticate, authorize('admin'), deleteUser);",
      comment: "인증/인가 미들웨어가 없는 삭제 API입니다. 반드시 추가하세요.",
    },
    {
      id: "SEC-007",
      category: "security",
      severity: "warning" as const,
      pattern: "안전하지 않은 정규식 (ReDoS)",
      bad: "const regex = /^(a+)+$/;",
      good: "const regex = /^a+$/;",
      comment: "중첩된 반복 패턴이 ReDoS 공격에 취약합니다. 정규식을 단순화하세요.",
    },
    {
      id: "SEC-008",
      category: "security",
      severity: "critical" as const,
      pattern: "Path Traversal",
      bad: "const file = fs.readFileSync(`./uploads/${req.params.filename}`);",
      good: "const safeName = path.basename(req.params.filename);\nconst file = fs.readFileSync(path.join(UPLOAD_DIR, safeName));",
      comment: "Path Traversal 취약점! `path.basename`으로 경로를 정규화하세요.",
    },
    {
      id: "SEC-009",
      category: "security",
      severity: "error" as const,
      pattern: "HTTP Only Cookie 미설정",
      bad: "res.cookie('token', jwt);",
      good: "res.cookie('token', jwt, { httpOnly: true, secure: true, sameSite: 'strict' });",
      comment: "인증 토큰 쿠키에 `httpOnly`, `secure`, `sameSite` 옵션을 설정하세요.",
    },
    {
      id: "SEC-010",
      category: "security",
      severity: "warning" as const,
      pattern: "CORS 와일드카드",
      bad: "app.use(cors({ origin: '*' }));",
      good: "app.use(cors({ origin: ['https://app.example.com'], credentials: true }));",
      comment: "CORS에 와일드카드(`*`)를 사용하면 보안 위험입니다. 허용 도메인을 명시하세요.",
    },

    // ===== TypeScript =====
    {
      id: "TS-001",
      category: "typescript",
      severity: "warning" as const,
      pattern: "any 타입 사용",
      bad: "function process(data: any) { ... }",
      good: "function process(data: ProcessInput) { ... }",
      comment: "`any` 타입은 타입 안전성을 무력화합니다. 적절한 타입을 정의해 주세요.",
    },
    {
      id: "TS-002",
      category: "typescript",
      severity: "suggestion" as const,
      pattern: "타입 assertion 남용",
      bad: "const user = data as User;",
      good: "function isUser(data: unknown): data is User {\n  return 'id' in data && 'name' in data;\n}",
      comment: "타입 assertion 대신 type guard를 사용하면 런타임 안전성이 높아집니다.",
    },
    {
      id: "TS-003",
      category: "typescript",
      severity: "warning" as const,
      pattern: "non-null assertion (!) 남용",
      bad: "const name = user!.profile!.name!;",
      good: "const name = user?.profile?.name ?? 'Unknown';",
      comment: "`!` 연산자는 런타임 에러를 유발할 수 있습니다. optional chaining을 사용하세요.",
    },
    {
      id: "TS-004",
      category: "typescript",
      severity: "suggestion" as const,
      pattern: "enum 대신 union type",
      bad: "enum Status { Active, Inactive, Pending }",
      good: "type Status = 'active' | 'inactive' | 'pending';",
      comment: "TypeScript에서는 string union type이 enum보다 tree-shaking에 유리합니다.",
    },
    {
      id: "TS-005",
      category: "typescript",
      severity: "error" as const,
      pattern: "@ts-ignore 사용",
      bad: "// @ts-ignore\nconst result = badFunction();",
      good: "// @ts-expect-error -- 타사 라이브러리 타입 불일치 (#1234)\nconst result = badFunction();",
      comment: "`@ts-ignore` 대신 `@ts-expect-error`를 사용하고 사유를 명시하세요.",
    },

    // ===== React =====
    {
      id: "REACT-001",
      category: "react",
      severity: "warning" as const,
      pattern: "useEffect 의존성 누락",
      bad: "useEffect(() => { fetchData(userId); }, []);",
      good: "useEffect(() => { fetchData(userId); }, [userId]);",
      comment: "`userId`가 의존성 배열에 빠져 있어 값이 변경되어도 재실행되지 않습니다.",
    },
    {
      id: "REACT-002",
      category: "react",
      severity: "error" as const,
      pattern: "직접 state 변경",
      bad: "state.items.push(newItem);\nsetState(state);",
      good: "setState(prev => ({ ...prev, items: [...prev.items, newItem] }));",
      comment: "state를 직접 변경하면 React가 변경을 감지하지 못합니다. 불변성을 유지하세요.",
    },
    {
      id: "REACT-003",
      category: "react",
      severity: "warning" as const,
      pattern: "key로 index 사용",
      bad: "{items.map((item, i) => <Item key={i} {...item} />)}",
      good: "{items.map(item => <Item key={item.id} {...item} />)}",
      comment: "배열 index를 key로 사용하면 리스트 변경 시 성능 문제가 발생합니다. 고유 ID를 사용하세요.",
    },
    {
      id: "REACT-004",
      category: "react",
      severity: "suggestion" as const,
      pattern: "prop drilling (3레벨+)",
      bad: "// App → Layout → Sidebar → Menu → MenuItem (theme 전달)",
      good: "// Context 또는 Zustand store 사용",
      comment: "Props가 3레벨 이상 전달되고 있습니다. Context나 상태관리 라이브러리를 고려하세요.",
    },
    {
      id: "REACT-005",
      category: "react",
      severity: "warning" as const,
      pattern: "render 안에서 컴포넌트 정의",
      bad: "function Parent() {\n  const Child = () => <div/>;\n  return <Child />;\n}",
      good: "const Child = () => <div/>;\nfunction Parent() {\n  return <Child />;\n}",
      comment: "render 안에서 컴포넌트를 정의하면 매번 새로 생성됩니다. 외부로 분리하세요.",
    },

    // ===== 테스트 =====
    {
      id: "TEST-001",
      category: "testing",
      severity: "warning" as const,
      pattern: "테스트 없는 비즈니스 로직",
      bad: "// calculateDiscount.ts — no test file",
      good: "// calculateDiscount.test.ts 추가",
      comment: "비즈니스 로직에 테스트가 없습니다. 단위 테스트를 추가해 주세요.",
    },
    {
      id: "TEST-002",
      category: "testing",
      severity: "suggestion" as const,
      pattern: "테스트 설명이 불명확",
      bad: "it('works', () => { ... });",
      good: "it('should return 10% discount for orders over 100,000 KRW', () => { ... });",
      comment: "테스트 설명이 불명확합니다. '무엇이 어떻게 되어야 하는지' 구체적으로 작성하세요.",
    },
    {
      id: "TEST-003",
      category: "testing",
      severity: "warning" as const,
      pattern: "실제 API 호출하는 테스트",
      bad: "const result = await fetch('https://api.example.com/users');",
      good: "const mockFetch = vi.fn().mockResolvedValue({ json: () => mockUsers });\nconst result = await fetchUsers(mockFetch);",
      comment: "테스트에서 실제 API를 호출합니다. Mock을 사용해 외부 의존성을 제거하세요.",
    },
    {
      id: "TEST-004",
      category: "testing",
      severity: "suggestion" as const,
      pattern: "assertion 없는 테스트",
      bad: "it('renders', () => { render(<Component />); });",
      good: "it('renders user name', () => {\n  render(<Component />);\n  expect(screen.getByText('John')).toBeInTheDocument();\n});",
      comment: "테스트에 assertion이 없어 실제 검증이 되지 않습니다.",
    },

    // ===== 접근성 =====
    {
      id: "A11Y-001",
      category: "accessibility",
      severity: "warning" as const,
      pattern: "img에 alt 없음",
      bad: "<img src={url} />",
      good: '<img src={url} alt="상품 미리보기 이미지" />',
      comment: "이미지에 `alt` 속성이 없습니다. 스크린 리더 사용자를 위해 추가하세요.",
    },
    {
      id: "A11Y-002",
      category: "accessibility",
      severity: "warning" as const,
      pattern: "클릭 핸들러가 div에",
      bad: "<div onClick={handler}>Click me</div>",
      good: '<button onClick={handler}>Click me</button>\n// or: <div role="button" tabIndex={0} onClick={handler} onKeyDown={handler}>',
      comment: "클릭 가능한 요소는 `<button>`을 사용하거나 `role`, `tabIndex`를 추가하세요.",
    },
    {
      id: "A11Y-003",
      category: "accessibility",
      severity: "suggestion" as const,
      pattern: "색상만으로 상태 표시",
      bad: '<span style={{color: "red"}}>에러</span>',
      good: '<span style={{color: "red"}}>❌ 에러</span>',
      comment: "색맹 사용자를 위해 아이콘이나 텍스트도 함께 사용해 주세요.",
    },

    // ===== 추가 패턴 =====
    {
      id: "MISC-001",
      category: "misc",
      severity: "suggestion" as const,
      pattern: "console.log 잔존",
      bad: "console.log('debug:', data);",
      good: "logger.debug('Processing data', { dataId: data.id });",
      comment: "console.log가 남아있습니다. 프로덕션 코드에서는 구조화된 로거를 사용하세요.",
    },
    {
      id: "MISC-002",
      category: "misc",
      severity: "warning" as const,
      pattern: "TODO/FIXME 방치",
      bad: "// TODO: fix this later",
      good: "// TODO(@username, #JIRA-123): Refactor payment validation by Q2 2025",
      comment: "TODO에 담당자와 이슈 번호를 추가해 추적 가능하게 해 주세요.",
    },
    {
      id: "MISC-003",
      category: "misc",
      severity: "error" as const,
      pattern: "하드코딩된 URL",
      bad: "const url = 'https://api.production.example.com';",
      good: "const url = process.env.NEXT_PUBLIC_API_URL;",
      comment: "URL이 하드코딩되어 있습니다. 환경 변수를 사용하세요.",
    },
    {
      id: "MISC-004",
      category: "misc",
      severity: "suggestion" as const,
      pattern: "주석이 코드를 반복",
      bad: "// increment count by 1\ncount += 1;",
      good: "count += 1; // 코드만으로 충분, 주석 불필요",
      comment: "코드를 그대로 반복하는 주석은 노이즈입니다. '왜'에 대해서만 주석을 달아 주세요.",
    },
    {
      id: "MISC-005",
      category: "misc",
      severity: "warning" as const,
      pattern: "Dead code",
      bad: "function oldHandler() { ... } // 어디서도 호출 안 됨",
      good: "// 삭제 (git history에 보관)",
      comment: "사용되지 않는 코드입니다. 삭제하고 필요 시 git history에서 복구하세요.",
    },
  ],

  // ---------------------------------------------------------------------------
  // 보안 체크리스트
  // ---------------------------------------------------------------------------
  securityChecklist: [
    { id: "SEC-CHK-01", check: "SQL Injection 방지 (파라미터 바인딩)", priority: "critical" },
    { id: "SEC-CHK-02", check: "XSS 방지 (입력 새니타이즈)", priority: "critical" },
    { id: "SEC-CHK-03", check: "CSRF 토큰 적용", priority: "critical" },
    { id: "SEC-CHK-04", check: "인증/인가 미들웨어 적용", priority: "critical" },
    { id: "SEC-CHK-05", check: "시크릿/API 키 환경변수 관리", priority: "critical" },
    { id: "SEC-CHK-06", check: "HTTPS 강제", priority: "high" },
    { id: "SEC-CHK-07", check: "Rate Limiting 적용", priority: "high" },
    { id: "SEC-CHK-08", check: "입력값 검증 (길이, 형식, 범위)", priority: "high" },
    { id: "SEC-CHK-09", check: "에러 메시지 민감정보 노출 방지", priority: "high" },
    { id: "SEC-CHK-10", check: "Cookie 보안 설정 (httpOnly, secure, sameSite)", priority: "high" },
    { id: "SEC-CHK-11", check: "파일 업로드 검증 (타입, 크기, 확장자)", priority: "high" },
    { id: "SEC-CHK-12", check: "Path Traversal 방지", priority: "high" },
    { id: "SEC-CHK-13", check: "의존성 취약점 스캔 (npm audit)", priority: "medium" },
    { id: "SEC-CHK-14", check: "Content-Security-Policy 헤더", priority: "medium" },
    { id: "SEC-CHK-15", check: "로그에 민감정보 마스킹", priority: "medium" },
  ],

  // ---------------------------------------------------------------------------
  // 테스트 시나리오
  // ---------------------------------------------------------------------------
  testScenarios: [
    {
      input: "잘 작성된 TypeScript 코드 (타입 안전, 에러 처리 완비)",
      expected: "통과 + 경미한 개선 제안 1-2개",
      status: "success" as const,
    },
    {
      input: "SQL Injection 취약 코드",
      expected: "Critical 경고 + 파라미터 바인딩 제안",
      status: "error" as const,
    },
    {
      input: "하드코딩된 API 키",
      expected: "Critical 경고 + 환경변수 이동 제안 + Secret 회전 권고",
      status: "error" as const,
    },
    {
      input: "any 타입 10개 이상",
      expected: "Warning + 적절한 타입 정의 제안",
      status: "warning" as const,
    },
    {
      input: "300줄짜리 단일 함수",
      expected: "Warning + 함수 분리 제안",
      status: "warning" as const,
    },
    {
      input: "테스트 커버리지 0%인 서비스",
      expected: "Warning + 핵심 경로 테스트 추가 권고",
      status: "warning" as const,
    },
    {
      input: "React 컴포넌트 (접근성 미흡)",
      expected: "alt 속성, role, aria 속성 추가 제안",
      status: "warning" as const,
    },
    {
      input: "Python 코드 제출 (TypeScript 리뷰어에)",
      expected: "언어 감지 → Python 규칙 전환 or 미지원 안내",
      status: "warning" as const,
    },
    {
      input: "10년 된 레거시 코드",
      expected: "점진적 리팩토링 계획 제안 (전면 재작성 X)",
      status: "success" as const,
    },
    {
      input: "minified/난독화 코드",
      expected: "리뷰 불가 안내 → 소스 코드 요청",
      status: "error" as const,
    },
    {
      input: "auto-generated 코드 (Prisma, GraphQL codegen)",
      expected: "생성 코드 감지 → 리뷰 스킵 + 설정 파일만 리뷰",
      status: "success" as const,
    },
    {
      input: "PR에 1000줄 이상 변경",
      expected: "PR 크기 경고 → 분할 권고",
      status: "warning" as const,
    },
  ],

  // ---------------------------------------------------------------------------
  // 엣지 케이스
  // ---------------------------------------------------------------------------
  edgeCases: [
    {
      scenario: "False positive (정상 코드를 문제로 지적)",
      issue: "린트 규칙이 의도적 패턴을 잡아냄 (예: 의도적 any)",
      solution: "인라인 무시 주석 허용 + 사유 기재 강제 + 무시 빈도 모니터링",
    },
    {
      scenario: "언어별 규칙 차이",
      issue: "Python과 TypeScript의 네이밍 컨벤션이 다름",
      solution: "파일 확장자 기반 자동 언어 감지 → 언어별 룰셋 적용",
    },
    {
      scenario: "레거시 코드 수정",
      issue: "기존 스타일과 새 컨벤션 충돌",
      solution: "변경된 줄만 리뷰, 기존 코드는 별도 리팩토링 이슈로 등록",
    },
    {
      scenario: "문맥 의존 리뷰",
      issue: "코드 자체는 문제없지만 비즈니스 로직이 잘못됨",
      solution: "LLM 기반 의미 분석 + PR description과 매칭, 확신 없으면 질문",
    },
    {
      scenario: "과도하게 엄격한 규칙",
      issue: "사소한 지적이 많아 개발자 리뷰 피로도 증가",
      solution: "severity 기반 필터: critical/error만 blocking, suggestion은 정보 제공",
    },
    {
      scenario: "동일 이슈 반복 지적",
      issue: "같은 패턴이 파일 전체에 50번 반복",
      solution: "첫 번째만 상세 코멘트, 나머지는 '같은 패턴 N건 추가 발견' 요약",
    },
  ],

  // ---------------------------------------------------------------------------
  // 에러 시나리오
  // ---------------------------------------------------------------------------
  errorScenarios: [
    {
      code: "CR_ERR_001",
      name: "언어 감지 실패",
      trigger: "unknown file extension or mixed languages",
      message: "파일 언어를 감지할 수 없습니다. 확장자를 확인해 주세요.",
      recovery: "사용자에게 언어 수동 선택 요청",
    },
    {
      code: "CR_ERR_002",
      name: "파일 크기 초과",
      trigger: "file > 10,000 lines",
      message: "파일이 너무 큽니다. 리뷰 대상을 제한합니다.",
      recovery: "변경된 줄(diff)만 리뷰로 전환",
    },
    {
      code: "CR_ERR_003",
      name: "LLM 토큰 초과",
      trigger: "PR diff > model context window",
      message: "변경 사항이 너무 많습니다. 파일 단위로 분할 리뷰합니다.",
      recovery: "파일별 청킹 → 순차 리뷰 → 결과 병합",
    },
    {
      code: "CR_ERR_004",
      name: "규칙 충돌",
      trigger: "two rules produce contradictory suggestions",
      message: "내부 규칙 충돌이 감지되었습니다.",
      recovery: "우선순위 기반 해소 (security > style > suggestion)",
    },
  ],

  // ---------------------------------------------------------------------------
  // 비용 추정
  // ---------------------------------------------------------------------------
  costs: {
    perReview: {
      small: "$0.05 (< 100 lines)",
      medium: "$0.15 (100-500 lines)",
      large: "$0.50 (500+ lines)",
    },
    monthly: {
      starter: "$30 (100 reviews/month)",
      team: "$100 (500 reviews/month)",
      enterprise: "Custom",
    },
    llmCost: "GPT-4o-mini: ~$0.01-0.05 per review (token usage varies)",
  },
} as const;

export type CodeReviewTraining = typeof CODE_REVIEW_TRAINING;
export type ReviewPattern = (typeof CODE_REVIEW_TRAINING.reviewPatterns)[number];
export type Severity = ReviewPattern["severity"];
