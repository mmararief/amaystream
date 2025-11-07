import { GoogleGenAI } from "@google/genai";
import { searchMovies } from "./tmdb";
import { streamedApi, type StreamedMatch } from "./streamed";

function getApiKey(): string {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!key) {
    throw new Error('VITE_GEMINI_API_KEY belum diset. Tambahkan ke file .env');
  }
  return key;
}

export async function searchMovieByDescription(description: string): Promise<{ id: number; title: string }[]> {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });
  
  const prompt = `Saya ingin mencari beberapa film berdasarkan deskripsi berikut: "${description}"

Mohon kembalikan jawaban dalam format JSON array berikut jika kamu menemukan film-film yang cocok (berikan 3-5 rekomendasi):
{
  "movies": [
    {"title": "<judul film yang tepat>"},
    {"title": "<judul film yang tepat>"},
    {"title": "<judul film yang tepat>"}
  ]
}

PENTING: Berikan hanya JUDUL FILM yang akurat sesuai dengan nama resmi film di database film internasional. Jangan berikan ID apapun.

Jika tidak menemukan film yang cocok atau deskripsi tidak jelas, kembalikan: {"error": "not found"}

Jawab hanya dengan JSON, tanpa penjelasan tambahan.`;

  const isDev = import.meta.env.DEV;
  
  try {
    if (isDev) console.log('[Gemini] Request prompt:', prompt);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = (response as any).text || String(response) || '';
    if (isDev) console.log('[Gemini] Extracted text:', text);
    
    // Extract JSON from response (handle markdown code blocks if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      if (isDev) console.warn('[Gemini] No JSON found in response');
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    if (parsed.error || !parsed.movies || !Array.isArray(parsed.movies)) {
      if (isDev) console.warn('[Gemini] Invalid response structure:', parsed);
      return [];
    }

    // Extract titles from Gemini response
    const titles = parsed.movies
      .map((m: any) => m.title)
      .filter((title: any) => title && typeof title === 'string');

    // Search each title in TMDB and get the first result
    const searchPromises = titles.map(async (title: string) => {
      try {
        const searchResult = await searchMovies(title, 1);
        if (searchResult.results && searchResult.results.length > 0) {
          // Take the first result (most relevant)
          const movie = searchResult.results[0];
          return {
            id: movie.id,
            title: movie.title
          };
        }
        return null;
      } catch (err) {
        if (isDev) console.error(`[Gemini] Error searching TMDB for "${title}":`, err);
        return null;
      }
    });

    const searchResults = await Promise.all(searchPromises);
    const validResults = searchResults.filter((r): r is { id: number; title: string } => r !== null);
    
    if (isDev) console.log('[Gemini] Final results after TMDB search:', validResults);
    return validResults;
  } catch (error) {
    if (isDev) console.error('[Gemini] Search error:', error);
    return [];
  }
}

// ---- Sports (Streamed) AI helpers ----

export type SportsQuery = {
  scope?: "live" | "today" | "popular" | "all";
  sports?: string[];
  teams?: string[];
  keywords?: string[];
};

function normalizeText(value: string): string {
  return value.normalize("NFKD").toLowerCase();
}

function textIncludes(haystack: string, needle: string): boolean {
  return normalizeText(haystack).includes(normalizeText(needle));
}

async function interpretSportsQuery(description: string): Promise<SportsQuery | null> {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  const prompt = `Saya ingin mencari siaran olahraga berdasarkan deskripsi berikut: "${description}"

Kembalikan JSON dengan struktur ketat seperti ini saja:
{
  "scope": "live|today|popular|all",
  "sports": ["nama olahraga"],
  "teams": ["nama tim atau negara"],
  "keywords": ["kata kunci tambahan"]
}

Catatan:
- scope: pilih satu yang paling sesuai (mis. jika pengguna menyebut "sekarang"/"sedang berlangsung" gunakan "live", jika "hari ini" gunakan "today"). Jika tidak jelas, gunakan "all".
- sports dan teams opsional, boleh kosong jika tidak relevan.
- Jawab HANYA JSON murni tanpa penjelasan.`;

  const isDev = import.meta.env.DEV;

  try {
    if (isDev) console.log('[Gemini][Sports] Request prompt:', prompt);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = (response as any).text || String(response) || '';
    if (isDev) console.log('[Gemini][Sports] Extracted text:', text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed as SportsQuery;
  } catch (error) {
    if (isDev) console.error('[Gemini][Sports] interpret error:', error);
    return null;
  }
}

export async function searchMatchesByDescription(description: string): Promise<StreamedMatch[]> {
  const isDev = import.meta.env.DEV;

  try {
    const interpreted = await interpretSportsQuery(description);

    const normalizedDescription = normalizeText(description);
    const wantsTomorrow = /(\bbesok\b|\besok\b|\besuk\b|\besuknya\b|\besoknya\b|\btomorrow\b)/.test(normalizedDescription);
    const scope = wantsTomorrow ? "tomorrow" : (interpreted?.scope || "all");

    // Normalize and map sport synonyms to Streamed sport IDs
    const synonymMap: Record<string, string> = {
      // football
      "football": "football",
      "soccer": "football",
      "sepak bola": "football",
      "sepakbola": "football",
      "bola": "football",
      // basketball
      "basket": "basketball",
      "bola basket": "basketball",
      "basketball": "basketball",
      // tennis
      "tenis": "tennis",
      "tennis": "tennis",
      // others
      "mma": "mma",
      "boxing": "boxing",
      "tinju": "boxing",
      "hockey": "hockey",
      "baseball": "baseball",
      "golf": "golf",
      "motorsport": "motor-sports",
      "motor": "motor-sports",
      "motor sport": "motor-sports",
      "motor racing": "motor-sports",
      "formula 1": "motor-sports",
      "formula one": "motor-sports",
      "formula one racing": "motor-sports",
      "f1": "motor-sports",
    };

    const resolveSportIds = (inputs: string[]): string[] => {
      const resolved = new Set<string>();
      for (const s of inputs) {
        const key = normalizeText(s).trim();
        if (synonymMap[key]) {
          resolved.add(synonymMap[key]);
        } else if (key) {
          // assume already an ID (e.g., "football")
          resolved.add(key);
        }
      }
      return Array.from(resolved);
    };

    // Remove generic/unhelpful keywords that won't appear in titles
    const genericStopKeywords = [
      // generic quality adjectives
      "tim besar",
      "big team",
      "top",
      "terbaik",
      "populer",
      "popular",
      "seru",
      // time/control words that should not be used to filter titles
      "live",
      "siaran langsung",
      "langsung",
      "today",
      "hari ini",
      "malam ini",
      "besok",
      "tomorrow",
    ].map(normalizeText);

    const rawSports = (interpreted?.sports || []).filter(Boolean);
    const rawKeywords = (interpreted?.keywords || []).filter(Boolean);
    const sports = resolveSportIds(rawSports);
    const teams = (interpreted?.teams || []).filter(Boolean);
    const keywords = rawKeywords
      .filter(Boolean)
      .filter((k) => !genericStopKeywords.includes(normalizeText(k)));

    // Detect subcategory for motor-sports (e.g., only F1, or only MotoGP)
    type MotorSub = "f1" | "motogp" | "wec" | "wrc" | null;
    const detectMotorSub = (sportsIn: string[], keywordsIn: string[], desc: string): MotorSub => {
      const tokens = new Set<string>([
        ...sportsIn.map(normalizeText),
        ...keywordsIn.map(normalizeText),
        ...normalizeText(desc).split(/[^a-z0-9+]+/g),
      ]);
      const hasAny = (arr: string[]) => arr.some((t) => tokens.has(normalizeText(t)));
      if (hasAny(["f1", "formula1", "formula-1", "formula", "formulaone"])) return "f1";
      if (hasAny(["motogp", "moto", "moto-gp"])) return "motogp";
      if (hasAny(["wec", "endurance"])) return "wec";
      if (hasAny(["wrc", "rally"])) return "wrc";
      return null;
    };
    const motorSub = detectMotorSub(rawSports, rawKeywords, description);

    // choose base list by scope, using sport-specific endpoints when possible
    let base: StreamedMatch[] = [];
    if (scope === "live") {
      // global live list, then filter by sport if provided
      const live = await streamedApi.getLiveMatches();
      base = sports.length > 0 ? live.filter((m) => sports.includes(normalizeText(m.category))) : live;
    } else if (scope === "today") {
      const today = await streamedApi.getTodayMatches();
      base = sports.length > 0 ? today.filter((m) => sports.includes(normalizeText(m.category))) : today;
    } else if (scope === "tomorrow") {
      // Build tomorrow window in local time
      const now = new Date();
      const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0).getTime();
      const endOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 0, 0, 0, 0).getTime() - 1;

      if (sports.length > 0) {
        const lists = await Promise.all(
          sports.map((s) => streamedApi.getMatchesBySport(s).catch(() => []))
        );
        base = lists.flat();
      } else {
        base = await streamedApi.getAllMatches();
      }

      // Filter to tomorrow only
      base = base.filter((m) => m.date >= startOfTomorrow && m.date <= endOfTomorrow);
      // Also honor sports category if provided
      if (sports.length > 0) {
        base = base.filter((m) => sports.includes(normalizeText(m.category)));
      }

      // If none scheduled tomorrow, try next 7 days as a friendly fallback
      if (base.length === 0) {
        const sevenDays = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 8, 0, 0, 0, 0).getTime() - 1;
        let upcoming: StreamedMatch[] = [];
        if (sports.length > 0) {
          const lists = await Promise.all(
            sports.map((s) => streamedApi.getMatchesBySport(s).catch(() => []))
          );
          upcoming = lists.flat();
        } else {
          upcoming = await streamedApi.getAllMatches();
        }
        const upcomingWindow = upcoming.filter((m) => m.date >= startOfTomorrow && m.date <= sevenDays);
        if (upcomingWindow.length > 0) {
          base = upcomingWindow;
        } else {
          // Final fallback: show today's matches for visibility
          const today = await streamedApi.getTodayMatches();
          base = sports.length > 0 ? today.filter((m) => sports.includes(normalizeText(m.category))) : today;
        }
      }
    } else if (scope === "popular") {
      if (sports.length > 0) {
        const lists = await Promise.all(
          sports.map((s) => streamedApi.getMatchesBySportPopular(s).catch(() => []))
        );
        base = lists.flat();
      } else {
        base = await streamedApi.getAllMatchesPopular();
      }
    } else {
      if (sports.length > 0) {
        const lists = await Promise.all(
          sports.map((s) => streamedApi.getMatchesBySport(s).catch(() => []))
        );
        base = lists.flat();
      } else {
        base = await streamedApi.getAllMatches();
      }
    }

    // Deduplicate by id (in case of multi-sport merges)
    const idSeen = new Set<string>();
    base = base.filter((m) => (idSeen.has(m.id) ? false : (idSeen.add(m.id), true)));

    // Apply motor-sports subcategory filter if requested
    if (sports.includes("motor-sports") && motorSub) {
      const includeF1 = (t: string) => /\b(f1|formula\s?1|formula\s?one)\b/i.test(t);
      const includeMotoGP = (t: string) => /\b(motogp|moto\s?gp)\b/i.test(t);
      const includeWEC = (t: string) => /\b(wec|endurance)\b/i.test(t);
      const includeWRC = (t: string) => /\b(wrc|rally)\b/i.test(t);
      base = base.filter((m) => {
        const text = `${m.title} ${m.category}`;
        if (motorSub === "f1") return includeF1(text);
        if (motorSub === "motogp") return includeMotoGP(text);
        if (motorSub === "wec") return includeWEC(text);
        if (motorSub === "wrc") return includeWRC(text);
        return true;
      });
    }

    // Apply team/keyword filters
    let filtered = base;
    const hasTeamOrKeyword = teams.length > 0 || keywords.length > 0;
    if (hasTeamOrKeyword) {
      filtered = base.filter((m) => {
        const title = m.title || '';
        const category = m.category || '';
        const homeName = m.teams?.home?.name || '';
        const awayName = m.teams?.away?.name || '';

        const matchTeams = teams.length === 0 || teams.some((t) => textIncludes(homeName, t) || textIncludes(awayName, t) || textIncludes(title, t));
        const matchKeywords = keywords.length === 0 || keywords.some((k) => textIncludes(title, k) || textIncludes(category, k));
        return matchTeams && matchKeywords;
      });
    }

    // Fallback: if filtering removed everything, show base list
    const result = (filtered.length > 0 ? filtered : base).slice(0, 12);
    if (isDev) console.log('[Gemini][Sports] Final matches:', { interpreted, count: result.length });
    return result;
  } catch (error) {
    if (isDev) console.error('[Gemini][Sports] search error:', error);
    return [];
  }
}
