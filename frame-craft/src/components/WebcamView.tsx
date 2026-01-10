"use client"; // Next.js에서 브라우저 전용 기능(window, document 등)을 쓸 때 필수

import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, Loader2, Sparkles, Wand2, X } from "lucide-react";
import Script from "next/script"; // MediaPipe 라이브러리를 CDN으로 불러오기 위한 도구

// 부모 컴포넌트(page.tsx)와 소통하기 위한 약속(Interface)
// "촬영이 다 끝나면 사진들(string 배열)을 부모에게 넘겨줄게!" 라는 뜻
interface WebcamViewProps {
  onComplete: (photos: string[]) => void;
}

export default function WebcamView({ onComplete }: WebcamViewProps) {
  // --- [변수 선언부] ---
  
  // HTML 태그를 조작하기 위한 훅 (비디오 태그, 캔버스 태그)
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 상태값들 (화면을 갱신하게 만드는 값들)
  const [stream, setStream] = useState<MediaStream | null>(null); // 카메라 데이터
  const [photos, setPhotos] = useState<string[]>([]); // 찍은 사진 4장 저장소
  
  const [isModelLoaded, setIsModelLoaded] = useState(false); // AI 모델 로딩 끝났니?
  const [isAiMode, setIsAiMode] = useState(false); // 배경 제거 모드 켰니?
  
  const [isScriptLoaded, setIsScriptLoaded] = useState(false); // MediaPipe 스크립트 다운 받았니?
  
  // [중요] 애니메이션 루프 안에서 최신 상태를 읽기 위해 ref 사용
  // useState는 루프 안에서 값이 바로바로 안 바뀌는 문제가 있어서 ref로 보조함
  const isAiModeRef = useRef(false);

  // AI 모드 토글 함수 (버튼 누르면 실행)
  const toggleAiMode = () => {
    const nextMode = !isAiMode;
    setIsAiMode(nextMode);
    isAiModeRef.current = nextMode; // 루프를 위해 ref도 같이 업데이트
  };

  // --- [메인 로직: 카메라 켜고 AI 돌리기] ---
  useEffect(() => {
    // 1. 스크립트가 아직 로드 안 됐으면 아무것도 안 함 (기다림)
    if (!isScriptLoaded) return;

    let segmentation: any = null; // AI 엔진 담을 변수
    let animationId: number; // 루프 취소용 ID

    const startCameraAndAI = async () => {
      try {
        // 2. 카메라 권한 요청 및 스트림 가져오기
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: "user" }, // HD 화질, 셀카 모드
          audio: false,
        });
        setStream(mediaStream);

        // 3. 가져온 스트림을 비디오 태그에 연결 (근데 비디오 태그는 숨겨져 있음)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            initializeMediaPipe(); // 비디오 재생 시작되면 AI 준비 시작!
          };
        }
      } catch (err) {
        console.error("카메라 에러:", err);
      }
    };

    // 4. MediaPipe AI 초기화 함수
    const initializeMediaPipe = () => {
      // CDN으로 불러온 전역 객체(window.SelfieSegmentation) 확인
      if (!window.SelfieSegmentation) {
        console.error("MediaPipe가 로드되지 않았습니다.");
        return;
      }

      // AI 엔진 생성
      segmentation = new window.SelfieSegmentation({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`, // 필요한 파일 위치 지정
      });

      // 옵션 설정 (1번 모델이 풍경 모드로 좀 더 정교함)
      segmentation.setOptions({
        modelSelection: 1,
        selfieMode: true, // true로 해야 거울처럼 좌우 반전됨
      });

      // [핵심] AI가 분석을 끝낼 때마다 실행되는 함수
      segmentation.onResults((results: any) => {
        setIsModelLoaded(true); // 첫 결과가 나오면 로딩 끝!
        drawToCanvas(results);  // 결과를 캔버스에 그려라
      });

      // 무한 반복 루프 시작
      loop();
    };

    // 5. 무한 루프: 비디오 프레임을 계속 AI에게 보내거나 캔버스에 그림
    const loop = async () => {
      if (videoRef.current && canvasRef.current && segmentation) {
        if (isAiModeRef.current) {
          // AI 모드 ON: 비디오를 AI에게 보내서 분석 요청 -> onResults 실행됨
          await segmentation.send({ image: videoRef.current });
        } else {
          // AI 모드 OFF: 그냥 비디오 화면을 캔버스에 바로 그림
          drawRawVideo();
        }
      }
      // 다음 프레임에도 이 함수를 실행해줘 (약 1초에 60번 실행)
      animationId = requestAnimationFrame(loop);
    };

    // [그리기 1] 일반 화면 그리기 (AI X)
    const drawRawVideo = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 캔버스 크기 맞춤
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height); // 지우고
      ctx.translate(canvas.width, 0); // 좌표 이동
      ctx.scale(-1, 1); // 좌우 반전 (거울 효과)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height); // 그리기
      ctx.restore();
    };

    // [그리기 2] AI 결과 그리기 (배경 제거)
    const drawToCanvas = (results: any) => {
      const canvas = canvasRef.current;
      if (!canvas || !isAiModeRef.current) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = results.image.width;
      canvas.height = results.image.height;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1단계: 마스크(사람 모양 흰색 덩어리)를 먼저 그림
      ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);
      
      // 2단계: 합성 모드 변경 ('source-in' = 이미 그려진 도형 안에만 새 그림을 채움)
      // 즉, 마스크(사람 영역) 안에만 원본 비디오를 덮어씌움 -> 배경은 투명해짐
      ctx.globalCompositeOperation = "source-in";
      
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    };

    startCameraAndAI();

    // 정리(Cleanup): 컴포넌트가 꺼질 때 실행
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop()); // 카메라 끄기
      if (segmentation) segmentation.close(); // AI 종료
      cancelAnimationFrame(animationId); // 루프 멈추기
    };
  }, [isScriptLoaded]); // 스크립트 로드 완료되면 실행됨

  // --- [촬영 기능] ---
  const capturePhoto = () => {
    if (photos.length >= 4) return;
    if (canvasRef.current) {
      // 현재 캔버스에 그려진 그림을 문자열(Base64 Image)로 변환해서 저장
      const imageUrl = canvasRef.current.toDataURL("image/png");
      setPhotos((prev) => [...prev, imageUrl]);
    }
  };

  // 사진 삭제 함수
  const removePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const resetPhotos = () => setPhotos([]);

  // --- [화면 렌더링 (HTML)] ---
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
      
      {/* 1. MediaPipe 스크립트 로드 */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("MediaPipe Script Loaded!");
          setIsScriptLoaded(true);
        }}
      />

      {/* 2. 메인 화면 (비디오 + 캔버스) */}
      <div className="relative w-full aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-gray-800">
        <video ref={videoRef} className="hidden" muted playsInline />
        
        {/* 로딩 표시 */}
        {isAiMode && !isModelLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 text-white">
            <Loader2 className="w-10 h-10 animate-spin mb-2 text-indigo-500" />
            <p>AI 모델 준비중...</p>
          </div>
        )}

        {/* 캔버스 */}
        <canvas ref={canvasRef} className="w-full h-full object-cover" />

        {/* AI 모드 배지 */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-sm font-bold flex items-center gap-2 border border-white/20">
          {isAiMode ? (
            <><Sparkles className="w-4 h-4 text-yellow-400" /> AI 배경제거 ON</>
          ) : (
            <span className="text-gray-300">원본 모드</span>
          )}
        </div>
      </div>

      {/* 3. 컨트롤 버튼 (AI 토글 & 촬영) */}
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
        
        {/* ⚠️ 여기에 있던 편집하기 버튼은 지웠습니다! */}
      </div>

      {/* 4. 찍은 사진 갤러리 (삭제 버튼 포함) */}
      {photos.length > 0 && (
        <div className="w-full p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 mt-4">
          <div className="grid grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div 
                key={index} 
                className="relative aspect-[3/4] bg-white/5 rounded-xl overflow-hidden border border-white/30 group"
              >
                <img src={photo} alt={`shot-${index}`} className="w-full h-full object-contain" />
                
                {/* 개별 삭제 버튼 */}
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-all hover:scale-110"
                  title="삭제하기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ✅ 최종 편집하기 버튼 (맨 아래 배치) */}
      {photos.length > 0 && (
        <button
          onClick={() => onComplete(photos)}
          className="mt-6 px-8 py-3 bg-white text-indigo-600 font-bold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 animate-bounce"
        >
          편집하기 ✨
        </button>
      )}

    </div>
  );
}