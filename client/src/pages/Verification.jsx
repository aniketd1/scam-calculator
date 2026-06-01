import { useState } from "react";
import { Link } from "react-router-dom";

const categories = [
    "All", "Job Portals", "Loan & Finance", "Banking", "Government", "Insurance", "Investment", "Courier & Delivery"
    ];

    const companies = [
    // Job Portals
    { id: 1, category: "Job Portals", icon: "💼", name: "Naukri", desc: "India's largest job portal for professionals across all industries.", url: "https://www.naukri.com", badge: "Most Popular" },
    { id: 2, category: "Job Portals", icon: "💼", name: "LinkedIn Jobs", desc: "Professional networking and job listings, verified employer profiles.", url: "https://www.linkedin.com/jobs", badge: null },
    { id: 3, category: "Job Portals", icon: "💼", name: "Indeed India", desc: "Aggregated job listings from thousands of verified employer websites.", url: "https://in.indeed.com", badge: null },
    { id: 4, category: "Job Portals", icon: "💼", name: "Shine.com", desc: "Job portal focused on Indian mid-level and senior professionals.", url: "https://www.shine.com", badge: null },
    { id: 5, category: "Job Portals", icon: "💼", name: "Freshersworld", desc: "Dedicated portal for fresher and entry-level job seekers in India.", url: "https://www.freshersworld.com", badge: null },

    // Loan & Finance
    { id: 6, category: "Loan & Finance", icon: "🏦", name: "BankBazaar", desc: "RBI-registered platform to compare and apply for loans, cards, and insurance.", url: "https://www.bankbazaar.com", badge: "RBI Registered" },
    { id: 7, category: "Loan & Finance", icon: "🏦", name: "Paisabazaar", desc: "Aggregator for personal loans, home loans, and credit score checks.", url: "https://www.paisabazaar.com", badge: null },
    { id: 8, category: "Loan & Finance", icon: "🏦", name: "HDFC Bank Loans", desc: "Official HDFC Bank portal for personal, home, and vehicle loans.", url: "https://www.hdfcbank.com/personal/loans", badge: null },
    { id: 9, category: "Loan & Finance", icon: "🏦", name: "SBI Loans", desc: "Official State Bank of India loan products and application portal.", url: "https://sbi.co.in/web/personal-banking/loans", badge: "Government Bank" },
    { id: 10, category: "Loan & Finance", icon: "🏦", name: "MoneyControl Loans", desc: "Trusted finance platform for loan comparison and financial news.", url: "https://www.moneycontrol.com", badge: null },

    // Banking
    { id: 11, category: "Banking", icon: "🏛️", name: "SBI (State Bank of India)", desc: "Official online banking portal for India's largest public sector bank.", url: "https://www.onlinesbi.sbi", badge: "Government Bank" },
    { id: 12, category: "Banking", icon: "🏛️", name: "HDFC Bank", desc: "Official portal for HDFC Bank accounts, cards, and digital banking.", url: "https://www.hdfcbank.com", badge: null },
    { id: 13, category: "Banking", icon: "🏛️", name: "ICICI Bank", desc: "Official ICICI Bank internet and mobile banking platform.", url: "https://www.icicibank.com", badge: null },
    { id: 14, category: "Banking", icon: "🏛️", name: "Axis Bank", desc: "Official Axis Bank digital banking and account management portal.", url: "https://www.axisbank.com", badge: null },
    { id: 15, category: "Banking", icon: "🏛️", name: "RBI (Reserve Bank of India)", desc: "Central bank — file complaints, check registered NBFCs, and verify lenders.", url: "https://www.rbi.org.in", badge: "Central Bank" },

    // Government
    { id: 16, category: "Government", icon: "🇮🇳", name: "National Cyber Crime Portal", desc: "Official government portal to report online fraud and cybercrime.", url: "https://cybercrime.gov.in", badge: "Official" },
    { id: 17, category: "Government", icon: "🇮🇳", name: "UIDAI (Aadhaar)", desc: "Official Aadhaar authority — update details, lock biometrics, check status.", url: "https://uidai.gov.in", badge: "Official" },
    { id: 18, category: "Government", icon: "🇮🇳", name: "Income Tax e-Filing", desc: "Official portal for filing income tax returns and viewing refund status.", url: "https://www.incometax.gov.in", badge: "Official" },
    { id: 19, category: "Government", icon: "🇮🇳", name: "Umang App / Portal", desc: "Government services aggregator — PF, PAN, Aadhaar and more in one place.", url: "https://web.umang.gov.in", badge: "Official" },
    { id: 20, category: "Government", icon: "🇮🇳", name: "EPFO (PF Portal)", desc: "Official Employees' Provident Fund portal for balance, withdrawal, and KYC.", url: "https://www.epfindia.gov.in", badge: "Official" },

    // Insurance
    { id: 21, category: "Insurance", icon: "🛡️", name: "PolicyBazaar", desc: "IRDAI-registered aggregator for comparing health, life, and vehicle insurance.", url: "https://www.policybazaar.com", badge: "IRDAI Registered" },
    { id: 22, category: "Insurance", icon: "🛡️", name: "LIC India", desc: "Official Life Insurance Corporation of India portal for policy and claims.", url: "https://licindia.in", badge: "Government" },
    { id: 23, category: "Insurance", icon: "🛡️", name: "IRDAI (Regulator)", desc: "Official insurance regulator — verify your insurer and file complaints.", url: "https://irdai.gov.in", badge: "Official Regulator" },
    { id: 24, category: "Insurance", icon: "🛡️", name: "Star Health Insurance", desc: "Official portal for health insurance plans and cashless claim requests.", url: "https://www.starhealth.in", badge: null },

    // Investment
    { id: 25, category: "Investment", icon: "📈", name: "SEBI (Regulator)", desc: "Official market regulator — verify brokers, file complaints, investor education.", url: "https://www.sebi.gov.in", badge: "Official Regulator" },
    { id: 26, category: "Investment", icon: "📈", name: "NSE India", desc: "Official National Stock Exchange portal for market data and investor tools.", url: "https://www.nseindia.com", badge: null },
    { id: 27, category: "Investment", icon: "📈", name: "Zerodha", desc: "SEBI-registered discount broker and investment platform for stocks and MF.", url: "https://zerodha.com", badge: "SEBI Registered" },
    { id: 28, category: "Investment", icon: "📈", name: "Groww", desc: "SEBI-registered platform for mutual funds, stocks, and digital gold.", url: "https://groww.in", badge: "SEBI Registered" },
    { id: 29, category: "Investment", icon: "📈", name: "AMFI (Mutual Funds)", desc: "Official mutual fund regulator — verify fund houses and distributor credentials.", url: "https://www.amfiindia.com", badge: "Official" },

    // Courier & Delivery
    { id: 30, category: "Courier & Delivery", icon: "📦", name: "India Post", desc: "Official India Post tracking and postal service portal.", url: "https://www.indiapost.gov.in", badge: "Government" },
    { id: 31, category: "Courier & Delivery", icon: "📦", name: "DTDC", desc: "Official DTDC courier tracking and shipment booking portal.", url: "https://www.dtdc.in", badge: null },
    { id: 32, category: "Courier & Delivery", icon: "📦", name: "Blue Dart", desc: "Official Blue Dart express delivery and parcel tracking portal.", url: "https://www.bluedart.com", badge: null },
    { id: 33, category: "Courier & Delivery", icon: "📦", name: "Amazon Tracking", desc: "Track Amazon India orders — official and only legitimate source for Amazon parcels.", url: "https://www.amazon.in/gp/your-account/order-history", badge: null },
    { id: 34, category: "Courier & Delivery", icon: "📦", name: "Delhivery", desc: "Official Delhivery parcel tracking for e-commerce shipments.", url: "https://www.delhivery.com", badge: null },
    ];

    const badgeColor = {
    "Official": { bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.25)", color: "#06B6D4" },
    "Official Regulator": { bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.25)", color: "#06B6D4" },
    "Government": { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", color: "#22C55E" },
    "Government Bank": { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", color: "#22C55E" },
    "Central Bank": { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", color: "#22C55E" },
    "RBI Registered": { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", color: "#F59E0B" },
    "IRDAI Registered": { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", color: "#F59E0B" },
    "SEBI Registered": { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", color: "#F59E0B" },
    "Most Popular": { bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)", color: "#8B5CF6" },
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
                <p className="pg-sub">Official links to trusted Indian portals for jobs, loans, banking, investments, and government services — so you're never redirected to a scam site.</p>
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