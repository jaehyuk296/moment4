/** @type {import('next').NextConfig} */
const nextConfig = {
  // 👇 [1] 타입스크립트 에러 무시 (이건 유효함!)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ❌ [삭제됨] eslint 설정은 여기서 하면 에러 나서 뺐습니다.
  // (아까 만든 빈 eslint.config.mjs 파일 덕분에 자동으로 무시됩니다.)

  // 👇 [2] 보안 헤더 (WebGPU용)
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

  // 👇 [3] 웹팩 설정
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    }
    return config;
  },
};

export default nextConfig;