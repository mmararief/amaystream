import { Link } from "react-router-dom";
import { HiFilm } from "react-icons/hi";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-brand">
            <HiFilm className="brand-icon" size={24} />
            <span>AmayStream</span>
          </div>
          <p className="footer-description">
            Platform streaming film gratis dengan kualitas HD. Jelajahi ribuan
            film populer dan terbaru.
          </p>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Navigasi</h3>
          <nav className="footer-links">
            <Link to="/" className="footer-link">
              Beranda
            </Link>
            <Link to="/search" className="footer-link">
              Search
            </Link>
            <Link to="/development" className="footer-link">
              Development
            </Link>
          </nav>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Tentang</h3>
          <nav className="footer-links">
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noreferrer"
              className="footer-link"
            >
              Powered by TMDB
            </a>
            <a
              href="https://developers.google.com/generative-ai"
              target="_blank"
              rel="noreferrer"
              className="footer-link"
            >
              AI by Google Gemini
            </a>
          </nav>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Hak Cipta</h3>
          <p className="footer-copyright">
            © {currentYear} AmayStream. Semua hak dilindungi.
          </p>
          <p className="footer-note">
            Data film disediakan oleh{" "}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noreferrer"
              className="footer-link-inline"
            >
              TMDB
            </a>
            . Konten video disediakan oleh pihak ketiga.
          </p>
        </div>
      </div>
    </footer>
  );
}

