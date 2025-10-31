import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import { buildImageUrl } from "../services/tmdb";

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  release_date?: string;
};

export default function BannerCarousel({
  movies,
  tagline,
}: {
  movies: Movie[];
  tagline?: string;
}) {
  if (!movies?.length) return null;
  return (
    <section className="banner fade-in">
      {tagline ? <div className="tagline">{tagline}</div> : null}
      <Swiper
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        spaceBetween={0}
        centeredSlides={false}
        loop
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        style={{}}
      >
        {movies.map((t) => (
          <SwiperSlide key={t.id}>
            <Link to={`/movie/${t.id}`} style={{ textDecoration: "none" }}>
              <div
                className="banner-card"
                style={{ minWidth: "unset", maxWidth: "unset", width: "100%" }}
              >
                {t.poster_path ? (
                  <img
                    className="banner-bg"
                    src={buildImageUrl(
                      t.backdrop_path || t.poster_path,
                      "w780"
                    )}
                    alt={t.title}
                  />
                ) : null}
                <div className="banner-grad" />
                <div className="banner-body">
                  <div className="banner-title">{t.title}</div>
                  <div className="banner-meta">
                    ⭐ {t.vote_average.toFixed(1)}{" "}
                    {t.release_date ? `· ${t.release_date.slice(0, 4)}` : ""}
                  </div>
                  <div className="banner-actions">
                    <Link
                      to={`/movie/${t.id}/watch?autoPlay=true`}
                      className="btn-primary"
                    >
                      Tonton ▶
                    </Link>
                    <Link to={`/movie/${t.id}`} className="btn-ghost">
                      Detail
                    </Link>
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
