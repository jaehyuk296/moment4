interface PhotoStripProps {
  photos: string[];
  onDelete: (index: number) => void;
}

export default function PhotoStrip({ photos, onDelete }: PhotoStripProps) {
  return (
    <div className="flex gap-4 justify-center h-28">
      {[...Array(4)].map((_, i) => (
        <div key={i} className={`relative w-24 h-full border-2 rounded-lg overflow-hidden bg-white/10 backdrop-blur-md ${photos[i] ? "border-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.5)]" : "border-black/30 border-dashed"}`}>
          {photos[i] ? (
            <>
              <img src={photos[i]} alt={`shot ${i}`} className="w-full h-full object-cover border-2 border-white/70" />
              <button 
                onClick={() => onDelete(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-md transition-transform hover:scale-110 z-20"
              >
                ✕
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-white/50 font-bold text-xl">{i + 1}</div>
          )}
        </div>
      ))}
    </div>
  );
}