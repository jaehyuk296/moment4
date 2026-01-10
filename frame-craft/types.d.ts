// src/types.d.ts
export {};

declare global {
  interface Window {
    SelfieSegmentation: any;
  }
}


declare module '@imgly/background-removal' {
  export function removeBackground(imageSource: string | Blob | File | HTMLImageElement): Promise<Blob>;
}