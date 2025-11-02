import { Outlet, Link, useLocation } from "react-router-dom";
import { useRef } from "react";
import { HiHome, HiSearch, HiCode, HiFilm } from "react-icons/hi";
import AIBottomSearch from "./components/AIBottomSearch";
import type { AIBottomSearchHandle } from "./components/AIBottomSearch";
import Footer from "./components/Footer";
import { AISearchProvider } from "./contexts/AISearchContext";

function Navbar() {
  const location = useLocation();

  return (
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
      </div>
    </header>
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
