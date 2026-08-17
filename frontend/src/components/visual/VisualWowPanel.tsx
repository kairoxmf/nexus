import { useI18n } from "../../i18n";
import { useVisualWow } from "../../context/VisualWowContext";
import type { VisualWowFeature } from "../../lib/visualWowTypes";
import type { SimulationState } from "../../types";

const FEATURE_GROUPS: { titleKey: string; features: { id: VisualWowFeature; labelKey: string; descKey: string }[] }[] = [
  {
    titleKey: "wow_group_visual",
    features: [
      { id: "dayNight", labelKey: "wow_day_night", descKey: "wow_day_night_desc" },
      { id: "particles", labelKey: "wow_particles", descKey: "wow_particles_desc" },
      { id: "panicHeatmap", labelKey: "wow_heatmap", descKey: "wow_heatmap_desc" },
      { id: "sosRipple", labelKey: "wow_ripple", descKey: "wow_ripple_desc" },
      { id: "xrayUnderground", labelKey: "wow_xray", descKey: "wow_xray_desc" },
      { id: "holographicHud", labelKey: "wow_hud", descKey: "wow_hud_desc" },
      { id: "ekgHeader", labelKey: "wow_ekg", descKey: "wow_ekg_desc" },
      { id: "moodRing", labelKey: "wow_mood", descKey: "wow_mood_desc" },
      { id: "photoMode", labelKey: "wow_photo_mode", descKey: "wow_photo_desc" },
      { id: "tehranMiniature", labelKey: "wow_tehran", descKey: "wow_tehran_desc" },
    ],
  },
  {
    titleKey: "wow_group_gameplay",
    features: [
      { id: "ghostCity", labelKey: "wow_ghost", descKey: "wow_ghost_desc" },
      { id: "crisisTarot", labelKey: "wow_tarot", descKey: "wow_tarot_desc" },
      { id: "soundscape", labelKey: "wow_soundscape", descKey: "wow_soundscape_desc" },
      { id: "heliCam", labelKey: "wow_heli", descKey: "wow_heli_desc" },
      { id: "neuralNet", labelKey: "wow_neural", descKey: "wow_neural_desc" },
      { id: "infraRings", labelKey: "wow_rings", descKey: "wow_rings_desc" },
      { id: "dualTimeline", labelKey: "wow_dual_timeline", descKey: "wow_dual_timeline_desc" },
      { id: "trophy", labelKey: "wow_trophy", descKey: "wow_trophy_desc" },
    ],
  },
  {
    titleKey: "wow_group_v2",
    features: [
      { id: "ebsTakeover", labelKey: "wow_ebs", descKey: "wow_ebs_desc" },
      { id: "seismicRings", labelKey: "wow_seismic", descKey: "wow_seismic_desc" },
      { id: "fogOfWar", labelKey: "wow_fog", descKey: "wow_fog_desc" },
      { id: "beforeAfterSlider", labelKey: "wow_before_after", descKey: "wow_before_after_desc" },
      { id: "mapAnnotation", labelKey: "wow_annotation", descKey: "wow_annotation_desc" },
      { id: "crisisWrapped", labelKey: "wow_wrapped", descKey: "wow_wrapped_desc" },
    ],
  },
  {
    titleKey: "wow_group_unique",
    features: [
      { id: "crisisDna", labelKey: "wow_dna", descKey: "wow_dna_desc" },
      { id: "newspaper", labelKey: "wow_newspaper", descKey: "wow_newspaper_desc" },
      { id: "constellation", labelKey: "wow_constellation", descKey: "wow_constellation_desc" },
      { id: "brokenGlass", labelKey: "wow_glass", descKey: "wow_glass_desc" },
      { id: "waxSeal", labelKey: "wow_seal", descKey: "wow_seal_desc" },
      { id: "vhsRewind", labelKey: "wow_vhs", descKey: "wow_vhs_desc" },
      { id: "memorialWall", labelKey: "wow_memorial", descKey: "wow_memorial_desc" },
    ],
  },
];

type Props = {
  state: SimulationState;
  expanded?: boolean;
};

export function VisualWowPanel({ state, expanded = false }: Props) {
  const { t, locale } = useI18n();
  const wow = useVisualWow();

  const handleNewspaper = () => {
    const html = wow.generateNewspaper(state);
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  return (
    <div className={`wow-panel${expanded ? " is-expanded" : ""}`}>
      <div className="wow-panel-header">
        <h3>{t("wow_title")}</h3>
        <p className="hint">{t("wow_subtitle")}</p>
      </div>

      {FEATURE_GROUPS.map((group) => (
        <div key={group.titleKey} className="wow-feature-group">
          <div className="section-title">{t(group.titleKey)}</div>
          <div className="wow-feature-grid">
            {group.features.map((f) => (
              <label key={f.id} className={`wow-feature-toggle${wow.toggles[f.id] ? " is-on" : ""}`}>
                <input
                  type="checkbox"
                  checked={wow.toggles[f.id]}
                  onChange={(e) => wow.setToggle(f.id, e.target.checked)}
                />
                <div className="wow-feature-info">
                  <strong>{t(f.labelKey)}</strong>
                  <span className="hint">{t(f.descKey)}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="wow-panel-actions">
        <button type="button" className="btn-primary" onClick={() => wow.applyDemoLite()}>
          {t("wow_demo_lite")}
        </button>
        <button type="button" className="btn-primary" onClick={() => wow.enableAllToggles()}>
          {t("wow_enable_all")}
        </button>
        <button type="button" className="btn-ghost" onClick={() => wow.disableAllToggles()}>
          {t("wow_disable_all")}
        </button>
        <button type="button" className="btn-primary" onClick={() => wow.drawTarot()}>
          {t("wow_draw_tarot")}
        </button>
        <button type="button" className="btn-ghost" onClick={handleNewspaper}>
          {t("wow_gen_newspaper")}
        </button>
        <button type="button" className="btn-ghost" onClick={() => wow.triggerVhs()}>
          {t("wow_trigger_vhs")}
        </button>
        <button type="button" className="btn-ghost" onClick={() => wow.triggerEbs()}>
          {t("wow_trigger_ebs")}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => wow.generateCrisisWrapped(state, locale)}
        >
          {t("wow_gen_wrapped")}
        </button>
        <button
          type="button"
          className={`btn-ghost${wow.toggles.heliCam ? " active" : ""}`}
          onClick={() => wow.toggleFeature("heliCam")}
        >
          {t("wow_heli_cam")}
        </button>
      </div>

      <div className="wow-fingerprint-preview">
        <span>{t("wow_dna")}</span>
        <code>{wow.derived.crisisFingerprint}</code>
      </div>
    </div>
  );
}
