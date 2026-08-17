import { useI18n } from "../../i18n";

type Props = {
  step: number;
  total: number;
  labelKey: string;
  titleKey?: string;
  variant?: "guided" | "voice";
  onSkip: () => void;
};

export function DemoGuideOverlay({
  step,
  total,
  labelKey,
  titleKey = "demo_guide_title",
  variant = "guided",
  onSkip,
}: Props) {
  const { t } = useI18n();
  const pct = Math.round((step / total) * 100);

  return (
    <div className="demo-guide-overlay" role="status" aria-live="polite">
      <div className={`demo-guide-card${variant === "voice" ? " is-voice" : ""}`}>
        <div className="demo-guide-head">
          <span className="demo-guide-badge">{t(titleKey)}</span>
          <span className="demo-guide-step">
            {step}/{total}
          </span>
        </div>
        <p className="demo-guide-text">{t(labelKey)}</p>
        <div className="demo-guide-bar" aria-hidden>
          <span style={{ width: `${pct}%` }} />
        </div>
        <button type="button" className="btn-ghost btn-xs demo-guide-skip" onClick={onSkip}>
          {t("demo_guide_skip")}
        </button>
      </div>
    </div>
  );
}
