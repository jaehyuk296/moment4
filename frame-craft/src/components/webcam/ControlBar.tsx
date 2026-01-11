import SideTools from "./SideTools"; // SideTools 불러오기

interface ControlBarProps {
  isComplete: boolean;
  isTimerOn: boolean;
  setIsTimerOn: (v: boolean) => void;
  onShutter: () => void;
  onFinish: () => void;
  isCountActive: boolean;
  
  // [추가] SideTools에 필요한 Props 전달받기
  isGridOn: boolean;
  setIsGridOn: (v: boolean) => void;
  isMirrored: boolean;
  setIsMirrored: (v: boolean) => void;
}

export default function ControlBar({ 
  isComplete, isTimerOn, setIsTimerOn, onShutter, onFinish, isCountActive,
  isGridOn, setIsGridOn, isMirrored, setIsMirrored 
}: ControlBarProps) {
  return (
    <div className="flex items-center justify-center bg-white/10 backdrop-blur-md p-4 rounded-full px-8 relative min-h-[88px] border border-black   /20">
      {!isComplete ? (
        <div className="flex items-center gap-4 w-full justify-between">
          {/* [왼쪽] 타이머 버튼 */}
          <div className="flex-1 flex justify-start">
            <button 
              onClick={() => setIsTimerOn(!isTimerOn)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition border-2 ${
                isTimerOn 
                  ? "bg-pink-500 border-pink-500 text-white shadow-lg"
                  : "bg-transparent border-pink-400 text-black hover:bg-pink-500/10 hover:border-pink-300"
              }`}
            >
              {isTimerOn ? "⏱️ 3 초" : "⏱️ OFF"}
            </button>
          </div>

          {/* [중앙] 셔터 버튼 */}
          <div className="flex-0">
            <button 
              onClick={onShutter}
              disabled={isCountActive} 
              className="w-20 h-20 bg-white rounded-full border-4 border-pink-200 shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:bg-pink-50 active:scale-95 transition transform"
            >
              <div className="w-full h-full rounded-full border-2 border-pink-400 opacity-30"></div>
            </button>
          </div>

          {/* [오른쪽] 사이드 툴 (그리드, 거울) 배치 */}
          <div className="flex-1 flex justify-end">
            <SideTools 
              isGridOn={isGridOn} setIsGridOn={setIsGridOn}
              isMirrored={isMirrored} setIsMirrored={setIsMirrored}
            />
          </div>
        </div>
      ) : (
        <button 
          onClick={onFinish}
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-violet-500 text-white text-2xl font-bold rounded-full hover:from-pink-600 hover:to-violet-600 transition shadow-lg flex items-center justify-center gap-2 animate-pulse"
        >
          🎨 이대로 꾸미러 가기!
        </button>
      )}
    </div>
  );
}