const BASE_URL = "https://streamed.pk";

export interface StreamedSport {
	id: string;
	name: string;
}

export interface StreamedTeamInfo {
	name: string;
	badge: string;
}

export interface StreamedMatchSourceRef {
	source: string;
	id: string;
}

export interface StreamedMatch {
	id: string;
	title: string;
	category: string;
	date: number; // Unix ms
	poster?: string;
	popular: boolean;
	teams?: {
		home?: StreamedTeamInfo;
		away?: StreamedTeamInfo;
	};
	sources: StreamedMatchSourceRef[];
}

export interface StreamedStream {
	id: string;
	streamNo: number;
	language: string;
	hd: boolean;
	embedUrl: string;
	source: string;
}

async function fetchJson<T>(path: string): Promise<T> {
	const res = await fetch(`${BASE_URL}${path}`);
	if (!res.ok) {
		throw new Error(`Request failed ${res.status}`);
	}
	return res.json();
}

export const streamedApi = {
	getSports(): Promise<StreamedSport[]> {
		return fetchJson(`/api/sports`);
	},
	getAllMatches(): Promise<StreamedMatch[]> {
		return fetchJson(`/api/matches/all`);
	},
	getAllMatchesPopular(): Promise<StreamedMatch[]> {
		return fetchJson(`/api/matches/all/popular`);
	},
	getLiveMatches(): Promise<StreamedMatch[]> {
		return fetchJson(`/api/matches/live`);
	},
	getLiveMatchesPopular(): Promise<StreamedMatch[]> {
		return fetchJson(`/api/matches/live/popular`);
	},
	getTodayMatches(): Promise<StreamedMatch[]> {
		return fetchJson(`/api/matches/all-today`);
	},
	getTodayMatchesPopular(): Promise<StreamedMatch[]> {
		return fetchJson(`/api/matches/all-today/popular`);
	},
	getMatchesBySport(sportId: string): Promise<StreamedMatch[]> {
		return fetchJson(`/api/matches/${encodeURIComponent(sportId)}`);
	},
	getMatchesBySportPopular(sportId: string): Promise<StreamedMatch[]> {
		return fetchJson(`/api/matches/${encodeURIComponent(sportId)}/popular`);
	},
	getStreams(source: string, id: string): Promise<StreamedStream[]> {
		return fetchJson(`/api/stream/${encodeURIComponent(source)}/${encodeURIComponent(id)}`);
	},
};

export function getBadgeUrl(badgeId: string): string {
	return `${BASE_URL}/api/images/badge/${badgeId}.webp`;
}

export function getPosterUrlFromPosterPath(posterPath: string): string {
	// poster field can be a path like "/api/images/proxy/xyz" (per docs examples)
	// Ensure absolute URL
	if (posterPath.startsWith("http")) return posterPath;
	return `${BASE_URL}${posterPath}.webp`;
}


