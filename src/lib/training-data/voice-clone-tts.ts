// =============================================================================
// 음성 클로닝 TTS 학습 데이터 — 브랜드 전용 AI 음성 생성
// =============================================================================

export const VOICE_CLONE_TRAINING = {
  // ---------------------------------------------------------------------------
  // 녹음 환경 요구사항
  // ---------------------------------------------------------------------------
  recordingRequirements: {
    environment: {
      roomType: "방음 부스 or 조용한 밀폐 공간",
      ambientNoiseMax: "30dB 이하",
      reverbTime: "RT60 < 0.3초",
      tips: [
        "에어컨/선풍기 끄기",
        "핸드폰 무음 + 진동 해제",
        "창문 닫기, 커튼 치기",
        "카펫이나 이불로 반사음 흡수",
        "녹음 전 10초 정적 녹음 (노이즈 프로파일용)",
      ],
    },
    microphone: {
      recommended: [
        { name: "Audio-Technica AT2020", tier: "입문", price: "$99" },
        { name: "Rode NT1-A", tier: "중급", price: "$229" },
        { name: "Neumann U87", tier: "전문가", price: "$3,200" },
      ],
      minSpec: "콘덴서 마이크, 주파수 응답 20Hz-20kHz",
      interface: "오디오 인터페이스 사용 권장 (Focusrite Scarlett 등)",
      usbMicAcceptable: true,
      phoneMicAcceptable: false,
    },
    distance: {
      optimal: "15-20cm",
      min: "10cm",
      max: "30cm",
      popFilter: true,
      shockMount: "권장",
    },
    audioFormat: {
      sampleRate: 44100,
      bitDepth: 16,
      channels: 1,
      format: "WAV (무손실)",
      minDuration: 180,
      maxDuration: 600,
      idealDuration: 300,
    },
  },

  // ---------------------------------------------------------------------------
  // 녹음 스크립트 템플릿 (다양한 문장 유형)
  // ---------------------------------------------------------------------------
  scriptTemplates: {
    declarative: [
      "안녕하세요, 오늘의 날씨는 맑고 기온은 스물다섯 도입니다.",
      "저희 서비스는 인공지능을 활용하여 최적의 학습 경험을 제공합니다.",
      "이번 분기 매출은 전년 대비 삼십 퍼센트 증가했습니다.",
      "프로젝트 마감일은 다음 주 금요일이며, 모든 팀원의 참여가 필요합니다.",
      "대한민국 서울특별시 강남구 테헤란로 이백오십이 번지에 위치하고 있습니다.",
      "이 제품은 유기농 원료만을 사용하여 만들어졌습니다.",
      "새로운 업데이트에는 열두 가지 개선 사항이 포함되어 있습니다.",
      "고객님의 주문이 성공적으로 접수되었습니다.",
    ],
    question: [
      "혹시 이 기능에 대해 더 자세히 알고 싶으신 건가요?",
      "어떤 요금제가 가장 적합할지 한번 살펴볼까요?",
      "지금 바로 무료 체험을 시작해 보시겠어요?",
      "이전에 비슷한 서비스를 사용해 보신 적이 있으신가요?",
      "배송지 주소를 변경하시려면 어떻게 하면 될까요?",
      "혹시 결제 과정에서 문제가 발생하셨나요?",
    ],
    exclamation: [
      "축하합니다! 회원 등급이 프리미엄으로 업그레이드되었습니다!",
      "놀라운 소식이에요! 오늘 하루만 전 상품 오십 퍼센트 할인!",
      "정말 대단한 성과입니다! 목표를 초과 달성하셨네요!",
      "감사합니다! 소중한 의견 잘 반영하겠습니다!",
    ],
    numbers: [
      "전화번호는 공일공 구천구백팔십칠 육천오백사십삼 번입니다.",
      "이 상품의 가격은 삼만 구천구백 원이며, 무료 배송됩니다.",
      "약 이천오백만 명의 사용자가 이 플랫폼을 이용하고 있습니다.",
      "결제 금액은 부가세 포함 총 십일만 원입니다.",
    ],
    technical: [
      "에이피아이 키를 환경변수에 설정한 후 서버를 재시작해 주세요.",
      "제이에스오엔 형식으로 데이터를 전송하시면 됩니다.",
      "에이치티티피에스 프로토콜을 사용하여 보안 연결을 유지합니다.",
      "씨피유 사용률이 팔십 퍼센트를 초과하면 자동으로 스케일링됩니다.",
    ],
    emotional: {
      neutral: [
        "다음 안내사항을 확인해 주시기 바랍니다.",
        "처리가 완료되었으며, 결과를 이메일로 발송해 드리겠습니다.",
      ],
      warm: [
        "항상 저희를 믿고 이용해 주셔서 진심으로 감사드려요.",
        "어려운 점이 있으시면 언제든 편하게 말씀해 주세요.",
      ],
      urgent: [
        "긴급 공지사항입니다. 현재 시스템 점검이 진행 중이오니 양해 부탁드립니다.",
        "보안 경고: 비밀번호를 즉시 변경해 주시기 바랍니다.",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // 음성 품질 검사
  // ---------------------------------------------------------------------------
  qualityChecks: [
    {
      metric: "SNR (Signal-to-Noise Ratio)",
      threshold: ">35dB",
      description: "신호 대 잡음비 — 높을수록 깨끗한 녹음",
      tool: "ffmpeg silencedetect / Python librosa",
    },
    {
      metric: "Silence Ratio",
      threshold: "<20%",
      description: "전체 녹음 중 무음 구간 비율",
      tool: "VAD (Voice Activity Detection)",
    },
    {
      metric: "Clipping Detection",
      threshold: "0 samples",
      description: "음량 피크가 최대치를 초과하는 클리핑 없어야 함",
      tool: "ffmpeg volumedetect",
    },
    {
      metric: "Loudness (LUFS)",
      threshold: "-16 to -14 LUFS",
      description: "방송 기준 적정 음량 범위",
      tool: "ffmpeg ebur128 filter",
    },
    {
      metric: "Pitch Consistency",
      threshold: "std < 30Hz",
      description: "동일 화자의 기본 주파수 일관성",
      tool: "CREPE / PRAAT",
    },
    {
      metric: "Speaking Rate",
      threshold: "3.5-5.5 syllables/sec",
      description: "한국어 기준 적정 발화 속도",
      tool: "Whisper alignment",
    },
  ],

  // ---------------------------------------------------------------------------
  // TTS 모델 설정
  // ---------------------------------------------------------------------------
  modelConfig: {
    provider: "ElevenLabs / Coqui XTTS-v2 / OpenAI TTS",
    elevenLabs: {
      model: "eleven_multilingual_v2",
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.0,
      useSpeakerBoost: true,
      supportedLanguages: ["ko", "en", "ja", "zh"],
    },
    coquiXTTS: {
      model: "xtts_v2",
      language: "ko",
      referenceAudioSec: 6,
      temperature: 0.7,
      repetitionPenalty: 5.0,
      topK: 50,
      topP: 0.85,
    },
    openAI: {
      model: "tts-1-hd",
      voices: ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
      note: "커스텀 음성 클로닝 미지원 — 기본 음성만 제공",
    },
  },

  // ---------------------------------------------------------------------------
  // 테스트 시나리오 (14개)
  // ---------------------------------------------------------------------------
  testScenarios: [
    {
      input: "5분 고품질 녹음 업로드",
      expected: "음성 클로닝 시작 (약 10분)",
      status: "success" as const,
    },
    {
      input: "30초 짧은 녹음",
      expected: "최소 3분 필요 경고",
      status: "error" as const,
    },
    {
      input: "배경 소음 높은 녹음 (SNR < 20dB)",
      expected: "노이즈 수준 경고 → 재녹음 권고",
      status: "error" as const,
    },
    {
      input: "클리핑 발생 녹음",
      expected: "클리핑 구간 표시 → 재녹음 or 해당 구간 제거",
      status: "warning" as const,
    },
    {
      input: "MP3 320kbps 업로드",
      expected: "WAV 변환 안내 + 품질 손실 경고",
      status: "warning" as const,
    },
    {
      input: "영어 + 한국어 혼합 녹음",
      expected: "다국어 모드 활성화",
      status: "success" as const,
    },
    {
      input: "여러 명이 대화하는 녹음",
      expected: "단일 화자만 허용 경고",
      status: "error" as const,
    },
    {
      input: "에코/울림 있는 녹음",
      expected: "반향 감지 → 환경 개선 안내",
      status: "error" as const,
    },
    {
      input: "2000자 한국어 텍스트 TTS 요청",
      expected: "약 4분 분량 음성 생성 (정상)",
      status: "success" as const,
    },
    {
      input: "10000자 초과 텍스트",
      expected: "청크 분할 → 순차 생성 → 자동 병합",
      status: "success" as const,
    },
    {
      input: "특수 기호 많은 텍스트 (~!@#$)",
      expected: "특수기호 전처리 후 생성",
      status: "warning" as const,
    },
    {
      input: "숫자만 있는 텍스트 (전화번호)",
      expected: "숫자 → 한국어 읽기 변환 후 생성",
      status: "success" as const,
    },
    {
      input: "클로닝 음성으로 영어 문장 생성",
      expected: "다국어 모델이면 생성, 아니면 한국어 전용 안내",
      status: "warning" as const,
    },
    {
      input: "감정(슬픔) 지정 TTS 요청",
      expected: "감정 파라미터 적용 → 생성",
      status: "success" as const,
    },
  ],

  // ---------------------------------------------------------------------------
  // 엣지 케이스
  // ---------------------------------------------------------------------------
  edgeCases: [
    {
      scenario: "배경 음악이 깔린 녹음",
      issue: "음악과 목소리가 분리되지 않아 클로닝 품질 저하",
      solution: "Demucs 등으로 보컬 분리 시도, 분리 품질 낮으면 재녹음 안내",
    },
    {
      scenario: "사투리/방언 화자",
      issue: "표준어 기반 모델이 발음 패턴을 잘 학습하지 못함",
      solution: "충분한 데이터(5분+) 확보, 방언 전용 파인튜닝",
    },
    {
      scenario: "감정 변화가 큰 녹음",
      issue: "울거나 웃는 구간이 포함되면 클로닝 불안정",
      solution: "안정적 톤 구간만 추출하여 학습, 감정은 inference 단에서 조절",
    },
    {
      scenario: "긴 텍스트 (5000자 이상)",
      issue: "한 번에 생성 시 후반부 품질 저하",
      solution: "문장 단위 청크 분할 → 개별 생성 → 크로스페이드 병합",
    },
    {
      scenario: "고령 화자 (떨리는 목소리)",
      issue: "떨림이 노이즈로 인식될 수 있음",
      solution: "떨림은 화자 특성으로 보존, SNR 체크 기준 완화",
    },
    {
      scenario: "노래/랩 스타일 요청",
      issue: "TTS 모델은 말하기 전용, 노래 생성 불가",
      solution: "음악 생성은 별도 서비스 안내 (Suno, Udio 등)",
    },
    {
      scenario: "아동 음성 클로닝",
      issue: "보호자 동의 필수, 법적 제약",
      solution: "보호자 동의서 필수 + 만 14세 미만 별도 처리 흐름",
    },
    {
      scenario: "녹음 중 기침/재채기",
      issue: "비음성 이벤트가 포함되면 클로닝 오염",
      solution: "자동 비음성 구간 탐지 → 해당 구간 제거 후 학습",
    },
  ],

  // ---------------------------------------------------------------------------
  // 에러 시나리오
  // ---------------------------------------------------------------------------
  errorScenarios: [
    {
      code: "VOICE_ERR_001",
      name: "녹음 시간 부족",
      trigger: "duration < 180s",
      message: "최소 3분 이상의 녹음이 필요합니다. 현재: {duration}초",
      recovery: "추가 녹음 후 이어 붙이기 지원",
    },
    {
      code: "VOICE_ERR_002",
      name: "에코 감지",
      trigger: "reverbRatio > 0.3",
      message:
        "녹음에 울림이 감지되었습니다. 흡음재가 있는 공간에서 재녹음해 주세요.",
      recovery: "경미한 에코는 후처리로 제거 가능",
    },
    {
      code: "VOICE_ERR_003",
      name: "다중 화자 감지",
      trigger: "speakerCount > 1",
      message:
        "2명 이상의 목소리가 감지되었습니다. 한 명의 목소리만 녹음해 주세요.",
      recovery: "화자 분리(diarization) 후 주 화자만 추출",
    },
    {
      code: "VOICE_ERR_004",
      name: "샘플레이트 부족",
      trigger: "sampleRate < 22050",
      message: "녹음 품질이 낮습니다. 최소 44.1kHz, 16bit로 녹음해 주세요.",
      recovery: "업샘플링은 품질 개선이 안 되므로 재녹음 필수",
    },
    {
      code: "VOICE_ERR_005",
      name: "무음 비율 초과",
      trigger: "silenceRatio > 0.5",
      message: "녹음의 50% 이상이 무음입니다. 연속적으로 말씀해 주세요.",
      recovery: "무음 구간 자동 제거 후 유효 시간 재측정",
    },
    {
      code: "VOICE_ERR_006",
      name: "파일 손상",
      trigger: "headerCorrupt || checksumFail",
      message: "업로드된 파일이 손상되었습니다. 다시 업로드해 주세요.",
      recovery: "다른 포맷으로 변환 후 재업로드 시도",
    },
  ],

  // ---------------------------------------------------------------------------
  // 비용 추정
  // ---------------------------------------------------------------------------
  costs: {
    cloning: {
      elevenLabs: "$11/month (Starter) ~ $99/month (Pro)",
      coquiSelfHosted: "GPU 비용: ~$0.50/hour (A10G)",
    },
    generation: {
      elevenLabs: "$0.30 / 1,000 characters",
      coquiSelfHosted: "$0.01 / 1,000 characters",
    },
    storage: "$0.005/MB/month for audio files",
  },
} as const;

export type VoiceCloneTraining = typeof VOICE_CLONE_TRAINING;
export type ScriptCategory = keyof typeof VOICE_CLONE_TRAINING.scriptTemplates;
