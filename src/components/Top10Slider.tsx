import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { HiFilm } from "react-icons/hi";
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

export default function Top10Slider({ movies }: { movies: Movie[] }) {
  if (!movies || movies.length === 0) return null;

  return (
    <section className="top-10-section">
      <div className="top-10-header">
        <div className="top-10-title-wrapper">
          <h3 className="top-10-large-text">
            <span className="top-10-letter">T</span>
            <span className="top-10-letter">O</span>
            <span className="top-10-letter">P</span>
            <span className="top-10-letter">1</span>
            <span className="top-10-letter">0</span>
          </h3>
          <div className="top-10-subtitle">
            <h3 className="top-10-subtitle-line">CONTENT</h3>
            <h3 className="top-10-subtitle-line">TODAY</h3>
          </div>
        </div>
      </div>
      <div className="top-10-slider-container">
        <Swiper
          modules={[Navigation]}
          slidesPerView="auto"
          spaceBetween={8}
          navigation={true}
          className="top-10-swiper"
        >
          {movies.slice(0, 10).map((movie, index) => (
            <SwiperSlide key={movie.id} className="top-10-slide">
              <Link
                to={movie.media_type === 'tv' ? `/tv/${movie.id}` : `/movie/${movie.id}`}
                className="top-10-card-link"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="top-10-card-slider">
                  <p className="top-10-number-large">
                    <span className="top-10-number-text">
                      {index + 1 === 10 ? (
                        <>
                          <span>1</span>
                          <span className="top-10-number-overlap">0</span>
                        </>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </span>
                  </p>
                  {movie.poster_path ? (
                    <img
                      src={buildImageUrl(movie.poster_path, "w185")}
                      alt={movie.title || movie.name || 'Poster'}
                      className="top-10-poster-slider"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <HiFilm className="top-10-poster-placeholder-slider" size={48} />
                  )}
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

