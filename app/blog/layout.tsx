import Link from "@/src/components/SiteLink";

import styles from "./blog.module.css";

const pageLinks = [
  { href: "/", label: "홈" },
  { href: "/areas", label: "지역 안내" },
  { href: "/pricing", label: "코스·가격" },
  { href: "/guide", label: "이용 안내" },
  { href: "/notice", label: "공지사항" },
  { href: "/blog", label: "블로그" },
] as const;

export default function BlogLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.pageBar}>
          <Link className={styles.brand} href="/" aria-label="콜미토닥이 홈">
            <img className={styles.brandMark} src="/callme-todaki-mark.svg" alt="" width="31" height="31" aria-hidden="true" />
            <span>콜미토닥이</span>
          </Link>
          <nav className={styles.pageLinks} aria-label="페이지 이동">
            {pageLinks.map((link) => <Link className={link.href === "/blog" ? styles.active : undefined} href={link.href} key={link.href}>{link.label}</Link>)}
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}
