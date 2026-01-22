require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');
const cartRoutes = require('./routes/cartRoutes');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const app = express();

/* =======================
   🔹 BODY PARSER
======================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* =======================
   🔹 HARD CORS FIX (RENDER SAFE)
======================= */
app.use((req, res, next) => {
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://visual-new-frontend.onrender.com'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

/* =======================
   🔹 HEALTH CHECK
======================= */
app.get('/', (req, res) => {
  res.send('Backend is alive');
});

/* =======================
   🔹 MONGODB
======================= */
const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://preethi:Preethi1234@cluster0.umdwxhv.mongodb.net/faceAuthDB';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err.message));

/* =======================
   🔹 USER SCHEMA
======================= */
const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: { type: String, unique: true },
  faceDescriptors: [[Number]],
});

const User = mongoose.model('User', userSchema);

/* =======================
   🔹 LOAD FACE MODELS
======================= */
async function loadModels() {
  const modelsPath = path.join(__dirname, 'models');
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
  console.log('Face models loaded');
}

loadModels().catch(console.error);

/* =======================
   🔹 FACE DESCRIPTOR
======================= */
async function getFaceDescriptor(imageBase64) {
  const img = await canvas.loadImage(imageBase64);
  const detection = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) throw new Error('No face detected');
  return Array.from(detection.descriptor);
}

/* =======================
   🔹 SIGNUP
======================= */
app.post('/signup', async (req, res) => {
  try {
    const { name, age, email, image } = req.body;

    if (!name || !age || !email || !image) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const faceDescriptor = await getFaceDescriptor(image);

    await User.create({
      name,
      age,
      email,
      faceDescriptors: [faceDescriptor],
    });

    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Signup failed' });
  }
});

/* =======================
   🔹 LOGIN
======================= */
app.post('/login', async (req, res) => {
  try {
    const { email, image } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const loginDescriptor = await getFaceDescriptor(image);

    const labeled = new faceapi.LabeledFaceDescriptors(
      user.email,
      user.faceDescriptors.map((d) => new Float32Array(d))
    );

    const matcher = new faceapi.FaceMatcher(labeled, 0.4);
    const match = matcher.findBestMatch(
      new Float32Array(loginDescriptor)
    );

    if (match.label === user.email) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(400).json({ success: false, message: 'Face mismatch' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Login failed' });
  }
});

/* =======================
   🔹 CART ROUTES
======================= */
app.use('/api/cart', cartRoutes);

/* =======================
   🔹 START SERVER
======================= */
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
