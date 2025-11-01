import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { searchMovieByDescription } from "../services/gemini";
import { buildImageUrl, fetchMovieDetail } from "../services/tmdb";

type MovieResult = {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  overview?: string;
};

export default function AIBottomSearch() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<MovieResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setResults([]);
    setError(null);
    setIsModalOpen(true); // Buka modal untuk menampilkan loading

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
      setResults(validResults);
      
      if (validResults.length === 0) {
        setError("Tidak ada film yang ditemukan.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mencari film.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError(null);
    setResults([]);
  };

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  return (
    <>
      {/* Fixed Bottom Search Bar */}
      <div className={`ai-bottom-search ${isSearchBarOpen ? "ai-bottom-search-open" : ""}`}>
        {isSearchBarOpen ? (
          <div className={`ai-bottom-input-wrapper ${isSearching ? "ai-bottom-searching" : ""}`}>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="ai-modal-overlay" onClick={handleCloseModal}>
          <div
            className="ai-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ai-modal-header">
              <h2 className="ai-modal-title">
                {isSearching
                  ? "Mencari rekomendasi..."
                  : results.length > 0
                  ? `✨ ${results.length} Rekomendasi`
                  : "Hasil Pencarian"}
              </h2>
              <button
                className="ai-modal-close"
                onClick={handleCloseModal}
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

            <div className="ai-modal-body">
              {isSearching && (
                <div className="ai-modal-loading">
                  <div className="ai-modal-spinner"></div>
                  <p>Mencari film berdasarkan deskripsi Anda...</p>
                </div>
              )}

              {error && (
                <div className="ai-modal-error">
                  <span>⚠️</span>
                  <p>{error}</p>
                </div>
              )}

              {!isSearching && results.length > 0 && (
                <div className="ai-modal-results">
                  {results.map((result, idx) => (
                    <Link
                      key={result.id}
                      to={`/movie/${result.id}`}
                      className="ai-modal-result-item"
                      onClick={handleCloseModal}
                      style={{
                        animationDelay: `${idx * 0.05}s`,
                      }}
                    >
                      {result.poster_path ? (
                        <img
                          src={buildImageUrl(result.poster_path, "w342")}
                          alt={result.title}
                          className="ai-modal-poster"
                        />
                      ) : (
                        <div className="ai-modal-poster-placeholder">
                          🎬
                        </div>
                      )}
                      <div className="ai-modal-result-info">
                        <h3 className="ai-modal-result-title">
                          {result.title}
                        </h3>
                        <div className="ai-modal-result-meta">
                          <span className="ai-modal-rating">
                            ⭐ {result.vote_average.toFixed(1)}
                          </span>
                          {result.release_date && (
                            <span className="ai-modal-year">
                              {result.release_date.slice(0, 4)}
                            </span>
                          )}
                        </div>
                        {result.overview && (
                          <p className="ai-modal-overview">
                            {result.overview.length > 120
                              ? `${result.overview.slice(0, 120)}...`
                              : result.overview}
                          </p>
                        )}
                        <div className="ai-modal-badge">✨ AI Recommendation</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

