import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { HiX, HiPlay } from "react-icons/hi";

export default function TVPlayer() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const season = searchParams.get("season") || "1";
  const episode = searchParams.get("episode") || "1";
  const [showNotice, setShowNotice] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Ensure season and episode are valid numbers
  const seasonNum = parseInt(season, 10) || 1;
  const episodeNum = parseInt(episode, 10) || 1;

  // Scroll to top when TV ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, season, episode]);

  useEffect(() => {
    const dismissed = localStorage.getItem("hide_adblock_notice") === "1";
    if (dismissed) setShowNotice(false);
  }, []);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      // Simulate loading time for iframe
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [id, season, episode]);

  // Vidking embed URL for TV shows with all features
  const src = `https://www.vidking.net/embed/tv/${id}/${seasonNum}/${episodeNum}?color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true`;

  if (!id) return <p>TV ID tidak valid.</p>;

  return (
    <div>
      {showNotice && (
        <div className="notice">
          <button
            className="notice-close"
            aria-label="Tutup"
            onClick={() => {
              setShowNotice(false);
              localStorage.setItem("hide_adblock_notice", "1");
            }}
          >
            <HiX size={16} />
          </button>
          <strong>Himbauan:</strong> gunakan ad‑blocker untuk mencegah
          redirect/iklan pada media player. Anda bisa memakai ekstensi seperti{" "}
          <a href="https://ublockorigin.com/" target="_blank" rel="noreferrer">
            uBlock Origin
          </a>
          .
        </div>
      )}
      <div className="player-header">
        <Link to={`/tv/${id}`} className="back-link">
          ← Kembali
        </Link>
        <div className="player-info">
          Season {seasonNum} • Episode {episodeNum}
        </div>
      </div>
      <div className="player-box">
        {isLoading ? (
          <div className="skeleton skeleton-player">
            <div className="skeleton-player-content">
              <HiPlay className="skeleton-player-icon" size={48} />
              <div className="skeleton-player-text">Memuat player...</div>
            </div>
          </div>
        ) : (
          <iframe
            src={src}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            style={{ display: "block", border: "none" }}
          />
        )}
      </div>
      <p className="player-note">
        Jika pemutar tidak tampil, coba refresh halaman atau gunakan jaringan
        berbeda.
      </p>
    </div>
  );
}
