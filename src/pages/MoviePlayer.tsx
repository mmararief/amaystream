import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

export default function MoviePlayer() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

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
      <div style={{ marginBottom: 12 }}>
        <Link to={"/"} style={{ textDecoration: "none" }}>
          ← Kembali
        </Link>
      </div>
      <div
        style={{
          aspectRatio: "16/9",
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
          background: "#000",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <iframe
          src={src}
          width="100%"
          height="100%"
          style={{ width: "100%", height: "100%", border: 0, display: "block" }}
          allowFullScreen
        />
      </div>
      <p style={{ color: "#555", fontSize: 12, marginTop: 8 }}>
        Jika pemutar tidak tampil, coba refresh halaman atau gunakan jaringan
        berbeda.
      </p>
    </div>
  );
}
