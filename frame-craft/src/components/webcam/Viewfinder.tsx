import { RefObject, MutableRefObject } from "react";

interface ViewfinderProps {
  // useRef로 생성된 비디오 엘리먼트를 받음 (부모가 제어권을 가짐)
  videoRef: RefObject<HTMLVideoElement> | MutableRefObject<HTMLVideoElement | null>;
  isMirrored: boolean; // 좌우 반전 여부
  isGridOn: boolean;   // 3x3 격자 표시 여부
  count: number | null;// 카운트다운 숫자
  isFlashing: boolean; // 촬영 순간 플래시 효과
  isComplete: boolean; // 촬영 종료 상태
}

export default function Viewfinder({ videoRef, isMirrored, isGridOn, count, isFlashing, isComplete }: ViewfinderProps) {
  return (
    // 뷰파인더 컨테이너: 고정 크기(640px) 및 스타일링
    <div className="relative border-4 border-white/50 rounded-xl overflow-hidden w-[640px] max-w-full shadow-2xl bg-black z-10">
      
      {/* 1. 실제 비디오 피드 */}
      <video 
        ref={videoRef as RefObject<HTMLVideoElement>} 
        autoPlay 
        playsInline // 모바일에서 전체화면 방지
        // CSS transform으로 좌우 반전 처리 (거울 모드)
        className={`w-full ${isMirrored ? "transform -scale-x-100" : ""}`} 
      />
      
      {/* 2. 3x3 가이드라인 (Grid) - CSS Grid 활용 */}
      {isGridOn && (
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
          {/* 각 셀의 테두리를 그려서 격자를 만듦 */}
          <div className="border-r border-b border-white/30"></div>
          <div className="border-r border-b border-white/30"></div>
          <div className="border-b border-white/30"></div>
        </div>
      )}

      {/* 3. 카운트다운 오버레이 (숫자가 있을 때만 표시) 딤드(Dimmed) 처리 */}
      {count !== null && count > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-9xl font-bold animate-pulse">
          {count}
        </div>
      )}
      
      {/* 4. 플래시 효과 (촬영 찰나에 하얀 화면 깜빡임) */}
      {isFlashing && <div className="absolute inset-0 bg-white transition-opacity duration-200" />}
      
      {/* 5. 촬영 완료 오버레이 */}
      {isComplete && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-none backdrop-blur-sm">
          <h2 className="text-white text-3xl font-bold drop-shadow-md animate-bounce mb-2">
            ✨ 촬영 완료! ✨
          </h2>
          {/* 안내 메시지 */}
          <p className="text-gray-200 text-sm bg-black/50 px-4 py-1 rounded-full">
            맘에 안 드는 사진은 <span className="text-red-400 font-bold">X</span>를 눌러 다시 찍으세요
          </p>
        </div>
      )}
    </div>
  );
}