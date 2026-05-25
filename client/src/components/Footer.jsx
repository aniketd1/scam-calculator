import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .footer-root {
          background: #020617;
          border-top: 1px solid #1E293B;
          font-family: 'DM Sans', sans-serif;
          color: #CBD5E1;
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
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 0 14px rgba(6, 182, 212, 0.25);
        }
        .footer-logo-text {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.1rem;
          color: #06B6D4;
        }
        .footer-logo-text span { color: #F8FAFC; }
        .footer-tagline {
          font-size: 0.9rem;
          line-height: 1.65;
          color: #94A3B8;
          max-width: 280px;
          margin-bottom: 20px;
        }
        .footer-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(6, 182, 212, 0.08);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 20px;
          font-size: 0.78rem;
          color: #06B6D4;
          font-weight: 500;
        }

        .footer-col-title {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 0.85rem;
          color: #F8FAFC;
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
          color: #94A3B8;
          text-decoration: none;
          font-size: 0.9rem;
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
          background: #334155;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .footer-links a:hover { color: #06B6D4; }
        .footer-links a:hover::before { background: #06B6D4; }

        .footer-helpline {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }
        .helpline-number {
          font-family: 'Syne', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: #EF4444;
          letter-spacing: -0.02em;
          line-height: 1;
          margin-bottom: 4px;
        }
        .helpline-label {
          font-size: 0.8rem;
          color: #94A3B8;
          margin-bottom: 10px;
        }
        .helpline-desc {
          font-size: 0.82rem;
          color: #CBD5E1;
          line-height: 1.5;
        }
        .report-btn {
          display: block;
          width: 100%;
          padding: 10px;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.25);
          border-radius: 8px;
          color: #06B6D4;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 600;
          text-align: center;
          transition: background 0.2s, border-color 0.2s;
        }
        .report-btn:hover {
          background: rgba(6, 182, 212, 0.18);
          border-color: rgba(6, 182, 212, 0.5);
        }

        .footer-divider {
          border: none;
          border-top: 1px solid #1E293B;
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
          font-size: 0.82rem;
          color: #475569;
        }
        .footer-copy a { color: #06B6D4; text-decoration: none; }
        .footer-disclaimer {
          font-size: 0.78rem;
          color: #334155;
          text-align: right;
          max-width: 400px;
        }
        @media (max-width: 640px) {
          .footer-bottom { flex-direction: column; align-items: flex-start; }
          .footer-disclaimer { text-align: left; }
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
