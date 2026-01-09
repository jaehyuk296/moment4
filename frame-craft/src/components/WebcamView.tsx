// src/components/WebcamView.tsx
"use client"; // 브라우저 API(카메라)를 쓰려면 필수!

import { useEffect, useRef, useState } from "react";
import { Camera, AlertCircle } from "lucide-react";

export default function WebcamView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        // 1. 카메라 권한 요청 및 스트림 가져오기
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 }, // HD 화질 선호
            height: { ideal: 720 },
            facingMode: "user", // 전면 카메라 (셀카 모드)
          },
          audio: false, // 소리는 필요 없음
        });

        // 2. 비디오 태그에 스트림 연결
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setLoading(false);
      } catch (err) {
        console.error("카메라 접근 오류:", err);
        setError("카메라 권한을 허용해주세요! 📷");
        setLoading(false);
      }
    };

    startCamera();

    // 3. cleanup: 컴포넌트가 꺼질 때 카메라 끄기 (중요!)
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-2xl aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-gray-800">
      {/* 로딩 상태 */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <Camera className="w-12 h-12 animate-bounce opacity-50" />
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-red-400 z-10">
          <AlertCircle className="w-10 h-10 mb-2" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {/* 실제 비디오 화면 */}
      {/* playsInline: 모바일에서 전체화면 방지, muted: 하울링 방지, autoPlay: 자동 재생 */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover transform scale-x-[-1]" // 거울 모드(좌우 반전)
      />
    </div>
  );
}