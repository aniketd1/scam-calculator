import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        .footer-root {
          background: #e8dccb;
          border-top: 1px solid #efe6db;
          font-family: 'Inter', sans-serif;
          color: #475569;
        }
        .footer-main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 64px 24px 40px;
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          gap: 48px;
        }
        @media (max-width: 900px) {
          .footer-main { grid-template-columns: 1fr; gap: 40px; }
        }
        .footer-brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          margin-bottom: 14px;
        }
        .footer-logo-icon {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #06B6D4, #0891b2);
          box-shadow: 0 0 14px rgba(6,182,212,0.18);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        .footer-logo-text {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: 1.1rem;
          color: #0f172a;
        }
        .footer-logo-text span { color: #1d4ed8; }
        .footer-tagline {
          font-size: 0.95rem;
          line-height: 1.75;
          color: #475569;
          max-width: 280px;
          margin-bottom: 20px;
        }
        .footer-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(6,182,212,0.08);
          border: 1px solid rgba(6,182,212,0.18);
          color: #0891b2;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .footer-col-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 0.85rem;
          color: #0f172a;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 18px;
        }
        .footer-links {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .footer-links a {
          color: #475569;
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .footer-links a::before {
          content: '';
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #e6dccf;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .footer-links a:hover { color: #06B6D4; }
        .footer-links a:hover::before { background: #06B6D4; }

        .footer-helpline {
          background: linear-gradient(135deg, rgba(251,207,232,0.12), rgba(254,215,215,0.06));
          border: 1px solid rgba(244,114,182,0.12);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }
        .helpline-number {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: #be123c;
          letter-spacing: -0.02em;
          line-height: 1;
          margin-bottom: 4px;
        }
        .helpline-label {
          font-size: 0.9rem;
          color: #475569;
          margin-bottom: 10px;
        }
        .helpline-desc {
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.6;
        }
        .report-btn {
          display: block;
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg,#06B6D4,#0891b2);
          border: 1px solid transparent;
          border-radius: 10px;
          color: #ffffff;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 600;
          text-align: center;
          transition: background 0.2s, border-color 0.2s;
        }
        .report-btn:hover {
          background: #0891b2;
          border-color: #0891b2;
        }

        .footer-divider {
          border: none;
          border-top: 1px solid #e2e8f0;
          margin: 0;
        }
        .footer-bottom {
          max-width: 1280px;
          margin: 0 auto;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .footer-copy {
          font-size: 0.85rem;
          color: #64748b;
        }
        .footer-copy a { color: #2563eb; text-decoration: none; }
        .footer-disclaimer {
          font-size: 0.82rem;
          color: #475569;
          text-align: right;
          max-width: 400px;
        }
        @media (max-width: 640px) {
          .footer-bottom { flex-direction: column; align-items: flex-start; }
          .footer-disclaimer { text-align: left; }
        }
        
        /* ───────────────── RESPONSIVE DESIGN ───────────────── */

/* Large Tablets */
@media (max-width: 1024px) {

  .footer-main {
    padding: 56px 22px 36px;
    gap: 36px;
  }

  .footer-tagline {
    max-width: 100%;
  }

  .footer-bottom {
    padding: 18px 22px;
  }
}


/* Tablets */
@media (max-width: 768px) {

  .footer-root {
    overflow-x: hidden;
  }

  .footer-main {
    grid-template-columns: 1fr;
    gap: 34px;
    padding: 50px 18px 34px;
  }

  .footer-brand-logo {
    justify-content: flex-start;
  }

  .footer-tagline {
    max-width: 100%;
    font-size: 0.9rem;
    line-height: 1.7;
  }

  .footer-col-title {
    margin-bottom: 14px;
  }

  .footer-links {
    gap: 9px;
  }

  .footer-links a {
    font-size: 0.9rem;
  }

  .footer-helpline {
    padding: 18px;
  }

  .helpline-number {
    font-size: 1.8rem;
  }

  .helpline-label,
  .helpline-desc {
    font-size: 0.85rem;
  }

  .report-btn {
    padding: 11px;
    font-size: 0.9rem;
  }

  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 18px;
  }

  .footer-copy,
  .footer-disclaimer {
    text-align: left;
    max-width: 100%;
  }
}


/* Mobile Devices */
@media (max-width: 480px) {

  .footer-main {
    padding: 42px 16px 28px;
    gap: 28px;
  }

  .footer-brand-logo {
    gap: 8px;
    margin-bottom: 12px;
  }

  .footer-logo-icon {
    width: 30px;
    height: 30px;
    font-size: 14px;
    border-radius: 7px;
  }

  .footer-logo-text {
    font-size: 1rem;
  }

  .footer-tagline {
    font-size: 0.86rem;
    line-height: 1.65;
    margin-bottom: 16px;
  }

  .footer-badge {
    font-size: 0.74rem;
    padding: 7px 12px;
    flex-wrap: wrap;
    line-height: 1.5;
  }

  .footer-col-title {
    font-size: 0.8rem;
    margin-bottom: 12px;
  }

  .footer-links {
    gap: 8px;
  }

  .footer-links a {
    font-size: 0.86rem;
    gap: 7px;
  }

  .footer-helpline {
    padding: 16px 14px;
    border-radius: 10px;
  }

  .helpline-number {
    font-size: 1.6rem;
  }

  .helpline-label {
    font-size: 0.82rem;
  }

  .helpline-desc {
    font-size: 0.82rem;
    line-height: 1.55;
  }

  .report-btn {
    padding: 12px;
    font-size: 0.88rem;
    border-radius: 9px;
  }

  .footer-divider {
    margin-top: 6px;
  }

  .footer-bottom {
    padding: 16px;
    gap: 8px;
  }

  .footer-copy {
    font-size: 0.78rem;
    line-height: 1.5;
  }

  .footer-disclaimer {
    font-size: 0.76rem;
    line-height: 1.55;
  }
}


/* Small Phones */
@media (max-width: 360px) {

  .footer-main {
    padding: 38px 14px 24px;
  }

  .footer-tagline,
  .helpline-desc,
  .footer-disclaimer {
    font-size: 0.74rem;
  }

  .footer-links a {
    font-size: 0.82rem;
  }

  .report-btn {
    font-size: 0.84rem;
  }

  .helpline-number {
    font-size: 1.45rem;
  }

  .footer-copy {
    font-size: 0.74rem;
  }
}
      
      `}</style>

      <footer className="footer-root">
        <div className="footer-main">
          {/* Column 1 – Brand */}
          <div>
            <Link to="/" className="footer-brand-logo">
              <div className="footer-logo-icon">🛡️</div>
              <span className="footer-logo-text">Scam<span>Risk</span></span>
            </Link>
            <p className="footer-tagline">
              Empowering India's citizens — especially seniors and banking users — to detect, understand, and report digital scams before they cause harm.
            </p>
            <div className="footer-badge">
              🔒 Privacy-First &nbsp;·&nbsp; No Login Required
            </div>
          </div>

          {/* Column 2 – Quick Links */}
          <div>
            <p className="footer-col-title">Quick Links</p>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/calculator">Scam Risk Calculator</Link></li>
              <li><Link to="/awareness">Awareness Hub</Link></li>
              <li><Link to="/report">Report a Scam</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 3 – Emergency Help */}
          <div>
            <p className="footer-col-title">Emergency Help</p>
            <div className="footer-helpline">
              <div className="helpline-number">1930</div>
              <div className="helpline-label">National Cyber Crime Helpline</div>
              <div className="helpline-desc">
                Call immediately if you've been scammed. Available 24/7. Report within the first hour for best recovery chances.
              </div>
            </div>
            <Link to="/report" className="report-btn">
              📋 File Online Report →
            </Link>
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-copy">
            © {year} ScamRisk. Built for safer digital India. &nbsp;
            <Link to="/privacy">Privacy Policy</Link>
          </p>
          <p className="footer-disclaimer">
            This tool provides risk guidance only. It does not record calls or store personal data. For legal matters, contact cybercrime.gov.in.
          </p>
        </div>
      </footer>
    </>
  );
}
