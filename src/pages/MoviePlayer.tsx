import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { HiX, HiPlay } from "react-icons/hi";

export default function MoviePlayer() {
  const { id } = useParams<{ id: string }>();
  const [showNotice, setShowNotice] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Scroll to top when movie ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

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
  }, [id]);

  const src = `https://www.vidking.net/embed/movie/${id}?color=9146ff&autoPlay=true`;

  if (!id) return <p>TMDB id tidak valid.</p>;

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
        <Link to="/" className="back-link">
          ← Kembali
        </Link>
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
