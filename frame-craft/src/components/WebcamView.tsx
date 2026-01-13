"use client";

import { useRef, useEffect, useState, useCallback } from "react";

// 분리한 컴포넌트 불러오기
import NeonDecorations from "./webcam/NeonDecorations";
import Viewfinder from "./webcam/Viewfinder";
import PhotoStrip from "./webcam/PhotoStrip";
import ControlBar from "./webcam/ControlBar";
interface WebcamViewProps {
  onFinish: (photos: string[]) => void;
}

export default function WebcamView({ onFinish }: WebcamViewProps) {
  // video 엘리먼트에 직접 접근하기 위해 useRef 사용 (DOM 조작 최소화)
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // 촬영된 사진 데이터(Base64 문자열)를 배열로 관리
  const [photos, setPhotos] = useState<string[]>([]);
  
  // UI 상태 관리
  const [count, setCount] = useState<number | null>(null); // 카운트다운 (3, 2, 1...)
  const [isTimerOn, setIsTimerOn] = useState(false);       // 타이머 모드 활성화 여부
  const [isFlashing, setIsFlashing] = useState(false);     // 촬영 순간 플래시 효과
  const [isGridOn, setIsGridOn] = useState(false);         // 그리드 토글
  const [isMirrored, setIsMirrored] = useState(true);      // 거울 모드 토글

  // =========================================================
  // [초기화] 컴포넌트 마운트 시 웹캠 권한 요청 및 스트림 연결
  // =========================================================
  useEffect(() => {
    // navigator.mediaDevices: 최신 브라우저의 미디어 장치 접근 API
    navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: "user" }, // 전면 카메라(셀카 모드) 우선
      audio: false // 오디오는 불필요하므로 끔 (하울링 방지)
    })
      .then((stream) => { 
        // 비디오 태그에 스트림 연결 -> 자동 재생됨
        if (videoRef.current) videoRef.current.srcObject = stream; 
      })
      .catch((err) => console.error("Camera Error:", err));
  }, []);

  // =========================================================
  // [핵심] 사진 캡처 함수 (메모이제이션 적용)
  // useCallback을 써야 useEffect 의존성 배열에서 불필요한 재실행을 막음
  // =========================================================
  const captureOne = useCallback(() => {
    if (!videoRef.current) return;
    
    // 1. 메모리 상에 가상의 캔버스 생성
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    
    // 2. 거울 모드(좌우 반전) 처리
    // 사용자가 보는 화면과 저장되는 사진이 같아야 함 (WYSIWYG)
    if (isMirrored) {
      ctx?.translate(canvas.width, 0); // 좌표축을 오른쪽 끝으로 이동
      ctx?.scale(-1, 1);               // x축을 뒤집음
    }
    
    // 3. 현재 비디오 프레임을 캔버스에 그림
    ctx?.drawImage(videoRef.current, 0, 0);
    
    // 4. 이미지 데이터 추출 (PNG 포맷)
    const photoData = canvas.toDataURL("image/png");
    
    // 5. UX: 플래시 효과 및 데이터 저장
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200); // 0.2초 뒤 플래시 끔
    setPhotos((prev) => [...prev, photoData]);
    setCount(null); // 카운트다운 초기화
  }, [isMirrored]); // isMirrored가 바뀔 때만 함수 재생성

  // =========================================================
  // [로직] 카운트다운 타이머
  // =========================================================
  useEffect(() => {
    if (count === null) return;
    if (count > 0) {
      // 1초마다 count 감소
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer); // 클린업: 컴포넌트 언마운트 시 타이머 제거
    } else if (count === 0) {
      // 0이 되면 촬영 실행
      captureOne();
    }
  }, [count, captureOne]);

  // 셔터 버튼 핸들러
  const handleShutter = () => {
    if (photos.length >= 4) return; // 4장 제한
    if (isTimerOn) setCount(3);     // 타이머 모드면 3초 시작
    else captureOne();              // 아니면 즉시 촬영
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
    
      {/* 3. 메인 콘텐츠 (뷰파인더) */}
      <div className="relative flex items-center justify-center">
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
        
        <ControlBar 
          isComplete={photos.length === 4}
          isTimerOn={isTimerOn}
          setIsTimerOn={setIsTimerOn}
          onShutter={handleShutter}
          onFinish={() => onFinish(photos)}
          isCountActive={count !== null}
          // 사이드 툴 Props 전달
          isGridOn={isGridOn}
          setIsGridOn={setIsGridOn}
          isMirrored={isMirrored}
          setIsMirrored={setIsMirrored}
        />
      </div>
    </div>
  );
}