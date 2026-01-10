"use client";

import { useEffect, useRef, useState } from "react";
// fabric import 제거됨 (require 사용)
import { Download, Undo } from "lucide-react";

interface PhotoEditorProps {
  photos: string[];
  onRetake: () => void;
}

export default function PhotoEditor({ photos, onRetake }: PhotoEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 👇 [수정된 부분] fabric을 불러오는 방식을 안전하게 변경했습니다.
    const fabricModule = require("fabric");
    const fabric = fabricModule.fabric || fabricModule;

    // 1. 캔버스 생성
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 1200,
      backgroundColor: "#ffffff",
    });

    setFabricCanvas(canvas);

    // 2. 사진 배치
    const loadImages = async () => {
      const positions = [
        { left: 0, top: 0 },
        { left: 400, top: 0 },
        { left: 0, top: 600 },
        { left: 400, top: 600 },
      ];

      photos.forEach((photoUrl, index) => {
        if (index >= 4) return;

        fabric.Image.fromURL(photoUrl, (img: any) => {
          img.scaleToWidth(400);
          img.scaleToHeight(600);
          
          img.set({
            left: positions[index].left,
            top: positions[index].top,
            selectable: false, // 배경 사진은 고정
          });

          canvas.add(img);
        });
      });
      
      // 프레임(선) 그리기
      const lineOptions = {
        stroke: "white",
        strokeWidth: 10,
        selectable: false,
        evented: false,
      };
      
      canvas.add(new fabric.Line([400, 0, 400, 1200], lineOptions));
      canvas.add(new fabric.Line([0, 600, 800, 600], lineOptions));
    };

    loadImages();

    return () => {
      canvas.dispose();
    };
  }, [photos]);

  const downloadImage = () => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "moment4-result.png";
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl animate-fade-in">
      <h2 className="text-3xl font-bold text-white drop-shadow-md">
        꾸미기 & 저장 🎨
      </h2>

      {/* 캔버스 영역 */}
      <div className="relative shadow-2xl border-4 border-white rounded-lg overflow-hidden bg-white">
        <canvas ref={canvasRef} />
      </div>

      <div className="flex gap-4">
        <button
          onClick={onRetake}
          className="px-6 py-3 bg-gray-600 text-white rounded-full font-bold hover:bg-gray-500 transition flex items-center gap-2"
        >
          <Undo className="w-5 h-5" />
          처음으로
        </button>

        <button
          onClick={downloadImage}
          className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-500 transition shadow-lg flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          사진 저장하기
        </button>
      </div>
    </div>
  );
}