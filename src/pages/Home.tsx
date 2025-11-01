import { useEffect, useMemo, useState } from "react";
import {
  searchMovies,
  fetchPopularMovies,
  fetchTrendingMovies,
  buildImageUrl,
  discoverMovies,
  type DiscoverFilters,
} from "../services/tmdb";
import { Link } from "react-router-dom";
import BannerCarousel from "../components/BannerCarousel";
import AISearch from "../components/AISearch";
import MovieFilters from "../components/MovieFilters";

// Helper untuk menentukan ukuran gambar optimal berdasarkan viewport
function getOptimalImageSize(): "w185" | "w342" | "w500" {
  if (typeof window === "undefined") return "w342";

  const width = window.innerWidth;
  if (width <= 480) return "w185"; // Mobile
  if (width <= 768) return "w342"; // Tablet
  return "w500"; // Desktop
}

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
  const [filters, setFilters] = useState<DiscoverFilters>({
    genre: null,
    year: null,
    minRating: null,
    sortBy: undefined,
  });

  const debouncedQuery = useDebounce(query, 400);
  const hasActiveFilters =
    filters.genre !== null ||
    filters.year !== null ||
    filters.minRating !== null ||
    filters.sortBy !== undefined;

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
        } else if (hasActiveFilters) {
          const res = await discoverMovies(filters, page);
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
  }, [debouncedQuery, page, filters, hasActiveFilters]);

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
  }, [debouncedQuery, filters]);

  return (
    <div className="home-page">
      <BannerCarousel movies={trending} />

      <section className="home-section">
        <AISearch />
      </section>

      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title">
            {debouncedQuery
              ? "Hasil Pencarian"
              : hasActiveFilters
              ? "Film Terfilter"
              : "Film Populer"}
          </h2>
          {debouncedQuery && (
            <p className="section-subtitle">
              Menampilkan hasil untuk: <strong>{debouncedQuery}</strong>
            </p>
          )}
        </div>
        <div className="search">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari film berdasarkan judul..."
          />
        </div>
        {!debouncedQuery && (
          <MovieFilters filters={filters} onChange={setFilters} />
        )}

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
          <div className="empty-state">
            <div className="empty-icon">🎬</div>
            <p className="empty-text">Tidak ada hasil ditemukan.</p>
            {debouncedQuery && (
              <p className="empty-hint">
                Coba kata kunci yang berbeda atau gunakan AI Search di atas.
              </p>
            )}
          </div>
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
                      src={buildImageUrl(m.poster_path, getOptimalImageSize())}
                      alt={m.title}
                      loading="lazy"
                      decoding="async"
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
      </section>
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
    <div className="pagination">
      <button
        onClick={() => canPrev && onChange(page - 1)}
        disabled={!canPrev}
        className="pagination-btn pagination-btn-prev"
      >
        ← Sebelumnya
      </button>
      <span className="pagination-info">{info}</span>
      <button
        onClick={() => canNext && onChange(page + 1)}
        disabled={!canNext}
        className="pagination-btn pagination-btn-next"
      >
        Berikutnya →
      </button>
    </div>
  );
}
