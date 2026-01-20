import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const VisualizationApp = () => {
  const [input, setInput] = useState("");
  const [solution, setSolution] = useState("");
  const [visualization, setVisualization] = useState(null);

  const calculatePercentage = (percent, value) => (percent / 100) * value;

  const handleProblemSubmit = () => {
    const inputLower = input.toLowerCase();

    /* ---------------- PERCENTAGE ---------------- */
    if (input.includes("%") && inputLower.includes("of")) {
      const [percentStr, valueStr] = inputLower.split("of");
      const percent = parseFloat(percentStr.replace("%", "").trim());
      const value = parseFloat(valueStr.trim());

      if (isNaN(percent) || isNaN(value)) return;

      const result = calculatePercentage(percent, value);
      setSolution(`Solution: ${percent}% of ${value} is ${result}`);

      const data = [
        { name: "Part", value: result, color: "#00C49F" },
        { name: "Remaining", value: value - result, color: "#FFBB28" },
      ];

      setVisualization(
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} dataKey="value" outerRadius={70} label>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
    }

    /* ---------------- ALGEBRA ---------------- */
    else if (input.includes("=")) {
      const [lhs, rhs] = input.split("=");
      const rightSide = parseFloat(rhs.trim());

      const match = lhs.match(/([+-]?\d*)x\s*([+-]\s*\d+)?/);

      if (match) {
        const a =
          match[1] === "" || match[1] === "+"
            ? 1
            : match[1] === "-"
            ? -1
            : parseFloat(match[1]);

        const b = match[2] ? parseFloat(match[2].replace(" ", "")) : 0;
        const x = (rightSide - b) / a;

        setSolution(`Solution: x = ${x}`);

        const data = [
          { name: "Left Side", value: a * x + b, color: "#8884d8" },
          { name: "Right Side", value: rightSide, color: "#82ca9d" },
        ];

        setVisualization(
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      } else {
        setSolution("Unable to solve equation");
        setVisualization(null);
      }
    }

    /* ---------------- PROFIT & LOSS ---------------- */
    else if (inputLower.includes("cp=") && inputLower.includes("sp=")) {
      const cp = parseFloat(inputLower.match(/cp=(\d+(\.\d+)?)/)?.[1]);
      const sp = parseFloat(inputLower.match(/sp=(\d+(\.\d+)?)/)?.[1]);

      if (isNaN(cp) || isNaN(sp)) return;

      let resultText = "";
      let data = [];

      if (sp > cp) {
        const profit = sp - cp;
        resultText = `Profit = ${profit}`;
        data = [
          { name: "Cost Price", value: cp, color: "#0088FE" },
          { name: "Profit", value: profit, color: "#00C49F" },
        ];
      } else {
        const loss = cp - sp;
        resultText = `Loss = ${loss}`;
        data = [
          { name: "Selling Price", value: sp, color: "#FF8042" },
          { name: "Loss", value: loss, color: "#FFBB28" },
        ];
      }

      setSolution(`Solution: ${resultText}`);

      setVisualization(
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    /* ---------------- TRIGONOMETRY ---------------- */
    else if (
      inputLower.includes("sin") ||
      inputLower.includes("cos") ||
      inputLower.includes("tan")
    ) {
      const angles = [30, 45, 60];
      const trigData = angles.map((angle) => ({
        name: `${angle}°`,
        sin: Number(Math.sin((angle * Math.PI) / 180).toFixed(2)),
        cos: Number(Math.cos((angle * Math.PI) / 180).toFixed(2)),
        tan: Number(Math.tan((angle * Math.PI) / 180).toFixed(2)),
      }));

      setSolution("Solution: Standard Trigonometric Values");

      setVisualization(
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={trigData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sin" fill="#8884d8" />
            <Bar dataKey="cos" fill="#82ca9d" />
            <Bar dataKey="tan" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    /* ---------------- AVERAGE ---------------- */
    else if (inputLower.includes("average")) {
      const numbers = inputLower.match(/\d+/g)?.map(Number);
      if (!numbers) return;

      const avg =
        numbers.reduce((sum, n) => sum + n, 0) / numbers.length;

      setSolution(`Solution: Average = ${avg}`);

      const data = numbers.map((n, i) => ({
        name: `Val ${i + 1}`,
        value: n,
      }));

      setVisualization(
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    /* ---------------- DEFAULT ---------------- */
    else {
      setSolution("Unable to understand the problem");
      setVisualization(null);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Smart Math Visualizer</h2>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Example: 20% of 200 | 2x+5=15 | CP=100 SP=120"
        style={styles.input}
      />

      <button onClick={handleProblemSubmit} style={styles.button}>
        Solve & Visualize
      </button>

      <div style={styles.solution}>{solution}</div>
      <div style={styles.chart}>{visualization}</div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "auto",
    padding: "20px",
    textAlign: "center",
    fontFamily: "Arial",
  },
  header: { marginBottom: "20px" },
  input: {
    padding: "10px",
    width: "80%",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  button: {
    padding: "10px 20px",
    borderRadius: "8px",
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  solution: {
    marginTop: "20px",
    fontWeight: "bold",
  },
  chart: {
    marginTop: "20px",
    height: "250px",
  },
};

export default VisualizationApp;
