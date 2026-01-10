"use client";

import { useState } from "react";
import WebcamView from "@/components/WebcamView";
import PhotoEditor from "@/components/PhotoEditor";

export default function Home() {
  // 🚦 현재 단계 상태: 'camera' (촬영중) vs 'editor' (꾸미기)
  const [step, setStep] = useState<"camera" | "editor">("camera");
  
  // 📸 찍은 사진 데이터들을 저장할 곳
  const [photos, setPhotos] = useState<string[]>([]);

  // [함수 1] 촬영이 끝나고 '편집하기' 버튼을 눌렀을 때 실행
  const handleCaptureComplete = (capturedPhotos: string[]) => {
    setPhotos(capturedPhotos); // 사진 데이터 저장
    setStep("editor");         // 화면을 에디터로 전환!
  };

  // [함수 2] 에디터에서 '처음으로' 눌렀을 때 실행
  const handleRetake = () => {
    setPhotos([]);     // 사진 초기화
    setStep("camera"); // 다시 카메라 화면으로 복귀
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4">
      
      {/* 타이틀 섹션 */}
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-md tracking-tight">
          MOMENT4 📸
        </h1>
        <p className="text-white/80 text-lg font-medium">
          {step === "camera" 
            ? "나만의 인생네컷을 만들어보세요!" 
            : "예쁘게 꾸며서 소장하세요! ✨"}
        </p>
      </div>

      {/* 🎬 단계에 따라 화면 갈아끼우기 */}
      <div className="w-full flex justify-center">
        {step === "camera" ? (
          // 1단계: 카메라 화면
          // onComplete라는 '약속'을 통해 사진을 받아옴
          <WebcamView onComplete={handleCaptureComplete} />
        ) : (
          // 2단계: 에디터 화면
          // 저장된 photos를 넘겨줌
          <PhotoEditor photos={photos} onRetake={handleRetake} />
        )}
      </div>
      
    </main>
  );
}