import React, { useState, useEffect } from "react";

const DualLanguageMathExplainer = () => {
  const [problem, setProblem] = useState("");
  const [language, setLanguage] = useState("english");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [voices, setVoices] = useState([]);

  const BACKEND_URL = "https://visual-math-oscg.onrender.com/generate-quiz";

  /* ---------------- LOAD VOICES ---------------- */
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length) setVoices(v);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => window.speechSynthesis.cancel();
  }, []);

  /* ---------------- STOP SPEECH ON TAB CHANGE ---------------- */
  useEffect(() => {
    const stopOnHide = () => {
      if (document.hidden) window.speechSynthesis.cancel();
    };

    document.addEventListener("visibilitychange", stopOnHide);
    return () =>
      document.removeEventListener("visibilitychange", stopOnHide);
  }, []);

  /* ---------------- STOP SPEECH ON LANGUAGE CHANGE ---------------- */
  useEffect(() => {
    window.speechSynthesis.cancel();
  }, [language]);

  /* ---------------- TEXT TO SPEECH ---------------- */
  const speakExplanation = (text, lang) => {
    if (!voices.length) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const langCode = {
      english: "en",
      tamil: "ta",
      hindi: "hi",
      telugu: "te",
      kannada: "kn",
      malayalam: "ml",
      both: "ta",
    };

    const preferredLang = langCode[lang] || "en";

    const voice =
      voices.find(
        (v) =>
          v.lang.startsWith(preferredLang) &&
          v.name.toLowerCase().includes("google")
      ) ||
      voices.find((v) => v.lang.startsWith(preferredLang)) ||
      voices.find((v) => v.lang.startsWith("en"));

    if (voice) utterance.voice = voice;

    utterance.rate = 0.95;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  };

  /* ---------------- FETCH EXPLANATION ---------------- */
  const getExplanation = async () => {
    if (!problem.trim()) {
      setError("Please enter a math problem");
      return;
    }

    window.speechSynthesis.cancel();
    setLoading(true);
    setError(null);
    setExplanation("");

    const langPrompt = {
      english: "Explain in English",
      tamil: "Explain in Tamil",
      hindi: "Explain in Hindi",
      telugu: "Explain in Telugu",
      kannada: "Explain in Kannada",
      malayalam: "Explain in Malayalam",
      both: "Explain in English and Tamil",
    };

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `${langPrompt[language]}. Give clear step-by-step explanation for students.`,
            },
            { role: "user", content: problem },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error("Backend error");
      }

      const data = await res.json();
      const result =
        data?.choices?.[0]?.message?.content ||
        "No explanation generated.";

      setExplanation(result);
      speakExplanation(result, language);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  /* ---------------- UI ---------------- */
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        backgroundImage: `url("data:image/svg+xml;utf8,
          <svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
            <text x='20' y='40' fill='rgba(0,0,0,0.06)' font-size='22'>x² + y²</text>
            <text x='200' y='90' fill='rgba(0,0,0,0.05)' font-size='20'>a² + b² = c²</text>
            <text x='60' y='180' fill='rgba(0,0,0,0.05)' font-size='24'>∫ f(x) dx</text>
            <text x='230' y='230' fill='rgba(0,0,0,0.05)' font-size='22'>Σ xᵢ</text>
            <text x='90' y='300' fill='rgba(0,0,0,0.05)' font-size='20'>E = mc²</text>
          </svg>
        ")`,
        backgroundRepeat: "repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          background: "rgba(255,255,255,0.95)",
          borderRadius: 18,
          padding: 25,
          boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
          fontFamily: "Segoe UI, sans-serif",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: 20,
            fontWeight: 700,
            color: "#4b0082",
          }}
        >
          🎓 Multi-Language Math Explainer
        </h2>

        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Enter a math problem (e.g., 2x + 3 = 7)"
          style={{
            width: "100%",
            height: 100,
            borderRadius: 12,
            padding: 12,
            border: "1px solid #ccc",
            fontSize: 16,
            marginBottom: 15,
          }}
        />

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "1px solid #ccc",
            fontSize: 16,
            marginBottom: 15,
          }}
        >
          <option value="english">English</option>
          <option value="tamil">Tamil</option>
          <option value="hindi">Hindi</option>
          <option value="telugu">Telugu</option>
          <option value="kannada">Kannada</option>
          <option value="malayalam">Malayalam</option>
          <option value="both">English + Tamil</option>
        </select>

        <button
          onClick={getExplanation}
          disabled={loading}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 14,
            border: "none",
            fontSize: 16,
            fontWeight: 600,
            background: "#4b0082",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {loading ? "Generating..." : "Explain"}
        </button>

        {error && (
          <p style={{ color: "red", marginTop: 10 }}>{error}</p>
        )}

        {explanation && (
          <div
            style={{
              marginTop: 20,
              background: "#f5f5f5",
              padding: 18,
              borderRadius: 14,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {explanation}
          </div>
        )}
      </div>
    </div>
  );
};

export default DualLanguageMathExplainer;
