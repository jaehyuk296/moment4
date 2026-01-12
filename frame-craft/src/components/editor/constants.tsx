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

// 스티커 목록
export const STICKER_LIST = [
  "/stickers/panda.png",
  // 추가 스티커 경로...
];

// 타입 정의
export interface CustomFabricImage extends fabric.Image {
  slotIndex?: number;
}