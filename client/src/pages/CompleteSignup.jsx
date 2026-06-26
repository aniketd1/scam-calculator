import { useEffect, useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const POSITIONS  = ["A", "B", "C", "D", "E"];
const SENTENCES_CACHE_KEY = "s2s_sentences";

async function postJson(path, body, token) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });
    return res.json();
    }

    export default function CompleteSignup() {
    // ── invite token from URL path e.g. /complete-invite/abc123
    const [inviteToken] = useState(() => window.location.pathname.split("/").pop());

    const [sentences,  setSentences]  = useState([]);
    const [sentence,   setSentence]   = useState("");
    const [password,   setPassword]   = useState("");
    const [confirm,    setConfirm]    = useState("");
    const [offset,     setOffset]     = useState("7");
    const [positions,  setPositions]  = useState(["", ""]);
    const [error,      setError]      = useState("");
    const [loading,    setLoading]    = useState(false);
    const [step,       setStep]       = useState("form");
    // step: "form" | "creating" | "passkey" | "success" | "skipped" | "invalid"

    // Validate token exists
    useEffect(() => {
        if (!inviteToken || inviteToken.length < 10) setStep("invalid");
    }, [inviteToken]);

    // Load sentences
    useEffect(() => {
        fetch(`${API_BASE}/api/auth/sentences`)
        .then(r => r.json())
        .then(d => { if (d.success) setSentences(d.sentences); })
        .catch(() => {});
    }, []);

    const setPos = (slot, val) => {
        setPositions(prev => {
        const next = [...prev];
        next[slot] = val;
        if (slot === 0) next[1] = "";
        return next;
        });
    };

    const handleSubmit = async () => {
        setError("");

        if (!password)              { setError("Enter a password."); return; }
        if (password !== confirm)   { setError("Passwords do not match."); return; }
        if (password.length < 8)    { setError("Password must be at least 8 characters."); return; }
        if (!sentence)              { setError("Select a sentence."); return; }
        if (!positions[0] || !positions[1]) { setError("Select both secret positions."); return; }
        if (positions[0] === positions[1])  { setError("Positions must be different."); return; }
        const off = parseInt(offset, 10);
        if (isNaN(off) || off < 0 || off > 99) { setError("Offset must be 0–99."); return; }

        setStep("creating");
        setLoading(true);

        try {
        /* ── complete invite ── */
        const data = await postJson("/api/auth/complete-invite", {
            token:            inviteToken,
            password,
            selectedSentence: sentence,
            secretPositions:  positions,
            offset:           off,
        });

        if (!data.success) {
            setStep("form");
            setError(data.error || "Could not complete setup. Your link may have expired.");
            setLoading(false);
            return;
        }

        const { token: jwt } = data;
        localStorage.setItem("token", jwt);

        /* ── passkey registration ── */
        setStep("passkey");

        try {
            const optData = await postJson("/api/auth/passkey/register-options", {}, jwt);
            if (!optData.success) throw new Error(optData.error || "Passkey options failed.");

            const attestation = await startRegistration(optData.options);

            const verData = await postJson(
            "/api/auth/passkey/register-complete",
            { response: attestation },
            jwt
            );
            if (!verData.success) throw new Error(verData.error || "Passkey save failed.");

            setStep("success");
        } catch (pk) {
            console.warn("[complete-invite] passkey skipped:", pk.message);
            setStep("skipped");
        }

        } catch (err) {
        setStep("form");
        setError("Server error. Please try again.");
        } finally {
        setLoading(false);
        }
    };

    /* ── RENDER ── */
    return (
        <>
        <style>{CSS}</style>
        <div className="ci-page">

            {/* Invalid token */}
            {step === "invalid" && (
            <div className="ci-card">
                <div className="ci-icon" style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626" }}>✕</div>
                <h1 className="ci-title">Invalid invite link</h1>
                <p className="ci-hint">This link is missing or malformed. Please check your email for the correct invite link.</p>
            </div>
            )}

            {/* Setup form */}
            {step === "form" && (
            <div className="ci-card ci-card--wide">
                <p className="ci-eyebrow">Account setup</p>
                <h1 className="ci-title">Set up your Scam2Safe account</h1>
                <p className="ci-hint">
                Choose a password and a visual sentence password. Your sentence
                protects login — pick one you can picture easily.
                </p>

                <div className="ci-section">Password</div>
                <div className="ci-field-row">
                <div className="ci-field">
                    <label className="ci-label">Password</label>
                    <input className="ci-input" type="password" placeholder="Min 8 characters"
                    value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div className="ci-field">
                    <label className="ci-label">Confirm password</label>
                    <input className="ci-input" type="password" placeholder="Repeat password"
                    value={confirm} onChange={e => setConfirm(e.target.value)} />
                </div>
                </div>

                <div className="ci-section">Visual sentence password</div>
                <p className="ci-hint" style={{ marginTop: -8 }}>
                One noun from your sentence will appear in the login grid. Add your
                secret offset to the noun's value and enter the digits at your two
                secret positions (A–E).
                </p>

                <div className="ci-sentence-list">
                {sentences.map(s => (
                    <div
                    key={s}
                    role="button"
                    tabIndex={0}
                    className={`ci-sentence${sentence === s ? " ci-sentence--sel" : ""}`}
                    onClick={() => setSentence(s)}
                    onKeyDown={e => e.key === "Enter" && setSentence(s)}
                    >
                    {s}
                    </div>
                ))}
                </div>

                {sentence && (
                <div className="ci-controls">
                    <div className="ci-ctrl-row">
                    <label className="ci-label" style={{ width: 70 }}>Offset</label>
                    <input className="ci-offset" type="text" inputMode="numeric" maxLength={2}
                        value={offset}
                        onChange={e => setOffset(e.target.value.replace(/\D/, "").slice(0, 2))} />
                    <span className="ci-ctrl-hint">0–99</span>
                    </div>
                    <div className="ci-ctrl-row">
                    <label className="ci-label" style={{ width: 70 }}>Positions</label>
                    <select className="ci-select" value={positions[0]} onChange={e => setPos(0, e.target.value)}>
                        <option value="">Pick A–E</option>
                        {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <span style={{ color: "#06B6D4", fontWeight: 800 }}>+</span>
                    <select className="ci-select" value={positions[1]} disabled={!positions[0]}
                        onChange={e => setPos(1, e.target.value)}>
                        <option value="">Pick A–E</option>
                        {POSITIONS.filter(p => p !== positions[0]).map(p => (
                        <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                    </div>
                </div>
                )}

                {error && <div className="ci-error">{error}</div>}

                <button className="ci-btn" disabled={loading || !sentence} onClick={handleSubmit}>
                {loading ? "Setting up…" : "Complete setup →"}
                </button>
            </div>
            )}

            {/* Creating account */}
            {step === "creating" && (
            <div className="ci-card">
                <div className="ci-spinner" />
                <h2 className="ci-title">Creating your account…</h2>
                <p className="ci-hint">Saving your visual password settings.</p>
            </div>
            )}

            {/* Passkey prompt */}
            {step === "passkey" && (
            <div className="ci-card">
                <div className="ci-icon">🔑</div>
                <p className="ci-eyebrow">Almost done</p>
                <h2 className="ci-title">Register your passkey</h2>
                <p className="ci-hint">
                Your browser will ask you to save a passkey (Face ID, Touch ID,
                Windows Hello, etc.). This is used for account recovery — you can
                skip it and add one later from your profile.
                </p>
            </div>
            )}

            {/* Passkey registered — success */}
            {step === "success" && (
            <div className="ci-card">
                <div className="ci-check">✓</div>
                <p className="ci-eyebrow">All done</p>
                <h2 className="ci-title">Account ready</h2>
                <p className="ci-hint">
                Your account and passkey are set up. Sign in with your visual
                password to continue.
                </p>
                <a className="ci-btn" href="/login">Go to sign in →</a>
            </div>
        )}

        {/* Passkey skipped */}
        {step === "skipped" && (
            <div className="ci-card">
                <div className="ci-icon" style={{ background: "rgba(245,158,11,0.1)", color: "#d97706" }}>!</div>
                <p className="ci-eyebrow">Account created</p>
                <h2 className="ci-title">No passkey registered</h2>
                <p className="ci-hint">
                Your account is ready, but no passkey was saved. You can add one
                later from your profile settings. Sign in with your visual
                password to continue.
                </p>
                <a className="ci-btn" href="/login">Go to sign in →</a>
            </div>
            )}

        </div>
        </>
    );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
button,input,select{font-family:inherit;}

.ci-page{min-height:100vh;background:#f7efe6;display:flex;align-items:flex-start;justify-content:center;padding:48px 20px 72px;font-family:'Inter',sans-serif;}

.ci-card{background:#fbf7f0;border:1px solid #e2d9cc;border-radius:20px;padding:40px 36px;width:100%;max-width:480px;display:flex;flex-direction:column;align-items:center;gap:16px;box-shadow:0 4px 28px rgba(15,23,42,0.06);text-align:center;}
.ci-card--wide{max-width:760px;align-items:flex-start;text-align:left;}

.ci-eyebrow{display:inline-block;padding:3px 12px;border-radius:99px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);font-size:0.7rem;font-weight:600;color:#d97706;letter-spacing:0.08em;text-transform:uppercase;}
.ci-title{font-family:'Space Grotesk',sans-serif;font-size:1.5rem;font-weight:800;color:#0f172a;letter-spacing:-0.03em;}
.ci-hint{font-size:0.84rem;color:#64748b;line-height:1.65;max-width:440px;}
.ci-section{font-size:0.72rem;font-weight:700;color:#475569;letter-spacing:0.06em;text-transform:uppercase;padding-bottom:2px;border-bottom:1px solid #e2d9cc;width:100%;margin-top:4px;}

.ci-field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;width:100%;}
@media(max-width:540px){.ci-field-row{grid-template-columns:1fr;}}
.ci-field{display:flex;flex-direction:column;gap:5px;}
.ci-label{font-size:0.72rem;font-weight:600;color:#475569;letter-spacing:0.05em;text-transform:uppercase;}
.ci-input{width:100%;padding:11px 13px;border-radius:10px;border:1.5px solid #e2d9cc;background:#fff;font-size:0.91rem;color:#0f172a;outline:none;transition:border-color 0.18s,box-shadow 0.18s;}
.ci-input:focus{border-color:#06B6D4;box-shadow:0 0 0 3px rgba(6,182,212,0.1);}
.ci-input::placeholder{color:#94a3b8;}

.ci-sentence-list{width:100%;display:flex;flex-direction:column;gap:7px;max-height:280px;overflow-y:auto;padding-right:4px;}
.ci-sentence-list::-webkit-scrollbar{width:4px;}
.ci-sentence-list::-webkit-scrollbar-thumb{background:#d1c4b0;border-radius:2px;}
.ci-sentence{width:100%;padding:12px 14px;border-radius:11px;background:#fff;border:1.5px solid #e2d9cc;cursor:pointer;font-size:0.86rem;color:#334155;line-height:1.55;transition:border-color 0.16s,transform 0.14s;}
.ci-sentence:hover{border-color:rgba(6,182,212,0.4);transform:translateY(-1px);}
.ci-sentence--sel{border-color:#06B6D4;background:rgba(6,182,212,0.04);box-shadow:0 0 0 3px rgba(6,182,212,0.1);}

.ci-controls{width:100%;display:flex;flex-direction:column;gap:10px;background:#fff;border:1px solid #e2d9cc;border-radius:12px;padding:14px 16px;}
.ci-ctrl-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.ci-offset{width:58px;padding:7px 10px;border-radius:8px;border:1.5px solid #e2d9cc;background:#fff;font-family:'Space Grotesk',sans-serif;font-size:1.1rem;font-weight:800;color:#0f172a;text-align:center;outline:none;}
.ci-offset:focus{border-color:#06B6D4;}
.ci-select{padding:7px 10px;border-radius:8px;border:1.5px solid #e2d9cc;background:#fff;font-family:'Space Grotesk',sans-serif;font-size:0.9rem;font-weight:700;color:#0f172a;cursor:pointer;outline:none;}
.ci-select:focus{border-color:#06B6D4;}
.ci-select:disabled{background:#f3efe9;color:#94a3b8;cursor:not-allowed;}
.ci-ctrl-hint{font-size:0.76rem;color:#94a3b8;}

.ci-error{width:100%;padding:10px 14px;border-radius:9px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);color:#dc2626;font-size:0.84rem;}

.ci-btn{width:100%;padding:13px;border-radius:10px;border:none;background:linear-gradient(135deg,#06B6D4,#0891b2);color:#fff;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:0.94rem;cursor:pointer;box-shadow:0 0 18px rgba(6,182,212,0.22);transition:transform 0.18s,box-shadow 0.18s,opacity 0.18s;text-decoration:none;text-align:center;display:inline-block;}
.ci-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 0 26px rgba(6,182,212,0.36);}
.ci-btn:disabled{opacity:0.36;cursor:not-allowed;box-shadow:none;transform:none;}

.ci-spinner{width:44px;height:44px;border-radius:50%;border:3px solid #e2d9cc;border-top-color:#06B6D4;animation:ciSpin 0.8s linear infinite;}
@keyframes ciSpin{to{transform:rotate(360deg)}}

.ci-check{width:60px;height:60px;border-radius:50%;background:rgba(34,197,94,0.1);border:2px solid rgba(34,197,94,0.3);display:flex;align-items:center;justify-content:center;font-size:1.6rem;color:#16a34a;font-weight:700;}
.ci-icon{width:60px;height:60px;border-radius:50%;background:rgba(6,182,212,0.1);border:2px solid rgba(6,182,212,0.2);display:flex;align-items:center;justify-content:center;font-size:1.8rem;}
`;