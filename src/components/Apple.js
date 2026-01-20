import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Howl } from "howler";

/* ---------------- BACKGROUND MUSIC ---------------- */
const backgroundMusic = new Howl({
  src: ["/sounds/bg.mp3"],
  loop: true,
  volume: 0.3,
});

const WordProblemCartoon = () => {
  const [question, setQuestion] = useState("");
  const [scene, setScene] = useState(null);
  const [dialogues, setDialogues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState([]);

  const ttsTimeouts = useRef([]);

  /* ---------------- LOAD VOICES ---------------- */
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length) setVoices(v);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => stopAllAudio();
  }, []);

  /* ---------------- STOP ALL AUDIO ---------------- */
  const stopAllAudio = () => {
    window.speechSynthesis.cancel();
    backgroundMusic.stop();
    ttsTimeouts.current.forEach(clearTimeout);
    ttsTimeouts.current = [];
  };

  /* ---------------- TEXT TO SPEECH ---------------- */
  const speak = (text, preferredVoice) => {
    if (!window.speechSynthesis || !voices.length) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const voice =
      voices.find((v) => v.name.includes(preferredVoice)) ||
      voices.find((v) => v.name.includes("Google")) ||
      voices[0];

    utterance.voice = voice;
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (!question.trim()) return;

    stopAllAudio();
    setLoading(true);
    setScene(null);
    setDialogues([]);

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
                content:
                  "Extract characters, objects, actions, quantities, and results in a fun storytelling JSON like: { \"initialState\": {\"Tom\": 5}, \"action\": {\"give\": {\"from\": \"Tom\", \"to\": \"Jerry\", \"object\": \"apple\", \"quantity\": 2}}, \"finalState\": {\"Tom\": 3, \"Jerry\": 2} }",
              },
              { role: "user", content: question },
            ],
          }),
        }
      );

      if (!response.ok) throw new Error("Backend failed");

      const data = await response.json();
      const message = data?.choices?.[0]?.message?.content || "";
      const jsonMatch = message.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid AI response");

      const parsed = JSON.parse(jsonMatch[0]);
      setScene(parsed);

      backgroundMusic.play();

      const action = parsed?.action?.give;
      if (!action) return;

      const generatedDialogues = [
        `${action.from}: Hey ${action.to}, I have some ${action.object}s. Would you like some?`,
        `${action.to}: Oh, that's very kind of you! Yes, please.`,
        `${action.from}: Here you go, ${action.quantity} ${action.object}(s) just for you.`,
        `${action.to}: Thank you so much! I really appreciate it.`,
        `${action.from}: You're welcome! Enjoy!`,
      ];

      setDialogues(generatedDialogues);

      generatedDialogues.forEach((line, index) => {
        const isFrom = line.startsWith(`${action.from}:`);
        const voice = isFrom
          ? "Google UK English Male"
          : "Google UK English Female";

        const timeout = setTimeout(
          () => speak(line, voice),
          1500 * (index + 1)
        );
        ttsTimeouts.current.push(timeout);
      });

      const finalTimeout = setTimeout(() => {
        speak(
          `${action.from} gives ${action.quantity} ${action.object}(s) to ${action.to}.`,
          "Google US English"
        );
      }, 9000);

      ttsTimeouts.current.push(finalTimeout);
    } catch (err) {
      console.error(err);
      setScene(null);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- RENDER SCENE ---------------- */
  const renderScene = () => {
    if (!scene) return null;
    const action = scene.action?.give;

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        style={styles.scene}
      >
        <h2 style={styles.sceneTitle}>🎬 Cartoon Comic Scene</h2>

        <div style={styles.charRow}>
          {Object.entries(scene.initialState).map(([name, qty]) => (
            <motion.div
              key={name}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              style={styles.charBox}
            >
              <div style={{ fontSize: 40 }}>🧍</div>
              <strong>{name}</strong>
              <div>🎒 {qty} item(s)</div>
            </motion.div>
          ))}
        </div>

        <div style={styles.storyBox}>
          ✨ {action.from} gives {action.quantity} {action.object}(s) to{" "}
          {action.to}! 🎁
        </div>

        <div style={styles.dialogueBox}>
          <h4>🗣 Dialogues:</h4>
          {dialogues.map((d, i) => (
            <p key={i}>{d}</p>
          ))}
        </div>

        <div style={styles.resultBox}>
          <h4>📊 Final State:</h4>
          {Object.entries(scene.finalState).map(([name, qty]) => (
            <p key={name}>
              {name} now has <strong>{qty}</strong> {action.object}(s)
            </p>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🍿 Cartoon Math Story</h1>

      <textarea
        style={styles.input}
        rows={4}
        placeholder="Enter a fun math story..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <button onClick={handleSubmit} disabled={loading} style={styles.button}>
        {loading ? "Loading..." : "Play Scene"}
      </button>

      {renderScene()}
    </div>
  );
};

/* ---------------- STYLES ---------------- */
const styles = {
  container: {
    fontFamily: "Comic Sans MS, cursive",
    background: "linear-gradient(to right, #C3B1E1, #ffe8d1)",
    minHeight: "100vh",
    padding: "20px",
  },
  title: {
    textAlign: "center",
    fontSize: "2.5rem",
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
    display: "block",
    padding: "12px",
    fontSize: "1.1rem",
    borderRadius: "10px",
    resize: "none",
  },
  button: {
    display: "block",
    margin: "20px auto",
    padding: "10px 30px",
    fontSize: "1.2rem",
    backgroundColor: "#ffb347",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
  },
  scene: {
    maxWidth: "800px",
    margin: "40px auto",
    backgroundColor: "#fffdf0",
    borderRadius: "20px",
    padding: "20px",
    textAlign: "center",
  },
  sceneTitle: { fontSize: "1.8rem", marginBottom: "15px" },
  charRow: {
    display: "flex",
    justifyContent: "center",
    gap: "40px",
    flexWrap: "wrap",
  },
  charBox: {
    backgroundColor: "#ffe9b0",
    padding: "15px",
    borderRadius: "15px",
    width: "140px",
  },
  storyBox: {
    backgroundColor: "#d9f8c4",
    padding: "15px",
    borderRadius: "12px",
    margin: "20px 0",
  },
  dialogueBox: {
    backgroundColor: "#e6e6fa",
    padding: "15px",
    borderRadius: "12px",
    textAlign: "left",
  },
  resultBox: {
    backgroundColor: "#ffebc8",
    padding: "15px",
    borderRadius: "12px",
  },
};

export default WordProblemCartoon;
