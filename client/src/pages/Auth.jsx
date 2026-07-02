import { useState, useCallback, useRef, useEffect } from "react";

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
function getRandomOffset()     { return String(10 + Math.floor(Math.random() * 90)); }
function getRandomLetterPair() { const s = shuffle([...ALPHABET]); return [s[0], s[1]]; }

async function postJson(path, body) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text(); // IMPORTANT (not json yet)

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Non-JSON response:", text);
      throw new Error("Server returned invalid response");
    }

    if (!res.ok) {
      console.error("HTTP error:", res.status, data);
      return { success: false, error: data?.error || "Request failed" };
    }

    return data;
  } catch (err) {
    console.error("postJson failed:", err);
    return { success: false, error: err.message };
  }
}

function buildMask(parts, revealIdx) {
  if (!Array.isArray(parts) || parts.length === 0) return "_ _ _";
  return parts.filter(Boolean).map((p, i) => (i === revealIdx ? p : "_")).join(" ");
}

/* ── Word Card ── */
function WordCard({ mask, value, onClick, selected }) {
  const displayValue = Number.isFinite(value) ? String(value) : "?";
  const displayMask  = mask || "_ _ _";
  return (
    <div
      className={`wc-card${selected ? " wc-card--selected" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onClick?.()}
    >
      <div className="wc-mask">{displayMask}</div>
      <div className="wc-value">{displayValue}</div>
    </div>
  );
}

/* ── Register Dropdown Bar ── */
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
            <select
              key={l}
              className={`reg-select${isDisabled ? " reg-select--disabled" : ""}`}
              value={current}
              disabled={isDisabled}
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

/* ── Toast Stack ── */
function Toast({ toasts, onClose }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => onClose(t.id)}>
          <span className="toast-icon">
            {t.type === "success" ? "✓" : t.type === "warning" ? "!" : "✕"}
          </span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

export default function Auth() {
  const [mode,     setMode]     = useState("signup");
  const [email,    setEmail]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [toasts,   setToasts]   = useState([]);

  const [isWordpressLogin, setIsWordpressLogin] = useState(false);
  const [wpLoginStarted,   setWpLoginStarted]   = useState(false);
  const [apiKey,           setApiKey]           = useState("");

  // signup state
  const [words,        setWords]        = useState([]);
  const [wordPairs,    setWordPairs]    = useState([]);
  const [isWpFlow,     setIsWpFlow]     = useState(true);
  const [selectedWord, setSelectedWord] = useState(null);
  const [offset,       setOffset]       = useState(getRandomOffset);
  const [letterPair,   setLetterPair]   = useState(getRandomLetterPair);
  const [preview,      setPreview]      = useState(null);
  const [lang,         setLang]         = useState("en");

  // login state
  const [loginStep,       setLoginStep]       = useState("creds");
  const [sessionId,       setSessionId]       = useState("");
  const [challengeGrid,   setChallengeGrid]   = useState([]);
  const [registerLetters, setRegisterLetters] = useState([]);
  const [regInputs,       setRegInputs]       = useState(Array(5).fill(""));

  const toastCounter = useRef(0);
  const allFilled    = regInputs.every(v => v !== "");

  const showToast = (type, message, duration = 4500) => {
    const id = ++toastCounter.current;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  };
  const closeToast = id => setToasts(prev => prev.filter(t => t.id !== id));

  /* ── URL params (WordPress SSO) ── */
  useEffect(() => {
    const params   = new URLSearchParams(window.location.search);
    const em       = params.get("email");
    const ak       = params.get("apikey");
    const callback = params.get("callback");
    if (em) setEmail(em);
    if (ak) setApiKey(ak);
    if (callback) localStorage.setItem("wp_callback", callback);
    if (em && ak) { setMode("login"); setIsWordpressLogin(true); }
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  useEffect(() => {
    if (isWordpressLogin && email && apiKey && !wpLoginStarted) {
      setWpLoginStarted(true);
      handleWordpressLogin();
    }
  }, [isWordpressLogin, email, apiKey, wpLoginStarted]);

  /* ── load words on mount / lang change ── */
  useEffect(() => {
    if (isWordpressLogin) return;
    fetch(`${API_BASE}/api/auth/words?lang=${lang}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.words)) {
          setWords(shuffle(d.words));
          setWordPairs(shuffle(d.wordPairs || []));
        }
      });
  }, [lang]);

  const resetAll = useCallback((m) => {
    setMode(m);
    if (!isWordpressLogin) setEmail("");
    setError("");
    setSelectedWord(null); setOffset(getRandomOffset()); setLetterPair(getRandomLetterPair());
    setPreview(null);
    setLoginStep("creds"); setSessionId(""); setChallengeGrid([]);
    setRegisterLetters([]); setRegInputs(Array(5).fill("")); 
    if (m === "signup") {
      fetch(`${API_BASE}/api/auth/words?lang=${lang}`)
        .then(r => r.json())
        .then(d => {
          if (d.success && Array.isArray(d.words)) {
            setWords(shuffle(d.words));
            setWordPairs(shuffle(d.wordPairs || []));
          }
        });
    }
  }, [isWordpressLogin, lang]);

  /* ── SIGNUP ── */
  const handleSignup = () => {
    setError("");
    if (!email.trim())       { setError("Please enter your email."); return; }
    if (!selectedWord)       { setError("Please choose a word."); return; }
    if (!letterPair[0] || !letterPair[1]) { setError("Please choose two letters."); return; }
    if (letterPair[0] === letterPair[1])  { setError("The two letters must be different."); return; }
    const off = parseInt(offset, 10);
    if (isNaN(off) || off < 10 || off > 99) { setError("Offset must be between 10 and 99."); return; }
    setPreview({ word: selectedWord, offset: off, letterPair });
  };

  const confirmSignup = async () => {
    setPreview(null);
    setLoading(true);
    setError("");
    try {
      const data = await postJson("/api/auth/signup", {
        email,
        selectedWord:      selectedWord.word,
        selectedWordParts: selectedWord.parts,
        selectedWordLang:  selectedWord.lang,
        secretLetters:     letterPair,
        offset:            parseInt(offset, 10),
        wpFlow:            isWpFlow,
      });
      if (!data.success) {
        setError(data.error || "Could not create account. Please try again.");
        return;
      }
      localStorage.setItem("token", data.token);
      showToast("success", "Account created! Please sign in.");
      resetAll("login");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── LOGIN — email only, no password ── */
  const handleLoginCreds = async () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      const data = await postJson("/api/auth/login", { email });

      console.log("LOGIN RESPONSE:", data);

      if (!data?.success) {
        setError(data?.error || "No account found with that email.");
        return;
      }

      setSessionId(data.sessionId);
      setChallengeGrid(data.challengeGrid || []);
      setRegisterLetters(Array.isArray(data.registerLetters) ? data.registerLetters : []);
      setRegInputs(Array(5).fill(""));

      setLoginStep("grid");
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

    /* ── VERIFY ── */
  const handleVerify = async () => {
    setError("");

    if (!allFilled) {
      setError("Please fill in all 5 positions.");
      return;
    }

    setLoading(true);

    try {
      const data = await postJson("/api/auth/verify", {
        sessionId,
        registerInputs: regInputs.map(v => parseInt(v, 10)),
      });

      if (!data.success) {
        setError(data.error || "Verification failed.");

        if (!data.error?.includes("attempt")) {
          setLoginStep("creds");
          setChallengeGrid([]);
          setSessionId("");
        }

        return;
      }

      // Modified WordPress callback flow
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      const callback = localStorage.getItem("wp_callback");

      if (callback && data.token) {
        localStorage.removeItem("wp_callback");

        const url = new URL(decodeURIComponent(callback));

        url.searchParams.set("jwt", data.token);

        window.location.href = url.toString();
        return;
      }

      showToast("success", data.message || "Identity verified! Welcome back.");
      setLoginStep("success");

    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── WORDPRESS LOGIN ── */
  const handleWordpressLogin = async () => {
    try {
      setLoading(true);
      const data = await postJson("/api/auth/wordpress-login", { email, apiKey });
      if (!data.success) {
        if (data.error === "User not found.") {
          setMode("signup");
          showToast("error", "No Visual Password account found.");
        } else {
          setError(data.error);
        }
        return;
      }
      setSessionId(data.sessionId);
      setChallengeGrid(data.challengeGrid || []);
      setRegisterLetters(data.registerLetters || []);
      setRegInputs(Array(5).fill(""));
      setLoginStep("grid");
    } catch (err) {
      setError(err.message || "WordPress login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCardSelect = (idx) => {
    setRegInputs(Array(5).fill(""));
  };

  /* ═══════════════════ RENDER ═══════════════════════════════ */
  return (
    <>
      <style>{CSS}</style>
      <Toast toasts={toasts} onClose={closeToast} />

      {/* ── SIGNUP PREVIEW OVERLAY ── */}
      {preview && (
        <div className="overlay-bg" onClick={e => { if (e.target === e.currentTarget) setPreview(null); }}>
          <div className="overlay-card overlay-card--wide">
            <button className="overlay-close" onClick={() => setPreview(null)}>✕</button>
            <p className="overlay-eyebrow">Confirm</p>
            <h2 className="overlay-title">Review before creating your account</h2>

            <div className="preview-details">
              <div className="preview-row">
                <span className="preview-key">Word</span>
                <span className="preview-val" style={{ fontFamily: preview.word.lang !== "en" ? "'Noto Sans Devanagari', sans-serif" : "inherit", fontSize: "1.05rem" }}>
                  {preview.word.word}
                </span>
              </div>
              <div className="preview-row">
                <span className="preview-key">Parts</span>
                <span className="preview-val" style={{ fontFamily: preview.word.lang !== "en" ? "'Noto Sans Devanagari', sans-serif" : "inherit" }}>
                  {preview.word.parts.map((p, i) => (
                    <span key={i} className="part-chip">{p || "—"}</span>
                  ))}
                </span>
              </div>
              <div className="preview-row">
                <span className="preview-key">Offset</span>
                <span className="preview-val">{preview.offset} <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>(10–99)</span></span>
              </div>
              <div className="preview-row">
                <span className="preview-key">Letters</span>
                <span className="preview-val">
                  <strong style={{ color: "#0891b2" }}>{preview.letterPair[0]}</strong>
                  <span style={{ margin: "0 8px", color: "#94a3b8" }}>+</span>
                  <strong style={{ color: "#0891b2" }}>{preview.letterPair[1]}</strong>
                  <span style={{ color: "#64748b", fontSize: "0.8rem", marginLeft: 8 }}>(initials of your chosen person)</span>
                </span>
              </div>
            </div>

            <div className="mnemonic-box">
              <div className="mnemonic-letters" style={{ fontFamily: preview.word.lang !== "en" ? "'Noto Sans Devanagari', sans-serif" : "'Space Grotesk', sans-serif", letterSpacing: preview.word.lang !== "en" ? "0.1em" : "0.18em" }}>
                {preview.word.word}
              </div>
              <div className="mnemonic-pairs">
                {preview.word.parts.filter(Boolean).map((p, i) => (
                  <span key={i} className="mnemonic-pair" style={{ fontFamily: preview.word.lang !== "en" ? "'Noto Sans Devanagari', sans-serif" : "inherit" }}>
                    <strong>{p}</strong>
                  </span>
                ))}
              </div>
              <p className="mnemonic-hint">
                At login, one part of your word will be shown — e.g. "{buildMask(preview.word.parts, 0)}".<br />
                Recognise it to recall your full word.
              </p>
            </div>

            <div className="preview-grid">
              {preview.word.parts.filter(Boolean).map((p, i) => (
                <div key={i} className="preview-item">
                  <div className="preview-img-wrap" style={{ fontFamily: preview.word.lang !== "en" ? "'Noto Sans Devanagari', sans-serif" : "'Space Grotesk', sans-serif" }}>
                    <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0891b2" }}>{p}</span>
                  </div>
                  <div className="preview-label">{buildMask(preview.word.parts, i)}</div>
                </div>
              ))}
            </div>

            <p className="overlay-hint">Remember your offset and letters — they will not be shown again.</p>
            <button className="overlay-btn" disabled={loading} onClick={confirmSignup}>
              {loading ? "Creating…" : "Confirm and create account"}
            </button>
          </div>
        </div>
      )}

      {/* ══ PAGE ══ */}
      <div className="auth-page">
        <header className="auth-hero">
          <p className="hero-eyebrow">Visual Word Password</p>
          <h1 className="hero-title">Sign in with a <span className="hero-accent">Visual Word</span></h1>
          <p className="hero-sub">
            Choose a word, a personal offset (10–99), and 2 initials from someone you trust.
            At login, spot your word hint, add your offset, and enter the digits in the right positions.
          </p>
        </header>

        <div className="auth-shell">
          <div className="auth-card">

            {/* SUCCESS */}
            {loginStep === "success" && (
              <div className="success-box">
                <div className="success-check">✓</div>
                <h2 className="success-title">Identity Verified</h2>
                <p className="success-msg">Your Visual Word login was successful. Welcome back!</p>
                <button className="btn-outline" onClick={() => resetAll("login")}>Sign in again</button>
              </div>
            )}

            {loginStep !== "success" && (
              <>
                {(mode === "signup" || loginStep === "creds") && (
                  <div className="mode-tabs">
                    <button className={`mode-tab${mode === "signup" ? " mode-tab--active" : ""}`} onClick={() => resetAll("signup")}>Create account</button>
                    <button className={`mode-tab${mode === "login"  ? " mode-tab--active" : ""}`} onClick={() => resetAll("login")}>Sign in</button>
                  </div>
                )}

                {/* ══ SIGNUP ══ */}
                {mode === "signup" && (
                  <div className="form-stack">
                    <div className="flow-toggle">
                      <button className={`flow-btn${isWpFlow ? " flow-btn--active" : ""}`} onClick={() => setIsWpFlow(true)}>WordPress (single word)</button>
                      <button className={`flow-btn${!isWpFlow ? " flow-btn--active" : ""}`} onClick={() => setIsWpFlow(false)}>Regular (two words)</button>
                    </div>

                    {/* Email only — no password */}
                    <div className="field-group">
                      <label className="field-label">Email</label>
                      <input className="field-input" type="email" placeholder="you@example.com"
                        value={email} onChange={e => setEmail(e.target.value)} />
                    </div>

                    {/* Offset */}
                    <div className="field-group">
                      <label className="field-label">Offset (10–99)</label>
                      <div className="offset-row">
                        <input className="ctrl-offset" type="text" inputMode="numeric" maxLength={2}
                          value={offset}
                          onChange={e => setOffset(e.target.value.replace(/\D/, "").slice(0, 2))} />
                        <span className="ctrl-hint">Age of a loved one, favourite jersey number, or any memorable number</span>
                      </div>
                    </div>

                    {/* Letter pair */}
                    <div className="field-group">
                      <label className="field-label">2 initials from someone you trust</label>
                      <p className="section-hint" style={{ marginTop: 2 }}>
                        e.g. Rajkumar Yadav → R &amp; Y. These will always appear in your login row.
                      </p>
                      <div className="letter-row">
                        <select className="ctrl-select" value={letterPair[0]}
                          onChange={e => setLetterPair(prev => [e.target.value, prev[1] === e.target.value ? "" : prev[1]])}>
                          <option value="">Choose</option>
                          {ALPHABET.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <span className="ctrl-plus">+</span>
                        <select className="ctrl-select" value={letterPair[1]} disabled={!letterPair[0]}
                          onChange={e => setLetterPair(prev => [prev[0], e.target.value])}>
                          <option value="">Choose</option>
                          {ALPHABET.filter(l => l !== letterPair[0]).map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <span className="ctrl-hint" style={{ marginLeft: 6 }}>A–Z</span>
                      </div>
                    </div>

                    {/* Language selector */}
                    <div className="field-group">
                      <label className="field-label">Choose language for your word</label>
                      <div className="lang-toggle">
                        <button className={`lang-btn${lang === "mr" ? " lang-btn--active" : ""}`} onClick={() => setLang("mr")}>मराठी</button>
                        <button className={`lang-btn${lang === "en" ? " lang-btn--active" : ""}`} onClick={() => setLang("en")}>English</button>
                        <button className={`lang-btn${lang === "hi" ? " lang-btn--active" : ""}`} onClick={() => setLang("hi")}>हिंदी</button>
                      </div>
                    </div>

                    {/* Word selector */}
                    <p className="section-label">Choose your Visual Password word</p>
                    <p className="section-hint">
                      At login, one unique part of your word will appear — e.g. "Ra _ _".
                      {!isWpFlow && " In Regular mode two words appear together."}
                    </p>

                    <div className="word-grid">
                      {(isWpFlow ? words : wordPairs).map((item, idx) => {
                        const w0 = isWpFlow ? item : words.find(w => w.word === item[0]);
                        const w1 = isWpFlow ? null : words.find(w => w.word === item[1]);
                        const isSel = isWpFlow
                          ? selectedWord?.word === item.word
                          : selectedWord?.word === `${w0?.word} + ${w1?.word}`;
                        const displayWord  = isWpFlow ? item.word : `${w0?.word} + ${w1?.word}`;
                        const displayParts = isWpFlow ? item.parts : [...(w0?.parts || []), ...(w1?.parts || [])];
                        const isDevanagari = isWpFlow
                          ? (item.lang === "hi" || item.lang === "mr")
                          : (w0?.lang === "hi" || w0?.lang === "mr");
                        return (
                          <div key={idx}
                            className={`word-card${isSel ? " word-card--selected" : ""}`}
                            role="button" tabIndex={0}
                            onClick={() => setSelectedWord(isWpFlow ? item : { word: displayWord, parts: displayParts, lang: w0?.lang || "en" })}
                            onKeyDown={e => e.key === "Enter" && setSelectedWord(isWpFlow ? item : { word: displayWord, parts: displayParts, lang: w0?.lang || "en" })}
                          >
                            <div className="word-display" style={{ fontFamily: isDevanagari ? "'Noto Sans Devanagari', sans-serif" : "'Space Grotesk', sans-serif" }}>
                              {displayWord}
                            </div>
                            <div className="word-parts">
                              {displayParts.filter(Boolean).map((p, i) => (
                                <span key={i} className="part-chip" style={{ fontFamily: isDevanagari ? "'Noto Sans Devanagari', sans-serif" : "inherit" }}>{p}</span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {error && <div className="alert-error">{error}</div>}
                    <button className="btn-primary" disabled={loading} onClick={handleSignup}>
                      {loading ? "Creating…" : "Review and create account →"}
                    </button>
                  </div>
                )}

                {/* ══ LOGIN ══ */}
                {mode === "login" && (
                  <>
                    {/* ── Step 1: email only, no password, no forgot, no delete ── */}
                    {loginStep === "creds" && !isWordpressLogin && (
                      <div className="form-stack">
                        <div className="step-badge">Step 1 / 2 — Enter your email</div>
                        <div className="info-box">
                          No password needed. Just enter your email — your Visual Word is your key.
                        </div>
                        <div className="field-group">
                          <label className="field-label">Email address</label>
                          <input
                            className="field-input field-input--lg"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleLoginCreds()}
                            autoFocus
                          />
                        </div>
                        {error && <div className="alert-error">{error}</div>}
                        <button className="btn-primary" disabled={loading || !email.trim()} onClick={handleLoginCreds}>
                          {loading ? "Please wait…" : "Continue →"}
                        </button>
                      </div>
                    )}

                    {/* ── Step 2: grid + register inline ── */}
                    {loginStep === "grid" && (
                      <div className="form-stack">
                        <div className="step-badge">Step 2 / 2 — Identify your word and enter digits</div>
                        <div className="info-box">
                          <strong>Find your word hint.</strong> The number beneath your word is your card value.
                          Add your offset to obtain a 2-digit result, then enter the digits under your two chosen letters.
                        </div>

                        <div className="cg-grid">
                          {challengeGrid.length > 0
                            ? challengeGrid.map((item, i) => (
                                <WordCard
                                  key={i}
                                  mask={item.mask}
                                  value={item.value}
                                />
                              ))
                            : <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#dc2626", padding: 40 }}>
                                Grid not found — please start over.
                              </div>
                          }
                        </div>

                        {registerLetters.length === 5 && (
                          <>
                            <div className="register-sep">
                              <span>Enter digits under your letters</span>
                            </div>
                            <div className="info-box" style={{ fontSize: "0.8rem" }}>
                              Example: result = 58, letters R &amp; Y → put 5 under R and 8 under Y (or 8 and 5 — either order works). Fill the remaining slots with any digit.
                            </div>
                            <RegisterDropdownBar
                              letters={registerLetters}
                              inputs={regInputs}
                              onChange={(i, v) => setRegInputs(p => { const n = [...p]; n[i] = v; return n; })}
                            />
                          </>
                        )}

                        {error && <div className="alert-error">{error}</div>}
                        <button
                          className="btn-primary"
                          disabled={loading || !allFilled}
                          onClick={handleVerify}
                        >
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
        <p className="page-footer">ScamRisk — Visual Word Password is phishing-resistant. Your secret never leaves this device.</p>
      </div>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Devanagari:wght@400;600;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
button,input,select{font-family:inherit;}

.auth-page{min-height:100vh;background:#f7efe6;color:#0f172a;font-family:'Inter',sans-serif;padding:48px 20px 72px;position:relative;overflow:hidden;}
.auth-page::before{content:'';position:fixed;top:-140px;right:-140px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(6,182,212,0.06) 0%,transparent 70%);pointer-events:none;z-index:0;}

.auth-hero{text-align:center;max-width:680px;margin:0 auto 36px;position:relative;z-index:1;}
.hero-eyebrow{display:inline-block;padding:4px 14px;border-radius:99px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);font-size:0.72rem;font-weight:600;color:#d97706;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;}
.hero-title{font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:clamp(1.6rem,3.2vw,2.4rem);letter-spacing:-0.04em;line-height:1.12;color:#0f172a;margin-bottom:10px;}
.hero-accent{color:#06B6D4;}
.hero-sub{font-size:0.88rem;color:#64748b;line-height:1.7;}

.auth-shell{max-width:960px;margin:0 auto;position:relative;z-index:1;}
.auth-card{background:#fbf7f0;border:1px solid #e2d9cc;border-radius:20px;padding:36px 40px;display:flex;flex-direction:column;gap:20px;box-shadow:0 4px 28px rgba(15,23,42,0.06);}
@media(max-width:600px){.auth-card{padding:24px 18px;}}

.mode-tabs{display:flex;gap:8px;}
.mode-tab{flex:1;padding:11px;border-radius:99px;background:#fff;border:1.5px solid #e2d9cc;color:#475569;font-size:0.9rem;font-weight:500;cursor:pointer;transition:all 0.18s;}
.mode-tab:hover{border-color:rgba(6,182,212,0.4);color:#0891b2;}
.mode-tab--active{background:linear-gradient(135deg,#06B6D4,#0891b2);color:#fff;border-color:transparent;font-weight:700;}

/* flow toggle (WordPress / Regular) */
.flow-toggle{display:flex;gap:6px;background:#f3efe9;border-radius:99px;padding:4px;}
.flow-btn{flex:1;padding:7px 14px;border-radius:99px;background:transparent;border:none;font-size:0.9rem;font-weight:500;color:#475569;cursor:pointer;transition:all 0.18s;}
.flow-btn--active{background:#fff;color:#0891b2;font-weight:700;box-shadow:0 1px 4px rgba(15,23,42,0.08);}

/* language toggle — large black on white, senior-readable */
.lang-toggle{display:flex;gap:0;border:2px solid #0f172a;border-radius:12px;overflow:hidden;}
.lang-btn{flex:1;padding:14px 8px;background:#fff;border:none;border-right:2px solid #0f172a;font-family:'Space Grotesk','Noto Sans Devanagari',sans-serif;font-size:1.15rem;font-weight:800;color:#0f172a;cursor:pointer;transition:background 0.15s,color 0.15s;line-height:1.2;}
.lang-btn:last-child{border-right:none;}
.lang-btn:hover{background:#f3efe9;}
.lang-btn--active{background:#0f172a;color:#fff;}

.step-badge{padding:9px 14px;border-radius:9px;background:rgba(6,182,212,0.07);border:1px solid rgba(6,182,212,0.15);font-size:0.83rem;color:#0891b2;font-weight:600;}
.info-box{padding:13px 16px;border-radius:11px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);font-size:0.84rem;color:#92400e;line-height:1.65;}
.info-box strong{font-weight:700;color:#78350f;}

.form-stack{display:flex;flex-direction:column;gap:16px;}
.field-group{display:flex;flex-direction:column;gap:5px;}
.field-label{font-size:0.73rem;font-weight:600;color:#475569;letter-spacing:0.05em;text-transform:uppercase;}
.field-input{width:100%;padding:11px 13px;border-radius:10px;border:1.5px solid #e2d9cc;background:#fff;font-size:0.91rem;color:#0f172a;outline:none;transition:border-color 0.18s,box-shadow 0.18s;}
.field-input:focus{border-color:#06B6D4;box-shadow:0 0 0 3px rgba(6,182,212,0.1);}
.field-input::placeholder{color:#94a3b8;}
.field-input--lg{font-size:1.1rem;padding:14px 16px;border-radius:12px;border-width:2px;}
.field-input--lg:focus{border-color:#06B6D4;box-shadow:0 0 0 4px rgba(6,182,212,0.1);}

.offset-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.letter-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:4px;}
.ctrl-offset{width:64px;padding:9px 10px;border-radius:8px;border:1.5px solid #e2d9cc;background:#fff;font-family:'Space Grotesk',sans-serif;font-size:1.2rem;font-weight:800;color:#0f172a;text-align:center;outline:none;}
.ctrl-offset:focus{border-color:#06B6D4;}
.ctrl-plus{font-family:'Space Grotesk',sans-serif;font-weight:800;color:#06B6D4;font-size:1.2rem;}
.ctrl-hint{font-size:0.75rem;color:#94a3b8;line-height:1.5;}
.section-label{font-size:0.73rem;font-weight:700;color:#475569;letter-spacing:0.06em;text-transform:uppercase;}
.section-hint{font-size:0.79rem;color:#94a3b8;line-height:1.6;}

.ctrl-select{padding:10px 16px;border-radius:10px;border:2px solid #0f172a;background:#fff;font-family:'Space Grotesk',sans-serif;font-size:1.3rem;font-weight:800;color:#000;cursor:pointer;outline:none;min-width:58px;text-align:center;}
.ctrl-select:focus{border-color:#06B6D4;box-shadow:0 0 0 3px rgba(6,182,212,0.25);}
.ctrl-select:disabled{background:#f3efe9;color:#94a3b8;cursor:not-allowed;}

.word-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;max-height:320px;overflow-y:auto;padding-right:4px;}
.word-grid::-webkit-scrollbar{width:4px;}
.word-grid::-webkit-scrollbar-thumb{background:#d1c4b0;border-radius:2px;}
.word-card{background:#fff;border:2px solid #0f172a;border-radius:12px;padding:16px 14px;min-height:100px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;cursor:pointer;transition:border-color .15s,box-shadow .15s;text-align:center;}
.word-card:hover{border-color:#0891b2;box-shadow:0 0 0 2px rgba(8,145,178,0.15);}
.word-card--selected{border-color:#0891b2;background:#e0f7fa;box-shadow:0 0 0 3px rgba(8,145,178,0.25);}
.word-display{font-size:1.2rem;font-weight:800;line-height:1.3;color:#000;text-align:center;}
.word-parts{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;}
.part-chip{padding:5px 10px;font-size:0.92rem;font-weight:700;border:2px solid #0f172a;background:#fff;color:#000;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;}

.cg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:100%;margin-top:4px;}
@media(max-width:900px){.cg-grid{grid-template-columns:repeat(3,1fr);}}
@media(max-width:540px){.cg-grid{grid-template-columns:repeat(3,1fr);gap:7px;}}

.wc-card{padding:14px 12px;border:2px solid #0f172a;background:#fff;min-height:88px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border-radius:10px;cursor:pointer;transition:border-color .15s,box-shadow .15s;}
.wc-card:hover{border-color:#0891b2;transform:translateY(-1px);}
.wc-card--selected{border-color:#0891b2;background:#e0f7fa;box-shadow:0 0 0 3px rgba(8,145,178,0.3);}
.wc-mask{font-size:1.3rem;font-weight:800;color:#000;letter-spacing:0.04em;text-align:center;}
.wc-value{font-size:1.4rem;font-weight:800;color:#000;text-align:center;}

.register-sep{display:flex;align-items:center;gap:12px;margin:4px 0 0;}
.register-sep::before,.register-sep::after{content:'';flex:1;height:1px;background:#e2d9cc;}
.register-sep span{font-size:0.75rem;font-weight:600;color:#64748b;white-space:nowrap;text-transform:uppercase;letter-spacing:0.05em;}

.reg-wrap{width:100%;border:1px solid #e2d9cc;border-radius:12px;overflow:hidden;overflow-x:auto;}
.reg-header,.reg-dropdowns{display:grid;grid-template-columns:repeat(5,1fr);min-width:260px;}
.reg-head-cell{min-height:48px;padding:10px 8px;display:flex;align-items:center;justify-content:center;font-size:1.25rem;font-weight:800;color:#000;background:#fff;border:2px solid #0f172a;border-bottom:none;letter-spacing:0.04em;text-align:center;}
.reg-select{padding:14px 0;font-size:1.4rem;font-weight:800;color:#000;background:#fff;border:2px solid #0f172a;min-height:54px;text-align:center;text-align-last:center;appearance:none;-webkit-appearance:none;outline:none;cursor:pointer;transition:background 0.15s;}
.reg-select:focus{background:rgba(6,182,212,0.07);}
.reg-select--disabled{background:#f1f1f1;color:#9ca3af;}

.overlay-bg{position:fixed;inset:0;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;z-index:9000;padding:20px;}
.overlay-card{position:relative;background:#fbf7f0;border:1px solid #e2d9cc;border-radius:20px;padding:36px 32px;max-width:380px;width:100%;display:flex;flex-direction:column;align-items:center;gap:14px;box-shadow:0 20px 60px rgba(15,23,42,0.2);animation:oIn 0.22s ease;}
.overlay-card--wide{max-width:820px;align-items:flex-start;max-height:90vh;overflow-y:auto;}
@keyframes oIn{from{transform:scale(0.94);opacity:0}to{transform:scale(1);opacity:1}}
.overlay-close{position:absolute;top:14px;right:16px;background:none;border:none;font-size:1.1rem;color:#94a3b8;cursor:pointer;}
.overlay-close:hover{color:#0f172a;}
.overlay-eyebrow{font-size:0.72rem;font-weight:600;color:#0891b2;letter-spacing:0.08em;text-transform:uppercase;}
.overlay-title{font-family:'Space Grotesk',sans-serif;font-size:1.2rem;font-weight:800;color:#0f172a;text-align:center;}
.overlay-hint{font-size:0.8rem;color:#64748b;text-align:center;line-height:1.7;}
.overlay-btn{width:100%;padding:12px;border-radius:10px;border:none;background:linear-gradient(135deg,#06B6D4,#0891b2);color:#fff;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:0.94rem;cursor:pointer;}
.overlay-btn:hover{opacity:0.9;}
.overlay-btn:disabled{opacity:0.4;cursor:not-allowed;}

.preview-details{width:100%;background:#fff;border:1px solid #e2d9cc;border-radius:12px;padding:14px 18px;display:flex;flex-direction:column;gap:10px;}
.preview-row{display:flex;gap:14px;font-size:0.88rem;line-height:1.6;align-items:flex-start;}
.preview-key{font-weight:700;color:#475569;min-width:70px;font-size:0.82rem;text-transform:uppercase;letter-spacing:0.04em;padding-top:2px;}
.preview-val{color:#0f172a;display:flex;flex-wrap:wrap;align-items:center;gap:6px;}
.mnemonic-box{width:100%;background:rgba(6,182,212,0.06);border:1.5px solid rgba(6,182,212,0.2);border-radius:14px;padding:18px 20px;display:flex;flex-direction:column;align-items:center;gap:10px;}
.mnemonic-letters{font-size:2.4rem;font-weight:800;color:#0891b2;line-height:1.15;text-align:center;}
.mnemonic-pairs{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;}
.mnemonic-pair{font-size:0.9rem;color:#334155;background:#fff;border:1px solid #e2d9cc;border-radius:8px;padding:5px 14px;}
.mnemonic-pair strong{color:#0891b2;}
.mnemonic-hint{font-size:0.78rem;color:#64748b;text-align:center;line-height:1.7;}
.preview-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:10px;width:100%;}
.preview-item{display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px;border-radius:12px;background:#fff;border:1px solid #e2d9cc;}
.preview-img-wrap{width:80px;height:80px;border-radius:10px;background:#f3efe9;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid #e2d9cc;}
.preview-label{font-size:0.78rem;font-weight:700;color:#0f172a;text-align:center;font-family:'Space Grotesk','Noto Sans Devanagari',sans-serif;}

.btn-primary{width:100%;padding:13px;border-radius:10px;border:none;background:linear-gradient(135deg,#06B6D4,#0891b2);color:#fff;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:0.94rem;cursor:pointer;box-shadow:0 0 18px rgba(6,182,212,0.22);transition:transform 0.18s,box-shadow 0.18s,opacity 0.18s;}
.btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 0 26px rgba(6,182,212,0.36);}
.btn-primary:disabled{opacity:0.36;cursor:not-allowed;box-shadow:none;transform:none;}
.btn-outline{width:100%;padding:12px;border-radius:10px;border:1.5px solid #e2d9cc;background:transparent;color:#475569;font-size:0.9rem;font-weight:500;cursor:pointer;transition:border-color 0.18s,color 0.18s;}
.btn-outline:hover{border-color:#06B6D4;color:#0891b2;}
.btn-outline:disabled{opacity:0.4;cursor:not-allowed;}

.alert-error{padding:11px 14px;border-radius:9px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);color:#dc2626;font-size:0.84rem;line-height:1.5;}

.success-box{display:flex;flex-direction:column;align-items:center;gap:14px;padding:32px 20px;text-align:center;}
.success-check{width:64px;height:64px;border-radius:50%;background:rgba(34,197,94,0.12);border:2px solid rgba(34,197,94,0.3);display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:700;color:#16a34a;}
.success-title{font-family:'Space Grotesk',sans-serif;font-size:1.4rem;font-weight:700;color:#0f172a;}
.success-msg{font-size:0.88rem;color:#64748b;line-height:1.65;max-width:380px;}

.toast-stack{position:fixed;bottom:26px;right:22px;z-index:9999;display:flex;flex-direction:column;gap:8px;align-items:flex-end;}
.toast{display:flex;align-items:center;gap:10px;padding:13px 18px;border-radius:11px;max-width:340px;font-size:0.87rem;font-weight:500;cursor:pointer;box-shadow:0 8px 28px rgba(15,23,42,0.13);animation:slideUp 0.28s ease;}
.toast-icon{font-size:1rem;flex-shrink:0;}
.toast-success{background:#f0fdf4;border:1px solid rgba(34,197,94,0.3);color:#15803d;}
.toast-warning{background:#fffbeb;border:1px solid rgba(245,158,11,0.3);color:#d97706;}
.toast-error{background:#fef2f2;border:1px solid rgba(239,68,68,0.28);color:#dc2626;}
@keyframes slideUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}

.page-footer{text-align:center;margin-top:28px;font-size:0.75rem;color:#94a3b8;position:relative;z-index:1;}
`;
