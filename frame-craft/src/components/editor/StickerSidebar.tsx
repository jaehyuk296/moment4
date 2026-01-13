import { useRef, useState } from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { STICKER_LIST } from "./constants";

// [NEW] 사용할 폰트 목록 정의 (실제 프로젝트 CSS에 로드된 폰트 이름이어야 함)
const FONT_OPTIONS = [
  { label: '기본(프리텐다드)', value: 'Pretendard' },
  { label: '손글씨(개구쟁이)', value: "'Gaegu', cursive" }, // 구글폰트 예시
  { label: '두꺼운(검은한산)', value: "'Black Han Sans', sans-serif" },
  { label: '명조체(나눔명조)', value: "'Nanum Myeongjo', serif" },
];

interface StickerSidebarProps {
  isOpen: boolean;
  onAddSticker: (url: string) => void;
  onAddText: (options: { text: string, color: string, font: string }) => void; 
}

export default function StickerSidebar({ isOpen, onAddSticker, onAddText }: StickerSidebarProps) {
  // 파일 선택 input을 숨기고 버튼으로 제어하기 위한 ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmoji, setShowEmoji] = useState(false); // 이모지 피커 토글 상태
  const [textInput, setTextInput] = useState(""); // 텍스트 입력 상태

  // [NEW] 색상과 폰트 상태 관리
  const [textColor, setTextColor] = useState("#000000"); // 기본 검정
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].value);

  // [기능 1] 내 컴퓨터의 이미지 업로드 처리
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // FileReader API: 클라이언트 측에서 파일을 비동기로 읽음
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

  // [기능 2] 이모지 선택 처리
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    // 이모지 이미지 URL을 전달
    onAddSticker(emojiData.imageUrl);
  };

  // [NEW] 텍스트 추가 버튼 핸들러
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      // 👇 입력된 텍스트, 선택된 색상, 선택된 폰트를 묶어서 부모에게 전달
      onAddText({ 
        text: textInput, 
        color: textColor, 
        font: selectedFont 
      });
      setTextInput(""); // 입력창 초기화
      // 색상과 폰트는 사용자가 계속 쓸 수 있으니 초기화 안 함 (UX 고려)
    }
  };

  return (
    <div className={`fixed right-0 top-0 h-full w-80 bg-gray-900 shadow-2xl border-l border-gray-700 p-4 overflow-y-auto transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
        ✨ 꾸미기 도구
      </h2>

      {/* 텍스트 추가 영역 */}
      <div className="mb-6 pb-6 border-b border-gray-700">
          <h4 className="text-sm font-bold text-gray-400 mb-3">💬 텍스트 추가</h4>
          
          <form onSubmit={handleTextSubmit} className="flex flex-col gap-3">
            
            {/* [1] 텍스트 입력창 (다크 모드 스타일 적용) */}
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="문구를 입력하세요 (예: 2024 졸업!)"
              // 👇 bg-gray-800(어두운 배경), text-white(흰 글씨), placeholder-gray-500(회색 안내문구)
              className="w-full px-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 outline-none text-sm transition-all"
            />
            
            {/* [2] 옵션 컨트롤 (색상 + 폰트) - 한 줄 배치 */}
            <div className="flex gap-2 items-center">
              {/* 색상 선택기 */}
              <div 
                className="relative w-12 h-10 overflow-hidden rounded-lg border border-gray-600 cursor-pointer shadow-sm hover:border-pink-500 transition-colors shrink-0"
                style={{ backgroundColor: textColor }} // 현재 선택된 색상을 배경으로 보여줌
              >
                  <input 
                    type="color" 
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="글자 색상 선택"
                  />
              </div>

              {/* 폰트 선택기 (다크 모드 스타일) */}
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                // 👇 bg-gray-800(어두운 배경), text-white(흰 글씨)로 변경하여 가독성 확보
                className="flex-1 px-2 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-pink-500 outline-none cursor-pointer truncate"
                style={{ fontFamily: selectedFont.includes('Gaegu') ? 'Gaegu' : selectedFont.includes('Black') ? 'Black Han Sans' : selectedFont.includes('Nanum') ? 'Nanum Myeongjo' : 'Pretendard' }}
              >
                {FONT_OPTIONS.map((font) => (
                  // 옵션 배경은 브라우저 기본값이므로 어둡게 처리 (text-black은 옵션 가독성용)
                  <option key={font.value} value={font.value} className="bg-gray-800 text-white">
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            {/* [3] 추가 버튼 (꽉 찬 너비로 변경하여 클릭 쉽게) */}
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="w-full py-3 mt-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-bold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              텍스트 추가하기 +
            </button>

          </form>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Tip: 추가된 텍스트를 <span className="text-pink-400 font-bold">더블 클릭</span>하면 수정돼요!
          </p>
        </div>

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