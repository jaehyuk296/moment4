"use client";

import { useState } from "react";
import WebcamView from "@/components/WebcamView";
import PhotoEditor from "@/components/PhotoEditor";

export default function Home() {
  // 찍은 사진들을 저장하는 상태
  const [photos, setPhotos] = useState<string[]>([]);

  return (
    <main>
      {photos.length < 4 ? (
        // [1] 사진이 4장 미만이면 -> 촬영 화면 (WebcamView) 보여줌
        <WebcamView 
          onFinish={(takenPhotos) => setPhotos(takenPhotos)} 
        />
      ) : (
        // [2] 사진이 4장 다 찼으면 -> 편집 화면 (PhotoEditor) 보여줌
        <PhotoEditor 
          photos={photos} 
          onBack={() => setPhotos([])} 
        />
      )}
    </main>
  );
}