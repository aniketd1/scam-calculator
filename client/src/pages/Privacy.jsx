import { Link } from "react-router-dom";

const sections = [
  {
    id: "collection",
    icon: "📋",
    title: "Information We Collect",
    content: [
      { heading: "What We Do NOT Collect", body: "We do not collect your name, phone number, email address, Aadhaar, PAN, bank account details, or any personally identifiable information unless you voluntarily submit a contact form." },
      { heading: "Anonymous Usage Data", body: "We may collect non-identifiable analytics such as page visits and country-level location data to understand how users interact with the platform and improve our services." },
      { heading: "Contact Form Submissions", body: "If you use our Contact page, we collect the name and email address you provide solely for the purpose of responding to your inquiry. This data is never sold, shared, or used for marketing." },
    ],
  },
  {
    id: "calculator",
    icon: "⚡",
    title: "How the Calculator Handles Your Data",
    content: [
      { heading: "Session-Only Processing", body: "All answers you enter in the Scam Risk Calculator are processed entirely within your browser session. No answers are transmitted to our servers or stored in any database." },
      { heading: "Auto-Deletion on Close", body: "When you close or refresh the browser tab, all calculator data is automatically cleared. There is no data retention of any kind." },
      { heading: "No User Profiling", body: "We do not build profiles based on your answers. Your results are generated in real-time and discarded immediately after display." },
    ],
  },
  {
    id: "cookies",
    icon: "🍪",
    title: "Cookies & Tracking",
    content: [
      { heading: "Minimal Cookie Usage", body: "We use only essential cookies required for basic site functionality (such as session state). We do not use advertising cookies, tracking pixels, or third-party analytics that identify individuals." },
      { heading: "No Advertising Networks", body: "ScamRisk is an ad-free platform. We do not integrate with Google Ads, Meta Pixel, or any advertising network that could track you across websites." },
      { heading: "Your Cookie Control", body: "You can control cookie preferences through your browser settings. Disabling cookies will not affect the core functionality of the Risk Calculator." },
    ],
  },
  {
    id: "sharing",
    icon: "🤝",
    title: "Data Sharing & Third Parties",
    content: [
      { heading: "We Never Sell Your Data", body: "ScamRisk does not sell, rent, or trade any user data to any third party under any circumstances. This is a non-negotiable commitment." },
      { heading: "No Third-Party Data Brokers", body: "We do not work with data brokers, lead generation platforms, or any service that aggregates personal data for commercial purposes." },
      { heading: "Legal Compliance Only", body: "The only circumstance under which we would share data is if required by valid Indian law enforcement authority with a proper legal order." },
    ],
  },
  {
    id: "security",
    icon: "🔐",
    title: "Security Measures",
    content: [
      { heading: "HTTPS Encryption", body: "All data transmitted between your browser and our servers is encrypted using industry-standard TLS/HTTPS protocols." },
      { heading: "No Sensitive Data Storage", body: "Since we do not collect sensitive data, there is nothing to breach. Our architecture is designed around data minimisation by default." },
      { heading: "Regular Security Audits", body: "Our platform undergoes periodic security reviews to identify and address potential vulnerabilities before they can be exploited." },
    ],
  },
  {
    id: "rights",
    icon: "⚖️",
    title: "Your Rights",
    content: [
      { heading: "Right to Access", body: "If you submitted a contact form, you may request to know what data we hold about you by emailing help@scamrisk.in." },
      { heading: "Right to Deletion", body: "You may request deletion of any contact form data we hold. We will process your request within 7 working days." },
      { heading: "Right to Withdraw Consent", body: "You may withdraw consent for analytics data at any time by adjusting your browser's cookie settings." },
    ],
  },
];

export default function Privacy() {
  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .privacy-page {
          background: #f7efe6;
          color: #0f172a;
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
        }

        /* HERO */
        .pg-hero {
          position: relative;
          padding: 90px 24px 64px;
          text-align: center;
          overflow: hidden;
        }
        .pg-hero-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 60% at 50% 0%, rgba(34,197,94,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .pg-hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          mask-image: radial-gradient(ellipse 80% 80% at center, black 20%, transparent 100%);
        }
        .pg-tag {
          display: inline-block;
          padding: 4px 14px;
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.25);
          border-radius: 20px;
          font-size: 0.75rem; font-weight: 600;
          color: #22C55E;
          letter-spacing: 0.08em; text-transform: uppercase;
          margin-bottom: 18px;
        }
        .pg-h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: clamp(2rem, 4vw, 2.8rem);
          letter-spacing: -0.03em;
          margin-bottom: 14px;
        }
        .pg-h1 .accent { color: #22C55E; }
        .pg-sub { font-size: 0.95rem; color: #94A3B8; max-width: 500px; margin: 0 auto 20px; line-height: 1.7; }
        .pg-meta { font-size: 0.8rem; color: #475569; }

        /* PROMISE STRIP */
        .promise-strip {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px 56px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        @media (max-width: 800px) { .promise-strip { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .promise-strip { grid-template-columns: 1fr; } }
        .promise-item {
          background: rgba(34,197,94,0.06);
          border: 1px solid rgba(34,197,94,0.18);
          border-radius: 12px;
          padding: 18px 16px;
          text-align: center;
        }
        .promise-icon { font-size: 1.6rem; margin-bottom: 8px; }
        .promise-text { font-size: 0.82rem; font-weight: 600; color: #22C55E; }

        /* LAYOUT */
        .privacy-layout {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px 80px;
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 36px;
          align-items: start;
        }
        @media (max-width: 800px) { .privacy-layout { grid-template-columns: 1fr; } }

        /* TOC */
        .toc {
          position: sticky;
          top: 88px;
          background: #fbf7f0;
          border: 1px solid #e6e9ef;
          border-radius: 14px;
          padding: 20px;
        }
        @media (max-width: 800px) { .toc { position: static; } }
        .toc-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.82rem; color: #64748B; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 14px; }
        .toc-list { list-style: none; display: flex; flex-direction: column; gap: 4px; }
        .toc-list a {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.84rem; color: #94A3B8;
          text-decoration: none; padding: 6px 8px; border-radius: 6px;
          transition: color 0.2s, background 0.2s;
        }
        .toc-list a:hover { color: #06B6D4; background: rgba(6,182,212,0.06); }

        /* CONTENT */
        .privacy-content { display: flex; flex-direction: column; gap: 24px; }
        .privacy-section {
          background: #fbf7f0;
          border: 1px solid #e6e9ef;
          border-radius: 16px;
          padding: 28px 28px;
          scroll-margin-top: 90px;
        }
        @media (max-width: 560px) { .privacy-section { padding: 20px 18px; } }
        .ps-header {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 22px;
          padding-bottom: 16px;
          border-bottom: 1px solid #334155;
        }
        .ps-icon {
          font-size: 1.6rem;
          width: 48px; height: 48px;
          background: rgba(6,182,212,0.08);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ps-title { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 1.05rem; }
        .ps-items { display: flex; flex-direction: column; gap: 18px; }
        .ps-item-heading { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.88rem; color: #0f172a; margin-bottom: 5px; }
        .ps-item-body { font-size: 0.88rem; color: #475569; line-height: 1.7; }

        /* FOOTER NOTE */
        .privacy-footer-note {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px 60px;
          background: #fbf7f0;
          border: 1px solid #e6e9ef;
          border-radius: 16px;
          padding: 24px 28px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .pfn-icon { font-size: 1.4rem; flex-shrink: 0; }
        .pfn-text { font-size: 0.87rem; color: #94A3B8; line-height: 1.65; }
        .pfn-text a { color: #06B6D4; text-decoration: none; }
        .pfn-text a:hover { text-decoration: underline; }
        .pfn-wrap { max-width: 1100px; margin: 0 auto; padding: 0 24px 60px; }
      `}</style>

      <div className="privacy-page">

        <section className="pg-hero">
          <div className="pg-hero-bg" />
          <div className="pg-hero-grid" />
          <div style={{ position: "relative" }}>
            <div className="pg-tag">🔒 Privacy Policy</div>
            <h1 className="pg-h1">Your Privacy Is Our <span className="accent">Promise</span></h1>
            <p className="pg-sub">ScamRisk is built on a foundation of zero data collection. This policy explains exactly what we do — and don't do — with your information.</p>
            <div className="pg-meta">Last updated: January 2025 &nbsp;·&nbsp; Effective immediately</div>
          </div>
        </section>

        {/* PROMISE */}
        <div className="promise-strip">
          {[
            { icon: "🚫", text: "No Login Required" },
            { icon: "🗑️", text: "Data Auto-Deleted" },
            { icon: "🎙️", text: "No Recording" },
            { icon: "💰", text: "Never Sold" },
          ].map(p => (
            <div className="promise-item" key={p.text}>
              <div className="promise-icon">{p.icon}</div>
              <div className="promise-text">{p.text}</div>
            </div>
          ))}
        </div>

        <div className="privacy-layout">

          {/* TOC */}
          <nav className="toc">
            <div className="toc-title">Contents</div>
            <ul className="toc-list">
              {sections.map(s => (
                <li key={s.id}>
                  <a href={`#${s.id}`}><span>{s.icon}</span>{s.title}</a>
                </li>
              ))}
            </ul>
          </nav>

          {/* SECTIONS */}
          <div className="privacy-content">
            {sections.map(s => (
              <div className="privacy-section" id={s.id} key={s.id}>
                <div className="ps-header">
                  <div className="ps-icon">{s.icon}</div>
                  <div className="ps-title">{s.title}</div>
                </div>
                <div className="ps-items">
                  {s.content.map(c => (
                    <div key={c.heading}>
                      <div className="ps-item-heading">{c.heading}</div>
                      <div className="ps-item-body">{c.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER NOTE */}
        <div className="pfn-wrap">
          <div className="privacy-footer-note">
            <div className="pfn-icon">📬</div>
            <div className="pfn-text">
              Questions about this privacy policy? Contact us at <a href="mailto:help@scamrisk.in">help@scamrisk.in</a> or visit our <Link to="/contact" style={{color:"#06B6D4"}}>Contact page</Link>. This policy may be updated periodically — we'll always note the effective date at the top of this page.
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
