const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

const app = express();
const PORT = 11000;

app.use(cors());
app.use(express.json());

/* =========================
   STORAGE
========================= */
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

/* =========================
   RAG MEMORY (DYNAMIC)
========================= */
let sentenceIndex = [];

/* =========================
   STOP WORDS
========================= */
const STOP_WORDS = new Set([
  "the","is","are","was","were","and","or","of","to","in","on","for","with",
  "a","an","this","that","by","as","it","from","at","be","has","have",
  "using","used","use","pdf","document"
]);

/* =========================
   MULTER CONFIG
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* =========================
   TEXT UTILITIES
========================= */
const cleanText = (text) =>
  text
    .replace(/\s+/g, " ")
    .replace(/[^a-zA-Z0-9. ]/g, "")
    .toLowerCase()
    .trim();

const tokenize = (text) =>
  text
    .split(" ")
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));

/* =========================
   UPLOAD PDF + INDEX
========================= */
app.post("/api/upload", upload.single("pdf"), async (req, res) => {
  try {
    const buffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(buffer);

    const cleaned = cleanText(data.text);

    if (!cleaned || cleaned.length < 100) {
      return res.json({
        message: "⚠️ PDF has very little extractable text.",
        file: req.file.filename,
      });
    }

    // Sentence-level indexing (fully dynamic)
    sentenceIndex = cleaned
      .split(".")
      .map(s => s.trim())
      .filter(s => s.length > 40)
      .map(s => ({
        text: s,
        tokens: tokenize(s),
      }));

    res.json({
      message: "✅ PDF uploaded & indexed successfully",
      file: req.file.filename,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "❌ Failed to process PDF",
    });
  }
});

/* =========================
   ASK PDF — TRUE DYNAMIC RAG
========================= */
app.post("/api/ask", (req, res) => {
  const { question } = req.body;

  if (!sentenceIndex.length) {
    return res.json({
      answer: "❌ No PDF indexed. Please upload a PDF first.",
    });
  }

  const qClean = cleanText(question);
  const qTokens = tokenize(qClean);

  /* =========================
     SCORE ALL SENTENCES
  ========================= */
  const scored = sentenceIndex.map(s => {
    const overlap = s.tokens.filter(t => qTokens.includes(t));
    return {
      text: s.text,
      score: overlap.length,
    };
  });

  const relevant = scored.filter(s => s.score > 0);

  /* =========================
     DOCUMENT-LEVEL FALLBACK
     (NO QUESTION HARD-CODING)
  ========================= */
  if (relevant.length === 0) {
    // If question is generic (low token complexity),
    // assume document-level intent
    if (qTokens.length <= 2) {
      const overview = sentenceIndex
        .slice(0, 6)
        .map(s => "• " + s.text)
        .join("\n");

      return res.json({
        answer: `📘 Document Overview (from content):\n\n${overview}`,
      });
    }

    return res.json({
      answer:
        "⚠️ The document does not contain information related to this question.",
    });
  }

  /* =========================
     INTENT INFERENCE (DYNAMIC)
  ========================= */
  const relevanceRatio = relevant.length / sentenceIndex.length;

  let selectedSentences;

  if (relevanceRatio > 0.15) {
    // Broad intent
    selectedSentences = relevant.slice(0, 6);
  } else {
    // Specific intent
    selectedSentences = relevant
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  /* =========================
     ANSWER (ONLY FROM PDF)
  ========================= */
  const answer = `📘 Answer (from document):\n\n${selectedSentences
    .map(s => "• " + s.text)
    .join("\n")}`;

  res.json({ answer });
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`✅ Dynamic RAG Server running at http://localhost:${PORT}`);
});
