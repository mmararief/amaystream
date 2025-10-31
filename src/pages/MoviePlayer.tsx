import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

export default function MoviePlayer() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showNotice, setShowNotice] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem("hide_adblock_notice") === "1";
    if (dismissed) setShowNotice(false);
  }, []);

  const src = useMemo(() => {
    const base = `https://www.vidking.net/embed/movie/${id}`;
    const params = new URLSearchParams();
    const color = searchParams.get("color");
    const autoPlay = searchParams.get("autoPlay");
    if (color) params.set("color", color);
    if (autoPlay) params.set("autoPlay", autoPlay);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }, [id, searchParams]);

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
        <div className="player-controls">
          <button
            className={`pill ${
              searchParams.get("autoPlay") === "true" ? "active" : ""
            }`}
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              const cur = next.get("autoPlay") === "true";
              if (cur) next.delete("autoPlay");
              else next.set("autoPlay", "true");
              setSearchParams(next);
            }}
          >
            AutoPlay
          </button>
          <span style={{ fontSize: 12, color: "#6b7280" }}>Warna:</span>
          {[
            { key: "e50914", label: "Merah" },
            { key: "22d3ee", label: "Cyan" },
            { key: "10b981", label: "Hijau" },
          ].map((c) => (
            <button
              key={c.key}
              className={`pill ${
                searchParams.get("color") === c.key ? "active" : ""
              }`}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                if (next.get("color") === c.key) next.delete("color");
                else next.set("color", c.key);
                setSearchParams(next);
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
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
