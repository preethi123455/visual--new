import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const MathTopicReader = () => {
  const [topic, setTopic] = useState("");
  const [bookContent, setBookContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voice, setVoice] = useState(null);

  const utterancesRef = useRef([]);

  const BACKEND_URL = "https://visual-math-oscg.onrender.com/generate-quiz";

  /* ---------------- LOAD GOOGLE VOICE ---------------- */
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const googleVoice =
        voices.find((v) => v.name.includes("Google")) || voices[0];

      setVoice(googleVoice);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => window.speechSynthesis.cancel();
  }, []);

  /* ---------------- STOP ON TAB SWITCH ---------------- */
  useEffect(() => {
    const stopOnHide = () => {
      if (document.hidden) stopReading();
    };

    document.addEventListener("visibilitychange", stopOnHide);
    return () =>
      document.removeEventListener("visibilitychange", stopOnHide);
  }, []);

  /* ---------------- FETCH BOOK CONTENT ---------------- */
  const fetchBookContent = async () => {
    if (!topic.trim()) {
      alert("Please enter a math topic.");
      return;
    }

    stopReading();
    setLoading(true);
    setBookContent("");

    try {
      const response = await axios.post(BACKEND_URL, {
        messages: [
          {
            role: "system",
            content:
              "You are a mathematics textbook writer. Explain the topic in detail with definitions, headings, examples, and step-by-step explanations suitable for students.",
          },
          {
            role: "user",
            content: `Explain the mathematics topic: ${topic}`,
          },
        ],
      });

      const result =
        response.data?.choices?.[0]?.message?.content ||
        "No explanation generated.";

      setBookContent(result);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch explanation");
    }

    setLoading(false);
  };

  /* ---------------- READ ALOUD (CHUNK METHOD) ---------------- */
  const handleReadAloud = () => {
    if (!bookContent || !voice) return;

    stopReading();

    const chunks = bookContent.match(/(.|[\r\n]){1,400}/g);
    if (!chunks) return;

    utterancesRef.current = chunks.map((chunk, index) => {
      const u = new SpeechSynthesisUtterance(chunk);
      u.voice = voice;
      u.rate = 0.95;
      u.pitch = 1;

      if (index === 0) u.onstart = () => setIsSpeaking(true);
      if (index === chunks.length - 1)
        u.onend = () => setIsSpeaking(false);

      return u;
    });

    utterancesRef.current.forEach((u) =>
      window.speechSynthesis.speak(u)
    );
  };

  /* ---------------- STOP READING ---------------- */
  const stopReading = () => {
    window.speechSynthesis.cancel();
    utterancesRef.current = [];
    setIsSpeaking(false);
  };

  /* ---------------- UI ---------------- */
  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Segoe UI, sans-serif",
        maxWidth: "850px",
        margin: "auto",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        📚 Math Topic Reader
      </h1>

      <input
        type="text"
        placeholder="Enter a math topic (e.g., Matrices)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        style={{
          padding: "10px",
          width: "100%",
          marginBottom: "1rem",
          borderRadius: "6px",
          border: "1px solid #ccc",
          fontSize: "16px",
        }}
      />

      <button
        onClick={fetchBookContent}
        disabled={loading}
        style={{
          padding: "10px 20px",
          background: "#4b0082",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate Explanation"}
      </button>

      {bookContent && (
        <div style={{ marginTop: "2rem" }}>
          <h2>📖 Explanation</h2>

          <pre
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.7,
              background: "#f8f9fa",
              padding: "1.2rem",
              borderRadius: "6px",
              border: "1px solid #ddd",
              fontSize: "16px",
            }}
          >
            {bookContent}
          </pre>

          <div style={{ marginTop: "1rem" }}>
            {!isSpeaking ? (
              <button
                onClick={handleReadAloud}
                style={{
                  background: "#007bff",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                🔊 Read Aloud
              </button>
            ) : (
              <button
                onClick={stopReading}
                style={{
                  background: "#dc3545",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                ⛔ Stop Reading
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MathTopicReader;
