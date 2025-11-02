import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, Pagination } from "swiper/modules";
import { HiStar, HiCalendar, HiClock, HiPlay, HiInformationCircle } from "react-icons/hi";
import "swiper/css";
import "swiper/css/pagination";
import { useEffect, useState, useRef } from "react";
import { buildImageUrl, fetchMovieDetail } from "../services/tmdb";

type Movie = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: "movie" | "tv";
};

type MovieWithDetails = Movie & {
  overview?: string;
  genres?: { id: number; name: string }[];
  runtime?: number;
  episode_run_time?: number[];
};

export default function BannerCarousel({
  movies,
  tagline,
}: {
  movies: Movie[];
  tagline?: string;
}) {
  const [moviesWithDetails, setMoviesWithDetails] = useState<
    MovieWithDetails[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    async function loadDetails() {
      setIsLoading(true);
      try {
        const details = await Promise.all(
          movies.map(async (movie) => {
            try {
              // Use appropriate API based on media_type
              const isTV = movie.media_type === 'tv';
              let detail: any;
              
              if (isTV) {
                const apiKey = import.meta.env.VITE_TMDB_API_KEY;
                const response = await fetch(
                  `https://api.themoviedb.org/3/tv/${movie.id}?api_key=${apiKey}`
                );
                detail = await response.json();
              } else {
                detail = (await fetchMovieDetail(movie.id)) as {
                  overview?: string;
                  genres?: { id: number; name: string }[];
                  runtime?: number;
                };
              }
              
              return {
                ...movie,
                overview: detail.overview,
                genres: detail.genres,
                runtime: detail.runtime || (detail.episode_run_time && detail.episode_run_time[0]),
                episode_run_time: detail.episode_run_time,
              };
            } catch {
              return movie;
            }
          })
        );
        setMoviesWithDetails(details);
      } catch (error) {
        console.error("Failed to load movie details:", error);
        setMoviesWithDetails(movies);
      } finally {
        setIsLoading(false);
      }
    }
    if (movies.length > 0) {
      loadDetails();
    }
  }, [movies]);

  if (!movies?.length || isLoading) return null;

  return (
    <section className="banner fade-in">
      {tagline ? <div className="tagline">{tagline}</div> : null}
      <Swiper
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        spaceBetween={0}
        centeredSlides={false}
        loop
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{ clickable: true, dynamicBullets: true }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        style={{}}
      >
        {moviesWithDetails.map((t) => (
          <SwiperSlide key={t.id}>
            <Link
              to={t.media_type === 'tv' ? `/tv/${t.id}` : `/movie/${t.id}`}
              style={{
                textDecoration: "none",
                display: "block",
                height: "100%",
              }}
            >
              <div className="banner-card">
                {t.backdrop_path || t.poster_path ? (
                  <img
                    className="banner-bg"
                    src={buildImageUrl(
                      t.backdrop_path || t.poster_path || "",
                      "original"
                    )}
                    alt={t.title || t.name || 'Banner'}
                    data-parallax="true"
                  />
                ) : (
                  <div className="banner-bg-placeholder" />
                )}
                <div className="banner-grad" />
                <div className="banner-body">
                  <div className="banner-title">{(t.title || t.name || '').toUpperCase()}</div>
                  <div className="banner-meta">
                    <span className="banner-rating">
                      <HiStar size={16} style={{ marginRight: 4, verticalAlign: 'middle', display: 'inline-block' }} />
                      {t.vote_average.toFixed(1)}
                    </span>
                    {(t.release_date || t.first_air_date) && (
                      <span className="banner-year">
                        <HiCalendar size={16} style={{ marginRight: 4, verticalAlign: 'middle', display: 'inline-block' }} />
                        {(t.release_date || t.first_air_date)?.slice(0, 4)}
                      </span>
                    )}
                    {(t.runtime || (t.episode_run_time && t.episode_run_time[0])) && (
                      <span className="banner-runtime">
                        <HiClock size={16} style={{ marginRight: 4, verticalAlign: 'middle', display: 'inline-block' }} />
                        {(t.runtime || t.episode_run_time?.[0] || 0)}m
                      </span>
                    )}
                  </div>
                  {t.genres && t.genres.length > 0 && (
                    <div className="banner-genres">
                      {t.genres.slice(0, 3).map((genre) => (
                        <span key={genre.id} className="banner-genre-tag">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {t.overview && (
                    <div className="banner-overview">
                      {t.overview.length > 200
                        ? `${t.overview.slice(0, 200)}...`
                        : t.overview}
                    </div>
                  )}
                  <div className="banner-actions">
                    <Link
                      to={t.media_type === 'tv' ? `/tv/${t.id}/watch` : `/movie/${t.id}/watch`}
                      className="banner-btn banner-btn-play"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <HiPlay className="banner-btn-icon" />
                      Tonton
                    </Link>
                    <Link
                      to={t.media_type === 'tv' ? `/tv/${t.id}` : `/movie/${t.id}`}
                      className="banner-btn banner-btn-info"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <HiInformationCircle className="banner-btn-icon" />
                      Info
                    </Link>
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      <button
        className="banner-nav-prev"
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="Previous slide"
      />
      <button
        className="banner-nav-next"
        onClick={() => swiperRef.current?.slideNext()}
        aria-label="Next slide"
      />
    </section>
  );
}
