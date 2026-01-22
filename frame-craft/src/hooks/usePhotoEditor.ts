import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";

// 1. 필요한 상수 및 타입 가져오기
import { 
  LAYOUTS, THEMES, STYLE_FILTERS, IMG_WIDTH, IMG_HEIGHT, GAP, PADDING, HEADER_HEIGHT, CustomFabricImage 
} from "@/components/editor/constants";    

import { EnhancedFabricImage } from "@/components/editor/types";

interface UsePhotoEditorProps {
  photos: string[];
  layoutMode: 'grid' | 'vertical';
  themeIndex: number;
}

export default function usePhotoEditor({ photos, layoutMode, themeIndex }: UsePhotoEditorProps) {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const layoutRef = useRef(layoutMode);
  const loadedImagesRef = useRef<(EnhancedFabricImage | null)[]>([null, null, null, null]);
  const titleObjectRef = useRef<fabric.Text | null>(null);

  const [loading, setLoading] = useState(true);
  const [segmenter, setSegmenter] = useState<any>(null);

  useEffect(() => { layoutRef.current = layoutMode; }, [layoutMode]);

  // ==========================================
  // [1] WebGPU AI 모델 로드 (SegFormer: 에러 없는 표준 모델)
  // ==========================================
  useEffect(() => {
    async function loadModel() {
      try {
        console.log("🚀 WebGPU AI 모델 로딩 중... (SegFormer Safe Mode)");
        
        const { pipeline, env } = await import('@xenova/transformers');
        env.allowLocalModels = false;
        env.useBrowserCache = true;

        // 가장 호환성이 좋은 표준 세그멘테이션 모델 사용
        const model = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
          device: 'webgpu',
        } as any);
        
        setSegmenter(() => model);
        console.log("✅ AI 모델 로드 완료!");
      } catch (e) {
        console.error("❌ AI 모델 로드 실패:", e);
      }
    }

    if (typeof window !== 'undefined') {
      loadModel();
    }
  }, []);

  // ==========================================
  // [2] 캔버스 초기화 (기존 유지)
  // ==========================================
  useEffect(() => {
    if (!canvasEl.current || fabricCanvas.current) return;
    const canvas = new fabric.Canvas(canvasEl.current, {
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });
    fabricCanvas.current = canvas;

    // 삭제 버튼 아이콘
    const deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";
    const deleteImg = document.createElement('img');
    deleteImg.src = deleteIcon;

    function renderIcon(ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: any) {
      const size = 24;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(deleteImg, -size / 2, -size / 2, size, size);
      ctx.restore();
    }

    function deleteObject(eventData: any, transform: any) {
      const target = transform.target;
      const canvas = target.canvas;
      if (target.slotIndex === undefined) { 
          canvas.remove(target);
          canvas.requestRenderAll();
      }
      return true;
    }

    fabric.Object.prototype.controls.deleteControl = new fabric.Control({
      x: 0.5, y: -0.5, offsetY: 16, offsetX: 16, cursorStyle: 'pointer',
      // @ts-ignore
      mouseUpHandler: deleteObject,
      render: renderIcon
    });

    // 사진 교체 로직
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
        ) { newSlotIndex = index; }
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

    // 키보드 이벤트
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

  // ==========================================
  // [3] 레이아웃/테마 변경 (기존 유지)
  // ==========================================
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

  // ==========================================
  // [4] 핸들러들
  // ==========================================
  const handleAddText = ({ text, color, font, isNeon }: { text: string, color: string, font: string, isNeon: boolean }) => {
    if (!fabricCanvas.current || !text.trim()) return;
    const shadowEffect = isNeon 
      ? new fabric.Shadow({ color: color, blur: 20, offsetX: 0, offsetY: 0 })
      : new fabric.Shadow({ color: 'rgba(0,0,0,0.3)', blur: 5, offsetX: 2, offsetY: 2 });
    const textTextbox = new fabric.IText(text, {
      left: IMG_WIDTH / 2, top: IMG_HEIGHT / 2,
      fontFamily: font || 'Pretendard, sans-serif',
      fill: color || '#000000', fontSize: 50, fontWeight: 'bold',
      shadow: shadowEffect,
      borderColor: '#2563eb', cornerColor: '#2563eb', cornerSize: 12, transparentCorners: false,
    });
    fabricCanvas.current.add(textTextbox);
    fabricCanvas.current.setActiveObject(textTextbox);
    fabricCanvas.current.requestRenderAll();
  };

  const addSticker = (stickerUrl: string) => {
    if (!fabricCanvas.current) return;
    const canvas = fabricCanvas.current;
    const currentLayout = LAYOUTS[layoutMode];
    fabric.Image.fromURL(stickerUrl, (img) => {
        if (!img) return;
        img.set({
            left: currentLayout.canvasWidth / 2, top: currentLayout.canvasHeight / 2,
            originX: 'center', originY: 'center', scaleX: 0.2, scaleY: 0.2, 
            hasControls: true, hasBorders: true,
            borderColor: '#2dd4bf', cornerColor: '#2dd4bf', cornerSize: 12, transparentCorners: false,
        });
        canvas.add(img);
        img.bringToFront();
        canvas.setActiveObject(img);
        canvas.renderAll();
    }, { crossOrigin: 'anonymous' }); 
  };

  // [핵심] 배경 제거 함수 (SegFormer + 역발상 + 소프트 엣지)
  const handleRemoveBg = async () => {
    const activeObj = fabricCanvas.current?.getActiveObject() as EnhancedFabricImage;
    if (!activeObj || activeObj.type !== 'image') {
      alert("배경을 지울 사진이나 스티커를 선택해주세요!");
      return;
    }

    // 1. 복구
    if (activeObj.originalSrc) {
      setLoading(true);
      fabric.Image.fromURL(activeObj.originalSrc, (restoredImg) => {
           if (!fabricCanvas.current) return;
           const newImg = restoredImg as EnhancedFabricImage;
           newImg.set({
             left: activeObj.left, top: activeObj.top, scaleX: activeObj.scaleX, scaleY: activeObj.scaleY,
             angle: activeObj.angle, hasControls: activeObj.hasControls, hasBorders: activeObj.hasBorders,
             borderColor: activeObj.borderColor, borderScaleFactor: activeObj.borderScaleFactor,
           });
           newImg.slotIndex = activeObj.slotIndex;
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
      return; 
    }

    if (!segmenter) {
      alert("AI 모델 로딩 중... 잠시만 기다려주세요 ⏳");
      return;
    }
    setLoading(true);

    try {
      const { RawImage } = await import('@xenova/transformers');
      const originalSource = activeObj.getSrc(); 
      const image = await RawImage.fromURL(originalSource);
      
      const output = await segmenter(image);
      
      // [전략] '배경'이라고 확신할 수 있는 것들만 제거 (역발상)
      // 짱구는 벽도, 하늘도, 바닥도 아니므로 살아남음.
      const backgroundLabels = [
        'wall', 'floor', 'ceiling', 'sky', 'road', 'building', 'tree', 
        'grass', 'sidewalk', 'earth', 'mountain', 'plant'
      ];
      
      const foregroundSegments = Array.isArray(output)
        ? output.filter((o: any) => !backgroundLabels.includes(o.label))
        : [];

      if (foregroundSegments.length === 0) {
        throw new Error("남길 대상을 찾지 못했습니다. (모두 배경으로 인식됨)");
      }

      // 캔버스 준비
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if(!ctx) throw new Error("Canvas context failed");

      // 1. 마스크 합성 (Soft Edge 효과 적용)
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = image.width;
      maskCanvas.height = image.height;
      const maskCtx = maskCanvas.getContext('2d');
      if(!maskCtx) throw new Error("Mask Context failed");

      // 배경은 검은색, 물체는 흰색으로 그리기
      maskCtx.fillStyle = 'black';
      maskCtx.fillRect(0, 0, image.width, image.height);
      
      // 블러 필터 적용 (경계선을 부드럽게!)
      // 이 값(4px)을 조절하면 더 부드럽거나 날카롭게 됩니다.
      maskCtx.filter = 'blur(4px)'; 

      for (const seg of foregroundSegments) {
        const segImg = await seg.mask.toCanvas();
        // 물체 부분(흰색)을 마스크 캔버스에 덧그리기
        // lighter 합성은 흰색 영역을 합쳐줍니다.
        maskCtx.globalCompositeOperation = 'lighter'; 
        maskCtx.drawImage(segImg, 0, 0);
      }

      // 2. 최종 합성
      // 원본 이미지를 그림
      ctx.drawImage(image.toCanvas(), 0, 0);
      
      // 픽셀 데이터 조작
      const pixelData = ctx.getImageData(0, 0, image.width, image.height);
      const maskData = maskCtx.getImageData(0, 0, image.width, image.height).data;

      for (let i = 0; i < pixelData.data.length; i += 4) {
        // 마스크의 밝기(흰색 정도)를 그대로 투명도로 사용
        // 블러 처리가 되어 있어서 경계선이 반투명하게(부드럽게) 나옴
        const alpha = maskData[i]; 
        pixelData.data[i + 3] = alpha; 
      }
      
      ctx.putImageData(pixelData, 0, 0);
      const newUrl = canvas.toDataURL("image/png");

      fabric.Image.fromURL(newUrl, (newImg) => {
        if (!fabricCanvas.current) return;
        const currentTheme = THEMES[themeIndex];
        const customNewImg = newImg as EnhancedFabricImage;

        customNewImg.set({
          left: activeObj.left, top: activeObj.top, scaleX: activeObj.scaleX, scaleY: activeObj.scaleY,
          angle: activeObj.angle, hasControls: activeObj.hasControls, hasBorders: activeObj.hasBorders,
          borderColor: activeObj.borderColor || currentTheme.text, borderScaleFactor: activeObj.borderScaleFactor,
          cornerColor: activeObj.cornerColor, cornerSize: activeObj.cornerSize, transparentCorners: activeObj.transparentCorners,
        });
        
        customNewImg.slotIndex = activeObj.slotIndex;
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

    } catch (e) { 
      console.error(e); 
      setLoading(false); 
      alert("배경 제거 실패: " + e); 
    }
  };

  const handleApplyStyle = (styleId: string) => {
    const activeObj = fabricCanvas.current?.getActiveObject() as CustomFabricImage;
    if (!activeObj || activeObj.type !== 'image') {
      alert("효과를 적용할 사진을 선택해주세요!");
      return;
    }
    if (styleId === 'original') {
      activeObj.filters = [];
      activeObj.applyFilters();
      fabricCanvas.current?.renderAll();
      return;
    }
    const selectedStyle = STYLE_FILTERS.find(s => s.id === styleId);
    if (selectedStyle) {
      const currentThemeBgColor = THEMES[themeIndex].bg;
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

  return {
    canvasEl,
    loading,
    handleAddText,
    addSticker,
    handleRemoveBg,
    handleApplyStyle,
    handleDownload
  };
}