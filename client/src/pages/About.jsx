import { Link } from "react-router-dom";

const team = [
  { icon: "👨‍💻", name: "Arjun Mehta", role: "Lead Developer & Architect", desc: "10+ years in fintech security systems and AI-driven fraud detection." },
  { icon: "👩‍🔬", name: "Priya Sharma", role: "Cybersecurity Researcher", desc: "Former CERT-In analyst specialising in social engineering and phishing patterns." },
  { icon: "👨‍🏫", name: "Dr. Ramesh Iyer", role: "Senior Citizen Advocate", desc: "Works with NGOs to educate elderly citizens on digital safety and scam awareness." },
  { icon: "👩‍💼", name: "Sneha Kulkarni", role: "UI/UX & Accessibility Lead", desc: "Designs inclusive interfaces for non-tech-savvy users and rural populations." },
];

const milestones = [
  { year: "2022", title: "Problem Identified", desc: "Rising scam cases among senior citizens prompted us to research the gap in accessible awareness tools." },
  { year: "2023", title: "Platform Launched", desc: "Beta version released with basic scam pattern recognition and awareness articles." },
  { year: "2024", title: "AI Engine Added", desc: "Integrated intelligent risk scoring engine trained on 50,000+ real scam reports from cybercrime.gov.in." },
  { year: "2025", title: "National Reach", desc: "Partnered with banks and senior citizen groups across 12 states to expand digital literacy." },
];

const values = [
  { icon: "🛡️", title: "Protection First", desc: "Every feature is built with the singular goal of keeping vulnerable citizens safer online." },
  { icon: "🤝", title: "Trustworthy", desc: "We operate transparently with no ads, no data selling, and no hidden motives." },
  { icon: "♿", title: "Accessible to All", desc: "Designed for seniors, non-tech users, and anyone facing the digital divide." },
  { icon: "🔬", title: "Evidence-Based", desc: "Our scam patterns are sourced from verified government cybercrime databases." },
  { icon: "🇮🇳", title: "Made for India", desc: "Built around Indian scam trends, regional languages, and local helpline infrastructure." },
  { icon: "🚫", title: "Zero Profit Motive", desc: "This is a public-good initiative. We do not monetise your data or your fear." },
];

export default function About() {
  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .about-page {
          background: #f7efe6;
          color: #0f172a;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }

        /* PAGE HERO */
        .pg-hero {
          position: relative;
          padding: 100px 24px 80px;
          text-align: center;
          overflow: hidden;
        }
        .pg-hero-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 60% at 50% 0%, rgba(6,182,212,0.07) 0%, transparent 70%);
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
          background: rgba(6,182,212,0.1);
          border: 1px solid rgba(6,182,212,0.2);
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #06B6D4;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 18px;
        }
        .pg-h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: clamp(2rem, 4vw, 3rem);
          letter-spacing: -0.03em;
          margin-bottom: 16px;
          position: relative;
        }
        .pg-h1 .accent { color: #06B6D4; }
        .pg-sub {
          font-size: 1rem;
          color: #94A3B8;
          max-width: 540px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* SECTIONS */
        .section { padding: 72px 24px; }
        .section-alt { background: transparent; }
        .section-inner { max-width: 1280px; margin: 0 auto; }
        .section-header { text-align: center; margin-bottom: 48px; }
        .section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          letter-spacing: -0.02em;
          margin-bottom: 10px;
        }
        .section-sub { font-size: 0.95rem; color: #94A3B8; max-width: 500px; margin: 0 auto; line-height: 1.65; }

        /* MISSION BLOCK */
        .mission-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }
        @media (max-width: 800px) { .mission-grid { grid-template-columns: 1fr; } }
        .mission-text h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          letter-spacing: -0.02em;
          margin-bottom: 16px;
        }
        .mission-text h2 span { color: #06B6D4; }
        .mission-text p {
          font-size: 0.95rem;
          color: #94A3B8;
          line-height: 1.75;
          margin-bottom: 16px;
        }
        .mission-visual {
          background: #fbf7f0;
          border: 1px solid #e6e9ef;
          border-radius: 20px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .mission-stat {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f3efe9;
          border: 1px solid #e6e9ef;
          border-radius: 12px;
        }
        .mission-stat-icon {
          font-size: 1.8rem;
          width: 52px;
          height: 52px;
          background: rgba(6,182,212,0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .mission-stat-val {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: 1.5rem;
          color: #06B6D4;
          letter-spacing: -0.02em;
        }
        .mission-stat-label { font-size: 0.82rem; color: #64748B; }

        /* VALUES GRID */
        .values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px) { .values-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .values-grid { grid-template-columns: 1fr; } }
        .value-card {
          background: #fbf7f0;
          border: 1px solid #e6e9ef;
          border-radius: 14px;
          padding: 28px 22px;
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        .value-card:hover { transform: translateY(-4px); border-color: rgba(6,182,212,0.3); box-shadow: 0 12px 32px rgba(0,0,0,0.25); }
        .value-icon {
          font-size: 2rem;
          margin-bottom: 14px;
          display: block;
        }
        .value-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 0.98rem;
          margin-bottom: 8px;
        }
        .value-desc { font-size: 0.86rem; color: #94A3B8; line-height: 1.6; }

        /* TIMELINE */
        .timeline {
          position: relative;
          max-width: 700px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
        }
        .timeline::before {
          content: '';
          position: absolute;
          left: 97px;
          transform: translateX(7px);
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, #06B6D4, #0891b2);
        }
        .tl-item {
          display: grid;
          grid-template-columns: 80px 14px 1fr;
          gap: 18px;
          position: relative;
        }
        .tl-year {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: 0.9rem;
          color: #06B6D4;
          width: 52px;
          flex-shrink: 0;
          text-align: right;
          padding-top: 14px;
        }
        .tl-dot {
          width: 14px;
          height: 14px;
          background: #06B6D4;
          border: 3px solid #e6e9ef;
          border-radius: 50%;
          flex-shrink: 0;

          position: relative;
          top: 18px; /* aligns with content box center better */
          z-index: 1;
        }
        .tl-content {
          background: #fbf7f0;
          border: 1px solid #e6e9ef;
          border-radius: 12px;
          padding: 18px 20px;
          flex: 1;
        }
        .tl-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 0.98rem;
          margin-bottom: 6px;
        }
        .tl-desc { font-size: 0.86rem; color: #94A3B8; line-height: 1.6; }

        /* TEAM */
        .team-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px) { .team-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px) { .team-grid { grid-template-columns: 1fr; } }
        .team-card {
          background: #fbf7f0;
          border: 1px solid #e6e9ef;
          border-radius: 14px;
          padding: 28px 20px;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .team-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.3); }
        .team-avatar {
          width: 64px; height: 64px;
          background: rgba(6,182,212,0.1);
          border: 2px solid rgba(6,182,212,0.25);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.8rem;
          margin: 0 auto 14px;
        }
        .team-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.95rem; margin-bottom: 4px; }
        .team-role { font-size: 0.78rem; color: #06B6D4; font-weight: 600; margin-bottom: 10px; }
        .team-desc { font-size: 0.82rem; color: #94A3B8; line-height: 1.55; }

        /* CTA STRIP */
        .cta-strip {
          background: linear-gradient(135deg, rgba(6,182,212,0.08), rgba(6,182,212,0.03));
          border-top: 1px solid rgba(6,182,212,0.15);
          border-bottom: 1px solid rgba(6,182,212,0.15);
          padding: 64px 24px;
          text-align: center;
        }
        .cta-strip h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          letter-spacing: -0.02em;
          margin-bottom: 12px;
        }
        .cta-strip p { font-size: 0.95rem; color: #94A3B8; max-width: 440px; margin: 0 auto 28px; line-height: 1.65; }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #06B6D4, #0891b2);
          color: #0F172A; font-family: 'Inter', sans-serif;
          font-weight: 700; font-size: 1rem; border-radius: 10px;
          text-decoration: none;
          box-shadow: 0 0 24px rgba(6,182,212,0.3);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 40px rgba(6,182,212,0.5); }
        
        /* ───────────────── RESPONSIVE DESIGN ───────────────── */

/* Large Tablets */
@media (max-width: 1024px) {

  .pg-hero {
    padding: 85px 22px 70px;
  }

  .
     
     `}</style>

      <div className="about-page">

        {/* PAGE HERO */}
        <section className="pg-hero">
          <div className="pg-hero-bg" />
          <div className="pg-hero-grid" />
          <div style={{ position: "relative" }}>
            <div className="pg-tag">🛡️ Who We Are</div>
            <h1 className="pg-h1">Built to <span className="accent">Protect</span> India's<br />Most Vulnerable Citizens</h1>
            <p className="pg-sub">ScamRisk was born from a simple belief — no one should lose their life savings to a phone call. We build tools that make digital safety accessible to everyone.</p>
          </div>
        </section>

        {/* MISSION */}
        <section className="section">
          <div className="section-inner">
            <div className="mission-grid">
              <div className="mission-text">
                <div className="pg-tag">🎯 Our Mission</div>
                <h2>Empowering Citizens with <span>Scam Awareness</span></h2>
                <p>India loses over ₹11,000 crore annually to cyber fraud. The most vulnerable are senior citizens and first-generation smartphone users who lack the context to identify sophisticated scam tactics.</p>
                <p>ScamRisk bridges that gap — providing an intelligent, privacy-first risk calculator that anyone can use without technical knowledge, data plans, or login credentials.</p>
                <p>Our goal is not just detection, but <strong style={{color:"#0f172a"}}>education and empowerment</strong> — so that every Indian can confidently navigate the digital world without fear.</p>
              </div>
              <div className="mission-visual">
                {[
                  { icon: "👥", val: "2.5 Lakh+", label: "Citizens Helped" },
                  { icon: "🔍", val: "50,000+", label: "Scams Identified" },
                  { icon: "🏙️", val: "12 States", label: "Active Reach" },
                ].map(s => (
                  <div className="mission-stat" key={s.label}>
                    <div className="mission-stat-icon">{s.icon}</div>
                    <div>
                      <div className="mission-stat-val">{s.val}</div>
                      <div className="mission-stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="section section-alt">
          <div className="section-inner">
            <div className="section-header">
              <div className="pg-tag">💡 What We Stand For</div>
              <h2 className="section-title">Our Core Values</h2>
              <p className="section-sub">These principles guide every decision we make — from product design to data handling.</p>
            </div>
            <div className="values-grid">
              {values.map(v => (
                <div className="value-card" key={v.title}>
                  <span className="value-icon">{v.icon}</span>
                  <div className="value-title">{v.title}</div>
                  <div className="value-desc">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="section">
          <div className="section-inner">
            <div className="section-header">
              <div className="pg-tag">📅 Our Journey</div>
              <h2 className="section-title">How We Got Here</h2>
              <p className="section-sub">From a weekend research project to a nationally recognised cyber safety platform.</p>
            </div>
            <div className="timeline">
              {milestones.map(m => (
                <div className="tl-item" key={m.year}>
                  <div className="tl-year">{m.year}</div>
                  <div className="tl-dot" />
                  <div className="tl-content">
                    <div className="tl-title">{m.title}</div>
                    <div className="tl-desc">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TEAM */}
        <section className="section section-alt">
          <div className="section-inner">
            <div className="section-header">
              <div className="pg-tag">👨‍👩‍👧‍👦 The Team</div>
              <h2 className="section-title">People Behind ScamRisk</h2>
              <p className="section-sub">A small, focused team of security researchers, developers, and social advocates.</p>
            </div>
            <div className="team-grid">
              {team.map(t => (
                <div className="team-card" key={t.name}>
                  <div className="team-avatar">{t.icon}</div>
                  <div className="team-name">{t.name}</div>
                  <div className="team-role">{t.role}</div>
                  <div className="team-desc">{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-strip">
          <h2>Ready to Check Your Scam Risk?</h2>
          <p>Use our free, anonymous tool to evaluate suspicious calls, messages, or online interactions in seconds.</p>
          <Link to="/calculator" className="btn-primary">⚡ Open Risk Calculator</Link>
        </section>

      </div>
    </>
  );
}
