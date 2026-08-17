# 콜미토닥이

서울·인천·경기·충청권·부산을 대상으로 하는 여성전용 출장마사지 안내 사이트입니다. `/Users/ssm/Documents/Services/Templetes/Template1`의 와인·골드 레이아웃을 바탕으로 새 콘텐츠와 새 이미지만 사용합니다.

## 현재 범위

- 홈 1개, 고정 안내 4개, 블로그 허브 1개·게시물 2개, 지역 162개
- 지역 범위: 8개 상위 권역 + 100개 행정 허브 + 오너 요청 세부 지역 54개
- 요청 지역은 해당 상위 지역 페이지의 카드에서 직접 연결
- 지역별 핵심 검색어: 토닥이, 여성전용마사지, 여성전용출장마사지
- 지역 이미지 18장, 원본당 최대 6개 경로 배정
- 별도 홈 이미지 1장
- sitemap 170개 canonical URL
- `/rss.xml`: 실제 발행일이 있는 블로그 글 2개의 본문 전체를 담은 RSS 2.0 피드

## 명령

```bash
npm install
npm run dev
npm test
npm run test:rss
npm run lint
npm run build:netlify
```

## GA4 환경 변수

Netlify의 `Site configuration → Environment variables`에 사이트 전용 GA4 웹 스트림 값을 빌드 환경 변수로 등록합니다.

```text
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

값이 없거나 잘못된 형식이면 계측 코드는 출력되지 않습니다. 이벤트와 개인정보 제외 규칙은 `docs/ANALYTICS.md`를 따릅니다.

이미지 원본 검수와 배정은 프로젝트 밖의 공용 파이프라인에서 끝낸 뒤 아래 명령으로만 활성화합니다.

```bash
npm run images:release:callme
```

이 명령은 기존 104개 지역에 대해 봉인된 이미지 릴리스만 재현합니다. 새 세부 지역은 별도 이미지 릴리스가 만들어질 때까지 안전한 무이미지 배너 fallback을 사용하며, 기존 원본당 최대 6회 계약은 변경하지 않습니다.

## 검색 피드

- 운영 canonical, OG URL, sitemap, robots는 `https://callmetodak2.kr`을 사용합니다.
- sitemap은 홈·고정·블로그·지역 HTML 170개를 모두 담고, RSS는 날짜가 확인된 최신 블로그 글만 본문 전체로 제공합니다.
- RSS URL: `https://callmetodak2.kr/rss.xml`
- 네이버 서치어드바이저에는 사이트 소유확인 뒤 sitemap과 RSS를 각각 제출합니다.
