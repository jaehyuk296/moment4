import { fabric } from "fabric";

// ==========================================
// 1. 캔버스 및 레이아웃 설정 (상수 관리)
// ==========================================
// 사진 크기: 4:3 비율 유지 (인생네컷 표준)
export const IMG_WIDTH = 400;
export const IMG_HEIGHT = 300;
export const HEADER_HEIGHT = 70; // 타이틀/날짜가 들어갈 상단 여백
export const PADDING = 25;       // 프레임 테두리 여백
export const GAP = 15;           // 사진 사이의 간격

// 초기 드로잉 시작 좌표 (좌상단 기준)
export const startX = PADDING;
export const startY = PADDING + HEADER_HEIGHT;

// ==========================================
// 2. 레이아웃 좌표 계산 로직
// ==========================================
export const LAYOUTS = {
  // [2x2 그리드 모드]
  grid: {
    // 캔버스 전체 크기 자동 계산: (여백*2) + (사진너비*2) + 간격
    canvasWidth: PADDING * 2 + IMG_WIDTH * 2 + GAP,
    canvasHeight: PADDING * 2 + HEADER_HEIGHT + IMG_HEIGHT * 2 + GAP,
    // 4장의 사진이 들어갈 (x, y) 좌표 배열
    positions: [
      { left: startX, top: startY },                         // 좌상
      { left: startX + IMG_WIDTH + GAP, top: startY },       // 우상
      { left: startX, top: startY + IMG_HEIGHT + GAP },      // 좌하
      { left: startX + IMG_WIDTH + GAP, top: startY + IMG_HEIGHT + GAP }, // 우하
    ],
  },
  // [4컷 수직 모드]
  vertical: {
    canvasWidth: PADDING * 2 + IMG_WIDTH,
    // 세로로 길게: 높이 * 4 + 간격 * 3
    canvasHeight: PADDING * 2 + HEADER_HEIGHT + IMG_HEIGHT * 4 + GAP * 3,
    positions: [
      { left: startX, top: startY },
      { left: startX, top: startY + IMG_HEIGHT + GAP },
      { left: startX, top: startY + IMG_HEIGHT * 2 + GAP * 2 },
      { left: startX, top: startY + IMG_HEIGHT * 3 + GAP * 3 },
    ],
  },
};

// ==========================================
// 3. 테마 색상 팔레트
// ==========================================
export const THEMES = [
  { name: '🖤 시크 블랙', bg: '#1a1a1a', text: '#ffffff' },
  { name: '🤍 심플 화이트', bg: '#f0f0f0', text: '#1a1a1a' },
  { name: '💖 러블리 핑크', bg: '#fce7f3', text: '#db2777' },
  { name: '💜 몽환 퍼플', bg: '#ede9fe', text: '#7c3aed' },
  { name: '💙 쿨 블루', bg: '#e0f2fe', text: '#0284c7' },
];

// ==========================================
// 4. Fabric.js 이미지 필터 레시피 (핵심!)
// ==========================================
export const STYLE_FILTERS = [
  { 
    id: 'sketchbook',
    name: '📒 스케치북 (빈 화면)',
    // Tip: 사용자가 선택한 배경색(bgColor)으로 이미지를 덮어쓰는 로직
    apply: (img: fabric.Image, bgColor?: string) => {
      const colorToUse = bgColor || '#ffffff';
      img.filters = [
         // BlendColor: 이미지를 색상으로 덮음 (Tint 모드, Alpha 1.0 = 완전 불투명)
         new fabric.Image.filters.BlendColor({
            color: colorToUse,
            mode: 'tint',
            alpha: 1.0 
         })
      ];
    }
  },
  { 
    id: 'sketch', 
    name: '✏️ 스케치', 
    apply: (img: fabric.Image) => {
      // 스케치 효과: 흑백 -> 윤곽선 검출 -> 색상 반전의 과정
      img.filters = [
        new fabric.Image.filters.Grayscale(), // 1. 색상 정보 제거
        new fabric.Image.filters.Contrast({ contrast: 0.4 }), // 2. 명암 대비 강조
        // 3. Convolute: 엣지 검출(Edge Detection) 매트릭스
        // 중앙값(8)과 주변값(-1)의 차이를 계산해 경계선을 찾음
        new fabric.Image.filters.Convolute({
           matrix: [ -1, -1, -1,
                     -1,  8, -1,
                     -1, -1, -1 ]
        }),
        new fabric.Image.filters.Brightness({ brightness: 0.2 }), // 4. 배경 정리
        new fabric.Image.filters.Invert() // 5. 검은 배경/흰 선 -> 흰 배경/검은 선으로 반전
      ];
    }
  },
  { 
    id: 'noir', // [새로 추가] 분위기 있는 흑백 영화 느낌
    name: '🎞️ 느와르',
    apply: (img: fabric.Image) => {
      img.filters = [
        new fabric.Image.filters.Grayscale(), // 1. 기본 흑백
        // 2. 대비를 아주 강하게 줘서 그림자를 깊게 만듦 (드라마틱한 효과)
        new fabric.Image.filters.Contrast({ contrast: 0.3 }), 
        // 3. 밝기를 살짝 낮춰서 묵직한 분위기 연출
        new fabric.Image.filters.Brightness({ brightness: -0.1 })
      ];
    }
  },
  { 
    id: 'vintage', 
    name: '📼 레트로', 
    apply: (img: fabric.Image) => {
      // [개선됨] 더 바랜듯한 옛날 사진 느낌
      img.filters = [
        new fabric.Image.filters.Sepia(), // 1. 세피아톤 베이스
        // 2. 노이즈를 추가해 거친 질감 표현
        new fabric.Image.filters.Noise({ noise: 50 }), 
        // 3. 대비를 낮추고 밝기를 올려서 빛 바랜 느낌
        new fabric.Image.filters.Contrast({ contrast: -0.15 }),
        new fabric.Image.filters.Brightness({ brightness: 0.1 })
      ];
    }
  },
  { 
    id: 'cartoon', 
    name: '🎨 만화', 
    apply: (img: fabric.Image) => {
      // 기존 유지 (색감 쨍하고 선명하게)
      img.filters = [
        new fabric.Image.filters.Convolute({
          matrix: [ 0, -1, 0, -1, 5, -1, 0, -1, 0 ]
        }),
        new fabric.Image.filters.Saturation({ saturation: 0.7 }),
        new fabric.Image.filters.Contrast({ contrast: 0.15 })
      ];
    }
  },
  { 
    id: 'pixel', 
    name: '👾 픽셀', 
    apply: (img: fabric.Image) => {
      // 기존 유지 (8비트 모자이크)
      img.filters = [
        new fabric.Image.filters.Pixelate({ blocksize: 8 }),
        new fabric.Image.filters.Saturation({ saturation: 0.5 })
      ];
    }
  }
];

// 스티커 목록
export const STICKER_LIST = [
  "/stickers/panda.png",
  "/stickers/kitty.png",
  "/stickers/beam.png",
  "/stickers/heyho.png",
  "/stickers/kubby.png",
  "/stickers/heart.png",
  "/stickers/flower.png",
  "/stickers/rainbow.png",
  "/stickers/teddybear.png",

  // 추가 스티커 경로...
];

// 타입 정의
export interface CustomFabricImage extends fabric.Image {
  slotIndex?: number;
}