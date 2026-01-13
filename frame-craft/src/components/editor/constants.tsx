import { fabric } from "fabric";

// 사진 크기 및 여백 설정
export const IMG_WIDTH = 400;
export const IMG_HEIGHT = 300;
export const HEADER_HEIGHT = 70;
export const PADDING = 25;
export const GAP = 15;

// 초기 위치 계산
export const startX = PADDING;
export const startY = PADDING + HEADER_HEIGHT;

// 레이아웃 설정
export const LAYOUTS = {
  grid: {
    canvasWidth: PADDING * 2 + IMG_WIDTH * 2 + GAP,
    canvasHeight: PADDING * 2 + HEADER_HEIGHT + IMG_HEIGHT * 2 + GAP,
    positions: [
      { left: startX, top: startY },
      { left: startX + IMG_WIDTH + GAP, top: startY },
      { left: startX, top: startY + IMG_HEIGHT + GAP },
      { left: startX + IMG_WIDTH + GAP, top: startY + IMG_HEIGHT + GAP },
    ],
  },
  vertical: {
    canvasWidth: PADDING * 2 + IMG_WIDTH,
    canvasHeight: PADDING * 2 + HEADER_HEIGHT + IMG_HEIGHT * 4 + GAP * 3,
    positions: [
      { left: startX, top: startY },
      { left: startX, top: startY + IMG_HEIGHT + GAP },
      { left: startX, top: startY + IMG_HEIGHT * 2 + GAP * 2 },
      { left: startX, top: startY + IMG_HEIGHT * 3 + GAP * 3 },
    ],
  },
};

// 테마 목록
export const THEMES = [
  { name: '🖤 시크 블랙', bg: '#1a1a1a', text: '#ffffff' },
  { name: '🤍 심플 화이트', bg: '#f0f0f0', text: '#1a1a1a' },
  { name: '💖 러블리 핑크', bg: '#fce7f3', text: '#db2777' },
  { name: '💜 몽환 퍼플', bg: '#ede9fe', text: '#7c3aed' },
  { name: '💙 쿨 블루', bg: '#e0f2fe', text: '#0284c7' },
];

// [업그레이드된 화풍 스타일 레시피]
export const STYLE_FILTERS = [
  { 
    id: 'sketch', 
    name: '✏️ 스케치', 
    apply: (img: fabric.Image) => {
      // [개선됨] 더 진하고 연필 그림 같은 느낌
      img.filters = [
        new fabric.Image.filters.Grayscale(), // 1. 흑백으로 변환
        // 2. 대비를 강하게 줘서 윤곽선을 뚜렷하게 만듦
        new fabric.Image.filters.Contrast({ contrast: 0.4 }), 
        // 3. 강력한 엣지 검출 필터 적용
        new fabric.Image.filters.Convolute({
           matrix: [ -1, -1, -1,
                     -1,  8, -1,
                     -1, -1, -1 ]
        }),
        // 4. 잡티를 없애고 배경을 하얗게 날림
        new fabric.Image.filters.Brightness({ brightness: 0.2 }), 
        new fabric.Image.filters.Invert() // 5. 색상 반전 (검은 선, 흰 배경)
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
  // 추가 스티커 경로...
];

// 타입 정의
export interface CustomFabricImage extends fabric.Image {
  slotIndex?: number;
}