import React, { useState } from "react";
import VisualPasswordGrid from "../components/VisualPasswordGrid";
import OTPInput from "../components/OTPInput";
import axios from "axios";
export default function SignIn() {
  const [email, setEmail] =
    useState("");

  const [selected, setSelected] =
    useState([]);

  const [otp, setOtp] =
    useState("");

  const handleLogin = async () => {
  try {

    const response =
      await axios.post(
        "http://localhost:3001/api/auth/login",
        {
          email,
          visualPassword: selected,
        }
      );

    console.log(response.data);

    localStorage.setItem(
      "token",
      response.data.token
    );

    alert("Login Success");

  } catch (error) {

    console.log(error);

    alert(
      error.response?.data?.message ||
      "Login Failed"
    );
  }
};

  return (
    <div className="container">
      <h1>Sign In</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <h3>
        Select Visual Password
      </h3>

      <VisualPasswordGrid
        selected={selected}
        setSelected={setSelected}
      />

      <OTPInput
        otp={otp}
        setOtp={setOtp}
      />

      <button onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}