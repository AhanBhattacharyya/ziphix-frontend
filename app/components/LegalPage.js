import Link from "next/link";

export default function LegalPage({ title, intro, sections }) {
  return (
    <main className="legal-page">
      <header className="site-header legal-header">
        <Link className="brand" href="/" aria-label="ZIPHIX home">
          <img className="brand-logo" src="/gpt-image-2.5-flare_b_A_modern,_profession%20(1).png" alt="ZIPHIX Logo" width={150} height={82} />
        </Link>
        <Link className="header-link" href="/">Back to home <span aria-hidden="true">↗</span></Link>
      </header>
      <article className="legal-content">
        <p className="eyebrow"><span className="eyebrow-dot" /> ZIPHIX INFORMATION</p>
        <h1>{title}</h1>
        {intro && <p className="legal-intro">{intro}</p>}
        {sections.map((section) => (
          <section className="legal-section" key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}
      </article>
      <footer className="site-footer legal-footer">
        <Link className="brand footer-brand" href="/" aria-label="ZIPHIX home">
          <img className="brand-logo" src="/gpt-image-2.5-flare_b_A_modern,_profession%20(1).png" alt="ZIPHIX Logo" width={150} height={82} />
        </Link>
        <nav className="legal-links" aria-label="Legal">
          <Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link>
          <Link href="/refund">Refunds</Link><Link href="/disclaimer">Disclaimer</Link>
        </nav>
      </footer>
    </main>
  );
}