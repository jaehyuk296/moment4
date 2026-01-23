"use client";

import { useState } from "react";
import HelpSidebar from "./editor/HelpSidebar";
import TopToolbar from "./editor/TopToolbar";
import BottomToolbar from "./editor/BottomToolbar";
import StickerSidebar from "./editor/StickerSidebar";
import { THEMES } from "./editor/constants";
import { PhotoEditorProps } from "./editor/types";
import usePhotoEditor from "@/hooks/usePhotoEditor"; 

export default function PhotoEditor({ photos, onBack }: PhotoEditorProps) {
  // UI 상태 관리
  const [layoutMode, setLayoutMode] = useState<'grid' | 'vertical'>('grid');
  const [themeIndex, setThemeIndex] = useState(0);
  const [isStickerBarOpen, setIsStickerBarOpen] = useState(true);

  // 커스텀 훅 사용
  const {
    canvasEl,
    loading,
    handleAddText,
    addSticker,
    handleRemoveBg,
    handleApplyStyle,
    handleDownload,
    handleMirror // 👈 [중요] 여기서 꺼내와야 쓸 수 있어!
  } = usePhotoEditor({ photos, layoutMode, themeIndex });

  return (
    <div className="flex min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* 1. 도움말 사이드바 */}
      <HelpSidebar />

      {/* 2. 메인 에디터 영역 */}
      <div className={`flex-1 flex flex-col items-center p-8 transition-all duration-300 ${isStickerBarOpen ? 'mr-64' : ''}`}>
        
        {/* 상단 툴바 */}
        <TopToolbar 
          layoutMode={layoutMode} 
          setLayoutMode={setLayoutMode}
          themeIndex={themeIndex} 
          onCycleTheme={() => setThemeIndex((prev) => (prev + 1) % THEMES.length)}
          isStickerBarOpen={isStickerBarOpen} 
          setIsStickerBarOpen={setIsStickerBarOpen}
        />

        {/* 캔버스 영역 */}
        <div className="relative rounded-sm overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]" style={{ backgroundColor: THEMES[themeIndex].bg }}>
          <canvas ref={canvasEl} />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50 text-xl font-bold backdrop-blur-sm">
              로딩 중... ⏳
            </div>
          )}
        </div>

        {/* 하단 툴바 */}
        <BottomToolbar
          onBack={onBack} // 👈 'resetPhotos' 대신 props로 받은 'onBack' 사용
          onRemoveBg={handleRemoveBg}
          onDownload={handleDownload}
          onApplyStyle={handleApplyStyle}
          onMirror={handleMirror} // 👈 훅에서 꺼낸 함수 전달 완료!
          loading={loading}
        />
      </div>

      {/* 3. 스티커 사이드바 */}
      <StickerSidebar 
        isOpen={isStickerBarOpen} 
        onAddSticker={addSticker} 
        onAddText={handleAddText}
      />
    </div>
  );
}