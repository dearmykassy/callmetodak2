import {
  getHomeHeroImage,
  getImageHeaderStyle,
} from "@/src/data/image-release";
import { formatPrice, OPERATING_FACTS } from "@/src/data/callme-regions";
import Link from "@/src/components/SiteLink";
import type { Metadata } from "next";

// Home-only metadata must live on the home route rather than the root layout.
// Otherwise Next's generated 404 inherits the homepage canonical/index policy.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

const homeHeroImage = getHomeHeroImage();
const PHONE = "0508-202-3906";
const TEL = "tel:05082023906";
const serviceAreas = [
  ["서울", "/areas/seoul"],
  ["인천", "/areas/incheon"],
  ["경기", "/areas/gyeonggi"],
  ["천안", "/areas/cheonan"],
  ["아산", "/areas/asan"],
  ["청주", "/areas/cheongju"],
  ["대전", "/areas/daejeon"],
  ["부산", "/areas/busan"],
] as const;

const policies = [
  ["01", "24시간 전화상담", "지역과 희망 시간을 알려주시면 가능한 일정을 확인합니다."],
  ["02", "선입금 없는 현장 후불", "이용 금액은 사전 송금 없이 현장에서 결제합니다."],
  ["03", "현장 카드 결제", "현장에서 카드로 결제할 수 있습니다."],
] as const;

const faq = [
  ["질문 1. 선입금이 정말로 전혀 없나요?", "답변. 네, 어떠한 사전 예약금도 없는 100% 현장 후불제입니다."],
  ["질문 2. 콜미토닥이 서비스 지역 방문이 가능한가요?", "답변. 방문 가능 여부는 희망 날짜와 시각을 함께 알려주시면 예약 확정 전에 확인해 드립니다."],
  ["질문 3. 전화상담에서 무엇을 확인하나요?", "답변. 서비스를 받을 정확한 주소, 희망 시각, 코스와 이용 시간은 전화상담에서 확인합니다."],
  ["질문 4. 현장 카드 결제가 가능한가요?", "답변. 네, 무선 단말기를 소지하여 현장에서 즉시 결제 가능합니다."],
  ["질문 5. 커플/부부 관리도 되나요?", "답변. 네, 2인 동시 관리 프로그램이 완비되어 있습니다."],
  ["질문 6. 새벽 시간에도 이용 가능하나요?", "답변. 네, 365일 24시간 연중무휴로 운영됩니다."],
  ["질문 7. 위생 관리는 철저한가요?", "답변. 네, 일회용 비품 사용 및 철저한 소독을 준수합니다."],
] as const;

export default function Home() {
  return (
    <main className="page-canvas">
      <div className="site-shell">
        <header className={`topbar${homeHeroImage ? " image-header" : ""}`} style={getImageHeaderStyle(homeHeroImage)}>
          <a className="logo" href="#top" aria-label="콜미토닥이 홈"><img className="logo-mark" src="/callme-todaki-mark.svg" alt="" width="34" height="34" aria-hidden="true" /><span>콜미토닥이</span></a>
          <div className="header-actions"><Link className="header-link" href="/notice">공지사항</Link><a className="header-button" href={TEL}><span className="button-dot" aria-hidden="true" /> 전화상담</a></div>
        </header>

        <section className={`hero${homeHeroImage ? " hero-with-image" : " hero-placeholder"}`} id="top" aria-label="콜미토닥이 소개">
          {homeHeroImage ? (
            <picture className="hero-media">
              <source media="(max-width: 700px)" srcSet={homeHeroImage.files.mobile} type="image/webp" />
              <source media="(max-width: 1100px)" srcSet={homeHeroImage.files.tablet} type="image/webp" />
              <img src={homeHeroImage.files.desktop} width="1672" height="941" alt="" decoding="async" />
            </picture>
          ) : <><div className="hero-orbit hero-orbit-one" aria-hidden="true" /><div className="hero-orbit hero-orbit-two" aria-hidden="true" /><div className="hero-shine" aria-hidden="true" /></>}
          <div className={`hero-content${homeHeroImage ? ` hero-content-copy-${homeHeroImage.copySide}` : ""}`}><span className="hero-chip">CALL ME, TODAKI</span><h1><span>수도권·충청권·부산</span><span className="gold-text">여성전용 출장마사지</span></h1><p>토닥이 · 여성전용마사지 · 여성전용출장마사지</p></div>
        </section>

        <section className="action-deck" aria-label="빠른 상담과 지역 찾기">
          <div className="action-row"><a className="gold-button" href={TEL}><span className="button-icon" aria-hidden="true">●</span>지금 전화상담</a><a className="outline-button" href="#areas">우리 지역 찾기 <span aria-hidden="true">↓</span></a><span className="action-note">24 HOURS · {PHONE}</span></div>
          <nav className="quick-nav" aria-label="홈 섹션"><a className="active" href="#top">홈</a><a href="#areas">지역 안내</a><a href="#pricing">코스·가격</a><a href="#policy">이용 기준</a><a href="#faq">자주 묻는 질문</a><Link href="/notice">공지사항</Link><Link href="/blog">블로그</Link></nav>
        </section>

        <div className="content-wrap">
          <section className="copy-section notice-section"><h2 className="lined-heading">전화 한 통으로 필요한 정보부터</h2><div className="body-stack"><p>지역, 희망 시간, 코스를 알려주시면 방문 가능 여부를 확인합니다.</p><p>문의는 24시간 전화상담으로 받고 있으며, 안내 내용은 상담 시점의 일정에 따라 확인됩니다.</p></div></section>
          <section className="promise-banner" aria-label="콜미토닥이 운영 원칙"><span>CALLME TODAKI</span><strong>차분하게 확인하고<br />명확하게 안내합니다.</strong><p>서비스 지역과 희망 시간은 전화상담으로 확인해 주세요.</p></section>

          <section className="menu-section" id="pricing"><div className="section-title-row"><div><span className="section-kicker">TODAKI SIGNATURE COURSE</span><h2>센슈얼 감성 테라피 가격</h2></div><p>한 가지 전용 코스를 60분·90분·120분 중에서 선택하세요.</p></div><div className="menu-grid single-course-grid">{OPERATING_FACTS.courses.map((course, index) => <article className="menu-card single-course-card" key={course.name}><div className="menu-card-top"><span>{String(index + 1).padStart(2, "0")}</span><h3>{course.name}</h3></div><p>선입금 없이 이용 후 현장에서 결제합니다.</p><ul>{course.items.map(([minutes, price]) => <li key={minutes}><span>{minutes}분</span><strong>{formatPrice(price)}</strong></li>)}</ul></article>)}</div></section>
          <section className="standard-section" id="policy"><span className="section-kicker">OPERATING PRINCIPLES</span><h2 className="lined-heading">확인된 운영 기준</h2><div className="standard-grid">{policies.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
          <section className="process-section"><span className="section-kicker">HOW TO USE</span><h2>상담은 이렇게 진행됩니다</h2><div className="process-grid">{["지역 선택", "시간 확인", "코스 안내", "현장 결제"].map((title, index) => <article key={title}><span className="step-badge">0{index + 1}</span><div><h3>{title}</h3><p>{index === 0 ? "서비스를 받을 지역을 알려주세요." : index === 1 ? "희망 시간을 함께 확인합니다." : index === 2 ? "가능한 코스를 안내합니다." : "현장에서 후불로 결제합니다."}</p></div></article>)}</div></section>
          <section className="review-section" aria-label="신뢰 안내"><div className="section-title-row"><div><span className="section-kicker">TRUST GUIDE</span><h2>운영 기준을 먼저 보여드립니다</h2></div><span className="review-mark">CALLME</span></div><div className="review-summary"><strong>3가지</strong><span>상담 · 결제 · 지역 확인</span></div><div className="review-grid"><article><div><span>상담</span><small>24H</small></div><p>상담 전 지역과 시간을 먼저 확인합니다.</p><strong>전화상담</strong></article><article><div><span>결제</span><small>ON SITE</small></div><p>선입금 없이 현장 후불로 진행합니다.</p><strong>현장 결제</strong></article><article><div><span>지역</span><small>AREA</small></div><p>광역 지역과 연결 지역을 단계별로 확인합니다.</p><strong>지역 확인</strong></article></div></section>
          <section className="faq-section" id="faq"><span className="section-kicker">FAQ</span><h2>자주 묻는 질문</h2><div className="faq-list">{faq.map(([question, answer], index) => <details key={question} open={index === 0}><summary><span>{question}</span><span className="faq-icon">+</span></summary><p>{answer}</p></details>)}</div></section>
          <section className="copy-section intro-section" id="areas"><span className="section-kicker">SERVICE AREAS</span><h2>내 지역부터 빠르게 확인하세요</h2><div className="body-grid"><p>콜미토닥이는 서비스 주소와 희망 시간을 기준으로 안내합니다. 광역 지역에서 시·구와 연결 지역을 차례로 확인할 수 있습니다.</p><p>원하는 지역을 먼저 선택한 뒤 전화로 일정과 코스를 확인해 보세요. 지역 안내는 정확한 서비스 주소 확인을 돕습니다.</p></div><div className="area-grid" aria-label="서비스 지역">{serviceAreas.map(([area, route]) => <Link href={route} key={route}><span>{area}</span><strong>지역 안내 →</strong></Link>)}</div></section>
        </div>
        <footer className="footer"><a className="logo" href="#top" aria-label="콜미토닥이 홈"><img className="logo-mark" src="/callme-todaki-mark.svg" alt="" width="34" height="34" aria-hidden="true" /><span>콜미토닥이</span></a><p>서울·인천·경기·충청권·부산 여성전용 출장마사지 안내 · 지역과 시간은 전화로 확인해 주세요.</p><div><span>전화상담 {PHONE}</span><span>© 콜미토닥이</span></div></footer>
      </div>
      <a className="floating-button" href={TEL}><span className="button-icon" aria-hidden="true">●</span>전화상담</a>
    </main>
  );
}
