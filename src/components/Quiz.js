import React, { useState } from "react";

const QuizGenerator = () => {
  const BACKEND_URL = "https://visual-math-oscg.onrender.com/generate-quiz";

  const [level, setLevel] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);

  /* ---------------- LEVEL SELECT ---------------- */
  const handleLevelSelect = (selectedLevel) => {
    setLevel(selectedLevel);
    setUserInput("");
    setQuiz([]);
    setFeedback(null);
    setAnswers({});
    setError(null);
  };

  /* ---------------- GENERATE QUIZ ---------------- */
  const handleContentSubmit = async () => {
    if (!userInput.trim()) {
      setError("Please enter a topic before generating a quiz.");
      return;
    }

    setLoading(true);
    setError(null);
    setQuiz([]);
    setFeedback(null);

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `
Generate EXACTLY 3 ${level.toLowerCase()}-level multiple choice math questions.

RULES:
- Respond ONLY with valid JSON array
- No explanation text outside JSON
- Each object must contain:
  - question (string)
  - options (array of 4 strings)
  - correctAnswer (string)
`,
            },
            {
              role: "user",
              content: userInput.trim(),
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content) throw new Error("Empty AI response");

      // 🛡 Safe JSON extraction
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Invalid quiz format");

      const parsedQuiz = JSON.parse(jsonMatch[0]);

      setQuiz(parsedQuiz);
      setAnswers({});
    } catch (err) {
      console.error(err);
      setError("Failed to generate quiz. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- ANSWERS ---------------- */
  const handleAnswerChange = (index, option) => {
    setAnswers((prev) => ({ ...prev, [index]: option }));
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmitAnswers = () => {
    if (Object.keys(answers).length !== quiz.length) {
      alert("Please answer all questions.");
      return;
    }

    let correct = 0;
    let suggestions = [];

    quiz.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
      else suggestions.push(userInput);
    });

    setFeedback({
      score: `${correct} / ${quiz.length}`,
      message:
        correct === quiz.length
          ? "🎉 Excellent! Perfect score!"
          : "🙂 Good try! Review the suggestions below.",
      recommendations: [...new Set(suggestions)].map(
        (t) => `Revise concepts related to ${t}.`
      ),
    });
  };

  /* ---------------- UI ---------------- */
  return (
    <div style={styles.container}>
      <h2 style={styles.header}>🧠 AI Quiz Generator</h2>

      {!level ? (
        <div style={styles.levelSelector}>
          <p style={styles.label}>Choose difficulty level:</p>
          {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
            <button
              key={lvl}
              style={styles.levelButton}
              onClick={() => handleLevelSelect(lvl)}
            >
              {lvl}
            </button>
          ))}
        </div>
      ) : (
        <div style={styles.quizBox}>
          <p style={styles.label}>Enter math topic ({level}):</p>

          <input
            style={styles.input}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Algebra, Geometry, Calculus..."
          />

          <button
            onClick={handleContentSubmit}
            style={styles.generateButton}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Quiz"}
          </button>

          {error && <p style={styles.error}>{error}</p>}

          {quiz.length > 0 && (
            <div style={styles.quizContainer}>
              <h3>Quiz Questions</h3>

              {quiz.map((q, i) => {
                const submitted = feedback !== null;

                return (
                  <div key={i} style={styles.questionBlock}>
                    <p><strong>{q.question}</strong></p>

                    {q.options.map((opt, j) => {
                      const selected = answers[i] === opt;
                      let style = {};

                      if (submitted) {
                        if (opt === q.correctAnswer) {
                          style = { color: "green", fontWeight: "bold" };
                        } else if (selected) {
                          style = {
                            color: "red",
                            textDecoration: "line-through",
                          };
                        }
                      }

                      return (
                        <label key={j} style={{ display: "block", ...style }}>
                          <input
                            type="radio"
                            name={`q-${i}`}
                            checked={selected}
                            disabled={submitted}
                            onChange={() => handleAnswerChange(i, opt)}
                          />{" "}
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                );
              })}

              {!feedback && (
                <button
                  onClick={handleSubmitAnswers}
                  style={styles.submitButton}
                >
                  Submit Answers
                </button>
              )}
            </div>
          )}

          {feedback && (
            <div style={styles.feedbackBox}>
              <h3>📊 Result</h3>
              <p>Score: {feedback.score}</p>
              <p>{feedback.message}</p>

              {feedback.recommendations.length > 0 && (
                <>
                  <h4>Suggestions</h4>
                  <ul>
                    {feedback.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </>
              )}

              <button
                style={styles.resetButton}
                onClick={() => setLevel(null)}
              >
                Take Another Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ---------------- STYLES ---------------- */
const styles = {
  container: {
    padding: "30px",
    maxWidth: "700px",
    margin: "auto",
    background: "#C3B1E1",
    borderRadius: "12px",
    fontFamily: "Arial",
  },
  header: { textAlign: "center", marginBottom: 20 },
  levelSelector: { textAlign: "center" },
  label: { fontWeight: "bold", marginBottom: 10 },
  levelButton: {
    margin: 10,
    padding: "10px 20px",
    background: "#007acc",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  quizBox: { marginTop: 20 },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    marginBottom: 10,
  },
  generateButton: {
    padding: "10px 15px",
    background: "#007acc",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  error: { color: "red", marginTop: 10 },
  quizContainer: {
    marginTop: 20,
    padding: 15,
    background: "#e6f4ff",
    borderRadius: 10,
  },
  questionBlock: { marginBottom: 15 },
  submitButton: {
    background: "#28a745",
    color: "#fff",
    padding: "10px 15px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  feedbackBox: {
    marginTop: 20,
    padding: 15,
    background: "#fff",
    borderRadius: 10,
  },
  resetButton: {
    marginTop: 10,
    padding: "10px 15px",
    background: "#007acc",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};

export default QuizGenerator;
