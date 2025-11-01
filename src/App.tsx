import { Outlet, Link, useLocation } from "react-router-dom";
import { useRef } from "react";
import AIBottomSearch from "./components/AIBottomSearch";
import type { AIBottomSearchHandle } from "./components/AIBottomSearch";
import { AISearchProvider } from "./contexts/AISearchContext";

function Navbar() {
  const location = useLocation();

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link to="/" className="brand">
          <span className="brand-icon">🎬</span>
          <span>AmayStream</span>
        </Link>
        <nav className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path
                d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
            Beranda
          </Link>
          <Link
            to="/development"
            className={`nav-link ${
              location.pathname === "/development" ? "active" : ""
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path
                d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
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
        <AIBottomSearch ref={aiSearchRef} />
      </div>
    </AISearchProvider>
  );
}
