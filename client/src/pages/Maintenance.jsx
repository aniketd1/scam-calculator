import React from "react";

export default function Maintenance() {
  return (
    <div className="maintenance-page">
      <div className="maintenance-card">
        <div className="maintenance-icon">🛠️</div>

        <div className="maintenance-badge">
          SYSTEM MAINTENANCE
        </div>

        <h1>Coming Soon! <br/>Under Maintenance</h1>

        <p>
          We're currently improving Scam2Safe to provide a
          better experience for our users.
          <br />
          Please check back shortly.
        </p>

        <div className="maintenance-info">
          <div className="info-item">
            <span>🔒</span>
            Security Updates
          </div>

          <div className="info-item">
            <span>⚡</span>
            Performance Improvements
          </div>

          <div className="info-item">
            <span>🤖</span>
            AI Feature Enhancements
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

        * {
          box-sizing: border-box;
        }

        .maintenance-page {
          min-height: 100vh;
          background: #F6F1E8;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          font-family: 'Inter', sans-serif;
        }

        .maintenance-card {
          max-width: 700px;
          width: 100%;
          text-align: center;
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(6,182,212,0.15);
          border-radius: 28px;
          padding: 4rem 2rem;
          backdrop-filter: blur(10px);
          box-shadow:
            0 20px 40px rgba(0,0,0,0.05),
            0 0 30px rgba(6,182,212,0.08);
        }

        .maintenance-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .maintenance-badge {
          display: inline-block;
          padding: 0.7rem 1.3rem;
          border-radius: 999px;
          background: rgba(6,182,212,0.12);
          color: #0891b2;
          font-weight: 600;
          font-size: 0.85rem;
          letter-spacing: 1px;
          margin-bottom: 1.5rem;
        }

        .maintenance-card h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 3.5rem;
          font-weight: 700;
          color: #081631;
          margin-bottom: 1rem;
        }

        .maintenance-card p {
          color: #64748b;
          font-size: 1.15rem;
          line-height: 1.8;
          max-width: 600px;
          margin: 0 auto 2.5rem auto;
        }

        .maintenance-info {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .info-item {
          padding: 0.9rem 1.3rem;
          border-radius: 14px;
          background: white;
          border: 1px solid rgba(6,182,212,0.12);
          color: #081631;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        @media (max-width: 768px) {
          .maintenance-card {
            padding: 3rem 1.5rem;
          }

          .maintenance-card h1 {
            font-size: 2.3rem;
          }

          .maintenance-card p {
            font-size: 1rem;
          }

          .maintenance-info {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}