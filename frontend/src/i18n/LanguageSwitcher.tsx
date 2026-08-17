import { useI18n } from "./I18nProvider";
import type { Locale } from "@shared/i18n/messages";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, locales, t } = useI18n();

  return (
    <div className={className} role="group" aria-label={t("language")}>
      <span style={{ color: "#9fb4c8", textTransform: "uppercase", fontSize: 10, display: "block", marginBottom: 6 }}>
        {t("language")}
      </span>
      <div className="ios-lang-nav">
        {locales.map((l: { code: string; native: string; label: string }) => (
          <button
            key={l.code}
            type="button"
            className={`ios-lang-nav-btn${locale === l.code ? " active" : ""}`}
            aria-pressed={locale === l.code}
            onClick={() => setLocale(l.code as Locale)}
            title={l.label}
          >
            {l.native}
          </button>
        ))}
      </div>
    </div>
  );
}
