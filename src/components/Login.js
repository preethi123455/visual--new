import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const webcamRef = useRef(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const captureAndLogin = async () => {
    if (!email) {
      setMessage("❌ Email is required!");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setMessage("❌ Failed to capture image. Try again!");
      return;
    }

    setCapturedImage(imageSrc);
    setLoading(true);

    try {
      const apiUrl =
        process.env.REACT_APP_API_URL ||
        "https://visual-math-oscg.onrender.com";
      const res = await axios.post(
        `${apiUrl}/login`,
        {
          email,
          image: imageSrc,
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      if (res.data.success) {
        localStorage.setItem("userEmail", email);
        setMessage("✅ Login successful!");
        setTimeout(() => {
          window.location.href = "/hom";
        }, 1500);
      } else {
        setMessage("❌ Login failed. Face does not match.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setMessage("❌ Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>

        <div className="webcam-box">
          <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
        </div>

        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured face"
            className="captured-img"
          />
        )}

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          className="login-btn"
          onClick={captureAndLogin}
          disabled={loading}
        >
          {loading ? "Authenticating..." : "Login with Face"}
        </button>

        <p className="message">{message}</p>

        <button
          className="signup-link"
          onClick={() => (window.location.href = "/signup")}
        >
          Don't have an account? Create one
        </button>
      </div>
    </div>
  );
};

export default Login;
