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

    try {
      const res = await axios.post("https://visual-math-oscg.onrender.com/signup", {
        name,
        age,
        email,
        image: imageSrc,
      },
     {
    headers: {
      "Content-Type": "application/json",
    },
  });

      setMessage(res.data.message);

      if (res.data.message.includes("Signup successful")) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      setMessage("❌ Signup failed. Try again.");
    }
  };

return (
  <div className="signup-container">
    <div className="signup-card">
      <h2>📝 Face Signup</h2>

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
        type="text"
        placeholder="Enter Name"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="number"
        placeholder="Enter Age"
        onChange={(e) => setAge(e.target.value)}
      />

      <input
        type="email"
        placeholder="Enter Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <button className="signup-btn" onClick={captureAndSignup}>
        📸 Capture & Signup
      </button>

      {message && <p className="message">{message}</p>}

      <button
        className="login-link"
        onClick={() => (window.location.href = "/login")}
      >
        Already have an account? Login
      </button>
    </div>
  </div>
);

};

export default Signup;
