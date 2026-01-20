import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/* ================= GOOGLE VISION API ================= */
const GOOGLE_VISION_API_KEY = "AIzaSyAjUuaMvt73n3kQuTJLgHHJU6JPBqCMBKs";

/* ================= NORMALIZE INPUT ================= */
const normalizeShape = (s) => {
  const map = {
    circle: "sphere",
    square: "cube",
    rectangle: "cuboid",
  };
  return map[s] || s;
};

/* ================= 3D SHAPES ================= */
const shapeMap3D = {
  sphere: new THREE.SphereGeometry(1.5, 64, 64),
  cube: new THREE.BoxGeometry(2, 2, 2),
  cuboid: new THREE.BoxGeometry(3, 2, 1.5),
  cone: new THREE.ConeGeometry(1.5, 3, 64),
  cylinder: new THREE.CylinderGeometry(1.2, 1.2, 3, 64),
  pyramid: new THREE.ConeGeometry(1.8, 2.8, 4),
};

/* ================= SHAPE IMAGES ================= */
const shapeImages = {
  sphere:
    "https://upload.wikimedia.org/wikipedia/commons/2/26/Sphere_wireframe.png",
  cube:
    "https://upload.wikimedia.org/wikipedia/commons/9/9c/Cube_wireframe.png",
  cuboid:
    "https://upload.wikimedia.org/wikipedia/commons/3/33/Cuboid_wireframe.png",
  cone:
    "https://upload.wikimedia.org/wikipedia/commons/1/12/Cone_wireframe.png",
  cylinder:
    "https://upload.wikimedia.org/wikipedia/commons/8/85/Cylinder_wireframe.png",
  pyramid:
    "https://upload.wikimedia.org/wikipedia/commons/0/08/Pyramid_wireframe.png",
};

/* ================= EXPLANATIONS ================= */
const explanations = {
  sphere: `
SPHERE (3D SHAPE)

Definition:
A sphere is a perfectly round 3D object where every point on the surface
is equidistant from the center.

Properties:
• No edges
• No vertices
• One curved surface

Formulas:
• Volume = (4/3)πr³
• Surface Area = 4πr²

Examples:
• Football
• Earth
• Ball
`,

  cube: `
CUBE (3D SHAPE)

Definition:
A cube is a solid object bounded by six equal square faces.

Properties:
• Faces = 6
• Edges = 12
• Vertices = 8

Formulas:
• Volume = a³
• Surface Area = 6a²

Examples:
• Dice
• Ice cube
• Rubik’s cube
`,

  cuboid: `
CUBOID (RECTANGULAR PRISM)

Definition:
A cuboid is a 3D shape with six rectangular faces.

Formulas:
• Volume = l × w × h
• Surface Area = 2(lw + lh + wh)

Examples:
• Book
• Brick
• Room
`,

  cone: `
CONE (3D SHAPE)

Definition:
A cone has a circular base and tapers to a single point.

Formulas:
• Volume = (1/3)πr²h
• Curved Surface Area = πrl

Examples:
• Ice-cream cone
• Traffic cone
`,

  cylinder: `
CYLINDER (3D SHAPE)

Definition:
A cylinder has two parallel circular bases joined by a curved surface.

Formulas:
• Volume = πr²h
• Surface Area = 2πr(h + r)

Examples:
• Gas cylinder
• Pipe
• Can
`,

  pyramid: `
PYRAMID (3D SHAPE)

Definition:
A pyramid has a polygon base and triangular faces meeting at the apex.

Formula:
• Volume = (1/3) × Base Area × Height

Examples:
• Egyptian pyramids
• Temple towers
`,
};

export default function Generator() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);

  const [problem, setProblem] = useState("");
  const [shape, setShape] = useState("");
  const [explanation, setExplanation] = useState("");
  const [visionLabels, setVisionLabels] = useState([]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    const normalized = normalizeShape(problem.trim().toLowerCase());
    setShape(normalized);
    setExplanation(explanations[normalized] || "Explanation not available");
    setVisionLabels([]);

    if (!shapeImages[normalized]) return;

    try {
      const res = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [
              {
                image: { source: { imageUri: shapeImages[normalized] } },
                features: [{ type: "LABEL_DETECTION", maxResults: 6 }],
              },
            ],
          }),
        }
      );

      const data = await res.json();
      setVisionLabels(
        data?.responses?.[0]?.labelAnnotations || []
      );
    } catch (err) {
      console.error("Vision API error:", err);
    }
  };

  /* ================= 3D RENDER ================= */
  useEffect(() => {
    if (!shapeMap3D[shape] || !mountRef.current) return;

    // Cleanup previous renderer
    if (rendererRef.current) {
      rendererRef.current.dispose();
      mountRef.current.innerHTML = "";
      cancelAnimationFrame(animationRef.current);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#87CEEB");

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / 400,
      0.1,
      100
    );
    camera.position.set(5, 5, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, 400);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const mesh = new THREE.Mesh(
      shapeMap3D[shape],
      new THREE.MeshStandardMaterial({ color: 0x3498db })
    );
    scene.add(mesh);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7);
    scene.add(light);

    const controls = new OrbitControls(camera, renderer.domElement);

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      mesh.rotation.y += 0.01;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      renderer.dispose();
    };
  }, [shape]);

  /* ================= UI ================= */
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>📐 Math Shapes Visualizer</h1>

      <input
        style={{ ...styles.input, color: "#000" }}
        placeholder="Type a shape (sphere, cube, cone...)"
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
      />

      <button style={styles.button} onClick={handleSubmit}>
        🔍 Explain & Visualize
      </button>

      {shape && <div ref={mountRef} style={styles.visual} />}

      {explanation && (
        <div style={styles.explanationBox}>
          <h3>🧠 Step-by-Step Explanation</h3>
          <pre style={styles.explanationText}>{explanation}</pre>
        </div>
      )}

      {visionLabels.length > 0 && (
        <div style={styles.explanationBox}>
          <h3>🔍 Google Vision API Analysis</h3>
          {visionLabels.map((l, i) => (
            <p key={i}>
              {l.description} – {(l.score * 100).toFixed(1)}%
            </p>
          ))}
          <img
            src={shapeImages[shape]}
            alt="shape"
            style={{ maxWidth: "300px", marginTop: "10px" }}
          />
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  container: {
    textAlign: "center",
    backgroundColor: "#C3B1E1",
    minHeight: "100vh",
    padding: "20px",
  },
  header: { fontSize: "2.5rem" },
  input: {
    padding: "10px",
    width: "60%",
    borderRadius: "6px",
  },
  button: {
    padding: "10px 20px",
    marginLeft: "10px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  visual: {
    height: "400px",
    marginTop: "20px",
    borderRadius: "10px",
  },
  explanationBox: {
    background: "#fff",
    margin: "30px auto",
    padding: "20px",
    maxWidth: "900px",
    borderRadius: "10px",
  },
  explanationText: {
    whiteSpace: "pre-wrap",
    fontSize: "1.1rem",
  },
};
