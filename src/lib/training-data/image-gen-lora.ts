// =============================================================================
// 이미지 생성 LoRA 학습 데이터 — 상품 사진 기반 AI 이미지 생성
// =============================================================================

export const IMAGE_GEN_TRAINING = {
  // ---------------------------------------------------------------------------
  // LoRA 학습 설정
  // ---------------------------------------------------------------------------
  trainingConfig: {
    baseModel: "stable-diffusion-xl-base-1.0",
    loraRank: 32,
    learningRate: 1e-4,
    trainingSteps: 1500,
    batchSize: 1,
    resolution: 1024,
    triggerWord: "sks_product",
    scheduler: "constant_with_warmup",
    warmupSteps: 100,
    mixedPrecision: "fp16" as const,
    gradientAccumulation: 4,
    optimiser: "AdamW8bit",
    textEncoderLR: 5e-5,
    networkAlpha: 16,
    noiseOffset: 0.05,
    captionDropoutRate: 0.05,
  },

  // ---------------------------------------------------------------------------
  // 이미지 준비 가이드
  // ---------------------------------------------------------------------------
  imageRequirements: {
    minImages: 15,
    maxImages: 30,
    idealResolution: "1024x1024",
    supportedFormats: ["jpg", "png", "webp"],
    maxFileSizeMB: 10,
    backgroundGuidance:
      "Mix of white background (60%) and lifestyle shots (40%)",
    angleGuidance: "Front, 45°, side, top-down, close-up detail",
    lightingGuidance:
      "Consistent lighting preferred, avoid harsh shadows",
    captioningStrategy:
      "BLIP-2 auto-caption + manual trigger word prefix (e.g. 'a photo of sks_product, ...')",
    commonMistakes: [
      "모든 사진이 같은 각도 → 다양성 부족으로 생성 품질 저하",
      "배경이 복잡한 사진만 → 상품 분리가 안 됨",
      "해상도가 다 다름 → 리사이즈 시 왜곡",
      "워터마크가 있는 이미지 → 학습 오염",
      "상품이 프레임의 10% 미만 → 디테일 학습 불가",
      "흔들린 사진 포함 → 전체 품질 하락",
      "EXIF 회전 정보 무시 → 이미지가 90도 돌아감",
      "JPEG 품질 30 이하 → 아티팩트가 학습됨",
    ],
  },

  // ---------------------------------------------------------------------------
  // 프롬프트 템플릿 (12개)
  // ---------------------------------------------------------------------------
  promptTemplates: [
    {
      concept: "미니멀 스튜디오",
      prompt:
        "a photo of sks_product on white surface, minimal studio lighting, clean background, product photography",
      negative: "blurry, distorted, watermark, text",
    },
    {
      concept: "카페 라이프스타일",
      prompt:
        "a photo of sks_product on wooden cafe table, warm natural lighting, coffee cup nearby, cozy atmosphere",
      negative: "blurry, oversaturated, artificial",
    },
    {
      concept: "크리스마스",
      prompt:
        "a photo of sks_product with christmas decoration, red ribbon, snow, warm festive lighting",
      negative: "blurry, dark, scary",
    },
    {
      concept: "여름 아웃도어",
      prompt:
        "a photo of sks_product outdoors in summer, bright sunlight, green nature background",
      negative: "indoor, dark, blurry",
    },
    {
      concept: "고급 매거진",
      prompt:
        "a photo of sks_product, luxury magazine editorial, dramatic side lighting, dark moody background, high-end product photography",
      negative: "cheap, blurry, cluttered, text overlay",
    },
    {
      concept: "플랫레이",
      prompt:
        "a flat lay photo of sks_product from above, surrounded by complementary accessories, pastel background, soft diffused light",
      negative: "blurry, 3d render, angled, distorted perspective",
    },
    {
      concept: "네온 사이버펑크",
      prompt:
        "a photo of sks_product with neon glow, cyberpunk aesthetic, purple and cyan lighting, futuristic background",
      negative: "blurry, daylight, natural, boring",
    },
    {
      concept: "자연광 창가",
      prompt:
        "a photo of sks_product next to a window, soft natural morning light, linen fabric, minimal scandinavian interior",
      negative: "artificial light, flash, dark, cluttered",
    },
    {
      concept: "대리석 럭셔리",
      prompt:
        "a photo of sks_product on marble surface, gold accents, luxury feel, soft studio lighting, high contrast",
      negative: "cheap, plastic, blurry, text",
    },
    {
      concept: "봄 꽃 데코",
      prompt:
        "a photo of sks_product surrounded by fresh spring flowers, cherry blossom, soft pink and white palette, natural lighting",
      negative: "autumn, dark, wilted, dead flowers, blurry",
    },
    {
      concept: "오피스 데스크",
      prompt:
        "a photo of sks_product on modern office desk, laptop and notebook nearby, clean professional setting, daylight",
      negative: "messy, dark, blurry, home",
    },
    {
      concept: "핸드모델",
      prompt:
        "a photo of a hand holding sks_product, shallow depth of field, soft bokeh background, natural skin tone, studio lighting",
      negative: "blurry hand, extra fingers, distorted, ugly",
    },
  ],

  // ---------------------------------------------------------------------------
  // 테스트 시나리오 (14개)
  // ---------------------------------------------------------------------------
  testScenarios: [
    {
      input: "상품 20장 업로드",
      expected: "학습 시작 (약 20분)",
      status: "success" as const,
    },
    {
      input: "상품 3장만 업로드",
      expected: "최소 15장 필요 경고",
      status: "error" as const,
    },
    {
      input: "해상도 300x300 이미지",
      expected: "최소 512x512 필요 경고",
      status: "error" as const,
    },
    {
      input: "워터마크 이미지 포함",
      expected: "워터마크 감지 → 제거 or 경고",
      status: "warning" as const,
    },
    {
      input: "HEIC 포맷 이미지",
      expected: "자동 변환 후 진행",
      status: "success" as const,
    },
    {
      input: "50장 초과 업로드",
      expected: "최대 30장 안내, 자동 선별 제안",
      status: "warning" as const,
    },
    {
      input: "동일 이미지 중복 업로드",
      expected: "중복 탐지 → 제거 후 진행",
      status: "warning" as const,
    },
    {
      input: "NSFW 콘텐츠 포함",
      expected: "콘텐츠 정책 위반 차단",
      status: "error" as const,
    },
    {
      input: "모든 이미지 동일 각도",
      expected: "다양성 경고 + 추가 촬영 권고",
      status: "warning" as const,
    },
    {
      input: "학습 중 취소 요청",
      expected: "학습 중단 + 부분 결과 저장",
      status: "success" as const,
    },
    {
      input: "학습 완료 후 프롬프트 테스트",
      expected: "4장 테스트 이미지 생성",
      status: "success" as const,
    },
    {
      input: "트리거 워드 없이 생성 요청",
      expected: "트리거 워드 자동 삽입 안내",
      status: "warning" as const,
    },
    {
      input: "PNG 투명배경 + JPG 혼합",
      expected: "포맷 통일 후 진행",
      status: "success" as const,
    },
    {
      input: "10MB 초과 파일 포함",
      expected: "파일 크기 초과 경고 → 압축 제안",
      status: "error" as const,
    },
  ],

  // ---------------------------------------------------------------------------
  // 품질 메트릭
  // ---------------------------------------------------------------------------
  qualityChecks: [
    {
      metric: "FID Score",
      threshold: "<50",
      description: "생성 이미지와 원본 분포 유사도",
    },
    {
      metric: "CLIP Score",
      threshold: ">0.25",
      description: "프롬프트-이미지 일치도",
    },
    {
      metric: "Subject Consistency",
      threshold: ">0.85",
      description: "상품 형태 일관성",
    },
    {
      metric: "Aesthetic Score",
      threshold: ">5.5",
      description: "생성 이미지 미적 품질 (1-10 스케일)",
    },
    {
      metric: "Background Separation",
      threshold: ">0.90",
      description: "상품-배경 분리 정확도",
    },
  ],

  // ---------------------------------------------------------------------------
  // 비용 추정
  // ---------------------------------------------------------------------------
  costs: {
    training: "$3-5 per LoRA training (Replicate)",
    generation: "$0.02 per image",
    storage: "$0.01/GB/month",
    estimatedMonthly: {
      starter: "$15 (3 LoRA + 200 images)",
      pro: "$50 (10 LoRA + 1000 images)",
      enterprise: "Custom pricing",
    },
  },

  // ---------------------------------------------------------------------------
  // 엣지 케이스 (8개)
  // ---------------------------------------------------------------------------
  edgeCases: [
    {
      scenario: "투명 배경 상품",
      issue: "배경 분리가 안 됨",
      solution: "알파 채널 처리 or 흰배경 재촬영",
    },
    {
      scenario: "반사가 많은 금속 상품",
      issue: "반사광이 학습되어 모든 생성에 반사 포함",
      solution: "디퓨저 조명 사용, 반사 없는 사진 위주",
    },
    {
      scenario: "다양한 색상 변형",
      issue: "한 색상만 학습하면 다른 색 생성 불가",
      solution: "최소 3가지 색상 포함",
    },
    {
      scenario: "매우 작은 상품 (악세서리/보석)",
      issue: "디테일이 뭉개짐",
      solution: "매크로 촬영으로 디테일 확보, crop 중심 구도",
    },
    {
      scenario: "의류 상품 (형태 변동 큼)",
      issue: "착용 시 vs 평치 시 형태 차이가 커서 학습 혼란",
      solution: "평치 사진과 착용 사진 분리하여 별도 LoRA 학습",
    },
    {
      scenario: "음식 상품",
      issue: "동일 제품이어도 매번 모양이 다름",
      solution: "가장 표준적 형태 위주 촬영, 3D 뷰보다 2D 평면 뷰 중심",
    },
    {
      scenario: "로고/텍스트가 중요한 상품",
      issue: "SDXL이 텍스트 재현을 잘 못 함",
      solution: "로고 부분 별도 합성 파이프라인 구성",
    },
    {
      scenario: "사이즈 비교가 필요한 상품",
      issue: "스케일 기준이 없어 크기감 표현 불가",
      solution: "참조 오브젝트(손, 동전 등)와 함께 촬영한 이미지 포함",
    },
  ],
} as const;

export type ImageGenTraining = typeof IMAGE_GEN_TRAINING;
export type PromptTemplate = (typeof IMAGE_GEN_TRAINING.promptTemplates)[number];
export type TestScenario = (typeof IMAGE_GEN_TRAINING.testScenarios)[number];
