import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import "./Login.css";


const Login = () => {
  const webcamRef = useRef(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);

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
  
    try {
      const res = await axios.post("https://visual-math-oscg.onrender.com/login", {
        email,
        image: imageSrc,
      },
      {
    headers: {
      "Content-Type": "application/json",
    },
  }
    );
  
      if (res.data.success) {
        localStorage.setItem("userEmail", email); // Store email in localStorage
        setMessage("✅ Login successful!");
        window.location.href = "/sidebar"; // Redirect to home page
      } else {
        setMessage("❌ Login failed. Face does not match.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setMessage("❌ Login failed. Try again.");
    }
  };
  
  return (
  <div className="login-container">
    <div className="login-card">
      <h2>🔐 Face Login</h2>

      <div className="webcam-box">
        <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
      </div>

      {capturedImage && (
        <img
          src={capturedImage}
          alt="Captured face"
          width={100}
          className="captured-img"
        />
      )}

      <input
        type="email"
        placeholder="Enter Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <button className="login-btn" onClick={captureAndLogin}>
        📸 Capture & Login
      </button>

      {message && <p className="message">{message}</p>}

      <button
        className="signup-link"
        onClick={() => (window.location.href = "/signup")}
      >
        Don’t have an account? Sign up
      </button>
    </div>
  </div>
);

};

export default Login;
