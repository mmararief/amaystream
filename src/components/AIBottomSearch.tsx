import { useState, useImperativeHandle, forwardRef, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiX,
  HiPlus,
  HiSearch,
  HiFilm,
  HiSparkles,
  HiExclamation,
} from "react-icons/hi";
import { HiStar } from "react-icons/hi2";
import {
  searchMovieByDescription,
  searchMatchesByDescription,
} from "../services/gemini";
import { buildImageUrl, fetchMovieDetail } from "../services/tmdb";
import {
  getPosterUrlFromPosterPath,
  getBadgeUrl,
  type StreamedMatch,
} from "../services/streamed";

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
  const [sportsResults, setSportsResults] = useState<StreamedMatch[]>([]);
  const [openingMatchId, setOpeningMatchId] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useImperativeHandle(ref, () => ({
    openAndFocus: () => {
      setIsSearchBarOpen(true);
      // Focus input setelah state update
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    },
  }));

  function isSportsIntent(text: string): boolean {
    const t = text.toLowerCase();
    const sportsTokens = [
      "sepak bola",
      "bola",
      "football",
      "soccer",
      "basket",
      "bola basket",
      "basketball",
      "tenis",
      "tennis",
      "mma",
      "boxing",
      "tinju",
      "hoki",
      "hockey",
      "baseball",
      "motogp",
      "f1",
      "formula 1",
      "motor",
      "motor-sports",
      "wec",
      "wrc",
      "vs ",
      " liga",
      " league",
      " cup",
      " match",
      "pertandingan",
      "kickoff",
      "siaran langsung",
      "live",
      "hari ini",
      "besok",
      "tomorrow",
      "u17",
      "u19",
      "fc ",
    ];
    return sportsTokens.some((k) => t.includes(k));
  }

  function isMovieIntent(text: string): boolean {
    const t = text.toLowerCase();
    const movieTokens = [
      "film",
      "movie",
      "series",
      "horor",
      "horror",
      "romantis",
      "romance",
      "action",
      "aksi",
      "komedi",
      "thriller",
      "drama",
      "indonesia",
    ];
    return movieTokens.some((k) => t.includes(k));
  }

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const wantSports = isSportsIntent(query);
      const wantMovies = isMovieIntent(query) || !wantSports; // default bias to movies if unclear

      const [aiMovieResults, aiSportsMatches] = await Promise.all([
        wantMovies
          ? searchMovieByDescription(query).catch(() => [])
          : Promise.resolve([]),
        wantSports
          ? searchMatchesByDescription(query).catch(() => [])
          : Promise.resolve([]),
      ]);

      // Movies: fetch full details
      let validMovieResults: MovieResult[] = [];
      if (aiMovieResults && aiMovieResults.length > 0) {
        const movieDetails = await Promise.all(
          aiMovieResults.map((r) => fetchMovieDetail(r.id).catch(() => null))
        );
        validMovieResults = movieDetails.filter(
          (m): m is MovieResult => m !== null
        );
      }

      setResults(validMovieResults);
      const trimmedSports = (aiSportsMatches || []).slice(0, 8);
      setSportsResults(trimmedSports);

      // Build interactive message
      const numMovies = validMovieResults.length;
      const numSports = trimmedSports.length;
      const uniqueSports = Array.from(
        new Set(trimmedSports.map((m) => m.category))
      ).filter(Boolean);
      let message: string | null = null;
      if (numMovies > 0 && numSports === 0) {
        message = `Aku menemukan ${numMovies} film yang cocok. Pilih salah satu untuk melihat detailnya.`;
      } else if (numSports > 0 && numMovies === 0) {
        const sportLabel =
          uniqueSports.length > 0 ? uniqueSports.join(", ") : "olahraga";
        message = `Ini ${numSports} pertandingan ${sportLabel} yang relevan. Klik untuk menonton.`;
      } else if (numMovies > 0 && numSports > 0) {
        message = `Aku menemukan ${numMovies} film dan ${numSports} pertandingan untuk pertanyaanmu.`;
      }
      setAiMessage(message);

      if (
        validMovieResults.length === 0 &&
        (!aiSportsMatches || aiSportsMatches.length === 0)
      ) {
        setAiMessage(
          `Aku belum menemukan hasil untuk "${query}". Coba deskripsi yang lebih spesifik atau gunakan kata kunci lain.`
        );
      }

      // Close search bar after successful search (but keep floating panel open)
      setIsSearchBarOpen(false);
      setQuery("");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mencari film.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenMatch = async (match: StreamedMatch) => {
    try {
      const ref = match.sources && match.sources[0];
      if (!ref) return;
      setOpeningMatchId(match.id);

      // Build query params: title (plain), sources (base64 JSON), match (base64 JSON)
      const toBase64Json = (obj: unknown) =>
        btoa(unescape(encodeURIComponent(JSON.stringify(obj))));

      const params = new URLSearchParams();
      params.set("title", match.title);
      params.set("sources", toBase64Json(match.sources));
      params.set(
        "match",
        toBase64Json({
          title: match.title,
          teams: match.teams,
          date: match.date,
          category: match.category,
        })
      );

      navigate(`/sports/${ref.source}/${ref.id}/watch?${params.toString()}`);
    } catch (e) {
      setError("Gagal membuka stream.");
    } finally {
      setOpeningMatchId(null);
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
                <HiFilm
                  size={16}
                  style={{ marginRight: 6, verticalAlign: "middle" }}
                />
                Film horor Indonesia
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
              <button
                className="ai-bottom-template-item"
                onClick={() => {
                  setQuery("Siarkan sepak bola live hari ini, tim besar");
                  setTimeout(() => inputRef.current?.focus(), 0);
                }}
                disabled={isSearching}
              >
                ⚽ Live sepak bola hari ini
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
                <HiX size={20} />
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
                  <HiPlus size={16} />
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
                    <HiSearch size={16} />
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
            <HiSparkles size={24} />
            <span className="ai-bottom-toggle-text">AI Search</span>
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && isSearchBarOpen && (
        <div className="ai-bottom-error">
          <HiExclamation size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Floating Results Panel */}
      {(results.length > 0 || sportsResults.length > 0 || !!aiMessage) &&
        !isSearchBarOpen && (
          <div className="ai-results-floating">
            <div className="ai-results-floating-header">
              <h3 className="ai-results-floating-title">
                <HiSparkles
                  size={18}
                  style={{ marginRight: 6, verticalAlign: "middle" }}
                />
                Rekomendasi AI
              </h3>
              <button
                className="ai-results-floating-close"
                onClick={() => {
                  setResults([]);
                  setSportsResults([]);
                  setAiMessage(null);
                }}
                aria-label="Close"
              >
                <HiX size={20} />
              </button>
            </div>
            {aiMessage && (
              <div
                className="ai-results-message"
                style={{
                  margin: "8px 0 10px",
                  color: "#cbd5e1",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(59,130,246,0.25)",
                  background:
                    "linear-gradient(90deg, rgba(59,130,246,0.14), rgba(59,130,246,0.06))",
                }}
              >
                <HiSparkles size={16} style={{ color: "#93c5fd" }} />
                <span style={{ lineHeight: 1.35 }}>{aiMessage}</span>
              </div>
            )}
            {results.length > 0 && (
              <>
                <div
                  className="ai-results-subtitle"
                  style={{
                    margin: "12px 0 8px",
                    paddingTop: 8,
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    fontWeight: 600,
                    color: "#e2e8f0",
                    letterSpacing: 0.2,
                  }}
                >
                  Film
                </div>
                <div
                  className="ai-results-floating-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(160px, 1fr))",
                    gap: 12,
                  }}
                >
                  {results.map((result, idx) => (
                    <Link
                      key={result.id}
                      to={`/movie/${result.id}`}
                      className="ai-results-floating-item card-ai"
                      onClick={() => setResults([])}
                      style={{
                        animationDelay: `${idx * 0.05}s`,
                        minWidth: 0,
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
                          <HiFilm size={40} />
                        </div>
                      )}
                      <div className="card-body">
                        <div
                          className="title"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical" as any,
                            overflow: "hidden",
                            minHeight: 40,
                          }}
                        >
                          {result.title}
                        </div>
                        <div className="meta">
                          <HiStar
                            size={14}
                            style={{
                              marginRight: 4,
                              verticalAlign: "middle",
                              display: "inline-block",
                            }}
                          />
                          {result.vote_average.toFixed(1)}
                          {result.release_date
                            ? ` · ${result.release_date.slice(0, 4)}`
                            : ""}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {sportsResults.length > 0 && (
              <>
                <div
                  className="ai-results-subtitle"
                  style={{
                    margin: "16px 0 8px",
                    paddingTop: 8,
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    fontWeight: 600,
                    color: "#e2e8f0",
                    letterSpacing: 0.2,
                  }}
                >
                  Olahraga
                </div>
                <div
                  className="ai-results-floating-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: 12,
                  }}
                >
                  {sportsResults.map((match, idx) => (
                    <button
                      key={match.id}
                      className="ai-results-floating-item card-ai"
                      onClick={() => handleOpenMatch(match)}
                      style={{
                        animationDelay: `${idx * 0.05}s`,
                        textAlign: "left",
                      }}
                    >
                      <div className="edge-border"></div>
                      {match.poster ? (
                        <img
                          src={getPosterUrlFromPosterPath(match.poster)}
                          alt={match.title}
                          className="ai-results-floating-poster"
                        />
                      ) : (
                        <div className="ai-results-floating-poster-placeholder">
                          {match.teams?.home?.badge ? (
                            <img
                              src={getBadgeUrl(match.teams.home.badge)}
                              alt={match.teams?.home?.name || "Home"}
                              style={{ height: 40 }}
                            />
                          ) : (
                            <HiFilm size={40} />
                          )}
                        </div>
                      )}
                      <div className="card-body">
                        <div
                          className="title"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical" as any,
                            overflow: "hidden",
                            minHeight: 40,
                          }}
                        >
                          {match.title}
                        </div>
                        <div className="meta">
                          {match.category}
                          {match.date
                            ? ` · ${new Date(match.date).toLocaleString()}`
                            : ""}
                          {openingMatchId === match.id ? " · membuka…" : ""}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
    </>
  );
});

AIBottomSearch.displayName = "AIBottomSearch";

export default AIBottomSearch;
