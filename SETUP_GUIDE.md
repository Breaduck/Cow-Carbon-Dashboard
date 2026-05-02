# 설치 및 실행 가이드

## 1. 현재 상태
✅ 프로젝트 완료
✅ 개발 서버 실행 중: http://localhost:5173

## 2. Kakao Map API 설정 (필수)

### API 키 발급
1. https://developers.kakao.com 접속
2. 로그인 후 '내 애플리케이션' 클릭
3. '애플리케이션 추가하기' 클릭
4. 앱 이름 입력 후 저장
5. 'JavaScript 키' 복사

### API 키 적용
`index.html` 파일 6번째 줄 수정:

**변경 전:**
```html
<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_APP_KEY&libraries=clusterer,services"></script>
```

**변경 후:**
```html
<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=여기에발급받은키입력&libraries=clusterer,services"></script>
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

### 카카오맵이 안 보일 때
- API 키 확인
- 개발자 도구(F12) Console 탭에서 에러 확인
- API 키 없어도 하단 농장 목록으로 데이터 확인 가능

### 포트 충돌 시
```bash
# Ctrl+C로 서버 종료 후
npm run dev -- --port 3000
```
