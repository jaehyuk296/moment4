import { CustomFabricImage } from "./constants";

// [New] 커스텀 이미지 인터페이스에 'originalSrc' 추가 (복구용)
export interface EnhancedFabricImage extends CustomFabricImage {
  originalSrc?: string; // 배경 제거 전 원본 이미지 경로 저장
  slotIndex?: number;   // 그리드 레이아웃에서의 위치 인덱스
}

export interface PhotoEditorProps {
  photos: string[];
  onBack: () => void;
}