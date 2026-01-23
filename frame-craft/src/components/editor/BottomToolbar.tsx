import { useState } from "react";
import { STYLE_FILTERS } from "./constants";

interface BottomToolbarProps {
  onBack: () => void;
  onRemoveBg: () => void;
  onDownload: () => void;
  onApplyStyle: (styleId: string) => void;
  onMirror: () => void; // ✅ [New] 거울모드 함수 타입 추가
  loading: boolean;
}

export default function BottomToolbar({ 
  onBack, 
  onRemoveBg, 
  onDownload, 
  onApplyStyle, 
  onMirror, // ✅ [New] props로 받아옴
  loading 
}: BottomToolbarProps) {
  
  // 스타일 메뉴 열림 상태
  const [showStyleMenu, setShowStyleMenu] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4 mt-8 w-full max-w-4xl">
      
      {/* [New] 스타일 선택 메뉴 (열려있을 때만 보임) */}
      {showStyleMenu && (
        <div className="flex flex-wrap justify-center gap-3 bg-gray-800 p-4 rounded-xl border border-purple-500/50 animate-fade-in-up">
          {STYLE_FILTERS.map((style) => (
            <button
              key={style.id}
              onClick={() => onApplyStyle(style.id)}
              className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-purple-600 transition border border-gray-600 hover:border-purple-400"
            >
              {style.name}
            </button>
          ))}
          <button
            onClick={() => onApplyStyle('original')} // 원본 복구 기능
            className="px-4 py-2 bg-gray-600 text-gray-300 text-sm rounded-lg hover:bg-gray-500 transition"
          >
            🔄 원본
          </button>
        </div>
      )}

      {/* 메인 버튼 영역 */}
      <div className="flex gap-4 flex-wrap justify-center">
        <button 
          onClick={onBack} 
          className="px-6 py-3 bg-gray-700 text-white rounded-full font-bold hover:bg-gray-600 transition flex items-center gap-2"
        >
          ↩️ 다시 찍기
        </button>

        {/* ✅ [New] 거울모드 버튼 추가 */}
        <button 
          onClick={onMirror} 
          className="px-6 py-3 bg-teal-500 text-white rounded-full font-bold hover:bg-teal-600 transition shadow-lg flex items-center gap-2"
          disabled={loading}
        >
          🪞 거울모드
        </button>

        <button 
          onClick={onRemoveBg} 
          className="px-6 py-3 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition shadow-lg flex items-center gap-2" 
          disabled={loading}
        >
          ✂️ 사진 누끼 따기
        </button>

        {/* 스타일 메뉴 토글 버튼 */}
        <button 
          onClick={() => setShowStyleMenu(!showStyleMenu)} 
          className={`px-6 py-3 rounded-full font-bold transition shadow-lg flex items-center gap-2 ${showStyleMenu ? 'bg-purple-500 text-white ring-2 ring-purple-300' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
          disabled={loading}
        >
          🎨 AI 화풍 변환 {showStyleMenu ? '▲' : '▼'}
        </button>

        <button 
          onClick={onDownload} 
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full font-bold hover:from-pink-600 hover:to-orange-600 transition shadow-lg animate-pulse flex items-center gap-2"
        >
          💾 완성본 저장!
        </button>
      </div>
    </div>
  );
}