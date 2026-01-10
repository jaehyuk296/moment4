"use client";

import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric"; // 1단계 설치 후에는 이 코드가 정상 작동합니다.
import { removeBackground } from "@imgly/background-removal";

interface PhotoEditorProps {
  photos: string[]; // 4장의 사진 데이터
  onRetake: () => void;
}

export default function PhotoEditor({ photos, onRetake }: PhotoEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [loading, setLoading] = useState(false); // 누끼 작업 중 로딩 표시

  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. 인생4컷용 긴 캔버스 생성 (가로 400 x 세로 1200 비율)
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 400,
      height: 1000,
      backgroundColor: "#ffecf2", // 기본 핑크 배경
    });

    // 2. 4장의 사진을 순서대로 배치
    photos.forEach((photoUrl, index) => {
      fabric.Image.fromURL(photoUrl, (img: fabric.Image) => {
        img.scaleToWidth(300); // 사진 크기 조절
        img.set({
          left: 50, // 가운데 정렬 느낌
          top: 50 + (index * 240), // 세로로 차곡차곡 배치
          borderColor: 'red',
          cornerColor: 'blue',
          cornerSize: 10,
          transparentCorners: false
        });
        canvas.add(img);
      });
    });

    setFabricCanvas(canvas);
    return () => { canvas.dispose(); };
  }, [photos]);

  // 기능: 배경 추가 (사용자 이미지 업로드)
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!fabricCanvas || !e.target.files?.[0]) return;
    const url = URL.createObjectURL(e.target.files[0]);
    fabric.Image.fromURL(url, (img: fabric.Image) => {
      // 캔버스 크기에 맞춰 배경 설정
      img.scaleToWidth(400); 
      fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas), {
        scaleX: fabricCanvas.width! / img.width!,
        scaleY: fabricCanvas.height! / img.height!
      });
    });
  };

  // 기능: 선택된 사진 AI 누끼 따기 (핵심 기능!)
  const removeBgFromSelected = async () => {
    const activeObj = fabricCanvas?.getActiveObject();
    
    // 선택된 객체가 이미지인지 확인
    if (!activeObj || !(activeObj instanceof fabric.Image)) {
      alert("누끼를 딸 사진을 먼저 선택해주세요!");
      return;
    }

    const imageElement = (activeObj as fabric.Image).getElement() as HTMLImageElement;
    
    try {
      setLoading(true);
      // 1. AI 라이브러리로 배경 제거 실행 (브라우저 내에서 동작)
      const blob = await removeBackground(imageElement.src);
      const newUrl = URL.createObjectURL(blob);

      // 2. 기존 사진 자리에 누끼 따진 사진 교체
      fabric.Image.fromURL(newUrl, (newImg: fabric.Image) => {
        newImg.set({
          left: activeObj.left,
          top: activeObj.top,
          scaleX: activeObj.scaleX,
          scaleY: activeObj.scaleY,
          angle: activeObj.angle
        });
        
        fabricCanvas?.remove(activeObj); // 원본 삭제
        fabricCanvas?.add(newImg);       // 누끼 사진 추가
        fabricCanvas?.setActiveObject(newImg);
        fabricCanvas?.renderAll();
      });
    } catch (error) {
      console.error("누끼 실패:", error);
      alert("배경 제거 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 기능: 텍스트 추가
  const addText = () => {
    const text = new fabric.IText("MOMENT4", {
      left: 100, top: 900, fontSize: 30, fill: "#333", fontFamily: "Arial"
    });
    fabricCanvas?.add(text);
  };

  // 기능: 저장
  const saveImage = () => {
    if (!fabricCanvas) return;
    const link = document.createElement("a");
    link.href = fabricCanvas.toDataURL({ format: "png", quality: 1 });
    link.download = "my-moment4.png";
    link.click();
  };

  return (
    <div className="flex gap-4 p-4 items-start justify-center bg-gray-100 min-h-screen">
      {/* 왼쪽: 편집 툴바 */}
      <div className="flex flex-col gap-3 bg-white p-4 rounded-lg shadow-lg w-64">
        <h3 className="font-bold text-lg mb-2">꾸미기 도구</h3>
        
        <label className="btn block text-center cursor-pointer bg-blue-100 py-2 rounded">
          🖼️ 배경 이미지 업로드
          <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundUpload} />
        </label>

        <button onClick={addText} className="bg-gray-200 py-2 rounded hover:bg-gray-300">
          ✏️ 텍스트/날짜 추가
        </button>

        <button onClick={removeBgFromSelected} disabled={loading} className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-50">
          {loading ? "AI 처리중..." : "🪄 선택한 사진 누끼따기"}
        </button>
        
        <div className="border-t my-2"></div>

        <button onClick={saveImage} className="bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700">
          💾 완성본 저장
        </button>
        <button onClick={onRetake} className="bg-red-100 text-red-600 py-2 rounded hover:bg-red-200">
          다시 찍기
        </button>
      </div>

      {/* 오른쪽: 캔버스 (결과물) */}
      <div className="bg-white shadow-2xl border-4 border-gray-800">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}