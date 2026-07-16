// pages/NumberAuth.jsx
// Number-Box Visual Password — scam2safe.com/numbers
//
// 9 named boxes, each with 4 unique numbers + 1 circled number below it.
// Exactly one box (secretly, server-side) contains the user's real secret
// number among its 4. User recognizes their number, reads that box's
// circled number, adds secret + mental margin + circled, enters result
// at their two private positions.
//
// Security:
//   - secretNumber, secretMargin, and which box is "correct" NEVER sent to client
//   - Server pre-computes expected digits from the correct box before responding
//   - No "pick a box" round trip — client submits digits straight to /verify

import { useState, useRef, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const DIGITS   = ["0","1","2","3","4","5","6","7","8","9"];

function shuffle(a) {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
function getRandomLetterPair() {
  const s = shuffle([...ALPHABET]);
  return [s[0], s[1]];
}

async function postJson(path, body) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    try { return JSON.parse(text); }
    catch { throw new Error("Server returned invalid JSON"); }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/* ── Box component ───────────────────────────────────────── */
function NumberBoxCard({ name, numbers, circled }) {
  return (
    <div className="box-card">
      <div className="box-name">{name}</div>
      <div className="box-numbers">
        {numbers.map((n, i) => <span key={i} className="box-num">{n}</span>)}
      </div>
      <div className="box-circle-wrap">
        <span className="box-circled">{circled}</span>
      </div>
    </div>
  );
}

/* ── Register Dropdown Bar ───────────────────────────────── */
function RegisterDropdownBar({ letters, inputs, onChange }) {
  const digitCount = {};
  for (const v of inputs) if (v !== "") digitCount[v] = (digitCount[v] || 0) + 1;

  return (
    <div className="reg-wrap">
      <div className="reg-header">
        {letters.map(l => <div key={l} className="reg-head-cell">{l}</div>)}
      </div>
      <div className="reg-dropdowns">
        {letters.map((l, i) => {
          const current    = inputs[i];
          const isDisabled = i > 0 && inputs[i - 1] === "";
          return (
            <select key={l}
              className={`reg-select${isDisabled ? " reg-select--disabled" : ""}`}
              value={current} disabled={isDisabled}
              onChange={e => onChange(i, e.target.value)}
            >
              <option value="">·</option>
              {DIGITS.map(d => {
                const usedElsewhere = (digitCount[d] || 0) - (current === d ? 1 : 0);
                if (usedElsewhere >= 2 && current !== d) return null;
                return <option key={d} value={d}>{d}</option>;
              })}
            </select>
          );
        })}
      </div>
    </div>
  );
}

/* ── Toast ────────────────────────────────────────────────── */
function Toast({ toasts, onClose }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => onClose(t.id)}>
          <span>{t.type === "success" ? "✓" : "✕"}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */
export default function NumberAuth() {
  const [mode,    setMode]    = useState("signup");
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [toasts,  setToasts]  = useState([]);
  const toastCtr = useRef(0);

  /* ── signup state ── */
  const [secretNumber, setSecretNumber] = useState("");
  const [secretMargin, setSecretMargin] = useState("");
  const [letterPair,   setLetterPair]   = useState(getRandomLetterPair);
  const [preview,      setPreview]      = useState(null);

  /* ── login state ── */
  const [loginStep,       setLoginStep]       = useState("creds"); // "creds" | "boxes" | "done"
  const [sessionId,       setSessionId]       = useState("");
  const [boxes,           setBoxes]           = useState([]);
  const [registerLetters, setRegisterLetters] = useState([]);
  const [regInputs,       setRegInputs]       = useState(Array(5).fill(""));

  const allFilled = regInputs.every(v => v !== "");

  const showToast = (type, message, dur = 4500) => {
    const id = ++toastCtr.current;
    setToasts(p => [...p, { id, type, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), dur);
  };
  const closeToast = id => setToasts(p => p.filter(t => t.id !== id));

  const resetAll = useCallback((m) => {
    setMode(m); setEmail(""); setError("");
    setSecretNumber(""); setSecretMargin(""); setLetterPair(getRandomLetterPair()); setPreview(null);
    setLoginStep("creds"); setSessionId(""); setBoxes([]);
    setRegisterLetters([]); setRegInputs(Array(5).fill(""));
  }, []);

  /* ── SIGNUP ── */
  const handleSignup = () => {
    setError("");
    if (!email.trim()) { setError("Enter your email."); return; }
    const sn = parseInt(secretNumber, 10);
    if (isNaN(sn) || sn < 1 || sn > 9999) { setError("Secret number must be between 1 and 9999."); return; }
    const sm = parseInt(secretMargin, 10);
    if (isNaN(sm) || sm < 0 || sm > 99) { setError("Mental margin must be between 0 and 99."); return; }
    if (!letterPair[0] || !letterPair[1]) { setError("Choose two positions."); return; }
    if (letterPair[0] === letterPair[1])  { setError("Positions must be different."); return; }
    setPreview({ secretNumber: sn, secretMargin: sm, letterPair: [...letterPair] });
  };

  const confirmSignup = async () => {
    setPreview(null); setLoading(true); setError("");
    try {
      const data = await postJson("/api/numbers/signup", {
        email: email.trim().toLowerCase(),
        secretNumber: parseInt(secretNumber, 10),
        secretMargin: parseInt(secretMargin, 10),
        secretPositions: letterPair,
      });
      if (!data.success) { setError(data.error || "Could not create account."); return; }
      showToast("success", "Account created! Sign in now.");
      resetAll("login");
    } catch { setError("Server error. Try again."); }
    finally { setLoading(false); }
  };

  /* ── LOGIN STEP 1: email → get box grid ── */
  const handleLoginEmail = async () => {
    setError("");
    if (!email.trim()) { setError("Enter your email."); return; }
    setLoading(true);
    try {
      const data = await postJson("/api/numbers/login", { email: email.trim().toLowerCase() });
      if (!data.success) { setError(data.error || "No account found."); return; }
      setSessionId(data.sessionId);
      setBoxes(data.boxes || []);
      setRegisterLetters(data.registerLetters || []);
      setRegInputs(Array(5).fill(""));
      setLoginStep("boxes");
    } catch { setError("Server error. Try again."); }
    finally { setLoading(false); }
  };

  /* ── LOGIN STEP 2: verify ── */
  const handleVerify = async () => {
    setError("");
    if (!allFilled) { setError("Fill all 5 positions."); return; }
    setLoading(true);
    try {
      const data = await postJson("/api/numbers/verify", {
        sessionId,
        registerInputs: regInputs.map(v => parseInt(v, 10)),
      });
      if (!data.success) {
        setError(data.error || "Verification failed.");
        if (!data.error?.includes("attempt")) {
          setLoginStep("creds"); setSessionId(""); setBoxes([]);
        }
        return;
      }
      if (data.token) localStorage.setItem("token", data.token);
      showToast("success", "Identity verified! Welcome back.");
      setLoginStep("done");
    } catch { setError("Server error. Try again."); }
    finally { setLoading(false); }
  };

  /* ═══════════════════════ RENDER ══════════════════════════ */
  return (
    <>
      <style>{CSS}</style>
      <Toast toasts={toasts} onClose={closeToast} />

      {preview && (
        <div className="overlay-bg" onClick={e => { if (e.target === e.currentTarget) setPreview(null); }}>
          <div className="overlay-card">
            <button className="overlay-close" onClick={() => setPreview(null)}>✕</button>
            <p className="overlay-eyebrow">Confirm your setup</p>
            <h2 className="overlay-title">Review before creating account</h2>

            <div className="preview-details">
              <div className="preview-row">
                <span className="preview-key">Secret number</span>
                <span className="preview-val num-big">{preview.secretNumber}</span>
              </div>
              <div className="preview-row">
                <span className="preview-key">Mental margin</span>
                <span className="preview-val num-big">{preview.secretMargin}</span>
              </div>
              <div className="preview-row">
                <span className="preview-key">Positions</span>
                <span className="preview-val">
                  <strong className="pos-letter">{preview.letterPair[0]}</strong>
                  <span className="pos-plus">+</span>
                  <strong className="pos-letter">{preview.letterPair[1]}</strong>
                </span>
              </div>
            </div>

            <div className="how-box">
              <p className="how-title">How login works</p>
              <ol className="how-list">
                <li>You'll see 9 named boxes, each holding 4 numbers and one circled number underneath.</li>
                <li>Find the box containing <strong>your secret number</strong> among its 4 numbers.</li>
                <li>Add your <strong>secret number</strong> + <strong>mental margin</strong> + that box's <strong>circled number</strong>.</li>
                <li>Enter the 2-digit result at your two secret positions.</li>
                <li>Example: secret = {preview.secretNumber}, margin = {preview.secretMargin}, that box's circled = 6 → result = {preview.secretNumber + preview.secretMargin + 6} → enter at {preview.letterPair[0]} and {preview.letterPair[1]}.</li>
              </ol>
            </div>

            <p className="overlay-hint">
              Your secret number, margin, and positions are never shown again. Memorise them now.
            </p>
            <button className="overlay-btn" disabled={loading} onClick={confirmSignup}>
              {loading ? "Creating…" : "Confirm and create account →"}
            </button>
          </div>
        </div>
      )}

      <div className="auth-page">
        <header className="auth-hero">
          <p className="hero-eyebrow">Number-Box Visual Password</p>
          <h1 className="hero-title">Sign in with <span className="hero-accent">Number Boxes</span></h1>
          <p className="hero-sub">
            Nine named boxes, each hiding four numbers. Find the box holding your secret number,
            add it to your mental margin and that box's circled number, then enter the result at
            your two private positions.
          </p>
        </header>

        <div className="auth-shell">
          <div className="auth-card">

            {loginStep === "done" && (
              <div className="success-box">
                <div className="success-check">✓</div>
                <h2 className="success-title">Identity Verified</h2>
                <p className="success-msg">Your number-box password was accepted. Welcome back!</p>
                <button className="btn-outline" onClick={() => resetAll("login")}>Sign in again</button>
              </div>
            )}

            {loginStep !== "done" && (
              <>
                {(mode === "signup" || loginStep === "creds") && (
                  <div className="mode-tabs">
                    <button className={`mode-tab${mode === "signup" ? " mode-tab--active" : ""}`} onClick={() => resetAll("signup")}>Create account</button>
                    <button className={`mode-tab${mode === "login"  ? " mode-tab--active" : ""}`} onClick={() => resetAll("login")}>Sign in</button>
                  </div>
                )}

                {/* ════ SIGNUP ════ */}
                {mode === "signup" && (
                  <div className="form-stack">
                    <div className="info-box">
                      Choose a <strong>secret number</strong> (1–9999), a <strong>mental margin</strong> (0–99),
                      and <strong>two letter positions</strong> (A–Z). At login: find your number's box, add
                      secret + margin + that box's circled number, enter the result at your positions.
                    </div>

                    <div className="field-group">
                      <label className="field-label">Email</label>
                      <input className="field-input" type="email" placeholder="you@example.com"
                        value={email} onChange={e => setEmail(e.target.value)} />
                    </div>

                    <div className="field-group">
                      <label className="field-label">Your secret number (1–9999)</label>
                      <p className="section-hint">
                        Only you know this. It will appear hidden among 4 numbers in one box at login.
                      </p>
                      <input className="field-input field-input--num" type="text" inputMode="numeric"
                        placeholder="e.g. 15"
                        value={secretNumber}
                        onChange={e => setSecretNumber(e.target.value.replace(/\D/g, "").slice(0, 4))} />
                    </div>

                    <div className="field-group">
                      <label className="field-label">Your mental margin (0–99)</label>
                      <p className="section-hint">
                        A number you'll always add in your head at login — like your age or a favourite number.
                      </p>
                      <input className="field-input field-input--num" type="text" inputMode="numeric"
                        placeholder="e.g. 4"
                        value={secretMargin}
                        onChange={e => setSecretMargin(e.target.value.replace(/\D/g, "").slice(0, 2))} />
                    </div>

                    <div className="field-group">
                      <label className="field-label">Two secret positions (A–Z)</label>
                      <p className="section-hint">The two letters where you'll enter the digits of your result.</p>
                      <div className="letter-row">
                        <select className="ctrl-select" value={letterPair[0]}
                          onChange={e => setLetterPair(p => [e.target.value, p[1] === e.target.value ? "" : p[1]])}>
                          <option value="">Choose</option>
                          {ALPHABET.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <span className="ctrl-plus">+</span>
                        <select className="ctrl-select" value={letterPair[1]} disabled={!letterPair[0]}
                          onChange={e => setLetterPair(p => [p[0], e.target.value])}>
                          <option value="">Choose</option>
                          {ALPHABET.filter(l => l !== letterPair[0]).map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>

                    {error && <div className="alert-error">{error}</div>}
                    <button className="btn-primary" disabled={loading} onClick={handleSignup}>
                      {loading ? "Creating…" : "Review and create account →"}
                    </button>
                  </div>
                )}

                {/* ════ LOGIN ════ */}
                {mode === "login" && (
                  <>
                    {loginStep === "creds" && (
                      <div className="form-stack">
                        <div className="step-badge">Step 1 of 2 — Enter your email</div>
                        <div className="field-group">
                          <label className="field-label">Email address</label>
                          <input className="field-input" type="email" placeholder="you@example.com"
                            value={email} onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleLoginEmail()} autoFocus />
                        </div>
                        {error && <div className="alert-error">{error}</div>}
                        <button className="btn-primary" disabled={loading || !email.trim()} onClick={handleLoginEmail}>
                          {loading ? "Please wait…" : "Continue →"}
                        </button>
                      </div>
                    )}

                    {loginStep === "boxes" && (
                      <div className="form-stack">
                        <div className="step-badge">Step 2 of 2 — Find your box, enter your digits</div>
                        <div className="info-box">
                          <strong>Find your secret number</strong> among the 9 boxes below. Add it to your
                          mental margin and that box's circled number to get your 2-digit result. Enter it at
                          your two secret positions (either order is accepted).
                        </div>

                        <div className="box-grid">
                          {boxes.map((b, i) => (
                            <NumberBoxCard key={i} name={b.name} numbers={b.numbers} circled={b.circled} />
                          ))}
                        </div>

                        {registerLetters.length === 5 && (
                          <RegisterDropdownBar
                            letters={registerLetters}
                            inputs={regInputs}
                            onChange={(i, v) => setRegInputs(p => { const n = [...p]; n[i] = v; return n; })}
                          />
                        )}

                        {error && <div className="alert-error">{error}</div>}
                        <button className="btn-primary" disabled={loading || !allFilled} onClick={handleVerify}>
                          {loading ? "Verifying…" : "Verify →"}
                        </button>
                        <button className="btn-outline" onClick={() => resetAll("login")}>← Start over</button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <p className="page-footer">ScamRisk Number-Box Password — phishing-resistant. Your secret never leaves this device.</p>
      </div>
    </>
  );
}

/* ── STYLES ─────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
button,input,select{font-family:inherit;}

.auth-page{min-height:100vh;background:#f7efe6;color:#0f172a;font-family:'Inter',sans-serif;padding:48px 20px 72px;position:relative;overflow:hidden;}
.auth-page::before{content:'';position:fixed;top:-140px;right:-140px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(6,182,212,0.06) 0%,transparent 70%);pointer-events:none;z-index:0;}

.auth-hero{text-align:center;max-width:680px;margin:0 auto 36px;position:relative;z-index:1;}
.hero-eyebrow{display:inline-block;padding:4px 14px;border-radius:99px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);font-size:0.72rem;font-weight:600;color:#d97706;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;}
.hero-title{font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:clamp(1.6rem,3.2vw,2.4rem);letter-spacing:-0.04em;line-height:1.12;color:#0f172a;margin-bottom:10px;}
.hero-accent{color:#06B6D4;}
.hero-sub{font-size:0.88rem;color:#64748b;line-height:1.7;}

.auth-shell{max-width:760px;margin:0 auto;position:relative;z-index:1;}
.auth-card{background:#fbf7f0;border:1px solid #e2d9cc;border-radius:20px;padding:36px 40px;display:flex;flex-direction:column;gap:20px;box-shadow:0 4px 28px rgba(15,23,42,0.06);}
@media(max-width:600px){.auth-card{padding:24px 18px;}}

.mode-tabs{display:flex;gap:8px;}
.mode-tab{flex:1;padding:11px;border-radius:99px;background:#fff;border:1.5px solid #e2d9cc;color:#475569;font-size:0.9rem;font-weight:500;cursor:pointer;transition:all .18s;}
.mode-tab:hover{border-color:rgba(6,182,212,.4);color:#0891b2;}
.mode-tab--active{background:linear-gradient(135deg,#06B6D4,#0891b2);color:#fff;border-color:transparent;font-weight:700;}

.step-badge{padding:9px 14px;border-radius:9px;background:rgba(6,182,212,.07);border:1px solid rgba(6,182,212,.15);font-size:.83rem;color:#0891b2;font-weight:600;}
.info-box{padding:13px 16px;border-radius:11px;background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.2);font-size:.84rem;color:#92400e;line-height:1.65;}
.info-box strong{font-weight:700;color:#78350f;}

.form-stack{display:flex;flex-direction:column;gap:16px;}
.field-group{display:flex;flex-direction:column;gap:5px;}
.field-label{font-size:.73rem;font-weight:600;color:#475569;letter-spacing:.05em;text-transform:uppercase;}
.section-hint{font-size:.79rem;color:#94a3b8;line-height:1.6;}
.field-input{width:100%;padding:11px 13px;border-radius:10px;border:1.5px solid #e2d9cc;background:#fff;font-size:.91rem;color:#0f172a;outline:none;transition:border-color .18s,box-shadow .18s;}
.field-input:focus{border-color:#06B6D4;box-shadow:0 0 0 3px rgba(6,182,212,.1);}
.field-input::placeholder{color:#94a3b8;}
.field-input--num{font-family:'Space Grotesk',sans-serif;font-size:1.6rem;font-weight:800;letter-spacing:.06em;text-align:center;max-width:180px;}

.letter-row{display:flex;align-items:center;gap:12px;margin-top:4px;}
.ctrl-select{padding:10px 16px;border-radius:10px;border:2px solid #0f172a;background:#fff;font-family:'Space Grotesk',sans-serif;font-size:1.3rem;font-weight:800;color:#000;cursor:pointer;outline:none;min-width:62px;text-align:center;}
.ctrl-select:focus{border-color:#06B6D4;}
.ctrl-select:disabled{background:#f3efe9;color:#94a3b8;cursor:not-allowed;}
.ctrl-plus{font-family:'Space Grotesk',sans-serif;font-weight:800;color:#06B6D4;font-size:1.3rem;}

/* ── BOX GRID ── */
.box-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:4px 0;}
@media(max-width:560px){.box-grid{grid-template-columns:repeat(2,1fr);}}

.box-card{
  background:#fff;border:2px solid #0f172a;border-radius:14px;
  padding:12px 10px 14px;display:flex;flex-direction:column;align-items:center;gap:8px;
}
.box-name{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:.86rem;color:#0891b2;text-transform:uppercase;letter-spacing:.04em;}
.box-numbers{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;width:100%;}
.box-num{
  font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:1.05rem;color:#0f172a;
  background:#f3efe9;border-radius:8px;padding:6px 0;text-align:center;
}
.box-circle-wrap{display:flex;align-items:center;justify-content:center;margin-top:2px;}
.box-circled{
  font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:1.15rem;color:#0f172a;
  width:44px;height:44px;border-radius:50%;border:2.5px solid #0f172a;
  display:flex;align-items:center;justify-content:center;
}

/* ── REGISTER BAR ── */
.reg-wrap{width:100%;border:1px solid #e2d9cc;border-radius:12px;overflow:hidden;overflow-x:auto;}
.reg-header,.reg-dropdowns{display:grid;grid-template-columns:repeat(5,1fr);min-width:260px;}
.reg-head-cell{min-height:48px;padding:10px 4px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:800;color:#000;background:#fff;border:2px solid #0f172a;border-bottom:none;letter-spacing:.04em;}
.reg-select{padding:14px 0;font-size:1.3rem;font-weight:800;color:#000;background:#fff;border:2px solid #0f172a;min-height:54px;text-align:center;text-align-last:center;appearance:none;-webkit-appearance:none;outline:none;cursor:pointer;transition:background .15s;}
.reg-select:focus{background:rgba(6,182,212,.07);}
.reg-select--disabled{background:#f1f1f1;color:#9ca3af;cursor:not-allowed;}

/* ── OVERLAY ── */
.overlay-bg{position:fixed;inset:0;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;z-index:9000;padding:20px;}
.overlay-card{position:relative;background:#fbf7f0;border:1px solid #e2d9cc;border-radius:20px;padding:36px 32px;max-width:460px;width:100%;display:flex;flex-direction:column;gap:16px;box-shadow:0 20px 60px rgba(15,23,42,.2);animation:oIn .22s ease;max-height:90vh;overflow-y:auto;}
@keyframes oIn{from{transform:scale(.94);opacity:0}to{transform:scale(1);opacity:1}}
.overlay-close{position:absolute;top:14px;right:16px;background:none;border:none;font-size:1.1rem;color:#94a3b8;cursor:pointer;}
.overlay-close:hover{color:#0f172a;}
.overlay-eyebrow{font-size:.72rem;font-weight:600;color:#0891b2;letter-spacing:.08em;text-transform:uppercase;}
.overlay-title{font-family:'Space Grotesk',sans-serif;font-size:1.2rem;font-weight:800;color:#0f172a;}
.overlay-hint{font-size:.8rem;color:#64748b;line-height:1.7;}
.overlay-btn{width:100%;padding:12px;border-radius:10px;border:none;background:linear-gradient(135deg,#06B6D4,#0891b2);color:#fff;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:.94rem;cursor:pointer;}
.overlay-btn:hover{opacity:.9;}
.overlay-btn:disabled{opacity:.4;cursor:not-allowed;}

.preview-details{background:#fff;border:1px solid #e2d9cc;border-radius:12px;padding:14px 18px;display:flex;flex-direction:column;gap:12px;}
.preview-row{display:flex;align-items:center;gap:14px;font-size:.88rem;}
.preview-key{font-weight:700;color:#475569;min-width:110px;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em;}
.preview-val{color:#0f172a;display:flex;align-items:center;gap:8px;}
.num-big{font-family:'Space Grotesk',sans-serif;font-size:2rem;font-weight:800;color:#0891b2;}
.pos-letter{font-family:'Space Grotesk',sans-serif;font-size:1.4rem;font-weight:800;color:#0891b2;}
.pos-plus{font-size:1.2rem;color:#94a3b8;}

.how-box{background:#f0fdf4;border:1px solid rgba(16,185,129,.25);border-radius:12px;padding:14px 18px;}
.how-title{font-size:.78rem;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;}
.how-list{padding-left:16px;display:flex;flex-direction:column;gap:6px;}
.how-list li{font-size:.82rem;color:#334155;line-height:1.55;}
.how-list li strong{color:#0f172a;}

.btn-primary{width:100%;padding:13px;border-radius:10px;border:none;background:linear-gradient(135deg,#06B6D4,#0891b2);color:#fff;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:.94rem;cursor:pointer;box-shadow:0 0 18px rgba(6,182,212,.22);transition:transform .18s,box-shadow .18s,opacity .18s;}
.btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 0 26px rgba(6,182,212,.36);}
.btn-primary:disabled{opacity:.36;cursor:not-allowed;box-shadow:none;transform:none;}
.btn-outline{width:100%;padding:12px;border-radius:10px;border:1.5px solid #e2d9cc;background:transparent;color:#475569;font-size:.9rem;font-weight:500;cursor:pointer;transition:border-color .18s,color .18s;}
.btn-outline:hover{border-color:#06B6D4;color:#0891b2;}

.alert-error{padding:11px 14px;border-radius:9px;background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.2);color:#dc2626;font-size:.84rem;line-height:1.5;}

.success-box{display:flex;flex-direction:column;align-items:center;gap:14px;padding:32px 20px;text-align:center;}
.success-check{width:64px;height:64px;border-radius:50%;background:rgba(34,197,94,.12);border:2px solid rgba(34,197,94,.3);display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:700;color:#16a34a;}
.success-title{font-family:'Space Grotesk',sans-serif;font-size:1.4rem;font-weight:700;color:#0f172a;}
.success-msg{font-size:.88rem;color:#64748b;line-height:1.65;max-width:380px;}

.toast-stack{position:fixed;bottom:26px;right:22px;z-index:9999;display:flex;flex-direction:column;gap:8px;align-items:flex-end;}
.toast{display:flex;align-items:center;gap:10px;padding:13px 18px;border-radius:11px;max-width:340px;font-size:.87rem;font-weight:500;cursor:pointer;box-shadow:0 8px 28px rgba(15,23,42,.13);animation:slideUp .28s ease;}
.toast-success{background:#f0fdf4;border:1px solid rgba(34,197,94,.3);color:#15803d;}
.toast-error{background:#fef2f2;border:1px solid rgba(239,68,68,.28);color:#dc2626;}
@keyframes slideUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
.page-footer{text-align:center;margin-top:28px;font-size:.75rem;color:#94a3b8;position:relative;z-index:1;}
`;