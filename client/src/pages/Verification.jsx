import { useState } from "react";
import { Link } from "react-router-dom";

const categories = [
    "All",
    "Loan",
    "E-commerce",
    "Share Market",
    "Dating",
    "Digital Arrest",
    "Job"
];

    const companies = [
        // Loan
        { id: 1, category: "Loan", icon: "🏦", name: "BankBazaar", desc: "Compare and apply for verified loans and credit cards.", url: "https://www.bankbazaar.com", badge: "Verified Platform" },
        { id: 2, category: "Loan", icon: "🏦", name: "Paisabazaar", desc: "Check credit score and apply for legitimate loans.", url: "https://www.paisabazaar.com", badge: "Verified Platform" },
        { id: 3, category: "Loan", icon: "🏦", name: "HDFC Bank Loans", desc: "Official HDFC Bank loan applications and services.", url: "https://www.hdfcbank.com/personal/borrow", badge: "Official" },
        { id: 4, category: "Loan", icon: "🏦", name: "SBI Loans", desc: "Official State Bank of India loan portal.", url: "https://sbi.co.in/web/personal-banking/loans", badge: "Government" },
        { id: 5, category: "Loan", icon: "🏦", name: "RBI", desc: "Verify lenders and report financial fraud.", url: "https://www.rbi.org.in", badge: "Official Regulator" },

        // E-commerce
        { id: 6, category: "E-commerce", icon: "🛒", name: "Amazon India", desc: "Official Amazon portal for shopping and order tracking.", url: "https://www.amazon.in", badge: "Official" },
        { id: 7, category: "E-commerce", icon: "🛒", name: "Flipkart", desc: "Trusted e-commerce platform for online purchases.", url: "https://www.flipkart.com", badge: "Official" },
        { id: 8, category: "E-commerce", icon: "🛒", name: "Myntra", desc: "Official fashion and lifestyle shopping platform.", url: "https://www.myntra.com", badge: "Verified Platform" },
        { id: 9, category: "E-commerce", icon: "🛒", name: "Meesho", desc: "Popular online shopping and reseller marketplace.", url: "https://www.meesho.com", badge: "Popular Platform" },
        { id: 10, category: "E-commerce", icon: "🛒", name: "Ajio", desc: "Reliance-owned fashion and lifestyle marketplace.", url: "https://www.ajio.com", badge: "Verified Platform" },

        // Share Market
        { id: 11, category: "Share Market", icon: "📈", name: "SEBI", desc: "Verify brokers and report investment fraud.", url: "https://www.sebi.gov.in", badge: "Official Regulator" },
        { id: 12, category: "Share Market", icon: "📈", name: "NSE India", desc: "Official stock exchange for market data.", url: "https://www.nseindia.com", badge: "Official" },
        { id: 13, category: "Share Market", icon: "📈", name: "BSE India", desc: "Official Bombay Stock Exchange website.", url: "https://www.bseindia.com", badge: "Official" },
        { id: 14, category: "Share Market", icon: "📈", name: "Zerodha", desc: "SEBI-registered stock trading platform.", url: "https://zerodha.com", badge: "Verified Platform" },
        { id: 15, category: "Share Market", icon: "📈", name: "Groww", desc: "Popular platform for stocks and mutual funds.", url: "https://groww.in", badge: "Popular Platform" },
        { id: 16, category: "Share Market", icon: "📈", name: "Angel One", desc: "SEBI-registered stock broker and investment platform.", url: "https://www.angelone.in", badge: "Verified Platform" },
        { id: 17, category: "Share Market", icon: "📈", name: "Upstox", desc: "Digital investment and stock trading platform.", url: "https://upstox.com", badge: "Verified Platform" },

        // Dating
        { id: 18, category: "Dating", icon: "💬", name: "Tinder", desc: "Official dating app — avoid moving chats off-platform quickly.", url: "https://tinder.com", badge: "Popular Platform" },
        { id: 19, category: "Dating", icon: "💬", name: "Bumble", desc: "Dating platform with built-in safety features.", url: "https://bumble.com", badge: "Popular Platform" },
        { id: 20, category: "Dating", icon: "💬", name: "Hinge", desc: "Popular relationship-focused dating platform.", url: "https://hinge.co", badge: "Popular Platform" },
        { id: 21, category: "Dating", icon: "💬", name: "OkCupid", desc: "Online dating platform with profile verification features.", url: "https://www.okcupid.com", badge: "Verified Platform" },
        { id: 22, category: "Dating", icon: "💬", name: "Aisle", desc: "Indian dating platform focused on serious relationships.", url: "https://www.aisle.co", badge: "Verified Platform" },
        { id: 23, category: "Dating", icon: "💬", name: "TrulyMadly", desc: "Indian dating app with identity verification features.", url: "https://trulymadly.com", badge: "Verified Platform" },

        // Digital Arrest
        { id: 24, category: "Digital Arrest", icon: "🚨", name: "National Cyber Crime Portal", desc: "Report fraud, impersonation and digital arrest scams.", url: "https://cybercrime.gov.in", badge: "Official" },
        { id: 25, category: "Digital Arrest", icon: "🚨", name: "Cyber Dost", desc: "Official cyber safety awareness initiative.", url: "https://cyberdost.gov.in", badge: "Government" },
        { id: 26, category: "Digital Arrest", icon: "🚨", name: "Ministry of Home Affairs", desc: "Official advisories and public safety announcements.", url: "https://www.mha.gov.in", badge: "Government" },
        { id: 27, category: "Digital Arrest", icon: "🚨", name: "I4C", desc: "Indian Cyber Crime Coordination Centre.", url: "https://i4c.mha.gov.in", badge: "Government" },

        // Job
        { id: 28, category: "Job", icon: "💼", name: "Naukri", desc: "Verified job listings across industries.", url: "https://www.naukri.com", badge: "Popular Platform" },
        { id: 29, category: "Job", icon: "💼", name: "LinkedIn Jobs", desc: "Professional hiring platform with verified recruiters.", url: "https://www.linkedin.com/jobs", badge: "Official" },
        { id: 30, category: "Job", icon: "💼", name: "Indeed India", desc: "Aggregated job listings from verified employers.", url: "https://in.indeed.com", badge: "Verified Platform" },
        { id: 31, category: "Job", icon: "💼", name: "Foundit", desc: "Formerly Monster India, trusted recruitment platform.", url: "https://www.foundit.in", badge: "Verified Platform" },
        { id: 32, category: "Job", icon: "💼", name: "Shine", desc: "Indian job portal with employer verification.", url: "https://www.shine.com", badge: "Verified Platform" },
        { id: 33, category: "Job", icon: "💼", name: "Freshersworld", desc: "Entry-level and fresher job opportunities.", url: "https://www.freshersworld.com", badge: "Verified Platform" },
        { id: 34, category: "Job", icon: "💼", name: "Internshala", desc: "Verified internships and student opportunities.", url: "https://internshala.com", badge: "Popular Platform" },
    ];

    const badgeColor = {
        "Official": { bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.25)", color: "#06B6D4" },
        "Government": { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", color: "#22C55E" },
        "Official Regulator": { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", color: "#22C55E" },
        "Verified Platform": { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", color: "#F59E0B" },
        "Popular Platform": { bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)", color: "#8B5CF6" },
    };

    export default function VerifiedIndex() {
    const [active, setActive] = useState("All");
    const [search, setSearch] = useState("");

    const filtered = companies.filter(c => {
        const matchCat = active === "All" || c.category === active;
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <>
        <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .vi-page {
    background: #f7efe6;
    color: #0f172a;
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    }

    /* HERO */
    .vi-hero {
    position: relative;
    padding: 100px 24px 64px;
    text-align: center;
    overflow: hidden;
    }
    .vi-hero-bg {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 70% 60% at 50% 0%, rgba(34,197,94,0.06) 0%, transparent 65%);
    pointer-events: none;
    }
    .vi-hero-grid {
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
    font-size: clamp(2rem, 4vw, 3rem);
    letter-spacing: -0.03em;
    margin-bottom: 16px;
    }
    .pg-h1 .accent { color: #06B6D4; }
    .pg-sub {
    font-size: 1rem; color: #94A3B8;
    max-width: 520px; margin: 0 auto 28px; line-height: 1.7;
    }

    /* SEARCH */
    .vi-search-wrap {
    position: relative;
    max-width: 400px;
    margin: 0 auto;
    }
    .vi-search {
    width: 100%;
    padding: 11px 16px 11px 40px;
    background: #fbf7f0;
    border: 1px solid #e6e9ef;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    color: #0f172a;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    }
    .vi-search:focus { border-color: rgba(6,182,212,0.4); box-shadow: 0 0 0 3px rgba(6,182,212,0.08); }
    .vi-search::placeholder { color: #94A3B8; }
    .vi-search-icon {
    position: absolute;
    left: 13px; top: 50%;
    transform: translateY(-50%);
    font-size: 0.95rem;
    pointer-events: none;
    opacity: 0.5;
    }

    /* FILTER */
    .filter-bar {
    padding: 16px;
    max-width: 900px;
    margin: 28px auto 40px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
    background: #fbf7f0;
    border: 1px solid #e6e9ef;
    border-radius: 16px;
    }
    .filter-btn {
    padding: 10px 20px;
    border-radius: 999px;
    background: #ffffff;
    border: 1px solid #e6e9ef;
    color: #475569;
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    }
    .filter-btn:hover {
    border-color: rgba(6,182,212,0.4);
    color: #06B6D4;
    background: rgba(6,182,212,0.06);
    transform: translateY(-1px);
    }
    .filter-btn.active {
    background: linear-gradient(135deg, #06B6D4, #0891b2);
    border-color: transparent;
    color: #ffffff;
    font-weight: 600;
    box-shadow: 0 6px 16px rgba(6,182,212,0.25);
    }

    /* WARNING BANNER */
    .vi-warning {
    max-width: 900px;
    margin: 0 auto 32px;
    padding: 14px 18px;
    background: rgba(245,158,11,0.08);
    border: 1px solid rgba(245,158,11,0.25);
    border-radius: 12px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 0.84rem;
    color: #334155;
    line-height: 1.55;
    }
    .vi-warning-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
    .vi-warning strong { color: #0f172a; }

    /* COUNT */
    .vi-count {
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 24px 14px;
    font-size: 0.82rem;
    color: #94A3B8;
    }
    .vi-count span { color: #06B6D4; font-weight: 600; }

    /* GRID */
    .vi-grid {
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 24px 80px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    }
    @media (max-width: 1024px) { .vi-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .vi-grid { grid-template-columns: 1fr; } }

    /* CARD */
    .vi-card {
    background: #fbf7f0;
    border: 1px solid #e6e9ef;
    border-radius: 14px;
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
    text-decoration: none;
    color: inherit;
    }
    .vi-card:hover {
    border-color: rgba(6,182,212,0.3);
    box-shadow: 0 6px 24px rgba(0,0,0,0.1);
    transform: translateY(-2px);
    }
    .vi-card-top {
    display: flex;
    align-items: center;
    gap: 12px;
    }
    .vi-card-icon {
    font-size: 1.5rem;
    width: 44px; height: 44px;
    background: #f3efe9;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    }
    .vi-card-name {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: 0.96rem;
    color: #0f172a;
    flex: 1;
    }
    .vi-card-verify {
    font-size: 0.75rem;
    color: #22C55E;
    flex-shrink: 0;
    }
    .vi-card-desc {
    font-size: 0.83rem;
    color: #64748B;
    line-height: 1.55;
    }
    .vi-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 4px;
    }
    .vi-badge {
    display: inline-block;
    padding: 2px 9px;
    border-radius: 6px;
    font-size: 0.68rem;
    font-weight: 600;
    border: 1px solid;
    letter-spacing: 0.04em;
    }
    .vi-card-link {
    font-size: 0.78rem;
    color: #94A3B8;
    display: flex;
    align-items: center;
    gap: 4px;
    }
    .vi-card:hover .vi-card-link { color: #06B6D4; }

    /* EMPTY */
    .vi-empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 24px;
    color: #94A3B8;
    font-size: 0.9rem;
    }
    .vi-empty span { display: block; font-size: 2rem; margin-bottom: 10px; }

    /* BOTTOM BANNER */
    .tip-banner {
    background: linear-gradient(135deg, rgba(6,182,212,0.08), rgba(6,182,212,0.03));
    border-top: 1px solid rgba(6,182,212,0.15);
    border-bottom: 1px solid rgba(6,182,212,0.15);
    padding: 48px 24px;
    text-align: center;
    }
    .tip-banner h3 {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: 1.5rem;
    margin-bottom: 10px;
    }
    .tip-banner p { color: #94A3B8; font-size: 0.95rem; max-width: 440px; margin: 0 auto 24px; line-height: 1.65; }
    .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 26px;
    background: linear-gradient(135deg, #06B6D4, #0891b2);
    color: #0F172A;
    font-family: 'Inter', sans-serif;
    font-weight: 700; font-size: 0.95rem; border-radius: 10px;
    text-decoration: none;
    box-shadow: 0 0 20px rgba(6,182,212,0.28);
    transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 36px rgba(6,182,212,0.5); }

    /* RESPONSIVE */
    @media (max-width: 768px) {
    .vi-hero { padding: 75px 18px 54px; }
    .filter-bar { margin: 24px 18px 36px; padding: 14px; }
    .filter-btn { font-size: 0.82rem; padding: 9px 16px; }
    .vi-grid { padding: 0 18px 60px; gap: 14px; }
    .vi-count { padding: 0 18px 12px; }
    .vi-warning { margin: 0 18px 28px; }
    .tip-banner { padding: 38px 18px; }
    }
    @media (max-width: 480px) {
    .vi-hero { padding: 60px 16px 46px; }
    .filter-bar { margin: 20px 16px 30px; padding: 12px; gap: 8px; }
    .filter-btn { width: 100%; text-align: center; padding: 10px 14px; }
    .vi-grid { padding: 0 16px 50px; gap: 12px; }
    .vi-count { padding: 0 16px 10px; }
    .vi-warning { margin: 0 16px 24px; }
    .btn-primary { width: 100%; justify-content: center; }
    .tip-banner { padding: 34px 16px; }
    }
        `}</style>

        <div className="vi-page">

            {/* HERO */}
            <section className="vi-hero">
            <div className="vi-hero-bg" />
            <div className="vi-hero-grid" />
            <div style={{ position: "relative" }}>
                <div className="pg-tag">✅ Verified Sources</div>
                <h1 className="pg-h1">Go to the <span className="accent">Right Place</span>, Not a Fake One</h1>
                <p className="pg-sub">
                    Verified links grouped by common scam types — so you can quickly find the real platform and avoid fake ones.
                </p>
                <div className="vi-search-wrap">
                <span className="vi-search-icon">🔍</span>
                <input
                    className="vi-search"
                    type="text"
                    placeholder="Search by name or category..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                </div>
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

            {/* WARNING */}
            <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px" }}>
            <div className="vi-warning">
                <span className="vi-warning-icon">⚠️</span>
                <div><strong>Stay safe:</strong> Always check that the URL in your browser matches exactly before entering any personal or financial information. Scammers create near-identical fake websites — bookmark official links from this page.</div>
            </div>
            </div>

            {/* COUNT */}
            <div className="vi-count">
            Showing <span>{filtered.length}</span> verified {filtered.length === 1 ? "source" : "sources"}
            {active !== "All" ? ` in ${active}` : ""}
            {search ? ` matching "${search}"` : ""}
            </div>

            {/* CARDS */}
            <div className="vi-grid">
            {filtered.length === 0 ? (
                <div className="vi-empty">
                <span>🔍</span>
                No results found. Try a different search or category.
                </div>
            ) : filtered.map(c => {
                const badge = c.badge ? badgeColor[c.badge] || badgeColor["Official"] : null;
                return (
                <a
                    key={c.id}
                    className="vi-card"
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <div className="vi-card-top">
                    <div className="vi-card-icon">{c.icon}</div>
                    <div className="vi-card-name">{c.name}</div>
                    <span className="vi-card-verify" title="Verified official source">✓</span>
                    </div>
                    <div className="vi-card-desc">{c.desc}</div>
                    <div className="vi-card-footer">
                    {badge
                        ? <span className="vi-badge" style={{ background: badge.bg, borderColor: badge.border, color: badge.color }}>{c.badge}</span>
                        : <span />
                    }
                    <span className="vi-card-link">
                        {c.url.replace("https://", "").replace("http://", "").split("/")[0]} →
                    </span>
                    </div>
                </a>
                );
            })}
            </div>

            {/* BOTTOM BANNER */}
            <div className="tip-banner">
            <h3>🤔 Not Sure If a Website Is Legit?</h3>
            <p>Run a quick check with our Scam Risk Calculator before entering any details on an unfamiliar site.</p>
            <Link to="/calculator" className="btn-primary">⚡ Check Scam Risk</Link>
            </div>

        </div>
        </>
    );
}