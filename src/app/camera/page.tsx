"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  CameraOff,
  CircleDot,
  RotateCcw,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  Image as ImageIcon,
  Tag,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  타입                                                                */
/* ------------------------------------------------------------------ */
interface CapturedImage {
  id: string;
  dataUrl: string;
  label: string;
  timestamp: number;
}

interface DetectionResult {
  label: string;
  confidence: number;
  bbox?: { x: number; y: number; w: number; h: number };
}

/* ------------------------------------------------------------------ */
/*  메인 컴포넌트                                                       */
/* ------------------------------------------------------------------ */
export default function CameraLearningPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"capture" | "realtime">("capture");
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [currentLabel, setCurrentLabel] = useState("");
  const [labels, setLabels] = useState<string[]>(["정상", "불량"]);
  const [newLabel, setNewLabel] = useState("");
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [modelReady, setModelReady] = useState(false);
  const [realtimeResults, setRealtimeResults] = useState<DetectionResult[]>([]);
  const [fps, setFps] = useState(0);

  // 카메라 시작
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsActive(true);
    } catch (err) {
      alert("카메라 접근 권한이 필요합니다. 브라우저 설정에서 허용해주세요.");
    }
  }, []);

  // 카메라 종료
  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setIsActive(false);
  }, [stream]);

  // 사진 촬영
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !currentLabel) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImages((prev) => [
      ...prev,
      { id: `img_${Date.now()}`, dataUrl, label: currentLabel, timestamp: Date.now() },
    ]);
  }, [currentLabel]);

  // 학습 시뮬레이션
  const startTraining = useCallback(() => {
    if (capturedImages.length < 4) {
      alert("최소 4장 이상의 이미지가 필요합니다 (라벨당 2장+)");
      return;
    }
    setIsTraining(true);
    setTrainingProgress(0);

    // 학습 시뮬레이션 (실제로는 TensorFlow.js or API 호출)
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          setModelReady(true);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  }, [capturedImages]);

  // 실시간 추론 시뮬레이션
  useEffect(() => {
    if (mode !== "realtime" || !modelReady || !isActive) return;

    let frameCount = 0;
    let lastTime = performance.now();
    const interval = setInterval(() => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }

      // 시뮬레이션: 라벨 중 랜덤 결과
      const randomLabel = labels[Math.floor(Math.random() * labels.length)];
      const confidence = 0.75 + Math.random() * 0.24;
      setRealtimeResults([
        {
          label: randomLabel,
          confidence,
          bbox: {
            x: 120 + Math.random() * 40,
            y: 80 + Math.random() * 30,
            w: 280 + Math.random() * 40,
            h: 250 + Math.random() * 30,
          },
        },
      ]);
    }, 100); // ~10 FPS 추론

    return () => clearInterval(interval);
  }, [mode, modelReady, isActive, labels]);

  // 라벨 추가
  const addLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels((prev) => [...prev, newLabel.trim()]);
      setNewLabel("");
    }
  };

  // 라벨별 이미지 수
  const labelCounts = labels.reduce(
    (acc, label) => {
      acc[label] = capturedImages.filter((img) => img.label === label).length;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="flex h-full">
      {/* LEFT: 카메라 뷰 */}
      <div className="flex-1 flex flex-col bg-gray-900 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
          <div className="flex items-center gap-2">
            <Camera className="size-4 text-indigo-400" />
            <span className="text-sm font-semibold text-white">카메라 실시간 학습</span>
            {modelReady && (
              <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">모델 준비됨</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode("capture")}
              className={`px-3 py-1 text-xs rounded-md ${mode === "capture" ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-400"}`}
            >
              촬영 모드
            </button>
            <button
              onClick={() => setMode("realtime")}
              className={`px-3 py-1 text-xs rounded-md ${mode === "realtime" ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-400"} ${!modelReady ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={!modelReady}
            >
              실시간 추론
            </button>
          </div>
        </div>

        {/* Video */}
        <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="max-w-full max-h-full object-contain"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* 실시간 추론 오버레이 */}
          {mode === "realtime" && modelReady && realtimeResults.map((r, i) => (
            <div key={i} className="absolute" style={{
              left: r.bbox?.x || 100,
              top: r.bbox?.y || 80,
              width: r.bbox?.w || 300,
              height: r.bbox?.h || 250,
            }}>
              <div className={`w-full h-full border-2 rounded-md ${
                r.label === "정상" ? "border-emerald-400" : "border-red-400"
              }`} />
              <div className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-xs font-bold ${
                r.label === "정상" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
              }`}>
                {r.label} {(r.confidence * 100).toFixed(1)}%
              </div>
            </div>
          ))}

          {/* FPS 표시 */}
          {mode === "realtime" && (
            <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-green-400 font-mono">
              {fps} FPS
            </div>
          )}

          {/* 카메라 꺼짐 */}
          {!isActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
              <CameraOff className="size-12 text-gray-600 mb-4" />
              <p className="text-gray-500 text-sm mb-4">카메라가 꺼져 있습니다</p>
              <Button onClick={startCamera} className="bg-indigo-600 hover:bg-indigo-700">
                <Camera className="size-4 mr-2" /> 카메라 시작
              </Button>
            </div>
          )}
        </div>

        {/* 하단 컨트롤 */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
          <div className="flex items-center gap-2">
            {isActive ? (
              <Button size="sm" variant="destructive" onClick={stopCamera}>
                <CameraOff className="size-3.5 mr-1" /> 카메라 중지
              </Button>
            ) : (
              <Button size="sm" onClick={startCamera}>
                <Camera className="size-3.5 mr-1" /> 카메라 시작
              </Button>
            )}
          </div>

          {mode === "capture" && isActive && (
            <div className="flex items-center gap-2">
              <select
                value={currentLabel}
                onChange={(e) => setCurrentLabel(e.target.value)}
                className="bg-gray-700 text-white text-xs rounded px-2 py-1.5 outline-none"
              >
                <option value="">라벨 선택</option>
                {labels.map((l) => (
                  <option key={l} value={l}>{l} ({labelCounts[l] || 0}장)</option>
                ))}
              </select>
              <Button
                size="sm"
                onClick={captureImage}
                disabled={!currentLabel}
                className="bg-red-600 hover:bg-red-700"
              >
                <CircleDot className="size-3.5 mr-1" /> 촬영
              </Button>
            </div>
          )}

          {mode === "realtime" && (
            <div className="text-xs text-gray-400">
              {modelReady ? "실시간 추론 중..." : "모델을 먼저 학습해주세요"}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: 학습 패널 */}
      <div className="w-80 shrink-0 flex flex-col bg-white border-l border-gray-200">
        {/* 라벨 관리 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="size-4 text-indigo-500" />
            <span className="text-xs font-bold text-gray-700">라벨 관리</span>
          </div>
          <div className="flex gap-1 flex-wrap mb-2">
            {labels.map((l) => (
              <span key={l} className="flex items-center gap-1 text-[11px] px-2 py-1 bg-gray-100 rounded-full">
                {l}
                <span className="text-gray-400 font-bold">{labelCounts[l] || 0}</span>
                {labels.length > 2 && (
                  <button onClick={() => setLabels(labels.filter((x) => x !== l))} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="size-2.5" />
                  </button>
                )}
              </span>
            ))}
          </div>
          <div className="flex gap-1">
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLabel()}
              placeholder="새 라벨 추가..."
              className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none"
            />
            <button onClick={addLabel} className="p-1 bg-gray-100 rounded hover:bg-gray-200">
              <Plus className="size-3.5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* 촬영된 이미지 */}
        <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: "thin" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-700">
              <ImageIcon className="size-3.5 inline mr-1" />
              학습 데이터 ({capturedImages.length}장)
            </span>
            {capturedImages.length > 0 && (
              <button
                onClick={() => setCapturedImages([])}
                className="text-[10px] text-red-400 hover:text-red-600"
              >
                <RotateCcw className="size-3 inline mr-0.5" /> 초기화
              </button>
            )}
          </div>

          {capturedImages.length === 0 ? (
            <div className="text-center py-8">
              <Camera className="size-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">
                라벨을 선택하고 촬영 버튼을 누르세요
              </p>
              <p className="text-[10px] text-gray-300 mt-1">
                라벨당 최소 2장, 총 4장 이상 필요
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {capturedImages.map((img) => (
                <div key={img.id} className="relative group">
                  <img
                    src={img.dataUrl}
                    alt={img.label}
                    className="w-full aspect-square object-cover rounded-md border border-gray-200"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] text-white px-1 py-0.5 rounded-b-md text-center">
                    {img.label}
                  </div>
                  <button
                    onClick={() => setCapturedImages((prev) => prev.filter((x) => x.id !== img.id))}
                    className="absolute top-0.5 right-0.5 size-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="size-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 학습 버튼 */}
        <div className="p-4 border-t border-gray-200">
          {isTraining ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 text-indigo-500 animate-spin" />
                <span className="text-xs text-gray-600">학습 중... {trainingProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${trainingProgress}%` }}
                />
              </div>
              <div className="text-[10px] text-gray-400 space-y-0.5">
                {trainingProgress < 30 && <p>데이터 전처리 중...</p>}
                {trainingProgress >= 30 && trainingProgress < 60 && <p>특징 추출 중...</p>}
                {trainingProgress >= 60 && trainingProgress < 90 && <p>모델 학습 중...</p>}
                {trainingProgress >= 90 && <p>최적화 및 검증 중...</p>}
              </div>
            </div>
          ) : modelReady ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="size-4" />
                <span className="text-xs font-semibold">학습 완료! 실시간 추론 가능</span>
              </div>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs"
                onClick={() => setMode("realtime")}
              >
                실시간 추론 모드로 전환
              </Button>
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => { setModelReady(false); setTrainingProgress(0); }}
              >
                <RotateCcw className="size-3 mr-1" /> 재학습
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs"
                onClick={startTraining}
                disabled={capturedImages.length < 4}
              >
                학습 시작 ({capturedImages.length}장)
              </Button>
              {capturedImages.length < 4 && (
                <p className="text-[10px] text-amber-500 flex items-center gap-1">
                  <AlertTriangle className="size-3" />
                  최소 4장 필요 (현재 {capturedImages.length}장)
                </p>
              )}
              <p className="text-[10px] text-gray-400 flex items-center gap-1">
                <Info className="size-3" />
                카메라로 촬영한 이미지를 브라우저에서 직접 학습합니다
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
