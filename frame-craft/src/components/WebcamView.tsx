"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, Loader2, Sparkles, Wand2 } from "lucide-react";
import Script from "next/script"; // 👈 스크립트 로드용 컴포넌트 추가

export default function WebcamView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);
  
  // Script 로드 완료 여부 체크
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  
  const isAiModeRef = useRef(false);

  const toggleAiMode = () => {
    const nextMode = !isAiMode;
    setIsAiMode(nextMode);
    isAiModeRef.current = nextMode;
  };

  useEffect(() => {
    // 스크립트가 아직 로드 안 됐으면 대기
    if (!isScriptLoaded) return;

    let segmentation: any = null;
    let animationId: number;

    const startCameraAndAI = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: "user" },
          audio: false,
        });
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            initializeMediaPipe();
          };
        }
      } catch (err) {
        console.error("카메라 에러:", err);
      }
    };

    const initializeMediaPipe = () => {
      // window 객체에서 꺼내서 사용 (CDN 로드 방식)
      if (!window.SelfieSegmentation) {
        console.error("MediaPipe가 로드되지 않았습니다.");
        return;
      }

      segmentation = new window.SelfieSegmentation({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });

      segmentation.setOptions({
        modelSelection: 1,
        selfieMode: true,
      });

      segmentation.onResults((results: any) => {
        setIsModelLoaded(true);
        drawToCanvas(results);
      });

      loop();
    };

    const loop = async () => {
      if (videoRef.current && canvasRef.current && segmentation) {
        if (isAiModeRef.current) {
          await segmentation.send({ image: videoRef.current });
        } else {
          drawRawVideo();
        }
      }
      animationId = requestAnimationFrame(loop);
    };

    const drawRawVideo = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    };

    const drawToCanvas = (results: any) => {
      const canvas = canvasRef.current;
      if (!canvas || !isAiModeRef.current) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = results.image.width;
      canvas.height = results.image.height;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-in";
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    };

    startCameraAndAI();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (segmentation) segmentation.close();
      cancelAnimationFrame(animationId);
    };
  }, [isScriptLoaded]); // 스크립트 로드되면 실행

  const capturePhoto = () => {
    if (photos.length >= 4) return;
    if (canvasRef.current) {
      const imageUrl = canvasRef.current.toDataURL("image/png");
      setPhotos((prev) => [...prev, imageUrl]);
    }
  };

  const resetPhotos = () => setPhotos([]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
      {/* 👇 여기에 Script 태그 추가 (핵심!) */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("MediaPipe Script Loaded!");
          setIsScriptLoaded(true);
        }}
      />

      <div className="relative w-full aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-gray-800">
        <video ref={videoRef} className="hidden" muted playsInline />
        
        {isAiMode && !isModelLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 text-white">
            <Loader2 className="w-10 h-10 animate-spin mb-2 text-indigo-500" />
            <p>AI 모델 준비중...</p>
          </div>
        )}

        <canvas ref={canvasRef} className="w-full h-full object-cover" />

        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-sm font-bold flex items-center gap-2 border border-white/20">
          {isAiMode ? (
            <><Sparkles className="w-4 h-4 text-yellow-400" /> AI 배경제거 ON</>
          ) : (
            <span className="text-gray-300">원본 모드</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleAiMode}
          className={`px-6 py-4 rounded-full font-bold shadow-lg transition-all flex items-center gap-2 border-2 ${
            isAiMode
              ? "bg-indigo-600 border-indigo-400 text-white hover:bg-indigo-700"
              : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
          }`}
        >
          <Wand2 className={`w-5 h-5 ${isAiMode ? "animate-pulse" : ""}`} />
          {isAiMode ? "배경 살리기" : "배경 지우기"}
        </button>

        <button
          onClick={capturePhoto}
          disabled={photos.length >= 4 || (isAiMode && !isModelLoaded)}
          className="px-8 py-4 bg-white text-indigo-900 font-bold text-lg rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="w-6 h-6" />
          {photos.length >= 4 ? "촬영 완료" : "촬영하기"}
        </button>

        {photos.length > 0 && (
          <button
            onClick={resetPhotos}
            className="px-4 py-4 bg-gray-700 text-white rounded-full shadow hover:bg-gray-600 transition"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        )}
      </div>

      {photos.length > 0 && (
        <div className="w-full p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 mt-4">
          <div className="grid grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="aspect-[3/4] bg-white/5 rounded-xl overflow-hidden border border-white/30">
                <img src={photo} alt="shot" className="w-full h-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}