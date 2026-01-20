import React, { useState } from "react";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import "reactflow/dist/style.css";

const Roadmap = () => {
  const [level, setLevel] = useState("");
  const [topic, setTopic] = useState("");
  const [roadmapData, setRoadmapData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "https://visual-math-oscg.onrender.com/generate-quiz";

  /* ---------------- SAFE JSON PARSER ---------------- */
  const safeJSONParse = (text) => {
    // 1️⃣ Extract JSON object
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found");

    let json = match[0];

    // 2️⃣ Remove comments
    json = json.replace(/\/\/.*$/gm, "");

    // 3️⃣ Remove trailing commas
    json = json.replace(/,\s*([}\]])/g, "$1");

    return JSON.parse(json);
  };

  /* ---------------- FETCH ROADMAP ---------------- */
  const fetchRoadmap = async () => {
    if (!topic.trim() || !level) {
      alert("Please select a level and enter a math topic.");
      return;
    }

    setLoading(true);
    setRoadmapData({ nodes: [], edges: [] });

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `
You are a JSON generator.

RULES:
- Output ONLY valid JSON
- NO comments
- NO trailing commas
- NO extra text

FORMAT:
{
  "nodes": [
    { "id": "1", "position": { "x": 250, "y": 0 }, "data": { "label": "Start" } },
    { "id": "2", "position": { "x": 250, "y": 120 }, "data": { "label": "Step 1" } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" }
  ]
}
`,
            },
            {
              role: "user",
              content: `Create a ${level.toLowerCase()} level roadmap to learn ${topic}`,
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

      // ✅ SAFE PARSE
      const parsed = safeJSONParse(content);

      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
        throw new Error("Invalid roadmap structure");
      }

      // Normalize node labels
      const formattedNodes = parsed.nodes.map((n) => ({
        ...n,
        data: { label: String(n.data?.label || "") },
      }));

      setRoadmapData({
        nodes: formattedNodes,
        edges: parsed.edges,
      });
    } catch (err) {
      console.error(err);
      alert("⚠ Failed to generate roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        🧠 Math Learning <span style={styles.highlight}>Roadmap Generator</span>
      </h1>

      <p style={styles.description}>
        Select your level and enter a math topic to generate a roadmap.
      </p>

      <div style={styles.levelButtons}>
        {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setLevel(lvl)}
            style={level === lvl ? styles.selectedBtn : styles.levelBtn}
          >
            {lvl === "Beginner" ? "🟢" : lvl === "Intermediate" ? "🟡" : "🔴"}{" "}
            {lvl}
          </button>
        ))}
      </div>

      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter a math topic (e.g., Algebra)"
        style={styles.input}
      />

      <button
        onClick={fetchRoadmap}
        style={styles.generateBtn}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Roadmap"}
      </button>

      {roadmapData.nodes.length > 0 && (
        <div style={styles.flowContainer}>
          <ReactFlow
            nodes={roadmapData.nodes}
            edges={roadmapData.edges}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>
      )}
    </div>
  );
};

/* ---------------- STYLES ---------------- */
const styles = {
  container: {
    textAlign: "center",
    padding: "30px",
    background: "linear-gradient(to right,#C3B1E1, #e0f7fa)",
    minHeight: "100vh",
  },
  title: { fontSize: "30px", fontWeight: "bold" },
  highlight: { color: "#007acc" },
  description: { marginBottom: "20px" },
  levelButtons: { marginBottom: "20px" },
  levelBtn: {
    padding: "10px 20px",
    margin: "0 10px",
    borderRadius: "10px",
    border: "2px solid #007acc",
    background: "#fff",
    cursor: "pointer",
  },
  selectedBtn: {
    padding: "10px 20px",
    margin: "0 10px",
    borderRadius: "10px",
    background: "#007acc",
    color: "#fff",
    cursor: "pointer",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    width: "300px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "15px",
    textAlign: "center",
  },
  generateBtn: {
    padding: "10px 20px",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#007acc",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
  flowContainer: {
    height: "500px",
    width: "90%",
    margin: "30px auto",
    border: "2px solid #007acc",
    borderRadius: "10px",
    backgroundColor: "#fff",
  },
};

export default Roadmap;
