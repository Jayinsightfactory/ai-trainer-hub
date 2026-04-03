// =============================================================================
// 운동 자세 교정 AI 학습 데이터 — MediaPipe 기반 포즈 분석
// =============================================================================

/**
 * MediaPipe Pose Landmark 인덱스 참조
 * 0: nose, 11: left_shoulder, 12: right_shoulder,
 * 13: left_elbow, 14: right_elbow, 15: left_wrist, 16: right_wrist,
 * 23: left_hip, 24: right_hip, 25: left_knee, 26: right_knee,
 * 27: left_ankle, 28: right_ankle
 */

interface JointAngleRange {
  joint: string;
  landmarks: [number, number, number]; // [start, vertex, end]
  correctMin: number;
  correctMax: number;
  injuryRiskBelow: number | null;
  injuryRiskAbove: number | null;
}

interface CommonMistake {
  name: string;
  description: string;
  detection: string;
  correctionFeedback: string;
  injuryRisk: "low" | "medium" | "high";
}

interface Exercise {
  id: string;
  nameKo: string;
  nameEn: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  primaryMuscles: string[];
  jointAngles: JointAngleRange[];
  commonMistakes: CommonMistake[];
  repCounting: {
    startPosition: string;
    endPosition: string;
    countOn: "ascending" | "descending";
  };
}

export const FITNESS_MOTION_TRAINING = {
  // ---------------------------------------------------------------------------
  // MediaPipe 설정
  // ---------------------------------------------------------------------------
  poseConfig: {
    model: "mediapipe-pose-landmarker",
    modelComplexity: 2,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
    numPoses: 1,
    landmarkCount: 33,
    fps: 30,
    inputResolution: { width: 640, height: 480 },
    smoothingWindow: 5,
  },

  // ---------------------------------------------------------------------------
  // 운동 카탈로그
  // ---------------------------------------------------------------------------
  exercises: [
    // ===== 스쿼트 =====
    {
      id: "squat",
      nameKo: "바벨 스쿼트",
      nameEn: "Barbell Back Squat",
      category: "lower_body",
      difficulty: "intermediate",
      primaryMuscles: ["quadriceps", "glutes", "hamstrings", "core"],
      jointAngles: [
        {
          joint: "무릎 (knee)",
          landmarks: [23, 25, 27], // hip → knee → ankle
          correctMin: 70,
          correctMax: 100,
          injuryRiskBelow: 50,
          injuryRiskAbove: null,
        },
        {
          joint: "엉덩이 (hip)",
          landmarks: [11, 23, 25], // shoulder → hip → knee
          correctMin: 60,
          correctMax: 110,
          injuryRiskBelow: null,
          injuryRiskAbove: 140,
        },
        {
          joint: "허리 각도 (torso)",
          landmarks: [11, 23, 25], // shoulder → hip → knee
          correctMin: 45,
          correctMax: 80,
          injuryRiskBelow: 30,
          injuryRiskAbove: null,
        },
      ],
      commonMistakes: [
        {
          name: "무릎이 발끝을 넘김",
          description: "하강 시 무릎이 발끝보다 앞으로 과도하게 나감",
          detection: "knee.x > ankle.x + threshold (정면 뷰에서)",
          correctionFeedback: "엉덩이를 뒤로 더 빼주세요. 의자에 앉는 느낌으로!",
          injuryRisk: "medium",
        },
        {
          name: "무릎 내전 (Knee Valgus)",
          description: "무릎이 안쪽으로 모임",
          detection: "left_knee.x - right_knee.x < hip_width * 0.7",
          correctionFeedback:
            "무릎을 발끝 방향으로 밀어주세요. 밴드를 사용해 연습해 보세요!",
          injuryRisk: "high",
        },
        {
          name: "허리 둥글게 말림 (Butt Wink)",
          description: "하강 하단에서 골반이 말려 허리가 둥글어짐",
          detection: "hip_angle sudden change > 15° at bottom",
          correctionFeedback:
            "골반을 중립으로 유지하세요. 깊이를 조금 줄이는 것도 방법입니다!",
          injuryRisk: "high",
        },
        {
          name: "발뒤꿈치 들림",
          description: "하강 시 발뒤꿈치가 바닥에서 떨어짐",
          detection: "ankle.y decrease during descent",
          correctionFeedback:
            "발뒤꿈치를 바닥에 단단히 붙이세요. 발목 유연성이 부족하면 웨지를 사용해 보세요!",
          injuryRisk: "medium",
        },
      ],
      repCounting: {
        startPosition: "knee_angle > 160° (서있는 자세)",
        endPosition: "knee_angle < 100° (하강 완료)",
        countOn: "ascending",
      },
    },

    // ===== 데드리프트 =====
    {
      id: "deadlift",
      nameKo: "컨벤셔널 데드리프트",
      nameEn: "Conventional Deadlift",
      category: "posterior_chain",
      difficulty: "advanced",
      primaryMuscles: ["hamstrings", "glutes", "erector_spinae", "traps"],
      jointAngles: [
        {
          joint: "엉덩이 힌지 (hip hinge)",
          landmarks: [11, 23, 25],
          correctMin: 40,
          correctMax: 90,
          injuryRiskBelow: 20,
          injuryRiskAbove: null,
        },
        {
          joint: "무릎 (knee)",
          landmarks: [23, 25, 27],
          correctMin: 150,
          correctMax: 175,
          injuryRiskBelow: null,
          injuryRiskAbove: null,
        },
        {
          joint: "척추 중립 (spine)",
          landmarks: [0, 11, 23], // nose → shoulder → hip
          correctMin: 160,
          correctMax: 180,
          injuryRiskBelow: 140,
          injuryRiskAbove: null,
        },
      ],
      commonMistakes: [
        {
          name: "허리 라운딩",
          description: "등이 둥글게 말리면서 들어올림",
          detection: "shoulder_hip_angle < 150°",
          correctionFeedback:
            "가슴을 펴고 등을 곧게 유지하세요! '배를 바닥에 보여준다'고 생각해 보세요.",
          injuryRisk: "high",
        },
        {
          name: "바가 몸에서 멀어짐",
          description: "바벨이 정강이/허벅지에서 떨어져 이동",
          detection: "wrist.x diverges from hip.x trajectory",
          correctionFeedback:
            "바를 몸에 밀착시키세요. 정강이를 살짝 긁는 느낌으로!",
          injuryRisk: "high",
        },
        {
          name: "무릎 먼저 잠김",
          description: "상승 시 무릎이 먼저 펴지고 엉덩이가 나중에 펴짐",
          detection: "knee straightens before hip opens",
          correctionFeedback:
            "엉덩이와 무릎을 동시에 펴주세요. 균일한 상승이 중요합니다!",
          injuryRisk: "medium",
        },
        {
          name: "과신전 (Hyperextension)",
          description: "상단에서 과도하게 뒤로 젖힘",
          detection: "hip_angle > 185° at lockout",
          correctionFeedback:
            "상단에서 곧게 서기만 하면 됩니다. 뒤로 젖히지 마세요!",
          injuryRisk: "medium",
        },
      ],
      repCounting: {
        startPosition: "hip_angle > 160° (서있는 자세)",
        endPosition: "hip_angle < 90° (바 바닥 근처)",
        countOn: "ascending",
      },
    },

    // ===== 플랭크 =====
    {
      id: "plank",
      nameKo: "프론트 플랭크",
      nameEn: "Front Plank",
      category: "core",
      difficulty: "beginner",
      primaryMuscles: ["rectus_abdominis", "transverse_abdominis", "obliques"],
      jointAngles: [
        {
          joint: "몸 직선 (body line)",
          landmarks: [11, 23, 27], // shoulder → hip → ankle
          correctMin: 165,
          correctMax: 180,
          injuryRiskBelow: 150,
          injuryRiskAbove: null,
        },
        {
          joint: "엉덩이 높이 (hip height)",
          landmarks: [11, 23, 27],
          correctMin: 170,
          correctMax: 180,
          injuryRiskBelow: null,
          injuryRiskAbove: 190,
        },
      ],
      commonMistakes: [
        {
          name: "엉덩이 처짐",
          description: "코어에 힘이 빠져 허리가 아래로 처짐",
          detection: "hip.y > shoulder_ankle_midpoint.y + threshold",
          correctionFeedback:
            "배꼽을 척추 쪽으로 끌어당기세요! 엉덩이를 살짝 올려주세요.",
          injuryRisk: "high",
        },
        {
          name: "엉덩이 너무 높음",
          description: "역V자 형태로 엉덩이가 과도하게 올라감",
          detection: "hip.y < shoulder_ankle_midpoint.y - threshold",
          correctionFeedback:
            "몸이 일직선이 되도록 엉덩이를 낮춰주세요!",
          injuryRisk: "low",
        },
        {
          name: "목 꺾임",
          description: "고개를 너무 들거나 숙임",
          detection:
            "nose_shoulder_angle deviates > 20° from neutral",
          correctionFeedback:
            "시선을 바닥으로 자연스럽게 두세요. 목도 척추의 연장선!",
          injuryRisk: "medium",
        },
      ],
      repCounting: {
        startPosition: "N/A (시간 기반)",
        endPosition: "N/A (시간 기반)",
        countOn: "ascending",
      },
    },

    // ===== 런지 =====
    {
      id: "lunge",
      nameKo: "포워드 런지",
      nameEn: "Forward Lunge",
      category: "lower_body",
      difficulty: "beginner",
      primaryMuscles: ["quadriceps", "glutes", "hamstrings"],
      jointAngles: [
        {
          joint: "앞무릎 (front knee)",
          landmarks: [23, 25, 27],
          correctMin: 85,
          correctMax: 100,
          injuryRiskBelow: 70,
          injuryRiskAbove: null,
        },
        {
          joint: "뒷무릎 (back knee)",
          landmarks: [24, 26, 28],
          correctMin: 80,
          correctMax: 100,
          injuryRiskBelow: 60,
          injuryRiskAbove: null,
        },
        {
          joint: "상체 직립 (torso)",
          landmarks: [0, 11, 23],
          correctMin: 170,
          correctMax: 180,
          injuryRiskBelow: 150,
          injuryRiskAbove: null,
        },
      ],
      commonMistakes: [
        {
          name: "무릎이 발끝 넘어감",
          description: "앞무릎이 과도하게 앞으로 나감",
          detection: "front_knee.x > front_ankle.x + stride_threshold",
          correctionFeedback:
            "보폭을 더 넓게! 무릎이 90도가 되도록 조절하세요.",
          injuryRisk: "medium",
        },
        {
          name: "상체 앞으로 기울어짐",
          description: "상체가 앞으로 쏠림",
          detection: "torso_angle < 160°",
          correctionFeedback:
            "상체를 곧게 세우세요. 시선은 정면을 향하세요!",
          injuryRisk: "medium",
        },
        {
          name: "좌우 균형 불균형",
          description: "한쪽으로 몸이 기울어짐",
          detection:
            "abs(left_shoulder.y - right_shoulder.y) > balance_threshold",
          correctionFeedback:
            "양 어깨를 수평으로 유지하세요. 거울을 보며 연습해 보세요!",
          injuryRisk: "low",
        },
      ],
      repCounting: {
        startPosition: "양 다리 모은 상태 (standing)",
        endPosition: "앞무릎 90도 (bottom)",
        countOn: "ascending",
      },
    },

    // ===== 푸시업 =====
    {
      id: "pushup",
      nameKo: "푸시업",
      nameEn: "Push-Up",
      category: "upper_body",
      difficulty: "beginner",
      primaryMuscles: ["pectorals", "triceps", "anterior_deltoid", "core"],
      jointAngles: [
        {
          joint: "팔꿈치 (elbow)",
          landmarks: [11, 13, 15], // shoulder → elbow → wrist
          correctMin: 70,
          correctMax: 100,
          injuryRiskBelow: 50,
          injuryRiskAbove: null,
        },
        {
          joint: "몸 직선 (body line)",
          landmarks: [11, 23, 27],
          correctMin: 165,
          correctMax: 180,
          injuryRiskBelow: 150,
          injuryRiskAbove: 195,
        },
        {
          joint: "어깨 각도 (shoulder)",
          landmarks: [23, 11, 13], // hip → shoulder → elbow
          correctMin: 40,
          correctMax: 75,
          injuryRiskBelow: null,
          injuryRiskAbove: 90,
        },
      ],
      commonMistakes: [
        {
          name: "엉덩이 처짐",
          description: "코어에 힘이 빠져 허리가 아래로 처짐",
          detection: "body_line_angle < 160°",
          correctionFeedback:
            "코어에 힘을 유지하세요! 플랭크 자세를 유지한다 생각하세요.",
          injuryRisk: "high",
        },
        {
          name: "팔꿈치가 옆으로 벌어짐 (Flared Elbows)",
          description: "팔꿈치가 90도로 벌어져 어깨에 부담",
          detection: "shoulder_angle > 80°",
          correctionFeedback:
            "팔꿈치를 몸통 쪽으로 45도 각도로 유지하세요!",
          injuryRisk: "high",
        },
        {
          name: "하강 깊이 부족",
          description: "팔꿈치를 충분히 굽히지 않음",
          detection: "min(elbow_angle) > 110°",
          correctionFeedback:
            "가슴이 바닥 가까이 올 때까지 내려가세요!",
          injuryRisk: "low",
        },
        {
          name: "목 앞으로 내밈",
          description: "머리가 어깨보다 앞으로 돌출",
          detection: "nose.x > shoulder.x + head_threshold",
          correctionFeedback:
            "턱을 당기고 시선을 약간 앞 바닥에 두세요!",
          injuryRisk: "medium",
        },
      ],
      repCounting: {
        startPosition: "elbow_angle > 160° (팔 펴진 상태)",
        endPosition: "elbow_angle < 100° (하강 완료)",
        countOn: "ascending",
      },
    },
  ] satisfies Exercise[],

  // ---------------------------------------------------------------------------
  // 위험 임계값 시스템
  // ---------------------------------------------------------------------------
  riskThresholds: {
    levels: [
      {
        level: "safe",
        color: "#22C55E",
        label: "안전",
        action: "피드백 없음, 계속 진행",
      },
      {
        level: "caution",
        color: "#F59E0B",
        label: "주의",
        action: "음성 피드백: '조금 더 주의해 주세요'",
      },
      {
        level: "warning",
        color: "#EF4444",
        label: "경고",
        action: "강조 피드백 + 화면 표시",
      },
      {
        level: "danger",
        color: "#7C2D12",
        label: "위험",
        action: "즉시 중단 권고 + 알람",
      },
    ],
    angleToleranceDegrees: 10,
    consecutiveFramesForAlert: 5,
    feedbackCooldownMs: 3000,
  },

  // ---------------------------------------------------------------------------
  // 테스트 시나리오 (포즈 데이터 기반)
  // ---------------------------------------------------------------------------
  testScenarios: [
    {
      input: "정확한 스쿼트 폼 (무릎 90도, 허리 중립)",
      expected: "Safe 판정, 반복 카운트 증가",
      status: "success" as const,
    },
    {
      input: "무릎 내전이 심한 스쿼트",
      expected: "Warning: '무릎을 바깥으로 밀어주세요!'",
      status: "warning" as const,
    },
    {
      input: "허리 라운딩 데드리프트",
      expected: "Danger: 즉시 중단 권고",
      status: "error" as const,
    },
    {
      input: "플랭크 60초 유지 (정확한 폼)",
      expected: "타이머 표시 + 'Great form!' 피드백",
      status: "success" as const,
    },
    {
      input: "플랭크 중 엉덩이 서서히 처짐",
      expected: "15초 시점 Caution → 30초 시점 Warning",
      status: "warning" as const,
    },
    {
      input: "런지에서 무릎이 발끝 크게 넘어감",
      expected: "Warning + 보폭 넓히기 안내",
      status: "warning" as const,
    },
    {
      input: "푸시업 팔꿈치 90도 벌어짐",
      expected: "Warning: 어깨 부상 위험 안내",
      status: "warning" as const,
    },
    {
      input: "카메라에 하반신만 보임",
      expected: "상체 랜드마크 미감지 → 카메라 위치 조정 안내",
      status: "error" as const,
    },
    {
      input: "너무 먼 거리에서 촬영 (전신이 작음)",
      expected: "랜드마크 신뢰도 낮음 → 가까이 다가오기 안내",
      status: "warning" as const,
    },
    {
      input: "빠른 속도로 스쿼트 (반동 사용)",
      expected: "Warning: 속도 줄이기 권고, 정확성 우선",
      status: "warning" as const,
    },
    {
      input: "10회 스쿼트 세트 완료",
      expected: "세트 완료 → 통계 요약 (평균 각도, 최저점, 오류 횟수)",
      status: "success" as const,
    },
    {
      input: "한 다리 스쿼트 (비대칭 운동)",
      expected: "비대칭 모드 전환 → 한쪽 다리만 분석",
      status: "success" as const,
    },
  ],

  // ---------------------------------------------------------------------------
  // 엣지 케이스
  // ---------------------------------------------------------------------------
  edgeCases: [
    {
      scenario: "관절이 가려짐 (옷, 가구 등)",
      issue: "MediaPipe가 가려진 관절 위치를 추정 못 함",
      solution:
        "가려진 관절은 confidence < 0.5로 표시, 해당 관절 포함 피드백 일시 중지 + 카메라 각도 변경 안내",
    },
    {
      scenario: "비정상적 체형 (매우 긴 팔다리, 소아 등)",
      issue: "고정 각도 임계값이 맞지 않음",
      solution:
        "초기 캘리브레이션 단계에서 사용자 체형 측정 → 임계값 개인화",
    },
    {
      scenario: "프레임 내 여러 사람",
      issue: "누구의 포즈를 분석해야 하는지 모호",
      solution:
        "가장 큰(가까운) 포즈를 주 대상으로, 다중 사용자 모드는 별도 분기",
    },
    {
      scenario: "어두운 환경",
      issue: "카메라 노이즈로 랜드마크 불안정",
      solution:
        "밝기 감지 → 조명 부족 경고, 랜드마크 스무딩 윈도우 확대",
    },
    {
      scenario: "거울 앞에서 운동 (반사상 포함)",
      issue: "거울 속 이미지도 사람으로 인식",
      solution: "주 대상 고정 (ID tracking), 거울 방향 감지 로직",
    },
    {
      scenario: "측면 촬영 vs 정면 촬영",
      issue: "같은 운동이어도 촬영 각도에 따라 각도 계산이 다름",
      solution:
        "촬영 각도 자동 감지 (정면/측면) → 각도별 다른 기준 적용",
    },
    {
      scenario: "휠체어 사용자",
      issue: "하체 운동 분석 불가, 상체만 가능",
      solution:
        "접근성 모드: 상체 운동만 제안, 좌석 기반 운동 카탈로그 별도",
    },
  ],

  // ---------------------------------------------------------------------------
  // 피드백 음성 템플릿
  // ---------------------------------------------------------------------------
  feedbackMessages: {
    encouragement: [
      "잘하고 있어요! 자세가 정확합니다.",
      "좋아요! 이 자세를 유지하세요.",
      "완벽해요! {count}회 완료!",
      "대단해요! 마지막 {remaining}회 남았어요!",
    ],
    correction: {
      knee: "무릎 각도를 조정해 주세요!",
      hip: "엉덩이 위치를 확인해 주세요!",
      back: "등을 곧게 펴주세요!",
      neck: "목을 자연스럽게 유지하세요!",
      elbow: "팔꿈치 각도를 조절해 주세요!",
      balance: "균형을 잡아주세요!",
    },
    rest: [
      "세트 완료! {restTime}초 쉬어가세요.",
      "좋은 세트였어요! 호흡을 가다듬으세요.",
    ],
  },

  // ---------------------------------------------------------------------------
  // 비용 추정
  // ---------------------------------------------------------------------------
  costs: {
    mediaPipe: "무료 (on-device inference)",
    serverProcessing: "$0.01 per session (post-analysis)",
    storage: "$0.005/MB for video recordings",
    note: "MediaPipe는 클라이언트에서 실행되므로 서버 비용 최소",
  },
} as const;

export type FitnessMotionTraining = typeof FITNESS_MOTION_TRAINING;
export type ExerciseData = (typeof FITNESS_MOTION_TRAINING.exercises)[number];
export type RiskLevel =
  (typeof FITNESS_MOTION_TRAINING.riskThresholds.levels)[number]["level"];
