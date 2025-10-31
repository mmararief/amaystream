export default function Development() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1 style={{ margin: 0, fontSize: 28, color: "#e5e7eb" }}>Development</h1>
      <p style={{ color: "#9ca3af", marginTop: 6 }}>
        Informasi developer dan kontak.
      </p>

      <div
        style={{
          marginTop: 18,
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          padding: 18,
          background:
            "linear-gradient(180deg, rgba(17,24,39,0.85), rgba(17,24,39,0.7))",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 22, color: "#e5e7eb" }}>
          Muhammad Ammar Arief
        </div>
        <div
          style={{ marginTop: 8, display: "flex", gap: 14, flexWrap: "wrap" }}
        >
          <a
            href="https://instagram.com/mmararief"
            target="_blank"
            rel="noreferrer"
            style={linkStyle}
          >
            Instagram @mmararief
          </a>
          <a
            href="https://github.com/mmararief"
            target="_blank"
            rel="noreferrer"
            style={linkStyle}
          >
            GitHub @mmararief
          </a>
        </div>
      </div>

      <section style={{ marginTop: 22 }}>
        <h2 style={{ margin: "0 0 10px 0", color: "#e5e7eb", fontSize: 20 }}>
          Teknologi yang digunakan
        </h2>
        <ul style={ulStyle}>
          <li>
            <b>React + Vite</b> – kerangka UI dan dev server cepat
          </li>
          <li>
            <b>TypeScript</b> – type-safety
          </li>
          <li>
            <b>React Router</b> – navigasi SPA
          </li>
          <li>
            <b>TMDB API v3</b> – data film (popular, search, detail, credits,
            similar, trending)
          </li>
          <li>
            <b>Swiper</b> – carousel banner trending (autoplay, pagination)
          </li>
          <li>
            <b>CSS</b> – tema gelap, animasi fade/hover, skeleton shimmer
          </li>
          <li>
            <b>Env</b> – <code>VITE_TMDB_API_KEY</code> di .env
          </li>
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ margin: "0 0 10px 0", color: "#e5e7eb", fontSize: 20 }}>
          Masih tahap development
        </h2>
        <ul style={ulStyle}>
          <li>Penyempurnaan banner (controls, sinopsis, parallax)</li>
          <li>Filter/penyortiran (genre, tahun, rating)</li>
          <li>Penanganan error/loading yang lebih kaya</li>
          <li>Infinite scroll/pagination lebih mulus</li>
          <li>Optimasi gambar (ukuran dinamis, lazy loading lanjutan)</li>
          <li>PWA/SEO dasar dan analytics</li>
        </ul>
      </section>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  color: "#22d3ee",
  textDecoration: "none",
  border: "1px solid rgba(34,211,238,0.35)",
  padding: "8px 12px",
  borderRadius: 10,
};

const ulStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: 18,
  color: "#cbd5e1",
  lineHeight: 1.8,
};
