import { Link } from "react-router-dom";

export default function Development() {
  return (
    <div className="development-page">
      <div className="dev-header">
        <h1 className="dev-title">🚀 Development</h1>
        <p className="dev-subtitle">
          Informasi teknologi, fitur, dan pengembang AmayStream
        </p>
      </div>

      {/* Developer Info */}
      <section className="dev-section">
        <h2 className="dev-section-title">👨‍💻 Developer</h2>
        <div className="dev-card">
          <div className="dev-name">Muhammad Ammar Arief</div>
          <div className="dev-links">
            <a
              href="https://instagram.com/mmararief"
              target="_blank"
              rel="noreferrer"
              className="dev-link"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </a>
            <a
              href="https://github.com/mmararief"
              target="_blank"
              rel="noreferrer"
              className="dev-link"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="dev-section">
        <h2 className="dev-section-title">🛠️ Teknologi yang Digunakan</h2>
        <div className="tech-grid">
          <div className="tech-card">
            <div className="tech-icon">⚛️</div>
            <div className="tech-name">React 19</div>
            <div className="tech-desc">UI Framework modern dengan hooks</div>
          </div>
          <div className="tech-card">
            <div className="tech-icon">⚡</div>
            <div className="tech-name">Vite</div>
            <div className="tech-desc">Build tool cepat & HMR</div>
          </div>
          <div className="tech-card">
            <div className="tech-icon">📘</div>
            <div className="tech-name">TypeScript</div>
            <div className="tech-desc">Type safety & developer experience</div>
          </div>
          <div className="tech-card">
            <div className="tech-icon">🔄</div>
            <div className="tech-name">React Router</div>
            <div className="tech-desc">SPA navigation & routing</div>
          </div>
          <div className="tech-card">
            <div className="tech-icon">🎬</div>
            <div className="tech-name">TMDB API</div>
            <div className="tech-desc">Database film & metadata</div>
          </div>
          <div className="tech-card">
            <div className="tech-icon">🤖</div>
            <div className="tech-name">Google Gemini AI</div>
            <div className="tech-desc">AI Search dengan deskripsi</div>
          </div>
          <div className="tech-card">
            <div className="tech-icon">🎥</div>
            <div className="tech-name">Vidking Player</div>
            <div className="tech-desc">Video player embed</div>
          </div>
          <div className="tech-card">
            <div className="tech-icon">🎨</div>
            <div className="tech-name">Swiper</div>
            <div className="tech-desc">Carousel & banner slider</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="dev-section">
        <h2 className="dev-section-title">✨ Fitur</h2>
        <div className="features-list">
          <div className="feature-item">
            <span className="feature-icon">🤖</span>
            <div>
              <strong>AI Search</strong>
              <p>Cari film berdasarkan deskripsi menggunakan Google Gemini AI dengan template pertanyaan</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎬</span>
            <div>
              <strong>Trending Movies</strong>
              <p>Banner carousel untuk film trending hari ini</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔍</span>
            <div>
              <strong>Pencarian Film</strong>
              <p>Search tradisional berdasarkan judul dengan infinite scroll</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <div>
              <strong>Filter & Sorting</strong>
              <p>Filter berdasarkan genre, tahun, dan rating minimum</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎥</span>
            <div>
              <strong>Video Player</strong>
              <p>Player responsif dengan Vidking embed, support mobile</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📱</span>
            <div>
              <strong>Responsive Design</strong>
              <p>Optimized untuk desktop, tablet, dan mobile</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <div>
              <strong>Performance</strong>
              <p>Lazy loading, image optimization, dan skeleton loading</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔗</span>
            <div>
              <strong>SEO Optimized</strong>
              <p>Dynamic meta tags, Open Graph, dan structured data</p>
            </div>
          </div>
        </div>
      </section>

      {/* API & Services */}
      <section className="dev-section">
        <h2 className="dev-section-title">🔌 API & Services</h2>
        <div className="api-list">
          <div className="api-item">
            <strong>TMDB API v3</strong>
            <p>Popular movies, search, detail, credits, similar movies, trending</p>
            <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" className="api-link">
              Visit TMDB →
            </a>
          </div>
          <div className="api-item">
            <strong>Google Gemini AI</strong>
            <p>Natural language movie search and recommendations</p>
            <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noreferrer" className="api-link">
              Get API Key →
            </a>
          </div>
          <div className="api-item">
            <strong>Vidking</strong>
            <p>Video streaming embed player</p>
            <a href="https://www.vidking.net/" target="_blank" rel="noreferrer" className="api-link">
              Visit Vidking →
            </a>
          </div>
        </div>
      </section>

      {/* Project Info */}
      <section className="dev-section">
        <h2 className="dev-section-title">📋 Project Info</h2>
        <div className="info-card">
          <div className="info-row">
            <span className="info-label">Version</span>
            <span className="info-value">1.0.0</span>
          </div>
          <div className="info-row">
            <span className="info-label">License</span>
            <span className="info-value">Private</span>
          </div>
          <div className="info-row">
            <span className="info-label">Deployment</span>
            <span className="info-value">Vercel</span>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <div className="dev-footer">
        <Link to="/" className="dev-back-link">
          ← Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
