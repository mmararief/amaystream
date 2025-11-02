import { useEffect, useState } from "react";
import { HiSearch, HiChevronDown, HiChevronRight } from "react-icons/hi";
import { fetchGenres, type DiscoverFilters } from "../services/tmdb";

type Props = {
  filters: DiscoverFilters;
  onChange: (filters: DiscoverFilters) => void;
};

export default function MovieFilters({ filters, onChange }: Props) {
  const [genres, setGenres] = useState<Array<{ id: number; name: string }>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadGenres() {
      try {
        setIsLoading(true);
        const data = await fetchGenres();
        setGenres(data.genres);
      } catch (err) {
        console.error("Failed to load genres:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadGenres();
  }, []);

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1940 + 1 },
    (_, i) => currentYear - i
  );

  const handleChange = (key: keyof DiscoverFilters, value: any) => {
    onChange({ ...filters, [key]: value === "" ? null : value });
  };

  const hasActiveFilters =
    (filters.genre !== null && filters.genre !== undefined) ||
    (filters.year !== null && filters.year !== undefined) ||
    (filters.minRating !== null && filters.minRating !== undefined) ||
    filters.sortBy !== undefined;

  const clearFilters = () => {
    onChange({
      genre: null,
      year: null,
      minRating: null,
      sortBy: undefined,
    });
  };

  return (
    <div className="movie-filters">
      <button
        className="filter-toggle"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <HiSearch
          size={18}
          style={{ marginRight: 8, verticalAlign: "middle" }}
        />
        <span>Filter & Urutkan</span>
        {hasActiveFilters && <span className="filter-badge">●</span>}
        <span style={{ marginLeft: "auto" }}>
          {isOpen ? <HiChevronDown size={18} /> : <HiChevronRight size={18} />}
        </span>
      </button>

      {isOpen && (
        <div className="filter-panel">
          <div className="filter-group">
            <label className="filter-label">Genre</label>
            <select
              className="filter-select"
              value={filters.genre || ""}
              onChange={(e) =>
                handleChange(
                  "genre",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              disabled={isLoading}
            >
              <option value="">Semua Genre</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Tahun Rilis</label>
            <select
              className="filter-select"
              value={filters.year || ""}
              onChange={(e) =>
                handleChange(
                  "year",
                  e.target.value ? Number(e.target.value) : null
                )
              }
            >
              <option value="">Semua Tahun</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Rating Minimum</label>
            <select
              className="filter-select"
              value={filters.minRating || ""}
              onChange={(e) =>
                handleChange(
                  "minRating",
                  e.target.value ? Number(e.target.value) : null
                )
              }
            >
              <option value="">Tanpa Batas</option>
              <option value="8">8.0+ (Sangat Bagus)</option>
              <option value="7">7.0+ (Bagus)</option>
              <option value="6">6.0+ (Lumayan)</option>
              <option value="5">5.0+ (Cukup)</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Urutkan Berdasarkan</label>
            <select
              className="filter-select"
              value={filters.sortBy || ""}
              onChange={(e) =>
                handleChange("sortBy", e.target.value || undefined)
              }
            >
              <option value="">Default</option>
              <option value="popularity.desc">Populer (Teratas)</option>
              <option value="popularity.asc">Populer (Terbawah)</option>
              <option value="vote_average.desc">Rating Tertinggi</option>
              <option value="vote_average.asc">Rating Terendah</option>
              <option value="release_date.desc">Tahun Terbaru</option>
              <option value="release_date.asc">Tahun Terlama</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              className="filter-clear"
              onClick={clearFilters}
              type="button"
            >
              Hapus Semua Filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
