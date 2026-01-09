// src/app/page.tsx
import WebcamView from "@/components/WebcamView";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4">
      {/* 헤더 섹션 */}
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-md tracking-tight">
          MOMENT4 📸
        </h1>
        <p className="text-white/80 text-lg font-medium">
          나만의 인생네컷을 만들어보세요!
        </p>
      </div>

      {/* 웹캠 화면 섹션 */}
      <WebcamView />

      {/* 하단 버튼 (아직 기능 없음) */}
      <div className="mt-8 flex gap-4">
        <button className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
          편집하기 ✨
        </button>
      </div>
    </main>
  );
}