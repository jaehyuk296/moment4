"use client";

import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric"; 
import { removeBackground } from "@imgly/background-removal";

// 분리한 컴포넌트 및 상수 불러오기
import { LAYOUTS, THEMES, IMG_WIDTH, IMG_HEIGHT, GAP, PADDING, HEADER_HEIGHT, CustomFabricImage } from "./editor/constants";
import TopToolbar from "./editor/TopToolbar";
import BottomToolbar from "./editor/BottomToolbar";
import StickerSidebar from "./editor/StickerSidebar";

interface PhotoEditorProps {
  photos: string[];
  onBack: () => void;
}

export default function PhotoEditor({ photos, onBack }: PhotoEditorProps) {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'vertical'>('grid');
  const [themeIndex, setThemeIndex] = useState(0);
  const [isStickerBarOpen, setIsStickerBarOpen] = useState(true);
  
  const layoutRef = useRef(layoutMode);
  const loadedImagesRef = useRef<(CustomFabricImage | null)[]>([null, null, null, null]);
  const titleObjectRef = useRef<fabric.Text | null>(null);

  useEffect(() => {
    layoutRef.current = layoutMode;
  }, [layoutMode]);

  // 1. 캔버스 초기화
  useEffect(() => {
    if (!canvasEl.current || fabricCanvas.current) return;

    console.log("Canvas Initializing...");
    const canvas = new fabric.Canvas(canvasEl.current, {
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });
    fabricCanvas.current = canvas;

    // 사진 교체(Swap) 로직
    canvas.on('object:modified', (e) => {
      const targetImg = e.target as CustomFabricImage;
      if (!targetImg || targetImg.slotIndex === undefined) return;

      const currentLayout = LAYOUTS[layoutRef.current];
      const dropCenter = targetImg.getCenterPoint();
      
      let newSlotIndex = -1;
      currentLayout.positions.forEach((pos, index) => {
        if (
          dropCenter.x >= pos.left - GAP/2 && dropCenter.x < pos.left + IMG_WIDTH + GAP/2 &&
          dropCenter.y >= pos.top - GAP/2 && dropCenter.y < pos.top + IMG_HEIGHT + GAP/2
        ) {
          newSlotIndex = index;
        }
      });

      if (newSlotIndex !== -1 && newSlotIndex !== targetImg.slotIndex) {
        const oldSlotIndex = targetImg.slotIndex;
        const otherImg = loadedImagesRef.current[newSlotIndex];

        if (otherImg) {
          const oldPos = currentLayout.positions[oldSlotIndex];
          otherImg.set({ left: oldPos.left, top: oldPos.top });
          otherImg.setCoords();
          otherImg.slotIndex = oldSlotIndex;
          loadedImagesRef.current[oldSlotIndex] = otherImg;
        }

        const newPos = currentLayout.positions[newSlotIndex];
        targetImg.set({ left: newPos.left, top: newPos.top });
        targetImg.setCoords();
        targetImg.slotIndex = newSlotIndex;
        loadedImagesRef.current[newSlotIndex] = targetImg;
      } else {
        const oldPos = currentLayout.positions[targetImg.slotIndex];
        targetImg.set({ left: oldPos.left, top: oldPos.top });
        targetImg.setCoords();
      }
      canvas.renderAll();
    });

    // Delete 키 이벤트
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fabricCanvas.current) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObj = fabricCanvas.current.getActiveObject() as CustomFabricImage;
        if (activeObj && activeObj.slotIndex === undefined) {
          fabricCanvas.current.remove(activeObj);
          fabricCanvas.current.discardActiveObject();
          fabricCanvas.current.renderAll();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      const canvasInstance = fabricCanvas.current;
      fabricCanvas.current = null;
      if (canvasInstance) {
        canvasInstance.dispose();
      }
    };
  }, []);

  // 2. 레이아웃/테마 변경 시 업데이트
  useEffect(() => {
    let isMounted = true;
    if (!fabricCanvas.current) return;
    
    setLoading(true);
    const canvas = fabricCanvas.current;
    const currentLayout = LAYOUTS[layoutMode];
    const currentTheme = THEMES[themeIndex];

    canvas.setDimensions({ width: currentLayout.canvasWidth, height: currentLayout.canvasHeight });
    canvas.setBackgroundColor(currentTheme.bg, canvas.renderAll.bind(canvas));

    if (titleObjectRef.current) canvas.remove(titleObjectRef.current);

    const titleText = new fabric.Text("MOMENT4", {
      left: currentLayout.canvasWidth / 2,
      top: PADDING + (HEADER_HEIGHT / 2),
      fontFamily: 'sans-serif',
      fontSize: 40,
      fontWeight: 'bold',
      fill: currentTheme.text,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });
    canvas.add(titleText);
    titleObjectRef.current = titleText;
    titleText.sendToBack();

    const updatePhotos = async () => {
      const promises = photos.map((photoSrc, i) => {
        if (i >= 4) return Promise.resolve();

        if (loadedImagesRef.current[i]) {
          const img = loadedImagesRef.current[i]!;
          if (!isMounted || !fabricCanvas.current) return Promise.resolve();
          
          const pos = currentLayout.positions[img.slotIndex!];
          img.set({ left: pos.left, top: pos.top });
          img.setCoords();
          img.sendToBack(); 
          if (titleObjectRef.current) titleObjectRef.current.sendToBack(); 
          return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
          fabric.Image.fromURL(photoSrc, (img) => {
            if (!isMounted || !img || !fabricCanvas.current) { resolve(); return; }
            
            const customImg = img as CustomFabricImage;
            customImg.scaleToWidth(IMG_WIDTH);
            customImg.set({
              left: currentLayout.positions[i].left,
              top: currentLayout.positions[i].top,
              selectable: true,
              hasControls: false,
              hasBorders: true,
              borderColor: currentTheme.text,
              borderScaleFactor: 3,
            });
            customImg.slotIndex = i;
            
            if (fabricCanvas.current) {
              canvas.add(customImg);
              loadedImagesRef.current[i] = customImg;
              customImg.sendToBack(); 
              if (titleObjectRef.current) titleObjectRef.current.sendToBack(); 
            }
            resolve();
          });
        });
      });

      await Promise.all(promises);

      if (isMounted && fabricCanvas.current) {
        canvas.renderAll();
        setLoading(false);
      }
    };

    updatePhotos();

    return () => { isMounted = false; };
  }, [layoutMode, photos, themeIndex]); 

  // 기능 함수들
  const addSticker = (stickerUrl: string) => {
    if (!fabricCanvas.current) return;
    const canvas = fabricCanvas.current;
    const currentLayout = LAYOUTS[layoutMode];

    // [수정됨] 두 번째 인자로 옵션 객체를 전달하여 CORS 문제를 해결합니다.
    fabric.Image.fromURL(stickerUrl, (img) => {
        if (!img) return;
        
        img.set({
            left: currentLayout.canvasWidth / 2,
            top: currentLayout.canvasHeight / 2,
            originX: 'center', originY: 'center',
            // 이모지는 해상도가 높을 수 있어서 초기 크기를 좀 작게 잡습니다.
            scaleX: 0.2, scaleY: 0.2, 
            hasControls: true, hasBorders: true,
            borderColor: '#2dd4bf', cornerColor: '#2dd4bf',
            cornerSize: 12, transparentCorners: false,
        });
        
        canvas.add(img);
        img.bringToFront();
        canvas.setActiveObject(img);
        canvas.renderAll();
    }, { crossOrigin: 'anonymous' }); // <--- 여기! 이 옵션이 꼭 있어야 합니다.
  };

  const handleRemoveBg = async () => {
    const activeObj = fabricCanvas.current?.getActiveObject() as CustomFabricImage;
    if (!activeObj || activeObj.type !== 'image' || activeObj.slotIndex === undefined) {
      alert("배경을 지울 메인 사진을 선택해주세요!");
      return;
    }
    setLoading(true);
    try {
      const blob = await removeBackground(activeObj.getSrc());
      const url = URL.createObjectURL(blob);
      fabric.Image.fromURL(url, (newImg) => {
        if (!fabricCanvas.current) return;
        const currentTheme = THEMES[themeIndex];
        const customNewImg = newImg as CustomFabricImage;
        customNewImg.set({
          left: activeObj.left, top: activeObj.top,
          scaleX: activeObj.scaleX, scaleY: activeObj.scaleY,
          hasControls: false, hasBorders: true,
          borderColor: currentTheme.text, borderScaleFactor: 3,
        });
        customNewImg.slotIndex = activeObj.slotIndex;
        if (activeObj.slotIndex !== undefined) {
          fabricCanvas.current.remove(activeObj);
          fabricCanvas.current.add(customNewImg);
          fabricCanvas.current.setActiveObject(customNewImg);
          loadedImagesRef.current[activeObj.slotIndex] = customNewImg;
          customNewImg.sendToBack();
          if (titleObjectRef.current) titleObjectRef.current.sendToBack();
          fabricCanvas.current.renderAll();
        }
        setLoading(false);
      });
    } catch (e) { console.error(e); setLoading(false); }
  };

  const handleDownload = () => {
    if (!fabricCanvas.current) return;
    fabricCanvas.current.discardActiveObject();
    fabricCanvas.current.renderAll();
    const dataURL = fabricCanvas.current.toDataURL({ format: "png", quality: 1.0, multiplier: 1 });
    const link = document.createElement("a");
    link.download = `moment4-${layoutMode}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <div className={`flex-1 flex flex-col items-center p-8 transition-all ${isStickerBarOpen ? 'mr-64' : ''}`}>
        
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
          onBack={onBack}
          onRemoveBg={handleRemoveBg}
          onDownload={handleDownload}
          loading={loading}
        />
      </div>

      {/* 우측 스티커 사이드바 */}
      <StickerSidebar 
        isOpen={isStickerBarOpen} 
        onAddSticker={addSticker} 
      />
    </div>
  );
}