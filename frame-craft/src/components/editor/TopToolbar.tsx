import { THEMES } from "./constants";

interface TopToolbarProps {
  layoutMode: 'grid' | 'vertical';
  setLayoutMode: (mode: 'grid' | 'vertical') => void;
  themeIndex: number;
  onCycleTheme: () => void;
  isStickerBarOpen: boolean;
  setIsStickerBarOpen: (open: boolean) => void;
}

export default function TopToolbar({
  layoutMode, setLayoutMode, themeIndex, onCycleTheme, isStickerBarOpen, setIsStickerBarOpen
}: TopToolbarProps) {
  const currentTheme = THEMES[themeIndex];

  return (
    <div className="flex flex-col xl:flex-row items-center gap-6 mb-8 bg-gray-800/50 p-4 rounded-2xl backdrop-blur-sm">
      <h1 className="text-3xl font-bold tracking-wider text-white">🎨 프레임 꾸미기</h1>
      
      <div className="flex gap-4 flex-wrap justify-center">
        {/* 레이아웃 선택 */}
        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
          <button onClick={() => setLayoutMode('grid')} className={`px-3 py-2 rounded-md font-bold transition flex items-center gap-2 ${layoutMode === 'grid' ? 'bg-pink-500 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
            <span>田</span> 2x2
          </button>
          <button onClick={() => setLayoutMode('vertical')} className={`px-3 py-2 rounded-md font-bold transition flex items-center gap-2 ${layoutMode === 'vertical' ? 'bg-pink-500 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
            <span>目</span> 4컷
          </button>
        </div>

        {/* 테마 변경 */}
        <button onClick={onCycleTheme} className="px-4 py-2 rounded-lg font-bold transition shadow-lg flex items-center gap-2 truncate" style={{ backgroundColor: currentTheme.bg, color: currentTheme.text === '#ffffff' ? '#ffffff' : '#000000' }}>
          <span>🎨</span> {currentTheme.name}
        </button>
        
        {/* 스티커 토글 */}
         <button onClick={() => setIsStickerBarOpen(!isStickerBarOpen)} className={`px-4 py-2 rounded-lg font-bold transition border ${isStickerBarOpen ? 'bg-teal-500 border-teal-500 text-white' : 'bg-transparent border-teal-500 text-teal-500 hover:bg-teal-500/20'}`}>
          {isStickerBarOpen ? '스티커 닫기 👉' : '👈 스티커 열기'}
        </button>
      </div>
    </div>
  );
}