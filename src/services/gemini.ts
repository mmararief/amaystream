import { GoogleGenAI } from "@google/genai";
import { searchMovies } from "./tmdb";

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
