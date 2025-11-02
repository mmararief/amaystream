import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { HiChevronDown, HiSearch, HiFilm, HiStar } from "react-icons/hi";
import {
  searchMovies,
  searchTV,
  searchMulti,
  fetchTrendingAll,
  buildImageUrl,
} from "../services/tmdb";
import TrendingSlider from "../components/TrendingSlider";

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

function useDebounce<T>(value: T, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);

  // Update query when URL params change (e.g., browser back/forward)
  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    setQuery(urlQuery);
  }, [searchParams]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [contentType, setContentType] = useState<"all" | "movies" | "tv">(
    "all"
  );
  const [showContentTypeDropdown, setShowContentTypeDropdown] = useState(false);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  const debouncedQuery = useDebounce(query, 400);
  const hasMore = page < totalPages;

  // Update URL when query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      setSearchParams({ q: debouncedQuery });
    } else {
      setSearchParams({});
    }
  }, [debouncedQuery, setSearchParams]);

  // Load trending movies & TV shows
  useEffect(() => {
    let cancelled = false;
    async function loadTrending() {
      try {
        const res = await fetchTrendingAll("day");
        if (!cancelled) setTrending(res.results.slice(0, 20));
      } catch {}
    }
    loadTrending();
    return () => {
      cancelled = true;
    };
  }, []);

  // Search based on content type
  useEffect(() => {
    let cancelled = false;
    async function search() {
      if (!debouncedQuery.trim()) {
        setMovies([]);
        setPage(1);
        setTotalPages(1);
        return;
      }

      setIsLoading(true);
      setPage(1);
      try {
        let res;
        if (contentType === "movies") {
          res = await searchMovies(debouncedQuery, 1);
        } else if (contentType === "tv") {
          res = await searchTV(debouncedQuery, 1);
        } else {
          res = await searchMulti(debouncedQuery, 1);
        }
        if (!cancelled) {
          // Filter and process results
          let results = res.results;

          // For multi search, filter out person and ensure media_type is set
          if (contentType === "all") {
            // Filter out person from multi search results
            results = results.filter(
              (item: any) =>
                item.media_type === "movie" || item.media_type === "tv"
            );
          }

          // Ensure media_type is set correctly for all results
          results = results
            .map((item: any) => {
              if (contentType === "movies") {
                return { ...item, media_type: "movie" };
              } else if (contentType === "tv") {
                return { ...item, media_type: "tv" };
              } else {
                // searchMulti already includes media_type, but ensure it exists
                return { ...item, media_type: item.media_type || "movie" };
              }
            })
            .filter((item: any) => {
              // Additional safety: filter out any invalid items
              return item && (item.title || item.name) && item.id;
            });

          setMovies(results);
          setTotalPages(Math.max(1, Math.min(500, res.total_pages)));
        }
      } catch (error) {
        console.error("Search failed:", error);
        if (!cancelled) {
          setMovies([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    search();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, contentType]);

  // Load more based on content type
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !debouncedQuery.trim()) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      let res;
      if (contentType === "movies") {
        res = await searchMovies(debouncedQuery, nextPage);
      } else if (contentType === "tv") {
        res = await searchTV(debouncedQuery, nextPage);
      } else {
        res = await searchMulti(debouncedQuery, nextPage);
      }
      // Filter and process results
      let results = res.results;

      // For multi search, filter out person
      if (contentType === "all") {
        results = results.filter(
          (item: any) => item.media_type === "movie" || item.media_type === "tv"
        );
      }

      // Ensure media_type is set correctly
      results = results
        .map((item: any) => {
          if (contentType === "movies") {
            return { ...item, media_type: "movie" };
          } else if (contentType === "tv") {
            return { ...item, media_type: "tv" };
          } else {
            return { ...item, media_type: item.media_type || "movie" };
          }
        })
        .filter((item: any) => {
          // Additional safety: filter out any invalid items
          return item && (item.title || item.name) && item.id;
        });

      setMovies((prev) => [...prev, ...results]);
      setPage(nextPage);
      setTotalPages(Math.max(1, Math.min(500, res.total_pages)));
    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoadingMore, debouncedQuery, contentType]);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".search-type-wrapper")) {
        setShowContentTypeDropdown(false);
      }
    };
    if (showContentTypeDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showContentTypeDropdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Query will be updated via debouncedQuery
  };

  return (
    <div className="search-page">
      <div className="search-hero">
        <div className="search-hero-content">
          <h1 className="search-hero-title">
            <HiStar className="search-star" size={24} />
            Discover Your Next Favorite
            <HiStar className="search-star" size={24} />
          </h1>
          <p className="search-hero-subtitle">
            Search through thousands of movies, TV shows, and anime series.
          </p>
          <form className="search-form" onSubmit={handleSubmit}>
            <div
              className={`search-input-wrapper ${isLoading ? "searching" : ""}`}
            >
              <div className="search-type-wrapper">
                <button
                  type="button"
                  className="search-type-btn"
                  onClick={() =>
                    setShowContentTypeDropdown(!showContentTypeDropdown)
                  }
                >
                  {contentType === "all"
                    ? "Movies & TV Shows"
                    : contentType === "movies"
                    ? "Movies"
                    : "TV Shows"}
                  <HiChevronDown
                    size={16}
                    style={{
                      transform: showContentTypeDropdown
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </button>
                {showContentTypeDropdown && (
                  <div className="search-type-dropdown">
                    <button
                      type="button"
                      className={`search-type-option ${
                        contentType === "all" ? "active" : ""
                      }`}
                      onClick={() => {
                        setContentType("all");
                        setShowContentTypeDropdown(false);
                      }}
                    >
                      Movies & TV Shows
                    </button>
                    <button
                      type="button"
                      className={`search-type-option ${
                        contentType === "movies" ? "active" : ""
                      }`}
                      onClick={() => {
                        setContentType("movies");
                        setShowContentTypeDropdown(false);
                      }}
                    >
                      Movies
                    </button>
                    <button
                      type="button"
                      className={`search-type-option ${
                        contentType === "tv" ? "active" : ""
                      }`}
                      onClick={() => {
                        setContentType("tv");
                        setShowContentTypeDropdown(false);
                      }}
                    >
                      TV Shows
                    </button>
                  </div>
                )}
              </div>
              <div className="search-input-container">
                <HiSearch className="search-icon" size={20} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Type here to search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      {debouncedQuery.trim() ? (
        <section className="search-results-section">
          <div className="search-results-header">
            <h2 className="search-results-title">
              <div className="trending-title-bar"></div>
              Search Results
            </h2>
            <p className="search-results-count">
              {movies.length > 0 ? `${movies.length} results found` : ""}
            </p>
          </div>

          {isLoading && movies.length === 0 ? (
            <div className="search-loading">
              <div className="loading-spinner"></div>
              <span>Mencari film...</span>
            </div>
          ) : movies.length === 0 ? (
            <div className="search-empty">
              <HiSearch className="empty-icon" size={48} />
              <p className="empty-text">Tidak ada hasil ditemukan</p>
              <p className="empty-hint">
                Coba kata kunci yang berbeda untuk menemukan lebih banyak film.
              </p>
            </div>
          ) : (
            <>
              <div className="search-results-grid">
                {movies.map((movie) => (
                  <Link
                    key={movie.id}
                    to={
                      movie.media_type === "tv" || contentType === "tv"
                        ? `/tv/${movie.id}`
                        : `/movie/${movie.id}`
                    }
                    className="search-result-card"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {movie.poster_path ? (
                      <img
                        src={buildImageUrl(movie.poster_path, "w342")}
                        alt={movie.title || movie.name || "Poster"}
                        className="search-result-poster"
                        loading="lazy"
                      />
                    ) : (
                      <HiFilm
                        className="search-result-poster-placeholder"
                        size={48}
                      />
                    )}
                    <div className="search-result-info">
                      <div className="search-result-title">
                        {movie.title || movie.name}
                      </div>
                      <div className="search-result-meta">
                        <HiStar
                          size={14}
                          style={{
                            marginRight: 4,
                            verticalAlign: "middle",
                            display: "inline-block",
                          }}
                        />
                        {movie.vote_average.toFixed(1)}
                        {movie.release_date || movie.first_air_date
                          ? ` · ${(
                              movie.release_date || movie.first_air_date
                            )?.slice(0, 4)}`
                          : ""}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

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
                  <p>Semua hasil sudah ditampilkan</p>
                </div>
              )}
            </>
          )}
        </section>
      ) : (
        trending.length > 0 && (
          <TrendingSlider movies={trending} title="Trending Today" />
        )
      )}
    </div>
  );
}
