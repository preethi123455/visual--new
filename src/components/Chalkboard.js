import React, { useEffect, useRef, useState } from "react";

const AIChalkboardTutor = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);

  const stepsRef = useRef(null);


  const BACKEND_URL = "https://visual-math-oscg.onrender.com/generate-quiz";

  
  const speakText = (text) => {
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.9;
    speechSynthesis.speak(utter);
  };

  
  const fetchSolution = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setSteps([]);
    speechSynthesis.cancel();

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are a chalkboard-style math tutor. Explain step-by-step clearly and simply.",
            },
            {
              role: "user",
              content: `Question: ${question}\nStudent Answer: ${answer}`,
            },
          ],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Backend error:", text);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const message = data?.choices?.[0]?.message?.content || "";

      const lines = message
        .split(/\n+/)
        .filter((line) => line.trim())
        .map((s, i) => `${i + 1}. ${s.trim()}`);

      setSteps(lines);

      if (lines.length) speakText(lines[0]);
    } catch (err) {
      console.error("Chalkboard Error:", err);
    }

    setLoading(false);
  };

  
  useEffect(() => {
    if (stepsRef.current && steps.length > 0) {
      stepsRef.current.scrollTop = stepsRef.current.scrollHeight;
    }
  }, [steps]);

  
  return (
    <div style={styles.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&display=swap"
        rel="stylesheet"
      />

      <header style={styles.header}>
        <h1 style={styles.title}>📐 AI Chalkboard Tutor</h1>
      </header>

      <div style={styles.card}>
        {/* Left Side Input */}
        <div style={styles.leftPanel}>
          <h2 style={styles.subHeading}>Enter Problem ✍</h2>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Example: Solve 2x + 5 = 15"
            rows={5}
            style={styles.textarea}
          />

          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your answer"
            style={styles.input}
          />

          <button
            onClick={fetchSolution}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Thinking..." : "Explain & Check ✅"}
          </button>
        </div>

        {/* Right Side Steps */}
        <div style={styles.rightPanel}>
          <div style={styles.stepsHeader}>
            <h2 style={styles.subHeading}>Chalkboard Steps 🧠</h2>
          </div>

          <div ref={stepsRef} style={styles.stepsBox}>
            {steps.length === 0 ? (
              <p style={styles.placeholder}>
                Steps will appear here after you click Explain ✅
              </p>
            ) : (
              steps.map((step, index) => (
                <div key={index} style={styles.stepLine}>
                  {step}
                </div>
              ))
            )}

            {/* ✅ Extra bottom space to avoid last step hide */}
            <div style={{ height: 40 }} />
          </div>
        </div>
      </div>
    </div>
  );
};


const styles = {
  page: {
    height: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #050505, #0d0d0d)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    fontFamily: "'Gloria Hallelujah', cursive",
  },

  header: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "18px 35px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(10px)",
  },

  title: {
    fontSize: 26,
    color: "#00ffcc",
    margin: 0,
  },

  card: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 1.3fr",
    gap: 20,
    padding: 25,
    minHeight: "80vh",
  },

  leftPanel: {
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 25,
    boxShadow: "0px 10px 25px rgba(0,0,0,0.5)",
  },

  rightPanel: {
    backgroundColor: "rgba(0, 255, 204, 0.04)",
    border: "1px solid rgba(0,255,204,0.2)",
    borderRadius: 18,
    padding: 25,
    boxShadow: "0px 10px 25px rgba(0,0,0,0.5)",
    display: "flex",
    flexDirection: "column",
  },

  stepsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  subHeading: {
    margin: "0 0 10px 0",
    color: "#00ffcc",
    fontSize: 20,
  },

  textarea: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    backgroundColor: "#0f0f0f",
    color: "#00ffcc",
    outline: "none",
    fontSize: 16,
    marginBottom: 14,
  },

  input: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    backgroundColor: "#0f0f0f",
    color: "#00ffcc",
    outline: "none",
    fontSize: 16,
    marginBottom: 14,
  },

  button: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    border: "none",
    backgroundColor: "#00ffcc",
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },

  stepsBox: {
    flex: 1,
    overflowY: "auto",
    padding: 15,
    borderRadius: 14,
    backgroundColor: "#000",
    border: "1px solid rgba(255,255,255,0.1)",
    maxHeight: "68vh",
  },

  placeholder: {
    color: "#aaa",
    fontSize: 16,
    marginTop: 30,
  },

  stepLine: {
    fontSize: 18,
    color: "#00ffcc",
    marginBottom: 14,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(0,255,204,0.06)",
    border: "1px solid rgba(0,255,204,0.12)",
  },
};

export default AIChalkboardTutor;