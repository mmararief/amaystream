import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function MoviePlayer() {
  const { id } = useParams<{ id: string }>();
  const [showNotice, setShowNotice] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem("hide_adblock_notice") === "1";
    if (dismissed) setShowNotice(false);
  }, []);

  const src = `https://xprime.tv/watch/${id}`;

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
            ✕
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
        <iframe
          src={src}
          width="100%"
          height="100%"
          style={{ width: "100%", height: "100%", border: 0, display: "block" }}
          allowFullScreen
        />
      </div>
      <p className="player-note">
        Jika pemutar tidak tampil, coba refresh halaman atau gunakan jaringan
        berbeda.
      </p>
    </div>
  );
}
