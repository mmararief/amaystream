import { Outlet, Link } from "react-router-dom";
import AIBottomSearch from "./components/AIBottomSearch";

export default function App() {
  return (
    <div className="app-wrap">
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="brand" style={{ fontSize: 22 }}>
            AmayStream
          </Link>
          <nav style={{ marginLeft: "auto" }}>
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#9ca3af", textDecoration: "none" }}
            >
              TMDB
            </a>
            <Link
              to="/development"
              style={{
                marginLeft: 16,
                color: "#9ca3af",
                textDecoration: "none",
              }}
            >
              Development
            </Link>
          </nav>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <AIBottomSearch />
    </div>
  );
}
