import { NexusDashboard } from "../components/NexusDashboard";
import { GridCityProvider } from "../context/GridCityContext";

export function CommandPage() {
  return (
    <main className="nx-command-page">
      <GridCityProvider>
        <NexusDashboard fullPage />
      </GridCityProvider>
    </main>
  );
}