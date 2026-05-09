# Cloudflare Pages 배포 설정

## 환경 변수 설정 (한 번만 설정)

1. Cloudflare Pages 대시보드 접속
   - https://dash.cloudflare.com/08571ac869c9f59b8298b94148b8b515/pages/view/cow-carbon-dashboard

2. Settings → Environment variables 이동

3. 다음 환경 변수 추가:
   ```
   Variable name: VITE_GOOGLE_MAPS_API_KEY
   Value: [구글 맵 API 키 입력]
   ```

4. **Production과 Preview 모두 체크** (한 번 설정하면 계속 유지됨)

5. Save 클릭

## 빌드 설정

빌드 명령: `npm run build`
빌드 출력 디렉토리: `dist`

## 주의사항

- `.env` 파일은 로컬 개발용으로만 사용
- `.env` 파일은 Git에 커밋되지 않음 (`.gitignore`에 포함)
- Cloudflare는 대시보드에서 설정한 환경 변수 사용
- 환경 변수는 한 번 설정하면 모든 배포에 자동 적용됨
