"use client";

import { useState } from "react";
import WebcamView from "@/components/WebcamView";
import PhotoEditor from "@/components/PhotoEditor";

export default function Home() {
  // [상태 관리] 찍은 사진 데이터의 저장소
  // 하위 컴포넌트들이 이 데이터를 공유받아 사용함
  const [photos, setPhotos] = useState<string[]>([]);

  return (
    <main>
      {/* [조건부 렌더링] 
        사진이 4장 미만이면 촬영 모드, 
        4장이 꽉 차면 편집 모드로 전환 
      */}
      {photos.length < 4 ? (
        <WebcamView 
          // onFinish: 촬영이 끝나면 photos 상태를 업데이트하는 콜백 함수 전달
          onFinish={(takenPhotos) => setPhotos(takenPhotos)} 
        />
      ) : (
        <PhotoEditor 
          photos={photos} 
          // onBack: 다시 찍기 버튼을 누르면 photos를 비워 촬영 모드로 복귀
          onBack={() => setPhotos([])} 
        />
      )}
    </main>
  );
}