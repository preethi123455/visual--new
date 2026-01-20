import React, { useState } from "react";

/* 🔑 API KEY (⚠️ move to backend in production) */
const GOOGLE_API_KEY = "AIzaSyBggWml0boO9Eq9WWpxSEH286-RdroT4Xw";

/* ✅ SEARCH ENGINE ID */
const GOOGLE_CX = "02b25c5b551b044f4";

const ContentExplorer = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    { id: "all", label: "🔍 All" },
    { id: "articles", label: "📰 Articles" },
    { id: "videos", label: "🎬 Videos" },
    { id: "books", label: "📚 Books" },
    { id: "courses", label: "🧠 Courses" },
  ];

  /* ---------------- GOOGLE SEARCH ---------------- */
  const googleSearch = async (query, type) => {
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(
      query
    )}&num=5`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.items) return [];

    return data.items.map((item) => ({
      title: item.title,
      description: item.snippet,
      link: item.link,
      source: item.displayLink,
      type,
    }));
  };

  /* ---------------- SEARCH HANDLER ---------------- */
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const articles = await googleSearch(
        `${searchTerm} site:medium.com OR site:geeksforgeeks.org`,
        "articles"
      );

      const videos = await googleSearch(
        `${searchTerm} site:youtube.com`,
        "videos"
      );

      const courses = await googleSearch(
        `${searchTerm} site:coursera.org OR site:udemy.com`,
        "courses"
      );

      const booksRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          searchTerm
        )}&maxResults=5`
      );

      const booksData = await booksRes.json();

      const books =
        booksData.items?.map((b) => ({
          title: b.volumeInfo.title,
          description:
            b.volumeInfo.description || "No description available",
          link: b.volumeInfo.previewLink,
          source: "Google Books",
          type: "books",
        })) || [];

      setResults([...articles, ...videos, ...courses, ...books]);
    } catch (err) {
      console.error(err);
      setError("❌ API Error: Check API key or quota");
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    activeCategory === "all"
      ? results
      : results.filter((r) => r.type === activeCategory);

  /* ---------------- UI ---------------- */
  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h2 style={{ color: "#6a0dad" }}>📘 Content Explorer</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search Algebra, Calculus, Matrices..."
          style={{ flex: 1, padding: "12px", borderRadius: "8px" }}
        />

        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            background: "#6a0dad",
            color: "white",
            padding: "12px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              background:
                activeCategory === c.id ? "#6a0dad" : "#eee",
              color:
                activeCategory === c.id ? "#fff" : "#000",
              cursor: "pointer",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {filtered.map((item, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "10px",
            }}
          >
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <small>Source: {item.source}</small>
            <br />
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
            >
              Open 🔗
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentExplorer;
