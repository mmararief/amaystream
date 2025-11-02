import { Outlet, Link, useLocation } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { HiHome, HiSearch, HiCode, HiFilm, HiMenu, HiX } from "react-icons/hi";
import AIBottomSearch from "./components/AIBottomSearch";
import type { AIBottomSearchHandle } from "./components/AIBottomSearch";
import Footer from "./components/Footer";
import { AISearchProvider } from "./contexts/AISearchContext";

function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="brand">
            <HiFilm className="brand-icon" size={24} />
            <span>AmayStream</span>
          </Link>
          <nav className="nav-links">
            <Link
              to="/"
              className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
            >
              <HiHome size={18} />
              Beranda
            </Link>
            <Link
              to="/search"
              className={`nav-link ${
                location.pathname === "/search" ? "active" : ""
              }`}
            >
              <HiSearch size={18} />
              Search
            </Link>
            <Link
              to="/development"
              className={`nav-link ${
                location.pathname === "/development" ? "active" : ""
              }`}
            >
              <HiCode size={18} />
              Dev
            </Link>
          </nav>
          <button
            className="mobile-menu-toggle"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMenu} />
      )}

      {/* Mobile Menu */}
      <nav className={`mobile-menu ${isMenuOpen ? "mobile-menu-open" : ""}`}>
        <div className="mobile-menu-header">
          <Link to="/" className="brand" onClick={closeMenu}>
            <HiFilm className="brand-icon" size={24} />
            <span>AmayStream</span>
          </Link>
          <button
            className="mobile-menu-close"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <HiX size={24} />
          </button>
        </div>
        <div className="mobile-menu-links">
          <Link
            to="/"
            className={`mobile-nav-link ${location.pathname === "/" ? "active" : ""}`}
            onClick={closeMenu}
          >
            <HiHome size={20} />
            <span>Beranda</span>
          </Link>
          <Link
            to="/search"
            className={`mobile-nav-link ${
              location.pathname === "/search" ? "active" : ""
            }`}
            onClick={closeMenu}
          >
            <HiSearch size={20} />
            <span>Search</span>
          </Link>
          <Link
            to="/development"
            className={`mobile-nav-link ${
              location.pathname === "/development" ? "active" : ""
            }`}
            onClick={closeMenu}
          >
            <HiCode size={20} />
            <span>Dev</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

export default function App() {
  const aiSearchRef = useRef<AIBottomSearchHandle>(null);

  const openAISearch = () => {
    aiSearchRef.current?.openAndFocus();
  };

  return (
    <AISearchProvider openAISearch={openAISearch}>
      <div className="app-wrap">
        <Navbar />
        <main className="main">
          <Outlet />
        </main>
        <Footer />
        <AIBottomSearch ref={aiSearchRef} />
      </div>
    </AISearchProvider>
  );
}
