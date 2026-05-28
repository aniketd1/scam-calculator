import { useState } from "react";
import { Link } from "react-router-dom";

/* ── QUESTIONS ─────────────────────────────────────────────── */
const questions = [
  { id: "q0", question: "Did an unknown person contact you?" },
  { id: "q1", question: "Did they claim to be an official — Government, Police, Bank, CBI, Courier, Loan, Customs etc?" },
  { id: "q2", question: "Did they mention something unexpected — fake loan, arrest, parcel, KYC, fake courier or fake refund received?" },
  { id: "q3", question: "Did they ask for Money, OTP, PIN, CVV, bank details, photo or Credit/Debit card details?" },
  { id: "q4", question: "Did they send a suspicious link, app or apk download, Website link, image download, QR code, or payment request?" },
];


/* ── RISK LEVELS ─────────────────────────────────────────────── */
function getRiskLevel(pct) {
  if (pct >= 80) return {
    label: "CRITICAL RISK",
    color: "#b91c1c",
    bg: "rgba(185,28,28,0.12)",
    border: "rgba(185,28,28,0.3)",
    icon: "🚨",
    advice: "Very likely a scam. Do not share anything. Call Cyber Crime Helpline on 1930 immediately. Report at cybercrime.gov.in.",
  };
  if (pct >= 60) return {
    label: "HIGH RISK",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
    icon: "⚠️",
    advice: "Likely a scam. Disconnect and report on cybercrime.gov.in.",
  };
  if (pct >= 40) return {
    label: "MEDIUM RISK",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
    icon: "🔍",
    advice: "Some risk signs. Verify the phone number and ID independently before acting.",
  };
  return {
    label: "LOW RISK",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.3)",
    icon: "✅",
    advice: "This doesn't appear to be a scam for now. Stay cautious.",
  };
}

export default function Calculator() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const score = Object.values(answers).filter((v) => v === "yes").length;
  const pct = score * 20;
  const risk = getRiskLevel(pct);
  const answered = Object.keys(answers).length;
  const complete = answered === questions.length;

  const handleSelect = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const reset = () => { setAnswers({}); setSubmitted(false); };

  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.calc-page {
  background: #f7efe6;
  color: #0f172a;
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
}

/* HERO */
.calc-hero {
  position: relative;
  padding: 80px 24px 56px;
  text-align: center;
  overflow: hidden;
}
.calc-hero-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 70% 60% at 50% 0%, rgba(6,182,212,0.07) 0%, transparent 70%);
  pointer-events: none;
}
.calc-hero-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  mask-image: radial-gradient(ellipse 80% 80% at center, black 20%, transparent 100%);
}
.pg-tag {
  display: inline-block;
  padding: 4px 14px;
  background: rgba(6,182,212,0.1);
  border: 1px solid rgba(6,182,212,0.2);
  border-radius: 20px;
  font-size: 0.75rem; font-weight: 600;
  color: #06B6D4;
  letter-spacing: 0.08em; text-transform: uppercase;
  margin-bottom: 18px;
}
.pg-h1 {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 800;
  font-size: clamp(1.9rem, 4vw, 2.8rem);
  letter-spacing: -0.03em;
  margin-bottom: 14px;
  position: relative;
}
.pg-h1 .accent { color: #06B6D4; }
.pg-sub { font-size: 0.95rem; color: #94A3B8; max-width: 500px; margin: 0 auto; line-height: 1.7; }

/* LAYOUT */
.calc-layout {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px 80px;
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 28px;
  align-items: start;
}
@media (max-width: 880px) { .calc-layout { grid-template-columns: 1fr; } }

/* PROGRESS */
.progress-bar-wrap {
  background: #fbf7f0;
  border: 1px solid #e6e9ef;
  border-radius: 14px;
  padding: 18px 22px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.progress-label { font-size: 0.85rem; color: #94A3B8; white-space: nowrap; }
.progress-track {
  flex: 1;
  height: 6px;
  background: #e6e9ef;
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #06B6D4, #22D3EE);
  border-radius: 3px;
  transition: width 0.4s ease;
}
.progress-count { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.88rem; color: #06B6D4; white-space: nowrap; }

/* QUESTION CARD */
.q-card {
  background: #fbf7f0;
  border: 1px solid #e6e9ef;
  border-radius: 16px;
  padding: 28px 24px;
  margin-bottom: 16px;
  transition: border-color 0.2s;
}
.q-card.answered { border-color: rgba(6,182,212,0.3); }
.q-number { font-size: 0.72rem; font-weight: 700; color: #475569; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }
.q-text { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1rem; margin-bottom: 20px; line-height: 1.4; }

/* RADIO BUTTONS */
.radio-group { display: flex; gap: 12px; }
.radio-opt { flex: 1; }
.radio-opt input[type="radio"] { display: none; }
.radio-opt label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fbf7f0;
  border: 1px solid #e6e9ef;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #475569;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
  user-select: none;
}
.radio-opt label:hover { border-color: rgba(6,182,212,0.4); background: rgba(6,182,212,0.03); color: #0f172a; }
.radio-opt input[type="radio"]:checked + label {
  border-color: #06B6D4;
  background: rgba(6,182,212,0.08);
  color: #0f172a;
  font-weight: 600;
}
.radio-dot {
  width: 16px; height: 16px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  flex-shrink: 0;
  transition: border-color 0.2s, background 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.radio-opt input[type="radio"]:checked + label .radio-dot {
  border-color: #06B6D4;
  background: #06B6D4;
}
.radio-opt input[type="radio"]:checked + label .radio-dot::after {
  content: "";
  width: 6px; height: 6px;
  border-radius: 50%;
  background: white;
}

/* SUBMIT */
.submit-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #06B6D4, #0891b2);
  color: #0F172A;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
  box-shadow: 0 0 20px rgba(6,182,212,0.25);
  margin-top: 8px;
}
.submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 36px rgba(6,182,212,0.45); }
.submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* SIDEBAR */
.sidebar { display: flex; flex-direction: column; gap: 20px; }
.sidebar-card {
  background: #fbf7f0;
  border: 1px solid #e6e9ef;
  border-radius: 16px;
  padding: 22px 20px;
}
.sidebar-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.88rem; color: #0f172a; margin-bottom: 14px; }
.tip-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.tip-list li { display: flex; gap: 8px; font-size: 0.84rem; color: #94A3B8; line-height: 1.5; }
.tip-list li::before { content: '💡'; flex-shrink: 0; }
.helpline-card { background: linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05)); border-color: rgba(239,68,68,0.25); }
.helpline-num { font-family: 'Space Grotesk', sans-serif; font-size: 2.2rem; font-weight: 800; color: #EF4444; letter-spacing: -0.02em; margin-bottom: 4px; }
.helpline-label { font-size: 0.8rem; color: #94A3B8; }

/* RESULT */
.result-card {
  background: #fbf7f0;
  border: 1px solid;
  border-radius: 20px;
  padding: 36px 32px;
  text-align: center;
  margin-bottom: 16px;
}
.result-icon { font-size: 3.5rem; margin-bottom: 16px; }
.result-label {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 800;
  font-size: 1.6rem;
  letter-spacing: -0.02em;
  margin-bottom: 12px;
}
.result-score {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 4px;
}
.result-score-sub { font-size: 0.82rem; color: #64748B; margin-bottom: 24px; }
.score-bar-track {
  height: 10px;
  background: #e6e9ef;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 24px;
}
.score-bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 1s ease;
}
.result-advice {
  background: #f3efe9;
  border: 1px solid #e6e9ef;
  border-radius: 12px;
  padding: 16px 18px;
  font-size: 0.88rem;
  color: #334155;
  line-height: 1.65;
  text-align: left;
  margin-bottom: 20px;
}
.result-actions { display: flex; flex-direction: column; gap: 10px; }
.btn-reset {
  width: 100%;
  padding: 13px;
  background: transparent;
  border: 1px solid #e6e9ef;
  border-radius: 10px;
  color: #475569;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.btn-reset:hover { border-color: #06B6D4; color: #06B6D4; }
.btn-report {
  display: block;
  width: 100%;
  padding: 13px;
  background: #EF4444;
  border: none;
  border-radius: 10px;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  transition: filter 0.2s;
}
.btn-report:hover { filter: brightness(1.1); }

@media (max-width: 1024px) {
  .calc-hero { padding: 70px 22px 48px; }
}
@media (max-width: 600px) {
  .calc-hero { padding: 56px 16px 40px; }
  .calc-layout { padding: 0 16px 60px; }
  .q-card { padding: 22px 18px; }
  .result-card { padding: 28px 20px; }
}
      `}</style>

      <div className="calc-page">

        {/* HERO */}
        <section className="calc-hero">
          <div className="calc-hero-bg" />
          <div className="calc-hero-grid" />
          <div style={{ position: "relative" }}>
            <div className="pg-tag">⚡ Risk Engine</div>
            <h1 className="pg-h1">Scam <span className="accent">Risk Calculator</span></h1>
            <p className="pg-sub">Answer 5 quick yes/no questions about the suspicious interaction. Our engine will assess the threat level and guide you on what to do next.</p>
          </div>
        </section>

        <div className="calc-layout">

          {/* LEFT — QUESTIONS OR RESULT */}
          <div>
            {!submitted ? (
              <>
                {/* Progress */}
                <div className="progress-bar-wrap">
                  <span className="progress-label">Progress</span>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${(answered / questions.length) * 100}%` }} />
                  </div>
                  <span className="progress-count">{answered} / {questions.length}</span>
                </div>

                {/* Questions */}
                {questions.map((q, i) => (
                  <div className={`q-card${answers[q.id] !== undefined ? " answered" : ""}`} key={q.id}>
                    <div className="q-number">Question {i + 1} of {questions.length}</div>
                    <div className="q-text">{q.question}</div>
                    <div className="radio-group">
                      {["yes", "no"].map((val) => (
                        <div className="radio-opt" key={val}>
                          <input
                            type="radio"
                            id={`${q.id}-${val}`}
                            name={q.id}
                            value={val}
                            checked={answers[q.id] === val}
                            onChange={() => handleSelect(q.id, val)}
                          />
                          <label htmlFor={`${q.id}-${val}`}>
                            <span className="radio-dot" />
                            {val.charAt(0).toUpperCase() + val.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  className="submit-btn"
                  disabled={!complete}
                  onClick={() => setSubmitted(true)}
                >
                  {complete ? "⚡ Analyse My Risk Now" : `Answer all questions to continue (${answered}/${questions.length})`}
                </button>
              </>
            ) : (
              /* Result */
              <div className="result-card" style={{ borderColor: risk.border, background: risk.bg }}>
                <div className="result-icon">{risk.icon}</div>
                <div className="result-label" style={{ color: risk.color }}>{risk.label}</div>
                <div className="result-score" style={{ color: risk.color }}>
                  {pct}<span style={{ fontSize: "1.2rem", fontWeight: 600 }}>%</span>
                </div>
                <div className="result-score-sub">Scam Risk Probability</div>
                <div className="score-bar-track">
                  <div className="score-bar-fill" style={{ width: `${pct}%`, background: risk.color }} />
                </div>
                <div className="result-advice">
                  <strong style={{ display: "block", marginBottom: 6, color: "#0f172a" }}>What you should do:</strong>
                  {risk.advice}
                </div>
                <div className="result-actions">
                  {score >= 3 && (
                    <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="btn-report">
                      📋 Report This Scam on cybercrime.gov.in
                    </a>
                  )}
                  <button className="btn-reset" onClick={reset}>↩ Start Over</button>
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="sidebar">
            <div className="sidebar-card helpline-card">
              <div className="sidebar-title">🚨 Emergency Helpline</div>
              <div className="helpline-num">1930</div>
              <div className="helpline-label">National Cyber Crime Helpline — 24/7</div>
            </div>

            <div className="sidebar-card">
              <div className="sidebar-title">💡 Quick Tips</div>
              <ul className="tip-list">
                <li>Banks never ask for OTPs over the phone.</li>
                <li>Receiving money never requires entering a PIN.</li>
                <li>Digital arrest is not a real legal procedure.</li>
                <li>Urgency and fear are scammer tools — slow down.</li>
                <li>Always verify by calling the official number directly.</li>
              </ul>
            </div>

            <div className="sidebar-card">
              <div className="sidebar-title">🔒 Your Privacy</div>
              <ul className="tip-list">
                <li>No data is stored after you close this page.</li>
                <li>No login or personal info is required.</li>
                <li>Your answers are never shared with anyone.</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
