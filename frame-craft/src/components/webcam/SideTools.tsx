interface SideToolsProps {
  isGridOn: boolean;
  setIsGridOn: (v: boolean) => void;
  isMirrored: boolean;
  setIsMirrored: (v: boolean) => void;
}

export default function SideTools({ isGridOn, setIsGridOn, isMirrored, setIsMirrored }: SideToolsProps) {
  return (
    // [수정] absolute 제거, 가로 정렬(flex-row)로 변경, 버튼 크기 약간 조정(w-12)
    <div className="flex flex-row gap-4 z-20">
      <button
        onClick={() => setIsGridOn(!isGridOn)}
        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 transition backdrop-blur-md ${
          isGridOn 
            ? "bg-pink-500/80 border-pink-400 text-white shadow-[0_0_10px_rgba(236,72,153,0.5)]" 
            : "bg-white/5 border-white/30 text-white/70 hover:bg-white/20 hover:text-white hover:border-white/50"
        }`}
        title="3x3 그리드"
      >
        📐
      </button>
      <button
        onClick={() => setIsMirrored(!isMirrored)}
        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 transition backdrop-blur-md ${
          !isMirrored 
            ? "bg-purple-500/80 border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
            : "bg-white/5 border-white/30 text-white/70 hover:bg-white/20 hover:text-white hover:border-white/50"
        }`}
        title="좌우 반전"
      >
        ↔️   
      </button>
    </div>
  );
}