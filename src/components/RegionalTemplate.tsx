import Link from "next/link";

import {
  formatPrice,
  getBreadcrumbs,
  OPERATING_FACTS,
  type CallmeRegion,
  type RegionContent,
} from "@/src/data/callme-regions";
import {
  getImageHeaderStyle,
  getRegionalHeroImage,
} from "@/src/data/image-release";

import styles from "./RegionalTemplate.module.css";

type RegionalTemplateProps = {
  region: CallmeRegion;
  content: RegionContent;
  childRegions: CallmeRegion[];
  nearby: CallmeRegion[];
};

const consultationSteps = [
  ["01", "주소", "서비스를 받을 정확한 주소를 먼저 알려 주세요."],
  ["02", "시간", "희망 시작 시각과 조정 가능한 범위를 함께 확인합니다."],
  ["03", "코스", "확보한 시간에 맞춰 코스와 가격을 비교합니다."],
] as const;

function renderHeroTitle(title: string) {
  const keyword = "여성전용출장마사지";
  const [prefix, suffix] = title.split(keyword);

  if (suffix === undefined) return title;

  return <>{prefix}여성전용<wbr />출장마사지{suffix}</>;
}

export function RegionalTemplate({ region, content, childRegions, nearby }: RegionalTemplateProps) {
  const breadcrumbs = getBreadcrumbs(region);
  const heroImage = getRegionalHeroImage(region.route);

  return (
    <main className={styles.page}>
      <div className={styles.frame}>
        <header className={`${styles.topbar}${heroImage ? ` ${styles.imageHeader}` : ""}`} style={getImageHeaderStyle(heroImage)}>
          <Link className={styles.brand} href="/" aria-label="콜미토닥이 홈">
            <img className={styles.brandMark} src="/callme-todaki-mark.svg" alt="" width="34" height="34" aria-hidden="true" />
            <span>콜미토닥이</span>
          </Link>
          <div className={styles.headerLinks}>
            <Link className={styles.headerNotice} href="/notice">공지사항</Link>
            <Link className={styles.headerBlog} href="/blog">블로그</Link>
            <a className={styles.headerCall} href={OPERATING_FACTS.phone.href}>전화상담 <span aria-hidden="true">↗</span></a>
          </div>
        </header>

        <section className={styles.hero} aria-labelledby="region-title">
          {heroImage ? (
            <picture className={styles.heroMedia}>
              <source media="(max-width: 700px)" srcSet={heroImage.files.mobile} type="image/webp" />
              <source media="(max-width: 1100px)" srcSet={heroImage.files.tablet} type="image/webp" />
              <img src={heroImage.files.desktop} width="1672" height="941" alt="" decoding="async" />
            </picture>
          ) : (
            <div className={styles.heroPlaceholder} aria-hidden="true">
              <span className={`${styles.orbit} ${styles.orbitOne}`} />
              <span className={`${styles.orbit} ${styles.orbitTwo}`} />
              <span className={`${styles.orbit} ${styles.orbitThree}`} />
              <span className={styles.signal} />
            </div>
          )}

          <div className={`${styles.heroInner}${heroImage ? ` ${heroImage.copySide === "right" ? styles.heroCopyRight : styles.heroCopyLeft}` : ""}`}>
            <nav className={styles.breadcrumbs} aria-label="페이지 경로">
              <Link href="/">홈</Link>
              <span>지역 안내</span>
              {breadcrumbs.map((crumb, index) => index === breadcrumbs.length - 1
                ? <span key={crumb.id} aria-current="page">{crumb.label}</span>
                : <Link key={crumb.id} href={crumb.route}>{crumb.label}</Link>)}
            </nav>
            <p className={styles.kicker}>{content.hero.eyebrow}</p>
            <h1 id="region-title">{renderHeroTitle(content.h1)}</h1>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href={OPERATING_FACTS.phone.href}>전화상담 <span aria-hidden="true">↗</span></a>
              <a className={styles.secondaryButton} href="#price">코스·가격 보기 <span aria-hidden="true">↓</span></a>
            </div>
            <dl className={styles.facts}>
              <div><dt>상담</dt><dd>24시간 전화상담</dd></div>
              <div><dt>결제</dt><dd>현장 후불</dd></div>
              <div><dt>카드</dt><dd>현장 결제 가능</dd></div>
            </dl>
          </div>
        </section>

        <div className={styles.content}>
          <section className={styles.stepsSection} aria-labelledby="steps-title">
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.kicker}>CALL PREP</p>
                <h2 id="steps-title">상담 전 세 가지만 확인하세요</h2>
              </div>
              <p>순서를 정리하면 전화상담에서 필요한 정보를 빠뜨리지 않기 쉽습니다.</p>
            </div>
            <ol className={styles.steps}>
              {consultationSteps.map(([number, title, copy]) => (
                <li key={number}>
                  <span>{number}</span>
                  <div><h3>{title}</h3><p>{copy}</p></div>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.intro} aria-labelledby="intro-title">
            <p className={styles.kicker}>LOCAL INTRO</p>
            <h2 id="intro-title">{content.intro.heading}</h2>
            <div className={styles.introCopy}>
              {content.intro.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </section>

          <section className={styles.priceSection} id="price" aria-labelledby="price-title">
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.kicker}>TODAKI SIGNATURE COURSE</p>
                <h2 id="price-title">센슈얼 감성 테라피 시간별 가격</h2>
              </div>
              <p>60분·90분·120분 중 이용 시간을 고른 뒤 실제 일정은 전화상담으로 확인해 주세요.</p>
            </div>
            <div className={`${styles.courseGrid} ${styles.singleCourseGrid}`}>
              {OPERATING_FACTS.courses.map((course, index) => (
                <article className={`${styles.courseCard} ${styles.singleCourseCard}`} key={course.name}>
                  <div className={styles.courseCardHead}><span>{String(index + 1).padStart(2, "0")}</span><h3>{course.name}</h3></div>
                  <ul>
                    {course.items.map(([minutes, price]) => <li key={minutes}><span>{minutes}분</span><strong>{formatPrice(price)}</strong></li>)}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.principles} aria-labelledby="principles-title">
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.kicker}>OPERATING PRINCIPLES</p>
                <h2 id="principles-title">확인된 운영 기준</h2>
              </div>
              <p>{OPERATING_FACTS.availabilityNotice}</p>
            </div>
            <div className={styles.principleGrid}>
              {content.principles.map((principle, index) => (
                <article key={principle.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{principle.title}</h3>
                  <p>{principle.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.faq} aria-labelledby="faq-title">
            <p className={styles.kicker}>FAQ</p>
            <h2 id="faq-title">자주 묻는 질문</h2>
            <div className={styles.faqList}>
              {content.faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary><span>{faq.question}</span><b aria-hidden="true">+</b></summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {nearby.length > 0 ? (
            <section className={styles.nearby} aria-labelledby="nearby-title">
              <div className={styles.sectionHead}>
                <div>
                  <p className={styles.kicker}>NEARBY GUIDE</p>
                  <h2 id="nearby-title">함께 살펴볼 지역</h2>
                </div>
                <p>서비스 주소의 상위 지역이 다르면 해당 경로에서 다시 확인하세요.</p>
              </div>
              <div className={styles.nearbyLinks}>
                {nearby.map((nearbyRegion) => <Link key={nearbyRegion.id} href={nearbyRegion.route}>{nearbyRegion.label} <span aria-hidden="true">→</span></Link>)}
              </div>
            </section>
          ) : null}

          {childRegions.length > 0 ? (
            <section className={styles.directory} aria-labelledby="child-regions-title">
              <div className={styles.sectionHead}>
                <div>
                  <p className={styles.kicker}>DIRECTORY</p>
                  <h2 id="child-regions-title">{region.label}에서 이어지는 지역</h2>
                </div>
                <p>현재 행정 경로 아래에서 다음 지역을 선택해 안내를 이어가세요.</p>
              </div>
              <ul className={styles.regionGrid}>
                {childRegions.map((child, index) => (
                  <li key={child.id}>
                    <Link className={styles.regionCard} href={child.route}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{child.label}</strong>
                      <em>지역 안내 <b aria-hidden="true">→</b></em>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <section className={styles.callout} aria-labelledby="callout-title">
          <div>
            <p className={styles.kicker}>CALLME TODAKI</p>
            <h2 id="callout-title">주소와 시간을 확인한 뒤 전화상담으로 이어가세요.</h2>
            <p>{OPERATING_FACTS.phoneConsultation} · {OPERATING_FACTS.paymentTiming} · {OPERATING_FACTS.cardPayment}</p>
          </div>
          <a className={styles.calloutButton} href={OPERATING_FACTS.phone.href}>전화상담 <span aria-hidden="true">↗</span></a>
        </section>
      </div>
    </main>
  );
}
