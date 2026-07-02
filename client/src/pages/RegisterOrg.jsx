// pages/RegisterOrg.jsx
import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function RegisterOrg() {
  const [form, setForm] = useState({
    orgName: "", orgType: "college",
    contactName: "", contactEmail: "",
    contactPhone: "", website: "",
  });
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"
  const [error, setError]   = useState("");

  const update = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.orgName || !form.contactName || !form.contactEmail)
      return setError("Organisation name, contact name and email are required.");
    setError("");
    setStatus("loading");
    try {
      const res  = await fetch(`${API_BASE}/api/orgs/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Something went wrong."); setStatus("error"); return; }
      setStatus("success");
    } catch {
      setError("Server error. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.successIcon}>✓</div>
        <h2 style={styles.title}>Application received</h2>
        <p style={styles.hint}>
          We'll review your request and email your API key to <strong>{form.contactEmail}</strong> within 1–2 business days.
        </p>
        <p style={styles.hint}>Questions? <a href="mailto:support@scam2safe.com">support@scam2safe.com</a></p>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <p style={styles.eyebrow}>For Organisations</p>
        <h1 style={styles.title}>Integrate Scam2Safe into your ERP</h1>
        <p style={styles.hint}>
          Fill in your details below. We'll review your application and email your API key within 1–2 business days.
        </p>

        <div style={styles.field}>
          <label style={styles.label}>Organisation Name *</label>
          <input style={styles.input} name="orgName" placeholder="ABC University"
            value={form.orgName} onChange={update} />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Organisation Type *</label>
          <select style={styles.input} name="orgType" value={form.orgType} onChange={update}>
            <option value="college">College / University</option>
            <option value="hospital">Hospital / Clinic</option>
            <option value="corporate">Corporate</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Contact Name *</label>
            <input style={styles.input} name="contactName" placeholder="John Smith"
              value={form.contactName} onChange={update} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Contact Email *</label>
            <input style={styles.input} name="contactEmail" type="email" placeholder="john@abc.edu"
              value={form.contactEmail} onChange={update} />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Phone</label>
            <input style={styles.input} name="contactPhone" placeholder="+91 98765 43210"
              value={form.contactPhone} onChange={update} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Website</label>
            <input style={styles.input} name="website" placeholder="https://abc.edu"
              value={form.website} onChange={update} />
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button style={styles.btn} disabled={status === "loading"} onClick={handleSubmit}>
          {status === "loading" ? "Submitting…" : "Submit application →"}
        </button>

        <p style={styles.footer}>
          Already have an API key? See the{" "}
          <a href="/docs/erp-integration">integration guide</a>.
        </p>
      </div>
    </div>
  );
}

const styles = {
  page:        { minHeight: "100vh", background: "#f7efe6", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" },
  card:        { background: "#fbf7f0", border: "1px solid #e2d9cc", borderRadius: 20, padding: "40px 36px", maxWidth: 640, width: "100%", display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 4px 28px rgba(15,23,42,0.07)" },
  eyebrow:     { fontSize: "0.72rem", fontWeight: 700, color: "#d97706", letterSpacing: "0.08em", textTransform: "uppercase" },
  title:       { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "#0f172a", margin: 0 },
  hint:        { fontSize: "0.88rem", color: "#64748b", lineHeight: 1.7, margin: 0 },
  field:       { display: "flex", flexDirection: "column", gap: 5, flex: 1 },
  row:         { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  label:       { fontSize: "0.73rem", fontWeight: 600, color: "#475569", letterSpacing: "0.05em", textTransform: "uppercase" },
  input:       { padding: "11px 13px", borderRadius: 10, border: "1.5px solid #e2d9cc", background: "#fff", fontSize: "0.91rem", color: "#0f172a", outline: "none", width: "100%", boxSizing: "border-box" },
  error:       { padding: "11px 14px", borderRadius: 9, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: "0.84rem" },
  btn:         { padding: 13, borderRadius: 10, border: "none", background: "linear-gradient(135deg,#06B6D4,#0891b2)", color: "#fff", fontWeight: 700, fontSize: "0.94rem", cursor: "pointer" },
  footer:      { fontSize: "0.78rem", color: "#94a3b8", textAlign: "center" },
  successIcon: { width: 56, height: 56, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "2px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", color: "#16a34a", margin: "0 auto" },
};