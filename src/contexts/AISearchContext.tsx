import { createContext, useContext, useState, useCallback } from "react";

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  backdrop_path?: string | null;
};

interface AISearchContextType {
  openAISearch: () => void;
  setAISearchResults: (movies: Movie[]) => void;
  aiSearchResults: Movie[] | null;
  clearAISearchResults: () => void;
}

export const AISearchContext = createContext<AISearchContextType | null>(null);

export function useAISearch() {
  const context = useContext(AISearchContext);
  if (!context) {
    return {
      openAISearch: () => {
        console.warn("AISearchContext not found");
      },
      setAISearchResults: () => {
        console.warn("AISearchContext not found");
      },
      aiSearchResults: null,
      clearAISearchResults: () => {
        console.warn("AISearchContext not found");
      },
    };
  }
  return context;
}

// Provider component
export function AISearchProvider({ children, openAISearch }: { children: React.ReactNode; openAISearch: () => void }) {
  const [aiSearchResults, setAiSearchResults] = useState<Movie[] | null>(null);

  const setAISearchResults = useCallback((movies: Movie[]) => {
    setAiSearchResults(movies);
  }, []);

  const clearAISearchResults = useCallback(() => {
    setAiSearchResults(null);
  }, []);

  return (
    <AISearchContext.Provider value={{ 
      openAISearch, 
      setAISearchResults, 
      aiSearchResults,
      clearAISearchResults
    }}>
      {children}
    </AISearchContext.Provider>
  );
}

