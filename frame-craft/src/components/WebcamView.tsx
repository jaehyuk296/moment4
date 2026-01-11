"use client";

import { useRef, useEffect, useState, useCallback } from "react";

// 분리한 컴포넌트 불러오기
import NeonDecorations from "./webcam/NeonDecorations";
// SideTools는 이제 ControlBar 내부에서 쓰이므로 여기서 직접 import 안 해도 되지만,
// 아래에서 지워야 하므로 확인용으로 남겨둡니다.
import Viewfinder from "./webcam/Viewfinder";
import PhotoStrip from "./webcam/PhotoStrip";
import ControlBar from "./webcam/ControlBar";

interface WebcamViewProps {
  onFinish: (photos: string[]) => void;
}

export default function WebcamView({ onFinish }: WebcamViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  
  // 상태 관리
  const [count, setCount] = useState<number | null>(null);
  const [isTimerOn, setIsTimerOn] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isGridOn, setIsGridOn] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);

  // 카메라 초기화
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch((err) => console.error("Camera Error:", err));
  }, []);

  // 사진 촬영 로직
  const captureOne = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    
    if (isMirrored) {
      ctx?.translate(canvas.width, 0);
      ctx?.scale(-1, 1);
    }
    
    ctx?.drawImage(videoRef.current, 0, 0);
    const photoData = canvas.toDataURL("image/png");
    
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);
    setPhotos((prev) => [...prev, photoData]);
    setCount(null);
  }, [isMirrored]);

  // 타이머 로직
  useEffect(() => {
    if (count === null) return;
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else if (count === 0) {
      captureOne();
    }
  }, [count, captureOne]);

  const handleShutter = () => {
    if (photos.length >= 4) return;
    if (isTimerOn) setCount(3);
    else captureOne();
  };

  const deletePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-purple-900 to-violet-950 p-4 overflow-hidden">
      
      {/* 1. 배경 데코 */}
      <NeonDecorations />

      {/* 2. 타이틀 */}
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 mb-8 tracking-widest drop-shadow-sm z-10">
        MOMENT4
      </h1>
    
      {/* 3. 메인 콘텐츠 (뷰파인더만 남김) */}
      <div className="relative flex items-center justify-center">
        {/* [수정] SideTools 컴포넌트 삭제함 (ControlBar 안으로 이동) */}
        
        <Viewfinder 
          videoRef={videoRef}
          isMirrored={isMirrored}
          isGridOn={isGridOn}
          count={count}
          isFlashing={isFlashing}
          isComplete={photos.length === 4}
        />
      </div>

      {/* 4. 하단 영역 (사진 리스트 + 컨트롤 바) */}
      <div className="w-full max-w-[640px] mt-8 flex flex-col gap-6 z-10">
        <PhotoStrip 
          photos={photos} 
          onDelete={deletePhoto} 
        />
        
        {/* [수정] ControlBar에 사이드 툴 관련 props 추가 전달 */}
        <ControlBar 
          isComplete={photos.length === 4}
          isTimerOn={isTimerOn}
          setIsTimerOn={setIsTimerOn}
          onShutter={handleShutter}
          onFinish={() => onFinish(photos)}
          isCountActive={count !== null}
          // 추가된 props
          isGridOn={isGridOn}
          setIsGridOn={setIsGridOn}
          isMirrored={isMirrored}
          setIsMirrored={setIsMirrored}
        />
      </div>
    </div>
  );
}