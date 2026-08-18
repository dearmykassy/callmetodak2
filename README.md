# 콜미토닥이

[콜미토닥이 공식 사이트](https://callmetodak2.kr/)

콜미토닥이는 서울·인천·경기·충청권·부산의 지역별 이용 범위, 단일 코스와
예약 전 확인사항을 제공하는 여성전용 방문 마사지 안내 사이트입니다. 콘텐츠와
이미지는 이 플랫폼용으로 별도 관리합니다.

## 운영 페이지

- [지역 안내](https://callmetodak2.kr/areas/)
- [가격 안내](https://callmetodak2.kr/pricing/)
- [이용 가이드](https://callmetodak2.kr/guide/)
- [공지사항](https://callmetodak2.kr/notice/)
- [블로그](https://callmetodak2.kr/blog/)
- [XML 사이트맵](https://callmetodak2.kr/sitemap.xml)
- [RSS 2.0 피드](https://callmetodak2.kr/rss.xml)

## 지역 안내와 검색 구조

- 지역 페이지 162개는 8개 상위 권역, 100개 행정 허브와 요청 세부 지역 54개로
  구성됩니다.
- 요청 세부 지역은 정확한 상위 지역 페이지의 카드에서 연결합니다.
- 사이트맵에는 홈, 고정 안내, 블로그와 지역 페이지를 합친 170개 canonical URL이
  있으며 모두 실제 200 응답의 trailing-slash 주소를 사용합니다. 각 URL의 `lastmod`는
  블로그 `modifiedAt` 또는 확인된 route-group 콘텐츠 revision 시각으로 고정하고,
  빌드만 다시 했을 때 날짜가 바뀌지 않습니다.
- `robots.txt`는 공개 페이지 수집을 허용하고 사이트맵 위치를 안내합니다.
- RSS에는 실제 발행일이 확인된 블로그 글 2건의 본문을 싣고, 지역 URL 전체 목록은
  사이트맵에서 관리합니다.

각 페이지의 title, description, H1과 본문은 지역별로 구분합니다. 확인되지 않은
도착 시간, 후기, 효능, 인력 규모나 배정 약속은 만들지 않으며 상위 지역에서 세부
지역으로 이어지는 내부 링크를 유지합니다.

존재하지 않는 URL은 404와 `noindex`를 반환하며 홈 canonical을 상속하지 않습니다.
운영 빌드의 내부 링크는 중앙 Link 래퍼를 통해 자동 prefetch를 끄므로, 사용자가
누르지 않은 `_rsc` 변형 URL을 미리 요청하지 않습니다.

## 개발과 검증

```bash
npm install
npm run dev
npm test
npm run test:rss
npm run lint
npm run build:netlify
```

이미지 원본 검수와 배정은 프로젝트 밖의 공용 파이프라인에서 끝낸 뒤 아래 명령으로만 활성화합니다.

```bash
npm run images:release:callme
```

이 명령은 기존 104개 지역에 대해 봉인된 이미지 릴리스만 재현합니다. 새 세부 지역은 별도 이미지 릴리스가 만들어질 때까지 안전한 무이미지 배너 fallback을 사용하며, 기존 원본당 최대 6회 계약은 변경하지 않습니다.

## GA4 환경 변수

Netlify의 `Site configuration → Environment variables`에 사이트 전용 GA4 웹 스트림
값을 빌드 환경 변수로 등록합니다.

```text
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

값이 없거나 잘못된 형식이면 계측 코드는 출력되지 않습니다. 이벤트와 개인정보
제외 규칙은 [`docs/ANALYTICS.md`](docs/ANALYTICS.md)를 따릅니다.
