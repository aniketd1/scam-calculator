import { useState } from "react";

const API_BASE = "http://187.127.174.150:5000";

/* ── SENTENCES ─────────────────────────────────────────────── */
const SENTENCES = [
  "The teacher goes to school by bus in India morning time.",
  "The doctor works in hospital with mobile in USA today shift.",
  "The farmer lives in house near river in India village life.",
  "The student studies in university by train in Japan city.",
  "The child plays football in park with dog and cat fun.",
  "The teacher writes on table in school with laptop notes work.",
  "The doctor checks eye in hospital with hand patient care.",
  "The farmer grows carrot in field near mountain green land.",
  "The engineer works in university with laptop in USA office.",
  "The driver drives car on road near ocean sea view.",
  "The boy eats apple in park with banana fruit time.",
  "The girl drinks milk in house with bread food time.",
];

/* ── NOUN EXTRACTOR ────────────────────────────────────────── */
const NOUNS = new Set([
  "teacher","doctor","farmer","student","child","engineer","driver","boy","girl",
  "school","hospital","house","university","park","field","road","ocean","mountain",
  "river","bus","train","car","laptop","mobile","tv","table","chair","bed","guitar",
  "drum","drums","piano","cricket","football","tennis","apple","banana","mango","carrot",
  "rice","milk","bread","dog","cat","parrot","pigeon","sparrow","elephant",
  "sunflower","rose","spinach","eye","ear","hand","book","beach","lotus",
]);

function extractNouns(sentence) {
  return [...new Set(
    sentence
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)  
      .filter(w => NOUNS.has(w))
  )];
}

/* ── ASSET MAP — matches actual filenames in /assets ─────────
   Keys are lowercase noun names, values are the real filename.  */
const assetModules = import.meta.glob("../assets/*", { eager: true, as: "url" });

// Build a map: lowercase-basename → url
const ASSET_URLS = {};
for (const [path, url] of Object.entries(assetModules)) {
  const fileName = path.split("/").pop();            // e.g. "Bread.png"
  const key = fileName.replace(/\.[^.]+$/, "").toLowerCase(); // "bread"
  ASSET_URLS[key] = url;
}

// Some nouns map to differently-named files
const NOUN_FILE_ALIAS = {
  drum:   "drums",
  tv:     "tv",
  mobile: "mobile",
  school: "school_building",  // there are two school images; prefer the building
};

function getNounImage(noun) {
  const key = NOUN_FILE_ALIAS[noun] ?? noun;
  return ASSET_URLS[key] ?? ASSET_URLS[noun] ?? null;
}

/* ── API HELPER ────────────────────────────────────────────── */
async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

/* ── LOCKER CARD ───────────────────────────────────────────── */
function LockerCard({ noun, value, onChange }) {
  const [show, setShow] = useState(false);
  const imgUrl = getNounImage(noun);
  const isSet  = (value || "").length > 0;

  return (
    <div className="locker-card" style={{ borderColor: isSet ? "rgba(6,182,212,0.35)" : undefined }}>
      <div className="locker-img-wrap">
        {imgUrl
          ? <img src={imgUrl} alt={noun} className="locker-img" />
          : <div className="locker-img-placeholder">{noun[0].toUpperCase()}</div>
        }
      </div>

      <div className="locker-meta">
        <div className="locker-noun">{noun}</div>
        <div className="locker-label">Secret number code for this locker</div>
        <div className="locker-input-row">
          <input
            className="locker-input"
            type={show ? "text" : "password"}
            inputMode="numeric"
            maxLength={6}
            placeholder="e.g. 42"
            value={value}
            onChange={e => onChange(e.target.value.replace(/\D/g, ""))}
          />
          <button type="button" className="locker-eye" onClick={() => setShow(s => !s)}>
            {show ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      <div className={`locker-status ${isSet ? "locker-status-set" : ""}`}>
        {isSet ? "🔒 Set" : "🔓"}
      </div>
    </div>
  );
}

/* ── MAIN ──────────────────────────────────────────────────── */
export default function Auth() {
  const [mode, setMode]   = useState("signup"); // "signup" | "login"
  const [step, setStep]   = useState("creds");  // creds | lockers | verify | success

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");

  // signup
  const [sentence,     setSentence]     = useState("");
  const [lockerCodes,  setLockerCodes]  = useState({});

  // login
  const [sessionId,   setSessionId]   = useState("");
  const [loginNouns,  setLoginNouns]  = useState([]);
  const [loginCodes,  setLoginCodes]  = useState({});

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error,   setError]   = useState("");

  const signupNouns    = sentence ? extractNouns(sentence) : [];
  const allLockersSet  = signupNouns.length > 0 && signupNouns.every(n => (lockerCodes[n] || "").length >= 1);
  const allLoginFilled = loginNouns.length > 0 && loginNouns.every(n => (loginCodes[n] || "").length >= 1);

  /* ── reset ── */
  const reset = (newMode) => {
    setMode(newMode); setStep("creds");
    setEmail(""); setPassword("");
    setSentence(""); setLockerCodes({});
    setSessionId(""); setLoginNouns([]); setLoginCodes({});
    setMessage(""); setError("");
  };

  /* ── signup: step 1 → 2 ── */
  const toCreds = () => {
    if (!email.trim() || !password.trim()) { setError("Enter email and password."); return; }
    if (!sentence)                          { setError("Choose a visual password sentence."); return; }
    setError(""); setStep("lockers");
  };

  /* ── signup: step 2 submit ── */
  const handleSignup = async () => {
    if (!allLockersSet) { setError("Set a code for every locker before continuing."); return; }
    setLoading(true); setError("");
    try {
      const data = await postJson("/auth/signup", {
        email, password,
        selectedSentence: sentence,
        lockerCodes,           // { noun: "42", noun2: "7", … }
      });
      if (!data.success) { setError(data.error || "Could not create account."); return; }
      reset("login");
      setMessage("Account created! Sign in below.");
    } catch { setError("Server error. Try again."); }
    finally { setLoading(false); }
  };

  /* ── login: step 1 ── */
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { setError("Enter email and password."); return; }
    setLoading(true); setError("");
    try {
      const data = await postJson("/auth/login", { email, password });
      if (!data.success) { setError(data.error || "Could not sign in."); return; }
      setSessionId(data.sessionId);
      setLoginNouns(data.nouns || []);   // ← server now sends noun list, not image filenames
      setStep("verify");
      setMessage("Enter the code for each of your image lockers.");
    } catch { setError("Server error. Try again."); }
    finally { setLoading(false); }
  };

  /* ── login: step 2 verify ── */
  const handleVerify = async () => {
    if (!allLoginFilled) { setError("Enter a code for every locker."); return; }
    setLoading(true); setError("");
    try {
      const data = await postJson("/auth/verify", {
        sessionId,
        lockerCodes: loginCodes,   // { noun: code }
      });
      if (!data.success) { setError(data.error || "Wrong codes. Try again."); return; }
      setStep("success");
      setMessage(data.message || "Identity verified. Welcome back!");
    } catch { setError("Server error. Try again."); }
    finally { setLoading(false); }
  };

  /* ── render ── */
  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.auth-page {
  min-height: 100vh;
  background: #f7efe6;
  color: #0f172a;
  font-family: 'Inter', sans-serif;
  padding: 80px 24px;
}

/* HERO */
.auth-hero { text-align: center; margin-bottom: 48px; }
.auth-eyebrow {
  display: inline-block; padding: 4px 14px;
  background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.25);
  border-radius: 20px; font-size: 0.75rem; font-weight: 600; color: #F59E0B;
  letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 18px;
}
.auth-title {
  font-family: 'Space Grotesk', sans-serif; font-weight: 800;
  font-size: clamp(1.9rem, 4vw, 2.8rem); letter-spacing: -0.03em;
  line-height: 1.15; margin-bottom: 14px;
}
.auth-title .accent { color: #06B6D4; }
.auth-copy { max-width: 520px; margin: 0 auto; color: #64748b; line-height: 1.7; font-size: 0.95rem; }

/* SHELL */
.auth-shell {
  max-width: 1100px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start;
}
@media (max-width: 860px) { .auth-shell { grid-template-columns: 1fr; } }

/* PANELS */
.auth-panel, .explain-panel {
  background: #fbf7f0; border: 1px solid #e6e9ef;
  border-radius: 16px; padding: 28px;
  display: flex; flex-direction: column; gap: 16px;
}

/* MODE TOGGLE */
.mode-toggle { display: flex; gap: 10px; }
.toggle-btn {
  flex: 1; padding: 10px; border-radius: 999px;
  background: #fff; border: 1px solid #e6e9ef;
  color: #475569; font-family: 'Inter', sans-serif;
  font-weight: 500; font-size: 0.88rem; cursor: pointer;
  transition: all 0.2s;
}
.toggle-btn:hover { border-color: rgba(6,182,212,0.4); color: #06B6D4; }
.toggle-btn.active {
  background: linear-gradient(135deg, #06B6D4, #0891b2);
  color: #fff; border-color: transparent; font-weight: 700;
}

/* STEP BADGE */
.step-badge {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px;
  background: rgba(6,182,212,0.07); border: 1px solid rgba(6,182,212,0.15);
  border-radius: 10px; font-size: 0.84rem; color: #0891b2; font-weight: 500;
}
.step-dot { width: 8px; height: 8px; border-radius: 50%; background: #06B6D4; flex-shrink: 0; }

/* INPUTS */
.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 0.78rem; font-weight: 600; color: #475569; letter-spacing: 0.04em; }
.auth-input {
  width: 100%; padding: 11px 14px; border-radius: 10px;
  border: 1px solid #e6e9ef; background: #fff;
  font-family: 'Inter', sans-serif; font-size: 0.9rem; color: #0f172a;
  outline: none; transition: border-color 0.2s, box-shadow 0.2s;
}
.auth-input:focus { border-color: #06B6D4; box-shadow: 0 0 0 3px rgba(6,182,212,0.1); }
.auth-input::placeholder { color: #94A3B8; }

/* SENTENCE PICKER */
.sentence-list {
  max-height: 260px; overflow-y: auto;
  display: flex; flex-direction: column; gap: 8px; padding-right: 4px;
}
.sentence-list::-webkit-scrollbar { width: 4px; }
.sentence-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }

.sentence-btn {
  width: 100%; padding: 13px 16px; border-radius: 10px;
  background: #fff; border: 1px solid #e6e9ef;
  cursor: pointer; text-align: left; font-family: 'Inter', sans-serif;
  transition: border-color 0.18s, background 0.18s, transform 0.15s;
}
.sentence-btn:hover { border-color: rgba(6,182,212,0.35); transform: translateY(-1px); }
.sentence-btn.selected { border-color: #06B6D4; background: rgba(6,182,212,0.06); }
.sentence-text { font-size: 0.86rem; color: #334155; line-height: 1.5; }
.noun-chips { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.noun-chip {
  padding: 2px 8px; border-radius: 20px;
  background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2);
  font-size: 0.7rem; color: #0891b2; font-weight: 600;
}

/* LOCKER CARDS */
.lockers-list { display: flex; flex-direction: column; gap: 12px; }
.locker-card {
  display: flex; align-items: center; gap: 14px;
  background: #fff; border: 1px solid #e6e9ef;
  border-radius: 14px; padding: 14px 16px;
  transition: border-color 0.2s;
}
.locker-img-wrap {
  width: 68px; height: 68px; border-radius: 10px;
  background: #f3efe9; display: flex; align-items: center;
  justify-content: center; flex-shrink: 0; overflow: hidden;
}
.locker-img { width: 100%; height: 100%; object-fit: contain; }
.locker-img-placeholder {
  font-size: 1.8rem; font-weight: 700; color: #94A3B8;
  font-family: 'Space Grotesk', sans-serif;
}
.locker-meta { flex: 1; min-width: 0; }
.locker-noun {
  font-family: 'Space Grotesk', sans-serif; font-weight: 700;
  font-size: 0.95rem; color: #0f172a; text-transform: capitalize; margin-bottom: 2px;
}
.locker-label { font-size: 0.73rem; color: #94A3B8; margin-bottom: 8px; }
.locker-input-row { display: flex; gap: 6px; align-items: center; }
.locker-input {
  width: 90px; padding: 8px 12px; border-radius: 8px;
  border: 1px solid #e6e9ef; background: #f7efe6;
  font-family: 'Space Grotesk', sans-serif; font-size: 1.05rem;
  font-weight: 700; letter-spacing: 0.2em; color: #0f172a; outline: none;
  transition: border-color 0.2s;
}
.locker-input:focus { border-color: #06B6D4; }
.locker-input::placeholder { letter-spacing: 0.05em; font-weight: 400; color: #94A3B8; font-size: 0.82rem; }
.locker-eye {
  background: none; border: none; cursor: pointer;
  font-size: 1rem; padding: 2px; opacity: 0.55; transition: opacity 0.2s;
}
.locker-eye:hover { opacity: 1; }
.locker-status {
  font-size: 0.7rem; font-weight: 600;
  padding: 3px 10px; border-radius: 20px;
  background: #f3efe9; border: 1px solid #e6e9ef;
  color: #94A3B8; white-space: nowrap; flex-shrink: 0;
}
.locker-status.locker-status-set {
  background: rgba(34,197,94,0.09); border-color: rgba(34,197,94,0.25); color: #22C55E;
}

/* BUTTONS */
.btn-primary {
  width: 100%; padding: 13px; border-radius: 10px; border: none;
  background: linear-gradient(135deg, #06B6D4, #0891b2);
  color: #0F172A; font-family: 'Space Grotesk', sans-serif;
  font-weight: 700; font-size: 0.95rem; cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  box-shadow: 0 0 16px rgba(6,182,212,0.2);
}
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 0 28px rgba(6,182,212,0.38); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
.btn-outline {
  width: 100%; padding: 12px; border-radius: 10px;
  border: 1px solid #e6e9ef; background: transparent;
  color: #475569; font-family: 'Inter', sans-serif;
  font-weight: 500; font-size: 0.9rem; cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.btn-outline:hover { border-color: #06B6D4; color: #06B6D4; }

/* ALERTS */
.alert-info {
  padding: 12px 14px; border-radius: 10px;
  background: rgba(6,182,212,0.07); border: 1px solid rgba(6,182,212,0.15);
  font-size: 0.86rem; color: #0891b2; line-height: 1.55;
}
.alert-error {
  padding: 10px 14px; border-radius: 10px;
  background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2);
  color: #dc2626; font-size: 0.85rem; line-height: 1.5;
}
.alert-success {
  padding: 20px; border-radius: 12px;
  background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2);
  color: #15803d; font-size: 0.9rem; line-height: 1.6; text-align: center;
}
.alert-success .success-icon { font-size: 2.5rem; display: block; margin-bottom: 10px; }
.hint { font-size: 0.82rem; color: #94A3B8; line-height: 1.6; }

/* EXPLAINER */
.explain-step { display: flex; gap: 14px; align-items: flex-start; }
.explain-num {
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(6,182,212,0.12); border: 1px solid rgba(6,182,212,0.2);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Space Grotesk', sans-serif; font-weight: 700;
  font-size: 0.8rem; color: #06B6D4; flex-shrink: 0; margin-top: 1px;
}
.explain-text { font-size: 0.87rem; color: #475569; line-height: 1.65; }
.explain-text strong { color: #0f172a; }
.explain-title {
  font-family: 'Space Grotesk', sans-serif; font-weight: 700;
  font-size: 1rem; color: #0f172a; margin-bottom: 14px;
}
.security-note {
  background: rgba(34,197,94,0.06); border: 1px solid rgba(34,197,94,0.18);
  border-radius: 12px; padding: 14px 16px;
  font-size: 0.84rem; color: #334155; line-height: 1.65;
}
.security-note strong { color: #15803d; }
.tips { font-size: 0.84rem; color: #475569; line-height: 1.85; }
      `}</style>

      <div className="auth-page">

        {/* HERO */}
        <div className="auth-hero">
          <div className="auth-eyebrow">🔐 Visual Locker Auth</div>
          <h1 className="auth-title">Sign in with your <span className="accent">Image Lockers</span></h1>
          <p className="auth-copy">
            Pick a visual sentence — each noun becomes a picture locker. Assign a secret number to each image. On every login, your pictures appear and you type the codes. Password + images + codes = nothing a hacker can guess.
          </p>
        </div>

        <div className="auth-shell">

          {/* ── LEFT: AUTH PANEL ── */}
          <div className="auth-panel">

            {/* ── SUCCESS ── */}
            {step === "success" && (
              <div className="alert-success">
                <span className="success-icon">✅</span>
                <strong>Identity verified!</strong><br />{message}
              </div>
            )}

            {/* ── STEP: CREDS ── */}
            {step === "creds" && (
              <>
                <div className="mode-toggle">
                  <button className={`toggle-btn${mode === "signup" ? " active" : ""}`} onClick={() => reset("signup")}>Create account</button>
                  <button className={`toggle-btn${mode === "login"  ? " active" : ""}`} onClick={() => reset("login")}>Sign in</button>
                </div>

                {message && <div className="alert-info">{message}</div>}

                <div className="step-badge">
                  <span className="step-dot" />
                  Step 1 of {mode === "signup" ? "2" : "2"} —{" "}
                  {mode === "signup" ? "Create account & choose your visual sentence" : "Sign in to reveal your image lockers"}
                </div>

                <div className="field-group">
                  <label className="field-label">Email Address</label>
                  <input className="auth-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="field-group">
                  <label className="field-label">Password</label>
                  <input className="auth-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                </div>

                {mode === "signup" && (
                  <div className="field-group">
                    <label className="field-label">Visual Password Sentence</label>
                    <p className="hint">The nouns highlighted below become your image lockers. Pick one you'll remember.</p>
                    <div className="sentence-list">
                      {SENTENCES.map(s => {
                        const nouns = extractNouns(s);
                        return (
                          <button
                            key={s} type="button"
                            className={`sentence-btn${sentence === s ? " selected" : ""}`}
                            onClick={() => { setSentence(s); setLockerCodes({}); }}
                          >
                            <div className="sentence-text">{s}</div>
                            <div className="noun-chips">
                              {nouns.map(n => <span key={n} className="noun-chip">{n}</span>)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {error && <div className="alert-error">{error}</div>}

                <button className="btn-primary" disabled={loading} onClick={mode === "signup" ? toCreds : handleLogin}>
                  {loading ? "Please wait…"
                    : mode === "signup" ? "Continue → Set Locker Codes"
                    : "Sign In → Show My Lockers"}
                </button>
              </>
            )}

            {/* ── STEP: LOCKERS (signup) ── */}
            {step === "lockers" && (
              <>
                <div className="step-badge">
                  <span className="step-dot" />
                  Step 2 of 2 — Assign a secret number to each image locker
                </div>
                <p className="hint">
                  One image per noun from your sentence. Set a numeric code for each — these are what you'll type at every login instead of selecting images.
                </p>
                <div className="lockers-list">
                  {signupNouns.map(noun => (
                    <LockerCard
                      key={noun} noun={noun}
                      value={lockerCodes[noun] || ""}
                      onChange={val => setLockerCodes(p => ({ ...p, [noun]: val }))}
                    />
                  ))}
                </div>
                {error && <div className="alert-error">{error}</div>}
                <button className="btn-primary" disabled={loading || !allLockersSet} onClick={handleSignup}>
                  {loading ? "Creating account…" : "🔒 Create Account with Locker Codes"}
                </button>
                <button className="btn-outline" onClick={() => setStep("creds")}>← Back</button>
              </>
            )}

            {/* ── STEP: VERIFY (login) ── */}
            {step === "verify" && (
              <>
                <div className="step-badge">
                  <span className="step-dot" />
                  Step 2 of 2 — Enter the code for each image locker
                </div>
                {message && <div className="alert-info">{message}</div>}
                <div className="lockers-list">
                  {loginNouns.map(noun => (
                    <LockerCard
                      key={noun} noun={noun}
                      value={loginCodes[noun] || ""}
                      onChange={val => setLoginCodes(p => ({ ...p, [noun]: val }))}
                    />
                  ))}
                </div>
                {error && <div className="alert-error">{error}</div>}
                <button className="btn-primary" disabled={loading || !allLoginFilled} onClick={handleVerify}>
                  {loading ? "Verifying…" : "⚡ Verify Locker Codes"}
                </button>
                <button className="btn-outline" onClick={() => reset("login")}>← Start over</button>
              </>
            )}

          </div>

          {/* ── RIGHT: EXPLAINER ── */}
          <div className="explain-panel">
            <div>
              <div className="explain-title">🔐 How Image Locker Auth Works</div>
              {[
                { n:"1", content: <><strong>Choose a sentence.</strong> Its nouns (teacher, bus, hospital…) become your image lockers — shown visually, not as text.</> },
                { n:"2", content: <><strong>Set a code per locker.</strong> You assign a secret number to each noun image. Only you know which number belongs to which picture.</> },
                { n:"3", content: <><strong>Login = password + codes.</strong> After signing in, your images appear and you type the number for each one. No selecting — just entering.</> },
                { n:"4", content: <><strong>Screenshots are useless.</strong> A hacker who sees your screen only sees images — they can't know which numbers you set for them.</> },
              ].map(({ n, content }) => (
                <div className="explain-step" key={n} style={{ marginBottom: 16 }}>
                  <div className="explain-num">{n}</div>
                  <div className="explain-text">{content}</div>
                </div>
              ))}
            </div>

            <div className="security-note">
              <strong>🛡️ Why it's harder to hack:</strong><br />
              Credential stuffing, phishing, and keyloggers only get your password. Without the exact locker codes per image, access is still blocked. Each user's locker layout is unique to their sentence choice.
            </div>

            <div>
              <div className="explain-title" style={{ marginBottom: 8 }}>🔢 Code Tips</div>
              <div className="tips">
                • Use different codes for each locker — never repeat<br />
                • 2–6 digits is enough; avoid 1234 or 0000<br />
                • Use personal associations: your cat's age for the "cat" locker<br />
                • The order the images appear is always the same for you
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}