import React from "react";

export default function SecurityScore({
  score,
}) {
  let color = "red";

  if (score >= 80) color = "green";
  else if (score >= 50)
    color = "orange";

  return (
    <div
      style={{
        marginTop: "20px",
      }}
    >
      <h3>Security Score</h3>

      <div
        style={{
          height: "15px",
          background: "#ddd",
          borderRadius: "20px",
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: "100%",
            background: color,
            borderRadius: "20px",
          }}
        />
      </div>

      <p>{score}% Secure</p>
    </div>
  );
}