// Auth.jsx — Scam2Safe visual-sentence authentication
// Theme  : warm cream #f7efe6 · navy #0f172a · cyan #06B6D4
// Fonts  : Space Grotesk (headings) · Inter (body)
// Layout : single wide card, no right panel
//
// KEY CHANGES FROM v1:
//  • Asset glob now points to ../assets/nouns/  (real PNGs, no emojis)
//  • Explicit NOUN_IMAGE_MAP for every PNG in the folder (handles mixed-case filenames)
//  • Signup is ONE step: email + password + sentence card containing offset + positions
//  • Challenge grid is 4 cols × 3 rows = 12 cards
//  • Login Step 3 shows EDITABLE input boxes A-O; user types their digits; Verify sends them
//  • /api/auth/verify now receives { sessionId, registerInputs }

import { useState, useCallback, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

/* ═══════════════════════════════════════════════════════════════
   1. SENTENCE DATABASE
═══════════════════════════════════════════════════════════════ */
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
  "The teacher sits on chair in school with table class.",
  "The doctor uses TV in hospital for patient health care.",
  "The farmer sees dog in field near river green land.",
  "The student reads book in university with mobile study time.",
  "The child watches TV in house with mobile entertainment time.",
  "The teacher plays guitar in school with piano music class.",
  "The doctor hears drums in hospital with guitar sound time.",
  "The farmer eats rice in house with milk food meal.",
  "The boy plays cricket in park with football game time.",
  "The girl plays tennis in university with cricket sport fun.",
  "The teacher draws sunflower in school with rose art work.",
  "The doctor plants rose in hospital garden near river view.",
  "The farmer plants spinach in field near ocean green farm.",
  "The student uses laptop in university with mobile study work.",
  "The child eats banana in park with mango fruit snack.",
  "The teacher uses TV in school with mobile lesson work.",
  "The doctor checks ear in hospital with eye medical care.",
  "The farmer works in field near mountain green farm land.",
  "The boy sits on bed in house with chair rest time.",
  "The girl sleeps on bed in house near ocean sea view.",
  "The teacher travels by train to university in Japan city.",
  "The doctor travels by bus to hospital in USA city.",
  "The farmer travels by car to park in India land.",
  "The student sees parrot in park with pigeon bird view.",
  "The child hears sparrow in house near river sound time.",
  "The teacher sees pigeon in school near ocean bird view.",
  "The doctor sees elephant in hospital near park animal care.",
  "The farmer sees cat in field with dog farm animal.",
  "The boy uses mobile in park with laptop device time.",
  "The girl uses laptop in university with mobile device work.",
  "The teacher uses mobile in school with TV lesson work.",
  "The doctor uses laptop in hospital with TV report work.",
  "The farmer uses mobile in house near river communication tool.",
  "The child draws house in school with mountain art work.",
  "The student draws ocean in university with beach study art.",
  "The teacher draws river in school with mountain teaching art.",
  "The doctor draws beach in hospital with ocean sketch work.",
  "The farmer draws mountain in house with river farm art.",
];

/* ═══════════════════════════════════════════════════════════════
   2. NOUN IMAGE MAP
   Maps every noun string → the exact filename (without .png extension)
   as it exists in client/src/assets/nouns/
   Filenames sourced from the screenshots provided.
═══════════════════════════════════════════════════════════════ */

// Vite glob — loads every PNG from the nouns folder eagerly
const _nounGlob = import.meta.glob(
  "../assets/nouns/*.png",
  {
    eager: true
  }
);
// Build a lookup from lowercase-filename-stem → URL
const _fileMap = {};
for (const [fullPath, module] of Object.entries(_nounGlob)) {
  const stem = fullPath
    .split("/")
    .pop()
    .replace(/\.png$/i, "")
    .toLowerCase();

  _fileMap[stem] = module.default;
}

// Explicit noun → filename-stem mapping (handles every PNG from the screenshots)
const NOUN_STEM = {
  // People
  doctor      : "doctor",
  teacher     : "teacher",
  farmer      : "farmer",
  student     : "student",
  child       : "child",
  engineer    : "engineer",
  driver      : "driver",
  boy         : "boy",
  girl        : "girl",
  // Places
  school      : "school building",   // file = "School building.png"
  hospital    : "hospital",
  house       : "house",
  university  : "university",
  park        : "park",
  field       : "field",
  road        : "road",
  ocean       : "ocean",
  mountain    : "mountain",
  river       : "river",
  beach       : "beach",
  // Transport
  bus         : "bus",
  train       : "train",
  car         : "car",
  // Technology
  laptop      : "laptop",
  mobile      : "mobile",
  tv          : "tv",
  // Furniture
  table       : "table",
  chair       : "chair",
  bed         : "bed",
  // Music
  guitar      : "guitar",
  drums       : "drums",
  piano       : "piano",
  // Sports
  cricket     : "cricket",
  football    : "football",
  tennis      : "tennis",
  // Food & Drink
  apple       : "apple",
  banana      : "banana",
  mango       : "mango",
  carrot      : "carrot",
  rice        : "rice",
  milk        : "milk",
  bread       : "bread",
  spinach     : "spinach",
  potato      : "potato",
  // Animals
  dog         : "dog",
  cat         : "cat",
  parrot      : "parrot",
  pigeon      : "pigeon",
  sparrow     : "sparrow",
  elephant    : "elephant",
  // Flowers
  sunflower   : "sunflower",
  rose        : "rose",
  lotus       : "lotus",
  // Body
  eye         : "eye",
  ear         : "ear",
  hand        : "hand",
  // Colours
  red         : "red",
  blue        : "blue",
  green       : "green",
  yellow      : "yellow",
  black       : "black",
  purple      : "purple",
  // Clothes
  shirt       : "shirt",
  tshirt      : "tshirt",
  dress       : "dress",
  // Countries / flags
  japan       : "japan flag",     // file = "Japan Flag.png"
  usa         : "usa flag",       // file = "USA flag.png"
  india       : "india flag",     // file = "India flag.png"
};

/** Return the imported PNG URL for a noun, or null if not found. */
function getNounImage(noun) {
  const stem = NOUN_STEM[noun.toLowerCase()];
  if (!stem) return null;
  // Try exact stem first, then try stem without spaces
  return _fileMap[stem] ?? _fileMap[stem.replace(/\s+/g, "")] ?? null;
}

/* ═══════════════════════════════════════════════════════════════
   3. NOUN LEXICON (for noun extraction from sentences)
═══════════════════════════════════════════════════════════════ */
const NOUNS = new Set(Object.keys(NOUN_STEM));

function extractNouns(sentence) {
  return [
    ...new Set(
      sentence
        .toLowerCase()
        .replace(/[^a-z\s]/g, "")
        .split(/\s+/)
        .filter((w) => NOUNS.has(w))
    ),
  ];
}

/* ═══════════════════════════════════════════════════════════════
   4. CONSTANTS
═══════════════════════════════════════════════════════════════ */
const POSITIONS = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O"];
const DEFAULT_OFFSET = "5";
const DEFAULT_POS = ["A","D"];

/* ═══════════════════════════════════════════════════════════════
   5. API HELPER
═══════════════════════════════════════════════════════════════ */
async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

/* ═══════════════════════════════════════════════════════════════
   6. SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */

/** Single challenge grid card — real image from assets/nouns/ */
function GridCard({ noun, value }) {
  const imgSrc = getNounImage(noun);
  return (
    <div className="gc-card">
      <div className="gc-img-wrap">
        {imgSrc
          ? <img src={imgSrc} alt={noun} className="gc-img" />
          : <div className="gc-fallback">{noun.charAt(0).toUpperCase()}</div>}
      </div>
      <div className="gc-noun">{noun}</div>
      <div className="gc-value">{value}</div>
    </div>
  );
}

/** Register bar with editable inputs A–O */
function RegisterInputBar({ inputs, onChange }) {
  const refs = useRef([]);
  const handleKey = (e, idx) => {
  if (e.key === "Backspace") {
    if (!inputs[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  }
};
 const handleChange = (idx, val) => {
  const digit = val.replace(/\D/g, "").slice(-1);

  onChange(idx, digit);

  if (digit && idx < 14) {
    requestAnimationFrame(() => {
      refs.current[idx + 1]?.focus();
    });
  }
};
return (
    <div className="reg-wrap">
      {/* Header */}
      <div className="reg-header">
        {POSITIONS.map((p) => (
          <div key={p} className="reg-head-cell">{p}</div>
        ))}
      </div>
      {/* Inputs */}
      <div className="reg-inputs">
        {POSITIONS.map((p, i) => (
          <input
            key={p}
            ref={(el) => (refs.current[i] = el)}
            className="reg-input-cell"
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={inputs[i] ?? ""}
            disabled={i > 0 && !inputs[i - 1]}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKey(e, i)}
            placeholder="·"
          />
        ))}
      </div>
    </div>
  );
}

/** Toast notification */
function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.type}`} role="alert" onClick={onClose}>
      <span>{toast.type === "success" ? "✓" : "✕"}</span>
      <span>{toast.message}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. MAIN AUTH COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function Auth() {
  /* ── mode ─────────────────────────────────────────────── */
  const [mode, setMode] = useState("signup"); // "signup" | "login"

  /* ── shared ───────────────────────────────────────────── */
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [toast,    setToast]    = useState(null);

  /* ── signup ───────────────────────────────────────────── */
  // All signup info lives on a single step
  const [sentence,     setSentence]     = useState("");
  const [offset,       setOffset]       = useState(DEFAULT_OFFSET);
  const [positions,    setPositions]    = useState([...DEFAULT_POS]); // [pos1, pos2]

  /* ── login ────────────────────────────────────────────── */
  // "creds" → "grid" → "register" → "success"
  const [loginStep,     setLoginStep]     = useState("creds");
  const [sessionId,     setSessionId]     = useState("");
  const [challengeGrid, setChallengeGrid] = useState([]);
  const [regInputs,     setRegInputs]     = useState(Array(15).fill("")); // user types here

  const signupNouns = sentence ? extractNouns(sentence) : [];

  /* ── helpers ──────────────────────────────────────────── */
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  const resetAll = useCallback((newMode) => {
    setMode(newMode);
    setEmail(""); setPassword(""); setError(""); setToast(null);
    setSentence(""); setOffset(DEFAULT_OFFSET); setPositions([...DEFAULT_POS]);
    setLoginStep("creds"); setSessionId("");
    setChallengeGrid([]); setRegInputs(Array(15).fill(""));
  }, []);

  const updateRegInput = (idx, digit) => {
    setRegInputs((prev) => {
      const next = [...prev];
      next[idx] = digit;
      return next;
    });
  };

  /* ── position dropdowns ───────────────────────────────── */
  const setPos = (slot, val) => {
    setPositions((prev) => {
      const next = [...prev];
      next[slot] = val;
      return next;
    });
  };

  /* ══════════════════════════════════════════════════════════
     SIGNUP HANDLER — single step
  ══════════════════════════════════════════════════════════ */
  const handleSignup = async () => {
    setError("");
    if (!email.trim())    { setError("Enter your email address."); return; }
    if (!password.trim()) { setError("Enter a password."); return; }
    if (!sentence)        { setError("Select a visual password sentence."); return; }

    const off = parseInt(offset, 10);
    if (isNaN(off) || off < 1 || off > 99) {
      setError("Offset must be a number between 1 and 99."); return;
    }
    if (positions[0] === positions[1]) {
      setError("The two register positions must be different."); return;
    }

    setLoading(true);
    try {
      const data = await postJson("/api/auth/signup", {
        email,
        password,
        selectedSentence: sentence,
        secretPositions: positions,
        offset: off,
      });
      if (!data.success) { setError(data.error || "Could not create account."); return; }
      if (data.token) localStorage.setItem("token", data.token);
      showToast("success", "Account created! You can now sign in.");
      resetAll("login");
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ══════════════════════════════════════════════════════════
     LOGIN HANDLERS
  ══════════════════════════════════════════════════════════ */
  const handleLoginCreds = async () => {
    setError("");
    if (!email.trim() || !password.trim()) { setError("Enter email and password."); return; }
    setLoading(true);
    try {
      const data = await postJson("/api/auth/login", { email, password });
      console.log("LOGIN RESPONSE:", data);
      console.log("GRID:", data.challengeGrid);
      if (!data.success) { setError(data.error || "Invalid credentials."); return; }
      setSessionId(data.sessionId);
      setChallengeGrid(data.challengeGrid || []);
      setRegInputs(Array(15).fill(""));
      setLoginStep("grid");
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToRegister = () => {
    setRegInputs(Array(15).fill(""));
    setLoginStep("register");
  };

  const handleVerify = async () => {
    setError("");
const allFilled = regInputs.every(
  (v) => /^[0-9]$/.test(v)
);    if (!allFilled) { setError("Fill in all 15 positions (A – O)."); return; }

    setLoading(true);
    try {
      const data = await postJson("/api/auth/verify", {
        sessionId,
        registerInputs: regInputs.map((v) => parseInt(v, 10)),
      });
      if (!data.success) {
        setError(data.error || "Register verification failed. Please start over.");
        // Session is deleted server-side on failure — full restart
        setLoginStep("creds");
        setChallengeGrid([]); setSessionId("");
        return;
      }
      if (data.token) localStorage.setItem("token", data.token);
      showToast("success", data.message || "Identity verified. Welcome back!");
      setLoginStep("success");
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── ALL STYLES inline ── */}
      <style>{CSS}</style>

      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="auth-page">
        {/* HERO */}
        <header className="auth-hero">
          <p className="hero-eyebrow">Visual Sentence Password</p>
          <h1 className="hero-title">
            Sign in with your <span className="hero-accent">Visual Sentence</span>
          </h1>
          <p className="hero-sub">
            Your sentence's nouns become secret images. Pick two register positions and a private
            offset. At login: spot your image, add your offset, enter the two digits at your positions.
          </p>
        </header>

        <div className="auth-shell">
          <div className="auth-card">

            {/* ══ SUCCESS ══ */}
            {loginStep === "success" && (
              <div className="success-box">
                <div className="success-check">✓</div>
                <h2 className="success-title">Identity Verified</h2>
                <p className="success-msg">
                  Your visual sentence login succeeded. JWT stored in localStorage.
                </p>
                <button className="btn-outline" onClick={() => resetAll("login")}>
                  Sign in again
                </button>
              </div>
            )}

            {loginStep !== "success" && (
              <>
                {/* ── MODE TABS ── */}
                {(mode === "signup" || loginStep === "creds") && (
                  <div className="mode-tabs">
                    <button
                      className={`mode-tab${mode === "signup" ? " mode-tab--active" : ""}`}
                      onClick={() => resetAll("signup")}
                    >
                      Create account
                    </button>
                    <button
                      className={`mode-tab${mode === "login" ? " mode-tab--active" : ""}`}
                      onClick={() => resetAll("login")}
                    >
                      Sign in
                    </button>
                  </div>
                )}

                {/* ════════════ SIGNUP ════════════ */}
                {mode === "signup" && (
                  <div className="form-stack">
                    {/* Credentials */}
                    <div className="field-row">
                      <div className="field-group">
                        <label className="field-label">Email address</label>
                        <input
                          className="field-input"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="field-group">
                        <label className="field-label">Password</label>
                        <input
                          className="field-input"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Sentence picker */}
                    <div>
                      <p className="section-label">Choose your visual password sentence</p>
                      <p className="section-hint">
                        The highlighted nouns in your sentence become your secret images. One will appear
                        in the login grid; spot it, add your offset, enter two digits at your positions.
                      </p>
                      <div className="sentence-list">
                        {SENTENCES.map((s) => {
                          const ns = extractNouns(s);
                          const isSelected = sentence === s;
                          return (
                            <button
                              key={s}
                              type="button"
                              className={`sentence-card${isSelected ? " sentence-card--selected" : ""}`}
                              onClick={() => setSentence(s)}
                            >
                              {/* Sentence text */}
                              <div className="sentence-text">{s}</div>

                              {/* Noun chips */}
                              <div className="noun-chips">
                                {ns.map((n) => (
                                  <span key={n} className="noun-chip">{n}</span>
                                ))}
                              </div>

                              {/* Offset + Positions — only visible on selected card */}
                              {isSelected && (
                                <div className="card-controls" onClick={(e) => e.stopPropagation()}>
                                  <div className="control-row">
                                    <label className="ctrl-label">Offset</label>
                                    <input
                                      className="ctrl-offset"
                                      type="text"
                                      inputMode="numeric"
                                      maxLength={2}
                                      value={offset}
                                      onChange={(e) =>
                                        setOffset(e.target.value.replace(/\D/, "").slice(0, 2))
                                      }
                                    />
                                    <span className="ctrl-hint">1 – 99</span>
                                  </div>
                                  <div className="control-row">
                                    <label className="ctrl-label">Positions</label>
                                    <select
                                      className="ctrl-select"
                                      value={positions[0]}
                                      onChange={(e) => setPos(0, e.target.value)}
                                    >
                                      {POSITIONS.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                      ))}
                                    </select>
                                    <span className="ctrl-plus">+</span>
                                    <select
                                      className="ctrl-select"
                                      value={positions[1]}
                                      onChange={(e) => setPos(1, e.target.value)}
                                    >
                                      {POSITIONS.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                      ))}
                                    </select>
                                    <span className="ctrl-hint">
                                      e.g. A + D → digits of ({offset || 5} + image value)
                                    </span>
                                  </div>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {error && <div className="alert-error">{error}</div>}

                    <button
                      className="btn-primary"
                      disabled={loading}
                      onClick={handleSignup}
                    >
                      {loading ? "Creating account…" : "Create Account"}
                    </button>
                  </div>
                )}

                {/* ════════════ LOGIN ════════════ */}
                {mode === "login" && (
                  <>
                    {/* ── STEP 1: credentials ── */}
                    {loginStep === "creds" && (
                      <div className="form-stack">
                        <div className="step-badge">Step 1 of 3 — Credentials</div>
                        <div className="field-group">
                          <label className="field-label">Email address</label>
                          <input
                            className="field-input"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                        <div className="field-group">
                          <label className="field-label">Password</label>
                          <input
                            className="field-input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                        {error && <div className="alert-error">{error}</div>}
                        <button className="btn-primary" disabled={loading} onClick={handleLoginCreds}>
                          {loading ? "Please wait…" : "Next →"}
                        </button>
                      </div>
                    )}

                    {/* ── STEP 2: challenge grid ── */}
                    {loginStep === "grid" && (
                      <div className="form-stack">
                        <div className="step-badge">Step 2 of 3 — Find your secret image</div>

                        <div className="info-box">
                          <strong>Look for your image.</strong> Find the image that matches a noun from
                          your sentence. Note the number beneath it. Add your private offset to it mentally.
                          Keep that result in mind — you will enter its digits in the next step.
                        </div>

                        {/* 4 × 3 grid */}
                        <div className="cg-grid">
  {challengeGrid && challengeGrid.length > 0 ? (
    challengeGrid.map((item, idx) => (
      <GridCard
        key={idx}
        noun={item.noun}
        value={item.value}
      />
    ))
  ) : (
    <div
      style={{
        padding: "40px",
        textAlign: "center",
        gridColumn: "1/-1",
        color: "red",
        fontWeight: "bold",
      }}
    >
      No challenge images received from server
    </div>
  )}
</div>

                        {error && <div className="alert-error">{error}</div>}

                        <button
                          className="btn-primary"
                          disabled={loading}
                          onClick={handleContinueToRegister}
                        >
                          {loading ? "Please wait…" : "Continue to Register →"}
                        </button>
                        <button className="btn-outline" onClick={() => resetAll("login")}>
                          ← Start over
                        </button>
                      </div>
                    )}

                    {/* ── STEP 3: register bar with editable inputs ── */}
                    {loginStep === "register" && (
                      <div className="form-stack">
                        <div className="step-badge">Step 3 of 3 — Enter your register</div>

                        <div className="info-box">
                          <strong>Fill all 15 boxes (A – O).</strong> At your two secret positions
                          (which only you know), enter the two digits of your computed result
                          (image value + your offset). All other boxes: enter any digit.
                        </div>

                        <RegisterInputBar inputs={regInputs} onChange={updateRegInput} />

                        <p className="field-hint">
                          Example: image showed 62, offset = 5 → result = 67 → enter 6 at position A,
                          7 at position D. The server will check only your secret positions.
                        </p>

                        {error && <div className="alert-error">{error}</div>}

                        <button
                          className="btn-primary"
                          disabled={loading}
                          onClick={handleVerify}
                        >
                          {loading ? "Verifying…" : "Verify →"}
                        </button>
                        <button
                          className="btn-outline"
                          onClick={() => setLoginStep("grid")}
                        >
                          ← Back to grid
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <p className="page-footer">
          ScamRisk — Sentence Password is phishing-resistant. Your secret never leaves this device.
        </p>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STYLES  (all inline — no external CSS file needed)
═══════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
button,input,select{font-family:inherit;}

/* ── PAGE ── */
.auth-page{
  min-height:100vh;
  background:#f7efe6;
  color:#0f172a;
  font-family:'Inter',sans-serif;
  padding:48px 20px 72px;
  position:relative;overflow:hidden;
}
.auth-page::before{
  content:'';position:fixed;top:-140px;right:-140px;
  width:500px;height:500px;border-radius:50%;
  background:radial-gradient(circle,rgba(6,182,212,0.06) 0%,transparent 70%);
  pointer-events:none;z-index:0;
}
.auth-page::after{
  content:'';position:fixed;bottom:-120px;left:-120px;
  width:400px;height:400px;border-radius:50%;
  background:radial-gradient(circle,rgba(37,99,235,0.04) 0%,transparent 70%);
  pointer-events:none;z-index:0;
}

/* ── HERO ── */
.auth-hero{
  text-align:center;
  max-width:680px;margin:0 auto 36px;
  position:relative;z-index:1;
}
.hero-eyebrow{
  display:inline-block;
  padding:4px 14px;border-radius:99px;
  background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);
  font-size:0.72rem;font-weight:600;color:#d97706;
  letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;
}
.hero-title{
  font-family:'Space Grotesk',sans-serif;
  font-weight:800;font-size:clamp(1.6rem,3.2vw,2.4rem);
  letter-spacing:-0.04em;line-height:1.12;
  color:#0f172a;margin-bottom:10px;
}
.hero-accent{color:#06B6D4;}
.hero-sub{
  font-size:0.88rem;color:#64748b;line-height:1.7;
}

/* ── SHELL + CARD ── */
.auth-shell{max-width:920px;margin:0 auto;position:relative;z-index:1;}

.auth-card{
  background:#fbf7f0;
  border:1px solid #e2d9cc;border-radius:20px;
  padding:36px 40px;
  display:flex;flex-direction:column;gap:20px;
  box-shadow:0 4px 28px rgba(15,23,42,0.06);
}
@media(max-width:600px){.auth-card{padding:24px 18px;}}

/* ── MODE TABS ── */
.mode-tabs{display:flex;gap:8px;}
.mode-tab{
  flex:1;padding:11px;border-radius:99px;
  background:#fff;border:1.5px solid #e2d9cc;
  color:#475569;font-size:0.9rem;font-weight:500;cursor:pointer;
  transition:all 0.18s;
}
.mode-tab:hover{border-color:rgba(6,182,212,0.4);color:#0891b2;}
.mode-tab--active{
  background:linear-gradient(135deg,#06B6D4,#0891b2);
  color:#fff;border-color:transparent;font-weight:700;
  box-shadow:0 4px 14px rgba(6,182,212,0.22);
}

/* ── STEP BADGE ── */
.step-badge{
  padding:9px 14px;border-radius:9px;
  background:rgba(6,182,212,0.07);border:1px solid rgba(6,182,212,0.15);
  font-size:0.83rem;color:#0891b2;font-weight:600;
}

/* ── INFO BOX ── */
.info-box{
  padding:13px 16px;border-radius:11px;
  background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);
  font-size:0.84rem;color:#92400e;line-height:1.65;
}
.info-box strong{font-weight:700;color:#78350f;}

/* ── FORM HELPERS ── */
.form-stack{display:flex;flex-direction:column;gap:16px;}
.field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
@media(max-width:540px){.field-row{grid-template-columns:1fr;}}
.field-group{display:flex;flex-direction:column;gap:5px;}
.field-label{font-size:0.73rem;font-weight:600;color:#475569;letter-spacing:0.05em;text-transform:uppercase;}
.field-hint{font-size:0.79rem;color:#94a3b8;line-height:1.6;}
.field-input{
  width:100%;padding:11px 13px;border-radius:10px;
  border:1.5px solid #e2d9cc;background:#fff;
  font-size:0.91rem;color:#0f172a;outline:none;
  transition:border-color 0.18s,box-shadow 0.18s;
}
.field-input:focus{border-color:#06B6D4;box-shadow:0 0 0 3px rgba(6,182,212,0.1);}
.field-input::placeholder{color:#94a3b8;}

/* ── SECTION LABELS ── */
.section-label{font-size:0.73rem;font-weight:700;color:#475569;letter-spacing:0.06em;text-transform:uppercase;}
.section-hint{font-size:0.79rem;color:#94a3b8;line-height:1.6;margin-top:4px;margin-bottom:10px;}

/* ── SENTENCE PICKER ── */
.sentence-list{
  display:flex;flex-direction:column;gap:8px;
  max-height:380px;overflow-y:auto;padding-right:4px;
}
.sentence-list::-webkit-scrollbar{width:4px;}
.sentence-list::-webkit-scrollbar-thumb{background:#d1c4b0;border-radius:2px;}

/* Each sentence card is full-width */
.sentence-card{
  width:100%;padding:13px 16px;border-radius:12px;
  background:#fff;border:1.5px solid #e2d9cc;
  cursor:pointer;text-align:left;
  transition:border-color 0.16s,box-shadow 0.16s,transform 0.14s;
}
.sentence-card:hover{border-color:rgba(6,182,212,0.4);transform:translateY(-1px);box-shadow:0 3px 12px rgba(6,182,212,0.08);}
.sentence-card--selected{
  border-color:#06B6D4;background:rgba(6,182,212,0.04);
  box-shadow:0 0 0 3px rgba(6,182,212,0.1);
}
.sentence-text{font-size:0.87rem;color:#334155;line-height:1.55;}
.noun-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px;}
.noun-chip{
  padding:2px 9px;border-radius:99px;
  background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.2);
  font-size:0.67rem;color:#0891b2;font-weight:600;letter-spacing:0.03em;
}

/* Controls inside selected card */
.card-controls{
  margin-top:12px;padding-top:12px;
  border-top:1px dashed rgba(6,182,212,0.25);
  display:flex;flex-direction:column;gap:10px;
}
.control-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.ctrl-label{font-size:0.73rem;font-weight:700;color:#475569;letter-spacing:0.05em;text-transform:uppercase;white-space:nowrap;width:60px;}
.ctrl-offset{
  width:60px;padding:7px 10px;border-radius:8px;
  border:1.5px solid #e2d9cc;background:#fff;
  font-family:'Space Grotesk',sans-serif;
  font-size:1.1rem;font-weight:800;color:#0f172a;
  text-align:center;outline:none;
  transition:border-color 0.18s;
}
.ctrl-offset:focus{border-color:#06B6D4;}
.ctrl-select{
  padding:7px 10px;border-radius:8px;
  border:1.5px solid #e2d9cc;background:#fff;
  font-family:'Space Grotesk',sans-serif;
  font-size:0.9rem;font-weight:700;color:#0f172a;
  cursor:pointer;outline:none;
  transition:border-color 0.18s;
}
.ctrl-select:focus{border-color:#06B6D4;}
.ctrl-plus{font-family:'Space Grotesk',sans-serif;font-weight:800;color:#06B6D4;font-size:1.1rem;}
.ctrl-hint{font-size:0.75rem;color:#94a3b8;line-height:1.5;}

/* ── CHALLENGE GRID  4 × 3 ── */
.cg-grid{
  display:grid;
  grid-template-columns:repeat(4,minmax(180px,1fr));
  gap:20px;
  width:100%;
  margin-top:20px;
}
@media(max-width:540px){.cg-grid{grid-template-columns:repeat(3,1fr);gap:8px;}}
@media(max-width:900px){
  .cg-grid{
    grid-template-columns:repeat(3,1fr);
  }
}

@media(max-width:600px){
  .cg-grid{
    grid-template-columns:repeat(2,1fr);
  }
}
.gc-card{
  background:#fff;
  border:1px solid #ddd;
  border-radius:12px;
  padding:15px;
  min-height:220px;

  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;

  box-shadow:0 2px 10px rgba(0,0,0,0.08);
}
.gc-card:hover{border-color:rgba(6,182,212,0.35);box-shadow:0 3px 10px rgba(6,182,212,0.07);}

.gc-img-wrap{
  width:120px;
  height:120px;
  margin-bottom:10px;
  background:#f3efe9;overflow:hidden;
  display:flex;align-items:center;justify-content:center;
}
@media(max-width:540px){.gc-img-wrap{width:56px;height:56px;}}

.gc-img{width:100%;height:100%;object-fit:contain;}
.gc-fallback{
  font-size:1.5rem;font-weight:800;color:#94a3b8;
  font-family:'Space Grotesk',sans-serif;
}
.gc-noun{
  font-family:'Space Grotesk',sans-serif;
  font-size:0.72rem;font-weight:600;color:#475569;
  text-transform:capitalize;text-align:center;
}
.gc-value{
  font-family:'Space Grotesk',sans-serif;
  font-size:1.15rem;font-weight:800;color:#0f172a;
}

/* ── REGISTER INPUT BAR ── */
.reg-wrap{
  width:100%;
  border:1px solid #e2d9cc;
  border-radius:12px;
  overflow:hidden;
}

.reg-header,
.reg-inputs{
  display:grid;
  grid-template-columns:repeat(15,minmax(55px,1fr));
}

.reg-head-cell{
  height:40px;
  display:flex;
  align-items:center;
  justify-content:center;
}

.reg-input-cell{
  height:52px;
  width:100%;
  text-align:center;
  border:none;
  border-right:1px solid #e2d9cc;
  font-size:18px;
  font-weight:700;
}

.reg-input-cell:disabled{
  background:#f1f5f9;
  color:#cbd5e1;
  cursor:not-allowed;
}

.reg-input-cell:last-child{
  border-right:none;
}
.reg-inputs{
  display:grid;grid-template-columns:repeat(15,1fr);
  background:#fff;min-width:420px;
}
.reg-input-cell{
  border:none;border-right:1px solid #e2d9cc;border-top:1.5px solid #e2d9cc;
  padding:12px 0;text-align:center;
  font-family:'Space Grotesk',sans-serif;font-size:1rem;font-weight:700;color:#0f172a;
  background:#fff;outline:none;
  transition:background 0.15s;
}
.reg-input-cell:last-child{border-right:none;}
.reg-input-cell:focus{background:rgba(6,182,212,0.07);}
.reg-input-cell::placeholder{color:#d1c4b0;font-weight:400;}

/* ── BUTTONS ── */
.btn-primary{
  width:100%;padding:13px;border-radius:10px;border:none;
  background:linear-gradient(135deg,#06B6D4,#0891b2);
  color:#fff;font-family:'Space Grotesk',sans-serif;
  font-weight:700;font-size:0.94rem;cursor:pointer;
  box-shadow:0 0 18px rgba(6,182,212,0.22);
  transition:transform 0.18s,box-shadow 0.18s,opacity 0.18s;
}
.btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 0 26px rgba(6,182,212,0.36);}
.btn-primary:disabled{opacity:0.36;cursor:not-allowed;box-shadow:none;transform:none;}
.btn-outline{
  width:100%;padding:12px;border-radius:10px;
  border:1.5px solid #e2d9cc;background:transparent;
  color:#475569;font-size:0.9rem;font-weight:500;cursor:pointer;
  transition:border-color 0.18s,color 0.18s;
}
.btn-outline:hover{border-color:#06B6D4;color:#0891b2;}

/* ── ALERTS ── */
.alert-error{
  padding:11px 14px;border-radius:9px;
  background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);
  color:#dc2626;font-size:0.84rem;line-height:1.5;
}

/* ── SUCCESS ── */
.success-box{
  display:flex;flex-direction:column;align-items:center;
  gap:14px;padding:32px 20px;text-align:center;
}
.success-check{
  width:64px;height:64px;border-radius:50%;
  background:rgba(34,197,94,0.12);border:2px solid rgba(34,197,94,0.3);
  display:flex;align-items:center;justify-content:center;
  font-size:1.8rem;font-weight:700;color:#16a34a;
}
.success-title{font-family:'Space Grotesk',sans-serif;font-size:1.4rem;font-weight:700;color:#0f172a;}
.success-msg{font-size:0.88rem;color:#64748b;line-height:1.65;max-width:380px;}

/* ── TOAST ── */
.toast{
  position:fixed;bottom:26px;right:22px;z-index:9999;
  display:flex;align-items:center;gap:10px;
  padding:13px 18px;border-radius:11px;max-width:340px;
  font-size:0.87rem;font-weight:500;cursor:pointer;
  box-shadow:0 8px 28px rgba(15,23,42,0.13);
  animation:slideUp 0.28s ease;
}
.toast-success{background:#f0fdf4;border:1px solid rgba(34,197,94,0.3);color:#15803d;}
.toast-error  {background:#fef2f2;border:1px solid rgba(239,68,68,0.28);color:#dc2626;}
@keyframes slideUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}

/* ── PAGE FOOTER ── */
.page-footer{
  text-align:center;margin-top:28px;
  font-size:0.75rem;color:#94a3b8;position:relative;z-index:1;
}
`;
