const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

function getApiKey(): string {
  const key = import.meta.env.VITE_TMDB_API_KEY as string | undefined
  if (!key) {
    // Intentionally throw: developer must configure API key
    throw new Error('VITE_TMDB_API_KEY belum diset. Tambahkan ke file .env')
  }
  return key
}

async function request<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const apiKey = getApiKey()
  const url = new URL(TMDB_BASE_URL + path)
  url.searchParams.set('api_key', apiKey)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
  })
  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`TMDB error ${res.status}`)
  }
  return res.json()
}

export function buildImageUrl(path: string, size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500') {
  if (!path) return ''
  return `https://image.tmdb.org/t/p/${size}${path}`
}

export async function fetchPopularMovies(page = 1) {
  return request<{ page: number; results: any[]; total_pages: number }>(`/movie/popular`, { page })
}

export async function searchMovies(query: string, page = 1) {
  return request<{ page: number; results: any[]; total_pages: number }>(`/search/movie`, { query, page, include_adult: 'false' })
}

export async function fetchMovieDetail(id: number) {
  return request(`/movie/${id}`)
}

export async function fetchMovieCredits(id: number) {
  return request(`/movie/${id}/credits`)
}

export async function fetchSimilarMovies(id: number) {
  return request<{ results: any[] }>(`/movie/${id}/similar`)
}

export async function fetchTrendingMovies(timeWindow: 'day' | 'week' = 'day') {
  return request<{ page: number; results: any[]; total_pages: number }>(`/trending/movie/${timeWindow}`)
}

export async function fetchGenres() {
  return request<{ genres: Array<{ id: number; name: string }> }>(`/genre/movie/list`)
}

export type DiscoverFilters = {
  genre?: number | null
  year?: number | null
  minRating?: number | null
  sortBy?: 'popularity.desc' | 'popularity.asc' | 'vote_average.desc' | 'vote_average.asc' | 'release_date.desc' | 'release_date.asc'
}

export async function discoverMovies(filters: DiscoverFilters = {}, page = 1) {
  const params: Record<string, string | number> = { page }
  
  if (filters.genre) params.with_genres = filters.genre
  if (filters.year) {
    params.primary_release_year = filters.year
  }
  if (filters.minRating !== null && filters.minRating !== undefined) {
    params['vote_average.gte'] = filters.minRating
  }
  if (filters.sortBy) {
    params.sort_by = filters.sortBy
  }
  
  return request<{ page: number; results: any[]; total_pages: number }>(`/discover/movie`, params)
}


