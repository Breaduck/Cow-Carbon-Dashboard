# Cloudflare Pages 환경 변수 설정 가이드

## 🚨 중요: 환경 변수는 선택사항입니다
- Google Maps API 키가 **없어도 빌드는 성공**합니다
- 지도 기능만 작동하지 않고, 나머지는 정상 작동합니다
- **환경 변수가 빌드 실패 원인이 아닙니다**

---

## 📋 Cloudflare Pages 빌드 설정 확인

### 1단계: Cloudflare Pages 대시보드 접속
```
https://dash.cloudflare.com/08571ac869c9f59b8298b94148b8b515/pages/view/cow-carbon-dashboard
```

### 2단계: Settings 탭 클릭
왼쪽 메뉴에서 **Settings** 클릭

### 3단계: Builds & deployments 확인
**Build configuration** 섹션에서 다음 설정 확인:

#### ✅ 올바른 설정:
```
Framework preset: None (또는 Vite)
Build command: npm run build
Build output directory: /dist
Root directory: /
```

#### ❌ 잘못된 설정 예시:
- Build command가 비어있음
- Build output directory가 `/build` (틀림!)
- Node.js 버전이 16 이하

---

## 🔧 빌드 설정 수정 방법

### 1단계: Settings → Builds & deployments
### 2단계: Build configuration 섹션에서 우측 상단 **Edit configuration** 클릭
### 3단계: 다음과 같이 입력:

```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: (Path) /
```

### 4단계: **Save** 클릭

---

## 🌍 환경 변수 설정 (Google Maps API)

### 1단계: Settings → Environment variables 이동

### 2단계: 우측 상단 **Add variables** 클릭

### 3단계: 변수 추가
```
Variable name (정확히 입력):
VITE_GOOGLE_MAPS_API_KEY

Value (구글 맵 API 키 입력):
[여기에 API 키 붙여넣기]
```

### 4단계: Environment 선택
- ✅ **Production** 체크
- ✅ **Preview** 체크 (선택사항, 프리뷰에서도 지도 보려면 체크)

### 5단계: **Save** 클릭

---

## 🔄 재배포 방법

환경 변수를 추가한 후:

### 방법 1: Git Push로 자동 배포
```bash
git commit --allow-empty -m "Trigger rebuild"
git push
```

### 방법 2: Cloudflare에서 수동 재배포
1. Deployments 탭 클릭
2. 최신 배포 우측의 **...** (점 3개) 클릭
3. **Retry deployment** 클릭

---

## ❗ 자주 하는 실수

### 1. 변수명 오타
❌ `VITE_GOOGLE_MAP_API_KEY` (끝에 S 빠짐)
✅ `VITE_GOOGLE_MAPS_API_KEY` (정확한 이름)

### 2. 환경 선택 안 함
- Production이나 Preview를 체크 안 하면 적용 안 됨

### 3. 재배포 안 함
- 환경 변수 추가 후 **반드시 재배포** 필요

---

## 🐛 빌드 실패 해결

### 빌드 로그 확인 방법:
1. Deployments 탭 클릭
2. 실패한 배포 클릭
3. 빌드 로그 전체 확인

### 일반적인 에러:

#### 1. `npm ERR! code ELIFECYCLE`
→ package.json의 scripts 확인

#### 2. `Error: Cannot find module`
→ dependencies 누락, `npm install` 필요

#### 3. `TypeScript error`
→ 코드에 타입 에러 있음, 로컬에서 `npm run build` 테스트

#### 4. `ENOENT: no such file or directory`
→ Build output directory 설정이 틀림 (`dist` 여야 함)

---

## ✅ 테스트 방법

### 로컬에서 빌드 테스트:
```bash
cd "C:\Users\hiyoo\코딩\축산 저탄소 실측"
npm run build
```

성공하면 `dist` 폴더 생성됨

### 환경 변수 테스트:
```bash
# .env 파일에 추가
VITE_GOOGLE_MAPS_API_KEY=your_key_here

# 개발 서버 실행
npm run dev
```

브라우저에서 지도가 표시되는지 확인

---

## 📞 추가 도움이 필요하면

빌드 실패 시 다음 정보 제공:
1. Cloudflare 빌드 로그 전체 (Deployments → 실패한 배포 클릭)
2. 로컬 빌드 결과 (`npm run build` 실행 결과)
3. Cloudflare Build configuration 스크린샷
