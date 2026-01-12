import { useRef, useState } from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { STICKER_LIST } from "./constants";

interface StickerSidebarProps {
  isOpen: boolean;
  onAddSticker: (url: string) => void;
}

export default function StickerSidebar({ isOpen, onAddSticker }: StickerSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmoji, setShowEmoji] = useState(false); // 이모지 피커 토글 상태

  // 1. 내 이미지 업로드 핸들러
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        // 파일을 Base64 데이터로 변환해서 캔버스에 전달
        onAddSticker(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    
    // 같은 파일을 다시 올릴 수 있게 초기화
    e.target.value = "";
  };

  // 2. 이모지 클릭 핸들러
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    // 이모지 이미지 URL을 전달
    onAddSticker(emojiData.imageUrl);
    // (선택 사항) 하나 고르고 닫고 싶으면: setShowEmoji(false);
  };

  return (
    <div className={`fixed right-0 top-0 h-full w-80 bg-gray-900 shadow-2xl border-l border-gray-700 p-4 overflow-y-auto transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
        ✨ 꾸미기 도구
      </h2>

      {/* [섹션 1] 내 이미지 업로드 버튼 */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Custom Image</h3>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl text-gray-300 hover:border-pink-500 hover:text-pink-500 hover:bg-gray-800/80 transition flex items-center justify-center gap-2 font-bold"
        >
          📂 내 사진 가져오기
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*" 
          className="hidden" 
        />
        <p className="text-xs text-gray-500 mt-2 text-center">배경이 투명한 PNG가 좋아요!</p>
      </div>

      {/* [섹션 2] 이모지 피커 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Emoji</h3>
          <button 
            onClick={() => setShowEmoji(!showEmoji)}
            className="text-xs bg-gray-800 px-2 py-1 rounded hover:bg-gray-700 text-gray-300 transition"
          >
            {showEmoji ? "접기 ▲" : "펼치기 ▼"}
          </button>
        </div>
        
        {showEmoji && (
          <div className="w-full">
            <EmojiPicker 
              onEmojiClick={handleEmojiClick}
              theme={Theme.DARK}
              width="100%"
              height={350}
              lazyLoadEmojis={true}
              searchDisabled={false}
              skinTonesDisabled={true} // 스킨톤 선택 끄기 (깔끔하게)
            />
          </div>
        )}
      </div>

      {/* [섹션 3] 기본 제공 스티커 */}
      <div>
        <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Stickers</h3>
        <div className="grid grid-cols-3 gap-2">
          {STICKER_LIST.map((stickerUrl, index) => (
            <button 
              key={index}
              onClick={() => onAddSticker(stickerUrl)}
              className="bg-gray-800 rounded-lg p-2 hover:bg-gray-700 transition flex items-center justify-center aspect-square border border-transparent hover:border-pink-500/50"
              title="추가하기"
            >
              <img src={stickerUrl} alt={`sticker-${index}`} className="w-full h-full object-contain pointer-events-none" />
            </button>
          ))}
        </div>
        {STICKER_LIST.length === 0 && (
          <p className="text-gray-500 text-xs mt-4 text-center py-4 bg-gray-800 rounded-lg">
            (public/stickers 폴더가 비어있어요)
          </p>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-gray-800 text-gray-500 text-xs">
        <p className="mb-1 font-bold text-gray-400">💡 사용 팁</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>이미지를 클릭해서 선택하세요.</li>
          <li>모서리를 잡아 크기/회전을 조절하세요.</li>
          <li><b>Delete</b> 키로 삭제할 수 있어요.</li>
        </ul>
      </div>

    </div>
  );
}