"use client";

import { useState } from "react";
import WebcamView from "@/components/WebcamView";
import PhotoEditor from "@/components/PhotoEditor";

export default function Home() {
  const [photos, setPhotos] = useState<string[]>([]); // 4장의 사진 배열

  return (
    <main>
      {photos.length < 4 ? (
        // 4장이 안 모였으면 촬영 화면
        <WebcamView onFinish={(takenPhotos) => setPhotos(takenPhotos)} />
      ) : (
        // 4장이 모였으면 편집 화면
        <PhotoEditor photos={photos} onRetake={() => setPhotos([])} />
      )}
    </main>
  );
}