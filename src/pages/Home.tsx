import { useEffect, useState, useRef, useCallback } from "react";
import { HiFilm, HiStar } from "react-icons/hi";
import {
  searchMovies,
  fetchTrendingAll,
  fetchTopRatedMovies,
  buildImageUrl,
  discoverMovies,
  type DiscoverFilters,
} from "../services/tmdb";
import { Link } from "react-router-dom";
import BannerCarousel from "../components/BannerCarousel";
import Top10Slider from "../components/Top10Slider";
import TopRatedSlider from "../components/TopRatedSlider";
import GenresSlider from "../components/GenresSlider";
import MovieFilters from "../components/MovieFilters";
import { useSEO } from "../hooks/useSEO";
import AISearchNotification from "../components/AISearchNotification";

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
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  backdrop_path?: string | null;
  media_type?: "movie" | "tv";
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [filters, setFilters] = useState<DiscoverFilters>({
    genre: null,
    year: null,
    minRating: null,
    sortBy: undefined,
  });
  const observerTarget = useRef<HTMLDivElement | null>(null);
  const [showSportsNotice, setShowSportsNotice] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("sports_notice_dismissed") !== "1";
  });

  const debouncedQuery = useDebounce(query, 400);
  const hasActiveFilters =
    filters.genre !== null ||
    filters.year !== null ||
    filters.minRating !== null ||
    filters.sortBy !== undefined;

  const hasMore = page < totalPages;

  // SEO
  useSEO({
    title: debouncedQuery
      ? `Cari "${debouncedQuery}" | AmayStream`
      : hasActiveFilters
      ? "Film Terfilter | AmayStream"
      : "AmayStream",
    description:
      debouncedQuery && movies.length > 0
        ? `Temukan ${movies.length} hasil pencarian untuk "${debouncedQuery}" di AmayStream. Streaming film gratis & sports stream.`
        : "Jelajahi koleksi film populer terbaru. Streaming film gratis & sports stream dengan kualitas HD di AmayStream.",
    keywords: debouncedQuery
      ? `${debouncedQuery}, film, streaming, nonton film`
      : "film populer, film terbaru, streaming film, film gratis",
    url: debouncedQuery
      ? `https://amaystream.vercel.app/?search=${encodeURIComponent(
          debouncedQuery
        )}`
      : "https://amaystream.vercel.app/",
  });

  // Initial load or reset when query/filters change
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setPage(1);
      try {
        let res;
        if (debouncedQuery.trim().length > 0) {
          res = await searchMovies(debouncedQuery, 1);
        } else if (hasActiveFilters) {
          res = await discoverMovies(filters, 1);
        } else {
          // Kosongkan movies saat tidak ada query/filter karena section grid sudah disembunyikan
          if (!cancelled) {
            setMovies([]);
            setTotalPages(1);
          }
          return;
        }

        if (!cancelled) {
          setMovies(res.results);
          setTotalPages(Math.max(1, Math.min(500, res.total_pages)));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, filters, hasActiveFilters]);

  // Load more movies
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      let res;
      const nextPage = page + 1;

      if (debouncedQuery.trim().length > 0) {
        res = await searchMovies(debouncedQuery, nextPage);
      } else if (hasActiveFilters) {
        res = await discoverMovies(filters, nextPage);
      } else {
        // Tidak ada load more jika tidak ada query/filter
        return;
      }

      setMovies((prev) => [...prev, ...res.results]);
      setPage(nextPage);
      setTotalPages(Math.max(1, Math.min(500, res.total_pages)));
    } catch (error) {
      console.error("Failed to load more movies:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoadingMore, debouncedQuery, filters, hasActiveFilters]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !isLoading
        ) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, isLoading, loadMore]);

  useEffect(() => {
    let cancelled = false;
    async function loadTrending() {
      try {
        const res = await fetchTrendingAll("day");
        if (!cancelled) setTrending(res.results.slice(0, 10));
      } catch {}
    }
    loadTrending();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadTopRated() {
      try {
        const res = await fetchTopRatedMovies(1);
        if (!cancelled) setTopRated(res.results.slice(0, 20));
      } catch {}
    }
    loadTopRated();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="home-page">
      <AISearchNotification />
      {showSportsNotice && (
        <div className="notice" style={{ marginTop: 8 }}>
          <strong>Baru!</strong> Kini tersedia <strong>Sports Stream</strong>.
          Nikmati siaran pertandingan dan match center.{" "}
          <Link to="/sports" className="footer-link-inline">
            Lihat sekarang
          </Link>
          <button
            className="notice-close"
            onClick={() => {
              setShowSportsNotice(false);
              try {
                localStorage.setItem("sports_notice_dismissed", "1");
              } catch {}
            }}
            aria-label="Tutup pemberitahuan"
          >
            ×
          </button>
        </div>
      )}
      <BannerCarousel movies={trending} />

      {!debouncedQuery && !hasActiveFilters && trending.length > 0 && (
        <Top10Slider movies={trending} />
      )}

      {!debouncedQuery && !hasActiveFilters && topRated.length > 0 && (
        <TopRatedSlider movies={topRated} />
      )}

      {!debouncedQuery && !hasActiveFilters && <GenresSlider />}

      {(debouncedQuery || hasActiveFilters) && (
        <section className="home-section">
          <div className="section-header">
            <h2 className="section-title">
              {debouncedQuery
                ? "Hasil Pencarian"
                : hasActiveFilters
                ? "Film Terfilter"
                : ""}
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
              <HiFilm className="empty-icon" size={48} />
              <p className="empty-text">Tidak ada hasil ditemukan.</p>
              {debouncedQuery && (
                <p className="empty-hint">
                  Coba kata kunci yang berbeda atau gunakan AI Search di atas.
                </p>
              )}
            </div>
          )}

          {!isLoading && movies.length > 0 && (
            <>
              <div className="grid">
                {movies.map((m, idx) => (
                  <Link
                    key={`${m.id}-${idx}`}
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
                          src={buildImageUrl(
                            m.poster_path,
                            getOptimalImageSize()
                          )}
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
                          <HiStar
                            size={14}
                            style={{
                              marginRight: 4,
                              verticalAlign: "middle",
                              display: "inline-block",
                            }}
                          />
                          {m.vote_average.toFixed(1)}{" "}
                          {m.release_date
                            ? `· ${m.release_date.slice(0, 4)}`
                            : ""}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Infinite Scroll Sentinel */}
              {hasMore && (
                <div ref={observerTarget} className="infinite-scroll-sentinel">
                  {isLoadingMore && (
                    <div className="infinite-scroll-loading">
                      <div className="loading-spinner"></div>
                      <span>Memuat lebih banyak film...</span>
                    </div>
                  )}
                </div>
              )}

              {!hasMore && movies.length > 0 && (
                <div className="infinite-scroll-end">
                  <p>Semua film sudah ditampilkan</p>
                </div>
              )}
            </>
          )}
        </section>
      )}
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
