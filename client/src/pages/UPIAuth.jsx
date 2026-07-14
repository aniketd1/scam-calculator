import { useState, useRef, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ── Helpers ─────────────────────────────────────────────────── */
const DIGITS   = ["0","1","2","3","4","5","6","7","8","9"];

function shuffle(a) {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

function countDigits(amountStr) {
  // strips commas, spaces, ₹ symbol — counts only digits
  return amountStr.replace(/[^0-9]/g, "").length;
}

async function postJson(path, body) {
  try {
    const res  = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    try { return JSON.parse(text); }
    catch { throw new Error("Server returned invalid response"); }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/* ── Word Card — NO value shown, mask only ──────────────────── */
function WordCard({ mask, value, selected, onClick }) {
  return (
    <div
      className={`upi-wc${selected ? " upi-wc--sel" : ""}`}
      role="button" tabIndex={0}
      onClick={onClick}
      onKeyDown={e => e.key === "Enter" && onClick?.()}
    >
      <div className="upi-wc-mask">{mask || "—"}</div>
      <div className="upi-wc-value">{Number.isFinite(value) ? value : "?"}</div>
    </div>
  );
}

/* ── Register bar — 5 letters, sequential dropdowns ─────────── */
function RegisterBar({ letters, inputs, onChange }) {
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
                const elsewhere = (digitCount[d] || 0) - (current === d ? 1 : 0);
                if (elsewhere >= 2 && current !== d) return null;
                return <option key={d} value={d}>{d}</option>;
              })}
            </select>
          );
        })}
      </div>
    </div>
  );
}

/* ── Toast ───────────────────────────────────────────────────── */
function Toast({ toasts, onClose }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => onClose(t.id)}>
          <span>{t.type === "success" ? "✓" : t.type === "warning" ? "!" : "✕"}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function UpiAuth() {
  /* ── global ── */
  const [mode,    setMode]    = useState("setup");   // "setup" | "verify"
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [toasts,  setToasts]  = useState([]);
  const toastCtr = useRef(0);

  /* ── setup (signup-style) ── */
  const [senderEmail,     setSenderEmail]     = useState("");
  const [words,           setWords]           = useState([]);
  const [selectedWord,    setSelectedWord]    = useState(null);
  const [lang,            setLang]            = useState("en");
  const [preview,         setPreview]         = useState(null);

  /* ── verify (login-style) ── */
  const [verifyEmail,     setVerifyEmail]     = useState("");
  const [transactionId,   setTransactionId]   = useState("");
  const [amountStr,       setAmountStr]       = useState(""); // "100000"
  const [verifyStep,      setVerifyStep]      = useState("form"); // "form" | "grid" | "done"
  const [sessionId,       setSessionId]       = useState("");
  const [challengeGrid,   setChallengeGrid]   = useState([]);
  const [registerLetters, setRegisterLetters] = useState([]);
  const [regInputs,       setRegInputs]       = useState(Array(5).fill(""));

  const allFilled = regInputs.every(v => v !== "");

  /* ── derived: recipient initials (max 2 from name) ── */
  /* ── toast helpers ── */
  const showToast = (type, message, dur = 4500) => {
    const id = ++toastCtr.current;
    setToasts(p => [...p, { id, type, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), dur);
  };
  const closeToast = id => setToasts(p => p.filter(t => t.id !== id));

  /* ── load words ── */
  useEffect(() => {
    fetch(`${API_BASE}/api/auth/words?lang=${lang}`)
      .then(r => r.json())
      .then(d => { if (d.success && Array.isArray(d.words)) setWords(shuffle(d.words)); });
  }, [lang]);

  const resetSetup = useCallback(() => {
    setSelectedWord(null);
    setPreview(null); setError("");
  }, []);

  const resetVerify = useCallback(() => {
    setVerifyStep("form"); setSessionId(""); setChallengeGrid([]);
    setRegisterLetters([]); setRegInputs(Array(5).fill("")); setError("");
  }, []);

  /* ── SETUP: open preview ── */
  const handleSetup = () => {
    setError("");
    if (!senderEmail.trim())   { setError("Enter your email."); return; }
    if (!selectedWord)         { setError("Choose your visual word."); return; }
    setPreview({ word: selectedWord });
  };

  /* ── SETUP: confirm → POST /api/upi/setup ── */
  const confirmSetup = async () => {
    setPreview(null); setLoading(true); setError("");
    try {
      const data = await postJson("/api/upi/setup", {
        email:             senderEmail.trim().toLowerCase(),
        selectedWord:      selectedWord.word,
        selectedWordParts: selectedWord.parts,
        selectedWordLang:  selectedWord.lang,
      });
      if (!data.success) { setError(data.error || "Could not save your UPI password."); return; }
      showToast("success", "UPI Visual Password set up! You can now verify transactions.");
      resetSetup();
      setMode("verify");
    } catch { setError("Server error. Try again."); }
    finally { setLoading(false); }
  };

  /* ── VERIFY: start session ──
     Offset = digits in amount + personalSecret (stored server-side).
     Initials of recipient = the 2 secret positions.
     3 random fillers complete the 5-letter row.
  ── */
  const handleVerifyStart = async () => {
    setError("");
    if (!verifyEmail.trim())    { setError("Enter your email."); return; }
    if (!transactionId.trim()) { setError("Enter the UPI transaction ID."); return; }
    const digits = countDigits(amountStr);
    if (digits < 1) { setError("Enter the amount you are sending."); return; }

    setLoading(true);
    try {
      const data = await postJson("/api/upi/verify-start", {
        email:            verifyEmail.trim().toLowerCase(),
        transactionId:     transactionId.trim(),
        amountDigitCount:  digits,
      });
      if (!data.success) { setError(data.error || "Could not start verification."); return; }
      setSessionId(data.sessionId);
      setChallengeGrid(data.challengeGrid || []);
      setRegisterLetters(data.registerLetters || []);
      setRegInputs(Array(5).fill(""));
      setVerifyStep("grid");
    } catch { setError("Server error. Try again."); }
    finally { setLoading(false); }
  };

  /* ── VERIFY: submit register ── */
  const handleVerifySubmit = async () => {
    setError("");
    if (!allFilled) { setError("Fill all 5 positions."); return; }
    setLoading(true);
    try {
      const data = await postJson("/api/upi/verify-complete", {
        sessionId,
        registerInputs: regInputs.map(v => parseInt(v, 10)),
      });
      if (!data.success) {
        setError(data.error || "Verification failed.");
        if (!data.error?.includes("attempt")) resetVerify();
        return;
      }
      showToast("success", "Transaction verified! Identity confirmed.");
      setVerifyStep("done");
    } catch { setError("Server error. Try again."); }
    finally { setLoading(false); }
  };

  /* ═══════════════════════════════════════ RENDER ══════════════ */
  return (
    <>
      <style>{CSS}</style>
      <Toast toasts={toasts} onClose={closeToast} />

      {/* PREVIEW OVERLAY */}
      {preview && (
        <div className="overlay-bg" onClick={e => { if (e.target === e.currentTarget) setPreview(null); }}>
          <div className="overlay-card overlay-card--wide">
            <button className="overlay-close" onClick={() => setPreview(null)}>✕</button>
            <p className="overlay-eyebrow">Confirm your UPI password</p>
            <h2 className="overlay-title">Review before saving</h2>

            <div className="preview-details">
              <div className="preview-row">
                <span className="preview-key">Your word</span>
                <span className="preview-val" style={{ fontFamily: preview.word.lang !== "en" ? "'Noto Sans Devanagari',sans-serif" : "inherit", fontSize: "1.1rem", fontWeight: 700 }}>
                  {preview.word.word}
                </span>
              </div>
              <div className="preview-row">
                <span className="preview-key">Parts</span>
                <span className="preview-val">
                  {preview.word.parts.filter(Boolean).map((p, i) => (
                    <span key={i} className="part-chip" style={{ fontFamily: preview.word.lang !== "en" ? "'Noto Sans Devanagari',sans-serif" : "inherit" }}>{p}</span>
                  ))}
                </span>
              </div>
            </div>

            {/* How it works at login */}
            <div className="how-box">
              <p className="how-title">How to verify a transaction</p>
              <ol className="how-list">
                <li>Enter the UPI transaction ID and the amount to send.</li>
                <li>Find your complete visual word in the grid and note its value.</li>
                <li>Add that value to the number of digits in the amount.</li>
                <li>Enter the 2-digit result under the final two different characters of the transaction ID.</li>
              </ol>
            </div>

            <div className="mnemonic-box">
              <div className="mnemonic-letters" style={{ fontFamily: preview.word.lang !== "en" ? "'Noto Sans Devanagari',sans-serif" : "'Space Grotesk',sans-serif" }}>
                {preview.word.word}
              </div>
              <p className="mnemonic-hint">
                At verification, your complete word will appear with a value below it.<br/>
                Add that value to the amount's digit count and use your transaction ID to find the answer positions.
              </p>
            </div>

            <p className="overlay-hint">Your visual word is your UPI authentication secret. Remember it.</p>
            <button className="overlay-btn" disabled={loading} onClick={confirmSetup}>
              {loading ? "Saving…" : "Confirm and save →"}
            </button>
          </div>
        </div>
      )}

      <div className="auth-page">
        <header className="auth-hero">
          <div className="upi-badge">🔐 UPI Visual Password</div>
          <h1 className="hero-title">Verify payments with a <span className="hero-accent">Visual Word</span></h1>
          <p className="hero-sub">
            Your visual word, its card value, your UPI transaction ID, and the number of digits in the amount create a unique
            transaction password. No OTP. No PIN. No bank details shared.
          </p>
        </header>

        <div className="auth-shell">
          <div className="auth-card">

            {/* ── TABS ── */}
            <div className="mode-tabs">
              <button className={`mode-tab${mode === "setup"  ? " mode-tab--active" : ""}`} onClick={() => { setMode("setup");  resetSetup(); }}>Set up password</button>
              <button className={`mode-tab${mode === "verify" ? " mode-tab--active" : ""}`} onClick={() => { setMode("verify"); resetVerify(); }}>Verify a payment</button>
            </div>

            {/* ════════════ SETUP ════════════ */}
            {mode === "setup" && (
              <div className="form-stack">
                <div className="info-box">
                  <strong>One-time setup.</strong> Choose a word that only you know. This is your UPI visual password.
                  You'll use it every time you send money.
                </div>

                {/* Email */}
                <div className="field-group">
                  <label className="field-label">Your email</label>
                  <input className="field-input" type="email" placeholder="you@example.com"
                    value={senderEmail} onChange={e => setSenderEmail(e.target.value)} />
                </div>

                {/* Language */}
                <div className="field-group">
                  <label className="field-label">Language</label>
                  <div className="lang-toggle">
                    <button className={`lang-btn${lang === "mr" ? " lang-btn--active" : ""}`} onClick={() => setLang("mr")}>मराठी</button>
                    <button className={`lang-btn${lang === "en" ? " lang-btn--active" : ""}`} onClick={() => setLang("en")}>English</button>
                    <button className={`lang-btn${lang === "hi" ? " lang-btn--active" : ""}`} onClick={() => setLang("hi")}>हिंदी</button>
                  </div>
                </div>

                {/* Word picker */}
                <p className="section-label">Choose your visual password word</p>
                <p className="section-hint">Your complete word will appear at verification. Spot it and use the value shown below it.</p>
                <div className="word-grid">
                  {words.map((item, idx) => {
                    const isSel = selectedWord?.word === item.word;
                    const isDev = item.lang !== "en";
                    return (
                      <div key={idx}
                        className={`word-card${isSel ? " word-card--selected" : ""}`}
                        role="button" tabIndex={0}
                        onClick={() => setSelectedWord(item)}
                        onKeyDown={e => e.key === "Enter" && setSelectedWord(item)}
                      >
                        <div className="word-display" style={{ fontFamily: isDev ? "'Noto Sans Devanagari',sans-serif" : "'Space Grotesk',sans-serif" }}>
                          {item.word}
                        </div>
                        <div className="word-parts">
                          {item.parts.filter(Boolean).map((p, i) => (
                            <span key={i} className="part-chip" style={{ fontFamily: isDev ? "'Noto Sans Devanagari',sans-serif" : "inherit" }}>{p}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {error && <div className="alert-error">{error}</div>}
                <button className="btn-primary" disabled={loading} onClick={handleSetup}>
                  {loading ? "Saving…" : "Review and save password →"}
                </button>
              </div>
            )}
            
            {/* ── VERIFY ── */}
            {mode === "verify" && verifyStep !== "done" && (
              <div className="form-stack">
                <div className="step-badge">Verify a payment</div>
                <div className="info-box">
                  <strong>Before sending money</strong>, verify your identity here.
                  Enter the UPI transaction ID and the exact amount, then find your
                  visual word below and complete the register row.
                </div>

                <div className="field-group">
                  <label className="field-label">Your email</label>
                  <input className="field-input" type="email" placeholder="you@example.com"
                    value={verifyEmail} onChange={e => setVerifyEmail(e.target.value)}
                    disabled={verifyStep === "grid"} />
                </div>

                <div className="field-group">
                  <label className="field-label">UPI transaction ID</label>
                  <p className="section-hint">Use the reference number from your UPI app. Its final two different letters or numbers identify your answer positions.</p>
                  <input className="field-input" type="text" placeholder="e.g. UPI12345AB"
                    value={transactionId} onChange={e => setTransactionId(e.target.value)}
                    disabled={verifyStep === "grid"} />
                </div>

                <div className="field-group">
                  <label className="field-label">Amount to send (₹)</label>
                  <p className="section-hint">
                    The number of digits in this amount will be added to your selected card's value.
                    {amountStr && countDigits(amountStr) > 0 && (
                      <span style={{ display: "block", marginTop: 4, color: "#0891b2", fontWeight: 600 }}>
                        ₹{amountStr.replace(/[^0-9]/g,"")} has {countDigits(amountStr)} digits → add this count to your selected card's value.
                      </span>
                    )}
                  </p>
                  <input className="field-input" type="text" inputMode="numeric"
                    placeholder="e.g. 100000"
                    value={amountStr} onChange={e => setAmountStr(e.target.value)}
                    disabled={verifyStep === "grid"} />
                </div>

                {verifyStep === "form" && (
                  <>
                    {error && <div className="alert-error">{error}</div>}
                    <button className="btn-primary" disabled={loading} onClick={handleVerifyStart}>
                      {loading ? "Please wait…" : "Continue →"}
                    </button>
                  </>
                )}

                {verifyStep === "grid" && (
                  <>
                    <div className="info-box">
                      <strong>Find your complete visual word below.</strong> The number under it is its card value.
                      Add that value to the amount's digit count, then enter the 2-digit result under your transaction-ID markers.
                    </div>

                    <div className="cg-grid">
                      {challengeGrid.length > 0
                        ? challengeGrid.map((item, i) => (
                            <WordCard key={i} mask={item.mask} value={item.value} />
                          ))
                        : <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#dc2626", padding: 40 }}>
                            Grid not found — start over.
                          </div>
                      }
                    </div>

                    {registerLetters.length === 5 && (
                      <>
                        <div className="register-sep"><span>Enter digits under your transaction-ID markers</span></div>
                        <div className="info-box" style={{ fontSize: "0.8rem" }}>
                          The final two different characters of transaction ID <strong>{transactionId}</strong> are in the row below.
                          Enter your 2-digit result under them (either order). Fill the rest with any digit.
                        </div>
                        <RegisterBar
                          letters={registerLetters}
                          inputs={regInputs}
                          onChange={(i, v) => setRegInputs(p => { const n = [...p]; n[i] = v; return n; })}
                        />
                      </>
                    )}

                    {error && <div className="alert-error">{error}</div>}
                    <button className="btn-primary" disabled={loading || !allFilled} onClick={handleVerifySubmit}>
                      {loading ? "Verifying…" : "Verify payment →"}
                    </button>
                    <button className="btn-outline" onClick={resetVerify}>← Start over</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <p className="page-footer">ScamRisk UPI — Your secret never leaves this device.</p>
      </div>
    </>
  );
}

/* ── STYLES ──────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Devanagari:wght@400;600;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
button,input,select{font-family:inherit;}

.auth-page{min-height:100vh;background:#f7efe6;color:#0f172a;font-family:'Inter',sans-serif;padding:48px 20px 72px;position:relative;overflow:hidden;}
.auth-page::before{content:'';position:fixed;top:-140px;right:-140px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(6,182,212,0.06) 0%,transparent 70%);pointer-events:none;z-index:0;}

.auth-hero{text-align:center;max-width:680px;margin:0 auto 36px;position:relative;z-index:1;}
.upi-badge{display:inline-block;padding:6px 18px;border-radius:99px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);font-size:0.82rem;font-weight:700;color:#059669;letter-spacing:0.06em;margin-bottom:14px;}
.hero-title{font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:clamp(1.6rem,3.2vw,2.4rem);letter-spacing:-0.04em;line-height:1.12;color:#0f172a;margin-bottom:10px;}
.hero-accent{color:#06B6D4;}
.hero-sub{font-size:0.88rem;color:#64748b;line-height:1.7;}

.auth-shell{max-width:960px;margin:0 auto;position:relative;z-index:1;}
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
.section-label{font-size:.73rem;font-weight:700;color:#475569;letter-spacing:.06em;text-transform:uppercase;}
.field-input{width:100%;padding:11px 13px;border-radius:10px;border:1.5px solid #e2d9cc;background:#fff;font-size:.91rem;color:#0f172a;outline:none;transition:border-color .18s,box-shadow .18s;}
.field-input:focus{border-color:#06B6D4;box-shadow:0 0 0 3px rgba(6,182,212,.1);}
.field-input::placeholder{color:#94a3b8;}

.offset-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.letter-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:4px;}
.ctrl-offset{width:68px;padding:10px 12px;border-radius:9px;border:2px solid #0f172a;background:#fff;font-family:'Space Grotesk',sans-serif;font-size:1.3rem;font-weight:800;color:#0f172a;text-align:center;outline:none;}
.ctrl-offset:focus{border-color:#06B6D4;}
.ctrl-select{padding:10px 14px;border-radius:10px;border:2px solid #0f172a;background:#fff;font-family:'Space Grotesk',sans-serif;font-size:1.3rem;font-weight:800;color:#000;cursor:pointer;outline:none;min-width:62px;text-align:center;}
.ctrl-select:focus{border-color:#06B6D4;}
.ctrl-select:disabled{background:#f3efe9;color:#94a3b8;cursor:not-allowed;}
.ctrl-plus{font-family:'Space Grotesk',sans-serif;font-weight:800;color:#06B6D4;font-size:1.3rem;}
.ctrl-hint{font-size:.75rem;color:#94a3b8;line-height:1.5;}

.initials-preview{margin-top:6px;font-size:.85rem;color:#334155;padding:8px 12px;background:rgba(6,182,212,.06);border-radius:8px;border:1px solid rgba(6,182,212,.2);}
.initials-preview strong{color:#0891b2;font-size:1rem;}

.lang-toggle{display:flex;gap:0;border:2px solid #0f172a;border-radius:12px;overflow:hidden;}
.lang-btn{flex:1;padding:13px 8px;background:#fff;border:none;border-right:2px solid #0f172a;font-family:'Space Grotesk','Noto Sans Devanagari',sans-serif;font-size:1.1rem;font-weight:800;color:#0f172a;cursor:pointer;transition:background .15s,color .15s;}
.lang-btn:last-child{border-right:none;}
.lang-btn:hover{background:#f3efe9;}
.lang-btn--active{background:#0f172a;color:#fff;}

.word-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;max-height:300px;overflow-y:auto;padding-right:4px;}
.word-grid::-webkit-scrollbar{width:4px;}
.word-grid::-webkit-scrollbar-thumb{background:#d1c4b0;border-radius:2px;}
.word-card{background:#fff;border:2px solid #0f172a;border-radius:12px;padding:14px 12px;min-height:90px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:border-color .15s,box-shadow .15s;text-align:center;}
.word-card:hover{border-color:#0891b2;box-shadow:0 0 0 2px rgba(8,145,178,.15);}
.word-card--selected{border-color:#0891b2;background:#e0f7fa;box-shadow:0 0 0 3px rgba(8,145,178,.25);}
.word-display{font-size:1.15rem;font-weight:800;color:#000;}
.word-parts{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;}
.part-chip{padding:4px 9px;font-size:.88rem;font-weight:700;border:2px solid #0f172a;background:#fff;color:#000;border-radius:7px;}

/* 21-card grid, 3 columns */
.cg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:100%;margin-top:4px;}
@media(max-width:540px){.cg-grid{grid-template-columns:repeat(3,1fr);gap:5px;}}

/* UPI word card — NO value shown */
.upi-wc{padding:14px 10px;border:2px solid #0f172a;background:#fff;min-height:68px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:10px;cursor:default;}
.upi-wc--sel{border-color:#0891b2;background:#e0f7fa;}
.upi-wc-mask{font-size:1.25rem;font-weight:800;color:#000;letter-spacing:.06em;text-align:center;font-family:'Space Grotesk','Noto Sans Devanagari',sans-serif;}

.register-sep{display:flex;align-items:center;gap:12px;margin:4px 0 0;}
.register-sep::before,.register-sep::after{content:'';flex:1;height:1px;background:#e2d9cc;}
.register-sep span{font-size:.75rem;font-weight:600;color:#64748b;white-space:nowrap;text-transform:uppercase;letter-spacing:.05em;}

.reg-wrap{width:100%;border:1px solid #e2d9cc;border-radius:12px;overflow:hidden;overflow-x:auto;}
.reg-header,.reg-dropdowns{display:grid;grid-template-columns:repeat(5,1fr);min-width:260px;}
.reg-head-cell{min-height:52px;padding:10px 8px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:800;color:#000;background:#fff;border:2px solid #0f172a;border-bottom:none;letter-spacing:.04em;}
.reg-select{padding:16px 0;font-size:1.5rem;font-weight:800;color:#000;background:#fff;border:2px solid #0f172a;min-height:60px;text-align:center;text-align-last:center;appearance:none;-webkit-appearance:none;outline:none;cursor:pointer;transition:background .15s;}
.reg-select:focus{background:rgba(6,182,212,.07);}
.reg-select--disabled{background:#f1f1f1;color:#9ca3af;}

.overlay-bg{position:fixed;inset:0;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;z-index:9000;padding:20px;}
.overlay-card{position:relative;background:#fbf7f0;border:1px solid #e2d9cc;border-radius:20px;padding:36px 32px;max-width:380px;width:100%;display:flex;flex-direction:column;align-items:center;gap:14px;box-shadow:0 20px 60px rgba(15,23,42,.2);animation:oIn .22s ease;}
.overlay-card--wide{max-width:800px;align-items:flex-start;max-height:90vh;overflow-y:auto;}
@keyframes oIn{from{transform:scale(.94);opacity:0}to{transform:scale(1);opacity:1}}
.overlay-close{position:absolute;top:14px;right:16px;background:none;border:none;font-size:1.1rem;color:#94a3b8;cursor:pointer;}
.overlay-close:hover{color:#0f172a;}
.overlay-eyebrow{font-size:.72rem;font-weight:600;color:#0891b2;letter-spacing:.08em;text-transform:uppercase;}
.overlay-title{font-family:'Space Grotesk',sans-serif;font-size:1.2rem;font-weight:800;color:#0f172a;text-align:center;}
.overlay-hint{font-size:.8rem;color:#64748b;text-align:center;line-height:1.7;}
.overlay-btn{width:100%;padding:12px;border-radius:10px;border:none;background:linear-gradient(135deg,#06B6D4,#0891b2);color:#fff;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:.94rem;cursor:pointer;}
.overlay-btn:hover{opacity:.9;}
.overlay-btn:disabled{opacity:.4;cursor:not-allowed;}

.preview-details{width:100%;background:#fff;border:1px solid #e2d9cc;border-radius:12px;padding:14px 18px;display:flex;flex-direction:column;gap:10px;}
.preview-row{display:flex;gap:14px;font-size:.88rem;line-height:1.6;align-items:flex-start;}
.preview-key{font-weight:700;color:#475569;min-width:110px;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em;padding-top:2px;}
.preview-val{color:#0f172a;display:flex;flex-wrap:wrap;align-items:center;gap:6px;}

/* how-it-works box */
.how-box{width:100%;background:#f0fdf4;border:1px solid rgba(16,185,129,.25);border-radius:12px;padding:14px 18px;}
.how-title{font-size:.8rem;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;}
.how-list{padding-left:18px;display:flex;flex-direction:column;gap:6px;}
.how-list li{font-size:.84rem;color:#334155;line-height:1.55;}
.how-list li strong{color:#0f172a;}

.mnemonic-box{width:100%;background:rgba(6,182,212,.06);border:1.5px solid rgba(6,182,212,.2);border-radius:14px;padding:16px 20px;display:flex;flex-direction:column;align-items:center;gap:10px;}
.mnemonic-letters{font-size:2.2rem;font-weight:800;color:#0891b2;line-height:1.2;text-align:center;}
.mnemonic-hint{font-size:.78rem;color:#64748b;text-align:center;line-height:1.7;}

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
.toast-warning{background:#fffbeb;border:1px solid rgba(245,158,11,.3);color:#d97706;}
.toast-error{background:#fef2f2;border:1px solid rgba(239,68,68,.28);color:#dc2626;}
@keyframes slideUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}

.page-footer{text-align:center;margin-top:28px;font-size:.75rem;color:#94a3b8;position:relative;z-index:1;}
`;
