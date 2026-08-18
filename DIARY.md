# 콜미토닥이 작업 다이어리

## 현재 상태 — 2026-08-17

- 새 프로젝트 루트: `/Users/ssm/Documents/Codex/callme-todaki`
- Template1에서 복제한 Vinext/Cloudflare Sites 구조를 사용한다.
- 이전 `스타토닥이` 프로젝트는 읽기 전용 아카이브이며 새 런타임과 분리한다.
- 오너 지역·검색어·이미지 범위는 `docs/OWNER_BRIEF.md`에 잠갔다.
- 홈·고정 4페이지·지역 162페이지의 콘텐츠와 메타데이터를 구현했다.
- 콜미토닥이 전용 원본 19장을 검수했고, 지역 18장은 `14×6 + 4×5`로 104개 경로에 배정했다.
- 57개 반응형 WebP와 이미지 매니페스트를 활성화했다.
- `SUPERSEDED (2026-08-15 production launch)`: 공개·배포 전 `noindex` 상태는
  실제 `https://callmetodak2.kr` 배포와 index/follow·robots Allow 정책으로
  대체됐다.
- 2026-08-17 `/rss.xml` 2건과 170개 sitemap URL의 실제 trailing-slash
  canonical 정렬을 구현·검증해 운영 릴리스 변경으로 묶었다.
- 네이버 신규 등록의 공통 절차는 소유확인 → sitemap·RSS 제출 →
  `설정 → 수집 주기 설정 → 빠르게`이며, CAPTCHA·추가 인증은 보이는 브라우저에서
  오너가 직접 처리하도록 넘긴다.

## 활동 기록 — 최신순

### 2026-08-18 — 공개 README 운영 정보 정리

- 사용자 지시: 공개 GitHub README에서 운영 사이트와 검색 피드 구조를 정확하고
  자연스럽게 설명하되 백링크 효력을 과장하거나 검색어를 반복하지 않는다.
- README 상단에 공식 운영 링크를 두고 지역·가격·가이드·공지·블로그, sitemap과
  RSS의 실제 200 URL을 연결했다. 로컬 템플릿 절대 경로는 공개 문서에서 제거했다.
- 현재 운영 범위인 지역 162개와 sitemap 170개, RSS 글 2건, trailing-slash
  canonical·robots 허용 정책을 소스와 운영 응답에 맞춰 기록했다.
- 검증: 공개 Markdown 링크 응답, README 수치와 sitemap/RSS 건수, `git diff --check`를
  확인했다. 앱 코드는 바꾸지 않았으므로 빌드는 다시 실행하지 않았다.

### 2026-08-17 — RSS 구현 및 Google 하위 URL 색인 기술 감사

- 사용자 지시: 네이버 제출용 RSS를 만들고, Google `site:` 검색에서 홈만 보이는
  원인이 robots·canonical·sitemap 등 기술 차단인지 확인해 명확한 결함을 고친다.
- 운영 증거: `https://callmetodak2.kr`의 홈·지역·블로그 대표 URL은 trailing-slash
  주소에서 HTTP 200, `index, follow`, self-canonical·same-origin OG를 반환한다.
  `robots.txt`는 `Allow: /`, sitemap은 same-origin 170 URL이며 X-Robots/noindex는
  없다. 정적 홈→8개 광역→하위 지역과 블로그 내부 링크도 실제 200 canonical
  trailing-slash 주소로 렌더된다.
- 확인된 결함: 운영 sitemap의 홈 외 169개 URL은 슬래시 없는 주소라 모두 실제
  200 canonical 대신 301 별칭을 가리켰다. `canonicalUrl()`로 sitemap 170개를
  실제 trailing-slash 200 주소로 정렬하고 BlogPosting JSON-LD도 같은 canonical과
  실제 최초 운영 commit 시각을 사용하도록 수정했다.
- RSS: 2026-08-15 최초 운영 commit `eadecf8`의 실제 시각을 두 글의
  `publishedAt/modifiedAt`으로 기록했다. `/rss.xml`은 블로그 2건의 본문 전체,
  same-origin canonical/GUID, `ko-KR`, 안정적인 lastBuildDate를 제공하며 지역
  162개는 sitemap에만 둔다. 루트 layout에 RSS autodiscovery를 정확히 1개 넣었다.
- 검증: RSS focused 2/2, 전체 test 22/22, `tsc --noEmit`, lint 오류 0(기존 img
  warning 4), Netlify 정적 build 175페이지, built audit 170 canonical URL·RSS
  item 2·19원본·57 WebP, `xmllint`가 통과했다. `out/rss.xml`은 7,914 bytes이며
  lastBuildDate는 `Sat, 15 Aug 2026 04:11:46 GMT`다. 최초 sandbox build는 내부
  port 제한으로 실패했고 동일 명령을 허용 환경에서 재실행해 PASS했다.
- 판정/후속 확인: robots/noindex/누락 static HTML 같은 하위 페이지 전면 차단은
  없다. `site:`는 색인 URL 전수를 보장하지 않으므로 개별 URL은 Search Console
  URL 검사로 판단한다. 배포 뒤 운영 `/sitemap.xml`과 `/rss.xml`의 200 응답 및
  Search Console 재처리를 확인한다.

### 2026-08-16 08:28 KST — GA4 페이지·전화 CTA 계측 스캐폴딩

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`가 유효한 `G-` 형식일 때만 GA4를 빌드 결과에 포함하도록 했다. App Router 최초 진입·경로 변경에는 query/hash 없는 `page_path`·`page_location`, 개인정보 형태를 제거하고 100자로 제한한 `page_title`, `page_type`, `platform_id=callme-todaki`를 수동 `page_view`로 보낸다.
- 문서 전체 `tel:` 링크를 위임 클릭으로 포착해 `phone_cta_clicked`를 보내며 `cta_location`은 명시 data 속성 또는 표시 문구에서 만들고 전화번호·이메일·href는 전송하지 않는다. 이 이벤트는 통화 연결이 아니라 클릭 의도만 뜻한다. 실제 유효 콜은 콜트래킹 번호와 통신사 webhook/Measurement Protocol을 통한 별도 연결 이벤트가 필요하다.
- Netlify 환경 변수 키와 GA4 맞춤 측정기준·중복 page view 방지 설정·전화 전환 한계를 README와 `docs/ANALYTICS.md`에 기록했다. 실제 GA 속성 생성, 운영 측정 ID 등록, 배포·push는 하지 않았다.
- 검증: analytics 계약 5/5 PASS, 변경 파일 ESLint PASS, `tsc --noEmit` PASS. 가짜 ID를 넣은 `build:netlify`와 환경변수를 뺀 `build:netlify`가 모두 PASS(정적 174페이지, Netlify export 170 URL)했고, 생성 HTML에서 전자는 태그 존재·후자는 GA 태그 0건을 확인했다. 기본 Vinext `npm run build`는 5단계 컴파일 뒤 기존 동적 경로 164개의 trailing-slash 308 prerender 문제로 실패했으며 GA 코드 컴파일 오류는 없었다.

### 2026-08-15 — 긴급 요청 지역 70개 검색 범위 반영

- 요청 지역명 70개 중 기존 정본과 같은 14개는 중복 URL을 만들지 않고 유지했다.
- 신규 요청 페이지 56개와 부산 카드 계층용 부산진구·수영구 2개를 추가해 지역 그래프를 104개에서 162개로 확장했다.
- 각 신규 페이지는 정확한 상위 지역의 하위 카드로 연결하고 sitemap 전체 범위를 170개 URL로 확대했다.
- MassageBom의 같은 지역 원문이 있는 곳은 가볍게 재작성했고, 홍대·건대·월미도처럼 정확한 행정동 원본이 없는 명칭은 가까운 지역을 참고하되 Callme 고유 adaptation으로 명시했다.
- 기존 104개 지역의 19원본·57 WebP 릴리스와 원본당 6회 제한은 변경하지 않았다. 신규 지역은 후속 이미지 릴리스 전까지 무이미지 fallback을 사용한다.

### 2026-08-15 — 토닥이 전용 단일 코스·하단 지역 카드 확정

- 기존 타이·아로마·힐링·스페셜 코스를 제거하고 `센슈얼 감성 테라피` 한 가지로 교체했다.
- 가격은 60분 120,000원 / 90분 150,000원 / 120분 180,000원으로 홈, 가격안내, 104개 지역 페이지가 같은 정본을 사용한다.
- 단일 코스 가격표를 데스크톱에서는 넓은 보드, 모바일에서는 읽기 쉬운 행 형태로 확대했다.
- 가격표 위치는 유지하고 홈 광역 지역 카드와 지역별 하위 지역 카드 목록만 각 본문의 마지막 섹션으로 옮겼다.
- 토닥이 계열 재사용 규칙을 공용 `platform-template-factory-v1/TODAKI_PLATFORM_PROFILE.md`에 기록했다.
- 전체 계약 테스트 15/15, lint 오류 0, Netlify 정적 export 112 URL과 기존 이미지 19원본·57 WebP 검증을 통과했다.

### 2026-08-15 — 블로그·공지사항 서브페이지 추가

- 상단 페이지바와 지역 공통 헤더에 `블로그`, `공지사항` 링크를 추가했다.
- `/blog` 허브와 서로 다른 문장으로 작성한 이용 안내 글 2개를 추가하고, 관련 글·지역 안내·전화상담 내부 링크를 연결했다.
- 각 글에 고유 metadata와 BlogPosting JSON-LD를 넣었고 sitemap은 112개 URL로 갱신했다.
- `/notice`는 날짜를 꾸미지 않고 24시간 전화상담·100% 현장 후불·현장 카드 결제의 확인된 공지만 게시했다.
- 이미지 릴리스는 ACTIVE 19개 원본·57개 WebP·104개 지역 계약 그대로 유지했다.

### 2026-08-15 — 콜미토닥이 콘텐츠·이미지 릴리스 후보 완성

- MassageBom의 동일 지역 의미를 기준으로 지역 99개를 가볍게 재작성하고, 정본에 없는 청주 5개는 지역 사실만으로 작성했다.
- 경기 28개 시 표기는 `경기수원` 같은 결합형을 제거하고 `수원토닥이` 형식으로 정리했다.
- 홈·고정 페이지·지역 페이지의 canonical, OG, Twitter, noindex와 109개 sitemap URL을 연결했다.
- GPT Image 기반 신규 원본 19장을 루트에서 시각 검수했다. 템플릿과 Massage Love 이미지는 재사용하지 않았다.
- 홈 1장과 지역 18장을 데스크톱·태블릿·모바일 WebP 57개로 파생했고, 원본당 최대 6회 제한을 지켰다.
- 상단 페이지바는 각 배너 상단 팔레트보다 짙은 반투명 그라데이션과 blur를 사용한다.
- 실제 도메인·배포·서치어드바이저 전까지 noindex와 robots 전체 차단을 유지한다.

### 2026-08-15 — 스타토닥이 → 콜미토닥이 전면 재시작

- 브랜드를 `콜미토닥이`로 변경하고 기존 사이트 틀을 폐기하기로 했다.
- 정확한 디자인 정본은
  `/Users/ssm/Documents/Services/Templetes/Template1`이다.
- 지역은 서울·인천·경기+천안·아산·청주·대전의 행정시·행정구 104개로
  제한하고 동·읍·면·군 페이지는 제외한다.
- 핵심 검색어는 지역명을 붙인 토닥이·여성전용마사지·여성전용출장마사지다.
- 지역 이미지는 신규 생성하며 원본당 최대 6개 경로만 배정한다.
