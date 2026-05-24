import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Calculator", path: "/calculator" },
  { label: "Awareness", path: "/awareness" },
  { label: "Report", path: "/report" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .nav-root {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #0F172A;
          border-bottom: 1px solid #1E293B;
          transition: box-shadow 0.3s ease, background 0.3s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-root.scrolled {
          background: rgba(15, 23, 42, 0.97);
          box-shadow: 0 4px 32px rgba(6, 182, 212, 0.08);
        }
        .nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .nav-logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #06B6D4, #0891b2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 0 16px rgba(6, 182, 212, 0.3);
        }
        .nav-logo-text {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.15rem;
          color: #06B6D4;
          letter-spacing: -0.02em;
        }
        .nav-logo-text span {
          color: #F8FAFC;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .nav-links a {
          display: block;
          padding: 6px 14px;
          font-size: 0.92rem;
          font-weight: 500;
          color: #CBD5E1;
          text-decoration: none;
          border-radius: 6px;
          transition: color 0.2s, background 0.2s;
          letter-spacing: 0.01em;
        }
        .nav-links a:hover,
        .nav-links a.active {
          color: #22D3EE;
          background: rgba(6, 182, 212, 0.08);
        }
        .nav-links a.active {
          color: #06B6D4;
        }
        .nav-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 20px;
          background: linear-gradient(135deg, #06B6D4, #0891b2);
          color: #0F172A;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 0.88rem;
          border-radius: 8px;
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
          box-shadow: 0 0 16px rgba(6, 182, 212, 0.25);
          white-space: nowrap;
        }
        .nav-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 28px rgba(6, 182, 212, 0.45);
          filter: brightness(1.05);
        }
        .nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: background 0.2s;
        }
        .hamburger:hover { background: rgba(255,255,255,0.06); }
        .hamburger span {
          display: block;
          width: 22px;
          height: 2px;
          background: #F8FAFC;
          border-radius: 2px;
          transition: transform 0.3s, opacity 0.3s;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        .mobile-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #111827;
          border-bottom: 1px solid #1E293B;
          padding: 16px 24px 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .mobile-menu.open { display: block; }
        .mobile-menu ul {
          list-style: none;
          margin: 0 0 16px;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .mobile-menu ul a {
          display: block;
          padding: 10px 14px;
          color: #CBD5E1;
          text-decoration: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          transition: color 0.2s, background 0.2s;
        }
        .mobile-menu ul a:hover,
        .mobile-menu ul a.active {
          color: #22D3EE;
          background: rgba(6, 182, 212, 0.08);
        }
        .mobile-menu .nav-cta { width: 100%; justify-content: center; padding: 12px; }

        @media (max-width: 900px) {
          .nav-links, .nav-right .nav-cta { display: none; }
          .hamburger { display: flex; }
        }
      `}</style>

      <nav className={`nav-root${scrolled ? " scrolled" : ""}`} style={{ position: "relative" }}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">🛡️</div>
            <span className="nav-logo-text">Scam<span>Risk</span></span>
          </Link>

          <ul className="nav-links">
            {navLinks.map(({ label, path }) => (
              <li key={path}>
                <Link to={path} className={location.pathname === path ? "active" : ""}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-right">
            <Link to="/calculator" className="nav-cta">
              ⚡ Check Scam Risk
            </Link>
            <button
              className={`hamburger${menuOpen ? " open" : ""}`}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
          <ul>
            {navLinks.map(({ label, path }) => (
              <li key={path}>
                <Link to={path} className={location.pathname === path ? "active" : ""}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/calculator" className="nav-cta">⚡ Check Scam Risk</Link>
        </div>
      </nav>
    </>
  );
}