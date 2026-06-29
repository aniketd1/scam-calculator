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
  const res = await fetch(`${API_BASE}${path}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  return res.json();
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

/* ══════════════════════════════════════════════════════════════
   MAIN AUTH COMPONENT
══════════════════════════════════════════════════════════════ */
export default function Auth() {
  const [mode,     setMode]     = useState("signup");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
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

  // login state
  const [loginStep,       setLoginStep]       = useState("creds");
  const [sessionId,       setSessionId]       = useState("");
  const [challengeGrid,   setChallengeGrid]   = useState([]);
  const [registerLetters, setRegisterLetters] = useState([]);
  const [regInputs,       setRegInputs]       = useState(Array(5).fill(""));
  const [selectedCard,    setSelectedCard]    = useState(null);

  const toastCounter = useRef(0);
  const allFilled    = regInputs.every(v => v !== "");

  /* ── toast helpers ── */
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

  /* ── load words on mount ── */
  useEffect(() => {
    if (isWordpressLogin) return;
    fetch(`${API_BASE}/api/auth/words`)
  .then(r => r.json())
  .then(d => {
      console.log("WORDS", d.words);
      console.log("WORD PAIRS", d.wordPairs);

      if (d.success && Array.isArray(d.words)) {
          setWords(shuffle(d.words));
          setWordPairs(shuffle(d.wordPairs || []));
      }
  });
  }, []);

  /* ── resetAll ── */
  const resetAll = useCallback((m) => {
    setMode(m);
    if (!isWordpressLogin) setEmail("");
    setPassword(""); setError("");
    setSelectedWord(null); setOffset(getRandomOffset()); setLetterPair(getRandomLetterPair());
    setPreview(null);
    setLoginStep("creds"); setSessionId(""); setChallengeGrid([]);
    setRegisterLetters([]); setRegInputs(Array(5).fill("")); setSelectedCard(null);
    if (m === "signup") {
      fetch(`${API_BASE}/api/auth/words`)
        .then(r => r.json())
        .then(d => {
          if (d.success && Array.isArray(d.words)) {
            setWords(shuffle(d.words));
            setWordPairs(shuffle(d.wordPairs || []));
          }
        });
    }
  }, [isWordpressLogin]);

  /* ── passkey registration ── */
  const registerPasskey = async (token) => {
    const optRes = await fetch(`${API_BASE}/api/auth/passkey/register-options`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const optData = await optRes.json();
    if (!optData.success) throw new Error(optData.error || "Could not get passkey options.");
    if (!optData?.options?.challenge) throw new Error("Invalid WebAuthn options received from server.");
    const attestation = await startRegistration({ optionsJSON: optData.options });
    const verRes = await fetch(`${API_BASE}/api/auth/passkey/register-complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ response: attestation }),
    });
    const verData = await verRes.json();
    if (!verData.success) throw new Error(verData.error || "Passkey registration failed.");
    return verData;
  };

  /* ── SIGNUP ── */
  const handleSignup = () => {
    setError("");
    if (!email.trim())       { setError("Please enter your email."); return; }
    if (!password.trim())    { setError("Please enter a password."); return; }
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
        email, password,
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

      const { token } = data;
      localStorage.setItem("token", token);

      try {
        await registerPasskey(token);
        showToast("success", "Passkey saved successfully!");
      } catch (passkeyErr) {
        console.warn("[signup] passkey skipped:", passkeyErr.message);
        showToast("warning", "Account created, but passkey was not saved.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const continueToSignIn = () => {
    resetAll("login");
    showToast("success", "Account created! Please sign in.");
  };

  /* ── PASSKEY LOGIN ── */
  const handlePasskeyLogin = async () => {
    setError(""); setLoading(true);
    try {
      const optRes = await fetch(`${API_BASE}/api/auth/passkey/login-options`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const optData = await optRes.json();
      if (!optData.success) { setError(optData.error || "Passkey login not available."); return; }
      const assertion = await startAuthentication({ optionsJSON: optData.options });
      const verRes = await fetch(`${API_BASE}/api/auth/passkey/login-complete`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, response: assertion }),
      });
      const verData = await verRes.json();
      if (!verData.success) { setError(verData.error || "Passkey authentication failed."); return; }
      setSessionId(verData.sessionId);
      setChallengeGrid(verData.challengeGrid || []);
      setRegisterLetters(verData.registerLetters || []);
      setRegInputs(Array(5).fill(""));
      setLoginStep("grid");
      showToast("success", "Passkey verified — complete the grid.");
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setError("No passkey found for this account. Please sign in with your password.");
      } else {
        setError(err.message || "Passkey login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── LOGIN STEP 1 ── */
  const handleLoginCreds = async () => {
    setError("");
    if (!email.trim()) { setError("Please enter your email."); return; }
    setLoading(true);
    try {
      const data = await postJson("/api/auth/login", { email, password: password || null });
      if (data.success) {
        setSessionId(data.sessionId);
        setChallengeGrid(data.challengeGrid || []);
        setRegisterLetters(data.registerLetters || []);
        setRegInputs(Array(5).fill(""));
        setLoginStep("grid");
        return;
      }
      setError(data.error || "Incorrect credentials.");
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

  /* ── GRID: user taps their card ── */
  const handleCardSelect = (idx) => {
    setSelectedCard(idx);
    setRegInputs(Array(5).fill(""));
  };

  /* ── LOGIN STEP 2+3 combined: verify ── */
  const handleVerify = async () => {
    setError("");
    if (selectedCard === null) { setError("Please select your word card."); return; }
    if (!allFilled)            { setError("Please fill in all 5 positions."); return; }
    setLoading(true);
    try {
      const data = await postJson("/api/auth/verify", {
        sessionId,
        selectedCardIndex: selectedCard,
        registerInputs:    regInputs.map(v => parseInt(v, 10)),
      });
      if (!data.success) {
        setError(data.error || "Verification failed.");
        if (!data.error?.includes("attempt")) {
          setLoginStep("creds"); setChallengeGrid([]); setSessionId(""); setSelectedCard(null);
        }
        return;
      }
      if (data.token) localStorage.setItem("token", data.token);
      const callback = localStorage.getItem("wp_callback");
      if (callback) {
        localStorage.removeItem("wp_callback");
        window.location.href = decodeURIComponent(callback);
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

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
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

            {/* Mnemonic */}
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

            {/* Parts visual */}
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
                    {/* flow toggle */}
                    <div className="flow-toggle">
                      <button className={`flow-btn${isWpFlow ? " flow-btn--active" : ""}`} onClick={() => setIsWpFlow(true)}>WordPress (single word)</button>
                      <button className={`flow-btn${!isWpFlow ? " flow-btn--active" : ""}`} onClick={() => setIsWpFlow(false)}>Regular (two words)</button>
                    </div>

                    <div className="field-row">
                      <div className="field-group">
                        <label className="field-label">Email</label>
                        <input className="field-input" type="email" placeholder="you@example.com"
                          value={email} onChange={e => setEmail(e.target.value)} />
                      </div>
                      <div className="field-group">
                        <label className="field-label">Password</label>
                        <input className="field-input" type="password" placeholder="••••••••"
                          value={password} onChange={e => setPassword(e.target.value)} />
                      </div>
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

                    {/* Word selector */}
                    <p className="section-label">Choose your Visual Password word</p>
                    <p className="section-hint">
                      At login, one unique part of your word will appear — e.g. "Ra _ _".
                      {!isWpFlow && " In Regular mode two words appear together."}
                    </p>

                    <div className="word-grid">
                      {(isWpFlow ? words : wordPairs).map((item, idx) => {
                        // Resolve string pair into full word objects
                        const w0 = isWpFlow ? item : words.find(w => w.word === item[0]);
                        const w1 = isWpFlow ? null : words.find(w => w.word === item[1]);

                        const isSel = isWpFlow
                          ? selectedWord?.word === item.word
                          : selectedWord?.word === `${w0?.word} + ${w1?.word}`;

                        const displayWord = isWpFlow
                          ? item.word
                          : `${w0?.word} + ${w1?.word}`;

                        const displayParts = isWpFlow
                          ? item.parts
                          : [...(w0?.parts || []), ...(w1?.parts || [])];

                        const isDevanagari = isWpFlow
                          ? (item.lang === "hi" || item.lang === "mr")
                          : (w0?.lang === "hi" || w0?.lang === "mr");

                        return (
                          <div
                            key={idx}
                            className={`word-card${isSel ? " word-card--selected" : ""}`}
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                              setSelectedWord(
                                isWpFlow
                                  ? item
                                  : {
                                      word: displayWord,
                                      parts: displayParts,
                                      lang: w0?.lang || "en",
                                    }
                              )
                            }
                            onKeyDown={e =>
                              e.key === "Enter" &&
                              setSelectedWord(
                                isWpFlow
                                  ? item
                                  : {
                                      word: displayWord,
                                      parts: displayParts,
                                      lang: w0?.lang || "en",
                                    }
                              )
                            }
                          >
                            <div
                              className="word-display"
                              style={{
                                fontFamily: isDevanagari
                                  ? "'Noto Sans Devanagari', sans-serif"
                                  : "'Space Grotesk', sans-serif",
                              }}
                            >
                              {displayWord}
                            </div>

                            <div className="word-parts">
                              {displayParts.filter(Boolean).map((p, i) => (
                                <span
                                  key={i}
                                  className="part-chip"
                                  style={{
                                    fontFamily: isDevanagari
                                      ? "'Noto Sans Devanagari', sans-serif"
                                      : "inherit",
                                  }}
                                >
                                  {p}
                                </span>
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
                    {/* Step 1 — creds */}
                    {loginStep === "creds" && !isWordpressLogin && (
                      <div className="form-stack">
                        <div className="step-badge">Step 1 / 2 — Sign in</div>
                        <div className="field-group">
                          <label className="field-label">Email</label>
                          <input className="field-input" type="email" placeholder="you@example.com"
                            value={email} onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleLoginCreds()} />
                        </div>
                        <div className="field-group">
                          <label className="field-label">Password</label>
                          <input className="field-input" type="password" placeholder="••••••••"
                            value={password} onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleLoginCreds()} />
                        </div>
                        <div className="auth-links">
                          <button type="button" className="auth-link" onClick={() => setLoginStep("forgot")}>Forgot password?</button>
                          <button type="button" className="auth-link auth-link--danger" onClick={() => setLoginStep("delete")}>Delete account</button>
                        </div>
                        {error && <div className="alert-error">{error}</div>}
                        <button className="btn-primary" disabled={loading} onClick={handleLoginCreds}>
                          {loading ? "Please wait…" : "Continue →"}
                        </button>
                      </div>
                    )}

                    {/* Forgot password */}
                    {loginStep === "forgot" && (
                      <div className="form-stack">
                        <div className="step-badge">Reset Password</div>
                        <div className="info-box">Enter your email — a reset link will be sent.</div>
                        <input className="field-input" type="email" placeholder="you@example.com"
                          value={email} onChange={e => setEmail(e.target.value)} />
                        {error && <div className="alert-error">{error}</div>}
                        <button className="btn-primary" onClick={async () => {
                          setLoading(true); setError("");
                          try {
                            const data = await postJson("/api/auth/forgot-password", { email });
                            if (!data.success) { setError(data.error || "Could not send reset email."); return; }
                            showToast("success", "Reset link sent — check your inbox.");
                            setLoginStep("creds");
                          } catch { setError("Server error. Please try again."); }
                          finally { setLoading(false); }
                        }}>
                          {loading ? "Sending…" : "Send reset link"}
                        </button>
                        <button className="btn-outline" onClick={() => setLoginStep("creds")}>← Back</button>
                      </div>
                    )}

                    {/* Delete account */}
                    {loginStep === "delete" && (
                      <div className="form-stack">
                        <div className="step-badge">Delete Account</div>
                        <div className="info-box" style={{ borderColor: "rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.05)", color: "#92400e" }}>
                          This action is permanent and cannot be undone.
                        </div>
                        <input className="field-input" type="email" placeholder="Email"
                          value={email} onChange={e => setEmail(e.target.value)} />
                        <input className="field-input" type="password" placeholder="Password"
                          value={password} onChange={e => setPassword(e.target.value)} />
                        {error && <div className="alert-error">{error}</div>}
                        <button className="btn-primary btn-primary--danger" onClick={async () => {
                          setLoading(true); setError("");
                          try {
                            const data = await postJson("/api/auth/delete-user", { email, password });
                            if (!data.success) { setError(data.error || "Could not delete account."); return; }
                            showToast("success", "Your account has been permanently deleted.");
                            resetAll("signup");
                          } catch { setError("Server error. Please try again."); }
                          finally { setLoading(false); }
                        }}>
                          {loading ? "Deleting…" : "Delete my account"}
                        </button>
                        <button className="btn-outline" onClick={() => setLoginStep("creds")}>← Back</button>
                      </div>
                    )}

                    {/* ── Step 2+3 COMBINED: grid + register inline ── */}
                    {loginStep === "grid" && (
                      <div className="form-stack">
                        <div className="step-badge">Step 2 / 2 — Identify your word and enter digits</div>
                        <div className="info-box">
                          <strong>Find your word hint.</strong> Select the card that shows part of your secret word.
                          The number below it is your card value — add your offset to get a 2-digit result,
                          then enter each digit under your two chosen letters.
                        </div>

                        {/* 21-card grid */}
                        <div className="cg-grid">
                          {challengeGrid.length > 0
                            ? challengeGrid.map((item, i) => (
                                <WordCard
                                  key={i}
                                  mask={item.mask}
                                  value={item.value}
                                  selected={selectedCard === i}
                                  onClick={() => handleCardSelect(i)}
                                />
                              ))
                            : <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#dc2626", padding: 40 }}>
                                Grid not found — please start over.
                              </div>
                          }
                        </div>

                        {/* Register bar immediately below grid */}
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
                          disabled={loading || selectedCard === null || !allFilled}
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

/* ══════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════ */
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

.flow-toggle{display:flex;gap:6px;background:#f3efe9;border-radius:99px;padding:4px;}
.flow-btn{flex:1;padding:7px 14px;border-radius:99px;background:transparent;border:none;font-size:0.82rem;font-weight:500;color:#475569;cursor:pointer;transition:all 0.18s;}
.flow-btn--active{background:#fff;color:#0891b2;font-weight:700;box-shadow:0 1px 4px rgba(15,23,42,0.08);}

.step-badge{padding:9px 14px;border-radius:9px;background:rgba(6,182,212,0.07);border:1px solid rgba(6,182,212,0.15);font-size:0.83rem;color:#0891b2;font-weight:600;}
.info-box{padding:13px 16px;border-radius:11px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);font-size:0.84rem;color:#92400e;line-height:1.65;}
.info-box strong{font-weight:700;color:#78350f;}

.form-stack{display:flex;flex-direction:column;gap:16px;}
.field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
@media(max-width:540px){.field-row{grid-template-columns:1fr;}}
.field-group{display:flex;flex-direction:column;gap:5px;}
.field-label{font-size:0.73rem;font-weight:600;color:#475569;letter-spacing:0.05em;text-transform:uppercase;}
.field-input{width:100%;padding:11px 13px;border-radius:10px;border:1.5px solid #e2d9cc;background:#fff;font-size:0.91rem;color:#0f172a;outline:none;transition:border-color 0.18s,box-shadow 0.18s;}
.field-input:focus{border-color:#06B6D4;box-shadow:0 0 0 3px rgba(6,182,212,0.1);}
.field-input::placeholder{color:#94a3b8;}

.offset-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.letter-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:4px;}
.ctrl-offset{width:64px;padding:9px 10px;border-radius:8px;border:1.5px solid #e2d9cc;background:#fff;font-family:'Space Grotesk',sans-serif;font-size:1.2rem;font-weight:800;color:#0f172a;text-align:center;outline:none;}
.ctrl-offset:focus{border-color:#06B6D4;}
.ctrl-select{padding:8px 12px;border-radius:8px;border:1.5px solid #e2d9cc;background:#fff;font-family:'Space Grotesk',sans-serif;font-size:0.95rem;font-weight:700;color:#0f172a;cursor:pointer;outline:none;}
.ctrl-select:focus{border-color:#06B6D4;}
.ctrl-select:disabled{background:#f3efe9;color:#94a3b8;cursor:not-allowed;}
.ctrl-plus{font-family:'Space Grotesk',sans-serif;font-weight:800;color:#06B6D4;font-size:1.2rem;}
.ctrl-hint{font-size:0.75rem;color:#94a3b8;line-height:1.5;}
.section-label{font-size:0.73rem;font-weight:700;color:#475569;letter-spacing:0.06em;text-transform:uppercase;}
.section-hint{font-size:0.79rem;color:#94a3b8;line-height:1.6;}

.word-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;max-height:320px;overflow-y:auto;padding-right:4px;}
.word-grid::-webkit-scrollbar{width:4px;}
.word-grid::-webkit-scrollbar-thumb{background:#d1c4b0;border-radius:2px;}
.word-card{padding:12px 14px;border-radius:12px;background:#fff;border:1.5px solid #e2d9cc;cursor:pointer;text-align:left;transition:border-color 0.16s,box-shadow 0.16s,transform 0.14s;}
.word-card:hover{border-color:rgba(6,182,212,0.4);transform:translateY(-1px);}
.word-card--selected{border-color:#06B6D4;background:rgba(6,182,212,0.04);box-shadow:0 0 0 3px rgba(6,182,212,0.1);}
.word-display{font-family:'Space Grotesk',sans-serif;font-size:1rem;font-weight:700;color:#0f172a;margin-bottom:6px;}
.word-parts{display:flex;flex-wrap:wrap;gap:4px;}
.part-chip{padding:3px 7px;border-radius:99px;background:rgba(6,182,212,0.08);color:#0891b2;font-size:0.72rem;font-weight:600;border:1px solid rgba(6,182,212,0.15);}

.cg-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;width:100%;margin-top:4px;}
@media(max-width:900px){.cg-grid{grid-template-columns:repeat(3,1fr);}}
@media(max-width:540px){.cg-grid{grid-template-columns:repeat(3,1fr);gap:7px;}}

.wc-card{background:#fff;border:1.5px solid #e2d9cc;border-radius:12px;padding:14px 10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:border-color 0.16s,box-shadow 0.16s,transform 0.14s;min-height:80px;}
.wc-card:hover{border-color:rgba(6,182,212,0.4);transform:translateY(-1px);}
.wc-card--selected{border-color:#06B6D4;background:rgba(6,182,212,0.06);box-shadow:0 0 0 3px rgba(6,182,212,0.15);}
.wc-mask{font-family:'Space Grotesk','Noto Sans Devanagari',sans-serif;font-size:1.05rem;font-weight:800;color:#0f172a;text-align:center;letter-spacing:0.04em;line-height:1.2;}
.wc-value{font-family:'Space Grotesk',sans-serif;font-size:1.2rem;font-weight:800;color:#0891b2;}

.register-sep{display:flex;align-items:center;gap:12px;margin:4px 0 0;}
.register-sep::before,.register-sep::after{content:'';flex:1;height:1px;background:#e2d9cc;}
.register-sep span{font-size:0.75rem;font-weight:600;color:#64748b;white-space:nowrap;text-transform:uppercase;letter-spacing:0.05em;}

.reg-wrap{width:100%;border:1px solid #e2d9cc;border-radius:12px;overflow:hidden;overflow-x:auto;}
.reg-header,.reg-dropdowns{display:grid;grid-template-columns:repeat(5,1fr);min-width:260px;}
.reg-head-cell{height:36px;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-size:0.78rem;font-weight:800;color:#0891b2;background:#f3efe9;border-bottom:1px solid #e2d9cc;letter-spacing:0.04em;}
.reg-select{border:none;border-right:1px solid #e2d9cc;border-top:1px solid #e2d9cc;padding:10px 0;text-align:center;font-family:'Space Grotesk',sans-serif;font-size:1rem;font-weight:700;color:#0f172a;background:#fff;outline:none;cursor:pointer;appearance:none;-webkit-appearance:none;text-align-last:center;transition:background 0.15s;}
.reg-select:last-child{border-right:none;}
.reg-select:focus{background:rgba(6,182,212,0.07);}
.reg-select--disabled{background:#f3efe9;color:#cbd5e1;cursor:not-allowed;}

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
.btn-primary--danger{background:linear-gradient(135deg,#ef4444,#dc2626);box-shadow:0 0 18px rgba(239,68,68,0.2);}
.btn-outline{width:100%;padding:12px;border-radius:10px;border:1.5px solid #e2d9cc;background:transparent;color:#475569;font-size:0.9rem;font-weight:500;cursor:pointer;transition:border-color 0.18s,color 0.18s;}
.btn-outline:hover{border-color:#06B6D4;color:#0891b2;}
.btn-outline:disabled{opacity:0.4;cursor:not-allowed;}

.alert-error{padding:11px 14px;border-radius:9px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);color:#dc2626;font-size:0.84rem;line-height:1.5;}
.auth-links{display:flex;justify-content:space-between;margin-top:6px;gap:10px;}
.auth-link{background:none;border:none;font-size:0.78rem;color:#0891b2;font-weight:600;cursor:pointer;padding:2px 0;}
.auth-link:hover{text-decoration:underline;}
.auth-link--danger{color:#dc2626;}

.passkey-spinner{width:44px;height:44px;border-radius:50%;border:3px solid #e2d9cc;border-top-color:#06B6D4;animation:spin 0.8s linear infinite;margin:0 auto;}
@keyframes spin{to{transform:rotate(360deg)}}
.passkey-icon{font-size:2.4rem;line-height:1;}

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