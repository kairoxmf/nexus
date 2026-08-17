import type { Locale } from "@shared/i18n/messages";

export const SPEECH_LANG: Record<Locale, string> = {
  en: "en-US",
  fa: "fa-IR",
  ar: "ar-SA",
  es: "es-ES",
  fr: "fr-FR",
};

const PERSIAN_LATIN =
  /\b(salam|salaam|chetor|chetori|khub|khoob|khoobi|mitooni|mitoni|lotfan|merci|mamnoon|khodahafez|khodafez|halet|chist|chiye|chi|koja|mikham|mikhei|nexus|neksus|vaziat|vaziyat|shahr|komak|begoo|che\s*khabar|chekhabar)\b/i;

const ARABIC_LATIN = /\b(marhaba|shukran|kayf|halak)\b/i;

const ARABIC_MARKERS = /[\u0750-\u077F]|\b(ال|في|هذا|لم|أن|على|من|إلى)\b/;

/** Guess language from message text. */
export function detectMessageLocale(text: string, fallback: Locale): Locale {
  const q = text.trim();
  if (!q) return fallback;

  if (/[\u0600-\u06FF]/.test(q)) {
    if (ARABIC_MARKERS.test(q)) return "ar";
    return "fa";
  }

  if (PERSIAN_LATIN.test(q)) return "fa";
  if (ARABIC_LATIN.test(q)) return "ar";
  if (/[¿¡]|\b(hola|qué|cómo|gracias|por\s*favor)\b/i.test(q)) return "es";
  // Do not treat English "comment" (common typo for "command") as French.
  if (
    /[àâçéèêëïîôùûüÿœ]|\b(bonjour|merci|français|s'il\s*vous|comment\s+(allez|ça|ca|vas|vous|tu))\b/i.test(
      q,
    )
  ) {
    return "fr";
  }

  return fallback;
}

/**
 * Locale for AI reply + TTS.
 * Priority: Arabic script in message → clear non-English signal → UI language → text guess.
 */
export function resolveReplyLocale(text: string, uiLocale: Locale, fromVoice = false): Locale {
  const fromText = detectMessageLocale(text, uiLocale);

  // Persian/Arabic script always wins
  if (/[\u0600-\u06FF]/.test(text)) return fromText;

  // Clear latin transliteration / other languages
  if (fromText !== "en" && fromText !== uiLocale) return fromText;

  // UI language is an explicit user choice — honor it for replies
  if (uiLocale !== "en") return uiLocale;

  // Voice with English UI: still honor detected Persian latin
  if (fromVoice && fromText === "fa") return "fa";

  return fromText;
}

/** Pick TTS BCP-47 tag from response text + preferred locale. */
export function inferSpeechLocale(text: string, preferred?: string): string {
  const prefCode = (preferred ?? "en").split("-")[0] as Locale;
  const fromText = detectMessageLocale(text, prefCode);

  if (/[\u0600-\u06FF]/.test(text)) {
    return speechLangFor(fromText);
  }

  if (preferred && SPEECH_LANG[prefCode]) {
    return speechLangFor(prefCode);
  }

  return speechLangFor(fromText);
}

export function speechLangFor(locale: string): string {
  const code = locale.split("-")[0] as Locale;
  if (SPEECH_LANG[code]) return SPEECH_LANG[code];
  return locale.includes("-") ? locale : "en-US";
}

/** Extra instruction so the LLM answers in the target language. */
export function buildLocalizedPrompt(message: string, locale: Locale): string {
  const prefixes: Partial<Record<Locale, string>> = {
    fa: "Language=fa. فقط به فارسی روان جواب بده.\n\n",
    ar: "Language=ar. أجب بالعربية فقط.\n\n",
    es: "Language=es. Responde solo en español.\n\n",
    fr: "Language=fr. Réponds uniquement en français.\n\n",
  };
  const prefix = prefixes[locale];
  return prefix ? `${prefix}${message}` : message;
}
