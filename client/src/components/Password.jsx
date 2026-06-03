import { useState, useEffect } from "react";

export default function PasswordGate({ children }) {
    const [input, setInput] = useState("");
    const [unlocked, setUnlocked] = useState(
        localStorage.getItem("access") === "granted"
    );
    const [error, setError] = useState(false);

    const PASSWORD = "wallnetsafes2s";

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input === PASSWORD) {
        localStorage.setItem("access", "granted");
        setUnlocked(true);
        } else {
        setError(true);
        setTimeout(() => setError(false), 500);
        }
    };

    if (unlocked) return children;

    return (
        <>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');

            .gate-page {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f7efe6;
            font-family: 'Inter', sans-serif;
            color: #0f172a;
            position: relative;
            overflow: hidden;
            }

            /* Background glow */
            .gate-bg {
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse 70% 60% at 50% 0%, rgba(6,182,212,0.08), transparent 70%);
            }

            /* Grid overlay */
            .gate-grid {
            position: absolute;
            inset: 0;
            background-image:
                linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px);
            background-size: 60px 60px;
            mask-image: radial-gradient(ellipse 80% 80% at center, black 20%, transparent 100%);
            }

            /* Card */
            .gate-card {
            position: relative;
            background: #fbf7f0;
            border: 1px solid #e6e9ef;
            border-radius: 18px;
            padding: 40px 36px;
            text-align: center;
            width: 320px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.08);
            animation: fadeIn 0.6s ease;
            }

            @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
            }

            /* Title */
            .gate-title {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 800;
            font-size: 1.6rem;
            margin-bottom: 8px;
            }

            .gate-sub {
            font-size: 0.9rem;
            color: #94A3B8;
            margin-bottom: 24px;
            }

            /* Input */
            .gate-input {
            width: 100%;
            padding: 12px;
            border-radius: 10px;
            border: 1px solid #e6e9ef;
            background: #ffffff;
            font-size: 0.9rem;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
            }

            .gate-input:focus {
            border-color: #06B6D4;
            box-shadow: 0 0 0 3px rgba(6,182,212,0.1);
            }

            /* Button */
            .gate-btn {
            width: 100%;
            margin-top: 14px;
            padding: 12px;
            border-radius: 10px;
            border: none;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            background: linear-gradient(135deg, #06B6D4, #0891b2);
            color: #0f172a;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 0 20px rgba(6,182,212,0.25);
            }

            .gate-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 36px rgba(6,182,212,0.45);
            }

            /* Error */
            .gate-error {
            margin-top: 10px;
            font-size: 0.8rem;
            color: #ef4444;
            }

            /* Shake animation */
            .shake {
            animation: shake 0.4s;
            }

            @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-6px); }
            50% { transform: translateX(6px); }
            75% { transform: translateX(-6px); }
            100% { transform: translateX(0); }
            }
        `}</style>

        <div className="gate-page">
            <div className="gate-bg" />
            <div className="gate-grid" />

            <form
            className={`gate-card ${error ? "shake" : ""}`}
            onSubmit={handleSubmit}
            >
            <div className="gate-title">🔒 Private Access</div>
            <div className="gate-sub">Enter passcode to continue</div>

            <input
                type="password"
                className="gate-input"
                placeholder="Enter password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />

            <button className="gate-btn">Unlock</button>

            {error && <div className="gate-error">Incorrect password</div>}
            </form>
        </div>
        </>
    );
}