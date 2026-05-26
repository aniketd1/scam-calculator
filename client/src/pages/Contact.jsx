import { useState } from "react";

const channels = [
  { icon: "📧", title: "Email Us", value: "help@scamrisk.in", sub: "We respond within 24 hours", color: "#06B6D4" },
  { icon: "📞", title: "Cyber Crime Helpline", value: "1930", sub: "Government of India — 24/7", color: "#EF4444" },
  { icon: "🌐", title: "Official Report Portal", value: "cybercrime.gov.in", sub: "File a formal complaint online", color: "#22C55E" },
];

const faqs = [
  { q: "Is ScamRisk free to use?", a: "Yes, completely free. There is no subscription, no premium plan, and no hidden charges. The tool is a public-good initiative." },
  { q: "Do you store my data or answers?", a: "No. All session data is cleared when you close the browser tab. We do not log, store, or sell any information you enter." },
  { q: "I've been scammed — what should I do first?", a: "Call 1930 (National Cyber Crime Helpline) immediately. Time is critical — the faster you report, the higher the chance of recovering funds. Then file a report on cybercrime.gov.in." },
  { q: "Can I report a scam through your website?", a: "Yes. Our Report page lets you document scam details that can then be shared with relevant authorities. We also link directly to the government portal." },
  { q: "How accurate is the Risk Calculator?", a: "Our engine is trained on real scam patterns from government cybercrime databases. It's accurate for guidance, but is not a replacement for professional legal advice." },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "General Inquiry", message: "" });
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = e => { e.preventDefault(); if (form.name && form.email && form.message) setSent(true); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .contact-page {
          background: #f7efe6;
          color: #0f172a;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
        }

        /* HERO */
        .pg-hero {
          position: relative;
          padding: 90px 24px 64px;
          text-align: center;
          overflow: hidden;
        }
        .pg-hero-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 60% at 50% 0%, rgba(6,182,212,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .pg-hero-grid {
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
          font-size: clamp(2rem, 4vw, 2.8rem);
          letter-spacing: -0.03em;
          margin-bottom: 14px;
        }
        .pg-h1 .accent { color: #06B6D4; }
        .pg-sub { font-size: 0.95rem; color: #94A3B8; max-width: 480px; margin: 0 auto; line-height: 1.7; }

        /* CHANNELS */
        .channels-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px 56px;
        }
        @media (max-width: 720px) { .channels-grid { grid-template-columns: 1fr; } }
        .channel-card {
          background: #fbf7f0;
          border: 1px solid #e6e9ef;
          border-radius: 14px;
          padding: 26px 22px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        .channel-card:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(0,0,0,0.25); }
        .channel-icon {
          font-size: 1.8rem;
          width: 52px; height: 52px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .channel-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.9rem; margin-bottom: 4px; }
        .channel-value { font-size: 1rem; font-weight: 600; margin-bottom: 4px; }
        .channel-sub { font-size: 0.8rem; color: #64748B; }

        /* MAIN LAYOUT */
        .contact-layout {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px 80px;
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 28px;
        }
        @media (max-width: 900px) { .contact-layout { grid-template-columns: 1fr; } }

        /* FORM */
        .form-card {
          background: #fbf7f0;
          border: 1px solid #e6e9ef;
          border-radius: 18px;
          padding: 36px 32px;
        }
        @media (max-width: 560px) { .form-card { padding: 24px 18px; } }
        .form-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.3rem; margin-bottom: 6px; }
        .form-sub { font-size: 0.88rem; color: #64748B; margin-bottom: 28px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 560px) { .form-row { grid-template-columns: 1fr; } }
        .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .form-label { font-size: 0.82rem; font-weight: 600; color: #94A3B8; letter-spacing: 0.03em; }
        .form-input, .form-select, .form-textarea {
          padding: 12px 14px;
          background: #fbf7f0;
          border: 1px solid #e6e9ef;
          border-radius: 10px;
          color: #0f172a;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.92rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: #06B6D4;
          box-shadow: 0 0 0 3px rgba(6,182,212,0.1);
        }
        .form-textarea { resize: vertical; min-height: 120px; }
        .form-select { appearance: none; cursor: pointer; }
        .form-submit {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #06B6D4, #0891b2);
          color: #0F172A;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 0.98rem;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 20px rgba(6,182,212,0.25);
          margin-top: 6px;
        }
        .form-submit:hover { transform: translateY(-2px); box-shadow: 0 0 36px rgba(6,182,212,0.45); }

        /* SUCCESS */
        .success-state {
          text-align: center;
          padding: 40px 20px;
        }
        .success-icon { font-size: 3rem; margin-bottom: 16px; }
        .success-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.4rem; margin-bottom: 10px; color: #22C55E; }
        .success-msg { font-size: 0.92rem; color: #94A3B8; line-height: 1.65; }

        /* FAQ */
        .faq-col { display: flex; flex-direction: column; gap: 0; }
        .faq-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.1rem; margin-bottom: 18px; }
        .faq-item {
          border-bottom: 1px solid #e6e9ef;
          padding: 16px 0;
        }
        .faq-item:first-of-type { border-top: 1px solid #e6e9ef; }
        .faq-q {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          font-size: 0.92rem;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.4;
        }
        .faq-q:hover { color: #06B6D4; }
        .faq-toggle { font-size: 1.1rem; color: #475569; flex-shrink: 0; transition: transform 0.3s; }
        .faq-toggle.open { transform: rotate(45deg); color: #06B6D4; }
        .faq-a {
          font-size: 0.86rem;
          color: #475569;
          line-height: 1.65;
          margin-top: 10px;
          display: none;
        }
        .faq-a.open { display: block; }

        .notice-card {
          background: linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.03));
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 14px;
          padding: 20px;
          margin-top: 24px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .notice-icon { font-size: 1.4rem; flex-shrink: 0; }
        .notice-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.9rem; color: #EF4444; margin-bottom: 4px; }
        .notice-text { font-size: 0.84rem; color: #94A3B8; line-height: 1.55; }
      `}</style>

      <div className="contact-page">

        <section className="pg-hero">
          <div className="pg-hero-bg" />
          <div className="pg-hero-grid" />
          <div style={{ position: "relative" }}>
            <div className="pg-tag">📬 Get in Touch</div>
            <h1 className="pg-h1">We're Here to <span className="accent">Help</span></h1>
            <p className="pg-sub">Have a question, found a bug, or want to partner with us? Reach out and our team will get back to you promptly.</p>
          </div>
        </section>

        {/* CHANNELS */}
        <div className="channels-grid">
          {channels.map(c => (
            <div className="channel-card" key={c.title} style={{ borderColor: c.color + "25" }}>
              <div className="channel-icon" style={{ background: c.color + "15" }}>{c.icon}</div>
              <div>
                <div className="channel-title">{c.title}</div>
                <div className="channel-value" style={{ color: c.color }}>{c.value}</div>
                <div className="channel-sub">{c.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="contact-layout">

          {/* FORM */}
          <div className="form-card">
            {!sent ? (
              <>
                <div className="form-title">Send Us a Message</div>
                <div className="form-sub">We'll reply to your email within 24 hours on working days.</div>
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Your Name</label>
                      <input className="form-input" name="name" placeholder="e.g. Ramesh Gupta" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input className="form-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <select className="form-select" name="subject" value={form.subject} onChange={handleChange}>
                      <option>General Inquiry</option>
                      <option>Report a Bug</option>
                      <option>Partnership / Collaboration</option>
                      <option>Scam Report Assistance</option>
                      <option>Media / Press</option>
                      <option>Feedback</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Your Message</label>
                    <textarea className="form-textarea" name="message" placeholder="Describe your query or concern in detail..." value={form.message} onChange={handleChange} required />
                  </div>
                  <button type="submit" className="form-submit">📨 Send Message</button>
                </form>
              </>
            ) : (
              <div className="success-state">
                <div className="success-icon">✅</div>
                <div className="success-title">Message Sent!</div>
                <div className="success-msg">Thank you for reaching out. Our team will review your message and respond to <strong style={{color:"#0f172a"}}>{form.email}</strong> within 24 hours.</div>
              </div>
            )}
          </div>

          {/* FAQ */}
          <div className="faq-col">
            <div className="faq-title">Frequently Asked Questions</div>
            {faqs.map((f, i) => (
              <div className="faq-item" key={i}>
                <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <span className={`faq-toggle${openFaq === i ? " open" : ""}`}>+</span>
                </div>
                <div className={`faq-a${openFaq === i ? " open" : ""}`}>{f.a}</div>
              </div>
            ))}

            <div className="notice-card">
              <div className="notice-icon">🚨</div>
              <div>
                <div className="notice-title">Immediate Emergency?</div>
                <div className="notice-text">If you've been scammed right now, don't contact us — call <strong style={{color:"#EF4444"}}>1930</strong> immediately. Every minute matters for fund recovery.</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
