# 콜미토닥이 작업 규칙

1. 작업 시작 전 `DIARY.md`와 `docs/OWNER_BRIEF.md`를 읽는다.
2. 기존 `/Users/ssm/Documents/Codex/star-todaki` UI·이미지·생성 콘텐츠를
   가져오지 않는다. 기존 폴더는 읽기 전용 아카이브다.
3. 시각 구조는 `/Users/ssm/Documents/Services/Templetes/Template1`을 기준으로
   유지한다. 템플릿의 placeholder 문구와 이미지 바이트는 출시물로 쓰지 않는다.
4. 기본 지역 범위는 서울·인천·경기 + 천안·아산·청주·대전의 행정시·행정구다.
   2026-08-15 오너 긴급 지시로 `docs/OWNER_BRIEF.md`에 고정한 70개 지역명은 예외적으로
   세부 지역 페이지를 만들며, 각 페이지는 정확한 상위 지역 페이지의 카드에서 연결한다.
   이 확장에는 부산 root와 해운대·서면·광안리도 포함한다.
5. 핵심 검색어는 지역명을 붙인 `토닥이`, `여성전용마사지`,
   `여성전용출장마사지`다. 반복 삽입보다 자연스러운 제목·소개를 우선한다.
6. 운영 사실·결제·상담 문구는 MassageBom의 검증된 정본을 사용한다. 가격은
   오너가 확정한 토닥이 전용 단일 코스(`센슈얼 감성 테라피`)를 우선한다.
   지역 소개는 같은 지역 페이지를 의미 기준으로 가볍게 재작성한다.
7. 근거 없는 후기·도착 시간·효능·인력·경력·평점·배정 약속을 만들지 않는다.
8. 이미지는 콜미토닥이 전용으로 새로 만든다. Massage Love 또는 MassageBom
   이미지를 복사하지 않으며 지역 원본 한 장의 최대 배정은 6개 경로다.
9. 검증은 빠르게 한다: 현재 전체 경로의 데이터/메타/본문 중복 코드 검사, build 1회,
   대표 root·city/gu 렌더만 확인한다. 전 경로 GUI 감사나 반복 build는 하지 않는다.
10. 실제 도메인과 공개 승인이 확정되기 전에는 `noindex`를 유지한다.
11. 이후 모든 플랫폼은 sitemap과 함께 `/rss.xml`을 출시한다. RSS 2.0 피드에는
    실제 발행일이 확인된 최신 편집 콘텐츠만 본문 전체로 싣고, 같은 출처의 200 응답
    canonical URL을 `link`와 영구 GUID로 사용한다. 빌드 시각으로 새 글처럼 보이게 하지
    않으며, `ko-KR`, XML escaping, 1개 이상 item, 10MB 미만, 홈 RSS autodiscovery와
    정적 export 계약을 테스트한다. 전체 지역 URL 목록은 RSS가 아니라 sitemap에 둔다.
12. 이후 네이버 사이트 등록은 소유확인 뒤 sitemap과 RSS를 제출하고,
    `설정 → 수집 주기 설정 → 빠르게`를 적용한다. CAPTCHA나 추가 인증이 나오면
    우회하지 않고 사용자가 볼 수 있는 브라우저 화면을 유지한 채 직접 처리를 넘긴다.
13. 지역 검색 메타(title·keywords·description)의 주 표기는 고객이 실제 검색하는
    축약 지역명을 쓴다. 정식 행정명 토큰 끝의 `특별자치도·특별자치시·특별시·광역시·도·시`는
    가장 긴 접미사부터 제거해 `서울·인천·경기·수원`처럼 만들되, `구·군·읍·면·동·리`는
    일괄 제거하지 않는다. `송도·월미도·여의도` 같은 고유 지명은 정식 행정명 allowlist에
    없으면 자르지 않고, 동명 지역은 동일하게 축약한 상위 지역명을 붙여 구분한다. 이 규칙은
    검색 메타에만 적용하며 URL·canonical과 화면 H1·본문·breadcrumb·schema의 정식 지역명은
    바꾸지 않는다. 모든 지역 경로의 세 메타 필드와 고유성 회귀 테스트를 함께 유지한다.
14. sitemap `<lastmod>`는 페이지가 실제로 의미 있게 바뀐 commit/영수증 시각을
    route group별 고정 상수로 관리한다. 블로그 글은 각 글의 `modifiedAt`을 그대로 쓰고,
    빌드 시각·`Date.now()`로 전체 URL을 갱신하지 않는다. Google이 무시하는 sitemap
    `priority`·`changefreq`는 내보내지 않는다. 홈 canonical/index metadata는 홈 route에
    두어 404 HTML이 홈 canonical 또는 index 지시를 상속하지 않게 유지한다.
15. 내부 Next 링크는 `src/components/SiteLink.tsx`만 사용한다. 이 중앙 래퍼는
    운영 빌드에서 `prefetch={false}`를 강제해 자동 `_rsc` prefetch 요청이 검색봇의
    crawl budget을 소비하지 않게 한다. 래퍼 외 `next/link` 직접 import를 금지하고
    전체 app/src import 회귀 테스트를 유지한다.
