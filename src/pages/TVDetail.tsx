import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { HiPlay, HiSearch, HiDownload, HiClock, HiCalendar, HiStar, HiX } from "react-icons/hi";
import { HiTv } from "react-icons/hi2";
import {
  fetchTVDetail,
  fetchTVCredits,
  fetchSimilarTV,
  fetchTVVideos,
  fetchTVSeasons,
  buildImageUrl,
} from "../services/tmdb";
import { useSEO } from "../hooks/useSEO";

type TVDetail = {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date?: string;
  genres?: { id: number; name: string }[];
  vote_average: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: Array<{ season_number: number; name: string; episode_count: number }>;
};

type Episode = {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date?: string;
  runtime?: number;
};

export default function TVDetailPage() {
  const { id } = useParams<{ id: string }>();
  const tvId = Number(id);
  const [tv, setTV] = useState<TVDetail | null>(null);
  const [cast, setCast] = useState<
    {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[]
  >([]);
  const [similar, setSimilar] = useState<
    { id: number; name: string; poster_path: string | null }[]
  >([]);
  const [videos, setVideos] = useState<
    { key: string; name: string; type: string; site: string }[]
  >([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodeSearch, setEpisodeSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);

  // Scroll to top when TV ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [tvId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!tvId) return;
      setIsLoading(true);
      try {
        const [tvData, creditsData, similarData, videosData] = await Promise.all([
          fetchTVDetail(tvId),
          fetchTVCredits(tvId),
          fetchSimilarTV(tvId),
          fetchTVVideos(tvId),
        ]);

        if (cancelled) return;

        setTV(tvData as TVDetail);
        setCast((creditsData as any).cast || []);
        setSimilar((similarData as any).results || []);
        
        const videoResults = (videosData as any).results || [];
        const youtubeVideos = videoResults.filter(
          (v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
        );
        setVideos(youtubeVideos);
        if (youtubeVideos.length > 0) {
          setSelectedVideo(youtubeVideos[0].key);
        }
      } catch (error) {
        console.error("Failed to load TV show details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [tvId]);

  // Load episodes when season changes
  useEffect(() => {
    if (!tvId || !tv) return;
    let cancelled = false;
    async function loadEpisodes() {
      setIsLoadingEpisodes(true);
      try {
        const seasonData = await fetchTVSeasons(tvId, selectedSeason);
        if (!cancelled) {
          setEpisodes((seasonData as any).episodes || []);
        }
      } catch (error) {
        console.error("Failed to load episodes:", error);
      } finally {
        if (!cancelled) setIsLoadingEpisodes(false);
      }
    }
    loadEpisodes();
    return () => {
      cancelled = true;
    };
  }, [tvId, selectedSeason, tv]);

  const filteredEpisodes = episodes.filter((ep) =>
    ep.name.toLowerCase().includes(episodeSearch.toLowerCase())
  );

  // SEO
  useSEO({
    title: tv ? `${tv.name} | AmayStream` : "TV Show | AmayStream",
    description: tv?.overview || "Streaming TV show gratis di AmayStream",
    keywords: tv ? `${tv.name}, tv show, streaming, nonton tv show` : "tv show",
  });

  if (isLoading) {
    return (
      <div className="detail-page">
        <div className="skeleton skeleton-backdrop"></div>
        <div className="detail-content">
          <div className="skeleton skeleton-poster"></div>
          <div className="skeleton skeleton-info" style={{ flex: 1 }}>
            <div className="skeleton-line" style={{ width: "60%", height: "32px", marginBottom: "16px" }}></div>
            <div className="skeleton-line" style={{ width: "40%", height: "24px", marginBottom: "24px" }}></div>
            <div className="skeleton-line" style={{ width: "100%", height: "16px", marginBottom: "8px" }}></div>
            <div className="skeleton-line" style={{ width: "90%", height: "16px", marginBottom: "8px" }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!tv) {
    return (
      <div className="empty-state">
        <HiTv className="empty-icon" size={48} />
        <p className="empty-text">TV Show tidak ditemukan.</p>
        <Link to="/" className="back-link">
          ← Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const backdropUrl = tv.backdrop_path
    ? buildImageUrl(tv.backdrop_path, "original")
    : null;
  const posterUrl = tv.poster_path ? buildImageUrl(tv.poster_path, "w500") : null;

  return (
    <div className="detail-page">
      {backdropUrl && (
        <div
          className="detail-backdrop"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
      )}
      <div className="detail-grid">
        {posterUrl && (
          <img src={posterUrl} alt={tv.name} className="detail-poster" />
        )}
        <div className="detail-info">
          <h1 className="detail-title">{tv.name}</h1>
          <div className="detail-meta">
            {tv.first_air_date && (
              <span className="detail-meta-item">
                {tv.first_air_date.slice(0, 4)}
              </span>
            )}
            <span className="detail-meta-item">
              <HiStar size={16} style={{ marginRight: 4, verticalAlign: 'middle', display: 'inline-block' }} />
              {tv.vote_average.toFixed(1)}
            </span>
            {tv.number_of_seasons && (
              <span className="detail-meta-item">
                {tv.number_of_seasons} Season{tv.number_of_seasons > 1 ? "s" : ""}
              </span>
            )}
            {tv.number_of_episodes && (
              <span className="detail-meta-item">
                {tv.number_of_episodes} Episodes
              </span>
            )}
          </div>
          {tv.genres && tv.genres.length > 0 && (
            <div className="detail-genres">
              {tv.genres.map((genre) => (
                <span key={genre.id} className="detail-genre-tag">
                  {genre.name}
                </span>
              ))}
            </div>
          )}
          {tv.overview && (
            <p className="detail-overview">{tv.overview}</p>
          )}
          <div className="detail-actions">
            <Link
              to={`/tv/${tv.id}/watch`}
              className="detail-btn detail-btn-primary"
            >
              <HiPlay className="detail-btn-icon" />
              Tonton Sekarang
            </Link>
            <Link
              to="#episodes"
              className="detail-btn detail-btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("episodes")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Episodes
            </Link>
            {similar.length > 0 && (
              <Link
                to="#similars"
                className="detail-btn detail-btn-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("similars")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Similars
              </Link>
            )}
          </div>
        </div>
      </div>

      {videos.length > 0 && (
        <section className="detail-section">
          <h2 className="section-title">Trailer & Video</h2>
          <div className="video-wrapper">
            {selectedVideo && (
              <div className="video-container">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo}`}
                  title="Video Player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="video-player"
                />
              </div>
            )}
            <div className="video-list">
              {videos.map((video) => (
                <button
                  key={video.key}
                  onClick={() => setSelectedVideo(video.key)}
                  className={`video-item ${
                    selectedVideo === video.key ? "active" : ""
                  }`}
                >
                  <HiPlay className="video-play-icon" />
                  <span className="video-name">{video.name}</span>
                  {video.type === "Trailer" && (
                    <span className="video-badge">TRAILER</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {cast.length > 0 && (
        <section className="detail-section">
          <h2 className="section-title">Cast</h2>
          <div className="cast-grid">
            {cast.slice(0, 12).map((person) => (
              <div key={person.id} className="cast-item">
                {person.profile_path ? (
                  <img
                    src={buildImageUrl(person.profile_path, "w185")}
                    alt={person.name}
                    className="cast-photo"
                  />
                ) : (
                  <div className="cast-photo-placeholder">👤</div>
                )}
                <div className="cast-name">{person.name}</div>
                <div className="cast-character">{person.character}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tv.seasons && tv.seasons.length > 0 && (
        <section id="episodes" className="detail-section episodes-section">
          <div className="episodes-header">
            <div className="episodes-title-wrapper">
              <div className="episodes-title-bar"></div>
              <h2 className="episodes-title">Episodes</h2>
            </div>
            <div className="episodes-controls">
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                className="episodes-season-select"
              >
                {tv.seasons
                  .filter((s) => s.season_number > 0)
                  .map((season) => (
                    <option key={season.season_number} value={season.season_number}>
                      Season {season.season_number} ({season.episode_count} episodes)
                    </option>
                  ))}
              </select>
              <div className="episodes-search-wrapper">
                <HiSearch className="episodes-search-icon" size={16} />
                <input
                  type="text"
                  placeholder="Search episode..."
                  value={episodeSearch}
                  onChange={(e) => setEpisodeSearch(e.target.value)}
                  className="episodes-search-input"
                />
                {episodeSearch && (
                  <button
                    onClick={() => setEpisodeSearch("")}
                    className="episodes-search-clear"
                  >
                    <HiX size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
          {isLoadingEpisodes ? (
            <div className="episodes-loading">Memuat episodes...</div>
          ) : filteredEpisodes.length === 0 ? (
            <div className="episodes-empty">
              {episodeSearch ? "Tidak ada episode ditemukan" : "Tidak ada episode"}
            </div>
          ) : (
            <div className="episodes-list">
              {filteredEpisodes.map((episode) => (
                <Link
                  key={episode.id}
                  to={`/tv/${tv.id}/watch?season=${selectedSeason}&episode=${episode.episode_number}`}
                  className="episode-card"
                >
                  <div className="episode-thumbnail">
                    {episode.still_path ? (
                      <img
                        src={buildImageUrl(episode.still_path, "w500")}
                        alt={episode.name}
                        className="episode-image"
                      />
                    ) : (
                      <HiTv className="episode-image-placeholder" size={48} />
                    )}
                    <div className="episode-play-overlay">
                      <HiPlay size={48} color="white" />
                    </div>
                  </div>
                  <div className="episode-info">
                    <div className="episode-header">
                      <span className="episode-number">{episode.episode_number}</span>
                      <h3 className="episode-title">{episode.name}</h3>
                    </div>
                    {episode.overview && (
                      <p className="episode-description">{episode.overview}</p>
                    )}
                    {episode.air_date && (
                      <div className="episode-meta">
                        <span className="episode-date"><HiCalendar size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />{episode.air_date}</span>
                        {episode.runtime && (
                          <span className="episode-runtime"><HiClock size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />{episode.runtime}m</span>
                        )}
                      </div>
                    )}
                  </div>
                  <button className="episode-download" aria-label="Download">
                    <HiDownload size={20} />
                  </button>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {similar.length > 0 && (
        <section id="similars" className="detail-section">
          <h2 className="section-title">Similar TV Shows</h2>
          <div className="similar-grid">
            {similar.slice(0, 12).map((item) => (
              <Link
                key={item.id}
                to={`/tv/${item.id}`}
                className="similar-card"
              >
                {item.poster_path ? (
                  <img
                    src={buildImageUrl(item.poster_path, "w342")}
                    alt={item.name}
                    className="similar-poster"
                  />
                ) : (
                  <HiTv className="similar-poster-placeholder" size={48} />
                )}
                <div className="similar-title">{item.name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

