import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useEffect, useState, useRef } from "react";
import { buildImageUrl, fetchMovieDetail } from "../services/tmdb";

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  release_date?: string;
};

type MovieWithDetails = Movie & {
  overview?: string;
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
              const detail = (await fetchMovieDetail(movie.id)) as {
                overview?: string;
              };
              return { ...movie, overview: detail.overview };
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
              to={`/movie/${t.id}`}
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
                      "w780"
                    )}
                    alt={t.title}
                    data-parallax="true"
                  />
                ) : (
                  <div className="banner-bg-placeholder" />
                )}
                <div className="banner-grad" />
                <div className="banner-body">
                  <div className="banner-title">{t.title}</div>
                  <div className="banner-meta">
                    ⭐ {t.vote_average.toFixed(1)}{" "}
                    {t.release_date ? `· ${t.release_date.slice(0, 4)}` : ""}
                  </div>
                  {t.overview && (
                    <div className="banner-overview">
                      {t.overview.length > 150
                        ? `${t.overview.slice(0, 150)}...`
                        : t.overview}
                    </div>
                  )}
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
