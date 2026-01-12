"use client";

import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric"; 
import { removeBackground } from "@imgly/background-removal";

// ==========================================
// [상수 및 설정 정의]
// ==========================================

// 사진 한 장의 기본 크기
const IMG_WIDTH = 400;
const IMG_HEIGHT = 300;

// 프레임 여백 설정
const HEADER_HEIGHT = 70; // 상단 타이틀 영역 높이
const PADDING = 25;       // 외곽 테두리 두께
const GAP = 15;           // 사진 사이 간격

// 사용할 테마 색상 리스트 (배경색, 텍스트색)
const THEMES = [
  { name: '🖤 시크 블랙', bg: '#1a1a1a', text: '#ffffff' },
  { name: '🤍 심플 화이트', bg: '#f0f0f0', text: '#1a1a1a' },
  { name: '💖 러블리 핑크', bg: '#fce7f3', text: '#db2777' },
  { name: '💜 몽환 퍼플', bg: '#ede9fe', text: '#7c3aed' },
  { name: '💙 쿨 블루', bg: '#e0f2fe', text: '#0284c7' },
];

// [레이아웃 설정] - 여백 상수를 활용하여 동적으로 계산
const startX = PADDING;
const startY = PADDING + HEADER_HEIGHT;

const LAYOUTS = {
  grid: {
    // 전체 캔버스 크기 계산: 여백 + 사진크기 + 간격
    canvasWidth: PADDING * 2 + IMG_WIDTH * 2 + GAP,
    canvasHeight: PADDING * 2 + HEADER_HEIGHT + IMG_HEIGHT * 2 + GAP,
    positions: [
      { left: startX, top: startY },
      { left: startX + IMG_WIDTH + GAP, top: startY },
      { left: startX, top: startY + IMG_HEIGHT + GAP },
      { left: startX + IMG_WIDTH + GAP, top: startY + IMG_HEIGHT + GAP },
    ],
  },
  vertical: {
    canvasWidth: PADDING * 2 + IMG_WIDTH,
    canvasHeight: PADDING * 2 + HEADER_HEIGHT + IMG_HEIGHT * 4 + GAP * 3,
    positions: [
      { left: startX, top: startY },
      { left: startX, top: startY + IMG_HEIGHT + GAP },
      { left: startX, top: startY + IMG_HEIGHT * 2 + GAP * 2 },
      { left: startX, top: startY + IMG_HEIGHT * 3 + GAP * 3 },
    ],
  },
};

// 커스텀 이미지 인터페이스
interface CustomFabricImage extends fabric.Image {
  slotIndex?: number;
}

interface PhotoEditorProps {
  photos: string[];
  onBack: () => void;
}

export default function PhotoEditor({ photos, onBack }: PhotoEditorProps) {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'vertical'>('grid');
  // [추가] 현재 선택된 테마 인덱스
  const [themeIndex, setThemeIndex] = useState(0);
  
  const layoutRef = useRef(layoutMode);
  const loadedImagesRef = useRef<(CustomFabricImage | null)[]>([null, null, null, null]);
  // [추가] 타이틀 텍스트 객체를 추적하기 위한 ref
  const titleObjectRef = useRef<fabric.Text | null>(null);

  // 최신 state 참조를 위한 ref 업데이트
  useEffect(() => {
    layoutRef.current = layoutMode;
  }, [layoutMode]);

  // ==========================================
  // 1. 캔버스 초기화 (마운트 시 1회)
  // ==========================================
  useEffect(() => {
    if (!canvasEl.current || fabricCanvas.current) return;

    console.log("Canvas Initializing...");
    const canvas = new fabric.Canvas(canvasEl.current, {
      // 초기 배경색은 테마에 따라 설정될 것이므로 일단 흰색
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      selection: false,
    });
    fabricCanvas.current = canvas;

    // 드래그 앤 드롭 (Swap) 로직 (기존과 동일)
    canvas.on('object:modified', (e) => {
      const targetImg = e.target as CustomFabricImage;
      if (!targetImg || targetImg.slotIndex === undefined) return;

      const currentLayout = LAYOUTS[layoutRef.current];
      const dropCenter = targetImg.getCenterPoint();
      
      let newSlotIndex = -1;
      currentLayout.positions.forEach((pos, index) => {
        // 여백을 고려하여 히트박스 계산 (약간 여유 있게)
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

    return () => {
      console.log("Canvas Disposing...");
      const canvasInstance = fabricCanvas.current;
      fabricCanvas.current = null;
      if (canvasInstance) {
        canvasInstance.dispose();
      }
    };
  }, []);

  // ==========================================
  // 2. 레이아웃/테마 변경 시 장식 요소 및 사진 위치 업데이트
  // ==========================================
  useEffect(() => {
    let isMounted = true;
    if (!fabricCanvas.current) return;
    
    setLoading(true);
    const canvas = fabricCanvas.current;
    const currentLayout = LAYOUTS[layoutMode];
    const currentTheme = THEMES[themeIndex];

    // 2-1. 캔버스 크기 및 배경색 업데이트
    canvas.setDimensions({ width: currentLayout.canvasWidth, height: currentLayout.canvasHeight });
    canvas.setBackgroundColor(currentTheme.bg, canvas.renderAll.bind(canvas));

    // 2-2. 타이틀 그리기 (기존 타이틀 제거 후 새로 생성)
    if (titleObjectRef.current) {
      canvas.remove(titleObjectRef.current);
    }

    const titleText = new fabric.Text("MOMENT4", {
      left: currentLayout.canvasWidth / 2, // 가운데 정렬을 위해 중심점 기준
      top: PADDING + (HEADER_HEIGHT / 2),
      fontFamily: 'sans-serif',
      fontSize: 40,
      fontWeight: 'bold',
      fill: currentTheme.text,
      originX: 'center',
      originY: 'center',
      selectable: false, // 타이틀은 선택 불가
      evented: false,
    });
    canvas.add(titleText);
    titleObjectRef.current = titleText;
    // 타이틀을 맨 뒤로 보내서 사진이 그 위로 올라오게 함 (배경 바로 앞)
    titleText.sendToBack();


    // 2-3. 사진 위치 업데이트 및 로드
    const updatePhotos = async () => {
      const promises = photos.map((photoSrc, i) => {
        if (i >= 4) return Promise.resolve();

        // 이미 로드된 사진 위치 이동
        if (loadedImagesRef.current[i]) {
          const img = loadedImagesRef.current[i]!;
          if (!isMounted || !fabricCanvas.current) return Promise.resolve();
          
          const pos = currentLayout.positions[img.slotIndex!];
          img.set({ left: pos.left, top: pos.top });
          img.setCoords();
          // 사진을 맨 앞으로 가져옴 (타이틀이나 배경에 가려지지 않게)
          img.bringToFront();
          return Promise.resolve();
        }

        // 새 사진 로드
        return new Promise<void>((resolve) => {
          fabric.Image.fromURL(photoSrc, (img) => {
            if (!isMounted || !img || !fabricCanvas.current) { 
              resolve(); return; 
            }
            
            const customImg = img as CustomFabricImage;
            customImg.scaleToWidth(IMG_WIDTH);
            customImg.set({
              left: currentLayout.positions[i].left,
              top: currentLayout.positions[i].top,
              selectable: true,
              hasControls: false,
              hasBorders: true,
              borderColor: currentTheme.text, // 테두리색도 테마에 맞춤
              borderScaleFactor: 3,
            });
            customImg.slotIndex = i;
            
            if (fabricCanvas.current) {
              canvas.add(customImg);
              loadedImagesRef.current[i] = customImg;
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
  // 테마(themeIndex)가 바뀌어도 이 useEffect가 실행되어야 함
  }, [layoutMode, photos, themeIndex]); 

  // ==========================================
  // 기능 함수들 (배경 제거, 다운로드)
  // ==========================================
  const handleRemoveBg = async () => {
    // (기존 코드와 동일하여 생략 없이 유지)
    const activeObj = fabricCanvas.current?.getActiveObject() as CustomFabricImage;
    if (!activeObj || activeObj.type !== 'image') {
      alert("배경을 지울 사진을 클릭해서 선택해주세요!");
      return;
    }

    setLoading(true);
    try {
      const imageSrc = activeObj.getSrc();
      const blob = await removeBackground(imageSrc);
      const url = URL.createObjectURL(blob);

      fabric.Image.fromURL(url, (newImg) => {
        if (!fabricCanvas.current) return;
        const currentTheme = THEMES[themeIndex];
        const customNewImg = newImg as CustomFabricImage;
        customNewImg.set({
          left: activeObj.left, top: activeObj.top,
          scaleX: activeObj.scaleX, scaleY: activeObj.scaleY,
          hasControls: false, hasBorders: true,
          borderColor: currentTheme.text, // 테마색 적용
          borderScaleFactor: 3,
        });
        customNewImg.slotIndex = activeObj.slotIndex;

        if (activeObj.slotIndex !== undefined) {
          fabricCanvas.current.remove(activeObj);
          fabricCanvas.current.add(customNewImg);
          fabricCanvas.current.setActiveObject(customNewImg);
          loadedImagesRef.current[activeObj.slotIndex] = customNewImg;
          fabricCanvas.current.renderAll();
        }
        setLoading(false);
      });
    } catch (error) {
      console.error("Background removal failed:", error);
      alert("배경 제거에 실패했습니다.");
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!fabricCanvas.current) return;
    // 선택 테두리 제거 후 저장
    fabricCanvas.current.discardActiveObject();
    fabricCanvas.current.renderAll();

    // 캔버스 전체를 이미지로 변환 (배경, 타이틀 포함)
    const dataURL = fabricCanvas.current.toDataURL({
      format: "png",
      quality: 1.0,
      multiplier: 1, // 필요시 해상도 높임 (예: 2)
    });

    const link = document.createElement("a");
    link.download = `moment4-${layoutMode}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 테마 변경 핸들러
  const cycleTheme = () => {
    setThemeIndex((prev) => (prev + 1) % THEMES.length);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-8">
      {/* 상단 컨트롤 패널 */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8 bg-gray-800/50 p-4 rounded-2xl backdrop-blur-sm">
        <h1 className="text-3xl text-white font-bold tracking-wider">🎨 프레임 꾸미기</h1>
        
        <div className="flex gap-4">
          {/* 레이아웃 선택 버튼 */}
          <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`px-4 py-2 rounded-md font-bold transition flex items-center gap-2 ${layoutMode === 'grid' ? 'bg-pink-500 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              <span className="text-xl">田</span> 2x2 격자
            </button>
            <button
              onClick={() => setLayoutMode('vertical')}
              className={`px-4 py-2 rounded-md font-bold transition flex items-center gap-2 ${layoutMode === 'vertical' ? 'bg-pink-500 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              <span className="text-xl">目</span> 4컷 세로
            </button>
          </div>

          {/* 테마 변경 버튼 */}
          <button
            onClick={cycleTheme}
            className="px-4 py-2 rounded-lg font-bold transition bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:from-purple-600 hover:to-pink-600 flex items-center gap-2"
            style={{ backgroundColor: THEMES[themeIndex].bg, color: THEMES[themeIndex].text === '#ffffff' ? '#ffffff' : '#000000' }}
          >
            <span>🎨</span> 테마 변경: {THEMES[themeIndex].name}
          </button>
        </div>
      </div>

      {/* 캔버스 영역 */}
      {/* 캔버스 주위에 실제 액자 같은 그림자 효과 추가 */}
      <div className="relative rounded-sm overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]" style={{ backgroundColor: THEMES[themeIndex].bg }}>
        <canvas ref={canvasEl} />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50 text-white text-xl font-bold backdrop-blur-sm">
            프레임 제작 중... ⏳
          </div>
        )}
      </div>

      {/* 하단 버튼들 */}
      <div className="flex gap-4 mt-8">
        <button onClick={onBack} className="px-6 py-3 bg-gray-700 text-white rounded-full font-bold hover:bg-gray-600 transition flex items-center gap-2">
          ↩️ 다시 찍기
        </button>
        <button onClick={handleRemoveBg} className="px-6 py-3 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition shadow-lg flex items-center gap-2" disabled={loading}>
          ✂️ 누끼 따기
        </button>
        <button onClick={handleDownload} className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full font-bold hover:from-pink-600 hover:to-orange-600 transition shadow-lg animate-pulse flex items-center gap-2">
          💾 완성본 저장!
        </button>
      </div>
    </div>
  );
}