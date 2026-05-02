# 설치 및 실행 가이드

## 1. 현재 상태
✅ 프로젝트 완료
✅ 개발 서버 실행 중: http://localhost:5173

## 2. Google Maps API 설정 (필수)

### API 키 발급
1. https://console.cloud.google.com/ 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "사용자 인증 정보" 클릭
4. "사용자 인증 정보 만들기" > "API 키" 클릭
5. "Maps JavaScript API" 활성화
6. API 키 복사

**무료 크레딧**: 매월 $200 무료 (신용카드 등록 필요)

### API 키 적용
`src/pages/MapPage.tsx` 파일 9번째 줄 수정:

**변경 전:**
```typescript
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';
```

**변경 후:**
```typescript
const GOOGLE_MAPS_API_KEY = '여기에_발급받은_API_키_입력';
```

## 3. 실행 명령어

```bash
# 의존성 설치 (최초 1회)
npm install

# 개발 서버 실행
npm run dev

# 빌드 (배포용)
npm run build
```

## 4. 주요 파일 위치

- 메인 페이지: `src/pages/MapPage.tsx`
- 대시보드: `src/pages/DashboardPage.tsx`
- 더미 데이터: `src/data/index.ts`
- 스타일: `src/index.css`, `tailwind.config.js`

## 5. 브라우저에서 확인

http://localhost:5173

## 6. 프로젝트 구조

```
src/
├── components/
│   ├── common/          # Header, Sidebar, Card 등
│   ├── dashboard/       # 농장 정보, 센서 배치도, 가스 게이지
│   ├── charts/          # 배출량 차트
│   └── alerts/          # 알림 목록
├── pages/
│   ├── MapPage.tsx      # 전국 지도
│   └── DashboardPage.tsx # 농장 대시보드
├── data/                # 339개 농장 데이터
├── types/               # TypeScript 타입
└── store/               # 상태 관리
```

## 7. 데이터 설명

- **농장 수**: 339개 (2025년 실제 저탄소 축산물 인증 농장 현황)
- **축종 비율**: 한우 42개(12.4%), 돼지 187개(55.2%), 젖소 110개(32.4%)
- **측정 가스**: CH4(메탄), CO2(이산화탄소), N2O(아산화질소), NH3(암모니아)
- **센서**: 농장당 3-8개
- **데이터 출처**: [저탄소 축산물인증 시스템](https://liis.go.kr/newlcb/intro/LcbCertificatioFarmsStateMain.do)

## 8. 주요 기능

1. **전국 지도**: 339개 농장 마커 표시, 클러스터링
2. **필터링**: 축종별, 등급별 필터
3. **대시보드**: 농장 정보, 센서 배치도, 실시간 가스 농도
4. **차트**: 시간별 배출량 추이 (오늘/이번주/이번달/올해)
5. **알림**: 배출량 초과 알림, 절감 가이드

## 문제 해결

### 구글 맵이 안 보일 때
- API 키 확인 (`src/pages/MapPage.tsx`)
- Maps JavaScript API가 활성화되어 있는지 확인
- 개발자 도구(F12) Console 탭에서 에러 확인
- 무료 크레딧 한도 확인 ($200/월)

### 포트 충돌 시
```bash
# Ctrl+C로 서버 종료 후
npm run dev -- --port 3000
```
