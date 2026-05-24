import { Link } from "react-router-dom";

/* ─── Data ─────────────────────────────────────────────────────────────── */
const stats = [
  { icon: "📞", value: "45,000+", label: "Scam Calls Daily", sub: "Targeting Indian mobile users", color: "#EF4444" },
  { icon: "🎣", value: "12 Lakh", label: "Phishing Attacks", sub: "Reported in 2023 alone", color: "#F59E0B" },
  { icon: "💸", value: "₹11,000 Cr", label: "Financial Losses", sub: "Cyber fraud in India (2023)", color: "#06B6D4" },
];

const scamTypes = [
  { icon: "🔢", title: "OTP Scam", desc: "Fraudsters impersonate banks and trick you into sharing your One-Time Password to drain accounts.", risk: "HIGH" },
  { icon: "📋", title: "KYC Scam", desc: "Fake KYC update requests via SMS, WhatsApp, or calls pressuring you to reveal account details.", risk: "HIGH" },
  { icon: "💳", title: "UPI Fraud", desc: "Fake payment requests or QR codes sent to steal money from your UPI-linked bank account.", risk: "HIGH" },
  { icon: "👮", title: "Digital Arrest", desc: "Criminals impersonate police or CBI officials via video call to extort money through fear.", risk: "CRITICAL" },
  { icon: "📦", title: "Courier Scam", desc: "Fake notifications about held parcels containing illegal items to extract personal and banking info.", risk: "MEDIUM" },
  { icon: "🏦", title: "Fake Banking Calls", desc: "Callers posing as bank executives offering loans, rewards, or resolving fake account issues.", risk: "HIGH" },
];

const steps = [
  { num: "01", icon: "🗣️", title: "Describe the Situation", desc: "Tell us what happened — a suspicious call, message, or online interaction. No login or personal info needed." },
  { num: "02", icon: "🧠", title: "AI Risk Analysis", desc: "Our engine cross-references 50+ known scam patterns against your description to calculate a threat score." },
  { num: "03", icon: "✅", title: "Get Safety Guidance", desc: "Receive clear, plain-language advice on what to do next — whether to ignore, block, or report." },
];

const privacyPoints = [
  { icon: "🚫", title: "No Login Required", desc: "Use the full tool anonymously. We never ask for your name, phone number, or any personal details." },
  { icon: "🎙️", title: "No Call Recording", desc: "We never listen to or record any calls. You describe the situation in your own words." },
  { icon: "🗑️", title: "Data Auto-Deleted", desc: "All session data is cleared automatically when you close the tab. Nothing is stored on our servers." },
  { icon: "🔐", title: "Privacy-First Processing", desc: "Your inputs are analyzed locally and are never shared with third parties or sold to advertisers." },
];

const riskBadge = { HIGH: "#EF4444", CRITICAL: "#b91c1c", MEDIUM: "#F59E0B" };

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .home {
          background: #0F172A;
          color: #F8FAFC;
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
        }

        /* ── HERO ── */
        .hero {
          position: relative;
          min-height: 88vh;
          display: flex;
          align-items: center;
          padding: 80px 24px;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 70% 40%, rgba(6,182,212,0.07) 0%, transparent 65%),
            radial-gradient(ellipse 40% 40% at 20% 80%, rgba(6,182,212,0.04) 0%, transparent 60%);
          pointer-events: none;
        }
        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          mask-image: radial-gradient(ellipse 80% 80% at center, black 30%, transparent 100%);
        }
        .hero-inner {
          position: relative;
          max-width: 1280px;
          margin: 0 auto;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .hero-inner { grid-template-columns: 1fr; gap: 48px; }
          .hero-visual { display: none; }
        }
        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(6,182,212,0.1);
          border: 1px solid rgba(6,182,212,0.25);
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          color: #06B6D4;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 24px;
        }
        .hero-h1 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(2.4rem, 5vw, 3.6rem);
          line-height: 1.08;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
        }
        .hero-h1 .accent { color: #06B6D4; }
        .hero-sub {
          font-size: 1.05rem;
          color: #94A3B8;
          line-height: 1.7;
          max-width: 480px;
          margin-bottom: 36px;
        }
        .hero-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #06B6D4, #0891b2);
          color: #0F172A;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          border-radius: 10px;
          text-decoration: none;
          box-shadow: 0 0 24px rgba(6,182,212,0.3);
          transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 40px rgba(6,182,212,0.5);
          filter: brightness(1.05);
        }
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 24px;
          border: 1px solid #334155;
          color: #CBD5E1;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 0.95rem;
          border-radius: 10px;
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .btn-secondary:hover {
          border-color: #06B6D4;
          color: #06B6D4;
          background: rgba(6,182,212,0.05);
        }
        .hero-trust {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-top: 28px;
          flex-wrap: wrap;
        }
        .hero-trust-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          color: #64748B;
        }
        .hero-trust-item span { color: #22C55E; }

        /* Visual panel */
        .hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .shield-wrap {
          position: relative;
          width: 340px;
          height: 340px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .shield-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(6,182,212,0.15);
          animation: pulse-ring 3s ease-in-out infinite;
        }
        .shield-ring:nth-child(1) { width: 100%; height: 100%; animation-delay: 0s; }
        .shield-ring:nth-child(2) { width: 75%; height: 75%; animation-delay: 0.8s; border-color: rgba(6,182,212,0.2); }
        .shield-ring:nth-child(3) { width: 50%; height: 50%; animation-delay: 1.6s; border-color: rgba(6,182,212,0.3); }
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.03); opacity: 1; }
        }
        .shield-center {
          position: relative;
          width: 140px;
          height: 140px;
          background: linear-gradient(135deg, #1E293B, #111827);
          border: 1px solid rgba(6,182,212,0.3);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 64px;
          box-shadow: 0 0 40px rgba(6,182,212,0.15), inset 0 1px 0 rgba(255,255,255,0.05);
          animation: float 4s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .floating-badge {
          position: absolute;
          padding: 8px 14px;
          background: #1E293B;
          border: 1px solid #334155;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .floating-badge.red { top: 20px; right: -10px; border-color: rgba(239,68,68,0.4); color: #EF4444; animation: float 4s 0.5s ease-in-out infinite; }
        .floating-badge.green { bottom: 30px; left: -10px; border-color: rgba(34,197,94,0.4); color: #22C55E; animation: float 4s 1s ease-in-out infinite; }
        .floating-badge.amber { top: 50%; left: -30px; border-color: rgba(245,158,11,0.4); color: #F59E0B; animation: float 4s 1.5s ease-in-out infinite; }

        /* ── SECTION WRAPPER ── */
        .section {
          padding: 80px 24px;
        }
        .section-inner {
          max-width: 1280px;
          margin: 0 auto;
        }
        .section-alt { background: #111827; }
        .section-header {
          text-align: center;
          margin-bottom: 52px;
        }
        .section-tag {
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
          margin-bottom: 14px;
        }
        .section-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          letter-spacing: -0.02em;
          margin-bottom: 12px;
        }
        .section-sub {
          font-size: 1rem;
          color: #94A3B8;
          max-width: 520px;
          margin: 0 auto;
          line-height: 1.65;
        }

        /* ── STATS ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 700px) { .stats-grid { grid-template-columns: 1fr; } }
        .stat-card {
          background: #1E293B;
          border: 1px solid #334155;
          border-radius: 16px;
          padding: 32px 28px;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
        .stat-icon { font-size: 2.2rem; margin-bottom: 14px; }
        .stat-value {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 2rem;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }
        .stat-label { font-weight: 600; font-size: 0.95rem; color: #F8FAFC; margin-bottom: 4px; }
        .stat-sub { font-size: 0.82rem; color: #64748B; }

        /* ── SCAM TYPES ── */
        .scam-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px) { .scam-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .scam-grid { grid-template-columns: 1fr; } }
        .scam-card {
          background: #1E293B;
          border: 1px solid #334155;
          border-radius: 14px;
          padding: 26px 22px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
          cursor: default;
        }
        .scam-card:hover { transform: translateY(-3px); border-color: rgba(6,182,212,0.3); box-shadow: 0 8px 32px rgba(0,0,0,0.25); }
        .scam-card-top { display: flex; align-items: center; justify-content: space-between; }
        .scam-card-icon { font-size: 1.8rem; }
        .risk-badge {
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #fff;
        }
        .scam-card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1rem; }
        .scam-card-desc { font-size: 0.87rem; color: #94A3B8; line-height: 1.6; }

        /* ── HOW IT WORKS ── */
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          position: relative;
        }
        @media (max-width: 800px) { .steps-grid { grid-template-columns: 1fr; } }
        .step-connector {
          position: absolute;
          top: 52px;
          left: calc(33.3% + 14px);
          width: calc(33.3% - 28px);
          height: 1px;
          background: linear-gradient(90deg, rgba(6,182,212,0.4), rgba(6,182,212,0.1));
        }
        .step-connector:last-of-type { left: calc(66.6% + 14px); }
        .step-card {
          background: #1E293B;
          border: 1px solid #334155;
          border-radius: 16px;
          padding: 32px 26px;
          text-align: center;
          position: relative;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .step-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
        .step-num {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 0.75rem;
          color: #334155;
          letter-spacing: 0.1em;
          margin-bottom: 12px;
        }
        .step-icon-wrap {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.05));
          border: 1px solid rgba(6,182,212,0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          margin: 0 auto 18px;
        }
        .step-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.05rem; margin-bottom: 10px; }
        .step-desc { font-size: 0.88rem; color: #94A3B8; line-height: 1.65; }

        /* ── PRIVACY ── */
        .privacy-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        @media (max-width: 640px) { .privacy-grid { grid-template-columns: 1fr; } }
        .privacy-card {
          background: #1E293B;
          border: 1px solid #334155;
          border-radius: 14px;
          padding: 26px 22px;
          display: flex;
          gap: 18px;
          align-items: flex-start;
          transition: transform 0.2s, border-color 0.2s;
        }
        .privacy-card:hover { transform: translateY(-3px); border-color: rgba(34,197,94,0.25); }
        .privacy-icon-wrap {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
        }
        .privacy-card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.98rem; margin-bottom: 6px; }
        .privacy-card-desc { font-size: 0.86rem; color: #94A3B8; line-height: 1.6; }

        /* ── EMERGENCY BANNER ── */
        .emergency {
          padding: 48px 24px;
          background: linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(15,23,42,1) 60%);
          border-top: 1px solid rgba(239,68,68,0.15);
          border-bottom: 1px solid rgba(239,68,68,0.15);
        }
        .emergency-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          flex-wrap: wrap;
        }
        .emergency-left { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
        .emergency-pulse {
          width: 56px;
          height: 56px;
          background: rgba(239,68,68,0.15);
          border: 2px solid rgba(239,68,68,0.4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          animation: pulse-badge 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes pulse-badge {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); }
          50% { box-shadow: 0 0 0 12px rgba(239,68,68,0); }
        }
        .emergency-label { font-size: 0.8rem; color: #EF4444; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 4px; }
        .emergency-number {
          font-family: 'Syne', sans-serif;
          font-size: 2.4rem;
          font-weight: 800;
          color: #EF4444;
          letter-spacing: -0.02em;
          line-height: 1;
          margin-bottom: 4px;
        }
        .emergency-desc { font-size: 0.88rem; color: #94A3B8; }
        .emergency-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn-danger {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #EF4444;
          color: #fff;
          font-weight: 700;
          font-size: 0.92rem;
          border-radius: 10px;
          text-decoration: none;
          transition: filter 0.2s, transform 0.2s;
        }
        .btn-danger:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .btn-outline-danger {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 22px;
          border: 1px solid rgba(239,68,68,0.4);
          color: #EF4444;
          font-weight: 600;
          font-size: 0.88rem;
          border-radius: 10px;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s;
        }
        .btn-outline-danger:hover { background: rgba(239,68,68,0.08); border-color: #EF4444; }
      `}</style>

      <div className="home">

        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-grid" />
          <div className="hero-inner">
            <div className="hero-content">
              <div className="hero-eyebrow">
                🛡️ AI-Powered Scam Detection
              </div>
              <h1 className="hero-h1">
                Protect Yourself<br />From <span className="accent">Digital Scams</span>
              </h1>
              <p className="hero-sub">
                India's scam landscape is evolving fast. Our intelligent risk engine helps senior citizens and banking users identify suspicious activity before financial harm occurs — in seconds, for free.
              </p>
              <div className="hero-actions">
                <Link to="/calculator" className="btn-primary">
                   Analyze Scam Risk
                </Link>
                <Link to="/awareness" className="btn-secondary">
                   Learn About Scams
                </Link>
              </div>
              <div className="hero-trust">
                <span className="hero-trust-item"><span>✓</span> No Login</span>
                <span className="hero-trust-item"><span>✓</span> 100% Free</span>
                <span className="hero-trust-item"><span>✓</span> Data Not Stored</span>
                <span className="hero-trust-item"><span>✓</span> Works in Hindi</span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="shield-wrap">
                <div className="shield-ring" />
                <div className="shield-ring" />
                <div className="shield-ring" />
                <div className="shield-center">🛡️</div>
                <div className="floating-badge red">⚠️ HIGH RISK DETECTED</div>
                <div className="floating-badge green">✅ SAFE TO PROCEED</div>
                <div className="floating-badge amber">🔍 ANALYZING...</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="section section-alt">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-tag">⚠️ The Threat Is Real</div>
              <h2 className="section-title">Scam Activity in India</h2>
              <p className="section-sub">These numbers represent real people — your family, neighbors, and friends. Stay informed to stay protected.</p>
            </div>
            <div className="stats-grid">
              {stats.map((s) => (
                <div className="stat-card" key={s.label}>
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SCAM TYPES ── */}
        <section className="section">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-tag">🔍 Know the Threats</div>
              <h2 className="section-title">Common Scam Types</h2>
              <p className="section-sub">Understanding how scams work is your first line of defence. Recognise these patterns before they fool you.</p>
            </div>
            <div className="scam-grid">
              {scamTypes.map((s) => (
                <div className="scam-card" key={s.title}>
                  <div className="scam-card-top">
                    <span className="scam-card-icon">{s.icon}</span>
                    <span className="risk-badge" style={{ background: riskBadge[s.risk] + "22", color: riskBadge[s.risk], border: `1px solid ${riskBadge[s.risk]}44` }}>{s.risk}</span>
                  </div>
                  <div className="scam-card-title">{s.title}</div>
                  <div className="scam-card-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="section section-alt">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-tag">🧭 Simple Process</div>
              <h2 className="section-title">How It Works</h2>
              <p className="section-sub">Three easy steps. No tech knowledge required. Designed for everyone — including seniors and first-time smartphone users.</p>
            </div>
            <div className="steps-grid">
              {steps.map((s, i) => (
                <div className="step-card" key={s.num}>
                  <div className="step-num">STEP {s.num}</div>
                  <div className="step-icon-wrap">{s.icon}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <Link to="/calculator" className="btn-primary" style={{ display: "inline-flex" }}>
                ⚡ Try It Now — It's Free
              </Link>
            </div>
          </div>
        </section>

        {/* ── PRIVACY ── */}
        <section className="section">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-tag">🔒 Your Privacy</div>
              <h2 className="section-title">Privacy First, Always</h2>
              <p className="section-sub">We built ScamRisk on a foundation of zero data collection. Your trust means everything to us.</p>
            </div>
            <div className="privacy-grid">
              {privacyPoints.map((p) => (
                <div className="privacy-card" key={p.title}>
                  <div className="privacy-icon-wrap">{p.icon}</div>
                  <div>
                    <div className="privacy-card-title">{p.title}</div>
                    <div className="privacy-card-desc">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EMERGENCY BANNER ── */}
        <section className="emergency">
          <div className="emergency-inner">
            <div className="emergency-left">
              <div className="emergency-pulse">🚨</div>
              <div>
                <div className="emergency-label">National Cyber Crime Helpline</div>
                <div className="emergency-number">1930</div>
                <div className="emergency-desc">Already been scammed? Call immediately — time matters for fund recovery.</div>
              </div>
            </div>
            <div className="emergency-actions">
              <a href="tel:1930" className="btn-danger">📞 Call 1930 Now</a>
              <Link to="/report" className="btn-outline-danger">📋 File Online Report</Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}