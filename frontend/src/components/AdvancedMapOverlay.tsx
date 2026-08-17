import { useState } from "react";
import { useI18n } from "../i18n";
import type { AdvancedModulesState } from "../types";
import { NexusModal } from "../ui/NexusModal";

function StatChip({ label, value, accent = "cyan", large }: { label: string; value: string | number; accent?: string; large?: boolean }) {
  return (
    <div className={`adv-map-chip accent-${accent}${large ? " is-large" : ""}`}>
      <span className="adv-map-chip-label">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function OverlayContent({ data, large }: { data: AdvancedModulesState; large?: boolean }) {
  const { t } = useI18n();
  const future = data.time_machine?.futures.find((f) => f.id === data.time_machine?.selected);
  const evo = data.self_evolving_ai;
  const climate = data.climate_ai;
  const dna = data.infrastructure_genome;

  return (
    <div className={`adv-map-chip-row${large ? " is-large" : ""}`}>
      {future && (
        <StatChip
          large={large}
          label={future.label}
          value={`${future.recovery_hours}${t("adv_h_short")} · ${future.lives_saved} ${t("adv_lives")}`}
          accent="amber"
        />
      )}
      {evo && (
        <StatChip
          large={large}
          label={`${t("adv_ai_ver")} v${evo.version}`}
          value={`${evo.current_performance}%`}
          accent="green"
        />
      )}
      {dna && <StatChip large={large} label={t("adv_city_dna")} value={dna.city_dna_score} accent="cyan" />}
      {climate && (
        <StatChip
          large={large}
          label={t("adv_climate")}
          value={`${climate.wind_kmh}km/h · ${climate.rain_mm}mm`}
          accent="blue"
        />
      )}
      {data.digital_citizens && (
        <StatChip large={large} label={t("map_citizens")} value={data.digital_citizens.length} accent="purple" />
      )}
    </div>
  );
}

export function AdvancedMapOverlay({ data }: { data?: AdvancedModulesState }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  if (!data) return null;

  return (
    <>
      <button type="button" className="adv-map-overlay adv-map-overlay-btn" onClick={() => setOpen(true)}>
        <div className="adv-map-overlay-title">{t("adv_modules_title")}</div>
        <OverlayContent data={data} />
        <span className="adv-map-expand">{t("grid_open_chart")} ↗</span>
      </button>

      <NexusModal
        open={open}
        onClose={() => setOpen(false)}
        title={t("adv_modules_title")}
        subtitle={t("adv_modal_sub")}
        wide
      >
        <OverlayContent data={data} large />
      </NexusModal>
    </>
  );
}
