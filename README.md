# 축산업 저탄소 실측 대시보드

대학생 축산유통 공모전용 정책 아이디어 프로토타입

## 프로젝트 개요

전국 339개 저탄소 인증 농가에 센서를 부착하여 실시간 온실가스 배출량을 모니터링하는 축산물품질평가원 관리자용 대시보드

## 주요 기능

- ✅ 전국 지도 기반 339개 농장 현황 표시
- ✅ 축종별 필터링 (한우/젖소/돼지)
- ✅ 농장별 실시간 가스 모니터링 (CH4, CO2, N2O, NH3)
- ✅ 센서 배치도 시각화
- ✅ 시간대별 배출량 추이 차트
- ✅ 알림 시스템 및 절감 가이드

## 기술 스택

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Recharts
- Zustand
- React Router
- Google Maps API (@react-google-maps/api)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. Google Maps API 키 설정

`src/pages/MapPage.tsx` 파일 9번째 줄에서 API 키를 교체하세요.

```typescript
const GOOGLE_MAPS_API_KEY = '여기에_실제_API_키_입력';
```

**API 키 발급**: https://developers.google.com/maps/documentation/javascript/get-api-key

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:5173 에서 확인하세요.

## 프로젝트 구조

```
src/
├── components/
│   ├── common/        # 공통 컴포넌트
│   ├── map/           # 지도 관련
│   ├── dashboard/     # 대시보드 컴포넌트
│   ├── charts/        # 차트 컴포넌트
│   └── alerts/        # 알림 컴포넌트
├── pages/             # 페이지
├── types/             # TypeScript 타입
├── data/              # 더미 데이터
├── utils/             # 유틸리티
└── store/             # Zustand 상태관리
```

## 빌드

```bash
npm run build
```

## 데이터

- **339개 농장 데이터 (2025년 실제 인증 농장 현황 기준)**
- 축종별 비율: 한우 42개(12.4%), 돼지 187개(55.2%), 젖소 110개(32.4%)
- 전국 17개 시도별 분포
- 실시간 센서 데이터 시뮬레이션
- 출처: [저탄소 축산물인증 시스템](https://liis.go.kr/newlcb/intro/LcbCertificatioFarmsStateMain.do)
