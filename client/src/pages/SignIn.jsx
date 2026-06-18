import { useState, useRef } from "react";
import axios from "axios";

const API = "https://api.scam2safe.com";

/* ── Asset map (same as Auth.jsx) ─────────────────────────── */
const _glob = import.meta.glob("../assets/nouns/*.png", { eager: true, as: "url" });
const _fileMap = {};
for (const [path, url] of Object.entries(_glob)) {
  const stem = path.split("/").pop().replace(/\.png$/i, "").toLowerCase();
  _fileMap[stem] = url;
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
  eye:"eye", ear:"ear", hand:"hand", book:"book",
};
function getNounImage(noun) {
  const stem = NOUN_STEM[noun?.toLowerCase()];
  if (!stem) return null;
  return _fileMap[stem] ?? _fileMap[stem.replace(/\s+/g, "")] ?? null;
}

const POSITIONS = ["A","B","C","D","E"];

/* ── Register input bar (A–E) ─────────────────────────────── */
function RegisterBar({ inputs, onChange }) {
  const refs = useRef([]);
  const handleChange = (idx, val) => {
    const digit = val.replace(/\D/, "").slice(-1);
    onChange(idx, digit);
    if (digit && idx < 9) refs.current[idx + 1]?.focus();
  };
  const handleKey = (e, idx) => {
    if (e.key === "Backspace" && !inputs[idx] && idx > 0)
      refs.current[idx - 1]?.focus();
  };
  return (
    <div style={S.regWrap}>
      <div style={S.regRow}>
        {POSITIONS.map(p => (
          <div key={p} style={S.regHead}>{p}</div>
        ))}
      </div>
      <div style={S.regRow}>
        {POSITIONS.map((p, i) => (
          <input
            key={p}
            ref={el => (refs.current[i] = el)}
            style={S.regCell}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={inputs[i] ?? ""}
            placeholder="·"
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKey(e, i)}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Challenge grid card ──────────────────────────────────── */
function GridCard({ noun, value }) {
  const img = getNounImage(noun);
  return (
    <div style={S.gridCard}>
      <div style={S.gridImgWrap}>
        {img
          ? <img src={img} alt={noun} style={S.gridImg} />
          : <div style={S.gridFallback}>{noun?.[0]?.toUpperCase()}</div>
        }
      </div>
      <div style={S.gridNoun}>{noun}</div>
      <div style={S.gridValue}>{value}</div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
export default function SignIn() {
  // step: "creds" | "grid" | "register" | "success"
  const [step,          setStep]          = useState("creds");
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [sessionId,     setSessionId]     = useState("");
  const [challengeGrid, setChallengeGrid] = useState([]);
  const [regInputs,     setRegInputs]     = useState(Array(10).fill(""));
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");

  const allRegFilled = regInputs.every(v => v !== "");

  const updateReg = (idx, digit) => {
    setRegInputs(prev => {
      const next = [...prev];
      next[idx] = digit;
      return next;
    });
  };

  /* Step 1 — send credentials, get challenge grid */
  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/login`, {
        email, password,
      });
      if (!data.success) { setError(data.error || "Login failed."); return; }
      setSessionId(data.sessionId);
      setChallengeGrid(data.challengeGrid || []);
      setRegInputs(Array(10).fill(""));
      setStep("grid");
    } catch (err) {
      setError(err.response?.data?.error || "Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* Step 2 → Step 3: user has seen grid, now enters register */
  const handleContinueToRegister = async () => {
    setError("");
    setLoading(true);
    try {
      // Tell server which grid was shown so it builds the register
      const { data } = await axios.post(`${API}/api/auth/register`, {
        sessionId,
        challengeGrid,
      });
      if (!data.success) {
        setError(data.error || "Could not build register.");
        setStep("creds"); // session gone, restart
        return;
      }
      setRegInputs(Array(10).fill(""));
      setStep("register");
    } catch (err) {
      setError(err.response?.data?.error || "Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* Step 3 — submit all 15 register digits */
  const handleVerify = async () => {
    setError("");
    if (!allRegFilled) { setError("Fill all 15 positions (A – O)."); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/verify`, {
        sessionId,
        registerInputs: regInputs.map(v => parseInt(v, 10)),
      });
      if (!data.success) {
        setError(data.error || "Verification failed. Please sign in again.");
        setStep("creds");
        setChallengeGrid([]); setSessionId("");
        return;
      }
      if (data.token) localStorage.setItem("token", data.token);
      setStep("success");
    } catch (err) {
      setError(err.response?.data?.error || "Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setStep("creds"); setEmail(""); setPassword("");
    setSessionId(""); setChallengeGrid([]);
    setRegInputs(Array(10).fill("")); setError("");
  };

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div style={S.page}>
      <div style={S.card}>
        <h1 style={S.title}>Sign In</h1>

        {/* ── SUCCESS ── */}
        {step === "success" && (
          <div style={S.successBox}>
            <div style={S.successIcon}>✓</div>
            <p style={S.successMsg}>Identity verified. Welcome back!</p>
            <button style={S.btnOutline} onClick={restart}>Sign in again</button>
          </div>
        )}

        {/* ── STEP 1: CREDENTIALS ── */}
        {step === "creds" && (
          <div style={S.stack}>
            <div style={S.stepBadge}>Step 1 of 3 — Email & password</div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Email address</label>
              <input
                style={S.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Password</label>
              <input
                style={S.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>
            {error && <div style={S.error}>{error}</div>}
            <button style={loading ? S.btnDis : S.btn} disabled={loading} onClick={handleLogin}>
              {loading ? "Signing in…" : "Next →"}
            </button>
          </div>
        )}

        {/* ── STEP 2: CHALLENGE GRID ── */}
        {step === "grid" && (
          <div style={S.stack}>
            <div style={S.stepBadge}>Step 2 of 3 — Find your secret image</div>
            <div style={S.infoBox}>
              <strong>Look for your image.</strong> Find the noun from your registered sentence,
              note its number, add your private offset mentally. You'll enter those two digits at
              your secret positions in the next step.
            </div>
            {challengeGrid.length > 0
              ? (
                <div style={S.grid}>
                  {challengeGrid.map((item, i) => (
                    <GridCard key={i} noun={item.noun} value={item.value} />
                  ))}
                </div>
              )
              : <div style={S.error}>No grid received — please start over.</div>
            }
            {error && <div style={S.error}>{error}</div>}
            <button style={loading ? S.btnDis : S.btn} disabled={loading} onClick={handleContinueToRegister}>
              {loading ? "Building register…" : "I've noted my image →"}
            </button>
            <button style={S.btnOutline} onClick={restart}>← Start over</button>
          </div>
        )}

        {/* ── STEP 3: REGISTER BAR ── */}
        {step === "register" && (
          <div style={S.stack}>
            <div style={S.stepBadge}>Step 3 of 3 — Enter your register</div>
            <div style={S.infoBox}>
              <strong>Fill all 10 boxes (A – J).</strong> At your two secret positions enter the
              two digits of your result (image value + your offset). All other boxes: any digit.
              Only your two positions are checked.
            </div>
            <RegisterBar inputs={regInputs} onChange={updateReg} />
            <p style={S.hint}>
              Example: image showed 47, offset = 5 → result = 52 → enter 5 at position A, 2 at position D.
            </p>
            {error && <div style={S.error}>{error}</div>}
            <button
              style={loading || !allRegFilled ? S.btnDis : S.btn}
              disabled={loading || !allRegFilled}
              onClick={handleVerify}
            >
              {loading ? "Verifying…" : "Verify →"}
            </button>
            <button style={S.btnOutline} onClick={() => setStep("grid")}>← Back to grid</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Styles ───────────────────────────────────────────────── */
const S = {
  page: {
    minHeight: "100vh", background: "#f7efe6",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px 16px", fontFamily: "'Inter', sans-serif",
  },
  card: {
    width: "100%", maxWidth: 680,
    background: "#fbf7f0", border: "1px solid #e6e9ef",
    borderRadius: 16, padding: "36px 40px",
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 26, fontWeight: 800, color: "#0f172a",
    letterSpacing: "-0.03em", marginBottom: 24,
  },
  stack:      { display: "flex", flexDirection: "column", gap: 16 },
  stepBadge:  { padding: "9px 14px", borderRadius: 9, background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.15)", fontSize: 13, color: "#0891b2", fontWeight: 600 },
  infoBox:    { padding: "12px 14px", borderRadius: 10, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", fontSize: 13, color: "#92400e", lineHeight: 1.65 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 5 },
  label:      { fontSize: 12, fontWeight: 600, color: "#475569", letterSpacing: "0.04em", textTransform: "uppercase" },
  input: {
    padding: "11px 13px", borderRadius: 10,
    border: "1.5px solid #e2d9cc", background: "#fff",
    fontSize: 14, color: "#0f172a", outline: "none",
  },
  error: { padding: "10px 14px", borderRadius: 9, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 13 },
  hint:  { fontSize: 12, color: "#94a3b8", lineHeight: 1.6, margin: 0 },
  btn: {
    padding: "13px", borderRadius: 10, border: "none",
    background: "linear-gradient(135deg,#06B6D4,#0891b2)",
    color: "#0f172a", fontWeight: 700, fontSize: 15,
    cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
  },
  btnDis: {
    padding: "13px", borderRadius: 10, border: "none",
    background: "#b0d8e0", color: "#fff",
    fontWeight: 700, fontSize: 15, cursor: "not-allowed",
    fontFamily: "'Space Grotesk', sans-serif",
  },
  btnOutline: {
    padding: "12px", borderRadius: 10,
    border: "1.5px solid #e2d9cc", background: "transparent",
    color: "#475569", fontWeight: 500, fontSize: 14, cursor: "pointer",
  },

  /* Grid */
  grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 },
  gridCard: { background: "#fff", border: "1px solid #e6e9ef", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  gridImgWrap: { width: 64, height: 64, borderRadius: 8, background: "#f3efe9", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  gridImg:     { width: "100%", height: "100%", objectFit: "contain" },
  gridFallback:{ fontSize: 22, fontWeight: 800, color: "#94a3b8" },
  gridNoun:    { fontSize: 11, fontWeight: 600, color: "#475569", textTransform: "capitalize", textAlign: "center" },
  gridValue:   { fontSize: 17, fontWeight: 800, color: "#0f172a", fontFamily: "'Space Grotesk', sans-serif" },

  /* Register bar */
  regWrap: { width: "100%", border: "1px solid #e2d9cc", borderRadius: 10, overflow: "hidden", overflowX: "auto" },
  regRow:  { display: "grid", gridTemplateColumns: "repeat(15, minmax(40px, 1fr))" },
  regHead: { padding: "8px 0", textAlign: "center", fontSize: 11, fontWeight: 700, color: "#475569", background: "#f3efe9", borderBottom: "1px solid #e2d9cc" },
  regCell: {
    border: "none", borderRight: "1px solid #e6e9ef", borderTop: "1px solid #e6e9ef",
    padding: "10px 0", textAlign: "center",
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#0f172a",
    background: "#fff", outline: "none",
  },

  /* Success */
  successBox:  { display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "32px 0", textAlign: "center" },
  successIcon: { width: 60, height: 60, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "2px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#16a34a" },
  successMsg:  { fontSize: 15, color: "#475569", lineHeight: 1.65, maxWidth: 360 },
};