import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  streamedApi,
  type StreamedMatch,
  getBadgeUrl,
  getPosterUrlFromPosterPath,
} from "../services/streamed";

export default function SportsLive() {
  const [matches, setMatches] = useState<StreamedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [sports, setSports] = useState<{ id: string; name: string }[]>([]);
  const [range, setRange] = useState<"live" | "today" | "all">("live");
  const [query, setQuery] = useState<string>("");

  const toBase64 = (obj: unknown) => {
    try {
      const json = JSON.stringify(obj);
      return btoa(unescape(encodeURIComponent(json)));
    } catch {
      return "";
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [live, allSports] = await Promise.all([
          streamedApi.getLiveMatches(),
          streamedApi.getSports(),
        ]);
        if (!isMounted) return;
        setMatches(live);
        setSports(allSports);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message ?? "Failed to load live matches");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    (async () => {
      try {
        let data: StreamedMatch[];
        if (selectedSport) {
          data = await streamedApi.getMatchesBySport(selectedSport);
        } else {
          if (range === "today") {
            data = await streamedApi.getTodayMatches();
          } else if (range === "all") {
            data = await streamedApi.getAllMatches();
          } else {
            data = await streamedApi.getLiveMatches();
          }
        }
        // Client-side date narrowing for Today to avoid timezone mismatches
        if (range === "today") {
          const todayStr = new Date().toDateString();
          data = data.filter(
            (m) => new Date(m.date).toDateString() === todayStr
          );
        }
        if (!isMounted) return;
        setMatches(data);
        setError(null);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message ?? "Failed to load matches");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [selectedSport, range]);

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => a.date - b.date);
  }, [matches]);

  const searchedMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedMatches;
    return sortedMatches.filter((m) => {
      const title = m.title?.toLowerCase() ?? "";
      const home = m.teams?.home?.name?.toLowerCase() ?? "";
      const away = m.teams?.away?.name?.toLowerCase() ?? "";
      return title.includes(q) || home.includes(q) || away.includes(q);
    });
  }, [sortedMatches, query]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, StreamedMatch[]> = {};
    for (const m of searchedMatches) {
      const d = new Date(m.date);
      d.setHours(0, 0, 0, 0);
      const key = d.toDateString();
      (groups[key] ||= []).push(m);
    }
    return Object.entries(groups).sort(
      ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
    );
  }, [searchedMatches]);

  return (
    <div className="container">
      {/* Hero removed per request */}

      {/* Tabs removed as requested */}

      {/* Segmented controls */}
      <div className="sports-controls">
        <div className="sports-segmented">
          <button
            className={range === "live" ? "active" : ""}
            onClick={() => setRange("live")}
          >
            Live
          </button>
          <button
            className={range === "today" ? "active" : ""}
            onClick={() => setRange("today")}
          >
            Today
          </button>
          <button
            className={range === "all" ? "active" : ""}
            onClick={() => setRange("all")}
          >
            All
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="live-badge">
            <span className="live-dot" />{" "}
            {range === "live" ? "Live" : range === "today" ? "Today" : "All"}
          </span>
          <input
            className="sport-search-input"
            placeholder="Cari pertandingan atau tim..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="sport-select"
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
          >
            <option value="">Semua Live</option>
            {sports.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Removed page title */}

      {loading && (
        <div className="sports-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="sports-skeleton-card">
              <div className="sports-skeleton-poster skeleton" />
              <div className="sports-skeleton-body">
                <div className="sports-skeleton-line lg" />
                <div className="sports-skeleton-line" />
                <div className="sports-skeleton-chips">
                  <div className="sports-skeleton-chip" />
                  <div className="sports-skeleton-chip" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="empty-hint" style={{ color: "#fca5a5" }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <div id="sports-list" className="date-group">
          {groupedByDate.length === 0 && (
            <p className="empty-hint">Tidak ada hasil untuk "{query}".</p>
          )}
          {groupedByDate.map(([dateLabel, items]) => {
            const d = new Date(dateLabel);
            const todayStr = new Date().toDateString();
            const isToday = dateLabel === todayStr;
            const dayNum = d.getDate();
            const month = d
              .toLocaleString(undefined, { month: "short" })
              .toUpperCase();
            const weekday = d.toLocaleDateString(undefined, {
              weekday: "short",
            });
            return (
              <div key={dateLabel}>
                <div className="date-header">
                  <div className="date-pill">
                    <div className="day-num">{dayNum}</div>
                    <div className="month">{month}</div>
                  </div>
                  <h3 className="date-title">{isToday ? "Today" : weekday}</h3>
                  {!isToday && (
                    <span className="date-sub">{d.toLocaleDateString()}</span>
                  )}
                </div>
                <div className="sports-grid">
                  {items.map((m) => {
                    const home = m.teams?.home;
                    const away = m.teams?.away;
                    const dateStr = new Date(m.date).toLocaleString();
                    const firstSource = m.sources?.[0];
                    const posterUrl = m.poster
                      ? getPosterUrlFromPosterPath(m.poster)
                      : undefined;
                    const sourcesParam = encodeURIComponent(
                      toBase64(m.sources)
                    );
                    const matchParam = encodeURIComponent(
                      toBase64({
                        title: m.title,
                        teams: m.teams,
                        date: m.date,
                        category: m.category,
                      })
                    );
                    const linkHref = firstSource
                      ? `/sports/${encodeURIComponent(
                          firstSource.source
                        )}/${encodeURIComponent(
                          firstSource.id
                        )}/watch?title=${encodeURIComponent(
                          m.title
                        )}&sources=${sourcesParam}&match=${matchParam}`
                      : undefined;
                    return (
                      <div
                        key={m.id}
                        className="card sports-card sports-card-blur"
                      >
                        <div className="sports-card-bg">
                          {posterUrl && (
                            <img
                              className="sports-card-bgimg"
                              src={posterUrl}
                              alt={m.title}
                              loading="lazy"
                            />
                          )}
                          <div className="sports-card-dim" />
                        </div>
                        <div
                          className="sports-card-body"
                          {...(linkHref ? { as: undefined } : {})}
                        >
                          {linkHref ? (
                            <Link
                              to={linkHref}
                              className="sports-card-link"
                              style={{ display: "block" }}
                            >
                              {home?.name && away?.name ? (
                                <>
                                  <div className="teams-hero">
                                    <div className="team-emblem">
                                      {home?.badge ? (
                                        <img
                                          src={getBadgeUrl(home.badge)}
                                          alt={home?.name}
                                        />
                                      ) : (
                                        <span>
                                          {home?.name?.slice(0, 1) ?? "H"}
                                        </span>
                                      )}
                                    </div>
                                    <span className="vs-badge">VS</span>
                                    <div className="team-emblem">
                                      {away?.badge ? (
                                        <img
                                          src={getBadgeUrl(away.badge)}
                                          alt={away?.name}
                                        />
                                      ) : (
                                        <span>
                                          {away?.name?.slice(0, 1) ?? "A"}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="teams-legend">
                                    <span title={home?.name}>
                                      {home?.name ?? "Home"}
                                    </span>
                                    <span>vs</span>
                                    <span title={away?.name}>
                                      {away?.name ?? "Away"}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div className="sports-card-title">
                                  <h3>{m.title ?? "Match"}</h3>
                                </div>
                              )}
                              <div className="card-meta">
                                <span className="time">{dateStr}</span>
                                <span className="cat">{m.category}</span>
                              </div>
                            </Link>
                          ) : (
                            <>
                              {home?.name && away?.name ? (
                                <>
                                  <div className="teams-hero">
                                    <div className="team-emblem">
                                      {home?.badge ? (
                                        <img
                                          src={getBadgeUrl(home.badge)}
                                          alt={home?.name}
                                        />
                                      ) : (
                                        <span>
                                          {home?.name?.slice(0, 1) ?? "H"}
                                        </span>
                                      )}
                                    </div>
                                    <span className="vs-badge">VS</span>
                                    <div className="team-emblem">
                                      {away?.badge ? (
                                        <img
                                          src={getBadgeUrl(away.badge)}
                                          alt={away?.name}
                                        />
                                      ) : (
                                        <span>
                                          {away?.name?.slice(0, 1) ?? "A"}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="teams-legend">
                                    <span title={home?.name}>
                                      {home?.name ?? "Home"}
                                    </span>
                                    <span>vs</span>
                                    <span title={away?.name}>
                                      {away?.name ?? "Away"}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div className="sports-card-title">
                                  <h3>{m.title ?? "Match"}</h3>
                                </div>
                              )}
                              <div className="card-meta">
                                <span className="time">{dateStr}</span>
                                <span className="cat">{m.category}</span>
                              </div>
                            </>
                          )}
                          <div className="source-chips">
                            {firstSource && (
                              <Link
                                className="source-chip primary"
                                to={`/sports/${encodeURIComponent(
                                  firstSource.source
                                )}/${encodeURIComponent(
                                  firstSource.id
                                )}/watch?title=${encodeURIComponent(
                                  m.title
                                )}&sources=${encodeURIComponent(
                                  btoa(JSON.stringify(m.sources))
                                )}`}
                              >
                                Watch
                              </Link>
                            )}
                          </div>
                        </div>
                        {/* Source choices moved to player page */}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
