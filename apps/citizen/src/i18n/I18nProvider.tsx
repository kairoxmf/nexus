import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { catalogs, isRtl, LOCALES, translate, type Locale } from "./catalog";

const STORAGE_KEY = "nexus_lang";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  locales: typeof LOCALES;
  rtl: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectLocale(): Locale {
  const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (saved && catalogs[saved]) return saved;
  const browser = navigator.language.slice(0, 2);
  if (browser === "fa") return "fa";
  if (browser === "ar") return "ar";
  if (browser === "es") return "es";
  if (browser === "fr") return "fr";
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtl(locale) ? "rtl" : "ltr";
    document.title = translate(locale, "citizen_app_title");
    localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale: setLocaleState,
    t: (key: string) => translate(locale, key),
    locales: LOCALES,
    rtl: isRtl(locale),
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
