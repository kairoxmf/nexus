import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "horizon-favorites";

function readFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function writeFavorites(favs: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favs]));
  } catch {
    /* ignore */
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(readFavorites);

  useEffect(() => {
    writeFavorites(favorites);
  }, [favorites]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.has(id),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
