import { useState } from "react";
import { Link } from "react-router-dom";
import { searchMovieByDescription } from "../services/gemini";
import { buildImageUrl, fetchMovieDetail } from "../services/tmdb";

type MovieResult = {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
};

export default function AISearch() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<MovieResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [typingText, setTypingText] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setResults([]);
    setError(null);
    setTypingText("Mencari film...");

    try {
      const aiResults = await searchMovieByDescription(query);

      if (!aiResults || aiResults.length === 0) {
        setError("Film tidak ditemukan. Coba deskripsi yang lebih spesifik.");
        setIsSearching(false);
        return;
      }

      setTypingText(`Menemukan ${aiResults.length} rekomendasi...`);

      // Fetch full movie details from TMDB for all results
      const movieDetails = await Promise.all(
        aiResults.map((r) => fetchMovieDetail(r.id).catch(() => null))
      );

      const validResults = movieDetails.filter(
        (m): m is MovieResult => m !== null
      );
      setResults(validResults);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mencari film.");
    } finally {
      setIsSearching(false);
      setTypingText("");
    }
  };

  return (
    <div className={`ai-search ${isSearching ? "ai-search-active" : ""}`}>
      <div className="ai-search-header">
        <div className="ai-icon">✨</div>
        <h3 style={{ margin: 0, color: "#e5e7eb" }}>AI Search</h3>
      </div>
      <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 4 }}>
        Bingung mau cari film apa? Kamu bisa cerita disini loo ✨
      </p>

      <div className="ai-input-group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Contoh: film horor indonesia, action dengan superhero, atau romantis..."
          className="ai-input"
          disabled={isSearching}
        />
        <button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className="ai-search-btn"
        >
          {isSearching ? "⏳" : "🔍"}
        </button>
      </div>

      {isSearching && typingText && (
        <div className="ai-typing">
          <span className="ai-typing-dots"></span>
          <span className="ai-typing-text">{typingText}</span>
        </div>
      )}

      {error && (
        <div className="ai-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="ai-results">
          <div className="ai-results-header">
            <span style={{ color: "#22d3ee", fontSize: 14, fontWeight: 600 }}>
              ✨ {results.length} Rekomendasi ditemukan
            </span>
          </div>
          <div className="ai-results-grid">
            {results.map((result, idx) => (
              <Link
                key={result.id}
                to={`/movie/${result.id}`}
                className="fade-in"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  animationDelay: `${idx * 0.1}s`,
                }}
              >
                <div className="ai-result-card">
                  {result.poster_path ? (
                    <img
                      src={buildImageUrl(result.poster_path, "w342")}
                      alt={result.title}
                      className="ai-result-poster"
                    />
                  ) : (
                    <div className="ai-result-placeholder">
                      Tidak ada poster
                    </div>
                  )}
                  <div className="ai-result-info">
                    <div className="ai-result-title">{result.title}</div>
                    <div className="ai-result-meta">
                      ⭐ {result.vote_average.toFixed(1)}
                      {result.release_date
                        ? ` · ${result.release_date.slice(0, 4)}`
                        : ""}
                    </div>
                    <div className="ai-result-badge">✨ AI</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
