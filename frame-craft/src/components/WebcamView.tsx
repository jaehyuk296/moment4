"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface WebcamViewProps {
  onFinish: (photos: string[]) => void;
}

export default function WebcamView({ onFinish }: WebcamViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  
  // 기능 상태 관리
  const [count, setCount] = useState<number | null>(null); // 카운트다운 (null이면 대기)
  const [isTimerOn, setIsTimerOn] = useState(false);       // 타이머 모드 켜기/끄기
  const [isFlashing, setIsFlashing] = useState(false);     // 촬영 효과

  // 1. 카메라 시작
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch((err) => console.error("Camera Error:", err));
  }, []);

  // 2. 촬영 완료 체크 (4장 모이면 종료)
  useEffect(() => {
    if (photos.length === 4) {
      setTimeout(() => onFinish(photos), 500); // 마지막 촬영 후 잠시 보여주고 넘어감
    }
  }, [photos, onFinish]);

  // 3. 사진 1장 캡처 함수 (핵심)
  const captureOne = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    
    // 좌우 반전
    ctx?.translate(canvas.width, 0);
    ctx?.scale(-1, 1);
    ctx?.drawImage(videoRef.current, 0, 0);
    
    const photoData = canvas.toDataURL("image/png");
    
    // 플래시 & 저장
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);
    setPhotos((prev) => [...prev, photoData]);
    setCount(null); // 카운트다운 종료 (다음 촬영 대기)
  }, []);

  // 4. 타이머 카운트다운 로직
  useEffect(() => {
    if (count === null) return;

    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else if (count === 0) {
      captureOne(); // 0이 되면 촬영!
    }
  }, [count, captureOne]);

  // 5. 셔터 버튼 핸들러
  const handleShutter = () => {
    if (photos.length >= 4) return;

    if (isTimerOn) {
      setCount(3); // 타이머 켜져있으면 3초 카운트 시작
    } else {
      captureOne(); // 꺼져있으면 즉시 촬영
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-screen bg-gray-900 p-4">
      {/* 뷰파인더 영역 */}
      <div className="relative border-4 border-white rounded-xl overflow-hidden w-[640px] max-w-full shadow-2xl">
        <video ref={videoRef} autoPlay playsInline className="w-full transform -scale-x-100 bg-black" />
        
        {/* 카운트다운 오버레이 */}
        {count !== null && count > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-9xl font-bold animate-pulse">
            {count}
          </div>
        )}
        
        {/* 촬영 플래시 */}
        {isFlashing && <div className="absolute inset-0 bg-white transition-opacity duration-200" />}
      </div>

      {/* 하단 컨트롤 영역 */}
      <div className="w-full max-w-[640px] mt-6 flex flex-col gap-4">
        
        {/* 찍은 사진 미리보기 리스트 */}
        <div className="flex gap-2 justify-center h-24">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`relative w-20 h-full border-2 rounded-md overflow-hidden bg-gray-800 ${photos[i] ? "border-green-400" : "border-gray-600"}`}>
              {photos[i] ? (
                <img src={photos[i]} alt={`shot ${i}`} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 font-bold text-xl">{i + 1}</div>
              )}
            </div>
          ))}
        </div>

        {/* 조작 버튼들 */}
        <div className="flex items-center justify-between bg-gray-800 p-4 rounded-full px-8">
          
          {/* 타이머 토글 버튼 */}
          <button 
            onClick={() => setIsTimerOn(!isTimerOn)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition ${
              isTimerOn ? "bg-yellow-400 text-black" : "bg-gray-600 text-gray-300"
            }`}
          >
            {isTimerOn ? "⏱️ 타이머 ON (3초)" : "⏱️ 타이머 OFF"}
          </button>

          {/* 셔터 버튼 */}
          <button 
            onClick={handleShutter}
            disabled={count !== null} // 카운트다운 중엔 클릭 방지
            className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 shadow-lg hover:bg-gray-100 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-full h-full rounded-full border-2 border-black opacity-20"></div>
          </button>

          {/* 리셋 버튼 (선택 사항) */}
          <button 
            onClick={() => setPhotos([])}
            className="text-white underline text-sm hover:text-gray-300"
          >
            초기화
          </button>
        </div>

        <p className="text-center text-gray-400 mt-2">
          {4 - photos.length}장 남았습니다. {isTimerOn ? "셔터를 누르면 3초 뒤 찍힙니다." : "셔터를 누르면 바로 찍힙니다."}
        </p>
      </div>
    </div>
  );
}