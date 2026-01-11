"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface WebcamViewProps {
  onFinish: (photos: string[]) => void;
}

export default function WebcamView({ onFinish }: WebcamViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  
  // 기능 상태 관리
  const [count, setCount] = useState<number | null>(null);
  const [isTimerOn, setIsTimerOn] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  // 1. 카메라 시작
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch((err) => console.error("Camera Error:", err));
  }, []);

  // 2. 사진 1장 캡처 함수
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
    
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);
    setPhotos((prev) => [...prev, photoData]);
    setCount(null);
  }, []);

  // 3. 타이머 로직
  useEffect(() => {
    if (count === null) return;
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else if (count === 0) {
      captureOne();
    }
  }, [count, captureOne]);

  // 셔터 핸들러
  const handleShutter = () => {
    if (photos.length >= 4) return;
    if (isTimerOn) setCount(3);
    else captureOne();
  };

  // 개별 사진 삭제
  const deletePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  return (
    // 화려한 배경 그라데이션 적용
    <div className="flex flex-col items-center justify-center w-full h-full min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-purple-900 to-violet-950 p-4">
      
      {/* 상단 MOMENT4 타이틀 */}
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 mb-8 tracking-widest drop-shadow-sm">
        MOMENT4
      </h1>
    
      {/* 뷰파인더 영역 */}
      <div className="relative border-4 border-white/50 rounded-xl overflow-hidden w-[640px] max-w-full shadow-2xl bg-black">
        <video ref={videoRef} autoPlay playsInline className="w-full transform -scale-x-100" />
        
        {/* 카운트다운 */}
        {count !== null && count > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-9xl font-bold animate-pulse">
            {count}
          </div>
        )}
        
        {/* 플래시 */}
        {isFlashing && <div className="absolute inset-0 bg-white transition-opacity duration-200" />}
        
        {/* 4장 완료 시 메시지 */}
        {photos.length === 4 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-none backdrop-blur-sm">
            <h2 className="text-white text-3xl font-bold drop-shadow-md animate-bounce mb-2">
              ✨ 촬영 완료! ✨
            </h2>
            <p className="text-gray-200 text-sm bg-black/50 px-4 py-1 rounded-full">
              맘에 안 드는 사진은 <span className="text-red-400 font-bold">X</span>를 눌러 다시 찍으세요
            </p>
          </div>
        )}
      </div>

      {/* 하단 컨트롤 영역 */}
      <div className="w-full max-w-[640px] mt-8 flex flex-col gap-6">
        
        {/* 사진 미리보기 리스트 */}
        <div className="flex gap-4 justify-center h-28">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`relative w-24 h-full border-2 rounded-lg overflow-hidden bg-white/10 backdrop-blur-md ${photos[i] ? "border-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.5)]" : "border-black/50 border-dashed"}`}>
              {photos[i] ? (
                <>
                  {/* [변경점] 사진에 하얀색 테두리 추가 */}
                  <img src={photos[i]} alt={`shot ${i}`} className="w-full h-full object-cover border-2 border-white/70" />
                  
                  <button   
                    onClick={() => deletePhoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-md transition-transform hover:scale-110 z-20"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-white/50 font-bold text-xl">{i + 1}</div>
              )}
            </div>
          ))}
        </div>

        {/* 조작 버튼 영역 */}
        <div className="flex items-center justify-center bg-white/10 backdrop-blur-md p-4 rounded-full px-8 relative min-h-[88px] border border-black/20">
          
          {photos.length < 4 ? (
            // [촬영 중]
            <div className="flex items-center gap-8 w-full justify-between">
              
              {/* 타이머 버튼 디자인 수정 */}
              <button 
                onClick={() => setIsTimerOn(!isTimerOn)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition border-2 ${
                  isTimerOn 
                    ? "bg-pink-500 border-pink-500 text-white shadow-lg"  // 켜짐: 꽉 찬 핑크
                    : "bg-transparent border-pink-400 text-black hover:bg-pink-500/10 hover:border-pink-300" // 꺼짐: 투명 + 핑크 테두리
                }`}
              >
                {isTimerOn ? "⏱️ 3초" : "⏱️ OFF"}
              </button>

              <button 
                onClick={handleShutter}
                disabled={count !== null} 
                className="w-20 h-20 bg-white rounded-full border-4 border-pink-200 shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:bg-pink-50 active:scale-95 transition transform"
              >
                <div className="w-full h-full rounded-full border-2 border-pink-400 opacity-30"></div>
              </button>

              <div className="w-24"></div> 
            </div>
          ) : (
            // [4장 완료]
            <button 
              onClick={() => onFinish(photos)}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-violet-500 text-white text-2xl font-bold rounded-full hover:from-pink-600 hover:to-violet-600 transition shadow-lg flex items-center justify-center gap-2 animate-pulse"
            >
              🎨 이대로 꾸미러 가기!
            </button>
          )}
        </div>
      </div>  
    </div>
  );
}   