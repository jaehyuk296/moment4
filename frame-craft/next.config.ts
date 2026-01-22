import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 1. 보안 헤더 설정 (WebGPU 필수) */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },

  /* 2. 웹팩 설정 (라이브러리 충돌 방지) */
  webpack: (config: any) => {  // 👈 여기에 ': any'를 붙여야 빨간줄이 사라짐!
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    }
    return config;
  },
};

export default nextConfig;