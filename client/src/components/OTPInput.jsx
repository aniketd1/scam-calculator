import React from "react";

export default function OTPInput({
  otp,
  setOtp,
}) {
  return (
    <div>
      <input
        type="text"
        maxLength="6"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) =>
          setOtp(e.target.value)
        }
        style={{
          width: "100%",
          padding: "12px",
          marginTop: "15px",
          borderRadius: "10px",
          border: "1px solid #ccc",
        }}
      />
    </div>
  );
}