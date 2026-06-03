import { useState } from "react";
import { Link } from "react-router-dom";
import VoiceAgent from "../components/VoiceAgent";


/* ─── Data ─────────────────────────────────────────────────────────────── */
const stats = [
  { icon: "📞", value: "45,000+", label: "Scam Calls Daily", sub: "Targeting Indian mobile users", color: "#EF4444" },
  { icon: "🎣", value: "12 Lakh", label: "Phishing Attacks", sub: "Reported in 2023 alone", color: "#F59E0B" },
  { icon: "💸", value: "₹11,000 Cr", label: "Financial Losses", sub: "Cyber fraud in India (2023)", color: "#06B6D4" },
];

const scamTypes = [
  { icon: "🔢", title: "OTP Scam", desc: "Fraudsters impersonate banks and trick you into sharing your One-Time Password to drain accounts.", risk: "HIGH" },
  { icon: "📋", title: "KYC Scam", desc: "Fake KYC update requests via SMS, WhatsApp, or calls pressuring you to reveal account details.", risk: "HIGH" },
  { icon: "💳", title: "UPI Fraud", desc: "Fake payment requests or QR codes sent to steal money from your UPI-linked bank account.", risk: "HIGH" },
  { icon: "👮", title: "Digital Arrest", desc: "Criminals impersonate police or CBI officials via video call to extort money through fear.", risk: "CRITICAL" },
  { icon: "📦", title: "Courier Scam", desc: "Fake notifications about held parcels containing illegal items to extract personal and banking info.", risk: "MEDIUM" },
  { icon: "🏦", title: "Fake Banking Calls", desc: "Callers posing as bank executives offering loans, rewards, or resolving fake account issues.", risk: "HIGH" },
];

const steps = [
  { num: "01", icon: "🗣️", title: "Describe the Situation", desc: "Tell us what happened — a suspicious call, message, or online interaction. No login or personal info needed." },
  { num: "02", icon: "🧠", title: "AI Risk Analysis", desc: "Our engine cross-references 50+ known scam patterns against your description to calculate a threat score." },
  { num: "03", icon: "✅", title: "Get Safety Guidance", desc: "Receive clear, plain-language advice on what to do next — whether to ignore, block, or report." },
];

const privacyPoints = [
  { icon: "🚫", title: "No Login Required", desc: "Use the full tool anonymously. We never ask for your name, phone number, or any personal details." },
  { icon: "🎙️", title: "No Call Recording", desc: "We never listen to or record any calls. You describe the situation in your own words." },
  { icon: "🗑️", title: "Data Auto-Deleted", desc: "All session data is cleared automatically when you close the tab. Nothing is stored on our servers." },
  { icon: "🔐", title: "Privacy-First Processing", desc: "Your inputs are analyzed locally and are never shared with third parties or sold to advertisers." },
];

const riskBadge = { HIGH: "#EF4444", CRITICAL: "#b91c1c", MEDIUM: "#F59E0B" };

/* ─── Mini Calculator Questions ────────────────────────────────────────── */
const miniQuestions = [
  { id: "q0", question: "Did an unknown person contact you?" },
  { id: "q1", question: "Did they claim to be an official — Government, Police, Bank, CBI, Courier, Loan, Customs etc?" },
  { id: "q2", question: "Did they mention something unexpected — fake loan, arrest, parcel, KYC, fake courier or fake refund received?" },
  { id: "q3", question: "Did they ask for Money, OTP, PIN, CVV, bank details, photo or Credit/Debit card details?" },
  { id: "q4", question: "Did they send a suspicious link, app or apk download, Website link, image download, QR code, or payment request?" },
];

function getMiniRisk(score) {
  const percent = score * 20;

  if (score >= 4)
    return {
      label: "CRITICAL RISK",
      color: "#b91c1c",
      bg: "rgba(185,28,28,0.12)",
      border: "rgba(185,28,28,0.35)",
      icon: "🚨",
      percent,
      advice:
        "Very likely a scam. Do not share anything. Call Cyber Crime Helpline on 1930 immediately. Report at cybercrime.gov.in."
    };

  if (score >= 3)
    return {
      label: "HIGH RISK",
      color: "#EF4444",
      bg: "rgba(239,68,68,0.10)",
      border: "rgba(239,68,68,0.35)",
      icon: "⚠️",
      percent,
      advice:
        "Likely a scam. Disconnect and report on cybercrime.gov.in."
    };

  if (score >= 2)
    return {
      label: "MEDIUM RISK",
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.10)",
      border: "rgba(245,158,11,0.35)",
      icon: "🔍",
      percent,
      advice:
        "Some risk signs. Verify the phone number and ID independently before acting."
    };

  return {
    label: "LOW RISK",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.10)",
    border: "rgba(34,197,94,0.35)",
    icon: "✅",
    percent,
    advice:
      "This doesn't appear to be a scam for now. Stay cautious."
  };
}

/* ─── Inline Mini Calculator Component ─────────────────────────────────── */
function MiniCalculator() {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const answered = Object.keys(answers).length;
  const complete = answered === miniQuestions.length;

  const handleSelect = (qid, val) => {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
  };

  const handleCheck = (e) => {
    e.stopPropagation();
    const score = Object.values(answers).filter((v) => v === "yes").length;
    setResult(getMiniRisk(score));
  };

  const handleReset = (e) => {
    e.stopPropagation();
    setAnswers({});
    setResult(null);
  };

  return (
    <div className="mini-calc" style={{ display: "flex", justifyContent: "center" }}>

      {/* Expanded panel (always open) */}
<div
  className="mini-calc-panel"
  onClick={(e) => e.stopPropagation()}
  style={{ width: "100%", maxWidth: "1000px" }}
>
        {/* Header */}
        <div className="mini-panel-header">
          <div>
            <div className="mini-panel-title">⚡ Quick Risk Check</div>
            <div className="mini-panel-sub">5 yes/no questions answerable in ~20 seconds</div>
          </div>
          <button className="mini-close-btn" onClick={() => { setAnswers({}); setResult(null); }}>↻ Reset</button>
        </div>

        {/* Result view */}
        {result ? (
          <div className="mini-result" style={{ borderColor: result.border, background: result.bg }}>
            <div className="mini-result-top">
              <span className="mini-result-icon">{result.icon}</span>
              <div>
                <div className="mini-result-label" style={{ color: result.color }}>{result.label}</div>
                <div className="mini-result-score" style={{ color: result.color }}>
                  {result.percent}
                  <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>%</span>
                </div>
              </div>
            </div>

            <div className="mini-result-advice">{result.advice}</div>

            <div className="mini-result-actions">
              {Object.values(answers).filter(v => v === "yes").length >= 3 && (
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mini-btn-report"
                >
                  📋 Report on cybercrime.gov.in
                </a>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <button className="mini-btn-reset" onClick={handleReset}>
                  ↩ Try Again
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="mini-progress-row">
              <div className="mini-progress-track">
                <div
                  className="mini-progress-fill"
                  style={{ width: `${(answered / miniQuestions.length) * 100}%` }}
                />
              </div>
              <span className="mini-progress-count">{answered}/5</span>
            </div>

            {/* Questions */}
            <div className="mini-questions">
              {miniQuestions.map((q, i) => (
                <div
                  className={`mini-q${answers[q.id] ? " mini-q-answered" : ""}`}
                  key={q.id}
                >
                  <div className="mini-q-text">
                    <span className="mini-q-num">{i + 1}.</span> {q.question}
                  </div>

                  <div className="mini-radio-group">
                    {["yes", "no"].map((val) => (
                      <label
                        key={val}
                        className={`mini-radio-label${answers[q.id] === val ? " mini-radio-selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={val}
                          checked={answers[q.id] === val}
                          onChange={() => handleSelect(q.id, val)}
                          style={{ display: "none" }}
                        />
                        <span className="mini-radio-dot" />
                        {val === "yes" ? "Yes" : "No"}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit */}
            <button
              className="mini-check-btn"
              disabled={!complete}
              onClick={handleCheck}
            >
              {complete ? "⚡ Check My Risk" : `Answer all questions (${answered}/5)`}
            </button>
          </>
        )}
      </div>
      <VoiceAgent />
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.home {
  background: #f7efe6;
  color: #0f172a;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

/* ── MINI CALCULATOR ── */
.mini-calc {
  margin-bottom: 28px;
  max-width: 460px;
}

/* Collapsed pill */
.mini-calc-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  background: #fbf7f0;
  border: 1px solid rgba(6,182,212,0.3);
  border-radius: 12px;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  box-shadow: 0 0 18px rgba(6,182,212,0.1);
}
.mini-calc-pill:hover {
  border-color: #06B6D4;
  box-shadow: 0 0 28px rgba(6,182,212,0.2);
  transform: translateY(-1px);
}
.mini-pill-icon { font-size: 1.1rem; flex-shrink: 0; }
.mini-pill-text { font-size: 0.88rem; font-weight: 600; color: #0f172a; flex: 1; }
.mini-pill-cta {
  font-size: 0.78rem;
  font-weight: 600;
  color: #06B6D4;
  white-space: nowrap;
  border: 1px solid rgba(6,182,212,0.3);
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(6,182,212,0.07);
}

/* Expanded panel */
.mini-calc-panel {
  background: #fbf7f0;
  border: 1px solid rgba(6,182,212,0.25);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(6,182,212,0.1);
  animation: mini-expand 0.22s ease;
}
@keyframes mini-expand {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.mini-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}
.mini-panel-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.98rem;
  color: #0f172a;
  margin-bottom: 2px;
}
.mini-panel-sub { font-size: 0.75rem; color: #94A3B8; }
.mini-close-btn {
  background: none;
  border: none;
  color: #94A3B8;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
  line-height: 1;
}
.mini-close-btn:hover { color: #0f172a; background: #e6e9ef; }

/* Progress */
.mini-progress-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.mini-progress-track {
  flex: 1;
  height: 4px;
  background: #e6e9ef;
  border-radius: 2px;
  overflow: hidden;
}
.mini-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #06B6D4, #22D3EE);
  border-radius: 2px;
  transition: width 0.35s ease;
}
.mini-progress-count { font-size: 0.75rem; font-weight: 700; color: #06B6D4; white-space: nowrap; }

/* Questions */
.mini-questions { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.mini-q {
  background: #f3efe9;
  border: 1px solid #e6e9ef;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: border-color 0.2s;
}
.mini-q.mini-q-answered { border-color: rgba(6,182,212,0.3); }
.mini-q-text { font-size: 0.82rem; color: #334155; line-height: 1.4; flex: 1; }
.mini-q-num { font-weight: 700; color: #06B6D4; margin-right: 4px; }
.mini-radio-group { display: flex; gap: 6px; flex-shrink: 0; }
.mini-radio-label {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  background: #fbf7f0;
  border: 1px solid #e6e9ef;
  border-radius: 7px;
  font-size: 0.8rem;
  color: #475569;
  cursor: pointer;
  font-weight: 500;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
  user-select: none;
}
.mini-radio-label:hover { border-color: rgba(6,182,212,0.4); color: #0f172a; }
.mini-radio-label.mini-radio-selected {
  border-color: #06B6D4;
  background: rgba(6,182,212,0.08);
  color: #0f172a;
  font-weight: 600;
}
.mini-radio-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  border: 1.5px solid #cbd5e1;
  flex-shrink: 0;
  transition: border-color 0.15s, background 0.15s;
}
.mini-radio-label.mini-radio-selected .mini-radio-dot {
  border-color: #06B6D4;
  background: #06B6D4;
}

/* Submit */
.mini-check-btn {
  width: 100%;
  padding: 11px;
  background: linear-gradient(135deg, #06B6D4, #0891b2);
  color: #0F172A;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 0 16px rgba(6,182,212,0.25);
}
.mini-check-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 0 28px rgba(6,182,212,0.4); }
.mini-check-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Result */
.mini-result {
  border: 1px solid;
  border-radius: 12px;
  padding: 16px;
}
.mini-result-top { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.mini-result-icon { font-size: 2rem; }
.mini-result-label { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 1rem; letter-spacing: -0.01em; }
.mini-result-score { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 1.6rem; letter-spacing: -0.02em; }
.mini-result-advice { font-size: 0.82rem; color: #334155; line-height: 1.6; margin-bottom: 12px; background: rgba(255,255,255,0.5); border-radius: 8px; padding: 10px 12px; }
.mini-result-actions { display: flex; flex-direction: column; gap: 7px; }
.mini-btn-report {
  display: block;
  text-align: center;
  padding: 9px;
  background: #EF4444;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  border-radius: 8px;
  text-decoration: none;
  transition: filter 0.2s;
}
.mini-btn-report:hover { filter: brightness(1.1); }
.mini-btn-reset {
  flex: 1;
  padding: 9px;
  background: transparent;
  border: 1px solid #e6e9ef;
  border-radius: 8px;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.mini-btn-reset:hover { border-color: #06B6D4; color: #06B6D4; }
.mini-btn-full {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 9px;
  background: rgba(6,182,212,0.1);
  border: 1px solid rgba(6,182,212,0.3);
  border-radius: 8px;
  color: #06B6D4;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s;
}
.mini-btn-full:hover { background: rgba(6,182,212,0.18); border-color: #06B6D4; }

/* ── HERO ── */
.hero {
  position: relative;
  min-height: 68vh;
  display: flex;
  align-items: center;
  padding: 56px 24px 34px;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 50% at 70% 40%, rgba(6,182,212,0.07) 0%, transparent 65%),
    radial-gradient(ellipse 40% 40% at 20% 80%, rgba(6,182,212,0.04) 0%, transparent 60%);
  pointer-events: none;
}
.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  mask-image: radial-gradient(ellipse 80% 80% at center, black 30%, transparent 100%);
}
.hero-inner {
  position: relative;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 42px;
  align-items: center;
}
@media (max-width: 900px) {
  .hero-inner { grid-template-columns: 1fr; gap: 48px; }
  .hero-visual { display: none; }
}
.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(6,182,212,0.1);
  border: 1px solid rgba(6,182,212,0.25);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #06B6D4;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.hero-h1 {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 800;
  font-size: clamp(2.4rem, 5vw, 3.6rem);
  line-height: 1.08;
  letter-spacing: -0.03em;
  margin-bottom: 5px;
  
}
.hero-h1 .accent { color: #06B6D4; }
.hero-sub {
  font-size: 1.02rem;
  color: #94A3B8;
  line-height: 1.65;
  max-width: 480px;
  margin-bottom: 24px;
}
.hero-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
  margin-top: 28px;
  width: 100%;
}

.hero-actions .hero-btn {
  min-width: 240px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #06B6D4, #0891b2);
  color: #0F172A;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  border-radius: 10px;
  text-decoration: none;
  box-shadow: 0 0 24px rgba(6,182,212,0.3);
  transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 40px rgba(6,182,212,0.5);
  filter: brightness(1.05);
}
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 24px;
  border: 1px solid #334155;
  color: #a9a9a9;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 0.95rem;
  border-radius: 10px;
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}
.btn-secondary:hover {
  border-color: #06B6D4;
  color: #06B6D4;
  background: rgba(6,182,212,0.05);
}
.hero-trust {
   display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 18px;
  flex-wrap: wrap;
}
.hero-trust-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: #64748B;
}
.hero-trust-item span { color: #22C55E; }

/* Visual panel */
.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}
.shield-wrap {
  position: relative;
  width: 340px;
  height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.shield-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(6,182,212,0.15);
  animation: pulse-ring 3s ease-in-out infinite;
}
.shield-ring:nth-child(1) { width: 100%; height: 100%; animation-delay: 0s; }
.shield-ring:nth-child(2) { width: 75%; height: 75%; animation-delay: 0.8s; border-color: rgba(6,182,212,0.2); }
.shield-ring:nth-child(3) { width: 50%; height: 50%; animation-delay: 1.6s; border-color: rgba(6,182,212,0.3); }
@keyframes pulse-ring {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.03); opacity: 1; }
}
.shield-center {
  position: relative;
  width: 140px;
  height: 140px;
  background: linear-gradient(135deg, #ffffff, #f3efe9);
  border: 1px solid rgba(6,182,212,0.3);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  box-shadow: 0 0 40px rgba(6,182,212,0.15), inset 0 1px 0 rgba(255,255,255,0.05);
  animation: float 4s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.floating-badge {
  position: absolute;
  padding: 8px 14px;
  background: #fbf7f0;
  border: 1px solid #334155;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.floating-badge.red { top: 20px; right: -10px; border-color: rgba(239,68,68,0.4); color: #EF4444; animation: float 4s 0.5s ease-in-out infinite; }
.floating-badge.green { bottom: 30px; left: -10px; border-color: rgba(34,197,94,0.4); color: #22C55E; animation: float 4s 1s ease-in-out infinite; }
.floating-badge.amber { top: 50%; left: -30px; border-color: rgba(245,158,11,0.4); color: #F59E0B; animation: float 4s 1.5s ease-in-out infinite; }

/* ── SECTION WRAPPER ── */
.section { padding: 50px 24px; }
.section-inner { max-width: 1280px; margin: 0 auto; }
.section-alt { background: transparent; }
.section-header { text-align: center; margin-bottom: 52px; }
.section-tag {
  display: inline-block;
  padding: 4px 14px;
  background: rgba(6,182,212,0.1);
  border: 1px solid rgba(6,182,212,0.2);
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #06B6D4;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 14px;
}
.section-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 800;
  font-size: clamp(1.8rem, 3.5vw, 2.6rem);
  letter-spacing: -0.02em;
  margin-bottom: 12px;
}
.section-sub { font-size: 1rem; color: #94A3B8; max-width: 520px; margin: 0 auto; line-height: 1.65; }

/* ── STATS ── */
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
@media (max-width: 700px) { .stats-grid { grid-template-columns: 1fr; } }
.stat-card {
  background: #fbf7f0;
  border: 1px solid #e6e9ef;
  border-radius: 16px;
  padding: 32px 28px;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
.stat-icon { font-size: 2.2rem; margin-bottom: 14px; }
.stat-value { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 2rem; letter-spacing: -0.02em; margin-bottom: 6px; }
.stat-label { font-weight: 600; font-size: 0.95rem; margin-bottom: 4px; }
.stat-sub { font-size: 0.82rem; color: #64748B; }

/* ── SCAM TYPES ── */
.scam-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
@media (max-width: 900px) { .scam-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .scam-grid { grid-template-columns: 1fr; } }
.scam-card {
  background: #fbf7f0;
  border: 1px solid #e6e9ef;
  border-radius: 14px;
  padding: 26px 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  cursor: default;
}
.scam-card:hover { transform: translateY(-3px); border-color: rgba(6,182,212,0.3); box-shadow: 0 8px 32px rgba(0,0,0,0.25); }
.scam-card-top { display: flex; align-items: center; justify-content: space-between; }
.scam-card-icon { font-size: 1.8rem; }
.risk-badge { padding: 3px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; color: #fff; }
.scam-card-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1rem; }
.scam-card-desc { font-size: 0.87rem; color: #94A3B8; line-height: 1.6; }

/* ── HOW IT WORKS ── */
.steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; position: relative; }
@media (max-width: 800px) { .steps-grid { grid-template-columns: 1fr; } }
.step-card {
  background: #fbf7f0;
  border: 1px solid #e6e9ef;
  border-radius: 16px;
  padding: 32px 26px;
  text-align: center;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}
.step-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
.step-num { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 0.75rem; color: #334155; letter-spacing: 0.1em; margin-bottom: 12px; }
.step-icon-wrap {
  width: 64px; height: 64px;
  background: linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.05));
  border: 1px solid rgba(6,182,212,0.2);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem;
  margin: 0 auto 18px;
}
.step-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.05rem; margin-bottom: 10px; }
.step-desc { font-size: 0.88rem; color: #94A3B8; line-height: 1.65; }

/* ── PRIVACY ── */
.privacy-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
@media (max-width: 640px) { .privacy-grid { grid-template-columns: 1fr; } }
.privacy-card {
  background: #fbf7f0;
  border: 1px solid #e6e9ef;
  border-radius: 14px;
  padding: 26px 22px;
  display: flex;
  gap: 18px;
  align-items: flex-start;
  transition: transform 0.2s, border-color 0.2s;
}
.privacy-card:hover { transform: translateY(-3px); border-color: rgba(6,182,212,0.25); }
.privacy-icon-wrap {
  width: 48px; height: 48px;
  flex-shrink: 0;
  background: rgba(6,182,212,0.1);
  border: 1px solid rgba(6,182,212,0.2);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem;
}
.privacy-card-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.98rem; margin-bottom: 6px; }
.privacy-card-desc { font-size: 0.86rem; color: #94A3B8; line-height: 1.6; }

/* ── EMERGENCY BANNER ── */
.emergency {
  padding: 48px 24px;
  background: linear-gradient(135deg, rgba(239,68,68,0.08) 0%, #f7efe6 60%);
  border-top: 1px solid rgba(239,68,68,0.15);
  border-bottom: 1px solid rgba(239,68,68,0.15);
}
.emergency-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
}
.emergency-left { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
.emergency-pulse {
  width: 56px; height: 56px;
  background: rgba(239,68,68,0.15);
  border: 2px solid rgba(239,68,68,0.4);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.6rem;
  animation: pulse-badge 2s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes pulse-badge {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); }
  50% { box-shadow: 0 0 0 12px rgba(239,68,68,0); }
}
.emergency-label { font-size: 0.8rem; color: #EF4444; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 4px; }
.emergency-number { font-family: 'Space Grotesk', sans-serif; font-size: 2.4rem; font-weight: 800; color: #EF4444; letter-spacing: -0.02em; line-height: 1; margin-bottom: 4px; }
.emergency-desc { font-size: 0.88rem; color: #94A3B8; }
.emergency-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.btn-danger {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 24px;
  background: #EF4444; color: #fff;
  font-weight: 700; font-size: 0.92rem;
  border-radius: 10px; text-decoration: none;
  transition: filter 0.2s, transform 0.2s;
}
.btn-danger:hover { filter: brightness(1.1); transform: translateY(-1px); }
.btn-outline-danger {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 22px;
  border: 1px solid rgba(239,68,68,0.4); color: #EF4444;
  font-weight: 600; font-size: 0.88rem;
  border-radius: 10px; text-decoration: none;
  transition: background 0.2s, border-color 0.2s;
}
.btn-outline-danger:hover { background: rgba(239,68,68,0.08); border-color: #EF4444; }

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .hero { padding: 70px 24px; min-height: auto; }
  .hero-inner { gap: 40px; }
  .shield-wrap { width: 280px; height: 280px; }
  .shield-center { width: 120px; height: 120px; font-size: 52px; }
  .section { padding: 70px 20px; }
}

@media (min-width: 1024px) {

  .mini-calc {
    max-width: 1000px;
    width: 100%;
    margin-top: -28px;
  }

  .mini-calc-panel {
    width: 100%;
  }
        
  .mini-q {
    padding: 14px 18px;
  }

  .mini-q-text {
    font-size: 0.94rem;
  }
  
}
  

@media (max-width: 768px) {
  .hero {padding: 36px 18px 20px; min-height: auto; text-align: center; }
  .hero-inner { grid-template-columns: 1fr; gap: 36px; }
  .hero-content { display: flex; flex-direction: column; align-items: center; }
  .hero-sub { max-width: 100%; }
  .hero-actions { justify-content: center; width: 100%; }
  .btn-primary, .btn-secondary { justify-content: center; }
  .hero-trust { justify-content: center; }
  .hero-visual { display: none; }
  .section { padding: 60px 18px; }
  .section-header { margin-bottom: 40px; }
  .stats-grid, .steps-grid, .privacy-grid, .scam-grid { grid-template-columns: 1fr; }
  .stat-card, .step-card, .privacy-card, .scam-card { padding: 24px 20px; }
  .emergency-inner { flex-direction: column; align-items: flex-start; }
  .emergency-actions { width: 100%; }
  .btn-danger, .btn-outline-danger { width: 100%; justify-content: center; }
  .emergency-number { font-size: 2rem; }
  .mini-calc { max-width: 100%; }
}
@media (max-width: 480px) {
  .hero { padding: 28px 16px 12px; min-height: auto; margin-top: -10px; }
  .hero-h1 { font-size: 2rem; line-height: 1.15; }
  .hero-sub { font-size: 0.95rem; margin-bottom: 18px;}
  .hero-eyebrow { font-size: 0.72rem; padding: 5px 12px; }
  .hero-actions { flex-direction: column; width: 100%; gap: 12px; }
  .btn-primary, .btn-secondary { width: 100%; }
  .hero-trust { gap: 10px; flex-direction: row; align-items: center;  margin-top: 18px; margin-bottom: 18px; }
  .section { padding: 50px 16px; }
  .section-title { font-size: 1.8rem; }
  .section-sub { font-size: 0.92rem; }
  .stat-value { font-size: 1.7rem; }
  .step-icon-wrap { width: 56px; height: 56px; font-size: 1.5rem; }
  .privacy-card { flex-direction: column; align-items: flex-start; }
  .privacy-icon-wrap { width: 44px; height: 44px; }
  .emergency { padding: 40px 16px; }
  .emergency-number { font-size: 1.7rem; }
  .mini-q { flex-direction: column; align-items: flex-start; gap: 8px; }
  .mini-radio-group { width: 100%; }
  .mini-radio-label { flex: 1; justify-content: center; }
}
@media (max-width: 360px) {
  .hero-h1 { font-size: 1.75rem; }
  .section-title { font-size: 1.6rem; }
  .btn-primary, .btn-secondary, .btn-danger, .btn-outline-danger { font-size: 0.88rem; padding: 12px 18px; }
  .stat-card, .step-card, .privacy-card, .scam-card { padding: 20px 16px; }
}
  /* ── MINI CALCULATOR CENTER SECTION ── */
.mini-section {
  padding: 26px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 5;

}

.mini-section-inner {
  width: 100%;
  display: flex;
  justify-content: center;
}
      `}</style>

      <div className="home">

        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-grid" />
          <div className="hero-inner">
            <div className="hero-content">

              <div className="hero-eyebrow">🛡️ AI-Powered Scam Detection</div>
              <h1 className="hero-h1">
                Protect Yourself<br />From <span className="accent">Digital Scams</span>
              </h1>
              <p className="hero-sub">
                India's growing scam threats demand fast awareness. Our risk engine helps users quickly detect suspicious activity and stay protected from financial fraud.              </p>
              
              <div className="hero-trust">
                <span className="hero-trust-item"><span>✓</span> No Login</span>
                <span className="hero-trust-item"><span>✓</span> 100% Free</span>
                <span className="hero-trust-item"><span>✓</span> Data Not Stored</span>
                <span className="hero-trust-item"><span>✓</span> Works in Hindi</span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="shield-wrap">
                <div className="shield-ring" />
                <div className="shield-ring" />
                <div className="shield-ring" />
                <div className="shield-center">🛡️</div>
                <div className="floating-badge red">⚠️ HIGH RISK DETECTED</div>
                <div className="floating-badge green">✅ SAFE TO PROCEED</div>
                <div className="floating-badge amber">🔍 ANALYZING...</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MINI CALCULATOR SECTION ── */}
        <section className="mini-section">
          <div className="mini-section-inner">
            <MiniCalculator />
          </div>
        </section>

        <div className="hero-actions">
          <Link to="/awareness" className="btn-secondary">📖 Learn About Scams</Link>
        </div>

        {/* ── STATS ── */}
        <section className="section section-alt">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-tag">⚠️ The Threat Is Real</div>
              <h2 className="section-title">Scam Activity in India</h2>
              <p className="section-sub">These numbers represent real people — your family, neighbors, and friends. Stay informed to stay protected.</p>
            </div>
            <div className="stats-grid">
              {stats.map((s) => (
                <div className="stat-card" key={s.label}>
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SCAM TYPES ── */}
        <section className="section">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-tag">🔍 Know the Threats</div>
              <h2 className="section-title">Common Scam Types</h2>
              <p className="section-sub">Understanding how scams work is your first line of defence. Recognise these patterns before they fool you.</p>
            </div>
            <div className="scam-grid">
              {scamTypes.map((s) => (
                <div className="scam-card" key={s.title}>
                  <div className="scam-card-top">
                    <span className="scam-card-icon">{s.icon}</span>
                    <span className="risk-badge" style={{ background: riskBadge[s.risk] + "22", color: riskBadge[s.risk], border: `1px solid ${riskBadge[s.risk]}44` }}>{s.risk}</span>
                  </div>
                  <div className="scam-card-title">{s.title}</div>
                  <div className="scam-card-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="section section-alt">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-tag">🧭 Simple Process</div>
              <h2 className="section-title">How It Works</h2>
              <p className="section-sub">Three easy steps. No tech knowledge required. Designed for everyone — including seniors and first-time smartphone users.</p>
            </div>
            <div className="steps-grid">
              {steps.map((s) => (
                <div className="step-card" key={s.num}>
                  <div className="step-num">STEP {s.num}</div>
                  <div className="step-icon-wrap">{s.icon}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <Link to="/calculator" className="btn-primary" style={{ display: "inline-flex" }}>
                ⚡ Try It Now — It's Free
              </Link>
            </div>
          </div>
        </section>

        {/* ── PRIVACY ── */}
        <section className="section">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-tag">🔒 Your Privacy</div>
              <h2 className="section-title">Privacy First, Always</h2>
              <p className="section-sub">We built ScamRisk on a foundation of zero data collection. Your trust means everything to us.</p>
            </div>
            <div className="privacy-grid">
              {privacyPoints.map((p) => (
                <div className="privacy-card" key={p.title}>
                  <div className="privacy-icon-wrap">{p.icon}</div>
                  <div>
                    <div className="privacy-card-title">{p.title}</div>
                    <div className="privacy-card-desc">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EMERGENCY BANNER ── */}
        <section className="emergency">
          <div className="emergency-inner">
            <div className="emergency-left">
              <div className="emergency-pulse">🚨</div>
              <div>
                <div className="emergency-label">National Cyber Crime Helpline</div>
                <div className="emergency-number">1930</div>
                <div className="emergency-desc">Already been scammed? Call immediately — time matters for fund recovery.</div>
              </div>
            </div>
            <div className="emergency-actions">
              <a href="tel:1930" className="btn-danger">📞 Call 1930 Now</a>
              <Link to="/report" className="btn-outline-danger">📋 File Online Report</Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
