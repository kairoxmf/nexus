import { useEffect, useState } from "react";
import { Icon3D } from "@shared/icons";
import { useI18n } from "../../i18n";
import { getCityPreset } from "../../lib/cityPresets";

const API = import.meta.env.VITE_API_URL ?? "";

type Scenario = {
  id: string;
  name: string;
  name_fa: string;
  description: string;
  city_id?: string;
  locale?: string;
};

type Props = {
  onScenarioRun?: (cityId: string, locale?: string) => void;
  busy?: boolean;
};

export function ScenarioLibrary({ onScenarioRun, busy }: Props) {
  const { t, locale, setLocale } = useI18n();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/api/v1/scenarios`)
      .then((r) => r.json())
      .then((d: { scenarios?: Scenario[] }) => setScenarios(d.scenarios ?? []))
      .catch(() => setError(t("scenario_load_error")));
  }, [t]);

  const run = async (id: string) => {
    setLoading(id);
    setError(null);
    try {
      const r = await fetch(`${API}/api/v1/scenarios/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario_id: id }),
      });
      const d = (await r.json()) as { ok?: boolean; scenario?: Scenario; error?: string };
      if (!d.ok) {
        setError(d.error ?? t("scenario_run_error"));
        return;
      }
      const sc = d.scenario;
      if (sc?.city_id) {
        onScenarioRun?.(sc.city_id, sc.locale);
        if (sc.locale && sc.locale !== locale) setLocale(sc.locale as typeof locale);
      }
      if (id === "crisis_60") {
        window.dispatchEvent(new CustomEvent("nexus-full-demo"));
      }
    } catch {
      setError(t("scenario_run_error"));
    } finally {
      setLoading(null);
    }
  };

  const label = (s: Scenario) => (locale === "fa" ? s.name_fa : s.name);

  return (
    <div className="cmd-scenarios">
      <div className="section-title">{t("scenario_library_title")}</div>
      <p className="hint">{t("scenario_library_sub")}</p>
      {error && <div className="cmd-error">{error}</div>}
      <div className="cmd-scenario-grid">
        {scenarios.map((s) => {
          const city = getCityPreset(s.city_id ?? "dc");
          return (
            <button
              key={s.id}
              type="button"
              className="cmd-scenario-card"
              onClick={() => run(s.id)}
              disabled={Boolean(loading) || busy}
            >
              <div className="cmd-scenario-name">{label(s)}</div>
              <div className="hint">{s.description}</div>
              <div className="cmd-scenario-meta">
                <span>{city.name_fa || city.name}</span>
                {loading === s.id ? (
                  <Icon3D name="loading" size={14} animated />
                ) : (
                  <Icon3D name="chevron-right" size={12} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
