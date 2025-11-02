import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { HiFilm, HiStar } from "react-icons/hi";
import "swiper/css";
import "swiper/css/navigation";
import { Link } from "react-router-dom";
import { buildImageUrl, discoverMovies } from "../services/tmdb";

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
};

const POPULAR_GENRES = [
  { id: 35, name: "Comedy" },
  { id: 28, name: "Action" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "SciFi" },
  { id: 18, name: "Drama" },
  { id: 16, name: "Animation" },
];

export default function GenresSlider() {
  const [selectedGenre, setSelectedGenre] = useState<number>(POPULAR_GENRES[0].id);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadMovies() {
      setIsLoading(true);
      try {
        const res = await discoverMovies({ genre: selectedGenre }, 1);
        if (!cancelled) {
          setMovies(res.results.slice(0, 20));
        }
      } catch (error) {
        console.error("Failed to load movies:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadMovies();
    return () => {
      cancelled = true;
    };
  }, [selectedGenre]);

  if (isLoading && movies.length === 0) return null;

  return (
    <section className="genres-section">
      <div className="genres-header">
        <div className="trending-title-wrapper">
          <div className="trending-title-bar"></div>
          <h2 className="trending-title">Genres</h2>
        </div>
        <div className="genres-tabs">
          {POPULAR_GENRES.map((genre) => (
            <button
              key={genre.id}
              className={`genre-tab ${selectedGenre === genre.id ? "active" : ""}`}
              onClick={() => setSelectedGenre(genre.id)}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>
      <div className="trending-slider-container">
        <Swiper
          modules={[Navigation]}
          slidesPerView="auto"
          spaceBetween={12}
          navigation={true}
          className="trending-swiper"
        >
          {movies.map((movie) => (
            <SwiperSlide key={movie.id} className="trending-slide">
              <Link
                to={`/movie/${movie.id}`}
                className="trending-card-link"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="trending-card">
                  {movie.poster_path ? (
                    <img
                      src={buildImageUrl(movie.poster_path, "w342")}
                      alt={movie.title}
                      className="trending-poster"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <HiFilm className="trending-poster-placeholder" size={48} />
                  )}
                  <div className="trending-info">
                    <div className="trending-title-text">{movie.title}</div>
                    <div className="trending-meta">
                      <HiStar size={14} style={{ marginRight: 4, verticalAlign: 'middle', display: 'inline-block' }} />
                      {movie.vote_average.toFixed(1)}
                      {movie.release_date
                        ? ` · ${movie.release_date.slice(0, 4)}`
                        : ""}
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

