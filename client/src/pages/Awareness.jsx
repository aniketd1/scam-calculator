import { useState } from "react";
import { Link } from "react-router-dom";

const categories = ["All", "Calls & OTP", "Banking", "Social Media", "Courier & Delivery", "Government Impersonation"];

const scams = [
  {
    id: 1, category: "Calls & OTP", risk: "HIGH", icon: "🔢",
    title: "OTP Scam",
    summary: "A caller claims your bank account is compromised and asks you to share the OTP sent to your phone to 'secure' it.",
    howItWorks: "Fraudsters already have partial access to your account or have collected your basic details. They call posing as bank officials and trick you into sharing the OTP that would actually authorise a transaction they're making.",
    redFlags: ["Caller urgently asks for OTP", "Claims your account will be blocked", "Asks you to 'confirm' identity via OTP", "Threatens legal action if you don't comply"],
    whatToDo: "Hang up immediately. Banks NEVER ask for OTPs over the phone. Call your bank's official number to verify.",
  },
  {
    id: 2, category: "Banking", risk: "HIGH", icon: "📋",
    title: "KYC Update Scam",
    summary: "You receive an SMS/WhatsApp message saying your KYC is incomplete and your account will be suspended unless you click a link.",
    howItWorks: "The link leads to a fake bank website that looks identical to the real one. Entering your credentials gives scammers full access to your account.",
    redFlags: ["SMS with a link asking for KYC", "Urgency around account suspension", "Link goes to a non-official domain", "Asks for full account number + password"],
    whatToDo: "Never click links in SMS. Visit your bank's official website directly by typing the address yourself.",
  },
  {
    id: 3, category: "Banking", risk: "HIGH", icon: "💳",
    title: "UPI / QR Code Fraud",
    summary: "Someone sends you a QR code or payment request saying they're 'sending' you money — but scanning it actually deducts money from your account.",
    howItWorks: "Payment requests in UPI always deduct from the scanner. Fraudsters exploit the confusion between 'sending' and 'receiving' UPI requests.",
    redFlags: ["Buyer sends QR code to 'pay you'", "Request says 'collect payment'", "WhatsApp seller asking to scan code", "Unknown UPI collect requests"],
    whatToDo: "Remember: Receiving money NEVER requires you to enter a PIN or scan a QR code. Reject all unknown UPI collect requests.",
  },
  {
    id: 4, category: "Government Impersonation", risk: "CRITICAL", icon: "👮",
    title: "Digital Arrest Scam",
    summary: "A video call from someone impersonating a police officer, CBI, or customs official claims you're under 'digital arrest' for a crime.",
    howItWorks: "Callers use professional-looking uniforms and fake government offices as backgrounds. They threaten arrest or legal action to extort large sums of money.",
    redFlags: ["Video call from 'police' or 'CBI'", "Claims your Aadhaar is linked to crimes", "Demands money to 'settle' the case", "Tells you not to inform family"],
    whatToDo: "Digital arrest does not exist in Indian law. Hang up and call the real police on 100. Report on cybercrime.gov.in.",
  },
  {
    id: 5, category: "Courier & Delivery", risk: "MEDIUM", icon: "📦",
    title: "Courier Scam",
    summary: "A call claims a parcel in your name contains drugs or illegal items, and you must pay a 'fine' to avoid arrest.",
    howItWorks: "Scammers create panic using fake customs or courier company identities. Fear of legal action makes victims pay without verifying.",
    redFlags: ["Unexpected call about a parcel you didn't send", "Claims parcel contains illegal items", "Asks for 'clearance fee' to release it", "Pressures for immediate payment"],
    whatToDo: "Legitimate authorities never demand payment over phone. Contact the courier company directly using their official number.",
  },
  {
    id: 6, category: "Calls & OTP", risk: "HIGH", icon: "🏦",
    title: "Fake Bank Call",
    summary: "Caller poses as your bank's customer service, offers rewards or loan upgrades, and asks to verify your account details.",
    howItWorks: "Using your name and partial account details bought on the dark web, they gain trust and extract sensitive banking credentials.",
    redFlags: ["Unsolicited call offering rewards or upgrades", "Asks for full card number or CVV", "Requests debit/credit card PIN", "Urgency to 'confirm' before offer expires"],
    whatToDo: "Hang up and call your bank's official number from the back of your card. Never share card details on inbound calls.",
  },
  {
    id: 7, category: "Social Media", risk: "MEDIUM", icon: "💰",
    title: "Lottery / Prize Scam",
    summary: "A Facebook or WhatsApp message claims you've won a prize and asks for a 'processing fee' to release your winnings.",
    howItWorks: "There is no prize. Every 'processing fee' just leads to demands for more fees until the victim realises the scam.",
    redFlags: ["Congratulations message from unknown number", "Prize for a contest you never entered", "Asks for fee to 'release' winnings", "Winning certificate looks official"],
    whatToDo: "Ignore and block. Legitimate lotteries never require winners to pay fees upfront to receive their prize.",
  },
  {
    id: 8, category: "Social Media", risk: "HIGH", icon: "👥",
    title: "Impersonation / Friend-in-Need Scam",
    summary: "A message from a friend's hacked account claims they're in trouble and urgently needs money transferred.",
    howItWorks: "Scammers hack or clone social media accounts and leverage the emotional trust you have in your friends.",
    redFlags: ["Friend asks for money via chat only", "Refuses to video call to confirm", "Story keeps changing", "Asks for payment via UPI or crypto"],
    whatToDo: "Always call your friend's real phone number before sending any money. Verify through a second channel.",
  },
];

const riskColor = { HIGH: "#EF4444", CRITICAL: "#b91c1c", MEDIUM: "#F59E0B", LOW: "#22C55E" };

export default function Awareness() {
  const [active, setActive] = useState("All");
  const [expanded, setExpanded] = useState(null);

  const filtered = active === "All" ? scams : scams.filter(s => s.category === active);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .awareness-page {
          background: #0F172A;
          color: #F8FAFC;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
        }

        /* HERO */
        .aw-hero {
          position: relative;
          padding: 100px 24px 72px;
          text-align: center;
          overflow: hidden;
        }
        .aw-hero-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 60% at 50% 0%, rgba(245,158,11,0.06) 0%, transparent 65%);
          pointer-events: none;
        }
        .aw-hero-grid {
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
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.25);
          border-radius: 20px;
          font-size: 0.75rem; font-weight: 600;
          color: #F59E0B;
          letter-spacing: 0.08em; text-transform: uppercase;
          margin-bottom: 18px;
        }
        .pg-h1 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(2rem, 4vw, 3rem);
          letter-spacing: -0.03em;
          margin-bottom: 16px;
          position: relative;
        }
        .pg-h1 .accent { color: #06B6D4; }
        .pg-sub {
          font-size: 1rem; color: #94A3B8;
          max-width: 520px; margin: 0 auto; line-height: 1.7;
        }

        /* FILTER TABS */
        .filter-bar {
          padding: 0 24px 48px;
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .filter-btn {
          padding: 8px 18px;
          border-radius: 20px;
          border: 1px solid #334155;
          background: transparent;
          color: #94A3B8;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-btn:hover { border-color: #06B6D4; color: #06B6D4; background: rgba(6,182,212,0.05); }
        .filter-btn.active { background: rgba(6,182,212,0.12); border-color: #06B6D4; color: #06B6D4; font-weight: 600; }

        /* CARDS GRID */
        .aw-grid {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px 80px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        @media (max-width: 800px) { .aw-grid { grid-template-columns: 1fr; } }

        .aw-card {
          background: #1E293B;
          border: 1px solid #334155;
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .aw-card:hover { border-color: rgba(6,182,212,0.25); box-shadow: 0 8px 32px rgba(0,0,0,0.25); }
        .aw-card-header {
          padding: 22px 24px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          cursor: pointer;
        }
        .aw-card-icon {
          font-size: 2rem;
          width: 52px; height: 52px;
          background: #0F172A;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .aw-card-meta { flex: 1; }
        .aw-card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
        .aw-card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1rem; }
        .risk-pill {
          padding: 2px 10px; border-radius: 6px;
          font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.06em;
        }
        .cat-pill {
          padding: 2px 10px; border-radius: 6px;
          font-size: 0.7rem; font-weight: 500;
          background: rgba(6,182,212,0.1);
          border: 1px solid rgba(6,182,212,0.2);
          color: #06B6D4;
        }
        .aw-card-summary { font-size: 0.87rem; color: #94A3B8; line-height: 1.6; }
        .aw-card-toggle {
          font-size: 1.2rem;
          color: #475569;
          flex-shrink: 0;
          transition: transform 0.3s;
          margin-top: 4px;
        }
        .aw-card-toggle.open { transform: rotate(180deg); color: #06B6D4; }

        .aw-card-body {
          padding: 0 24px 24px;
          border-top: 1px solid #334155;
          display: none;
        }
        .aw-card-body.open { display: block; }
        .aw-section-label {
          font-size: 0.72rem; font-weight: 700;
          color: #475569; letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 18px 0 8px;
        }
        .aw-how { font-size: 0.87rem; color: #94A3B8; line-height: 1.65; }
        .red-flags { list-style: none; display: flex; flex-direction: column; gap: 6px; }
        .red-flags li {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.86rem; color: #CBD5E1;
        }
        .red-flags li::before {
          content: '🚩';
          font-size: 0.75rem;
          flex-shrink: 0;
        }
        .what-todo-box {
          background: rgba(34,197,94,0.07);
          border: 1px solid rgba(34,197,94,0.2);
          border-radius: 10px;
          padding: 14px 16px;
          margin-top: 8px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }
        .what-todo-box span { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }
        .what-todo-box p { font-size: 0.87rem; color: #CBD5E1; line-height: 1.6; }

        /* TIP BANNER */
        .tip-banner {
          background: linear-gradient(135deg, rgba(6,182,212,0.08), rgba(6,182,212,0.03));
          border-top: 1px solid rgba(6,182,212,0.15);
          border-bottom: 1px solid rgba(6,182,212,0.15);
          padding: 48px 24px;
          text-align: center;
          margin-bottom: 0;
        }
        .tip-banner h3 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.5rem;
          margin-bottom: 10px;
        }
        .tip-banner p { color: #94A3B8; font-size: 0.95rem; max-width: 440px; margin: 0 auto 24px; line-height: 1.65; }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 26px;
          background: linear-gradient(135deg, #06B6D4, #0891b2);
          color: #0F172A; font-family: 'DM Sans', sans-serif;
          font-weight: 700; font-size: 0.95rem; border-radius: 10px;
          text-decoration: none;
          box-shadow: 0 0 20px rgba(6,182,212,0.28);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 36px rgba(6,182,212,0.5); }
      `}</style>

      <div className="awareness-page">

        <section className="aw-hero">
          <div className="aw-hero-bg" />
          <div className="aw-hero-grid" />
          <div style={{ position: "relative" }}>
            <div className="pg-tag">📚 Awareness Hub</div>
            <h1 className="pg-h1">Know the <span className="accent">Scam Tactics</span><br />Before They Target You</h1>
            <p className="pg-sub">Explore common scam patterns, red flags to watch for, and what to do if you encounter suspicious activity. Knowledge is your best protection.</p>
          </div>
        </section>

        {/* FILTER */}
        <div className="filter-bar">
          {categories.map(c => (
            <button key={c} className={`filter-btn${active === c ? " active" : ""}`} onClick={() => setActive(c)}>
              {c}
            </button>
          ))}
        </div>

        {/* SCAM CARDS */}
        <div className="aw-grid">
          {filtered.map(scam => (
            <div className="aw-card" key={scam.id}>
              <div className="aw-card-header" onClick={() => setExpanded(expanded === scam.id ? null : scam.id)}>
                <div className="aw-card-icon">{scam.icon}</div>
                <div className="aw-card-meta">
                  <div className="aw-card-top">
                    <span className="aw-card-title">{scam.title}</span>
                    <span className="risk-pill" style={{ background: riskColor[scam.risk] + "20", color: riskColor[scam.risk], border: `1px solid ${riskColor[scam.risk]}40` }}>{scam.risk}</span>
                    <span className="cat-pill">{scam.category}</span>
                  </div>
                  <div className="aw-card-summary">{scam.summary}</div>
                </div>
                <div className={`aw-card-toggle${expanded === scam.id ? " open" : ""}`}>▾</div>
              </div>

              <div className={`aw-card-body${expanded === scam.id ? " open" : ""}`}>
                <div className="aw-section-label">How It Works</div>
                <div className="aw-how">{scam.howItWorks}</div>

                <div className="aw-section-label">Red Flags to Watch</div>
                <ul className="red-flags">
                  {scam.redFlags.map(f => <li key={f}>{f}</li>)}
                </ul>

                <div className="aw-section-label">What to Do</div>
                <div className="what-todo-box">
                  <span>✅</span>
                  <p>{scam.whatToDo}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TIP BANNER */}
        <div className="tip-banner">
          <h3>🧠 Think You've Spotted a Scam?</h3>
          <p>Use our AI-powered Risk Calculator to evaluate suspicious calls, messages, or interactions instantly and for free.</p>
          <Link to="/calculator" className="btn-primary">⚡ Check Your Scam Risk</Link>
        </div>

      </div>
    </>
  );
}