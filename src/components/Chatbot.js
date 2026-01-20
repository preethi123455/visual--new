import React, { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";
import Select from "react-select";

const AIAssistant = () => {
  /* ---------------- STATE ---------------- */
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your Math assistant. Ask me anything related to mathematics!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [language, setLanguage] = useState({
    value: "english",
    label: "English",
  });

  const recognitionRef = useRef(null);

  /* ---------------- LANGUAGE PROMPTS ---------------- */
  const languagePrompts = {
    english: "Respond fully in English.",
    tamil: "Respond fully in Tamil.",
    hindi: "Respond fully in Hindi.",
    kannada: "Respond fully in Kannada.",
    malayalam: "Respond fully in Malayalam.",
  };

  /* ---------------- TEXT TO SPEECH ---------------- */
  const speakText = (text) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      {
        english: "en-US",
        tamil: "ta-IN",
        hindi: "hi-IN",
        kannada: "kn-IN",
        malayalam: "ml-IN",
      }[language.value] || "en-US";

    utterance.rate = 0.95;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  };

  /* ---------------- MATH FILTER ---------------- */
  const isMathRelated = (text) => {
    const keywords = [
      "math",
      "algebra",
      "geometry",
      "calculus",
      "trigonometry",
      "integral",
      "derivative",
      "equation",
      "matrix",
      "probability",
      "statistics",
      "function",
      "number",
      "prime",
      "logarithm",
      "limit",
      "ratio",
      "percentage",
    ];
    return keywords.some((k) => text.toLowerCase().includes(k));
  };

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (!isMathRelated(input)) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠ Please ask only math-related questions.",
        },
      ]);
      setInput("");
      return;
    }

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://visual-math-oscg.onrender.com/generate-quiz",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: `
You are a mathematics tutor.

RULES:
- Answer ONLY math-related topics
- Use headings and numbered points
- Keep explanations short and clear

FORMAT:

TITLE:
<topic>

1. Definition
- short explanation

2. Key Concepts
- point 1
- point 2

3. Example
- step 1
- step 2

4. Conclusion
- short summary

${languagePrompts[language.value]}
`,
              },
              ...messages,
              userMessage,
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Backend error ${response.status}`);
      }

      const data = await response.json();
      const reply =
        data?.choices?.[0]?.message?.content ||
        "Sorry, I couldn't generate a response.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Error connecting to AI service.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SPEECH TO TEXT ---------------- */
  const handleStartRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang =
      {
        english: "en-US",
        tamil: "ta-IN",
        hindi: "hi-IN",
        kannada: "kn-IN",
        malayalam: "ml-IN",
      }[language.value] || "en-US";

    recognition.interimResults = false;

    recognition.onresult = (e) => {
      setInput(e.results[0][0].transcript);
    };

    recognition.onend = () => setRecording(false);
    recognition.onerror = () => setRecording(false);

    recognition.start();
    setRecording(true);
  };

  const handleStopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  /* ---------------- OCR (IMAGE TO TEXT) ---------------- */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const result = await Tesseract.recognize(file, "eng");
      setInput(result.data.text.trim());
    } catch (err) {
      console.error("OCR Error:", err);
    }
    setLoading(false);
  };

  /* ---------------- UI ---------------- */
  return (
    <div style={{ height: "100vh", padding: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 style={{ color: "#6a0dad" }}>AI Math Assistant</h2>

        <Select
          options={[
            { value: "english", label: "English" },
            { value: "tamil", label: "Tamil" },
            { value: "hindi", label: "Hindi" },
            { value: "kannada", label: "Kannada" },
            { value: "malayalam", label: "Malayalam" },
          ]}
          value={language}
          onChange={setLanguage}
          styles={{ container: (b) => ({ ...b, width: 160 }) }}
        />
      </div>

      {/* Chat Area */}
      <div
        style={{
          marginTop: 15,
          background: "#C3B1E1",
          borderRadius: 10,
          height: "85%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                background: msg.role === "user" ? "#e6f0ff" : "#eaeaea",
                padding: 12,
                borderRadius: 8,
                marginBottom: 10,
                maxWidth: "80%",
                alignSelf:
                  msg.role === "user" ? "flex-end" : "flex-start",
                position: "relative",
              }}
            >
              {msg.content.split("\n").map((line, j) => (
                <div key={j}>{line}</div>
              ))}

              {msg.role === "assistant" && (
                <button
                  onClick={() => speakText(msg.content)}
                  style={{
                    position: "absolute",
                    right: 5,
                    bottom: 5,
                    background: "#6a0dad",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  🔊
                </button>
              )}
            </div>
          ))}
          {loading && <div>Thinking...</div>}
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: 10, padding: 15 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a math question..."
            style={{ flex: 1, padding: 12, borderRadius: 8 }}
          />

          <button onClick={handleSend} disabled={loading}>
            Send
          </button>

          <button
            onClick={recording ? handleStopRecording : handleStartRecording}
          >
            {recording ? "⏹" : "🎙"}
          </button>

          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
