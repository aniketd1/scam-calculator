import { useState } from "react";
import { Link } from "react-router-dom";

/* ── STEP DATA ─────────────────────────────────────────────── */
const scamTypeOptions = [
  { icon: "🔢", label: "OTP / PIN Scam" },
  { icon: "📋", label: "KYC Update Scam" },
  { icon: "💳", label: "UPI / QR Code Fraud" },
  { icon: "👮", label: "Digital Arrest" },
  { icon: "📦", label: "Courier / Parcel Scam" },
  { icon: "🏦", label: "Fake Banking Call" },
  { icon: "💰", label: "Lottery / Prize Scam" },
  { icon: "👥", label: "Impersonation Scam" },
  { icon: "🛒", label: "Online Shopping Fraud" },
  { icon: "❓", label: "Other / Not Sure" },
];

const channelOptions = [
  { icon: "📞", label: "Phone Call" },
  { icon: "💬", label: "WhatsApp Message" },
  { icon: "📱", label: "SMS / Text" },
  { icon: "📧", label: "Email" },
  { icon: "🌐", label: "Social Media (Facebook, Instagram)" },
  { icon: "🔗", label: "Suspicious Website / Link" },
  { icon: "📹", label: "Video Call" },
];

const STEPS = ["Scam Type", "Channel", "Incident Details", "Your Info", "Review"];

const INITIAL_FORM = {
  scamType: "",
  channel: "",
  incidentDate: "",
  description: "",
  financialLoss: "no",
  lossAmount: "",
  suspectPhone: "",
  suspectName: "",
  evidence: "",
  reporterName: "",
  reporterPhone: "",
  reporterEmail: "",
  anonymous: false,
};

/* ── HELPERS ───────────────────────────────────────────────── */
function StepIndicator({ current, total, labels }) {
  return (
    <div className="step-indicator">
      {labels.map((label, i) => (
        <div key={label} className={`step-item${i < current ? " done" : i === current ? " active" : ""}`}>
          <div className="step-circle">
            {i < current ? "✓" : i + 1}
          </div>
          <div className="step-label">{label}</div>
          {i < total - 1 && <div className="step-line" />}
        </div>
      ))}
    </div>
  );
}

/* ── COMPONENT ─────────────────────────────────────────────── */
export default function Report() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber] = useState(() => "SRC" + Date.now().toString().slice(-8));

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const canNext = () => {
    if (step === 0) return !!form.scamType;
    if (step === 1) return !!form.channel;
    if (step === 2) return form.description.length >= 20;
    if (step === 3) return form.anonymous || (form.reporterName && form.reporterPhone);
    return true;
  };

  const handleSubmit = () => setSubmitted(true);

  if (submitted) {
    return (
      <>
        <PageStyles />
        <div className="report-page">
          <div className="success-page">
            <div className="success-glow" />
            <div className="success-box">
              <div className="success-icon-wrap">
                <div className="success-icon">✅</div>
              </div>
              <div className="success-ref">Reference #{refNumber}</div>
              <h2 className="success-title">Report Submitted Successfully</h2>
              <p className="success-msg">
                Your scam report has been recorded. Please save your reference number above for follow-up.
                For immediate assistance, call the Cyber Crime Helpline.
              </p>

              <div className="success-next-title">What happens next?</div>
              <div className="success-steps">
                {[
                  { icon: "📋", text: "Your report details are documented and timestamped." },
                  { icon: "🔍", text: "You can quote your reference number when filing on cybercrime.gov.in." },
                  { icon: "📞", text: "If you shared contact details, our team may reach out if more info is needed." },
                ].map(s => (
                  <div className="success-step" key={s.text}>
                    <span>{s.icon}</span>
                    <p>{s.text}</p>
                  </div>
                ))}
              </div>

              <div className="success-helpline">
                <div className="sh-label">For immediate action, call</div>
                <div className="sh-number">1930</div>
                <div className="sh-sub">National Cyber Crime Helpline · 24/7</div>
              </div>

              <div className="success-actions">
                <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="btn-primary">
                  🌐 File Official FIR on cybercrime.gov.in
                </a>
                <Link to="/awareness" className="btn-outline">📚 Learn About Scam Types</Link>
                <Link to="/calculator" className="btn-outline">⚡ Check Another Risk</Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageStyles />
      <div className="report-page">

        {/* HERO */}
        <section className="rp-hero">
          <div className="rp-hero-bg" />
          <div className="rp-hero-grid" />
          <div style={{ position: "relative" }}>
            <div className="pg-tag">📋 Report a Scam</div>
            <h1 className="pg-h1">Help Us <span className="accent">Fight Back</span> Against Scammers</h1>
            <p className="pg-sub">
              Document your scam encounter in under 3 minutes. Your report helps build awareness and protects others.
              All reports are completely anonymous if you choose.
            </p>
          </div>
        </section>

        {/* EMERGENCY STRIP */}
        <div className="emergency-strip">
          <div className="es-inner">
            <div className="es-pulse">🚨</div>
            <div>
              <div className="es-label">Just been scammed? Don't wait — call immediately</div>
              <div className="es-number">1930</div>
            </div>
            <a href="tel:1930" className="es-btn">Call Now</a>
          </div>
        </div>

        {/* FORM CONTAINER */}
        <div className="form-container">

          {/* STEP INDICATOR */}
          <StepIndicator current={step} total={STEPS.length} labels={STEPS} />

          {/* FORM CARD */}
          <div className="form-card">

            {/* ── STEP 0: SCAM TYPE ── */}
            {step === 0 && (
              <div className="step-content">
                <div className="step-heading">What type of scam did you encounter?</div>
                <div className="step-sub">Select the option that best describes what happened.</div>
                <div className="type-grid">
                  {scamTypeOptions.map(opt => (
                    <button
                      key={opt.label}
                      className={`type-btn${form.scamType === opt.label ? " selected" : ""}`}
                      onClick={() => set("scamType", opt.label)}
                    >
                      <span className="type-icon">{opt.icon}</span>
                      <span className="type-label">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 1: CHANNEL ── */}
            {step === 1 && (
              <div className="step-content">
                <div className="step-heading">How did the scammer contact you?</div>
                <div className="step-sub">Select the primary communication channel used.</div>
                <div className="channel-grid">
                  {channelOptions.map(opt => (
                    <button
                      key={opt.label}
                      className={`channel-btn${form.channel === opt.label ? " selected" : ""}`}
                      onClick={() => set("channel", opt.label)}
                    >
                      <span className="ch-icon">{opt.icon}</span>
                      <span className="ch-label">{opt.label}</span>
                      {form.channel === opt.label && <span className="ch-check">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 2: INCIDENT DETAILS ── */}
            {step === 2 && (
              <div className="step-content">
                <div className="step-heading">Tell us what happened</div>
                <div className="step-sub">The more detail you provide, the more useful your report will be.</div>

                <div className="form-group">
                  <label className="form-label">When did this happen?</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.incidentDate}
                    onChange={e => set("incidentDate", e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Describe the incident <span className="required">*</span></label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe exactly what happened — what was said, what was asked, what links or numbers were involved..."
                    value={form.description}
                    onChange={e => set("description", e.target.value)}
                    rows={5}
                  />
                  <div className={`char-count${form.description.length < 20 ? " warn" : ""}`}>
                    {form.description.length} characters {form.description.length < 20 ? `(minimum 20)` : "✓"}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Did you suffer a financial loss?</label>
                  <div className="radio-group">
                    {["yes", "no", "attempted"].map(v => (
                      <button
                        key={v}
                        className={`radio-btn${form.financialLoss === v ? " selected" : ""}`}
                        onClick={() => set("financialLoss", v)}
                      >
                        {v === "yes" ? "Yes, I lost money" : v === "no" ? "No financial loss" : "They tried but failed"}
                      </button>
                    ))}
                  </div>
                </div>

                {form.financialLoss === "yes" && (
                  <div className="form-group">
                    <label className="form-label">Approximate amount lost (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 5000"
                      value={form.lossAmount}
                      onChange={e => set("lossAmount", e.target.value)}
                    />
                  </div>
                )}

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Suspect phone / account number (if known)</label>
                    <input
                      className="form-input"
                      placeholder="+91 XXXXXXXXXX"
                      value={form.suspectPhone}
                      onChange={e => set("suspectPhone", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Suspect name or organisation (if known)</label>
                    <input
                      className="form-input"
                      placeholder="e.g. 'SBI Customer Care'"
                      value={form.suspectName}
                      onChange={e => set("suspectName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Any links, screenshots, or additional evidence?</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Paste any suspicious URLs, message content, or describe evidence you've saved..."
                    value={form.evidence}
                    onChange={e => set("evidence", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* ── STEP 3: YOUR INFO ── */}
            {step === 3 && (
              <div className="step-content">
                <div className="step-heading">Your contact information</div>
                <div className="step-sub">Optional — only needed if you want a follow-up. You can remain fully anonymous.</div>

                <div className="anon-toggle" onClick={() => set("anonymous", !form.anonymous)}>
                  <div className={`toggle-switch${form.anonymous ? " on" : ""}`}>
                    <div className="toggle-thumb" />
                  </div>
                  <div>
                    <div className="toggle-label">Submit anonymously</div>
                    <div className="toggle-sub">No contact details will be collected or stored</div>
                  </div>
                </div>

                {!form.anonymous && (
                  <div className="reporter-fields">
                    <div className="info-note">
                      ℹ️ Your details are used only if we need to follow up on your report. They are never shared publicly.
                    </div>
                    <div className="form-group">
                      <label className="form-label">Your Name <span className="required">*</span></label>
                      <input
                        className="form-input"
                        placeholder="e.g. Ramesh Gupta"
                        value={form.reporterName}
                        onChange={e => set("reporterName", e.target.value)}
                      />
                    </div>
                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">Phone Number <span className="required">*</span></label>
                        <input
                          className="form-input"
                          placeholder="+91 XXXXXXXXXX"
                          value={form.reporterPhone}
                          onChange={e => set("reporterPhone", e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email Address (optional)</label>
                        <input
                          type="email"
                          className="form-input"
                          placeholder="you@example.com"
                          value={form.reporterEmail}
                          onChange={e => set("reporterEmail", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 4: REVIEW ── */}
            {step === 4 && (
              <div className="step-content">
                <div className="step-heading">Review & Submit</div>
                <div className="step-sub">Please verify your report details before submitting.</div>

                <div className="review-grid">
                  {[
                    { label: "Scam Type", value: form.scamType },
                    { label: "Contact Channel", value: form.channel },
                    { label: "Incident Date", value: form.incidentDate || "Not specified" },
                    { label: "Financial Loss", value: form.financialLoss === "yes" ? `Yes — ₹${form.lossAmount || "amount not specified"}` : form.financialLoss === "attempted" ? "Attempted but failed" : "No" },
                    { label: "Suspect Info", value: [form.suspectPhone, form.suspectName].filter(Boolean).join(" · ") || "Not provided" },
                    { label: "Reporter", value: form.anonymous ? "Anonymous" : form.reporterName || "Not provided" },
                  ].map(r => (
                    <div className="review-item" key={r.label}>
                      <div className="review-label">{r.label}</div>
                      <div className="review-value">{r.value}</div>
                    </div>
                  ))}
                </div>

                <div className="review-desc-box">
                  <div className="review-desc-label">Incident Description</div>
                  <div className="review-desc-text">{form.description}</div>
                </div>

                <div className="disclaimer-box">
                  <span>⚖️</span>
                  <p>By submitting this report, you confirm that the information provided is accurate to the best of your knowledge. False reports undermine legitimate investigations.</p>
                </div>

                <button className="submit-btn" onClick={handleSubmit}>
                  📋 Submit Scam Report
                </button>

                <div className="gov-cta">
                  <span>💡</span>
                  <p>For a legally actionable FIR, also file on&nbsp;
                    <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer">cybercrime.gov.in</a>
                  </p>
                </div>
              </div>
            )}

            {/* NAV BUTTONS */}
            <div className="form-nav">
              {step > 0 && (
                <button className="nav-btn-back" onClick={() => setStep(s => s - 1)}>
                  ← Back
                </button>
              )}
              {step < STEPS.length - 1 && (
                <button
                  className="nav-btn-next"
                  disabled={!canNext()}
                  onClick={() => setStep(s => s + 1)}
                >
                  Continue →
                </button>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="rp-sidebar">
            <div className="rp-sidebar-card helpline-card">
              <div className="hs-label">🚨 Emergency Helpline</div>
              <div className="hs-number">1930</div>
              <div className="hs-sub">National Cyber Crime · 24/7</div>
              <a href="tel:1930" className="hs-call-btn">📞 Call Now</a>
            </div>

            <div className="rp-sidebar-card">
              <div className="sb-title">📎 What to Include</div>
              <ul className="sb-list">
                <li>The exact number or account that contacted you</li>
                <li>Screenshots of messages or links received</li>
                <li>Bank transaction IDs if money was transferred</li>
                <li>Time and date of the incident</li>
                <li>Any names or organisation the scammer used</li>
              </ul>
            </div>

            <div className="rp-sidebar-card gov-card">
              <div className="sb-title">🌐 Official Channels</div>
              <div className="gov-link-list">
                <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="gov-link">
                  <span>🏛️</span> cybercrime.gov.in
                </a>
                <a href="https://sancharsaathi.gov.in" target="_blank" rel="noopener noreferrer" className="gov-link">
                  <span>📱</span> Sanchar Saathi Portal
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

/* ── STYLES ────────────────────────────────────────────────── */
function PageStyles() {
  return (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      .report-page {
        background: #f7efe6;
        color: #0f172a;
        font-family: 'Inter', sans-serif;
        min-height: 100vh;
      }

      /* ── HERO ── */
      .rp-hero {
        position: relative;
        padding: 90px 24px 60px;
        text-align: center;
        overflow: hidden;
      }
      .rp-hero-bg {
        position: absolute; inset: 0;
        background: radial-gradient(ellipse 70% 60% at 50% 0%, rgba(239,68,68,0.06) 0%, transparent 70%);
        pointer-events: none;
      }
      .rp-hero-grid {
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
        background: rgba(239,68,68,0.1);
        border: 1px solid rgba(239,68,68,0.25);
        border-radius: 20px;
        font-size: 0.75rem; font-weight: 600;
        color: #EF4444;
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
      .pg-sub { font-size: 0.95rem; color: #94A3B8; max-width: 520px; margin: 0 auto; line-height: 1.7; }

      /* ── EMERGENCY STRIP ── */
      .emergency-strip {
        background: linear-gradient(90deg, rgba(239,68,68,0.1), rgba(239,68,68,0.04));
        border-top: 1px solid rgba(239,68,68,0.2);
        border-bottom: 1px solid rgba(239,68,68,0.2);
        padding: 16px 24px;
      }
      .es-inner {
        max-width: 1200px; margin: 0 auto;
        display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
      }
      .es-pulse {
        font-size: 1.4rem;
        animation: pulse-icon 1.8s ease-in-out infinite;
      }
      @keyframes pulse-icon {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.15); }
      }
      .es-label { font-size: 0.82rem; color: #94A3B8; }
      .es-number {
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 800; font-size: 1.6rem;
        color: #EF4444; letter-spacing: -0.02em; line-height: 1;
      }
      .es-btn {
        margin-left: auto;
        padding: 9px 22px;
        background: #EF4444;
        color: #fff; font-weight: 700; font-size: 0.88rem;
        border-radius: 8px; text-decoration: none;
        transition: filter 0.2s;
      }
      .es-btn:hover { filter: brightness(1.1); }

      /* ── LAYOUT ── */
      .form-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 24px 80px;
        display: grid;
        grid-template-columns: 1fr 300px;
        grid-template-rows: auto 1fr;
        gap: 24px;
        align-items: start;
      }
      @media (max-width: 960px) { .form-container { grid-template-columns: 1fr; } }

      /* ── STEP INDICATOR ── */
      .step-indicator {
        grid-column: 1 / -1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0;
        margin-bottom: 8px;
        overflow-x: auto;
        padding-bottom: 4px;
      }
      .step-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        flex-shrink: 0;
      }
      .step-circle {
        width: 34px; height: 34px;
        border-radius: 50%;
        border: 2px solid #e6e9ef;
        background: #f3efe9;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.82rem; font-weight: 700;
        color: #334155;
        transition: all 0.3s;
        position: relative;
        z-index: 1;
      }
      .step-item.active .step-circle {
        border-color: #06B6D4;
        background: rgba(6,182,212,0.15);
        color: #06B6D4;
        box-shadow: 0 0 14px rgba(6,182,212,0.3);
      }
      .step-item.done .step-circle {
        border-color: #22C55E;
        background: rgba(34,197,94,0.15);
        color: #22C55E;
      }
      .step-label {
        font-size: 0.72rem; font-weight: 600;
        color: #475569;
        margin-top: 6px;
        white-space: nowrap;
        letter-spacing: 0.02em;
      }
      .step-item.active .step-label { color: #06B6D4; }
      .step-item.done .step-label { color: #22C55E; }
      .step-line {
        position: absolute;
        top: 17px;
        left: calc(50% + 17px);
        width: 80px;
        height: 2px;
        background: #e6e9ef;
        z-index: 0;
      }
      .step-item.done .step-line { background: #22C55E; }
      @media (max-width: 640px) { .step-line { width: 40px; } }

      /* ── FORM CARD ── */
      .form-card {
        background: #fbf7f0;
        border: 1px solid #e6e9ef;
        border-radius: 18px;
        padding: 36px 32px;
      }
      @media (max-width: 560px) { .form-card { padding: 24px 18px; } }

      .step-heading {
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 800;
        font-size: 1.3rem;
        letter-spacing: -0.02em;
        margin-bottom: 6px;
      }
      .step-sub {
        font-size: 0.88rem; color: #64748B;
        margin-bottom: 28px;
        line-height: 1.55;
      }

      /* ── SCAM TYPE GRID ── */
      .type-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 12px;
      }
      .type-btn {
        display: flex; flex-direction: column;
        align-items: center; gap: 8px;
        padding: 18px 12px;
        background: #fbf7f0;
        border: 2px solid #e6e9ef;
        border-radius: 12px;
        cursor: pointer;
        font-family: 'Inter', sans-serif;
        transition: border-color 0.2s, background 0.2s, transform 0.15s;
        text-align: center;
      }
      .type-btn:hover { border-color: rgba(6,182,212,0.4); transform: translateY(-2px); }
      .type-btn.selected { border-color: #06B6D4; background: rgba(6,182,212,0.08); }
      .type-icon { font-size: 1.8rem; }
      .type-label { font-size: 0.82rem; font-weight: 500; color: #334155; line-height: 1.3; }
      .type-btn.selected .type-label { color: #0f172a; }

      /* ── CHANNEL GRID ── */
      .channel-grid {
        display: flex; flex-direction: column; gap: 10px;
      }
      .channel-btn {
        display: flex; align-items: center; gap: 14px;
        padding: 14px 18px;
        background: #fbf7f0;
        border: 2px solid #e6e9ef;
        border-radius: 12px;
        cursor: pointer;
        font-family: 'Inter', sans-serif;
        transition: border-color 0.2s, background 0.2s;
        text-align: left;
      }
      .channel-btn:hover { border-color: rgba(6,182,212,0.4); background: rgba(6,182,212,0.03); }
      .channel-btn.selected { border-color: #06B6D4; background: rgba(6,182,212,0.08); }
      .ch-icon { font-size: 1.4rem; width: 28px; text-align: center; flex-shrink: 0; }
      .ch-label { flex: 1; font-size: 0.92rem; color: #334155; font-weight: 500; }
      .channel-btn.selected .ch-label { color: #0f172a; }
      .ch-check { font-size: 0.9rem; color: #06B6D4; font-weight: 700; }

      /* ── FORM INPUTS ── */
      .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
      .form-label { font-size: 0.82rem; font-weight: 600; color: #94A3B8; letter-spacing: 0.02em; }
      .required { color: #EF4444; }
      .form-input, .form-textarea {
        padding: 12px 14px;
        background: #fbf7f0;
        border: 1px solid #e6e9ef;
        border-radius: 10px;
        color: #0f172a;
        font-family: 'Inter', sans-serif;
        font-size: 0.92rem;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        width: 100%;
      }
      .form-input:focus, .form-textarea:focus {
        border-color: #06B6D4;
        box-shadow: 0 0 0 3px rgba(6,182,212,0.1);
      }
      .form-textarea { resize: vertical; min-height: 110px; }
      .char-count { font-size: 0.76rem; color: #475569; text-align: right; margin-top: 4px; }
      .char-count.warn { color: #F59E0B; }
      .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      @media (max-width: 600px) { .form-row-2 { grid-template-columns: 1fr; } }

      /* ── RADIO GROUP ── */
      .radio-group { display: flex; gap: 10px; flex-wrap: wrap; }
      .radio-btn {
        padding: 9px 16px;
        background: #fbf7f0;
        border: 1px solid #e6e9ef;
        border-radius: 8px;
        color: #334155;
        font-family: 'Inter', sans-serif;
        font-size: 0.85rem; font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      .radio-btn:hover { border-color: #06B6D4; color: #06B6D4; }
      .radio-btn.selected { border-color: #06B6D4; background: rgba(6,182,212,0.08); color: #06B6D4; font-weight: 600; }

      /* ── ANONYMOUS TOGGLE ── */
      .anon-toggle {
        display: flex; align-items: center; gap: 14px;
        padding: 16px 18px;
        background: #fbf7f0;
        border: 1px solid #e6e9ef;
        border-radius: 12px;
        cursor: pointer;
        margin-bottom: 20px;
        transition: border-color 0.2s;
      }
      .anon-toggle:hover { border-color: rgba(6,182,212,0.3); }
      .toggle-switch {
        width: 44px; height: 24px;
        background: #e6e9ef;
        border-radius: 12px;
        position: relative;
        flex-shrink: 0;
        transition: background 0.3s;
      }
      .toggle-switch.on { background: #06B6D4; }
      .toggle-thumb {
        position: absolute;
        top: 3px; left: 3px;
        width: 18px; height: 18px;
        background: #fff;
        border-radius: 50%;
        transition: transform 0.3s;
      }
      .toggle-switch.on .toggle-thumb { transform: translateX(20px); }
      .toggle-label { font-size: 0.92rem; font-weight: 600; color: #0f172a; margin-bottom: 2px; }
      .toggle-sub { font-size: 0.78rem; color: #64748B; }
      .reporter-fields { padding-top: 4px; }
      .info-note {
        padding: 12px 14px;
        background: rgba(6,182,212,0.04);
        border: 1px solid rgba(6,182,212,0.12);
        border-radius: 10px;
        font-size: 0.84rem; color: #475569;
        margin-bottom: 20px; line-height: 1.55;
      }

      /* ── REVIEW ── */
      .review-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 16px;
      }
      @media (max-width: 560px) { .review-grid { grid-template-columns: 1fr; } }
      .review-item {
        background: #fbf7f0;
        border: 1px solid #e6e9ef;
        border-radius: 10px;
        padding: 14px 16px;
      }
      .review-label { font-size: 0.72rem; font-weight: 700; color: #475569; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 4px; }
      .review-value { font-size: 0.9rem; color: #0f172a; font-weight: 500; }
      .review-desc-box {
        background: #fbf7f0;
        border: 1px solid #e6e9ef;
        border-radius: 10px;
        padding: 16px;
        margin-bottom: 16px;
      }
      .review-desc-label { font-size: 0.72rem; font-weight: 700; color: #475569; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px; }
      .review-desc-text { font-size: 0.88rem; color: #475569; line-height: 1.65; }
      .disclaimer-box {
        display: flex; gap: 10px; align-items: flex-start;
        padding: 14px 16px;
        background: rgba(245,158,11,0.06);
        border: 1px solid rgba(245,158,11,0.12);
        border-radius: 10px;
        margin-bottom: 20px;
        font-size: 0.83rem; color: #475569; line-height: 1.55;
      }
      .gov-cta {
        display: flex; gap: 8px; align-items: flex-start;
        padding: 12px 14px;
        background: rgba(6,182,212,0.04);
        border: 1px solid rgba(6,182,212,0.12);
        border-radius: 10px;
        margin-top: 14px;
        font-size: 0.83rem; color: #475569; line-height: 1.55;
      }
      .gov-cta a { color: #06B6D4; text-decoration: none; font-weight: 600; }
      .gov-cta a:hover { text-decoration: underline; }

      /* ── BUTTONS ── */
      .form-nav {
        display: flex; justify-content: space-between;
        margin-top: 28px;
        gap: 12px;
      }
      .nav-btn-back {
        padding: 12px 22px;
        background: transparent;
        border: 1px solid #e6e9ef;
        border-radius: 10px;
        color: #475569;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem; font-weight: 500;
        cursor: pointer;
        transition: border-color 0.2s, color 0.2s;
      }
      .nav-btn-back:hover { border-color: #06B6D4; color: #06B6D4; }
      .nav-btn-next {
        margin-left: auto;
        padding: 12px 28px;
        background: linear-gradient(135deg, #06B6D4, #0891b2);
        color: #0f172a;
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 700; font-size: 0.95rem;
        border: none; border-radius: 10px;
        cursor: pointer;
        box-shadow: 0 0 18px rgba(6,182,212,0.25);
        transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
      }
      .nav-btn-next:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 32px rgba(6,182,212,0.45); }
      .nav-btn-next:disabled { opacity: 0.38; cursor: not-allowed; }
      .submit-btn {
        width: 100%;
        padding: 15px;
        background: linear-gradient(135deg, #06B6D4, #0891b2);
        color: #0F172A;
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 700; font-size: 1rem;
        border: none; border-radius: 12px;
        cursor: pointer;
        box-shadow: 0 0 20px rgba(6,182,212,0.28);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 0 36px rgba(6,182,212,0.5); }

      /* ── SIDEBAR ── */
      .rp-sidebar { display: flex; flex-direction: column; gap: 18px; }
      .rp-sidebar-card {
        background: #fbf7f0;
        border: 1px solid #e6e9ef;
        border-radius: 14px;
        padding: 20px 18px;
      }
      .helpline-card {
        background: linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.04));
        border-color: rgba(239,68,68,0.28);
        text-align: center;
      }
      .hs-label { font-size: 0.78rem; font-weight: 600; color: #94A3B8; margin-bottom: 4px; letter-spacing: 0.04em; }
      .hs-number { font-family: 'Space Grotesk', sans-serif; font-size: 2.4rem; font-weight: 800; color: #EF4444; letter-spacing: -0.02em; line-height: 1; margin-bottom: 4px; }
      .hs-sub { font-size: 0.76rem; color: #64748B; margin-bottom: 14px; }
      .hs-call-btn {
        display: block;
        padding: 10px;
        background: #EF4444;
        color: #fff; font-weight: 700; font-size: 0.88rem;
        border-radius: 8px; text-decoration: none;
        transition: filter 0.2s;
      }
      .hs-call-btn:hover { filter: brightness(1.1); }
      .sb-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.88rem; margin-bottom: 12px; }
      .sb-list { list-style: none; display: flex; flex-direction: column; gap: 9px; }
      .sb-list li { display: flex; gap: 8px; font-size: 0.82rem; color: #475569; line-height: 1.5; }
      .sb-list li::before { content: "→"; color: #06B6D4; flex-shrink: 0; font-weight: 700; }
      .gov-link-list { display: flex; flex-direction: column; gap: 8px; }
      .gov-link {
        display: flex; align-items: center; gap: 8px;
        padding: 10px 12px;
        background: #fbf7f0;
        border: 1px solid #e6e9ef;
        border-radius: 8px;
        font-size: 0.84rem; color: #06B6D4;
        text-decoration: none; font-weight: 500;
        transition: border-color 0.2s, background 0.2s;
      }
      .gov-link:hover { border-color: #06B6D4; background: rgba(6,182,212,0.05); }

      /* ── SUCCESS PAGE ── */
      .success-page {
        min-height: 100vh;
        display: flex; align-items: center; justify-content: center;
        padding: 60px 24px;
        position: relative;
        overflow: hidden;
      }
      .success-glow {
        position: absolute; inset: 0;
        background: radial-gradient(ellipse 60% 50% at 50% 50%, rgba(34,197,94,0.07) 0%, transparent 65%);
        pointer-events: none;
      }
      .success-box {
        position: relative;
        background: #fbf7f0;
        border: 1px solid rgba(34,197,94,0.12);
        border-radius: 24px;
        padding: 48px 40px;
        max-width: 600px;
        width: 100%;
        text-align: center;
      }
      @media (max-width: 560px) { .success-box { padding: 32px 20px; } }
      .success-icon-wrap {
        width: 72px; height: 72px;
        background: rgba(34,197,94,0.12);
        border: 2px solid rgba(34,197,94,0.35);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 2rem;
        margin: 0 auto 18px;
      }
      .success-ref {
        display: inline-block;
        padding: 4px 14px;
        background: rgba(6,182,212,0.1);
        border: 1px solid rgba(6,182,212,0.25);
        border-radius: 20px;
        font-size: 0.78rem; font-weight: 700;
        color: #06B6D4; letter-spacing: 0.06em;
        margin-bottom: 14px;
      }
      .success-title {
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 800; font-size: 1.6rem;
        color: #22C55E; letter-spacing: -0.02em;
        margin-bottom: 12px;
      }
      .success-msg { font-size: 0.9rem; color: #94A3B8; line-height: 1.65; max-width: 460px; margin: 0 auto 28px; }
      .success-next-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.9rem; margin-bottom: 14px; text-align: left; }
      .success-steps { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
      .success-step {
        display: flex; gap: 12px; align-items: flex-start;
        background: #f3efe9; border: 1px solid #e6e9ef;
        border-radius: 10px; padding: 12px 14px;
        text-align: left;
      }
      .success-step span { font-size: 1.1rem; flex-shrink: 0; }
      .success-step p { font-size: 0.84rem; color: #475569; line-height: 1.55; }
      .success-helpline {
        background: linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.04));
        border: 1px solid rgba(239,68,68,0.25);
        border-radius: 12px;
        padding: 18px; margin-bottom: 24px;
      }
      .sh-label { font-size: 0.78rem; color: #94A3B8; margin-bottom: 2px; }
      .sh-number { font-family: 'Space Grotesk', sans-serif; font-size: 2rem; font-weight: 800; color: #EF4444; letter-spacing: -0.02em; }
      .sh-sub { font-size: 0.76rem; color: #64748B; }
      .success-actions { display: flex; flex-direction: column; gap: 10px; }
      .btn-primary {
        display: block; width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #06B6D4, #0891b2);
        color: #0F172A; font-family: 'Space Grotesk', sans-serif;
        font-weight: 700; font-size: 0.95rem;
        border-radius: 10px; text-decoration: none;
        box-shadow: 0 0 20px rgba(6,182,212,0.25);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 36px rgba(6,182,212,0.45); }
      .btn-outline {
        display: block; width: 100%;
        padding: 12px;
        border: 1px solid #e6e9ef;
        border-radius: 10px;
        color: #475569; font-family: 'Inter', sans-serif;
        font-weight: 500; font-size: 0.9rem;
        text-decoration: none;
        transition: border-color 0.2s, color 0.2s;
      }
      .btn-outline:hover { border-color: #06B6D4; color: #06B6D4; }

      /* ───────────────── RESPONSIVE DESIGN ───────────────── */

/* Large Tablets */
@media (max-width: 1024px) {

  .rp-hero {
    padding: 80px 22px 56px;
  }

  .form-container {
    padding: 36px 20px 70px;
    gap: 22px;
  }

  .form-card {
    padding: 30px 26px;
  }

  .success-box {
    max-width: 90%;
  }
}


/* Tablets */
@media (max-width: 768px) {

  .report-page {
    overflow-x: hidden;
  }

  .rp-hero {
    padding: 72px 18px 50px;
  }

  .pg-h1 {
    line-height: 1.15;
  }

  .pg-sub {
    max-width: 100%;
    font-size: 0.92rem;
  }

  .emergency-strip {
    padding: 14px 18px;
  }

  .es-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .es-btn {
    margin-left: 0;
    width: 100%;
    text-align: center;
  }

  .form-container {
    grid-template-columns: 1fr;
    padding: 32px 18px 60px;
  }

  .step-indicator {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .step-label {
    font-size: 0.68rem;
  }

  .step-line {
    width: 46px;
  }

  .form-card {
    padding: 28px 22px;
  }

  .type-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .review-grid {
    grid-template-columns: 1fr;
  }

  .rp-sidebar {
    width: 100%;
  }

  .success-page {
    padding: 50px 18px;
  }

  .success-box {
    padding: 36px 24px;
  }
}


/* Mobile Devices */
@media (max-width: 480px) {

  .rp-hero {
    padding: 60px 16px 44px;
  }

  .pg-tag {
    font-size: 0.68rem;
    padding: 4px 12px;
  }

  .pg-h1 {
    font-size: 1.9rem;
    line-height: 1.12;
  }

  .pg-sub {
    font-size: 0.88rem;
    line-height: 1.65;
  }

  .emergency-strip {
    padding: 14px 16px;
  }

  .es-inner {
    align-items: stretch;
    text-align: center;
  }

  .es-number {
    font-size: 1.45rem;
  }

  .es-btn {
    width: 100%;
    padding: 12px;
    font-size: 0.9rem;
  }

  .form-container {
    padding: 28px 16px 50px;
    gap: 18px;
  }

  .form-card {
    padding: 22px 16px;
    border-radius: 14px;
  }

  .step-heading {
    font-size: 1.1rem;
    line-height: 1.3;
  }

  .step-sub {
    font-size: 0.84rem;
    margin-bottom: 22px;
  }

  .type-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .type-btn {
    padding: 16px 12px;
  }

  .type-icon {
    font-size: 1.5rem;
  }

  .type-label {
    font-size: 0.8rem;
  }

  .channel-btn {
    padding: 12px 14px;
    gap: 12px;
  }

  .ch-label {
    font-size: 0.86rem;
  }

  .form-input,
  .form-textarea {
    font-size: 0.88rem;
    padding: 11px 12px;
  }

  .form-textarea {
    min-height: 100px;
  }

  .radio-group {
    flex-direction: column;
  }

  .radio-btn {
    width: 100%;
    text-align: center;
  }

  .anon-toggle {
    padding: 14px;
    gap: 12px;
  }

  .toggle-label {
    font-size: 0.86rem;
  }

  .toggle-sub {
    font-size: 0.74rem;
  }

  .review-item,
  .review-desc-box,
  .disclaimer-box,
  .gov-cta {
    padding: 14px;
  }

  .review-value,
  .review-desc-text {
    font-size: 0.84rem;
  }

  .submit-btn {
    padding: 14px;
    font-size: 0.92rem;
  }

  .form-nav {
    flex-direction: column;
  }

  .nav-btn-back,
  .nav-btn-next {
    width: 100%;
    justify-content: center;
    text-align: center;
  }

  .rp-sidebar-card {
    padding: 18px 16px;
  }

  .hs-number {
    font-size: 2rem;
  }

  .gov-link {
    font-size: 0.8rem;
    padding: 10px;
  }

  .success-page {
    padding: 40px 16px;
  }

  .success-box {
    padding: 30px 18px;
    border-radius: 18px;
  }

  .success-title {
    font-size: 1.35rem;
    line-height: 1.3;
  }

  .success-msg {
    font-size: 0.84rem;
  }

  .success-step {
    padding: 12px;
  }

  .success-step p {
    font-size: 0.8rem;
  }

  .sh-number {
    font-size: 1.7rem;
  }

  .btn-primary,
  .btn-outline {
    font-size: 0.88rem;
    padding: 12px;
  }
}


/* Small Phones */
@media (max-width: 360px) {

  .pg-h1 {
    font-size: 1.7rem;
  }

  .form-card {
    padding: 18px 14px;
  }

  .type-btn,
  .channel-btn {
    padding: 14px 10px;
  }

  .step-heading {
    font-size: 1rem;
  }

  .submit-btn,
  .btn-primary,
  .btn-outline {
    font-size: 0.84rem;
  }

  .hs-number,
  .sh-number {
    font-size: 1.5rem;
  }
}
    
      `}</style>
  );
}
