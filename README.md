# 📸 Frame-Craft (Moment4)

웹캠을 이용해 나만의 네 컷 사진을 찍고 꾸밀 수 있는 웹 포토부스 애플리케이션입니다.
Next.js와 Canvas API, 그리고 AI 배경 제거 기술을 활용하여 별도의 앱 설치 없이 브라우저에서 바로 즐길 수 있습니다.

## 🔗 배포 링크 (Demo)
👉 **[서비스 바로가기](https://moment4-git-develop-jaehyuks-projects-6c79ceff.vercel.app)** *(위 링크를 클릭하면 바로 체험할 수 있습니다!)*

<br>

## 스크린샷
- 메인 화면
<img width="1919" height="889" alt="image" src="https://github.com/user-attachments/assets/7d7b5893-c6b2-4335-b4a6-eb4749df1863" />

- 편집 화면
<img width="1919" height="903" alt="image" src="https://github.com/user-attachments/assets/01030386-833e-4111-8919-a3de1b4c82b0" />

<br>

## ✨ 주요 기능 (Key Features)

- **📸 실시간 웹캠 촬영**: 브라우저 권한을 이용하여 총 4장의 사진을 연속으로 촬영합니다.
- **🤖 AI 배경 제거 (누끼 따기)**: `@imgly/background-removal` 라이브러리를 활용하여 인물 배경을 자동으로 제거합니다.
- **🎨 사진 꾸미기 (Editor)**: `Fabric.js`를 활용한 캔버스 에디터로 배경색 변경, 스티커 부착, 드로잉이 가능합니다.
- **💾 이미지 저장**: 완성된 네 컷 사진을 내 기기에 바로 다운로드할 수 있습니다.

<br>

## 🛠 기술 스택 (Tech Stack)

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useRef)

### Core Libraries
- **Canvas**: `fabric.js` (이미지 편집 및 합성)
- **AI**: `@imgly/background-removal` (클라이언트 사이드 배경 제거)
- **Camera**: `react-webcam`

### Deployment
- **Platform**: Vercel
- **Build**: Webpack (Custom Config for AI Library Support)

<br>

## 📂 폴더 구조 (Project Structure)

```bash
📦 frame-craft
├── 📂 public                  # 정적 파일 (파비콘, 이미지 에셋 등)
├── 📂 src
│   ├── 📂 app                 # Next.js App Router (페이지 라우팅)
│   │   ├── globals.css        # 전역 스타일 및 Tailwind 설정
│   │   ├── layout.tsx         # 루트 레이아웃 (폰트, 메타데이터 설정)
│   │   └── page.tsx           # 메인 페이지 (촬영/편집 모드 상태 관리)
│   ├── 📂 components          # UI 및 기능 컴포넌트
│   │   ├── 📂 editor          # 캔버스 에디터 하위 컴포넌트 (툴바, 사이드바 등)
│   │   │   ├── BottomToolbar.tsx
│   │   │   ├── StickerSidebar.tsx
│   │   │   ├── TopToolbar.tsx
│   │   │   ├── HelpSidebar.tsx
│   │   │   └── constants.tsx
│   │   ├── 📂 webcam          # 웹캠 관련 하위 컴포넌트
│   │   ├── PhotoEditor.tsx    # [핵심] 사진 꾸미기 기능 통합 컨테이너
│   │   └── WebcamView.tsx     # [핵심] 웹캠 촬영 및 타이머 로직 컨테이너
│   ├── 📂 hooks               # 커스텀 훅 (비즈니스 로직 분리)
│   │   └── usePhotoEditor.ts  # Fabric.js 캔버스 조작 로직 (이미지 추가, 삭제, 필터)
│   └── 📂 utils               # 유틸리티 함수
├── next.config.mjs            # Next.js 설정 (Webpack, 보안 헤더)
├── package.json               # 프로젝트 의존성 및 스크립트
└── README.md                  # 프로젝트 문서
```

<br>

## 🚀 실행 방법 (Getting Started)

로컬 환경에서 이 프로젝트를 실행하려면 아래 명령어를 입력하세요.

```bash
# 1. 저장소 복제
git clone [https://github.com/jaehyuk296/moment4.git](https://github.com/jaehyuk296/moment4.git)

# 2. 의존성 패키지 설치
npm install

# 3. 개발 서버 실행
npm run dev
```
<br>

## ⚠️ 이용 시 주의사항 (Troubleshooting)
카카오톡/인스타그램 인앱 브라우저 문제

- 카카오톡이나 인스타그램 등 앱 내에서 링크를 열면 카메라 권한이 차단될 수 있습니다.

- [더보기(...)] 버튼을 눌러 **'다른 브라우저로 열기(Safari, Chrome)'**를 선택해주세요.

데이터 저장

- 현재 버전은 별도의 DB 없이 브라우저 메모리상에서 작동합니다.

- 페이지를 새로고침하거나 닫으면 촬영한 사진이 초기화되니 주의해주세요.

<br>

## 🔥 기술적 도전 & 트러블 슈팅 (Challenges)

### 1. Next.js 16의 Turbopack과 AI 라이브러리 호환성 문제
**문제 상황:**
`@imgly/background-removal` 라이브러리는 Webpack 설정을 통해 WASM 파일을 로드해야 하는데, Next.js 16의 기본 번들러인 Turbopack과는 호환성 이슈가 있어 Vercel 배포 시 빌드 에러가 발생했습니다.

**해결 과정:**
* `next.config.mjs`에서 Webpack 설정을 커스텀하여 `onnxruntime`과 `sharp` 모듈을 예외 처리했습니다.
* `package.json`의 빌드 스크립트를 `next build --webpack`으로 수정하여, Vercel 배포 시 강제로 Webpack을 사용하도록 설정하여 해결했습니다.
* **[배운 점]:** 최신 프레임워크 도입 시 생태계 라이브러리와의 호환성을 미리 검토해야 함을 배웠습니다.

<br>

## 📅 향후 계획 (Roadmap)
[ ] Supabase 연동을 통한 사진 영구 저장 및 갤러리 기능

[ ] 공유하기 기능 (카카오톡 공유 API)

[ ] 다양한 프레임 템플릿 추가
