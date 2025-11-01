import { createContext, useContext } from "react";

interface AISearchContextType {
  openAISearch: () => void;
}

export const AISearchContext = createContext<AISearchContextType | null>(null);

export function useAISearch() {
  const context = useContext(AISearchContext);
  if (!context) {
    return {
      openAISearch: () => {
        console.warn("AISearchContext not found");
      },
    };
  }
  return context;
}

