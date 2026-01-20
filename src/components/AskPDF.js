import React, { useState } from "react";
import axios from "axios";

const AskPDF = ({ fileName }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question || !fileName) {
      alert("Please upload a PDF and enter a question");
      return;
    }

    setLoading(true);
    setAnswer("");

    try {
      const response = await axios.post(
        "http://localhost:11000/api/ask",
        {
          question,
          filename: fileName,
        }
      );

      setAnswer(response.data.answer);
    } catch (err) {
      console.error("Ask PDF Error:", err);
      setAnswer("❌ Error getting answer from server.");
    }

    setLoading(false);
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>❓ Ask PDF</h2>

      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question like: explain / summary / what is this pdf about"
        style={styles.input}
      />

      <button
        onClick={handleAsk}
        style={{
          ...styles.button,
          opacity: loading ? 0.7 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
        disabled={loading}
      >
        {loading ? "🤖 Thinking..." : "Ask"}
      </button>

      {answer && (
        <div style={styles.answerBox}>
          <h3 style={styles.answerTitle}>Answer</h3>
          <pre style={styles.answerText}>{answer}</pre>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    background: "#ffffff",
    padding: "32px",
    borderRadius: "18px",
    boxShadow: "0 25px 45px rgba(0,0,0,0.18)",
    width: "480px",
    maxWidth: "95%",
    margin: "30px auto",
    textAlign: "center",
  },

  title: {
    marginBottom: "22px",
    color: "#4c1d95",
    fontSize: "26px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "1.5px solid #d1d5db",
    marginBottom: "16px",
    fontSize: "15px",
  },

  button: {
    padding: "14px 28px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(to right, #10b981, #059669)",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
  },

  answerBox: {
    marginTop: "24px",
    padding: "20px",
    background: "#f3f4f6",
    borderRadius: "14px",
    textAlign: "left",
  },

  answerTitle: {
    marginBottom: "10px",
    fontSize: "18px",
    color: "#111827",
  },

  answerText: {
    whiteSpace: "pre-wrap",   // 🔥 PRESERVES AI FORMATTING
    fontSize: "15px",
    lineHeight: "1.7",
    color: "#111827",
  },
};

export default AskPDF;
