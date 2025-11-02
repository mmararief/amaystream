import TrendingSlider from "./TrendingSlider";

type Movie = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: "movie" | "tv";
};

export default function TopRatedSlider({ movies }: { movies: Movie[] }) {
  return <TrendingSlider movies={movies} title="Top rated" fullWidth={true} />;
}

