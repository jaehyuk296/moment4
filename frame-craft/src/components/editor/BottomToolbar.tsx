interface BottomToolbarProps {
  onBack: () => void;
  onRemoveBg: () => void;
  onDownload: () => void;
  loading: boolean;
}

export default function BottomToolbar({ onBack, onRemoveBg, onDownload, loading }: BottomToolbarProps) {
  return (
    <div className="flex gap-4 mt-8 flex-wrap justify-center">
      <button onClick={onBack} className="px-6 py-3 bg-gray-700 text-white rounded-full font-bold hover:bg-gray-600 transition flex items-center gap-2">
        ↩️ 다시 찍기
      </button>
      <button onClick={onRemoveBg} className="px-6 py-3 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition shadow-lg flex items-center gap-2" disabled={loading}>
        ✂️ 사진 누끼 따기
      </button>
      <button onClick={onDownload} className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full font-bold hover:from-pink-600 hover:to-orange-600 transition shadow-lg animate-pulse flex items-center gap-2">
        💾 완성본 저장!
      </button>
    </div>
  );
}