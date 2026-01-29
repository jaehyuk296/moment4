export default function NeonDecorations() {
  return (
    <>
      <div className="absolute left-8 top-1/3 hidden lg:block transform -rotate-12 pointer-events-none">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-pink-400 to-purple-400 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)] animate-pulse opacity-80">
          GET<br/>READY!
        </h2>
      </div>
      <div className="absolute right-8 bottom-1/3 hidden lg:block transform rotate-12 pointer-events-none">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-tl from-purple-400 to-pink-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-pulse opacity-80 text-right">
          SMILE<br/>Please :)
        </h2>
      </div>
    </>
  );
}