import { RefObject, MutableRefObject } from "react";

interface ViewfinderProps {
  videoRef: RefObject<HTMLVideoElement> | MutableRefObject<HTMLVideoElement | null>;
  isMirrored: boolean;
  isGridOn: boolean;
  count: number | null;
  isFlashing: boolean;
  isComplete: boolean;
}

export default function Viewfinder({ 
  videoRef, 
  isMirrored, 
  isGridOn, 
  count, 
  isFlashing, 
  isComplete 
}: ViewfinderProps) {
  return (
    <div className="relative border-4 border-white/50 rounded-xl overflow-hidden w-[640px] max-w-full shadow-2xl bg-black z-10 aspect-[4/3] md:aspect-auto">
      
      {/* 1. 실제 비디오 피드 */}
      <video 
        ref={videoRef as RefObject<HTMLVideoElement>} 
        autoPlay 
        playsInline 
        muted // 비디오 소리 끔 (하울링 방지)
        className={`w-full h-full object-cover ${isMirrored ? "transform -scale-x-100" : ""}`} 
      />
      
      {/* 2. 3x3 가이드라인 (Grid) - 9개 셀로 구성 */}
      {isGridOn && (
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
          {/* 첫 번째 줄 (아래쪽 선 있음) */}
          <div className="border-r border-b border-white/40"></div>
          <div className="border-r border-b border-white/40"></div>
          <div className="border-b border-white/40"></div>

          {/* 두 번째 줄 (아래쪽 선 있음) */}
          <div className="border-r border-b border-white/40"></div>
          <div className="border-r border-b border-white/40"></div>
          <div className="border-b border-white/40"></div>

          {/* 세 번째 줄 (아래쪽 선 없음) */}
          <div className="border-r border-white/40"></div>
          <div className="border-r border-white/40"></div>
          <div className=""></div>
        </div>
      )}

      {/* 3. 카운트다운 오버레이 */}
      {count !== null && count > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white text-9xl font-bold animate-pulse z-20">
          {count}
        </div>
      )}
      
      {/* 4. 플래시 효과 */}
      {isFlashing && <div className="absolute inset-0 bg-white z-30 transition-opacity duration-200" />}
      
      {/* 5. 촬영 완료 오버레이 */}
      {isComplete && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-none backdrop-blur-sm z-40">
          <h2 className="text-white text-3xl font-bold drop-shadow-md animate-bounce mb-2">
            ✨ 촬영 완료! ✨
          </h2>
          <p className="text-gray-200 text-sm bg-black/50 px-4 py-1 rounded-full">
            맘에 안 드는 사진은 <span className="text-red-400 font-bold">X</span>를 눌러 다시 찍으세요
          </p>
        </div>
      )}
    </div>
  );
}