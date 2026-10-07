import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface FavoritesValue {
  favorites: Set<string>;
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
  count: number;
}

const FavoritesContext = createContext<FavoritesValue | null>(null);

const STORAGE_KEY = "horizon:favorites";

function readInitial(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(readInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
  }, [favorites]);

  const toggle = useCallback((slug: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  const has = useCallback((slug: string) => favorites.has(slug), [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, toggle, has, count: favorites.size }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");
  return ctx;
}
