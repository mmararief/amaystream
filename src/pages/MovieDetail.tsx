import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  fetchMovieDetail,
  fetchMovieCredits,
  fetchSimilarMovies,
  buildImageUrl,
} from "../services/tmdb";

type MovieDetail = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  genres?: { id: number; name: string }[];
  vote_average: number;
  runtime?: number;
};

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [cast, setCast] = useState<
    {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[]
  >([]);
  const [similar, setSimilar] = useState<
    { id: number; title: string; poster_path: string | null }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const [m, c, s] = await Promise.all([
          fetchMovieDetail(movieId) as Promise<MovieDetail>,
          fetchMovieCredits(movieId) as Promise<{
            cast: {
              id: number;
              name: string;
              character: string;
              profile_path: string | null;
            }[];
          }>,
          fetchSimilarMovies(movieId) as Promise<{
            results: {
              id: number;
              title: string;
              poster_path: string | null;
            }[];
          }>,
        ]);
        if (!cancelled) {
          setMovie(m);
          setCast(c.cast.slice(0, 12));
          setSimilar(s.results.slice(0, 12));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    if (movieId) load();
    return () => {
      cancelled = true;
    };
  }, [movieId]);

  if (isLoading) return <p>Memuat...</p>;
  if (!movie) return <p>Film tidak ditemukan.</p>;

  return (
    <div>
      {movie.backdrop_path && (
        <div style={{ marginBottom: 16 }}>
          <img
            src={buildImageUrl(movie.backdrop_path, "w780")}
            alt={movie.title}
            style={{ width: "100%", borderRadius: 12 }}
          />
        </div>
      )}
      <div className="detail-grid">
        {movie.poster_path && (
          <img
            className="detail-poster"
            src={buildImageUrl(movie.poster_path, "w342")}
            alt={movie.title}
          />
        )}
        <div>
          <h1 style={{ margin: "8px 0", color: "#e5e7eb" }}>{movie.title}</h1>
          <div style={{ marginBottom: 12 }}>
            <Link
              to={`/movie/${movie.id}/watch?autoPlay=true`}
              style={{
                display: "inline-block",
                padding: "10px 14px",
                background: "#e50914",
                color: "#fff",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: 600,
                boxShadow: "0 10px 20px rgba(229,9,20,0.35)",
              }}
            >
              Tonton ▶
            </Link>
          </div>
          <div style={{ color: "#9ca3af", marginBottom: 8 }}>
            ⭐ {movie.vote_average.toFixed(1)}
            {movie.release_date ? ` · ${movie.release_date.slice(0, 4)}` : ""}
            {movie.runtime ? ` · ${movie.runtime}m` : ""}
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            {movie.genres?.map((g) => (
              <span
                key={g.id}
                style={{
                  fontSize: 12,
                  background: "#0f1623",
                  color: "#cbd5e1",
                  padding: "4px 8px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {g.name}
              </span>
            ))}
          </div>
          <p style={{ lineHeight: 1.6, color: "#cbd5e1" }}>{movie.overview}</p>
        </div>
      </div>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 12, color: "#e5e7eb" }}>Pemeran</h2>
        <div className="cast-grid">
          {cast.map((a) => (
            <div
              key={a.id}
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                overflow: "hidden",
                background:
                  "linear-gradient(180deg, rgba(17,24,39,0.85), rgba(17,24,39,0.7))",
              }}
            >
              {a.profile_path ? (
                <img
                  src={buildImageUrl(a.profile_path, "w185")}
                  alt={a.name}
                  style={{
                    width: "100%",
                    display: "block",
                    aspectRatio: "2/3",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    height: 180,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f5f5f5",
                    color: "#777",
                  }}
                >
                  Tidak ada foto
                </div>
              )}
              <div style={{ padding: 10 }}>
                <div style={{ fontWeight: 600, color: "#e5e7eb" }}>
                  {a.name}
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>
                  {a.character}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: 12, color: "#e5e7eb" }}>Mirip dengan ini</h2>
        <div className="similar-grid">
          {similar.map((m) => (
            <Link
              key={m.id}
              to={`/movie/${m.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  overflow: "hidden",
                  background:
                    "linear-gradient(180deg, rgba(17,24,39,0.85), rgba(17,24,39,0.7))",
                }}
              >
                {m.poster_path ? (
                  <img
                    src={buildImageUrl(m.poster_path, "w342")}
                    alt={m.title}
                    style={{
                      width: "100%",
                      display: "block",
                      aspectRatio: "2/3",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: 240,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f5f5f5",
                      color: "#777",
                    }}
                  >
                    Tidak ada poster
                  </div>
                )}
                <div style={{ padding: 12 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      lineHeight: 1.2,
                      color: "#e5e7eb",
                    }}
                  >
                    {m.title}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
