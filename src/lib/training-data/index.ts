// =============================================================================
// Training Data — Advanced AI Template 학습 데이터 통합 export
// =============================================================================

export { IMAGE_GEN_TRAINING } from "./image-gen-lora";
export { VOICE_CLONE_TRAINING } from "./voice-clone-tts";
export { FITNESS_MOTION_TRAINING } from "./fitness-motion";
export { RAG_ENTERPRISE_TRAINING } from "./rag-enterprise";
export { CODE_REVIEW_TRAINING } from "./code-review-ai";

export type { ImageGenTraining, PromptTemplate, TestScenario } from "./image-gen-lora";
export type { VoiceCloneTraining, ScriptCategory } from "./voice-clone-tts";
export type { FitnessMotionTraining, ExerciseData, RiskLevel } from "./fitness-motion";
export type { RAGEnterpriseTraining, SampleDocument, TestQuery } from "./rag-enterprise";
export type { CodeReviewTraining, ReviewPattern, Severity } from "./code-review-ai";
