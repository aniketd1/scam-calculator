import { useState, useCallback, useRef, useEffect } from "react";
import { SENTENCES } from "../../../server/data/sentences";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

/* ── ASSET MAP ─────────────────────────────────────────────── */
const _nounGlob = import.meta.glob("../assets/nouns/*.png", { eager: true });
const _fileMap = {};
for (const [fullPath, module] of Object.entries(_nounGlob)) {
  const stem = fullPath.split("/").pop().replace(/\.png$/i, "").toLowerCase();
  _fileMap[stem] = module.default;
}

// Every key here must exactly match a word that can appear in the sentences
const NOUN_STEM = {
  // people
  boy:"boy", girl:"girl", dog:"dog", monkey:"monkey", farmer:"farmer",
  teacher:"teacher", child:"child", bird:"bird", baby:"baby", cat:"cat",
  driver:"driver", chef:"chef", rabbit:"rabbit",
  ball:"ball", park:"park", bag:"bag", apple:"apple", water:"water",
  book:"book", banana:"banana", tree:"tree", tractor:"tractor", field:"field",
  crops:"crops", bicycle:"bicycle", playground:"playground", worm:"worm",
  nest:"nest", toy:"toy", balloon:"balloon", box:"box", pencil:"pencil",
  basket:"basket", flower:"flower", mouse:"mouse", chair:"chair", bus:"bus",
  school:"school", carrot:"carrot", food:"food", kite:"kite", sky:"sky",
  plant:"plant", pot:"pot", door:"door", car:"car", bucket:"bucket",
  table:"table", log:"log", board:"board",
  doctor:"doctor", laptop:"laptop", mobile:"mobile", hospital:"hospital",
  house:"house", train:"train", mountain:"mountain", ocean:"ocean",
  river:"river", rose:"rose", eye:"eye", ear:"ear", hand:"hand",
  stick:"stick",
  doll:"doll",
  dress:"dress",
  bone:"bone",
  rattle:"rattle",
  seed:"seed",
  road:"road",
  market:"market",
  burrow:"burrow",
  wall:"wall",
  clouds:"clouds",
  letter:"letter",
  paper:"paper",
  spoon:"spoon",
  cup:"cup",
  blocks:"blocks",
  model:"model",
  kitchen:"kitchen",
  star:"star",
  eggs:"eggs",
  clouds:"clouds"
};

/* ── CONSTANTS ─────────────────────────────────────────────── */
const POSITIONS = ["A", "B", "C", "D", "E"];
const DIGITS    = ["0","1","2","3","4","5","6","7","8","9"];

// ── NOUN SET — every concrete noun that appears in the sentences ────────────
// These are the EXACT words as they appear in the sentence text.
// No stemming, no pluralisation — just a direct lookup.
const NOUN_WORDS = new Set([
  // people / animals
  "boy","girl","dog","cat","bird","monkey","farmer","teacher",
  "child","children","baby","rabbit","driver","chef",
  // body / clothing
  "dress","doll",
  // objects
  "ball","toy","bone","stick","milk","mouse","nest","eggs",
  "rope","banana","tree","crops","tractor","chart","book","lesson",
  "house","flower","picture","rattle","bicycle","bell","park",
  "rose","basket","carrot","log","burrow","vegetables","dinner",
  "car","road","market","door","room","bag","box","kite","clouds",
  "field","letter","paper","seed","babies","bucket","garden",
  "question","answer","star","spoon","cup","tower","blocks",
  "model","table","kitchen","plant","soil","flowers","bus",
  // keep legacy nouns so old sentences still work
  "apple","water","bag","banana","tractor","field",
  "playground","worm","food","sky","pot","school",
  "doctor","laptop","mobile","hospital","hospital",
  "train","mountain","ocean","river","eye","ear","hand",
  "stick","doll","bone","rattle","seed","wall",
]);

// Noun → display name mapping (same word, no transformation needed)
// Only override when the PNG filename differs from the noun word.
// For nouns not listed here, getNounImage falls back to the word itself.
const NOUN_STEM_OVERRIDE = {
  children: "child",    // PNG is child.png
  babies:   "baby",     // PNG is baby.png
  flowers:  "flower",
};

// Updated getNounImage — checks override map first, then exact stem
function getNounImage(noun) {
  if (!noun) return null;
  const key  = noun.toLowerCase();
  const stem = NOUN_STEM_OVERRIDE[key] ?? key;
  // NOUN_STEM is your existing filename map — keep it unchanged
  const file = NOUN_STEM[stem] ?? stem;
  return _fileMap[file] ?? _fileMap[file.replace(/\s+/g, "")] ?? null;
}

// extractNouns — EXACT word match only, no stemming whatsoever
function extractNouns(s) {
  return [
    ...new Set(
      s
        .toLowerCase()
        .replace(/[^a-z\s]/g, " ")   // strip punctuation
        .split(/\s+/)
        .filter(w => w && NOUN_WORDS.has(w))  // exact match
    ),
  ];
}

// Build mnemonic from nouns: ["doctor","apple","car","park"] → "DACP"
function buildMnemonic(nouns) {
  return nouns.map(n => n[0].toUpperCase()).join("");
}

function shuffle(a) {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
function getRandomOffset() { return String(Math.floor(Math.random() * 10)); } // 0–9
function getRandomPositions() { const s = shuffle([...POSITIONS]); return [s[0], s[1]]; }

/* ── API ───────────────────────────────────────────────────── */
async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

/* ── GRID CARD ─────────────────────────────────────────────── */
function GridCard({ noun, value }) {
  const img = getNounImage(noun);
  return (
    <div className="gc-card">
      <div className="gc-img-wrap">
        {img
          ? <img src={img} alt={noun} className="gc-img" />
          : <div className="gc-fallback">{noun?.[0]?.toUpperCase()}</div>}
      </div>
      <div className="gc-noun">{noun}</div>
      <div className="gc-value">{value}</div>
    </div>
  );
}

/* ── REGISTER DROPDOWN BAR A–E ─────────────────────────────── */
// Sequential: position i is disabled until position i-1 is filled.
// Each digit may appear at most twice total.
function RegisterDropdownBar({ inputs, onChange }) {
  const digitCount = {};
  for (const v of inputs) if (v !== "") digitCount[v] = (digitCount[v] || 0) + 1;

  return (
    <div className="reg-wrap">
      <div className="reg-header">
        {POSITIONS.map(p => <div key={p} className="reg-head-cell">{p}</div>)}
      </div>
      <div className="reg-dropdowns">
        {POSITIONS.map((p, i) => {
          const current    = inputs[i];
          // Sequential: disabled until all previous positions are filled
          const isDisabled = i > 0 && inputs[i - 1] === "";
          return (
            <select
              key={p}
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

/* ── TOAST ─────────────────────────────────────────────────── */
function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.type}`} onClick={onClose}>
      <span>{toast.type === "success" ? "✓" : "✕"}</span>
      <span>{toast.message}</span>
    </div>
  );
}

/* ── MAIN ──────────────────────────────────────────────────── */
export default function Auth() {
  const [mode,      setMode]      = useState("signup");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [toast,     setToast]     = useState(null);
  const [wordpressSite,setWordpressSite] = useState("");
  const [wordpressUsername,setWordpressUsername] = useState("");
  const [isWordpressLogin, setIsWordpressLogin] = useState(false);

  // signup
  const [sentence,  setSentence]  = useState("");
  const [offset,    setOffset]    = useState(getRandomOffset);
  const [positions, setPositions] = useState(getRandomPositions);
  const [preview,   setPreview]   = useState(null);

  const [shuffled, setShuffled] = useState([]);
//p
 useEffect(() => {

    const params =
        new URLSearchParams(window.location.search);

    const email =
        params.get("email");

    const site =
        params.get("site");

    const username =
        params.get("username");

    if(email)
        setEmail(email);

    if(site)
        setWordpressSite(site);

    if(username)
        setWordpressUsername(username);

    if(site && username){
        setIsWordpressLogin(true);
    }

}, []);

useEffect(() => {

    if(
        isWordpressLogin &&
        wordpressSite &&
        wordpressUsername
    ){
        handleWordpressLogin();
    }

}, [
    isWordpressLogin,
    wordpressSite,
    wordpressUsername
]);
  
  useEffect(() => {
    fetch(`${API_BASE}/api/auth/sentences`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setShuffled(shuffle(data.sentences));
        }
      })
      .catch(err => {
        console.error("Failed to load sentences", err);
      });
  }, []);

  // login
  const [loginStep,     setLoginStep]     = useState("creds");
  const [sessionId,     setSessionId]     = useState("");
  const [challengeGrid, setChallengeGrid] = useState([]);
  const [serverRegister,setServerRegister]= useState(null);
  const [regInputs,     setRegInputs]     = useState(Array(5).fill(""));

  const registerRef  = useRef(null);
  const createBtnRef = useRef(null);
  const allFilled    = regInputs.every(v => v !== "");

  const showToast = (type, msg) => {
    setToast({ type, message: msg });
    setTimeout(() => setToast(null), 4500);
  };

  const resetAll = useCallback((m) => {
    setMode(m); setEmail(""); setPassword(""); setError(""); setToast(null);
    setSentence(""); setOffset(getRandomOffset()); setPositions(getRandomPositions());
    setPreview(null);
    setLoginStep("creds"); setSessionId(""); setChallengeGrid([]);
    setServerRegister(null); setRegInputs(Array(5).fill(""));
    if (m === "signup") {
      fetch(`${API_BASE}/api/auth/sentences`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setShuffled(shuffle(data.sentences));
        });
    }
  }, []);

  // Position 0 change resets position 1
  const setPos = (slot, val) => {
    setPositions(prev => {
      const next = [...prev];
      next[slot] = val;
      if (slot === 0) next[1] = "";
      return next;
    });
  };

  /* ── SIGNUP ── */
  const handleSignup = () => {
    setError("");
    if (!email.trim())            { setError("Enter your email."); return; }
    if (!password.trim())         { setError("Enter a password."); return; }
    if (!sentence)                { setError("Select a sentence."); return; }
    if (!positions[0] || !positions[1]) { setError("Select both positions."); return; }
    if (positions[0] === positions[1])  { setError("Positions must be different."); return; }
    const off = parseInt(offset, 10);
    if (isNaN(off) || off < 0 || off > 99) { setError("Offset must be 0–99."); return; }
    setPreview({ sentence, nouns: extractNouns(sentence) });
  };

  const confirmSignup = async () => {
    setPreview(null); setLoading(true); setError("");
    try {
      const data = await postJson("/api/auth/signup", {
        email, password, wordpressSite, wordpressUsername, selectedSentence: sentence,
        secretPositions: positions, offset: parseInt(offset, 10),
      });
      if (!data.success) { setError(data.error || "Could not create account."); return; }
      if (data.token) localStorage.setItem("token", data.token);
      showToast("success", "Account created! Sign in now.");
      resetAll("login");
    } catch { setError("Server error. Try again."); }
    finally { setLoading(false); }
  };

  /* ── LOGIN STEP 1 ── */
  const handleLoginCreds = async () => {
    setError("");
    if (!email.trim() || !password.trim()) { setError("Enter email and password."); return; }
    setLoading(true);
    try {
      const data = await postJson("/api/auth/login", { email, password });
      if (!data.success) { setError(data.error || "Invalid credentials."); return; }
      setSessionId(data.sessionId);
      setChallengeGrid(data.challengeGrid || []);
      setRegInputs(Array(5).fill(""));
      setLoginStep("grid");
    } catch { setError("Server error. Try again."); }
    finally { setLoading(false); }
  };
    const handleWordpressLogin = async () => {

    try {

        setLoading(true);

        const data =
            await postJson(
                "/api/auth/wordpress-login",
                {
                    wordpressSite,
                    wordpressUsername
                }
            );

        if(!data.success){
            setError(
                data.error ||
                "No Visual Password account found."
            );
            return;
        }

        setSessionId(data.sessionId);

        setChallengeGrid(
            data.challengeGrid || []
        );

        setRegInputs(
            Array(5).fill("")
        );

        setLoginStep("grid");

    }
    catch(err){

        console.error(err);

        setError(
            "WordPress login failed."
        );

    }
    finally{

        setLoading(false);

    }

};
  /* ── LOGIN STEP 2 ── */
  const handleContinueToRegister = async () => {
    setError(""); setLoading(true);
    try {
      const data = await postJson("/api/auth/register", { sessionId });
      if (!data.success) {
        setError(data.error || "Could not build register.");
        setLoginStep("creds"); return;
      }
      setServerRegister(data.register);
      setRegInputs(Array(5).fill(""));
      setLoginStep("register");
      setTimeout(() => registerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    } catch { setError("Server error. Try again."); }
    finally { setLoading(false); }
  };

  /* ── LOGIN STEP 3 ── */
  const handleVerify = async () => {
    setError("");
    if (!allFilled) { setError("Fill all 5 positions (A–E)."); return; }
    setLoading(true);
    try {
      const data = await postJson("/api/auth/verify", {
        sessionId,
        registerInputs: regInputs.map(v => parseInt(v, 10)),
      });
      if (!data.success) {
        setError(data.error || "Verification failed.");
        if (!data.error?.includes("attempt")) {
          setLoginStep("creds"); setChallengeGrid([]); setSessionId(""); setServerRegister(null);
        }
        return;
      }
      if (data.token) localStorage.setItem("token", data.token);
      showToast("success", data.message || "Identity verified. Welcome back!");
      const params = new URLSearchParams(window.location.search);

const callback = params.get("callback");

if (callback) {
  setTimeout(() => {
    window.location.href = decodeURIComponent(callback);
  }, 1000);
} else {
  setLoginStep("success");
}
    } catch { setError("Server error. Try again."); }
    finally { setLoading(false); }
  };

  /* ── RENDER ── */
  return (
    <>
      <style>{CSS}</style>
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ── SIGNUP PREVIEW OVERLAY with Mnemonics ── */}
      {preview && (() => {
        const nouns    = preview.nouns;
        const mnemonic = buildMnemonic(nouns); // e.g. "DACP"
        return (
          <div className="overlay-bg" onClick={e => { if (e.target === e.currentTarget) setPreview(null); }}>
            <div className="overlay-card overlay-card--wide">
              <button className="overlay-close" onClick={() => setPreview(null)}>✕</button>
              <p className="overlay-eyebrow">Confirm your setup</p>
              <h2 className="overlay-title">Review before creating account</h2>

              {/* Details */}
              <div className="preview-details">
                <div className="preview-row"><span className="preview-key">Sentence</span><span className="preview-val">{preview.sentence}</span></div>
                <div className="preview-row"><span className="preview-key">Offset</span><span className="preview-val">{offset}</span></div>
                <div className="preview-row"><span className="preview-key">Positions</span><span className="preview-val">{positions[0]} &amp; {positions[1]}</span></div>
              </div>

              {/* Mnemonic */}
              {nouns.length > 0 && (
                <div className="mnemonic-box">
                  <div className="mnemonic-letters">{mnemonic}</div>
                  <div className="mnemonic-pairs">
                    {nouns.map(n => (
                      <span key={n} className="mnemonic-pair">
                        <strong>{n[0].toUpperCase()}</strong> = {n}
                      </span>
                    ))}
                  </div>
                  <p className="mnemonic-hint">Use this code to remember your sentence's key objects.</p>
                </div>
              )}

              {/* Images */}
              <div className="preview-grid">
                {nouns.map(n => {
                  const img = getNounImage(n);
                  return (
                    <div key={n} className="preview-item">
                      <div className="preview-img-wrap">
                        {img
                          ? <img src={img} alt={n} className="preview-img" />
                          : <div className="preview-fallback">{n[0].toUpperCase()}</div>}
                      </div>
                      <div className="preview-label">{n}</div>
                    </div>
                  );
                })}
              </div>

              <p className="overlay-hint">Memorise your offset and positions — they are never shown again.</p>
              <button className="overlay-btn" disabled={loading} onClick={confirmSignup}>
                {loading ? "Creating…" : "Confirm & create account"}
              </button>
            </div>
          </div>
        );
      })()}

      <div className="auth-page">
        <header className="auth-hero">
          <p className="hero-eyebrow">Visual Sentence Password</p>
          <h1 className="hero-title">Sign in with your <span className="hero-accent">Visual Sentence</span></h1>
          <p className="hero-sub">Pick a sentence, a private offset, and two secret positions (A–E). At login: spot your image, add your offset, enter the two digits at your positions. Any order is fine.</p>
        </header>

        <div className="auth-shell">
          <div className="auth-card">

            {/* SUCCESS */}
            {loginStep === "success" && (
              <div className="success-box">
                <div className="success-check">✓</div>
                <h2 className="success-title">Identity Verified</h2>
                <p className="success-msg">Your visual sentence login succeeded. Welcome back!</p>
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
                    <div className="field-row">
                      <div className="field-group">
                        <label className="field-label">Email address</label>
                        <input className="field-input" type="email" placeholder="you@example.com"
                          value={email} onChange={e => setEmail(e.target.value)} />
                      </div>
                      <div className="field-group">
                        <label className="field-label">Password</label>
                        <input className="field-input" type="password" placeholder="••••••••"
                          value={password} onChange={e => setPassword(e.target.value)} />
                      </div>
                    </div>

                    <p className="section-label">Choose your visual password sentence</p>
                    <p className="section-hint">One noun from your sentence appears in the login grid. Find it, add your offset, enter the digits at your two positions.</p>

                    <div className="sentence-list">
                      {shuffled.map(s => {
                        const ns    = extractNouns(s);
                        const isSel = sentence === s;
                        return (
                          <div
                            key={s}
                            role="button"
                            tabIndex={0}
                            className={`sentence-card${isSel ? " sentence-card--selected" : ""}`}
                            onClick={() => {
                              setSentence(s);
                              setTimeout(() => createBtnRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 120);
                            }}
                            onKeyDown={e => e.key === "Enter" && setSentence(s)}
                          >
                            <div className="sentence-text">{s}</div>
                            <div className="noun-chips">{ns.map(n => <span key={n} className="noun-chip">{n}</span>)}</div>

                            {isSel && (
                              <div className="card-controls" onClick={e => e.stopPropagation()}>
                                {/* Offset */}
                                <div className="control-row">
                                  <label className="ctrl-label">Offset</label>
                                  <input className="ctrl-offset" type="text" inputMode="numeric" maxLength={2}
                                    value={offset}
                                    onChange={e => setOffset(e.target.value.replace(/\D/, "").slice(0, 2))} />
                                  <span className="ctrl-hint">0 – 99</span>
                                </div>
                                {/* Positions */}
                                <div className="control-row">
                                  <label className="ctrl-label">Positions</label>
                                  <select className="ctrl-select" value={positions[0]} onChange={e => setPos(0, e.target.value)}>
                                    <option value="">Select</option>
                                    {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                  </select>
                                  <span className="ctrl-plus">+</span>
                                  <select className="ctrl-select" value={positions[1]}
                                    disabled={!positions[0]}
                                    onChange={e => setPos(1, e.target.value)}>
                                    <option value="">Select</option>
                                    {POSITIONS.filter(p => p !== positions[0]).map(p => (
                                      <option key={p} value={p}>{p}</option>
                                    ))}
                                  </select>
                                  <span className="ctrl-hint">A–E · digits of ({offset || 0} + image value)</span>
                                </div>
                                {/* Inline Create Account button on selected card */}
                                <button
                                  className="btn-primary"
                                  style={{ marginTop: 10 }}
                                  onClick={e => { e.stopPropagation(); handleSignup(); }}
                                >
                                  Review & Create Account →
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {error && <div className="alert-error">{error}</div>}

                    {/* Bottom button — always visible */}
                    <button ref={createBtnRef} className="btn-primary" disabled={loading} onClick={handleSignup}>
                      {loading ? "Creating account…" : "Review & Create Account"}
                    </button>
                  </div>
                )}

                {/* ══ LOGIN ══ */}
                {mode === "login" && (
                  <>
                    {/* Step 1 */}
                    {loginStep === "creds" && !isWordpressLogin && (
                      <div className="form-stack">
                        <div className="step-badge">Step 1 of 3 — Credentials</div>
                        <div className="field-group">
                          <label className="field-label">Email address</label>
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
                        {error && <div className="alert-error">{error}</div>}
                        <button className="btn-primary" disabled={loading} onClick={handleLoginCreds}>
                          {loading ? "Please wait…" : "Next →"}
                        </button>
                      </div>
                    )}

                    {/* Step 2 — grid */}
                    {loginStep === "grid" && (
                      <div className="form-stack">
                        <div className="step-badge">Step 2 of 3 — Find your secret image</div>
                        <div className="info-box">
                          <strong>Look for your image.</strong> One noun from your sentence is hidden here.
                          Note its number, then click Continue.
                        </div>
                        <div className="cg-grid">
                          {challengeGrid.length > 0
                            ? challengeGrid.map((item, i) => <GridCard key={i} noun={item.noun} value={item.value} />)
                            : <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#dc2626", padding: 40 }}>No grid received — start over.</div>
                          }
                        </div>
                        {error && <div className="alert-error">{error}</div>}
                        <button className="btn-primary" disabled={loading} onClick={handleContinueToRegister}>
                          {loading ? "Building register…" : "I've found my image →"}
                        </button>
                        <button className="btn-outline" onClick={() => resetAll("login")}>← Start over</button>
                      </div>
                    )}

                    {/* Step 3 — register */}
                    {loginStep === "register" && (
                      <div className="form-stack" ref={registerRef}>
                        <div className="step-badge">Step 3 of 3 — Fill positions A–E</div>
                        <div className="info-box">
                          <strong>Fill sequentially A → B → C → D → E.</strong> At your two secret positions
                          enter the digits of your result (image value + offset) in <em>any order</em>.
                          Fill other positions with any digit. Max 3 attempts.
                        </div>
                        <RegisterDropdownBar
                          inputs={regInputs}
                          onChange={(i, v) => setRegInputs(p => { const n = [...p]; n[i] = v; return n; })}
                        />
                        <p className="field-hint">
                          Example: result = 52, positions A &amp; D → enter 5 at A and 2 at D, or 2 at A and 5 at D — both work.
                        </p>
                        {error && <div className="alert-error">{error}</div>}
                        <button className="btn-primary" disabled={loading || !allFilled} onClick={handleVerify}>
                          {loading ? "Verifying…" : "Verify →"}
                        </button>
                        <button className="btn-outline" onClick={() => setLoginStep("grid")}>← Back to grid</button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <p className="page-footer">ScamRisk — Sentence Password is phishing-resistant. Your secret never leaves this device.</p>
      </div>
    </>
  );
}

/* ── STYLES ─────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}button,input,select{font-family:inherit;}
.auth-page{min-height:100vh;background:#f7efe6;color:#0f172a;font-family:'Inter',sans-serif;padding:48px 20px 72px;position:relative;overflow:hidden;}
.auth-page::before{content:'';position:fixed;top:-140px;right:-140px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(6,182,212,0.06) 0%,transparent 70%);pointer-events:none;z-index:0;}
.auth-hero{text-align:center;max-width:680px;margin:0 auto 36px;position:relative;z-index:1;}
.hero-eyebrow{display:inline-block;padding:4px 14px;border-radius:99px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);font-size:0.72rem;font-weight:600;color:#d97706;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;}
.hero-title{font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:clamp(1.6rem,3.2vw,2.4rem);letter-spacing:-0.04em;line-height:1.12;color:#0f172a;margin-bottom:10px;}
.hero-accent{color:#06B6D4;}
.hero-sub{font-size:0.88rem;color:#64748b;line-height:1.7;}
.auth-shell{max-width:920px;margin:0 auto;position:relative;z-index:1;}
.auth-card{background:#fbf7f0;border:1px solid #e2d9cc;border-radius:20px;padding:36px 40px;display:flex;flex-direction:column;gap:20px;box-shadow:0 4px 28px rgba(15,23,42,0.06);}
@media(max-width:600px){.auth-card{padding:24px 18px;}}
.mode-tabs{display:flex;gap:8px;}
.mode-tab{flex:1;padding:11px;border-radius:99px;background:#fff;border:1.5px solid #e2d9cc;color:#475569;font-size:0.9rem;font-weight:500;cursor:pointer;transition:all 0.18s;}
.mode-tab:hover{border-color:rgba(6,182,212,0.4);color:#0891b2;}
.mode-tab--active{background:linear-gradient(135deg,#06B6D4,#0891b2);color:#fff;border-color:transparent;font-weight:700;}
.step-badge{padding:9px 14px;border-radius:9px;background:rgba(6,182,212,0.07);border:1px solid rgba(6,182,212,0.15);font-size:0.83rem;color:#0891b2;font-weight:600;}
.info-box{padding:13px 16px;border-radius:11px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);font-size:0.84rem;color:#92400e;line-height:1.65;}
.info-box strong{font-weight:700;color:#78350f;}
.form-stack{display:flex;flex-direction:column;gap:16px;}
.field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
@media(max-width:540px){.field-row{grid-template-columns:1fr;}}
.field-group{display:flex;flex-direction:column;gap:5px;}
.field-label{font-size:0.73rem;font-weight:600;color:#475569;letter-spacing:0.05em;text-transform:uppercase;}
.field-hint{font-size:0.79rem;color:#94a3b8;line-height:1.6;}
.field-input{width:100%;padding:11px 13px;border-radius:10px;border:1.5px solid #e2d9cc;background:#fff;font-size:0.91rem;color:#0f172a;outline:none;transition:border-color 0.18s,box-shadow 0.18s;}
.field-input:focus{border-color:#06B6D4;box-shadow:0 0 0 3px rgba(6,182,212,0.1);}
.field-input::placeholder{color:#94a3b8;}
.section-label{font-size:0.73rem;font-weight:700;color:#475569;letter-spacing:0.06em;text-transform:uppercase;}
.section-hint{font-size:0.79rem;color:#94a3b8;line-height:1.6;margin-top:4px;margin-bottom:10px;}
.sentence-list{display:flex;flex-direction:column;gap:8px;max-height:380px;overflow-y:auto;padding-right:4px;}
.sentence-list::-webkit-scrollbar{width:4px;}
.sentence-list::-webkit-scrollbar-thumb{background:#d1c4b0;border-radius:2px;}
.sentence-card{width:100%;padding:13px 16px;border-radius:12px;background:#fff;border:1.5px solid #e2d9cc;cursor:pointer;text-align:left;transition:border-color 0.16s,box-shadow 0.16s,transform 0.14s;}
.sentence-card:hover{border-color:rgba(6,182,212,0.4);transform:translateY(-1px);}
.sentence-card--selected{border-color:#06B6D4;background:rgba(6,182,212,0.04);box-shadow:0 0 0 3px rgba(6,182,212,0.1);}
.sentence-text{font-size:0.87rem;color:#334155;line-height:1.55;}
.noun-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px;}
.noun-chip{padding:4px 8px;border-radius:999px;background:rgba(15,23,42,0.05);color:#475569;font-size:0.72rem;font-weight:600;text-transform:capitalize;}
.card-controls{margin-top:12px;padding-top:12px;border-top:1px dashed rgba(6,182,212,0.25);display:flex;flex-direction:column;gap:10px;}
.control-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.ctrl-label{font-size:0.73rem;font-weight:700;color:#475569;letter-spacing:0.05em;text-transform:uppercase;white-space:nowrap;width:60px;}
.ctrl-offset{width:60px;padding:7px 10px;border-radius:8px;border:1.5px solid #e2d9cc;background:#fff;font-family:'Space Grotesk',sans-serif;font-size:1.1rem;font-weight:800;color:#0f172a;text-align:center;outline:none;}
.ctrl-offset:focus{border-color:#06B6D4;}
.ctrl-select{padding:7px 10px;border-radius:8px;border:1.5px solid #e2d9cc;background:#fff;font-family:'Space Grotesk',sans-serif;font-size:0.9rem;font-weight:700;color:#0f172a;cursor:pointer;outline:none;}
.ctrl-select:focus{border-color:#06B6D4;}
.ctrl-select:disabled{background:#f3efe9;color:#94a3b8;cursor:not-allowed;}
.ctrl-plus{font-family:'Space Grotesk',sans-serif;font-weight:800;color:#06B6D4;font-size:1.1rem;}
.ctrl-hint{font-size:0.75rem;color:#94a3b8;line-height:1.5;}
.cg-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;width:100%;margin-top:4px;}
@media(max-width:900px){.cg-grid{grid-template-columns:repeat(3,1fr);}}
@media(max-width:540px){.cg-grid{grid-template-columns:repeat(2,1fr);gap:10px;}}
.gc-card{background:#fff;border:1px solid #e2d9cc;border-radius:12px;padding:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;}
.gc-img-wrap{width:90px;height:90px;background:#f3efe9;border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;}
@media(max-width:540px){.gc-img-wrap{width:56px;height:56px;}}
.gc-img{width:100%;height:100%;object-fit:contain;}
.gc-fallback{font-size:1.5rem;font-weight:800;color:#94a3b8;font-family:'Space Grotesk',sans-serif;}
.gc-noun{font-family:'Space Grotesk',sans-serif;font-size:0.72rem;font-weight:600;color:#475569;text-transform:capitalize;text-align:center;}
.gc-value{font-family:'Space Grotesk',sans-serif;font-size:1.15rem;font-weight:800;color:#0f172a;}
.reg-wrap{width:100%;border:1px solid #e2d9cc;border-radius:12px;overflow:hidden;overflow-x:auto;}
.reg-header,.reg-dropdowns{display:grid;grid-template-columns:repeat(5,1fr);min-width:260px;}
.reg-head-cell{height:36px;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-size:0.75rem;font-weight:700;color:#475569;background:#f3efe9;border-bottom:1px solid #e2d9cc;}
.reg-select{border:none;border-right:1px solid #e2d9cc;border-top:1px solid #e2d9cc;padding:10px 0;text-align:center;font-family:'Space Grotesk',sans-serif;font-size:1rem;font-weight:700;color:#0f172a;background:#fff;outline:none;cursor:pointer;appearance:none;-webkit-appearance:none;text-align-last:center;transition:background 0.15s;}
.reg-select:last-child{border-right:none;}
.reg-select:focus{background:rgba(6,182,212,0.07);}
.reg-select--disabled{background:#f3efe9;color:#cbd5e1;cursor:not-allowed;}
.overlay-bg{position:fixed;inset:0;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;z-index:9000;padding:20px;}
.overlay-card{position:relative;background:#fbf7f0;border:1px solid #e2d9cc;border-radius:20px;padding:36px 32px;max-width:360px;width:100%;display:flex;flex-direction:column;align-items:center;gap:14px;box-shadow:0 20px 60px rgba(15,23,42,0.2);animation:oIn 0.22s ease;}
.overlay-card--wide{max-width:820px;align-items:flex-start;max-height:90vh;overflow-y:auto;}
@keyframes oIn{from{transform:scale(0.94);opacity:0}to{transform:scale(1);opacity:1}}
.overlay-close{position:absolute;top:14px;right:16px;background:none;border:none;font-size:1.1rem;color:#94a3b8;cursor:pointer;}
.overlay-close:hover{color:#0f172a;}
.overlay-eyebrow{font-size:0.72rem;font-weight:600;color:#0891b2;letter-spacing:0.08em;text-transform:uppercase;}
.overlay-title{font-family:'Space Grotesk',sans-serif;font-size:1.2rem;font-weight:800;color:#0f172a;}
.overlay-hint{font-size:0.8rem;color:#64748b;text-align:center;line-height:1.6;}
.overlay-btn{width:100%;padding:12px;border-radius:10px;border:none;background:linear-gradient(135deg,#06B6D4,#0891b2);color:#fff;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:0.94rem;cursor:pointer;}
.overlay-btn:hover{opacity:0.9;}
.overlay-btn:disabled{opacity:0.4;cursor:not-allowed;}
.preview-details{width:100%;background:#fff;border:1px solid #e2d9cc;border-radius:12px;padding:14px 18px;display:flex;flex-direction:column;gap:10px;}
.preview-row{display:flex;gap:14px;font-size:0.88rem;line-height:1.5;}
.preview-key{font-weight:700;color:#475569;min-width:80px;}
.preview-val{color:#0f172a;}
/* MNEMONIC BOX */
.mnemonic-box{width:100%;background:rgba(6,182,212,0.06);border:1.5px solid rgba(6,182,212,0.2);border-radius:14px;padding:18px 20px;display:flex;flex-direction:column;align-items:center;gap:10px;}
.mnemonic-letters{font-family:'Space Grotesk',sans-serif;font-size:2.8rem;font-weight:800;color:#0891b2;letter-spacing:0.18em;line-height:1;}
.mnemonic-pairs{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;}
.mnemonic-pair{font-size:0.84rem;color:#334155;background:#fff;border:1px solid #e2d9cc;border-radius:8px;padding:4px 12px;}
.mnemonic-pair strong{color:#0891b2;margin-right:2px;}
.mnemonic-hint{font-size:0.76rem;color:#64748b;text-align:center;}
.preview-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:10px;width:100%;}
.preview-item{display:flex;flex-direction:column;align-items:center;gap:8px;padding:10px;border-radius:12px;background:#fff;border:1px solid #e2d9cc;}
.preview-img-wrap{width:80px;height:80px;border-radius:10px;background:#f3efe9;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid #e2d9cc;}
.preview-img{width:100%;height:100%;object-fit:contain;}
.preview-fallback{font-size:1.6rem;font-weight:800;color:#94a3b8;font-family:'Space Grotesk',sans-serif;}
.preview-label{font-size:0.8rem;font-weight:700;color:#0f172a;text-transform:capitalize;}
.btn-primary{width:100%;padding:13px;border-radius:10px;border:none;background:linear-gradient(135deg,#06B6D4,#0891b2);color:#fff;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:0.94rem;cursor:pointer;box-shadow:0 0 18px rgba(6,182,212,0.22);transition:transform 0.18s,box-shadow 0.18s,opacity 0.18s;}
.btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 0 26px rgba(6,182,212,0.36);}
.btn-primary:disabled{opacity:0.36;cursor:not-allowed;box-shadow:none;transform:none;}
.btn-outline{width:100%;padding:12px;border-radius:10px;border:1.5px solid #e2d9cc;background:transparent;color:#475569;font-size:0.9rem;font-weight:500;cursor:pointer;transition:border-color 0.18s,color 0.18s;}
.btn-outline:hover{border-color:#06B6D4;color:#0891b2;}
.alert-error{padding:11px 14px;border-radius:9px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);color:#dc2626;font-size:0.84rem;line-height:1.5;}
.success-box{display:flex;flex-direction:column;align-items:center;gap:14px;padding:32px 20px;text-align:center;}
.success-check{width:64px;height:64px;border-radius:50%;background:rgba(34,197,94,0.12);border:2px solid rgba(34,197,94,0.3);display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:700;color:#16a34a;}
.success-title{font-family:'Space Grotesk',sans-serif;font-size:1.4rem;font-weight:700;color:#0f172a;}
.success-msg{font-size:0.88rem;color:#64748b;line-height:1.65;max-width:380px;}
.toast{position:fixed;bottom:26px;right:22px;z-index:9999;display:flex;align-items:center;gap:10px;padding:13px 18px;border-radius:11px;max-width:340px;font-size:0.87rem;font-weight:500;cursor:pointer;box-shadow:0 8px 28px rgba(15,23,42,0.13);animation:slideUp 0.28s ease;}
.toast-success{background:#f0fdf4;border:1px solid rgba(34,197,94,0.3);color:#15803d;}
.toast-error{background:#fef2f2;border:1px solid rgba(239,68,68,0.28);color:#dc2626;}
@keyframes slideUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
.page-footer{text-align:center;margin-top:28px;font-size:0.75rem;color:#94a3b8;position:relative;z-index:1;}
`;
