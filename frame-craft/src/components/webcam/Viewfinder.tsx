import { RefObject, MutableRefObject } from "react"; // MutableRefObject 추가

interface ViewfinderProps {
  videoRef: RefObject<HTMLVideoElement> | MutableRefObject<HTMLVideoElement | null>;
  isMirrored: boolean;
  isGridOn: boolean;
  count: number | null;
  isFlashing: boolean;
  isComplete: boolean;
}

export default function Viewfinder({ videoRef, isMirrored, isGridOn, count, isFlashing, isComplete }: ViewfinderProps) {
  return (
    <div className="relative border-4 border-white/50 rounded-xl overflow-hidden w-[640px] max-w-full shadow-2xl bg-black z-10">
      {/* videoRef 타입이 호환되도록 ref 속성에 전달 */}
      <video 
        ref={videoRef as RefObject<HTMLVideoElement>} 
        autoPlay 
        playsInline 
        className={`w-full ${isMirrored ? "transform -scale-x-100" : ""}`} 
      />
      
      {/* 그리드 오버레이 */}
      {isGridOn && (
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
          <div className="border-r border-b border-white/30"></div>
          <div className="border-r border-b border-white/30"></div>
          <div className="border-b border-white/30"></div>
          <div className="border-r border-b border-white/30"></div>
          <div className="border-r border-b border-white/30"></div>
          <div className="border-b border-white/30"></div>
          <div className="border-r border-white/30"></div>
          <div className="border-r border-white/30"></div>
          <div></div>
        </div>
      )}

      {/* 카운트다운 */}
      {count !== null && count > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-9xl font-bold animate-pulse">
          {count}
        </div>
      )}
      
      {/* 플래시 */}
      {isFlashing && <div className="absolute inset-0 bg-white transition-opacity duration-200" />}
      
      {/* 완료 메시지 */}
      {isComplete && (
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
  );
}