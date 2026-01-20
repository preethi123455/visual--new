import React, { useState } from "react";
import axios from "axios";

const FileUpload = ({ setUploadedFile }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setMessage("❌ Please select a PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:11000/api/upload",
        formData
      );
      setMessage(response.data.message);
      setUploadedFile(response.data.file);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error uploading file");
    }
    setLoading(false);
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>📄 Upload PDF</h2>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
        style={styles.fileInput}
      />

      <button
        onClick={handleUpload}
        style={styles.button}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

const styles = {
  card: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    width: "420px",
    margin: "20px auto",
    textAlign: "center",
  },
  title: {
    marginBottom: "20px",
    color: "#4c1d95",
  },
  fileInput: {
    marginBottom: "15px",
  },
  button: {
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(to right, #7c3aed, #5b21b6)",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },
  message: {
    marginTop: "15px",
    fontWeight: "500",
  },
};

export default FileUpload;
