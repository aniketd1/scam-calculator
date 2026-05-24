import { useState } from "react";
import { Link } from "react-router-dom";

/* ── QUESTIONS ─────────────────────────────────────────────── */
const questions = [
  {
    id: "q1",
    question: "How did this contact reach you?",
    options: [
      { label: "Phone Call (unknown number)", weight: 3 },
      { label: "WhatsApp / SMS link", weight: 4 },
      { label: "Email from unknown sender", weight: 3 },
      { label: "Social media message", weight: 2 },
      { label: "Video call from strangers", weight: 5 },
    ],
  },
  {
    id: "q2",
    question: "What was the caller / sender asking for?",
    options: [
      { label: "OTP or bank PIN", weight: 10 },
      { label: "Account number or card details", weight: 9 },
      { label: "Personal info (Aadhaar, PAN)", weight: 7 },
      { label: "Money transfer / UPI payment", weight: 8 },
      { label: "Just general information", weight: 2 },
    ],
  },
  {
    id: "q3",
    question: "Did they create urgency or fear?",
    options: [
      { label: "Yes — threatened arrest or legal action", weight: 10 },
      { label: "Yes — said account will be blocked", weight: 8 },
      { label: "Yes — said I'd miss a reward/offer", weight: 5 },
      { label: "Mild pressure but not threatening", weight: 3 },
      { label: "No urgency at all", weight: 0 },
    ],
  },
  {
    id: "q4",
    question: "Did they claim to be from an official organisation?",
    options: [
      { label: "Police / CBI / Government agency", weight: 10 },
      { label: "Your bank or RBI", weight: 8 },
      { label: "TRAI / Telecom department", weight: 7 },
      { label: "Known company (Amazon, courier, etc.)", weight: 5 },
      { label: "No — just a regular person", weight: 1 },
    ],
  },
  {
    id: "q5",
    question: "Were you asked to keep this conversation secret?",
    options: [
      { label: "Yes — explicitly told not to tell family", weight: 10 },
      { label: "Yes — said it's confidential", weight: 7 },
      { label: "Implied I shouldn't discuss it", weight: 5 },
      { label: "No mention of secrecy", weight: 0 },
    ],
  },
  {
    id: "q6",
    question: "Was a link, QR code, or app download involved?",
    options: [
      { label: "Yes — asked me to install a remote app", weight: 10 },
      { label: "Yes — sent a suspicious link", weight: 8 },
      { label: "Yes — sent a QR code to scan", weight: 7 },
      { label: "No link or download involved", weight: 0 },
    ],
  },
];

/* ── RISK LEVELS ─────────────────────────────────────────────── */
function getRiskLevel(score, max) {
  const pct = (score / max) * 100;
  if (pct >= 75) return { label: "CRITICAL RISK", color: "#b91c1c", bg: "rgba(185,28,28,0.12)", border: "rgba(185,28,28,0.3)", icon: "🚨", advice: "This has all the hallmarks of a serious scam. Do NOT share any information, do NOT transfer any money. Hang up or stop responding immediately and call Cyber Crime Helpline 1930." };
  if (pct >= 50) return { label: "HIGH RISK", color: "#EF4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", icon: "⚠️", advice: "Multiple red flags detected. This is very likely a scam attempt. Disconnect now, block the number, and report it on cybercrime.gov.in." };
  if (pct >= 28) return { label: "MEDIUM RISK", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", icon: "🔍", advice: "Some suspicious patterns detected. Proceed with extreme caution. Verify the caller's identity independently by calling the organisation on their official published number." };
  return { label: "LOW RISK", color: "#22C55E", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", icon: "✅", advice: "This doesn't appear to have major scam indicators. However, always stay cautious — never share sensitive personal or banking details over the phone." };
}

export default function Calculator() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const totalMax = questions.reduce((acc, q) => acc + Math.max(...q.options.map(o => o.weight)), 0);
  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const risk = getRiskLevel(totalScore, totalMax);
  const pct = Math.round((totalScore / totalMax) * 100);
  const answered = Object.keys(answers).length;
  const complete = answered === questions.length;

  const handleSelect = (qid, weight) => {
    setAnswers(prev => ({ ...prev, [qid]: weight }));
  };

  const reset = () => { setAnswers({}); setSubmitted(false); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .calc-page {
          background: #0F172A;
          color: #F8FAFC;
          font-family: 'DM Sans', sans-serif;
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
          font-family: 'Syne', sans-serif;
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
          background: #1E293B;
          border: 1px solid #334155;
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
          background: #334155;
          border-radius: 3px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #06B6D4, #22D3EE);
          border-radius: 3px;
          transition: width 0.4s ease;
        }
        .progress-count { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.88rem; color: #06B6D4; white-space: nowrap; }

        /* QUESTION CARD */
        .q-card {
          background: #1E293B;
          border: 1px solid #334155;
          border-radius: 16px;
          padding: 28px 24px;
          margin-bottom: 16px;
          transition: border-color 0.2s;
        }
        .q-card.answered { border-color: rgba(6,182,212,0.3); }
        .q-number { font-size: 0.72rem; font-weight: 700; color: #475569; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }
        .q-text { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1rem; margin-bottom: 18px; line-height: 1.4; }
        .q-options { display: flex; flex-direction: column; gap: 8px; }
        .q-option {
          padding: 12px 16px;
          background: #0F172A;
          border: 1px solid #334155;
          border-radius: 10px;
          font-size: 0.88rem;
          color: #CBD5E1;
          cursor: pointer;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s, background 0.2s, color 0.2s;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .q-option:hover { border-color: rgba(6,182,212,0.4); color: #F8FAFC; background: rgba(6,182,212,0.05); }
        .q-option.selected { border-color: #06B6D4; background: rgba(6,182,212,0.1); color: #F8FAFC; }
        .q-option-dot {
          width: 16px; height: 16px;
          border-radius: 50%;
          border: 2px solid #334155;
          flex-shrink: 0;
          transition: border-color 0.2s, background 0.2s;
        }
        .q-option.selected .q-option-dot { border-color: #06B6D4; background: #06B6D4; }

        /* SUBMIT */
        .submit-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #06B6D4, #0891b2);
          color: #0F172A;
          font-family: 'Syne', sans-serif;
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
          background: #1E293B;
          border: 1px solid #334155;
          border-radius: 16px;
          padding: 22px 20px;
        }
        .sidebar-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.88rem; color: #F8FAFC; margin-bottom: 14px; }
        .tip-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .tip-list li { display: flex; gap: 8px; font-size: 0.84rem; color: #94A3B8; line-height: 1.5; }
        .tip-list li::before { content: '💡'; flex-shrink: 0; }
        .helpline-card { background: linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05)); border-color: rgba(239,68,68,0.25); }
        .helpline-num { font-family: 'Syne', sans-serif; font-size: 2.2rem; font-weight: 800; color: #EF4444; letter-spacing: -0.02em; margin-bottom: 4px; }
        .helpline-label { font-size: 0.8rem; color: #94A3B8; }

        /* RESULT */
        .result-card {
          background: #1E293B;
          border: 1px solid;
          border-radius: 20px;
          padding: 36px 32px;
          text-align: center;
          margin-bottom: 16px;
        }
        .result-icon { font-size: 3.5rem; margin-bottom: 16px; }
        .result-label {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.6rem;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
        }
        .result-score {
          font-family: 'Syne', sans-serif;
          font-size: 3rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 4px;
        }
        .result-score-sub { font-size: 0.82rem; color: #64748B; margin-bottom: 24px; }
        .score-bar-track {
          height: 10px;
          background: #334155;
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
          background: #0F172A;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 16px 18px;
          font-size: 0.88rem;
          color: #CBD5E1;
          line-height: 1.65;
          text-align: left;
          margin-bottom: 20px;
        }
        .result-actions { display: flex; flex-direction: column; gap: 10px; }
        .btn-reset {
          width: 100%;
          padding: 13px;
          background: transparent;
          border: 1px solid #334155;
          border-radius: 10px;
          color: #94A3B8;
          font-family: 'DM Sans', sans-serif;
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
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 0.9rem;
          text-decoration: none;
          text-align: center;
          cursor: pointer;
          transition: filter 0.2s;
        }
        .btn-report:hover { filter: brightness(1.1); }
      `}</style>

      <div className="calc-page">

        <section className="calc-hero">
          <div className="calc-hero-bg" />
          <div className="calc-hero-grid" />
          <div style={{ position: "relative" }}>
            <div className="pg-tag">⚡ Risk Engine</div>
            <h1 className="pg-h1">Scam <span className="accent">Risk Calculator</span></h1>
            <p className="pg-sub">Answer 6 quick questions about the suspicious interaction. Our engine will assess the threat level and guide you on what to do next.</p>
          </div>
        </section>

        <div className="calc-layout">
          {/* LEFT — QUESTIONS OR RESULT */}
          <div>
            {!submitted ? (
              <>
                <div className="progress-bar-wrap">
                  <span className="progress-label">Progress</span>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${(answered / questions.length) * 100}%` }} />
                  </div>
                  <span className="progress-count">{answered} / {questions.length}</span>
                </div>

                {questions.map((q, i) => (
                  <div className={`q-card${answers[q.id] !== undefined ? " answered" : ""}`} key={q.id}>
                    <div className="q-number">Question {i + 1} of {questions.length}</div>
                    <div className="q-text">{q.question}</div>
                    <div className="q-options">
                      {q.options.map(opt => (
                        <button
                          key={opt.label}
                          className={`q-option${answers[q.id] === opt.weight ? " selected" : ""}`}
                          onClick={() => handleSelect(q.id, opt.weight)}
                        >
                          <span className="q-option-dot" />
                          {opt.label}
                        </button>
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
              <div className="result-card" style={{ borderColor: risk.border, background: risk.bg }}>
                <div className="result-icon">{risk.icon}</div>
                <div className="result-label" style={{ color: risk.color }}>{risk.label}</div>
                <div className="result-score" style={{ color: risk.color }}>{pct}<span style={{ fontSize: "1.2rem", fontWeight: 600 }}>%</span></div>
                <div className="result-score-sub">Scam Probability Score</div>
                <div className="score-bar-track">
                  <div className="score-bar-fill" style={{ width: `${pct}%`, background: risk.color }} />
                </div>
                <div className="result-advice">
                  <strong style={{ display: "block", marginBottom: 6, color: "#F8FAFC" }}>What you should do:</strong>
                  {risk.advice}
                </div>
                <div className="result-actions">
                  {pct >= 50 && <Link to="/report" className="btn-report">📋 Report This Scam</Link>}
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