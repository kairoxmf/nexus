import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { GridSimulationState } from "../types";
import { fetchGridState } from "../lib/gridSimApi";

interface GridCityContextValue {
  gridState: GridSimulationState | null;
  setGridState: (state: GridSimulationState) => void;
  refreshGrid: () => Promise<void>;
}

const GridCityContext = createContext<GridCityContextValue | null>(null);

export function GridCityProvider({ children }: { children: ReactNode }) {
  const [gridState, setGridState] = useState<GridSimulationState | null>(null);

  const refreshGrid = useCallback(async () => {
    try {
      setGridState(await fetchGridState());
    } catch {
      /* backend may be offline */
    }
  }, []);

  const value = useMemo(
    () => ({ gridState, setGridState, refreshGrid }),
    [gridState, refreshGrid],
  );

  return <GridCityContext.Provider value={value}>{children}</GridCityContext.Provider>;
}

export function useGridCity() {
  const ctx = useContext(GridCityContext);
  if (!ctx) throw new Error("useGridCity must be used within GridCityProvider");
  return ctx;
}

/** Optional hook when provider may be absent */
export function useGridCityOptional() {
  return useContext(GridCityContext);
}
