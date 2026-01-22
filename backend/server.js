require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const path = require("path");
const cartRoutes = require("./routes/cartRoutes");

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const app = express();

/* =======================
   🔹 BODY PARSER
======================= */
app.use(express.json({ limit: "10mb" }));

/* =======================
   🔹 CORS (PRODUCTION READY)
======================= */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5002",
  "https://educonnect-platform-frontend.onrender.com",
  "https://visual-new-frontend.onrender.com",
  "https://visual-math-frontend.onrender.com",
  "https://visual-math-oscg.onrender.com",
  "https://preethi123455.github.io",
];

// Simple CORS for production - allow all origins
app.use(
  cors({
    origin: true, // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

// ✅ REQUIRED for preflight requests
app.options("*", cors());

// ✅ Additional CORS headers for safety
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

/* =======================
   🔹 MONGODB CONNECTION
======================= */
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://preethi:Preethi1234@cluster0.umdwxhv.mongodb.net/faceAuthDB";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((error) => console.error("❌ MongoDB Connection Error:", error));

/* =======================
   🔹 USER SCHEMA
======================= */
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  faceDescriptors: { type: [[Number]], required: true },
});

const User = mongoose.model("User", userSchema);

/* =======================
   🔹 LOAD FACE API MODELS
======================= */
async function loadModels() {
  try {
    const modelsPath = path.join(__dirname, "models");
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
    console.log("✅ Face API models loaded");
  } catch (err) {
    console.error("❌ Face API Model Error:", err.message);
  }
}
loadModels();

/* =======================
   🔹 FACE DESCRIPTOR
======================= */
async function getFaceDescriptor(imageBase64) {
  try {
    const img = await canvas.loadImage(imageBase64);
    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) throw new Error("No face detected");

    return Array.from(detection.descriptor);
  } catch (error) {
    console.error("❌ Face Detection Error:", error.message);
    throw new Error("Face detection failed");
  }
}

/* =======================
   🔹 SIGNUP ROUTE
======================= */
app.post("/signup", async (req, res) => {
  try {
    const { name, age, email, image } = req.body;

    if (!name || !age || !email || !image) {
      return res.status(400).json({ message: "❌ All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "❌ User already exists" });
    }

    const faceDescriptor = await getFaceDescriptor(image);

    const newUser = new User({
      name,
      age,
      email,
      faceDescriptors: [faceDescriptor],
    });

    await newUser.save();
    res.status(201).json({ message: "✅ Signup successful" });
  } catch (error) {
    console.error("❌ Signup Error:", error.message);
    res.status(500).json({ message: "❌ Signup failed" });
  }
});

/* =======================
   🔹 LOGIN ROUTE
======================= */
app.post("/login", async (req, res) => {
  try {
    const { email, image } = req.body;

    if (!email || !image) {
      return res.status(400).json({ message: "❌ Email and image required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "❌ User not found" });
    }

    const loginDescriptor = await getFaceDescriptor(image);

    const labeledDescriptor = new faceapi.LabeledFaceDescriptors(
      user.email,
      user.faceDescriptors.map((desc) => new Float32Array(desc)),
    );

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptor, 0.4);
    const bestMatch = faceMatcher.findBestMatch(
      new Float32Array(loginDescriptor),
    );

    if (bestMatch.label === user.email) {
      res.status(200).json({ success: true, message: "✅ Login successful" });
    } else {
      res.status(400).json({ success: false, message: "❌ Face mismatch" });
    }
  } catch (error) {
    console.error("❌ Login Error:", error.message);
    res.status(500).json({ message: "❌ Login failed" });
  }
});

/* =======================
   🔹 CART ROUTES
======================= */
app.use("/api/cart", cartRoutes);

/* =======================
   🔹 START SERVER
======================= */
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
