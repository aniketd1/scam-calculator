import { useState, useCallback, useRef, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

/* ═══════════════════════════════════════════════════════════════
   SENTENCES
═══════════════════════════════════════════════════════════════ */
const SENTENCES = [
  "The teacher goes to school by bus near river.",
  "The doctor works in hospital with mobile.",
  "The farmer lives in house near river with dog.",
  "The teacher travels by train to school near park.",
  "The doctor plays football in park with dog and cat.",
  "The teacher writes on table in school with laptop.",
  "The doctor checks eye in hospital with hand.",
  "The farmer grows carrot near mountain green land.",
  "The doctor uses laptop in hospital with mobile.",
  "The farmer drives car near ocean with dog.",
  "The teacher eats apple in park with banana.",
  "The doctor drinks milk in house with bread.",
  "The teacher sits on chair in school with table.",
  "The doctor uses tv in hospital.",
  "The farmer sees dog near river.",
  "The teacher uses laptop with mobile.",
  "The doctor watches tv in house with mobile.",
  "The teacher plays guitar in school with piano.",
  "The doctor hears drums in hospital with guitar.",
  "The farmer eats rice in house with milk.",
  "The teacher plays cricket in park with football.",
  "The doctor plays tennis with cricket in park.",
  "The teacher draws sunflower in school with rose.",
  "The doctor plants rose near river.",
  "The farmer plants spinach near ocean.",
  "The teacher uses laptop and mobile.",
  "The doctor eats banana with mango.",
  "The teacher uses tv in school with mobile.",
  "The doctor checks ear with eye.",
  "The farmer works near mountain.",
  "The teacher sits on bed with chair.",
  "The doctor sleeps on bed near ocean.",
  "The teacher travels by train.",
  "The doctor travels by bus.",
  "The farmer travels by car.",
  "The teacher sees parrot with pigeon.",
  "The doctor hears sparrow near river.",
  "The teacher sees pigeon near ocean.",
  "The doctor sees elephant near park.",
  "The farmer sees cat with dog.",
  "The teacher uses mobile with laptop.",
  "The doctor uses laptop with mobile.",
  "The teacher uses mobile with tv.",
  "The doctor uses laptop with tv.",
  "The farmer uses mobile in house near river.",
  "The teacher draws house with mountain.",
  "The doctor draws ocean with beach.",
  "The teacher draws river with mountain.",
  "The doctor draws beach with ocean.",
  "The farmer draws mountain with river."
];

/* ═══════════════════════════════════════════════════════════════
   ASSET MAP
═══════════════════════════════════════════════════════════════ */
const _nounGlob = import.meta.glob("../assets/nouns/*.png", { eager: true });
const _fileMap = {};
for (const [fullPath, module] of Object.entries(_nounGlob)) {
  const stem = fullPath.split("/").pop().replace(/\.png$/i, "").toLowerCase();
  _fileMap[stem] = module.default;
}
const NOUN_STEM = {
  apple: "apple",
  banana: "banana",
  beach: "beach",
  bed: "bed",
  black: "black",
  blue: "blue",
  bread: "bread",
  bus: "bus",
  car: "car",
  carrot: "carrot",
  cat: "cat",
  chair: "chair",
  cricket: "cricket",
  doctor: "doctor",
  dog: "dog",
  dress: "dress",
  drums: "drums",
  ear: "ear",
  elephant: "elephant",
  eye: "eye",
  farmer: "farmer",
  football: "football",
  green: "green",
  guitar: "guitar",
  hand: "hand",
  hospital: "hospital",
  house: "house",
  laptop: "laptop",
  lotus: "lotus",
  mango: "mango",
  milk: "milk",
  mobile: "mobile",
  mountain: "mountain",
  ocean: "ocean",
  park: "park",
  parrot: "parrot",
  piano: "piano",
  pigeon: "pigeon",
  potato: "potato",
  purple: "purple",
  red: "red",
  rice: "rice",
  river: "river",
  rose: "rose",
  school: "school",
  shirt: "shirt",
  sparrow: "sparrow",
  spinach: "spinach",
  sunflower: "sunflower",
  table: "table",
  teacher: "teacher",
  tennis: "tennis",
  train: "train",
  tshirt: "tshirt",
  tv: "tv",
  yellow: "yellow",
};
function getNounImage(noun) {
  const stem = NOUN_STEM[noun?.toLowerCase()];

  if (!stem) {
    console.log("Missing NOUN_STEM mapping:", noun);
    return null;
  }

  const image =
    _fileMap[stem] ??
    _fileMap[stem.replace(/\s+/g, "")];

  if (!image) {
    console.log("Missing PNG file:", noun, "->", stem);
  }

  return image || null;
}
/* ═══════════════════════════════════════════════════════════════
   CONSTANTS  — A through J only (10 positions)
══════════════════════════════════════════════════════════════════════════════ */
const POSITIONS = ["A","B","C","D","E","F","G","H","I","J"];
const DIGITS    = ["0","1","2","3","4","5","6","7","8","9"];

const NOUNS = new Set(Object.keys(NOUN_STEM));
function extractNouns(sentence) {
  return [...new Set(
    sentence.toLowerCase().replace(/[^a-z\s]/g,"").split(/\s+/).filter(w => NOUNS.has(w))
  )];
}
function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
/* ═══════════════════════════════════════════════════════════════
   API
═══════════════════════════════════════════════════════════════ */
async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify(body),
  });
  return res.json();
}

/* ═══════════════════════════════════════════════════════════════
   GRID CARD
═══════════════════════════════════════════════════════════════ */
function GridCard({ noun, value, isSelected, onSelect }) {
  const img = getNounImage(noun);
  return (
    <button type="button" className={`gc-card${isSelected ? " gc-card--selected" : ""}`} onClick={onSelect}>
      <div className="gc-img-wrap">
        {img ? <img src={img} alt={noun} className="gc-img" />
              : <div className="gc-fallback">{noun?.[0]?.toUpperCase()}</div>}
      </div>
      <div className="gc-noun">{noun}</div>
      <div className="gc-value">{value}</div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REGISTER DROPDOWN BAR  A–J
   Rules:
   - Each position is a <select> showing digits 0–9
   - A digit already chosen in another position is HIDDEN from
     a third dropdown if it has already been used TWICE
   - So each digit can appear at most 2 times total across all 10 boxes
═══════════════════════════════════════════════════════════════ */
function RegisterDropdownBar({ inputs, onChange }) {
  // Count how many times each digit is already used
  const digitCount = {};
  for (const v of inputs) {
    if (v !== "") digitCount[v] = (digitCount[v] || 0) + 1;
  }

  return (
    <div className="reg-wrap">
      <div className="reg-header">
        {POSITIONS.map(p => <div key={p} className="reg-head-cell">{p}</div>)}
      </div>
      <div className="reg-dropdowns">
        {POSITIONS.map((p, i) => {
          const current = inputs[i];
          return (
            <select
              key={p}
              className="reg-select"
              value={current}
              disabled={i > 0 && inputs[i - 1] === ""}
              onChange={(e) => onChange(i, e.target.value)}
            >
              <option value="">·</option>
              {DIGITS.map(d => {
                const usedElsewhere = digitCount[d] - (current === d ? 1 : 0);
                // Hide digit if it's already been used twice in OTHER positions
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

/* ═══════════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════════ */
function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.type}`} onClick={onClose}>
      <span>{toast.type === "success" ? "✓" : "✕"}</span>
      <span>{toast.message}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════ */
export default function Auth() {
  const [mode,        setMode]        = useState("signup");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [toast,       setToast]       = useState(null);

  // signup
  const [sentence,    setSentence]    = useState("");
  const [offset,      setOffset]      = useState("5");
  const [positions,   setPositions]   = useState(["A","D"]);
  const [shuffledSentences, setShuffledSentences] = useState(() => shuffle([...SENTENCES]));
  const [sentencePreview, setSentencePreview] = useState(null);

  // login
  const [loginStep,         setLoginStep]         = useState("creds");
  const [sessionId,         setSessionId]         = useState("");
  const [challengeGrid,     setChallengeGrid]     = useState([]);
  const [selectedGridIndex, setSelectedGridIndex] = useState(null);
  // 10 dropdowns A–J
  const [regInputs,         setRegInputs]         = useState(Array(10).fill(""));

  // Overlay state — shown after clicking "Continue to Register"
  const [overlay,           setOverlay]           = useState(null);
  // { noun, value, imgSrc, offset, pos1, pos2 }

  const registerRef = useRef(null);

  const signupNouns   = sentence ? extractNouns(sentence) : [];
  const allRegFilled  = regInputs.every(v => v !== "");

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  const resetAll = useCallback((newMode) => {
    setMode(newMode); setEmail(""); setPassword(""); setError(""); setToast(null);
    setSentence(""); setOffset("5"); setPositions(["A","D"]);
    setSentencePreview(null);
    setLoginStep("creds"); setSessionId(""); setChallengeGrid([]);
    setSelectedGridIndex(null);
    setRegInputs(Array(10).fill("")); setOverlay(null);
    if (newMode === "signup") setShuffledSentences(shuffle([...SENTENCES]));
  }, []);

  const setPos = (slot, val) => setPositions(p => { const n=[...p]; n[slot]=val; return n; });

  /* ── SIGNUP ── */
  const handleSignup = async () => {
    setError("");
    if (!email.trim())    { setError("Enter your email."); return; }
    if (!password.trim()) { setError("Enter a password."); return; }
    if (!sentence)        { setError("Select a sentence."); return; }
    const off = parseInt(offset, 10);
    if (isNaN(off) || off < 1 || off > 99) { setError("Offset must be 1–99."); return; }
    if (positions[0] === positions[1])       { setError("Positions must be different."); return; }
    setLoading(true);
    try {
      const data = await postJson("/api/auth/signup", {
        email, password, selectedSentence: sentence,
        secretPositions: positions, offset: off,
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
      setRegInputs(Array(10).fill(""));
      setSelectedGridIndex(null);
      setLoginStep("grid");
    } catch { setError("Server error. Try again."); }
    finally { setLoading(false); }
  };

  /* ── LOGIN STEP 2 → call /register, show overlay, scroll to bar ── */
  const handleContinueToRegister = async () => {
    setError("");
    if (selectedGridIndex === null) {
      setError("Tap the image you found before continuing.");
      return;
    }
    setLoading(true);
    try {
      const data = await postJson("/api/auth/register", { sessionId, challengeGrid });
      if (!data.success) {
        setError(data.error || "Could not build register.");
        setLoginStep("creds"); return;
      }
      // Build overlay info from revealedItem + user's stored positions/offset
      // Server doesn't send positions/offset back — we stored them client-side at signup
      // We show the revealed image + its value so the user can do the mental math
      const { revealedItem } = data;
      setOverlay({
        noun:   revealedItem.noun,
        value:  revealedItem.value,
        imgSrc: getNounImage(revealedItem.noun),
      });
      setRegInputs(Array(10).fill(""));
      setLoginStep("register");
      // Scroll to register bar after render
      setTimeout(() => registerRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 120);
    } catch { setError("Server error. Try again."); }
    finally { setLoading(false); }
  };

  // Dismiss overlay on outside click
  const handleOverlayBgClick = (e) => {
    if (e.target === e.currentTarget) setOverlay(null);
  };

  /* ── LOGIN STEP 3 VERIFY ──
     Accept both normal and reversed digit order.
     e.g. result=67 → accept [6,7] at positions OR [7,6] at positions
  ── */
  const handleVerify = async () => {
    setError("");
    if (!allRegFilled) { setError("Fill all 10 positions (A – J)."); return; }
    setLoading(true);
    try {
      const data = await postJson("/api/auth/verify", {
        sessionId,
        registerInputs: regInputs.map(v => parseInt(v, 10)),
      });
      if (!data.success) {
        setError(data.error || "Verification failed. Start over.");
        setLoginStep("creds"); setChallengeGrid([]); setSessionId(""); setOverlay(null);
        return;
      }
      if (data.token) localStorage.setItem("token", data.token);
      showToast("success", data.message || "Identity verified. Welcome back!");
      setLoginStep("success");
    } catch { setError("Server error. Try again."); }
    finally { setLoading(false); }
  };

  /* ── RENDER ── */
  return (
    <>
      <style>{CSS}</style>
      <Toast toast={toast} onClose={() => setToast(null)} />

      {sentencePreview && (
        <div className="sentence-preview-bg" onClick={(e) => { if (e.target === e.currentTarget) setSentencePreview(null); }}>
          <div className="sentence-preview-card">
            <button className="overlay-close" onClick={() => setSentencePreview(null)}>✕</button>
            <p className="overlay-eyebrow">Sentence preview</p>
            <h2 className="overlay-title">Images for your selected sentence</h2>
            <p className="overlay-copy">Only this sentence is shown with images. Close the preview to continue.</p>
            <div className="sentence-preview-grid">
              {sentencePreview.nouns.map(noun => {
                const img = getNounImage(noun);
                return (
                  <div key={noun} className="sentence-preview-item">
                    <div className="sentence-preview-img-wrap">
                      {img ? <img src={img} alt={noun} className="sentence-preview-img" />
                           : <div className="sentence-preview-fallback">{noun?.[0]?.toUpperCase()}</div>}
                    </div>
                    <div className="sentence-preview-label">{noun}</div>
                  </div>
                );
              })}
            </div>
            <button className="overlay-btn" onClick={() => setSentencePreview(null)}>
              Got it — continue
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY — shown after grid step, before register */}
      {overlay && (
        <div className="overlay-bg" onClick={handleOverlayBgClick}>
          <div className="overlay-card">
            <button className="overlay-close" onClick={() => setOverlay(null)}>✕</button>
            <p className="overlay-eyebrow">Your secret image</p>
            <div className="overlay-img-wrap">
              {overlay.imgSrc
                ? <img src={overlay.imgSrc} alt={overlay.noun} className="overlay-img" />
                : <div className="overlay-fallback">{overlay.noun?.[0]?.toUpperCase()}</div>
              }
            </div>
            <div className="overlay-noun">{overlay.noun}</div>
            <div className="overlay-value">{overlay.value}</div>
            <div className="overlay-math">
              <div className="overlay-math-row">
                <span className="overlay-math-label">Image value</span>
                <span className="overlay-math-num">{overlay.value}</span>
              </div>
              <div className="overlay-math-row">
                <span className="overlay-math-label">+ Your offset</span>
                <span className="overlay-math-num overlay-math-dim">???</span>
              </div>
              <div className="overlay-math-divider" />
              <div className="overlay-math-row">
                <span className="overlay-math-label">= Your result</span>
                <span className="overlay-math-num overlay-math-dim">??</span>
              </div>
            </div>
            <p className="overlay-hint">
              Add your private offset to <strong>{overlay.value}</strong>. Split the result into two digits.
              Enter those digits at your two secret positions (A–J). Reversed order is also accepted.
            </p>
            <button className="overlay-btn" onClick={() => setOverlay(null)}>
              Got it — fill the register →
            </button>
          </div>
        </div>
      )}

      <div className="auth-page">
        <header className="auth-hero">
          <p className="hero-eyebrow">Visual Sentence Password</p>
          <h1 className="hero-title">Sign in with your <span className="hero-accent">Visual Sentence</span></h1>
          <p className="hero-sub">
            Pick a sentence, a private offset, and two secret positions (A–J). At login: spot your image,
            add your offset, and enter the two digits at your positions. Reversed order is fine too.
          </p>
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
                    <button className={`mode-tab${mode==="signup"?" mode-tab--active":""}`} onClick={() => resetAll("signup")}>Create account</button>
                    <button className={`mode-tab${mode==="login"?" mode-tab--active":""}`}  onClick={() => resetAll("login")}>Sign in</button>
                  </div>
                )}

                {/* ══ SIGNUP ══ */}
                {mode === "signup" && (
                  <div className="form-stack">
                    <div className="field-row">
                      <div className="field-group">
                        <label className="field-label">Email address</label>
                        <input className="field-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
                      </div>
                      <div className="field-group">
                        <label className="field-label">Password</label>
                        <input className="field-input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} />
                      </div>
                    </div>

                    <div>
                      <p className="section-label">Choose your visual password sentence</p>
                      <p className="section-hint">One of these nouns will appear in your login grid. Find it, add your offset, and enter the digits at your two positions.</p>
                      <div className="sentence-list">
                        {shuffledSentences.map(s => {
                          const ns = extractNouns(s);
                          const isSel = sentence === s;
                          return (
                            <button key={s} type="button"
                              className={`sentence-card${isSel?" sentence-card--selected":""}`}
                              onClick={() => { setSentence(s); setSentencePreview({ sentence: s, nouns: ns }); }}
                            >
                              <div className="sentence-text">{s}</div>
                              <div className="noun-chips">{ns.map(n=><span key={n} className="noun-chip">{n}</span>)}</div>

                              {isSel && (
                                <div className="card-controls" onClick={e=>e.stopPropagation()}>
                                  <div className="control-row">
                                    <label className="ctrl-label">Offset</label>
                                    <input className="ctrl-offset" type="text" inputMode="numeric" maxLength={2}
                                      value={offset} onChange={e=>setOffset(e.target.value.replace(/\D/,"").slice(0,2))} />
                                    <span className="ctrl-hint">1 – 99</span>
                                  </div>
                                  <div className="control-row">
                                    <label className="ctrl-label">Positions</label>
                                    <select className="ctrl-select" value={positions[0]} onChange={e=>setPos(0,e.target.value)}>
                                      {POSITIONS.map(p=><option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <span className="ctrl-plus">+</span>
                                    <select className="ctrl-select" value={positions[1]} onChange={e=>setPos(1,e.target.value)}>
                                      {POSITIONS.map(p=><option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <span className="ctrl-hint">A – J only · digits of ({offset||5} + image value)</span>
                                  </div>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {error && <div className="alert-error">{error}</div>}
                    <button className="btn-primary" disabled={loading} onClick={handleSignup}>
                      {loading ? "Creating account…" : "Create Account"}
                    </button>
                  </div>
                )}

                {/* ══ LOGIN ══ */}
                {mode === "login" && (
                  <>
                    {/* Step 1 */}
                    {loginStep === "creds" && (
                      <div className="form-stack">
                        <div className="step-badge">Step 1 of 3 — Credentials</div>
                        <div className="field-group">
                          <label className="field-label">Email address</label>
                          <input className="field-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLoginCreds()} />
                        </div>
                        <div className="field-group">
                          <label className="field-label">Password</label>
                          <input className="field-input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLoginCreds()} />
                        </div>
                        {error && <div className="alert-error">{error}</div>}
                        <button className="btn-primary" disabled={loading} onClick={handleLoginCreds}>
                          {loading ? "Please wait…" : "Next →"}
                        </button>
                      </div>
                    )}

                    {/* Step 2 — Grid */}
                    {loginStep === "grid" && (
                      <div className="form-stack">
                        <div className="step-badge">Step 2 of 3 — Find your secret image</div>
                        <div className="info-box">
                          <strong>Look for your image.</strong> One noun from your sentence is hidden in this grid.
                          Find it, note the number beneath it, then click Continue — an overlay will remind you of the
                          image and show you how to calculate your register entry.
                        </div>
                        <div className="cg-grid">
                          {challengeGrid.length > 0
                            ? challengeGrid.map((item,i) => (
                                <GridCard
                                  key={i}
                                  noun={item.noun}
                                  value={item.value}
                                  isSelected={selectedGridIndex === i}
                                  onSelect={() => setSelectedGridIndex(i)}
                                />
                              ))
                            : <div style={{gridColumn:"1/-1",textAlign:"center",color:"#dc2626",padding:40}}>No grid received — start over.</div>
                          }
                        </div>
                        {error && <div className="alert-error">{error}</div>}
                        <button className="btn-primary" disabled={loading} onClick={handleContinueToRegister}>
                          {loading ? "Building register…" : "I've found my image →"}
                        </button>
                        <button className="btn-outline" onClick={() => resetAll("login")}>← Start over</button>
                      </div>
                    )}

                    {/* Step 3 — Register dropdowns */}
                    {loginStep === "register" && (
                      <div className="form-stack" ref={registerRef}>
                        <div className="step-badge">Step 3 of 3 — Fill positions A – J</div>
                        <div className="info-box">
                          <strong>Use the dropdowns below.</strong> At your two secret positions enter the two
                          digits of your result (image value + offset). Fill the other positions with any digit.
                          Each digit may appear at most twice across all 10 boxes. Reversed digit order is also accepted.
                          {overlay && (
                            <button className="show-overlay-btn" onClick={() => setOverlay(overlay)}>
                              👁 Show my secret image
                            </button>
                          )}
                        </div>
                        <RegisterDropdownBar inputs={regInputs} onChange={(i,v) => setRegInputs(p=>{const n=[...p];n[i]=v;return n;})} />
                        <p className="field-hint">
                          Example: image = 47, offset = 5 → result = 52 → enter 5 at pos A, 2 at pos D (or 2 at A, 5 at D).
                        </p>
                        {error && <div className="alert-error">{error}</div>}
                        <button className="btn-primary" disabled={loading||!allRegFilled} onClick={handleVerify}>
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

/* ═══════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
button,input,select{font-family:inherit;}

/* PAGE */
.auth-page{min-height:100vh;background:#f7efe6;color:#0f172a;font-family:'Inter',sans-serif;padding:48px 20px 72px;position:relative;overflow:hidden;}
.auth-page::before{content:'';position:fixed;top:-140px;right:-140px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(6,182,212,0.06) 0%,transparent 70%);pointer-events:none;z-index:0;}
.auth-page::after{content:'';position:fixed;bottom:-120px;left:-120px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,0.04) 0%,transparent 70%);pointer-events:none;z-index:0;}

/* HERO */
.auth-hero{text-align:center;max-width:680px;margin:0 auto 36px;position:relative;z-index:1;}
.hero-eyebrow{display:inline-block;padding:4px 14px;border-radius:99px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);font-size:0.72rem;font-weight:600;color:#d97706;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;}
.hero-title{font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:clamp(1.6rem,3.2vw,2.4rem);letter-spacing:-0.04em;line-height:1.12;color:#0f172a;margin-bottom:10px;}
.hero-accent{color:#06B6D4;}
.hero-sub{font-size:0.88rem;color:#64748b;line-height:1.7;}

/* SHELL + CARD */
.auth-shell{max-width:920px;margin:0 auto;position:relative;z-index:1;}
.auth-card{background:#fbf7f0;border:1px solid #e2d9cc;border-radius:20px;padding:36px 40px;display:flex;flex-direction:column;gap:20px;box-shadow:0 4px 28px rgba(15,23,42,0.06);}
@media(max-width:600px){.auth-card{padding:24px 18px;}}

/* TABS */
.mode-tabs{display:flex;gap:8px;}
.mode-tab{flex:1;padding:11px;border-radius:99px;background:#fff;border:1.5px solid #e2d9cc;color:#475569;font-size:0.9rem;font-weight:500;cursor:pointer;transition:all 0.18s;}
.mode-tab:hover{border-color:rgba(6,182,212,0.4);color:#0891b2;}
.mode-tab--active{background:linear-gradient(135deg,#06B6D4,#0891b2);color:#fff;border-color:transparent;font-weight:700;box-shadow:0 4px 14px rgba(6,182,212,0.22);}

/* STEP BADGE */
.step-badge{padding:9px 14px;border-radius:9px;background:rgba(6,182,212,0.07);border:1px solid rgba(6,182,212,0.15);font-size:0.83rem;color:#0891b2;font-weight:600;}

/* INFO BOX */
.info-box{padding:13px 16px;border-radius:11px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);font-size:0.84rem;color:#92400e;line-height:1.65;}
.info-box strong{font-weight:700;color:#78350f;}
.show-overlay-btn{display:block;margin-top:10px;background:none;border:1px solid rgba(245,158,11,0.35);border-radius:7px;padding:5px 12px;font-size:0.8rem;color:#92400e;cursor:pointer;transition:background 0.15s;}
.show-overlay-btn:hover{background:rgba(245,158,11,0.08);}

/* FORM */
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

/* SENTENCE PICKER */
.sentence-list{display:flex;flex-direction:column;gap:8px;max-height:380px;overflow-y:auto;padding-right:4px;}
.sentence-list::-webkit-scrollbar{width:4px;}
.sentence-list::-webkit-scrollbar-thumb{background:#d1c4b0;border-radius:2px;}
.sentence-card{width:100%;padding:13px 16px;border-radius:12px;background:#fff;border:1.5px solid #e2d9cc;cursor:pointer;text-align:left;transition:border-color 0.16s,box-shadow 0.16s,transform 0.14s;}
.sentence-card:hover{border-color:rgba(6,182,212,0.4);transform:translateY(-1px);box-shadow:0 3px 12px rgba(6,182,212,0.08);}
.sentence-card--selected{border-color:#06B6D4;background:rgba(6,182,212,0.04);box-shadow:0 0 0 3px rgba(6,182,212,0.1);}
.sentence-text{font-size:0.87rem;color:#334155;line-height:1.55;}
.noun-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px;}
.noun-chip{display:inline-flex;align-items:center;justify-content:center;padding:4px 8px;border-radius:999px;background:rgba(15,23,42,0.05);color:#475569;font-size:0.72rem;font-weight:600;text-transform:capitalize;}
.sentence-preview-bg{position:fixed;inset:0;background:rgba(15,23,42,0.7);display:flex;align-items:center;justify-content:center;z-index:9500;padding:18px;}
.sentence-preview-card{position:relative;background:#fbf7f0;border:1px solid #e2d9cc;border-radius:28px;padding:36px 34px;max-width:880px;width:100%;display:flex;flex-direction:column;gap:18px;box-shadow:0 28px 80px rgba(15,23,42,0.26);}
.sentence-preview-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:14px;}
.sentence-preview-item{display:flex;flex-direction:column;align-items:center;gap:12px;padding:12px;border-radius:18px;background:#fff;border:1px solid #e2d9cc;}
.sentence-preview-img-wrap{width:120px;height:120px;border-radius:22px;background:#f3efe9;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid #e2d9cc;}
.sentence-preview-img{width:100%;height:100%;object-fit:contain;}
.sentence-preview-fallback{font-size:2.2rem;font-weight:800;color:#94a3b8;font-family:'Space Grotesk',sans-serif;}
.sentence-preview-label{font-size:0.9rem;font-weight:700;color:#0f172a;text-transform:capitalize;}
.overlay-title{font-size:1.2rem;font-weight:800;color:#0f172a;line-height:1.2;}
.overlay-copy{font-size:0.9rem;color:#475569;line-height:1.6;}
.sentence-images{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;}
.sentence-image{width:34px;height:34px;object-fit:contain;border-radius:12px;border:1px solid #e2d9cc;background:#fff;}
.sentence-image--fallback{display:inline-flex;align-items:center;justify-content:center;font-size:0.85rem;color:#475569;background:#f8fafc;}
.card-controls{margin-top:12px;padding-top:12px;border-top:1px dashed rgba(6,182,212,0.25);display:flex;flex-direction:column;gap:10px;}
.control-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.ctrl-label{font-size:0.73rem;font-weight:700;color:#475569;letter-spacing:0.05em;text-transform:uppercase;white-space:nowrap;width:60px;}
.ctrl-offset{width:60px;padding:7px 10px;border-radius:8px;border:1.5px solid #e2d9cc;background:#fff;font-family:'Space Grotesk',sans-serif;font-size:1.1rem;font-weight:800;color:#0f172a;text-align:center;outline:none;transition:border-color 0.18s;}
.ctrl-offset:focus{border-color:#06B6D4;}
.ctrl-select{padding:7px 10px;border-radius:8px;border:1.5px solid #e2d9cc;background:#fff;font-family:'Space Grotesk',sans-serif;font-size:0.9rem;font-weight:700;color:#0f172a;cursor:pointer;outline:none;transition:border-color 0.18s;}
.ctrl-select:focus{border-color:#06B6D4;}
.ctrl-plus{font-family:'Space Grotesk',sans-serif;font-weight:800;color:#06B6D4;font-size:1.1rem;}
.ctrl-hint{font-size:0.75rem;color:#94a3b8;line-height:1.5;}

/* CHALLENGE GRID */
.cg-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;width:100%;margin-top:4px;}
@media(max-width:900px){.cg-grid{grid-template-columns:repeat(3,1fr);}}
@media(max-width:540px){.cg-grid{grid-template-columns:repeat(2,1fr);gap:10px;}}
.gc-card{background:#fff;border:1px solid #e2d9cc;border-radius:12px;padding:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;transition:border-color 0.18s,box-shadow 0.18s;cursor:pointer;}
.gc-card:hover{border-color:rgba(6,182,212,0.35);box-shadow:0 3px 10px rgba(6,182,212,0.07);}
.gc-card--selected{border-color:#06B6D4;box-shadow:0 0 0 4px rgba(6,182,212,0.18);}
.gc-img-wrap{width:90px;height:90px;background:#f3efe9;border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;}
@media(max-width:540px){.gc-img-wrap{width:56px;height:56px;}}
.gc-img{width:100%;height:100%;object-fit:contain;}
.gc-fallback{font-size:1.5rem;font-weight:800;color:#94a3b8;font-family:'Space Grotesk',sans-serif;}
.gc-noun{font-family:'Space Grotesk',sans-serif;font-size:0.72rem;font-weight:600;color:#475569;text-transform:capitalize;text-align:center;}
.gc-value{font-family:'Space Grotesk',sans-serif;font-size:1.15rem;font-weight:800;color:#0f172a;}

/* REGISTER DROPDOWN BAR — 10 cols */
.reg-wrap{width:100%;border:1px solid #e2d9cc;border-radius:12px;overflow:hidden;overflow-x:auto;}
.reg-header,.reg-dropdowns{display:grid;grid-template-columns:repeat(10,1fr);min-width:360px;}
.reg-head-cell{height:36px;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-size:0.75rem;font-weight:700;color:#475569;background:#f3efe9;border-bottom:1px solid #e2d9cc;}
.reg-select{border:none;border-right:1px solid #e2d9cc;border-top:1px solid #e2d9cc;padding:10px 0;text-align:center;font-family:'Space Grotesk',sans-serif;font-size:1rem;font-weight:700;color:#0f172a;background:#fff;outline:none;cursor:pointer;transition:background 0.15s;appearance:none;-webkit-appearance:none;text-align-last:center;}
.reg-select:last-child{border-right:none;}
.reg-select:focus{background:rgba(6,182,212,0.07);}

/* OVERLAY */
.overlay-bg{position:fixed;inset:0;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;z-index:9000;padding:20px;}
.overlay-card{position:relative;background:#fbf7f0;border:1px solid #e2d9cc;border-radius:20px;padding:36px 32px;max-width:360px;width:100%;display:flex;flex-direction:column;align-items:center;gap:14px;box-shadow:0 20px 60px rgba(15,23,42,0.2);animation:overlayIn 0.22s ease;}
@keyframes overlayIn{from{transform:scale(0.94);opacity:0}to{transform:scale(1);opacity:1}}
.overlay-close{position:absolute;top:14px;right:16px;background:none;border:none;font-size:1.1rem;color:#94a3b8;cursor:pointer;line-height:1;}
.overlay-close:hover{color:#0f172a;}
.overlay-eyebrow{font-size:0.72rem;font-weight:600;color:#0891b2;letter-spacing:0.08em;text-transform:uppercase;}
.overlay-img-wrap{width:110px;height:110px;border-radius:14px;background:#f3efe9;overflow:hidden;display:flex;align-items:center;justify-content:center;border:1px solid #e2d9cc;}
.overlay-img{width:100%;height:100%;object-fit:contain;}
.overlay-fallback{font-size:2rem;font-weight:800;color:#94a3b8;font-family:'Space Grotesk',sans-serif;}
.overlay-noun{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.1rem;color:#0f172a;text-transform:capitalize;}
.overlay-value{font-family:'Space Grotesk',sans-serif;font-size:2.4rem;font-weight:800;color:#06B6D4;letter-spacing:-0.03em;line-height:1;}
.overlay-math{width:100%;background:#fff;border:1px solid #e2d9cc;border-radius:12px;padding:14px 18px;display:flex;flex-direction:column;gap:8px;}
.overlay-math-row{display:flex;justify-content:space-between;align-items:center;}
.overlay-math-label{font-size:0.83rem;color:#64748b;}
.overlay-math-num{font-family:'Space Grotesk',sans-serif;font-size:1rem;font-weight:800;color:#0f172a;}
.overlay-math-dim{color:#94a3b8;}
.overlay-math-divider{height:1px;background:#e2d9cc;}
.overlay-hint{font-size:0.8rem;color:#64748b;text-align:center;line-height:1.6;}
.overlay-btn{width:100%;padding:12px;border-radius:10px;border:none;background:linear-gradient(135deg,#06B6D4,#0891b2);color:#fff;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:0.94rem;cursor:pointer;box-shadow:0 0 18px rgba(6,182,212,0.22);transition:transform 0.18s,box-shadow 0.18s;}
.overlay-btn:hover{transform:translateY(-1px);box-shadow:0 0 26px rgba(6,182,212,0.36);}

/* BUTTONS */
.btn-primary{width:100%;padding:13px;border-radius:10px;border:none;background:linear-gradient(135deg,#06B6D4,#0891b2);color:#fff;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:0.94rem;cursor:pointer;box-shadow:0 0 18px rgba(6,182,212,0.22);transition:transform 0.18s,box-shadow 0.18s,opacity 0.18s;}
.btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 0 26px rgba(6,182,212,0.36);}
.btn-primary:disabled{opacity:0.36;cursor:not-allowed;box-shadow:none;transform:none;}
.btn-outline{width:100%;padding:12px;border-radius:10px;border:1.5px solid #e2d9cc;background:transparent;color:#475569;font-size:0.9rem;font-weight:500;cursor:pointer;transition:border-color 0.18s,color 0.18s;}
.btn-outline:hover{border-color:#06B6D4;color:#0891b2;}

/* ALERTS */
.alert-error{padding:11px 14px;border-radius:9px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);color:#dc2626;font-size:0.84rem;line-height:1.5;}

/* SUCCESS */
.success-box{display:flex;flex-direction:column;align-items:center;gap:14px;padding:32px 20px;text-align:center;}
.success-check{width:64px;height:64px;border-radius:50%;background:rgba(34,197,94,0.12);border:2px solid rgba(34,197,94,0.3);display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:700;color:#16a34a;}
.success-title{font-family:'Space Grotesk',sans-serif;font-size:1.4rem;font-weight:700;color:#0f172a;}
.success-msg{font-size:0.88rem;color:#64748b;line-height:1.65;max-width:380px;}

/* TOAST */
.toast{position:fixed;bottom:26px;right:22px;z-index:9999;display:flex;align-items:center;gap:10px;padding:13px 18px;border-radius:11px;max-width:340px;font-size:0.87rem;font-weight:500;cursor:pointer;box-shadow:0 8px 28px rgba(15,23,42,0.13);animation:slideUp 0.28s ease;}
.toast-success{background:#f0fdf4;border:1px solid rgba(34,197,94,0.3);color:#15803d;}
.toast-error{background:#fef2f2;border:1px solid rgba(239,68,68,0.28);color:#dc2626;}
@keyframes slideUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}

/* FOOTER */
.page-footer{text-align:center;margin-top:28px;font-size:0.75rem;color:#94a3b8;position:relative;z-index:1;}
`;
