import { useState, useCallback, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

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

/* ── ASSET MAP ─────────────────────────────────────────────── */
const _nounGlob = import.meta.glob("../assets/nouns/*.png", { eager: true });
const _fileMap = {};
for (const [fullPath, module] of Object.entries(_nounGlob)) {
  const stem = fullPath.split("/").pop().replace(/\.png$/i, "").toLowerCase();
  _fileMap[stem] = module.default;
}
const NOUN_STEM = {
  doctor:"doctor", teacher:"teacher", farmer:"farmer", student:"student",
  child:"child", engineer:"engineer", driver:"driver", boy:"boy", girl:"girl",
  school:"school building", hospital:"hospital", house:"house",
  university:"university", park:"park", field:"field", road:"road",
  ocean:"ocean", mountain:"mountain", river:"river", beach:"beach",
  bus:"bus", train:"train", car:"car", laptop:"laptop", mobile:"mobile",
  tv:"tv", table:"table", chair:"chair", bed:"bed", guitar:"guitar",
  drums:"drums", piano:"piano", cricket:"cricket", football:"football",
  tennis:"tennis", apple:"apple", banana:"banana", mango:"mango",
  carrot:"carrot", rice:"rice", milk:"milk", bread:"bread", spinach:"spinach",
  dog:"dog", cat:"cat", parrot:"parrot", pigeon:"pigeon", sparrow:"sparrow",
  elephant:"elephant", sunflower:"sunflower", rose:"rose", lotus:"lotus",
  eye:"eye", ear:"ear", hand:"hand",
  japan:"japan flag", usa:"usa flag", india:"india flag",
};
function getNounImage(noun) {
  const stem = NOUN_STEM[noun?.toLowerCase()];
  if (!stem) return null;
  return _fileMap[stem] ?? _fileMap[stem.replace(/\s+/g, "")] ?? null;
}

/* ── CONSTANTS ─────────────────────────────────────────────── */
const POSITIONS = ["A","B","C","D","E"];
const DIGITS    = ["0","1","2","3","4","5","6","7","8","9"];

const NOUNS = new Set(Object.keys(NOUN_STEM));
function extractNouns(s) {
  return [...new Set(s.toLowerCase().replace(/[^a-z\s]/g,"").split(/\s+/).filter(w=>NOUNS.has(w)))];
}
function shuffle(a) {
  const r=[...a];
  for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}
  return r;
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomOffset() {
  return String(getRandomInt(0, 9)); // auto 0–9
}

function getRandomPositions() {
  const shuffled = shuffle(POSITIONS);
  return [shuffled[0], shuffled[1]]; // random pair like A+D, B+C, etc
}

/* ── API ───────────────────────────────────────────────────── */
async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method:"POST", headers:{"Content-Type":"application/json"},
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
        {img ? <img src={img} alt={noun} className="gc-img" />
             : <div className="gc-fallback">{noun?.[0]?.toUpperCase()}</div>}
      </div>
      <div className="gc-noun">{noun}</div>
      <div className="gc-value">{value}</div>
    </div>
  );
}

/* ── REGISTER DROPDOWN BAR A–E ─────────────────────────────── */
function RegisterDropdownBar({ inputs, serverRegister, onChange }) {
  const digitCount = {};
  for (const v of inputs) if (v !== "") digitCount[v] = (digitCount[v]||0)+1;

  return (
    <div className="reg-wrap">
      <div className="reg-header">
        {POSITIONS.map(p => <div key={p} className="reg-head-cell">{p}</div>)}
      </div>
      <div className="reg-dropdowns">
        {POSITIONS.map((p, i) => {
          const current = inputs[i];
          return (
            <select key={p} className="reg-select" value={current}
              onChange={e => onChange(i, e.target.value)}>
              <option value="">·</option>
              {DIGITS.map(d => {
                const usedElsewhere = (digitCount[d]||0) - (current===d ? 1 : 0);
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
      <span>{toast.type==="success"?"✓":"✕"}</span>
      <span>{toast.message}</span>
    </div>
  );
}

/* ── MAIN ──────────────────────────────────────────────────── */
export default function Auth() {
  const [mode,        setMode]        = useState("signup");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [toast,       setToast]       = useState(null);

  // signup
  const [sentence,    setSentence]    = useState("");
  const [offset,      setOffset]      = useState(() => getRandomOffset());
  const [positions,   setPositions]   = useState(() => getRandomPositions());
  const [shuffled,    setShuffled]    = useState(() => shuffle([...SENTENCES]));
  const [preview,     setPreview]     = useState(null);

  // login
  const [loginStep,       setLoginStep]       = useState("creds");
  const [sessionId,       setSessionId]       = useState("");
  const [challengeGrid,   setChallengeGrid]   = useState([]);
  const [serverRegister,  setServerRegister]  = useState(null); // number[10] from /register
  const [regInputs,       setRegInputs]       = useState(Array(5).fill(""));

  const registerRef = useRef(null);
  const createBtnRef = useRef(null);
  const allFilled   = regInputs.every(v => v !== "");

  const showToast = (type, msg) => { setToast({type,message:msg}); setTimeout(()=>setToast(null),4500); };

  const resetAll = useCallback((m) => {
    setMode(m); setEmail(""); setPassword(""); setError(""); setToast(null);
    setSentence(""); setOffset(getRandomOffset()); setPositions(getRandomPositions()); setPreview(null);
    setLoginStep("creds"); setSessionId(""); setChallengeGrid([]);
    setServerRegister(null); setRegInputs(Array(5).fill(""));
    if (m === "signup") {
      setOffset(getRandomOffset());
      setPositions(getRandomPositions());
      setShuffled(shuffle([...SENTENCES]));
    }
  }, []);

  const setPos = (slot, val) => {
    setPositions(prev => {
      const next = [...prev];
      next[slot] = val;

      // 🔥 If first changes → reset second
      if (slot === 0) {
        next[1] = "";
      }

      return next;
    });
  };

  /* ── SIGNUP ── */
  const handleSignup = () => {
    setError("");
    if (!positions[0] || !positions[1]) {
      setError("Select both positions.");
      return;
    }
    if (!email.trim())    { setError("Enter your email."); return; }
    if (!password.trim()) { setError("Enter a password."); return; }
    if (!sentence)        { setError("Select a sentence."); return; }
    const off = parseInt(offset,10);
    if (isNaN(off)||off<1||off>99) { setError("Offset must be 1–99."); return; }
    if (positions[0]===positions[1]) { setError("Positions must be different."); return; }
    setPreview({ sentence, nouns: extractNouns(sentence) });
  };

  const confirmSignup = async () => {
    setPreview(null); setLoading(true); setError("");
    try {
      const data = await postJson("/api/auth/signup", {
        email, password, selectedSentence: sentence,
        secretPositions: positions, offset: parseInt(offset,10),
      });
      if (!data.success) { setError(data.error||"Could not create account."); return; }
      if (data.token) localStorage.setItem("token", data.token);
      showToast("success","Account created! Sign in now.");
      resetAll("login");
    } catch { setError("Server error. Try again."); }
    finally { setLoading(false); }
  };

  /* ── LOGIN STEP 1 ── */
  const handleLoginCreds = async () => {
    setError("");
    if (!email.trim()||!password.trim()) { setError("Enter email and password."); return; }
    setLoading(true);
    try {
      const data = await postJson("/api/auth/login", { email, password });
      if (!data.success) { setError(data.error||"Invalid credentials."); return; }
      setSessionId(data.sessionId);
      setChallengeGrid(data.challengeGrid||[]);
      setRegInputs(Array(5).fill(""));
      setLoginStep("grid");
    } catch { setError("Server error. Try again."); }
    finally { setLoading(false); }
  };

  /* ── LOGIN STEP 2 — send ONLY sessionId, server builds register ── */
  const handleContinueToRegister = async () => {
    setError(""); setLoading(true);
    try {
      // ← Only sessionId sent. No grid values, no client logic.
      const data = await postJson("/api/auth/register", { sessionId });
      if (!data.success) {
        setError(data.error||"Could not build register.");
        setLoginStep("creds"); return;
      }
      setServerRegister(data.register);    // number[10] shown for reference
      setRegInputs(Array(5).fill(""));
      setLoginStep("register");
      setTimeout(() => registerRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 120);
    } catch { setError("Server error. Try again."); }
    finally { setLoading(false); }
  };

  /* ── LOGIN STEP 3 ── */
  const handleVerify = async () => {
    setError("");
    if (!allFilled) { setError("Fill all 5 positions (A – E)."); return; }
    setLoading(true);
    try {
      const data = await postJson("/api/auth/verify", {
        sessionId,
        registerInputs: regInputs.map(v => v === "" ? null : Number(v)),
      });
      if (regInputs.some(v => v === "")) {
        setError("Fill all fields");
        return;
      }
      if (!data.success) {
        setError(data.error||"Verification failed.");
        // If locked out or expired, force full restart
        if (!data.error?.includes("attempt")) {
          setLoginStep("creds"); setChallengeGrid([]); setSessionId("");
          setServerRegister(null); 
        }
        return;
      }
      if (data.token) localStorage.setItem("token", data.token);
      showToast("success", data.message||"Identity verified. Welcome back!");
      setLoginStep("success");
    } catch { setError("Server error. Try again."); }
    finally { setLoading(false); }
  };

  /* ── RENDER ── */
  return (
    <>
      <style>{CSS}</style>
      <Toast toast={toast} onClose={()=>setToast(null)} />

      {/* SIGNUP PREVIEW OVERLAY */}
      {preview && (
        <div className="overlay-bg" onClick={e=>{ if(e.target===e.currentTarget) setPreview(null); }}>
          <div className="overlay-card overlay-card--wide">
            <button className="overlay-close" onClick={()=>setPreview(null)}>✕</button>
            <p className="overlay-eyebrow">Confirm your setup</p>
            <h2 className="overlay-title">Review before creating account</h2>
            <div className="preview-details">
              <div className="preview-row"><span className="preview-key">Sentence</span><span className="preview-val">{preview.sentence}</span></div>
              <div className="preview-row"><span className="preview-key">Offset</span><span className="preview-val">{offset}</span></div>
              <div className="preview-row"><span className="preview-key">Positions</span><span className="preview-val">{positions[0]} &amp; {positions[1]}</span></div>
            </div>
            <div className="preview-grid">
              {preview.nouns.map(n => {
                const img = getNounImage(n);
                return (
                  <div key={n} className="preview-item">
                    <div className="preview-img-wrap">
                      {img ? <img src={img} alt={n} className="preview-img" />
                            : <div className="preview-fallback">{n[0].toUpperCase()}</div>}
                    </div>
                    <div className="preview-label">{n}</div>
                  </div>
                );
              })}
            </div>
            <p className="overlay-hint">These are the objects that can appear in your login grid. Memorise your offset and positions — they are never shown again.</p>
            <button className="overlay-btn" disabled={loading} onClick={confirmSignup}>
              {loading ? "Creating…" : "Confirm & create account"}
            </button>
          </div>
        </div>
      )}

      <div className="auth-page">
        <header className="auth-hero">
          <p className="hero-eyebrow">Visual Sentence Password</p>
          <h1 className="hero-title">Sign in with your <span className="hero-accent">Visual Sentence</span></h1>
          <p className="hero-sub">Pick a sentence, a private offset, and two secret positions (A–E). At login: spot your image, add your offset, enter the two digits at your positions. Reversed order is fine too.</p>
        </header>

        <div className="auth-shell">
          <div className="auth-card">

            {loginStep==="success" && (
              <div className="success-box">
                <div className="success-check">✓</div>
                <h2 className="success-title">Identity Verified</h2>
                <p className="success-msg">Your visual sentence login succeeded. Welcome back!</p>
                <button className="btn-outline" onClick={()=>resetAll("login")}>Sign in again</button>
              </div>
            )}

            {loginStep!=="success" && (
              <>
                {(mode==="signup"||loginStep==="creds") && (
                  <div className="mode-tabs">
                    <button className={`mode-tab${mode==="signup"?" mode-tab--active":""}`} onClick={()=>resetAll("signup")}>Create account</button>
                    <button className={`mode-tab${mode==="login"?" mode-tab--active":""}`}  onClick={()=>resetAll("login")}>Sign in</button>
                  </div>
                )}

                {/* ══ SIGNUP ══ */}
                {mode==="signup" && (
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
                    <p className="section-label">Choose your visual password sentence</p>
                    <p className="section-hint">One noun from your sentence will appear in the login grid. Find it, add your offset, enter the digits at your two secret positions.</p>
                    <div className="sentence-list">
                      {shuffled.map(s => {
                        const ns = extractNouns(s);
                        const isSel = sentence===s;
                        return (
                          <div
                            key={s}
                            role="button"
                            tabIndex={0}
                            className={`sentence-card${isSel?" sentence-card--selected":""}`}
                            onClick={() => {
                              setSentence(s);

                              setTimeout(() => {
                                createBtnRef.current?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "center",
                                });
                              }, 100);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                setSentence(s);
                              }
                            }}
                          >
                            <div className="sentence-text">{s}</div>
                            <div className="noun-chips">{ns.map(n=><span key={n} className="noun-chip">{n}</span>)}</div>
                            {isSel && (
                              <div className="card-controls" onClick={e=>e.stopPropagation()}>
                                <div className="control-row">
                                  <label className="ctrl-label">Offset</label>
                                  <input className="ctrl-offset" type="text" inputMode="numeric" maxLength={2} value={offset} onChange={e=>setOffset(e.target.value.replace(/\D/,"").slice(0,2))} />
                                  <span className="ctrl-hint">1 – 99</span>
                                </div>
                                <div className="control-row">
                                <label className="ctrl-label">Positions</label>

                                {/* FIRST POSITION */}
                                <select
                                  className="ctrl-select"
                                  value={positions[0]}
                                  onChange={e => setPos(0, e.target.value)}
                                >
                                  <option value="">Select</option>
                                  {POSITIONS.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                  ))}
                                </select>

                                <span className="ctrl-plus">+</span>

                                {/* SECOND POSITION (LOCKED UNTIL FIRST IS SELECTED) */}
                                <select
                                  className="ctrl-select"
                                  value={positions[1]}
                                  disabled={!positions[0]}   // 🔥 THIS IS THE KEY PART
                                  onChange={e => setPos(1, e.target.value)}
                                >
                                  <option value="">Select</option>
                                  {POSITIONS.map(p => (
                                    p !== positions[0] && (
                                      <option key={p} value={p}>{p}</option>
                                    )
                                  ))}
                                </select>

                                <span className="ctrl-hint">
                                  A–E · result digits of ({offset || 5} + image value)
                                </span>
                              </div>
                              <button
                                className="btn-primary"
                                style={{ marginTop: "10px" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSignup();
                                }}
                              >
                                Create Account →
                              </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {error && <div className="alert-error">{error}</div>}
                    <button
                        ref={createBtnRef}
                        className="btn-primary"
                        disabled={loading}
                        onClick={handleSignup}
                      >
                      {loading?"Creating account…":"Review & Create Account"}
                    </button>
                  </div>
                )}

                {/* ══ LOGIN ══ */}
                {mode==="login" && (
                  <>
                    {loginStep==="creds" && (
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
                          {loading?"Please wait…":"Next →"}
                        </button>
                      </div>
                    )}

                    {loginStep==="grid" && (
                      <div className="form-stack">
                        <div className="step-badge">Step 2 of 3 — Find your secret image</div>
                        <div className="info-box">
                          <strong>Look for your image.</strong> One noun from your sentence is hidden in this grid.
                          Note the number beneath it, then click Continue.
                          An overlay will show you the image and help you calculate your register entry.
                        </div>
                        <div className="cg-grid">
                          {challengeGrid.length > 0
                            ? challengeGrid.map((item,i)=><GridCard key={i} noun={item.noun} value={item.value} />)
                            : <div style={{gridColumn:"1/-1",textAlign:"center",color:"#dc2626",padding:40}}>No grid received — start over.</div>
                          }
                        </div>
                        {error && <div className="alert-error">{error}</div>}
                        <button className="btn-primary" disabled={loading} onClick={handleContinueToRegister}>
                          {loading?"Building register…":"I've found my image →"}
                        </button>
                        <button className="btn-outline" onClick={()=>resetAll("login")}>← Start over</button>
                      </div>
                    )}

                    {loginStep==="register" && (
                      <div className="form-stack" ref={registerRef}>
                        <div className="step-badge">Step 3 of 3 — Fill positions A – J</div>
                        <div className="info-box">
                          <strong>Use the dropdowns.</strong> At your two secret positions enter the digits of your result (image value + your offset). Fill the rest with any digit. Reversed order is also accepted. Max 3 attempts.
                        </div>
                        <RegisterDropdownBar
                          inputs={regInputs}
                          serverRegister={serverRegister}
                          onChange={(i,v)=>setRegInputs(p=>{const n=[...p];n[i]=v;return n;})}
                        />
                        <p className="field-hint">
                          Example: result = 52 → you can place 5 and 2 in your two positions in ANY order.
                        </p>
                        {error && <div className="alert-error">{error}</div>}
                        <button className="btn-primary" disabled={loading||!allFilled} onClick={handleVerify}>
                          {loading?"Verifying…":"Verify →"}
                        </button>
                        <button className="btn-outline" onClick={()=>setLoginStep("grid")}>← Back to grid</button>
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
.show-overlay-btn{display:inline-block;margin-top:10px;background:none;border:1px solid rgba(245,158,11,0.35);border-radius:7px;padding:5px 12px;font-size:0.8rem;color:#92400e;cursor:pointer;}
.show-overlay-btn:hover{background:rgba(245,158,11,0.08);}
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
.reg-header,.reg-dropdowns,.reg-ref-row{display:grid;grid-template-columns:repeat(5,1fr);min-width:300px;}
.reg-head-cell{height:36px;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-size:0.75rem;font-weight:700;color:#475569;background:#f3efe9;border-bottom:1px solid #e2d9cc;}
.reg-ref-row{background:#fff;}
.reg-ref-cell{padding:8px 0;text-align:center;font-family:'Space Grotesk',sans-serif;font-size:0.95rem;font-weight:700;color:#94a3b8;border-bottom:1px solid #e2d9cc;border-right:1px solid #e2d9cc;}
.reg-ref-cell:last-child{border-right:none;}
.reg-select{border:none;border-right:1px solid #e2d9cc;border-top:1px solid #e2d9cc;padding:10px 0;text-align:center;font-family:'Space Grotesk',sans-serif;font-size:1rem;font-weight:700;color:#0f172a;background:#fff;outline:none;cursor:pointer;appearance:none;-webkit-appearance:none;text-align-last:center;}
.reg-select:last-child{border-right:none;}
.reg-select:focus{background:rgba(6,182,212,0.07);}
.overlay-bg{position:fixed;inset:0;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;z-index:9000;padding:20px;}
.overlay-card{position:relative;background:#fbf7f0;border:1px solid #e2d9cc;border-radius:20px;padding:36px 32px;max-width:360px;width:100%;display:flex;flex-direction:column;align-items:center;gap:14px;box-shadow:0 20px 60px rgba(15,23,42,0.2);animation:oIn 0.22s ease;}
.overlay-card--wide{max-width:780px;align-items:flex-start;}
@keyframes oIn{from{transform:scale(0.94);opacity:0}to{transform:scale(1);opacity:1}}
.overlay-close{position:absolute;top:14px;right:16px;background:none;border:none;font-size:1.1rem;color:#94a3b8;cursor:pointer;}
.overlay-close:hover{color:#0f172a;}
.overlay-eyebrow{font-size:0.72rem;font-weight:600;color:#0891b2;letter-spacing:0.08em;text-transform:uppercase;}
.overlay-title{font-family:'Space Grotesk',sans-serif;font-size:1.2rem;font-weight:800;color:#0f172a;}
.overlay-img-wrap{width:110px;height:110px;border-radius:14px;background:#f3efe9;overflow:hidden;display:flex;align-items:center;justify-content:center;border:1px solid #e2d9cc;}
.overlay-img{width:100%;height:100%;object-fit:contain;}
.overlay-fallback{font-size:2rem;font-weight:800;color:#94a3b8;font-family:'Space Grotesk',sans-serif;}
.overlay-noun{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.1rem;color:#0f172a;text-transform:capitalize;}
.overlay-value{font-family:'Space Grotesk',sans-serif;font-size:2.4rem;font-weight:800;color:#06B6D4;letter-spacing:-0.03em;line-height:1;}
.overlay-math{width:100%;background:#fff;border:1px solid #e2d9cc;border-radius:12px;padding:14px 18px;display:flex;flex-direction:column;gap:8px;}
.overlay-math-row{display:flex;justify-content:space-between;align-items:center;font-size:0.88rem;color:#64748b;}
.overlay-math-row strong{font-family:'Space Grotesk',sans-serif;font-size:1rem;color:#0f172a;}
.overlay-hint{font-size:0.8rem;color:#64748b;text-align:center;line-height:1.6;}
.overlay-btn{width:100%;padding:12px;border-radius:10px;border:none;background:linear-gradient(135deg,#06B6D4,#0891b2);color:#fff;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:0.94rem;cursor:pointer;}
.overlay-btn:hover{opacity:0.9;}
.overlay-btn:disabled{opacity:0.4;cursor:not-allowed;}
.preview-details{width:100%;background:#fff;border:1px solid #e2d9cc;border-radius:12px;padding:14px 18px;display:flex;flex-direction:column;gap:10px;}
.preview-row{display:flex;gap:14px;font-size:0.88rem;line-height:1.5;}
.preview-key{font-weight:700;color:#475569;min-width:80px;}
.preview-val{color:#0f172a;}
.preview-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:12px;width:100%;}
.preview-item{display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px;border-radius:14px;background:#fff;border:1px solid #e2d9cc;}
.preview-img-wrap{width:100px;height:100px;border-radius:14px;background:#f3efe9;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid #e2d9cc;}
.preview-img{width:100%;height:100%;object-fit:contain;}
.preview-fallback{font-size:1.8rem;font-weight:800;color:#94a3b8;font-family:'Space Grotesk',sans-serif;}
.preview-label{font-size:0.85rem;font-weight:700;color:#0f172a;text-transform:capitalize;}
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