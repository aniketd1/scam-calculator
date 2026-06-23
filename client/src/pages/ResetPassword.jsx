import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [strength, setStrength] = useState(0);

    // ---------------- PASSWORD STRENGTH ----------------
    const checkStrength = (pwd) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return score;
    };

    useEffect(() => {
        setStrength(checkStrength(password));
    }, [password]);

    // ---------------- RESET HANDLER ----------------
    const handleReset = async () => {
        setLoading(true);
        setMsg("");

        try {
        const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            token,
            newPassword: password,
            }),
        });

        const data = await res.json();

        if (data.success) {
            setSuccess(true);
            setMsg("Password updated successfully!");
        } else {
            setMsg(data.error || "Reset failed.");
        }
        } catch {
        setMsg("Server error.");
        }

        setLoading(false);
    };

    // ---------------- UI ----------------
    return (
        <div style={styles.page}>
        <div style={styles.card}>

            {!success ? (
            <>
                <h2 style={styles.title}>Reset Password</h2>
                <p style={styles.subtitle}>Choose a strong new password</p>

                {/* INPUT */}
                <div style={styles.inputWrap}>
                <input
                    style={styles.input}
                    type={show ? "text" : "password"}
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    type="button"
                    style={styles.eye}
                    onClick={() => setShow(!show)}
                >
                    {show ? "🙈" : "👁️"}
                </button>
                </div>

                {/* STRENGTH BAR */}
                <div style={styles.strengthBar}>
                <div
                    style={{
                    ...styles.strengthFill,
                    width: `${(strength / 4) * 100}%`,
                    background:
                        strength <= 1
                        ? "#ef4444"
                        : strength === 2
                        ? "#f59e0b"
                        : strength === 3
                        ? "#3b82f6"
                        : "#22c55e",
                    }}
                />
                </div>

                <p style={styles.strengthText}>
                {strength <= 1 && "Weak"}
                {strength === 2 && "Fair"}
                {strength === 3 && "Good"}
                {strength === 4 && "Strong"}
                </p>

                {/* BUTTON */}
                <button
                style={styles.button}
                onClick={handleReset}
                disabled={loading || strength < 2}
                >
                {loading ? "Updating..." : "Reset Password"}
                </button>

                {msg && <p style={styles.msg}>{msg}</p>}
            </>
            ) : (
            // ---------------- SUCCESS SCREEN ----------------
            <div style={styles.success}>
                <div style={styles.check}>🎉</div>

                <h2 style={{ marginBottom: "8px" }}>
                    Password Updated Successfully
                </h2>

                <p style={{ color: "#64748b", fontSize: "13px", lineHeight: "1.5" }}>
                    Your password has been changed.<br />
                    You can now close this window and log in with your new password.
                </p>
                
            </div>
            )}
        </div>
        </div>
    );
    }

    // ---------------- STYLES ----------------
    const styles = {
    page: {
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg,#f7efe6,#e0f7fa)",
        fontFamily: "Inter, sans-serif",
    },

    card: {
        width: "380px",
        padding: "28px",
        borderRadius: "18px",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        textAlign: "center",
    },

    title: {
        fontSize: "22px",
        fontWeight: "700",
        marginBottom: "4px",
    },

    subtitle: {
        fontSize: "13px",
        color: "#64748b",
        marginBottom: "18px",
    },

    inputWrap: {
        position: "relative",
    },

    input: {
        width: "100%",
        padding: "12px",
        paddingRight: "40px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
        outline: "none",
    },

    eye: {
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontSize: "16px",
    },

    strengthBar: {
        height: "6px",
        background: "#e2e8f0",
        borderRadius: "10px",
        marginTop: "12px",
        overflow: "hidden",
    },

    strengthFill: {
        height: "100%",
        transition: "0.3s",
    },

    strengthText: {
        fontSize: "12px",
        marginTop: "6px",
        color: "#64748b",
    },

    button: {
        width: "100%",
        marginTop: "16px",
        padding: "12px",
        borderRadius: "10px",
        border: "none",
        background: "linear-gradient(135deg,#06B6D4,#0891b2)",
        color: "#fff",
        fontWeight: "600",
        cursor: "pointer",
    },

    msg: {
        marginTop: "12px",
        fontSize: "13px",
        color: "#64748b",
    },

    success: {
        padding: "20px",
    },

    check: {
        fontSize: "40px",
        marginBottom: "10px",
    },
};