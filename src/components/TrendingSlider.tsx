import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { HiFilm, HiStar } from "react-icons/hi";
import "swiper/css";
import "swiper/css/navigation";
import { buildImageUrl } from "../services/tmdb";

type Movie = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: 'movie' | 'tv';
};

type TrendingSliderProps = {
  movies: Movie[];
  title: string;
  subtitle?: string;
  fullWidth?: boolean;
};

export default function TrendingSlider({
  movies,
  title,
  subtitle,
  fullWidth = false,
}: TrendingSliderProps) {
  if (!movies || movies.length === 0) return null;

  return (
    <section className={`trending-section ${fullWidth ? 'trending-section-full' : ''}`}>
      <div className="trending-header">
        <div className="trending-title-wrapper">
          <div className="trending-title-bar"></div>
          <h2 className="trending-title">{title}</h2>
          {subtitle && <span className="trending-subtitle">{subtitle}</span>}
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
                to={movie.media_type === 'tv' ? `/tv/${movie.id}` : `/movie/${movie.id}`}
                className="trending-card-link"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="trending-card">
                  {movie.poster_path ? (
                    <img
                      src={buildImageUrl(movie.poster_path, "w342")}
                      alt={movie.title || movie.name || 'Poster'}
                      className="trending-poster"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <HiFilm className="trending-poster-placeholder" size={48} />
                  )}
                  <div className="trending-info">
                    <div className="trending-title-text">{movie.title || movie.name}</div>
                    <div className="trending-meta">
                      <HiStar size={14} style={{ marginRight: 4, verticalAlign: 'middle', display: 'inline-block' }} />
                      {movie.vote_average.toFixed(1)}
                      {(movie.release_date || movie.first_air_date)
                        ? ` · ${(movie.release_date || movie.first_air_date)?.slice(0, 4)}`
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

