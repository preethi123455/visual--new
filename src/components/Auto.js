import React, { useState } from "react";
import Tesseract from "tesseract.js";

export default function AIMathAnswerChecker() {
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [extractedNumber, setExtractedNumber] = useState(null);
  const [result, setResult] = useState("");

  /* 🔹 Generate AI Question based on topic */
  const generateQuestion = () => {
    const a = Math.floor(Math.random() * 50) + 1;
    const b = Math.floor(Math.random() * 50) + 1;

    let q = "";
    let ans = 0;

    switch (topic.toLowerCase()) {
      case "addition":
        q = `Find the sum of ${a} and ${b}`;
        ans = a + b;
        break;

      case "subtraction":
        q = `Find the difference between ${a} and ${b}`;
        ans = a - b;
        break;

      case "multiplication":
        q = `Find the product of ${a} and ${b}`;
        ans = a * b;
        break;

      case "division":
        q = `Divide ${a * b} by ${a}`;
        ans = b;
        break;

      case "square":
        q = `Find the square of ${a}`;
        ans = a * a;
        break;

      case "cube":
        q = `Find the cube of ${a}`;
        ans = a * a * a;
        break;

      case "percentage":
        q = `Find 10% of ${a * 10}`;
        ans = (a * 10 * 10) / 100;
        break;

      default:
        q = `Add ${a} and ${b}`;
        ans = a + b;
    }

    setQuestion(q);
    setCorrectAnswer(ans);
    setExtractedNumber(null);
    setResult("");
  };

  /* 🔹 Upload Answer Image & OCR */
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setResult("🔍 Checking your answer...");

    try {
      const { data } = await Tesseract.recognize(file, "eng");
      const text = data.text;

      // ⭐ Extract ONLY numbers
      const numbers = text.match(/\d+/g);
      if (!numbers) {
        setResult("❌ No number detected in image");
        return;
      }

      const userAnswer = parseInt(numbers[numbers.length - 1], 10);
      setExtractedNumber(userAnswer);

      // ⭐ Compare ONLY NUMBER
      if (userAnswer === correctAnswer) {
        setResult("🎉 Yeahhh! Your answer is correct! Great job 👏");
      } else {
        setResult(
          `😕 Ohh no! I found something wrong in your answer.
Correct Answer: ${correctAnswer}`
        );
      }
    } catch (err) {
      console.error(err);
      setResult("❌ Error reading the image. Try again.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>🧮 AI Math Answer Checker</h2>

      <input
        style={styles.input}
        placeholder="Enter math topic (addition, square, etc...)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <button style={styles.button} onClick={generateQuestion}>
        Generate Question
      </button>

      {question && (
        <div style={styles.card}>
          <h3>📘 Question</h3>
          <p>{question}</p>

          <label style={styles.upload}>
            📷 Upload Your Answer
            <input type="file" hidden onChange={handleUpload} />
          </label>
        </div>
      )}

      {extractedNumber !== null && (
        <div style={styles.card}>
          <strong>🔢 Extracted Number:</strong> {extractedNumber}
        </div>
      )}

      {result && (
        <div style={styles.result}>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}

/* 🎨 Simple UI Styling */
const styles = {
  container: {
    maxWidth: "700px",
    margin: "40px auto",
    padding: "30px",
    borderRadius: "16px",
    background: "#f5f3ff",
    fontFamily: "sans-serif",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#7c3aed",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  card: {
    marginTop: "20px",
    padding: "20px",
    background: "#fff",
    borderRadius: "12px",
  },
  upload: {
    display: "inline-block",
    marginTop: "10px",
    padding: "10px 15px",
    background: "#ede9fe",
    borderRadius: "8px",
    cursor: "pointer",
  },
  result: {
    marginTop: "20px",
    padding: "20px",
    background: "#ecfeff",
    borderRadius: "12px",
    whiteSpace: "pre-wrap",
  },
};
