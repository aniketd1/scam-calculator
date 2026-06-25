// AdminDashboard.jsx

import { useState, useEffect, useCallback } from "react";

// this is a comment to redeploy 
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
;

/* ── helpers ────────────────────────────────────────────────── */
function authHeaders(token) {
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    }

    async function apiFetch(path, token, opts = {}) {
    const res = await fetch(`${API}${path}`, {
        headers: authHeaders(token),
        ...opts,
    });
    return res.json();
    }

    /* ── CopyBox ────────────────────────────────────────────────── */
    function CopyBox({ value, label }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="copy-box">
        <div className="copy-label">{label}</div>
        <div className="copy-row">
            <code className="copy-value">{value}</code>
            <button className="btn-copy" onClick={copy}>
            {copied ? "✓ Copied" : "Copy"}
            </button>
        </div>
        </div>
    );
    }

    /* ── Alert ──────────────────────────────────────────────────── */
    function Alert({ type = "info", children }) {
    return <div className={`adm-alert adm-alert--${type}`}>{children}</div>;
    }

    /* ── Toast ──────────────────────────────────────────────────── */
    function Toast({ toast, onClose }) {
    if (!toast) return null;
    return (
        <div className={`toast toast-${toast.type}`} onClick={onClose}>
        <span>{toast.type === "success" ? "✓" : "✕"}</span>
        <span>{toast.message}</span>
        </div>
    );
    }

    /* ── LoginScreen ────────────────────────────────────────────── */
    function LoginScreen({ onLogin }) {
    const [email,   setEmail]   = useState("");
    const [pass,    setPass]    = useState("");
    const [error,   setError]   = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError(""); setLoading(true);
        const data = await apiFetch("/api/admin/login", "", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
        });
        setLoading(false);
        if (!data.success) { setError(data.error); return; }
        onLogin(data.token, data.admin);
    };

    return (
        <>
        <style>{CSS}</style>
        <div className="adm-login-page">
            <div className="adm-login-card">
            <p className="hero-eyebrow">Internal team</p>
            <h1 className="adm-login-title">Scam2Safe <span className="hero-accent">Admin</span></h1>
            <p className="adm-login-sub">Sign in to manage users and API keys.</p>
            <form onSubmit={submit} className="form-stack">
                <div className="field-group">
                <label className="field-label">Email address</label>
                <input className="field-input" type="email" placeholder="you@scam2safe.com"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="field-group">
                <label className="field-label">Password</label>
                <input className="field-input" type="password" placeholder="••••••••"
                    value={pass} onChange={e => setPass(e.target.value)} required />
                </div>
                {error && <Alert type="danger">{error}</Alert>}
                <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Signing in…" : "Sign in →"}
                </button>
            </form>
            </div>
        </div>
        </>
    );
    }

    /* ── ApiKeyPanel ────────────────────────────────────────────── */
    function ApiKeyPanel({ token, showToast }) {
    const [email,   setEmail]   = useState("");
    const [user,    setUser]    = useState(null);
    const [loading, setLoading] = useState(false);
    const [msg,     setMsg]     = useState(null);
    const [newKey,  setNewKey]  = useState(null);

    const lookup = async (e) => {
        e.preventDefault();
        setMsg(null); setUser(null); setNewKey(null); setLoading(true);
        const data = await apiFetch(`/api/admin/users/${encodeURIComponent(email.trim())}`, token);
        setLoading(false);
        if (!data.success) { setMsg({ type: "danger", text: data.error }); return; }
        setUser(data.user);
    };

    const generateKey = async () => {
        setMsg(null); setNewKey(null); setLoading(true);
        const data = await apiFetch("/api/admin/generate-api-key", token, {
        method: "POST",
        body: JSON.stringify({ email: user.email }),
        });
        setLoading(false);
        if (!data.success) { setMsg({ type: "danger", text: data.error }); return; }
        setNewKey(data.apiKey);
        setUser(prev => ({ ...prev, apiKeyHint: data.apiKeyHint, apiKeyCreatedAt: new Date().toISOString() }));
        showToast("success", "API key generated — copy it now.");
    };

    const revokeKey = async () => {
        if (!confirm(`Revoke API key for ${user.email}?`)) return;
        setMsg(null); setLoading(true);
        const data = await apiFetch("/api/admin/revoke-api-key", token, {
        method: "POST",
        body: JSON.stringify({ email: user.email }),
        });
        setLoading(false);
        if (!data.success) { setMsg({ type: "danger", text: data.error }); return; }
        setUser(prev => ({ ...prev, apiKeyHint: null, apiKeyCreatedAt: null }));
        setNewKey(null);
        showToast("success", "API key revoked.");
    };

    return (
        <section className="panel-section">
        <h2 className="panel-heading">Generate API key</h2>
        <p className="panel-sub">Look up an end user by email, then issue or rotate their WordPress API key.</p>

        <form onSubmit={lookup} className="search-row">
            <input className="field-input" type="email" value={email}
            onChange={e => setEmail(e.target.value)} placeholder="user@example.com" required />
            <button className="btn-primary btn-primary--inline" type="submit" disabled={loading}>
            {loading ? "…" : "Look up"}
            </button>
        </form>

        {msg && <Alert type={msg.type}>{msg.text}</Alert>}

        {newKey && (
            <CopyBox value={newKey} label="New API key — copy now, won't be shown again" />
        )}

        {user && (
            <div className="user-card">
            <div className="user-card-header">
                <div className="user-avatar">{user.email[0].toUpperCase()}</div>
                <div>
                <div className="user-email">{user.email}</div>
                <div className="user-meta">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                </div>
            </div>

            <table className="user-table">
                <tbody>
                <tr>
                    <td className="user-table-key">WordPress site</td>
                    <td>{user.wordpressSite || <span className="dim">—</span>}</td>
                </tr>
                <tr>
                    <td className="user-table-key">Visual password</td>
                    <td>{user.apiKeyHint
                    ? <span className="badge badge--success">Set up</span>
                    : <span className="dim">—</span>}</td>
                </tr>
                <tr>
                    <td className="user-table-key">API key hint</td>
                    <td>{user.apiKeyHint
                    ? <code className="mono">…{user.apiKeyHint}</code>
                    : <span className="dim">No key yet</span>}</td>
                </tr>
                {user.apiKeyCreatedAt && (
                    <tr>
                    <td className="user-table-key">Key issued</td>
                    <td className="dim">{new Date(user.apiKeyCreatedAt).toLocaleString()}</td>
                    </tr>
                )}
                </tbody>
            </table>

            <div className="btn-row">
                <button className="btn-primary" onClick={generateKey} disabled={loading}>
                {user.apiKeyHint ? "Rotate key" : "Generate key"}
                </button>
                {user.apiKeyHint && (
                <button className="btn-danger" onClick={revokeKey} disabled={loading}>
                    Revoke key
                </button>
                )}
            </div>
            </div>
        )}
        </section>
    );
    }

    /* ── UsersPanel ─────────────────────────────────────────────── */
    function UsersPanel({ token }) {
    const [users,   setUsers]   = useState([]);
    const [total,   setTotal]   = useState(0);
    const [page,    setPage]    = useState(1);
    const [pages,   setPages]   = useState(1);
    const [search,  setSearch]  = useState("");
    const [query,   setQuery]   = useState("");
    const [loading, setLoading] = useState(false);

    const load = useCallback(async (p, q) => {
        setLoading(true);
        const params = new URLSearchParams({ page: p, limit: 20, ...(q ? { search: q } : {}) });
        const data = await apiFetch(`/api/admin/users?${params}`, token);
        setLoading(false);
        if (!data.success) return;
        setUsers(data.users); setTotal(data.total);
        setPage(data.page);   setPages(data.pages);
    }, [token]);

    useEffect(() => { load(1, ""); }, [load]);

    const handleSearch = (e) => {
        e.preventDefault();
        load(1, search); setQuery(search);
    };

    return (
        <section className="panel-section">
        <div className="panel-heading-row">
            <div>
            <h2 className="panel-heading">All users</h2>
            <p className="panel-sub">{total} registered account{total !== 1 ? "s" : ""}</p>
            </div>
            <form onSubmit={handleSearch} className="search-row search-row--inline">
            <input className="field-input field-input--sm" type="text" value={search}
                onChange={e => setSearch(e.target.value)} placeholder="Search by email…" />
            <button className="btn-primary btn-primary--inline" type="submit">Search</button>
            </form>
        </div>

        {loading
            ? <p className="dim" style={{ padding: "20px 0" }}>Loading…</p>
            : users.length === 0
            ? <p className="dim">No users found.</p>
            : (
                <div className="table-wrap">
                <table className="data-table">
                    <thead>
                    <tr>
                        {["Email", "WordPress site", "API key hint", "Key issued", "Joined"].map(h => (
                        <th key={h}>{h}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(u => (
                        <tr key={u._id}>
                        <td>{u.email}</td>
                        <td className="dim">{u.wordpressSite || "—"}</td>
                        <td>{u.apiKeyHint
                            ? <code className="mono">…{u.apiKeyHint}</code>
                            : <span className="dim">—</span>}</td>
                        <td className="dim">{u.apiKeyCreatedAt ? new Date(u.apiKeyCreatedAt).toLocaleDateString() : "—"}</td>
                        <td className="dim">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}

        {pages > 1 && (
            <div className="pagination">
            <button className="btn-outline btn-outline--sm"
                onClick={() => load(page - 1, query)} disabled={page <= 1 || loading}>← Prev</button>
            <span className="dim">Page {page} of {pages}</span>
            <button className="btn-outline btn-outline--sm"
                onClick={() => load(page + 1, query)} disabled={page >= pages || loading}>Next →</button>
            </div>
        )}
        </section>
    );
    }

    /* ── TeamPanel ──────────────────────────────────────────────── */
    function TeamPanel({ token, currentAdmin, showToast }) {
    const [team,    setTeam]    = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg,     setMsg]     = useState(null);
    const [form,    setForm]    = useState({ email: "", password: "", name: "" });

    const loadTeam = useCallback(async () => {
        const data = await apiFetch("/api/admin/team", token);
        if (data.success) setTeam(data.team);
    }, [token]);

    useEffect(() => { loadTeam(); }, [loadTeam]);

    const invite = async (e) => {
        e.preventDefault();
        setMsg(null); setLoading(true);
        const data = await apiFetch("/api/admin/invite", token, {
        method: "POST",
        body: JSON.stringify(form),
        });
        setLoading(false);
        if (!data.success) { setMsg({ type: "danger", text: data.error }); return; }
        showToast("success", `${data.admin.name} added to the team.`);
        setForm({ email: "", password: "", name: "" });
        loadTeam();
    };

    const remove = async (adminId, name) => {
        if (!confirm(`Remove ${name} from the team?`)) return;
        const data = await apiFetch(`/api/admin/team/${adminId}`, token, { method: "DELETE" });
        if (!data.success) { setMsg({ type: "danger", text: data.error }); return; }
        showToast("success", `${name} removed.`);
        loadTeam();
    };

    if (currentAdmin.role !== "super_admin") {
        return (
        <section className="panel-section">
            <h2 className="panel-heading">Team</h2>
            <Alert type="info">Only super admins can manage team members.</Alert>
        </section>
        );
    }

    return (
        <section className="panel-section">
        <h2 className="panel-heading">Team management</h2>
        <p className="panel-sub">Add or remove internal team members.</p>

        <div className="inner-card">
            <p className="inner-card-title">Add team member</p>
            <form onSubmit={invite} className="invite-grid">
            <div className="field-group">
                <label className="field-label">Name</label>
                <input className="field-input" value={form.name} placeholder="Jane Smith"
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="field-group">
                <label className="field-label">Email</label>
                <input className="field-input" type="email" value={form.email} placeholder="jane@scam2safe.com"
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="field-group">
                <label className="field-label">Temp password</label>
                <input className="field-input" type="password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <div className="field-group field-group--btn">
                <label className="field-label" style={{ visibility: "hidden" }}>Add</label>
                <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Adding…" : "Add member"}
                </button>
            </div>
            </form>
            {msg && <Alert type={msg.type}>{msg.text}</Alert>}
        </div>

        <div className="team-list">
            {team.map(member => (
            <div key={member._id} className="team-row">
                <div className={`team-avatar team-avatar--${member.role === "super_admin" ? "super" : "admin"}`}>
                {member.name[0].toUpperCase()}
                </div>
                <div className="team-info">
                <div className="team-name">{member.name}</div>
                <div className="team-email">{member.email}</div>
                </div>
                <span className={`badge badge--${member.role === "super_admin" ? "super" : "role"}`}>
                {member.role === "super_admin" ? "Super admin" : "Admin"}
                </span>
                {member._id !== currentAdmin.id && (
                <button className="btn-danger btn-danger--sm" onClick={() => remove(member._id, member.name)}>
                    Remove
                </button>
                )}
            </div>
            ))}
        </div>
        </section>
    );
    }

    /* ── Main dashboard ─────────────────────────────────────────── */
    export default function AdminDashboard() {
    const [token, setToken] = useState(() => sessionStorage.getItem("admin_token") || "");
    const [admin, setAdmin] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem("admin_info") || "null"); } catch { return null; }
    });
    const [tab,   setTab]   = useState("apikeys");
    const [toast, setToast] = useState(null);

    const showToast = (type, msg) => {
        setToast({ type, message: msg });
        setTimeout(() => setToast(null), 4500);
    };

    const handleLogin = (t, a) => {
        sessionStorage.setItem("admin_token", t);
        sessionStorage.setItem("admin_info", JSON.stringify(a));
        setToken(t); setAdmin(a);
    };

    const logout = () => {
        sessionStorage.clear();
        setToken(""); setAdmin(null);
    };

    if (!token || !admin) return <LoginScreen onLogin={handleLogin} />;

    const tabs = [
        { id: "apikeys", label: "API keys"  },
        { id: "users",   label: "All users" },
        { id: "team",    label: "Team"      },
    ];

    return (
        <>
        <style>{CSS}</style>
        <Toast toast={toast} onClose={() => setToast(null)} />

        <div className="adm-page">
            {/* Header */}
            <header className="adm-header">
            <div className="adm-header-left">
                <p className="hero-eyebrow" style={{ margin: 0 }}>Internal dashboard</p>
                <span className="adm-brand">Scam<span className="hero-accent">2Safe</span></span>
            </div>
            <div className="adm-header-right">
                <span className="dim" style={{ fontSize: "0.83rem" }}>{admin.name}</span>
                <button className="btn-outline btn-outline--sm" onClick={logout}>Sign out</button>
            </div>
            </header>

            <div className="adm-shell">
            {/* Tabs */}
            <div className="adm-tabs">
                {tabs.map(t => (
                <button key={t.id}
                    className={`adm-tab${tab === t.id ? " adm-tab--active" : ""}`}
                    onClick={() => setTab(t.id)}>
                    {t.label}
                </button>
                ))}
            </div>

            {/* Panel */}
            <div className="adm-card">
                {tab === "apikeys" && <ApiKeyPanel token={token} showToast={showToast} />}
                {tab === "users"   && <UsersPanel  token={token} />}
                {tab === "team"    && <TeamPanel   token={token} currentAdmin={admin} showToast={showToast} />}
            </div>
            </div>

            <p className="page-footer">ScamRisk — Admin dashboard · Internal use only</p>
        </div>
        </>
    );
}

/* ── STYLES — mirrors Auth.jsx tokens exactly ───────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
button,input,select,textarea{font-family:inherit;}

/* ── PAGE ── */
.adm-page{min-height:100vh;background:#f7efe6;color:#0f172a;font-family:'Inter',sans-serif;padding-bottom:72px;}
.adm-login-page{min-height:100vh;background:#f7efe6;display:flex;align-items:center;justify-content:center;padding:20px;}
.adm-login-card{background:#fbf7f0;border:1px solid #e2d9cc;border-radius:20px;padding:40px 36px;width:100%;max-width:420px;box-shadow:0 4px 28px rgba(15,23,42,0.06);display:flex;flex-direction:column;gap:20px;}
.adm-login-title{font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:1.8rem;letter-spacing:-0.04em;color:#0f172a;}
.adm-login-sub{font-size:0.85rem;color:#64748b;line-height:1.6;margin-top:-12px;}

/* ── HEADER ── */
.adm-header{background:#fbf7f0;border-bottom:1px solid #e2d9cc;padding:0 32px;height:58px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;}
.adm-header-left{display:flex;align-items:baseline;gap:10px;}
.adm-brand{font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:1.1rem;letter-spacing:-0.03em;color:#0f172a;}
.adm-header-right{display:flex;align-items:center;gap:12px;}

/* ── SHELL ── */
.adm-shell{max-width:960px;margin:0 auto;padding:28px 20px 0;}

/* ── TABS ── */
.adm-tabs{display:flex;gap:6px;margin-bottom:20px;}
.adm-tab{padding:9px 20px;border-radius:99px;background:#fff;border:1.5px solid #e2d9cc;color:#475569;font-size:0.88rem;font-weight:500;cursor:pointer;transition:all 0.18s;}
.adm-tab:hover{border-color:rgba(6,182,212,0.4);color:#0891b2;}
.adm-tab--active{background:linear-gradient(135deg,#06B6D4,#0891b2);color:#fff;border-color:transparent;font-weight:700;}

/* ── CARD ── */
.adm-card{background:#fbf7f0;border:1px solid #e2d9cc;border-radius:20px;padding:32px 36px;box-shadow:0 4px 28px rgba(15,23,42,0.06);}
@media(max-width:600px){.adm-card{padding:20px 16px;}}

/* ── PANEL ── */
.panel-section{display:flex;flex-direction:column;gap:18px;}
.panel-heading{font-family:'Space Grotesk',sans-serif;font-size:1.1rem;font-weight:700;color:#0f172a;}
.panel-heading-row{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;}
.panel-sub{font-size:0.82rem;color:#64748b;line-height:1.6;margin-top:-10px;}

/* ── FORM ── */
.form-stack{display:flex;flex-direction:column;gap:14px;}
.field-group{display:flex;flex-direction:column;gap:5px;}
.field-group--btn{justify-content:flex-end;}
.field-label{font-size:0.73rem;font-weight:600;color:#475569;letter-spacing:0.05em;text-transform:uppercase;}
.field-input{width:100%;padding:11px 13px;border-radius:10px;border:1.5px solid #e2d9cc;background:#fff;font-size:0.91rem;color:#0f172a;outline:none;transition:border-color 0.18s,box-shadow 0.18s;}
.field-input:focus{border-color:#06B6D4;box-shadow:0 0 0 3px rgba(6,182,212,0.1);}
.field-input::placeholder{color:#94a3b8;}
.field-input--sm{width:220px;}
@media(max-width:540px){.field-input--sm{width:100%;}}

.search-row{display:flex;gap:8px;align-items:center;}
.search-row--inline{flex-shrink:0;}
@media(max-width:600px){.search-row--inline{width:100%;}}

.invite-grid{display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:12px;align-items:end;}
@media(max-width:720px){.invite-grid{grid-template-columns:1fr 1fr;}}
@media(max-width:480px){.invite-grid{grid-template-columns:1fr;}}

/* ── BUTTONS ── */
.btn-primary{padding:11px 20px;border-radius:10px;border:none;background:linear-gradient(135deg,#06B6D4,#0891b2);color:#fff;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:0.9rem;cursor:pointer;box-shadow:0 0 18px rgba(6,182,212,0.18);transition:transform 0.18s,box-shadow 0.18s,opacity 0.18s;white-space:nowrap;}
.btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 0 26px rgba(6,182,212,0.32);}
.btn-primary:disabled{opacity:0.36;cursor:not-allowed;box-shadow:none;transform:none;}
.btn-primary--inline{padding:11px 16px;}
.btn-outline{padding:10px 16px;border-radius:10px;border:1.5px solid #e2d9cc;background:transparent;color:#475569;font-size:0.88rem;font-weight:500;cursor:pointer;transition:border-color 0.18s,color 0.18s;white-space:nowrap;}
.btn-outline:hover:not(:disabled){border-color:#06B6D4;color:#0891b2;}
.btn-outline:disabled{opacity:0.4;cursor:not-allowed;}
.btn-outline--sm{padding:7px 14px;font-size:0.82rem;}
.btn-danger{padding:10px 16px;border-radius:10px;border:1.5px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.05);color:#dc2626;font-size:0.88rem;font-weight:600;cursor:pointer;transition:background 0.18s,border-color 0.18s;white-space:nowrap;}
.btn-danger:hover:not(:disabled){background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.5);}
.btn-danger:disabled{opacity:0.4;cursor:not-allowed;}
.btn-danger--sm{padding:6px 12px;font-size:0.8rem;}
.btn-row{display:flex;gap:10px;flex-wrap:wrap;}
.btn-copy{padding:5px 12px;border-radius:7px;border:1.5px solid #e2d9cc;background:#fff;font-size:0.78rem;font-weight:600;color:#0891b2;cursor:pointer;transition:border-color 0.18s;white-space:nowrap;}
.btn-copy:hover{border-color:#06B6D4;}

/* ── ALERTS ── */
.adm-alert{padding:10px 14px;border-radius:9px;font-size:0.84rem;line-height:1.55;}
.adm-alert--info{background:rgba(6,182,212,0.07);border:1px solid rgba(6,182,212,0.2);color:#0891b2;}
.adm-alert--success{background:rgba(34,197,94,0.07);border:1px solid rgba(34,197,94,0.25);color:#16a34a;}
.adm-alert--danger{background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);color:#dc2626;}
.adm-alert--warning{background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.2);color:#d97706;}

/* ── COPY BOX ── */
.copy-box{background:#fff;border:1.5px solid rgba(6,182,212,0.3);border-radius:10px;padding:12px 14px;}
.copy-label{font-size:0.73rem;font-weight:600;color:#0891b2;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;}
.copy-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.copy-value{font-family:'Space Grotesk',monospace;font-size:0.82rem;color:#0f172a;flex:1;word-break:break-all;}

/* ── USER CARD ── */
.user-card{background:#fff;border:1px solid #e2d9cc;border-radius:14px;padding:20px 22px;display:flex;flex-direction:column;gap:16px;}
.user-card-header{display:flex;align-items:center;gap:12px;}
.user-avatar{width:42px;height:42px;border-radius:50%;background:rgba(6,182,212,0.1);border:1.5px solid rgba(6,182,212,0.2);display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-size:1rem;font-weight:700;color:#0891b2;flex-shrink:0;}
.user-email{font-weight:600;font-size:0.95rem;color:#0f172a;}
.user-meta{font-size:0.78rem;color:#94a3b8;margin-top:2px;}
.user-table{width:100%;border-collapse:collapse;font-size:0.84rem;}
.user-table tr{border-bottom:1px solid #f3efe9;}
.user-table tr:last-child{border-bottom:none;}
.user-table td{padding:7px 0;}
.user-table-key{color:#64748b;width:140px;font-weight:500;}

/* ── DATA TABLE ── */
.table-wrap{overflow-x:auto;border-radius:12px;border:1px solid #e2d9cc;}
.data-table{width:100%;border-collapse:collapse;font-size:0.83rem;}
.data-table thead tr{background:#f3efe9;border-bottom:1px solid #e2d9cc;}
.data-table th{text-align:left;padding:9px 14px;font-size:0.72rem;font-weight:600;color:#475569;letter-spacing:0.04em;text-transform:uppercase;white-space:nowrap;}
.data-table tbody tr{border-bottom:1px solid #f3efe9;transition:background 0.12s;}
.data-table tbody tr:last-child{border-bottom:none;}
.data-table tbody tr:hover{background:rgba(6,182,212,0.03);}
.data-table td{padding:10px 14px;}

/* ── TEAM ── */
.inner-card{background:#fff;border:1px solid #e2d9cc;border-radius:14px;padding:18px 20px;display:flex;flex-direction:column;gap:14px;}
.inner-card-title{font-size:0.83rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.05em;}
.team-list{display:flex;flex-direction:column;gap:8px;}
.team-row{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #e2d9cc;border-radius:12px;padding:12px 16px;}
.team-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-size:0.85rem;font-weight:700;flex-shrink:0;}
.team-avatar--super{background:rgba(245,158,11,0.12);color:#d97706;border:1.5px solid rgba(245,158,11,0.25);}
.team-avatar--admin{background:rgba(6,182,212,0.1);color:#0891b2;border:1.5px solid rgba(6,182,212,0.2);}
.team-info{flex:1;min-width:0;}
.team-name{font-weight:600;font-size:0.9rem;color:#0f172a;}
.team-email{font-size:0.78rem;color:#94a3b8;margin-top:1px;}

/* ── BADGES ── */
.badge{display:inline-block;padding:3px 10px;border-radius:99px;font-size:0.72rem;font-weight:700;letter-spacing:0.03em;}
.badge--success{background:rgba(34,197,94,0.1);color:#16a34a;border:1px solid rgba(34,197,94,0.25);}
.badge--super{background:rgba(245,158,11,0.1);color:#d97706;border:1px solid rgba(245,158,11,0.25);}
.badge--role{background:rgba(6,182,212,0.08);color:#0891b2;border:1px solid rgba(6,182,212,0.2);}

/* ── PAGINATION ── */
.pagination{display:flex;gap:10px;align-items:center;margin-top:4px;}

/* ── SHARED UTILS ── */
.dim{color:#94a3b8;}
.mono{font-family:'Space Grotesk',monospace;font-size:0.82rem;color:#0f172a;}

/* ── EYEBROW ── */
.hero-eyebrow{display:inline-block;padding:3px 12px;border-radius:99px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);font-size:0.7rem;font-weight:600;color:#d97706;letter-spacing:0.08em;text-transform:uppercase;}
.hero-accent{color:#06B6D4;}

/* ── TOAST ── */
.toast{position:fixed;bottom:26px;right:22px;z-index:9999;display:flex;align-items:center;gap:10px;padding:13px 18px;border-radius:11px;max-width:340px;font-size:0.87rem;font-weight:500;cursor:pointer;box-shadow:0 8px 28px rgba(15,23,42,0.13);animation:slideUp 0.28s ease;}
.toast-success{background:#f0fdf4;border:1px solid rgba(34,197,94,0.3);color:#15803d;}
.toast-error{background:#fef2f2;border:1px solid rgba(239,68,68,0.28);color:#dc2626;}
@keyframes slideUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}

/* ── FOOTER ── */
.page-footer{text-align:center;margin-top:28px;font-size:0.75rem;color:#94a3b8;}
`;