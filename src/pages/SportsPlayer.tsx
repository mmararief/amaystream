import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  streamedApi,
  type StreamedStream,
  type StreamedMatchSourceRef,
} from "../services/streamed";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "api-sports-widget": any;
    }
  }
}

export default function SportsPlayer() {
  const { source, id } = useParams<{ source: string; id: string }>();
  const [searchParams] = useSearchParams();
  const title = searchParams.get("title") ?? "Live Stream";
  const [streams, setStreams] = useState<StreamedStream[]>([]);
  const [altSources, setAltSources] = useState<StreamedMatchSourceRef[]>([]);
  const [matchInfo, setMatchInfo] = useState<{
    title: string;
    teams?: any;
    date?: number;
    category?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [gameIdFromSource, setGameIdFromSource] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!source || !id) return;
    setLoading(true);
    (async () => {
      try {
        const data = await streamedApi.getStreams(source, id);
        if (!isMounted) return;
        setStreams(data);
        setSelectedIdx(0);
        setError(null);
        // parse alternative sources & match info from query params
        const encoded = searchParams.get("sources");
        if (encoded) {
          try {
            const decodedStr = decodeURIComponent(escape(atob(encoded)));
            const decoded = JSON.parse(decodedStr) as StreamedMatchSourceRef[];
            if (Array.isArray(decoded)) setAltSources(decoded);
          } catch {}
        } else {
          setAltSources([]);
        }
        const matchEncoded = searchParams.get("match");
        if (matchEncoded) {
          try {
            const miStr = decodeURIComponent(escape(atob(matchEncoded)));
            const mi = JSON.parse(miStr);
            setMatchInfo(mi);
          } catch {}
        } else {
          setMatchInfo({ title });
        }
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message ?? "Failed to load streams");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [source, id]);

  const current = useMemo(() => streams[selectedIdx], [streams, selectedIdx]);

  // Load API-SPORTS v3 script (module) and render config+game widget
  useEffect(() => {
    if (matchInfo?.category?.toLowerCase() !== "football") return;
    if (!gameIdFromSource) return;
    const src = "https://widgets.api-sports.io/3.1.0/widgets.js";
    const container = document.getElementById("apisports-container");
    if (!container) return;
    const renderWidgets = () => {
      const key = (import.meta as any).env?.VITE_APISPORTS_KEY || "";
      container.innerHTML = "";
      const cfg = document.createElement("api-sports-widget" as any);
      cfg.setAttribute("data-type", "config");
      cfg.setAttribute("data-key", key);
      cfg.setAttribute("data-sport", "football");
      cfg.setAttribute("data-theme", "dark");
      cfg.setAttribute("data-lang", "en");
      cfg.setAttribute("data-show-errors", "true");
      const game = document.createElement("api-sports-widget" as any);
      game.setAttribute("data-type", "game");
      game.setAttribute("data-game-id", String(gameIdFromSource));
      container.appendChild(cfg);
      container.appendChild(game);
    };
    const existing = document.querySelector(
      `script[src='${src}']`
    ) as HTMLScriptElement | null;
    if (existing) {
      renderWidgets();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.type = "module";
    s.async = true;
    s.addEventListener("load", renderWidgets, { once: true });
    document.body.appendChild(s);
  }, [matchInfo?.category, gameIdFromSource]);

  useEffect(() => {
    // Parse numeric game id from route param (e.g., ...-1376557)
    const routeId = id || "";
    const m = routeId.match(/(\d+)$/);
    if (m) {
      console.log("[API-SPORTS] gameId from route:", m[1]);
      setGameIdFromSource(m[1]);
    } else {
      console.log("[API-SPORTS] gameId not found in route id:", routeId);
    }
  }, [id]);

  return (
    <div className="container">
      <div
        className="player-header"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04), transparent)",
          borderRadius: 12,
          padding: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>{title}</h2>
        <Link to="/sports" className="back-link">
          Kembali
        </Link>
      </div>

      {loading && <p className="empty-hint">Loading…</p>}
      {error && (
        <p className="empty-hint" style={{ color: "#fca5a5" }}>
          {error}
        </p>
      )}
      {!loading && !error && streams.length === 0 && (
        <p className="empty-hint">Tidak ada stream tersedia.</p>
      )}
      {!loading && !error && current && (
        <div className="player-grid">
          <div>
            {matchInfo && (
              <div className="player-match">
                <div className="player-team">
                  <div className="team-badge-lg">
                    {matchInfo.teams?.home?.badge ? (
                      <img
                        src={`https://streamed.pk/api/images/badge/${matchInfo.teams.home.badge}.webp`}
                        alt={matchInfo.teams?.home?.name}
                      />
                    ) : null}
                  </div>
                  <strong>{matchInfo.teams?.home?.name ?? "Home"}</strong>
                </div>
                <div className="player-vs">VS</div>
                <div className="player-team right">
                  <strong>{matchInfo.teams?.away?.name ?? "Away"}</strong>
                  <div className="team-badge-lg">
                    {matchInfo.teams?.away?.badge ? (
                      <img
                        src={`https://streamed.pk/api/images/badge/${matchInfo.teams.away.badge}.webp`}
                        alt={matchInfo.teams?.away?.name}
                      />
                    ) : null}
                  </div>
                </div>
                <div className="player-meta">
                  <span>
                    {new Date(matchInfo.date ?? Date.now()).toLocaleString()}
                  </span>
                  <span style={{ textTransform: "capitalize" }}>
                    {matchInfo.category ?? ""}
                  </span>
                </div>
              </div>
            )}
            {/* Source selector */}
            {altSources.length > 0 && (
              <div
                className="player-controls source-scroll"
                style={{ marginBottom: 4 }}
              >
                {altSources.map((s) => (
                  <Link
                    key={`altsrc-${s.source}-${s.id}`}
                    className={`pill ${s.source === source ? "active" : ""}`}
                    to={`/sports/${encodeURIComponent(
                      s.source
                    )}/${encodeURIComponent(
                      s.id
                    )}/watch?title=${encodeURIComponent(
                      title
                    )}&sources=${encodeURIComponent(
                      searchParams.get("sources") || ""
                    )}`}
                  >
                    {s.source}
                  </Link>
                ))}
              </div>
            )}
            <div className="player-box">
              <iframe title={title} src={current.embedUrl} allowFullScreen />
            </div>
            <div className="player-controls">
              {streams.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedIdx(idx)}
                  className={`pill ${idx === selectedIdx ? "active" : ""}`}
                >
                  #{s.streamNo} • {s.language} {s.hd ? "(HD)" : "(SD)"}
                </button>
              ))}
            </div>
            <p className="player-note">
              Jika stream tidak muncul, pilih stream lain di atas.
            </p>
          </div>

          {matchInfo?.category?.toLowerCase() === "football" && (
            <div className="panel match-center">
              <div className="panel-header">
                <h3 className="panel-title">Match Center</h3>
                <span className="panel-sub">Powered by API-SPORTS</span>
              </div>
              <div id="apisports-container" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
