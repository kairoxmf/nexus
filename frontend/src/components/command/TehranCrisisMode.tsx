import { useState } from "react";
import { Icon3D } from "@shared/icons";
import { useI18n } from "../../i18n";
import { CITY_PRESETS, getCityPreset } from "../../lib/cityPresets";

const API = import.meta.env.VITE_API_URL ?? "";

type Props = {
  activeCityId: string;
  onCityChange: (cityId: string) => void;
  onRunTehranScenario?: () => void;
};

export function TehranCrisisMode({ activeCityId, onCityChange, onRunTehranScenario }: Props) {
  const { t, locale, setLocale } = useI18n();
  const [loading, setLoading] = useState(false);
  const isTehran = activeCityId === "teh";

  const selectCity = async (cityId: string) => {
    setLoading(true);
    try {
      await fetch(`${API}/api/v1/creative/city/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city_id: cityId }),
      });
      onCityChange(cityId);
      if (cityId === "teh" && locale !== "fa") setLocale("fa");
    } finally {
      setLoading(false);
    }
  };

  const launchTehran = async () => {
    setLoading(true);
    try {
      setLocale("fa");
      await selectCity("teh");
      await fetch(`${API}/api/v1/scenarios/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario_id: "tehran_earthquake" }),
      });
      onRunTehranScenario?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cmd-tehran">
      <div className="section-title">{t("tehran_mode_title")}</div>
      <p className="hint">{t("tehran_mode_sub")}</p>

      <div className="cmd-tehran-cities">
        {CITY_PRESETS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`cmd-tehran-city${activeCityId === c.id ? " is-active" : ""}`}
            onClick={() => selectCity(c.id)}
            disabled={loading}
          >
            {locale === "fa" ? c.name_fa : c.name}
          </button>
        ))}
      </div>

      <button type="button" className="btn-primary tehran-launch-btn" onClick={launchTehran} disabled={loading}>
        {loading ? (
          <Icon3D name="loading" size={14} animated />
        ) : (
          <>
            <Icon3D name="warning" size={14} animated color="#ff4655" />
            {t("tehran_launch")}
          </>
        )}
      </button>

      {isTehran && (
        <div className="cmd-tehran-active hint">
          <Icon3D name="check" size={12} color="var(--green)" />
          {t("tehran_active")} · {getCityPreset("teh").lat.toFixed(2)}°N
        </div>
      )}
    </div>
  );
}
