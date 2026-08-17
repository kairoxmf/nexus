import { createContext, useContext, type ReactNode } from "react";
import { useSimulation } from "../hooks/useSimulation";

type NexusContextValue = ReturnType<typeof useSimulation>;

const NexusContext = createContext<NexusContextValue | null>(null);

export function NexusProvider({ children }: { children: ReactNode }) {
  return (
    <NexusContext.Provider value={useSimulation()}>{children}</NexusContext.Provider>
  );
}

export function useNexus() {
  const ctx = useContext(NexusContext);
  if (!ctx) throw new Error("useNexus must be used within NexusProvider");
  return ctx;
}
