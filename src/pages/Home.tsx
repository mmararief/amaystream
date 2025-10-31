import { useEffect, useMemo, useState } from "react";
import {
  searchMovies,
  fetchPopularMovies,
  fetchTrendingMovies,
  buildImageUrl,
} from "../services/tmdb";
import { Link } from "react-router-dom";
import BannerCarousel from "../components/BannerCarousel";

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  backdrop_path?: string | null;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [trending, setTrending] = useState<Movie[]>([]);

  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        if (debouncedQuery.trim().length > 0) {
          const res = await searchMovies(debouncedQuery, page);
          if (!cancelled) {
            setMovies(res.results);
            setTotalPages(Math.max(1, Math.min(500, res.total_pages)));
          }
        } else {
          const res = await fetchPopularMovies(page);
          if (!cancelled) {
            setMovies(res.results);
            setTotalPages(Math.max(1, Math.min(500, res.total_pages)));
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, page]);

  useEffect(() => {
    let cancelled = false;
    async function loadTrending() {
      try {
        const res = await fetchTrendingMovies("day");
        if (!cancelled) setTrending(res.results.slice(0, 10));
      } catch {}
    }
    loadTrending();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  return (
    <div>
      <div className="top-tagline">
        <span className="top-tagline-text">
          kapan lagi wok streaming gada iklan
        </span>
      </div>
      <BannerCarousel movies={trending} />
      <div className="search">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari film..."
        />
      </div>

      {isLoading && (
        <div className="grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              className="skeleton fade-in"
              key={i}
              style={{ aspectRatio: "2/3" }}
            >
              <div className="sp">
                <div
                  className="ph ph-lg"
                  style={{ width: "80%", marginBottom: 8 }}
                />
                <div className="ph" style={{ width: "60%" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && movies.length === 0 && (
        <p style={{ color: "#9ca3af" }}>Tidak ada hasil.</p>
      )}

      {!isLoading && movies.length > 0 && (
        <div className="grid">
          {movies.map((m, idx) => (
            <Link
              key={m.id}
              to={`/movie/${m.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                className={`card fade-in ${
                  idx % 3 === 1
                    ? "fade-in-delayed-1"
                    : idx % 3 === 2
                    ? "fade-in-delayed-2"
                    : ""
                }`}
              >
                {m.poster_path ? (
                  <img
                    className="poster"
                    src={buildImageUrl(m.poster_path, "w342")}
                    alt={m.title}
                  />
                ) : (
                  <div className="no-poster">Tidak ada poster</div>
                )}
                <div className="card-body">
                  <div className="title">{m.title}</div>
                  <div className="meta">
                    ⭐ {m.vote_average.toFixed(1)}{" "}
                    {m.release_date ? `· ${m.release_date.slice(0, 4)}` : ""}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

function useDebounce<T>(value: T, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const info = useMemo(() => `${page} / ${totalPages}`, [page, totalPages]);
  if (totalPages <= 1) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginTop: 20,
        justifyContent: "center",
      }}
    >
      <button
        onClick={() => canPrev && onChange(page - 1)}
        disabled={!canPrev}
        style={btn}
      >
        Sebelumnya
      </button>
      <span style={{ fontSize: 13, color: "#555" }}>{info}</span>
      <button
        onClick={() => canNext && onChange(page + 1)}
        disabled={!canNext}
        style={btn}
      >
        Berikutnya
      </button>
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #ddd",
  background: "#fff",
  borderRadius: 8,
  cursor: "pointer",
};
