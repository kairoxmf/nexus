import { useI18n } from "./I18nProvider";
import type { Locale } from "./catalog";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, locales, t } = useI18n();

  return (
    <label className={className} style={{ display: "block", marginTop: 8 }}>
      <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>{t("language")}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        style={{
          width: "100%",
          marginTop: 4,
          background: "var(--bg)",
          border: "1px solid var(--line)",
          color: "var(--text)",
          padding: "8px",
          borderRadius: 4,
          fontFamily: "inherit",
        }}
      >
        {locales.map((l) => (
          <option key={l.code} value={l.code}>{l.native}</option>
        ))}
      </select>
    </label>
  );
}
