import { useState, useImperativeHandle, forwardRef, useRef } from "react";
import { Link } from "react-router-dom";
import { searchMovieByDescription } from "../services/gemini";
import { buildImageUrl, fetchMovieDetail } from "../services/tmdb";

type MovieResult = {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  backdrop_path?: string | null;
};

export interface AIBottomSearchHandle {
  openAndFocus: () => void;
}

const AIBottomSearch = forwardRef<AIBottomSearchHandle>((_, ref) => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);
  const [results, setResults] = useState<MovieResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    openAndFocus: () => {
      setIsSearchBarOpen(true);
      // Focus input setelah state update
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    },
  }));

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const aiResults = await searchMovieByDescription(query);

      if (!aiResults || aiResults.length === 0) {
        setError("Film tidak ditemukan. Coba deskripsi yang lebih spesifik.");
        setIsSearching(false);
        return;
      }

      // Fetch full movie details from TMDB for all results
      const movieDetails = await Promise.all(
        aiResults.map((r) => fetchMovieDetail(r.id).catch(() => null))
      );

      const validResults = movieDetails.filter(
        (m): m is MovieResult => m !== null
      );

      if (validResults.length === 0) {
        setError("Tidak ada film yang ditemukan.");
        setIsSearching(false);
        return;
      }

      // Set results untuk ditampilkan di floating panel
      setResults(validResults);

      // Close search bar after successful search (but keep floating panel open)
      setIsSearchBarOpen(false);
      setQuery("");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mencari film.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      {/* Fixed Bottom Search Bar */}
      <div
        className={`ai-bottom-search ${
          isSearchBarOpen ? "ai-bottom-search-open" : ""
        }`}
      >
        {isSearchBarOpen ? (
          <>
            {/* Template Questions */}
            <div className="ai-bottom-templates">
              <button
                className="ai-bottom-template-item"
                onClick={() => {
                  setQuery("Film horor Indonesia yang menyeramkan");
                  setTimeout(() => inputRef.current?.focus(), 0);
                }}
                disabled={isSearching}
              >
                🎬 Film horor Indonesia
              </button>
              <button
                className="ai-bottom-template-item"
                onClick={() => {
                  setQuery("Action dengan superhero yang seru");
                  setTimeout(() => inputRef.current?.focus(), 0);
                }}
                disabled={isSearching}
              >
                💥 Action superhero
              </button>
              <button
                className="ai-bottom-template-item"
                onClick={() => {
                  setQuery("Film romantis yang mengharukan");
                  setTimeout(() => inputRef.current?.focus(), 0);
                }}
                disabled={isSearching}
              >
                ❤️ Romantis mengharukan
              </button>
            </div>
            <div
              className={`ai-bottom-input-wrapper ${
                isSearching ? "ai-bottom-searching" : ""
              }`}
            >
              <button
                className="ai-bottom-close-btn"
                onClick={() => {
                  setIsSearchBarOpen(false);
                  setQuery("");
                  setError(null);
                }}
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15 5L5 15M5 5l10 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Apa yang ingin Anda tonton? Ceritakan di sini..."
                className="ai-bottom-input"
                disabled={isSearching}
                autoFocus
              />
              <div className="ai-bottom-actions">
                <button
                  className="ai-bottom-btn ai-bottom-add"
                  onClick={() => setQuery("")}
                  disabled={!query.trim()}
                  aria-label="Clear"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 4V12M4 8H12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <button
                  className="ai-bottom-btn ai-bottom-search-btn"
                  onClick={handleSearch}
                  disabled={isSearching || !query.trim()}
                  aria-label="Search"
                >
                  {isSearching ? (
                    <div className="ai-bottom-spinner"></div>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM14 14l-2.9-2.9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <button
            className="ai-bottom-toggle-btn"
            onClick={() => setIsSearchBarOpen(true)}
            aria-label="Open AI Search"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="ai-bottom-toggle-text">AI Search</span>
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && isSearchBarOpen && (
        <div className="ai-bottom-error">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* Floating Results Panel */}
      {results.length > 0 && !isSearchBarOpen && (
        <div className="ai-results-floating">
          <div className="ai-results-floating-header">
            <h3 className="ai-results-floating-title">
              ✨ {results.length} Rekomendasi AI
            </h3>
            <button
              className="ai-results-floating-close"
              onClick={() => setResults([])}
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15 5L5 15M5 5l10 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <div className="ai-results-floating-grid">
            {results.map((result, idx) => (
              <Link
                key={result.id}
                to={`/movie/${result.id}`}
                className="ai-results-floating-item card-ai"
                onClick={() => setResults([])}
                style={{
                  animationDelay: `${idx * 0.05}s`,
                }}
              >
                <div className="edge-border"></div>
                {result.poster_path ? (
                  <img
                    src={buildImageUrl(result.poster_path, "w342")}
                    alt={result.title}
                    className="ai-results-floating-poster"
                  />
                ) : (
                  <div className="ai-results-floating-poster-placeholder">
                    🎬
                  </div>
                )}
                <div className="card-body">
                  <div className="title">{result.title}</div>
                  <div className="meta">
                    ⭐ {result.vote_average.toFixed(1)}
                    {result.release_date
                      ? ` · ${result.release_date.slice(0, 4)}`
                      : ""}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
});

AIBottomSearch.displayName = "AIBottomSearch";

export default AIBottomSearch;
