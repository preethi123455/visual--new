import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import "./Signup.css";

const Signup = () => {
  const webcamRef = useRef(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const captureAndSignup = async () => {
    if (!name || !age || !email) {
      setMessage("❌ All fields are required!");
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
        `${apiUrl}/signup`,
        {
          name,
          age,
          email,
          image: imageSrc,
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      setMessage(res.data.message);

      if (res.data.message.includes("successful")) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      setMessage("❌ Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create Account</h2>

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
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Enter Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          className="signup-btn"
          onClick={captureAndSignup}
          disabled={loading}
        >
          {loading ? "Processing..." : "Signup with Face"}
        </button>

        <p className="message">{message}</p>

        <button
          className="login-link"
          onClick={() => (window.location.href = "/login")}
        >
          Already have an account? Go to Login
        </button>
      </div>
    </div>
  );
};

export default Signup;
