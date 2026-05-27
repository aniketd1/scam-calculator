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
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');          display: none;
        }
          html, body {
  overflow-x: hidden;
}

        .nav-root {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #e8dccb;
          border-bottom: 1px solid #efe6db;
          transition: box-shadow 0.3s ease, background 0.3s ease;
          font-family: 'Inter', sans-serif;
        }
        .nav-root.scrolled {
          background: rgba(247,239,230,0.98);
          box-shadow: 0 6px 24px rgba(15,23,42,0.06);
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
          width:36px; height:36px;
          background: linear-gradient(135deg,#06B6D4,#0891b2);
          border-radius:8px; display:flex; align-items:center; justify-content:center;
          font-size:18px; box-shadow:0 0 12px rgba(14,165,164,0.12);
        }
        .nav-logo-text { font-family:'Space Grotesk',sans-serif; font-weight:800; font-size:1.15rem; color:#0f172a; }
        .nav-logo-text span {
          color: #2563eb;
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
          display:block; padding:8px 16px; font-size:.95rem; font-weight:500;
          color:#0f172a; text-decoration:none; border-radius:8px; transition:color .2s, background .2s;
        }
        .nav-links a:hover,
        .nav-links a.active { color:#0f172a; background: rgba(6,182,212,0.08); }
        .nav-links a.active { color:#0891b2; }

        .nav-cta {
          display:inline-flex; gap:8px; padding:10px 22px;
          background: linear-gradient(135deg,#06B6D4,#0891b2);
          color:#fff; font-weight:700; border-radius:10px; box-shadow:0 8px 18px rgba(14,165,164,0.14);
        }
        .nav-cta:hover { transform:translateY(-1px); filter:brightness(1.03); }

        .mobile-menu {
          display:none; position:absolute; top:100%; left:0; right:0;
          background:#fbf7f0; border-bottom:1px solid #efe6db; padding:16px 24px;
          box-shadow:0 20px 40px rgba(15,23,42,0.06);
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
          display:block; padding:12px 14px; color:#0f172a; text-decoration:none; border-radius:10px;
        }
        .mobile-menu ul a:hover,
        .mobile-menu ul a.active { color:#0f766e; background:rgba(15,118,110,0.06); }

        @media (max-width: 900px) {
          .nav-links, .nav-right .nav-cta { display: none; }
          .hamburger { display: flex; }
        }

        .hamburger {
  display: none;
  background: transparent;
  border: none;
}
        /* ───────────────── RESPONSIVE DESIGN ───────────────── */


/* Large Tablets */
@media (max-width: 1024px) {

  .nav-inner {
    padding: 0 20px;
  }

  .nav-links a {
    padding: 8px 13px;
    font-size: 0.9rem;
  }

  .nav-cta {
    padding: 9px 18px;
    font-size: 0.9rem;
  }
}


/* Tablets */
@media (max-width: 900px) {

  .nav-root {
    overflow: visible;
  }

  .nav-inner {
    height: 74px;
    padding: 0 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-links,
  .nav-right {
    display: none;
  }

  .nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .nav-logo-icon {
    width: 38px;
    height: 38px;
    font-size: 17px;
    border-radius: 10px;
  }

  .nav-logo-text {
    font-size: 1.15rem;
    white-space: nowrap;
  }

  .hamburger {
    width: 46px;
    height: 46px;
    border: 1px solid rgba(6,182,212,0.18);
    background: rgba(6,182,212,0.05);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-direction: column;
    gap: 5px;
    flex-shrink: 0;
  }

  .hamburger span {
    width: 20px;
    height: 2.2px;
    background: #0f172a;
    border-radius: 999px;
  }

  .mobile-menu {
    position: absolute;
    top: 100%;
    left: 12px;
    right: 12px;
    background: #fbf7f0;
    border: 1px solid #efe6db;
    border-radius: 16px;
    padding: 18px;
    box-shadow: 0 20px 40px rgba(15,23,42,0.08);
    z-index: 999;
  }

  .mobile-menu ul {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 18px;
  }

  .mobile-menu ul a {
    display: block;
    padding: 14px 16px;
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 500;
    color: #0f172a;
    text-decoration: none;
    background: rgba(6,182,212,0.03);
  }

  .mobile-menu ul a:hover,
  .mobile-menu ul a.active {
    background: rgba(6,182,212,0.1);
    color: #0891b2;
  }

  .mobile-menu .nav-cta {
    width: 100%;
    justify-content: center;
    display: flex;
    text-align: center;
    padding: 13px;
    font-size: 0.92rem;
  }
}


/* Mobile Devices */
@media (max-width: 480px) {

  .nav-inner {
    height: 60px;
    padding: 0 16px;
  }

  .nav-logo-icon {
    width: 30px;
    height: 30px;
    font-size: 14px;
    border-radius: 7px;
  }

  .nav-logo-text {
    font-size: 0.98rem;
  }

  .hamburger {
    width: 38px;
    height: 38px;
    border-radius: 9px;
  }

  .hamburger span {
    width: 16px;
  }

  .mobile-menu {
    padding: 14px 16px 18px;
  }

  .mobile-menu ul a {
    padding: 12px;
    font-size: 0.88rem;
    border-radius: 9px;
  }

  .mobile-menu .nav-cta {
    padding: 11px;
    font-size: 0.88rem;
    border-radius: 9px;
  }
}


/* Small Phones */
@media (max-width: 360px) {

  .nav-inner {
    padding: 0 14px;
  }

  .nav-logo-text {
    font-size: 0.92rem;
  }

  .mobile-menu ul a {
    font-size: 0.84rem;
  }

  .mobile-menu .nav-cta {
    font-size: 0.84rem;
  }
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
          </div>
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
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
