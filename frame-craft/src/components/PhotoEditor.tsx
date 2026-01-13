"use client";

import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric"; 
import { removeBackground } from "@imgly/background-removal";
import HelpSidebar from "./editor/HelpSidebar";

// 분리한 컴포넌트 및 상수 불러오기
import { LAYOUTS, THEMES, STYLE_FILTERS, IMG_WIDTH, IMG_HEIGHT, GAP, PADDING, HEADER_HEIGHT, CustomFabricImage } from "./editor/constants";
import TopToolbar from "./editor/TopToolbar";
import BottomToolbar from "./editor/BottomToolbar";
import StickerSidebar from "./editor/StickerSidebar";

// [New] 커스텀 이미지 인터페이스에 'originalSrc' 추가 (복구용)
interface EnhancedFabricImage extends CustomFabricImage {
  originalSrc?: string; // 배경 제거 전 원본 이미지 경로 저장
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
  const [themeIndex, setThemeIndex] = useState(0);
  const [isStickerBarOpen, setIsStickerBarOpen] = useState(true);
  
  const layoutRef = useRef(layoutMode);
  const loadedImagesRef = useRef<(EnhancedFabricImage | null)[]>([null, null, null, null]);
  const titleObjectRef = useRef<fabric.Text | null>(null);

  const handleAddText = ({ text, color, font }: { text: string, color: string, font: string }) => {
    if (!fabricCanvas.current || !text.trim()) return;

    // Fabric의 IText(Interactive Text) 객체 생성
    // IText는 사용자가 더블 클릭해서 내용을 수정할 수도 있습니다.
    const textTextbox = new fabric.IText(text, {
      left: IMG_WIDTH / 2, // 대략 중앙 쯤에 배치
      top: IMG_HEIGHT / 2,
      fontFamily: font || 'Pretendard, sans-serif', // 기본 폰트 (프로젝트에 적용된 폰트 사용)
      fill: color || '#000000',     // 기본 글자색 (검정)
      fontSize: 40,        // 기본 글자 크기
      fontWeight: 'bold',  // 약간 두껍게
      // 그림자 효과로 가독성 높이기 (선택 사항)
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.3)',
        blur: 5,
        offsetX: 2,
        offsetY: 2
      }),
      // 객체 조작 제어판 설정 (기존 스티커와 동일하게)
      borderColor: '#2563eb',
      cornerColor: '#2563eb',
      cornerSize: 12,
      transparentCorners: false,
    });

    // 캔버스에 추가
    fabricCanvas.current.add(textTextbox);
    // 추가된 텍스트를 바로 선택 상태로 만듦 (바로 이동 가능하게)
    fabricCanvas.current.setActiveObject(textTextbox);
    // 캔버스 다시 그리기
    fabricCanvas.current.requestRenderAll();
  };

  useEffect(() => { layoutRef.current = layoutMode; }, [layoutMode]);

  // ==========================================
  // [1] 캔버스 초기화 & X 버튼(삭제 컨트롤) 설정
  // ==========================================
  useEffect(() => {
    if (!canvasEl.current || fabricCanvas.current) return;

    console.log("Canvas Initializing...");
    const canvas = new fabric.Canvas(canvasEl.current, {
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });
    fabricCanvas.current = canvas;

    // ---------------------------------------------
    // [New] 커스텀 삭제 버튼(X) 만들기
    // ---------------------------------------------
    const deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

    const deleteImg = document.createElement('img');
    deleteImg.src = deleteIcon;

    // 삭제 렌더링 함수
    function renderIcon(ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: any) {
      const size = 24;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(deleteImg, -size / 2, -size / 2, size, size);
      ctx.restore();
    }

    // 삭제 동작 함수
    function deleteObject(eventData: any, transform: any) {
      const target = transform.target;
      const canvas = target.canvas;
      // 메인 사진(slotIndex가 있음)은 삭제 불가, 스티커만 삭제
      if (target.slotIndex === undefined) {
          canvas.remove(target);
          canvas.requestRenderAll();
      }
      return true;
    }

    // Fabric 객체 프로토타입에 'deleteControl' 추가
    fabric.Object.prototype.controls.deleteControl = new fabric.Control({
      x: 0.5, // 오른쪽
      y: -0.5, // 위쪽
      offsetY: 16,
      offsetX: 16,
      cursorStyle: 'pointer',
      // @ts-ignore (Fabric 타입 정의 충돌 방지)
      mouseUpHandler: deleteObject,
      render: renderIcon
    });
    // ---------------------------------------------


    // 사진 교체(Swap) 로직 (기존 유지)
    canvas.on('object:modified', (e) => {
      const targetImg = e.target as EnhancedFabricImage;
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

    // Delete 키 이벤트 (기존 유지)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fabricCanvas.current) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObj = fabricCanvas.current.getActiveObject() as EnhancedFabricImage;
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
      if (canvasInstance) canvasInstance.dispose();
    };
  }, []);

  // [2] 레이아웃/테마 변경 (기존 유지)
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
      fontFamily: 'sans-serif', fontSize: 40, fontWeight: 'bold', fill: currentTheme.text,
      originX: 'center', originY: 'center', selectable: false, evented: false,
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
            const customImg = img as EnhancedFabricImage;
            customImg.scaleToWidth(IMG_WIDTH);
            customImg.set({
              left: currentLayout.positions[i].left,
              top: currentLayout.positions[i].top,
              selectable: true, hasControls: false, hasBorders: true,
              borderColor: currentTheme.text, borderScaleFactor: 3,
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
      if (isMounted && fabricCanvas.current) { canvas.renderAll(); setLoading(false); }
    };
    updatePhotos();
    return () => { isMounted = false; };
  }, [layoutMode, photos, themeIndex]); 


  // [기능 1] 스티커 추가
  const addSticker = (stickerUrl: string) => {
    if (!fabricCanvas.current) return;
    const canvas = fabricCanvas.current;
    const currentLayout = LAYOUTS[layoutMode];

    fabric.Image.fromURL(stickerUrl, (img) => {
        if (!img) return;
        img.set({
            left: currentLayout.canvasWidth / 2,
            top: currentLayout.canvasHeight / 2,
            originX: 'center', originY: 'center',
            scaleX: 0.2, scaleY: 0.2, 
            hasControls: true, // 스티커는 컨트롤(X버튼 포함) 활성화
            hasBorders: true,
            borderColor: '#2dd4bf', cornerColor: '#2dd4bf',
            cornerSize: 12, transparentCorners: false,
        });
        canvas.add(img);
        img.bringToFront();
        canvas.setActiveObject(img);
        canvas.renderAll();
    }, { crossOrigin: 'anonymous' }); 
  };


  // [기능 2] 배경 제거 및 복구 (누끼 취소 기능 통합)
  const handleRemoveBg = async () => {
    const activeObj = fabricCanvas.current?.getActiveObject() as EnhancedFabricImage;
    if (!activeObj || activeObj.type !== 'image') {
      alert("배경을 지울 사진이나 스티커를 선택해주세요!");
      return;
    }
    setLoading(true);

    try {
      // 1. 이미 누끼가 따진 상태(원본이 저장됨)라면 -> 원본 복구 실행
      if (activeObj.originalSrc) {
        fabric.Image.fromURL(activeObj.originalSrc, (restoredImg) => {
           if (!fabricCanvas.current) return;
           const newImg = restoredImg as EnhancedFabricImage;

           // 기존 속성 복구
           newImg.set({
             left: activeObj.left, top: activeObj.top,
             scaleX: activeObj.scaleX, scaleY: activeObj.scaleY,
             angle: activeObj.angle,
             hasControls: activeObj.hasControls, 
             hasBorders: activeObj.hasBorders,
             borderColor: activeObj.borderColor,
             borderScaleFactor: activeObj.borderScaleFactor,
           });
           
           newImg.slotIndex = activeObj.slotIndex;
           // originalSrc는 제거 (이제 원본 상태이므로)
           delete newImg.originalSrc;

           fabricCanvas.current.remove(activeObj);
           fabricCanvas.current.add(newImg);
           fabricCanvas.current.setActiveObject(newImg);

           if (activeObj.slotIndex !== undefined) {
             loadedImagesRef.current[activeObj.slotIndex] = newImg;
             newImg.sendToBack();
             if (titleObjectRef.current) titleObjectRef.current.sendToBack();
           } else {
             newImg.bringToFront();
           }
           fabricCanvas.current.renderAll();
           setLoading(false);
           alert("원본 이미지로 복구되었습니다! 🔄");
        }, { crossOrigin: 'anonymous' });
        return; // 복구 후 함수 종료
      }

      // 2. 누끼 따기 실행 (원본 저장 후 진행)
      const originalSource = activeObj.getSrc(); // 현재 상태(원본) 저장

      const blob = await removeBackground(originalSource);
      const url = URL.createObjectURL(blob);

      fabric.Image.fromURL(url, (newImg) => {
        if (!fabricCanvas.current) return;
        const currentTheme = THEMES[themeIndex];
        const customNewImg = newImg as EnhancedFabricImage;

        customNewImg.set({
          left: activeObj.left, top: activeObj.top,
          scaleX: activeObj.scaleX, scaleY: activeObj.scaleY,
          angle: activeObj.angle,
          hasControls: activeObj.hasControls,
          hasBorders: activeObj.hasBorders,
          borderColor: activeObj.borderColor || currentTheme.text,
          borderScaleFactor: activeObj.borderScaleFactor,
          cornerColor: activeObj.cornerColor,
          cornerSize: activeObj.cornerSize,
          transparentCorners: activeObj.transparentCorners,
        });
        
        customNewImg.slotIndex = activeObj.slotIndex;
        // [중요] 원본 소스를 새 이미지 객체에 저장해둠
        customNewImg.originalSrc = originalSource; 

        fabricCanvas.current.remove(activeObj);
        fabricCanvas.current.add(customNewImg);
        fabricCanvas.current.setActiveObject(customNewImg);

        if (activeObj.slotIndex !== undefined) {
          loadedImagesRef.current[activeObj.slotIndex] = customNewImg;
          customNewImg.sendToBack();
          if (titleObjectRef.current) titleObjectRef.current.sendToBack();
        } else {
          customNewImg.bringToFront();
        }
        
        fabricCanvas.current.renderAll();
        setLoading(false);
      });
    } catch (e) { console.error(e); setLoading(false); alert("작업 실패: " + e); }
  };


  // [기능 3] AI 스타일 (스케치북 기능 추가됨)
  const handleApplyStyle = (styleId: string) => {
    const activeObj = fabricCanvas.current?.getActiveObject() as CustomFabricImage;
    if (!activeObj || activeObj.type !== 'image') {
      alert("효과를 적용할 사진을 선택해주세요!");
      return;
    }

    // 1. 원본 복구
    if (styleId === 'original') {
      activeObj.filters = [];
      activeObj.applyFilters();
      fabricCanvas.current?.renderAll();
      return;
    }

    // 2. 선택한 스타일 찾기 및 적용
    const selectedStyle = STYLE_FILTERS.find(s => s.id === styleId);
    if (selectedStyle) {
      // [중요] 현재 테마의 배경색을 두 번째 인자로 전달합니다!
      const currentThemeBgColor = THEMES[themeIndex].bg;
      
      // 스타일 적용 함수 호출 (배경색 전달)
      selectedStyle.apply(activeObj, currentThemeBgColor);
      
      activeObj.applyFilters();
      fabricCanvas.current?.renderAll();
    }
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

  return (<div className="flex min-h-screen bg-gray-900 text-white relative overflow-hidden">
      
      {/* [New] 왼쪽에 설명서 추가 */}
      <HelpSidebar />

      {/* 기존 메인 영역 (가운데 정렬 유지를 위해 flex-1 등은 유지하되, 설명서가 덮는 구조) */}
      <div className={`flex-1 flex flex-col items-center p-8 transition-all duration-300 ${isStickerBarOpen ? 'mr-64' : ''}`}>
        <TopToolbar 
          layoutMode={layoutMode} setLayoutMode={setLayoutMode}
          themeIndex={themeIndex} onCycleTheme={() => setThemeIndex((prev) => (prev + 1) % THEMES.length)}
          isStickerBarOpen={isStickerBarOpen} setIsStickerBarOpen={setIsStickerBarOpen}
        />

        <div className="relative rounded-sm overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]" style={{ backgroundColor: THEMES[themeIndex].bg }}>
          <canvas ref={canvasEl} />
          {loading && <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50 text-xl font-bold backdrop-blur-sm">로딩 중... ⏳</div>}
        </div>

        <BottomToolbar 
          onBack={onBack}
          onRemoveBg={handleRemoveBg}
          onDownload={handleDownload}
          onApplyStyle={handleApplyStyle} 
          loading={loading}
        />
      </div>

      <StickerSidebar isOpen={isStickerBarOpen} onAddSticker={addSticker} onAddText={handleAddText}/>
    </div>
  );
}