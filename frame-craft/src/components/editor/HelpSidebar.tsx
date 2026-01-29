import { useState } from "react";

export default function HelpSidebar() {
  // 처음부터 열려있게 할지, 닫혀있게 할지 결정 (여기선 처음에 보여주고 사용자가 닫게 설정)
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* 1. 토글 버튼 (왼쪽 상단 고정) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed left-4 top-4 z-50 px-4 py-2 rounded-full font-bold shadow-lg transition-all duration-300 flex items-center gap-2 ${
          isOpen 
            ? "bg-gray-700 text-white translate-x-64" // 사이드바 열리면 버튼도 같이 이동
            : "bg-white text-gray-900 hover:bg-gray-100"
        }`}
      >
        {isOpen ? "◀ 닫기" : "❓ 사용법"}
      </button>

      {/* 2. 설명서 사이드바 본문 */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-gray-900/95 border-r border-gray-700 shadow-2xl p-6 text-white transition-transform duration-300 z-40 overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mt-12 space-y-8">
          
          {/* 타이틀 */}
          <div className="border-b border-gray-700 pb-4">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              💡 사용 가이드
            </h2>
            <p className="text-gray-400 text-sm mt-1">예쁜 네컷 사진을 만드는 꿀팁!</p>
          </div>

          {/* 섹션 1: 배경 제거 & 복구 (가장 중요!) */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-blue-300 flex items-center gap-2">
              <span className="bg-blue-500/20 p-1 rounded">✂️</span> 누끼 따기 & 취소
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 leading-relaxed">
              <li>사진을 선택하고 <b>[배경 제거]</b> 버튼을 누르면 배경이 사라져요.</li>
              <li>
                <span className="text-yellow-300 font-bold underline decoration-wavy">잠깐! 되돌리고 싶다면?</span><br/>
                배경이 없는 사진을 선택하고 <b>[배경 제거]</b> 버튼을 <span className="text-red-300 font-bold">한 번 더</span> 누르면 원본으로 돌아옵니다! 🔄
              </li>
            </ul>
          </div>

          {/* 섹션 2: 사진 이동 */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-green-300 flex items-center gap-2">
              <span className="bg-green-500/20 p-1 rounded">✋</span> 자리 바꾸기
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              사진을 드래그해서 다른 사진 위로 가져가세요.<br/>
              두 사진의 위치가 <b>서로 바뀝니다(Swap).</b>
            </p>
          </div>

          {/* 섹션 3: 스티커 & 삭제 */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-pink-300 flex items-center gap-2">
              <span className="bg-pink-500/20 p-1 rounded">✨</span> 스티커 & 삭제
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 leading-relaxed">
              <li>오른쪽 메뉴에서 스티커를 클릭하거나 내 사진을 업로드하세요.</li>
              <li>모서리를 잡아 크기와 각도를 조절하세요.</li>
              <li>지우고 싶을 땐? 선택 후 <b>빨간색 X 버튼</b>을 누르거나 키보드 <b>Delete</b> 키를 누르세요.</li>
            </ul>
          </div>

          {/* 섹션 4: AI 필터 */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
              <span className="bg-purple-500/20 p-1 rounded">🎨</span> AI 화풍 변경
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              사진을 클릭하고 <b>[AI 화풍 변환]</b> 메뉴를 열어보세요. 만화, 스케치 등 다양한 느낌을 낼 수 있어요.
            </p>
          </div>

        </div>

        {/* 하단 메시지 */}
        <div className="mt-12 text-center text-xs text-gray-500">
          MOMENT4 Editor v1.0
        </div>
      </div>
    </>
  );
}