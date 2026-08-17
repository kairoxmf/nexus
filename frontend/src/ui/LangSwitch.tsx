import { useI18n } from "../i18n";
import type { Locale } from "@shared/i18n/messages";

type Props = {
  variant?: "nav" | "hero";
  className?: string;
};

export function LangSwitch({ variant = "nav", className = "" }: Props) {
  const { locale, setLocale, locales, t } = useI18n();

  if (variant === "hero") {
    return (
      <div className={`ios-lang-hero ${className}`}>
        <p className="ios-lang-label">{t("language")}</p>
        <p className="ios-lang-hint">{t("home_lang_hint")}</p>
        <div className="ios-lang-pills">
          {locales.map((l) => (
            <button
              key={l.code}
              type="button"
              className={`ios-pill${locale === l.code ? " active" : ""}`}
              onClick={() => setLocale(l.code as Locale)}
            >
              {l.native}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`ios-lang-nav ${className}`} role="group" aria-label={t("language")}>
      {locales.map((l) => (
        <button
          key={l.code}
          type="button"
          className={`ios-lang-nav-btn${locale === l.code ? " active" : ""}`}
          onClick={() => setLocale(l.code as Locale)}
          aria-pressed={locale === l.code}
          title={l.label}
        >
          {l.native}
        </button>
      ))}
    </div>
  );
}
