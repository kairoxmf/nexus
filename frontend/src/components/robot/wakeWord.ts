/** Normalize Persian/Latin text for wake-word matching. */
export function normalizeSpeechText(text: string): string {
  return text
    .trim()
    .replace(/[\u200c\u200f]/g, "")
    .replace(/[،,.!?;:؟]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[كک]/g, "ک")
    .replace(/[يی]/g, "ی")
    .replace(/[أإآ]/g, "ا")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .toLowerCase();
}

const WAKE_CORE =
  "(?:nexus|nexis|neksus|nekus|nextus|nexuss|nexos|nexuz|next\\s*us|نکسوس|نکسس|نكسوس|نکساس|نیکسوس|نکسوز)";

const WAKE_PREFIX = "(?:hey\\s+|hi\\s+|ok\\s+|هی\\s+|سلام\\s+|ayo\\s+)?";

/** Whole-utterance STT mishears of «Nexus» — wake only, never a command. */
const WAKE_MISHEAR_ONLY = /^(news|next|nex|nexa|nexas|nectus|neck\s*us|nick\s*us|nick\s*sauce)$/i;

/** Tight phonetic hits — avoid matching random words like "next week". */
const FUZZY_WAKE =
  /\b(nexus|nexis|neksus|nekus|nextus|nexuss|nexos|nexuz|نکسوس|نکسس|نكسوس|نکساس|نیکسوس)\b/i;

const WAKE_RESIDUE =
  /^(news|next|nex|nexa|nexus|nexis|neksus|yes|yeah|yep|ok|okay|hey|hi|بله|باشه|آره|نکسوس|نکسس)\s*[.!?؟]*$/i;

function stripWakeFromRaw(raw: string): string {
  return raw
    .replace(new RegExp(WAKE_PREFIX, "gi"), "")
    .replace(new RegExp(WAKE_CORE, "gi"), "")
    .replace(new RegExp(FUZZY_WAKE.source, "gi"), "")
    .trim()
    .replace(/^[،,.:!?\s]+/, "")
    .trim();
}

/** Detect wake phrase and extract the command after it. */
export function parseWakeUtterance(transcript: string): { triggered: boolean; command: string } {
  const raw = transcript.trim();
  if (!raw) return { triggered: false, command: "" };

  const text = normalizeSpeechText(raw);

  if (new RegExp(`^${WAKE_PREFIX}${WAKE_CORE}\\s*[,.:!?]*$`, "i").test(text)) {
    return { triggered: true, command: "" };
  }

  const withCmd = text.match(new RegExp(`${WAKE_PREFIX}${WAKE_CORE}\\s*[,.:!]?\\s*(.+)$`, "i"));
  if (withCmd?.[1]) {
    return { triggered: true, command: withCmd[1].trim() };
  }

  if (new RegExp(`(?:^|\\s)${WAKE_PREFIX}${WAKE_CORE}(?:\\s|[,.:!?]|$)`, "i").test(text)) {
    return { triggered: true, command: stripWakeFromRaw(raw) };
  }

  if (WAKE_MISHEAR_ONLY.test(text) && text.length < 16) {
    return { triggered: true, command: "" };
  }

  // Fuzzy fallback is wake-only — leftover words are usually STT junk like «news»
  if (FUZZY_WAKE.test(text) && text.length < 22) {
    return { triggered: true, command: "" };
  }

  return { triggered: false, command: "" };
}

/** Echo of the wake word after «Yes» — keep listening instead of sending to AI. */
export function looksLikeWakeResidue(text: string): boolean {
  const q = normalizeSpeechText(text);
  if (!q) return true;
  if (q.length < 2) return true;
  if (WAKE_RESIDUE.test(q)) return true;
  if (WAKE_MISHEAR_ONLY.test(q)) return true;
  const parsed = parseWakeUtterance(q);
  return parsed.triggered && !parsed.command;
}

/** Scan every STT alternative for the best wake match. */
export function parseWakeFromAlternatives(
  getAlt: (index: number) => string | undefined,
  altCount: number,
): { triggered: boolean; command: string } {
  let best: { triggered: boolean; command: string } | null = null;

  for (let i = 0; i < altCount; i++) {
    const transcript = getAlt(i)?.trim();
    if (!transcript) continue;
    const parsed = parseWakeUtterance(transcript);
    if (!parsed.triggered) continue;
    if (parsed.command) return parsed;
    best = parsed;
  }

  return best ?? { triggered: false, command: "" };
}

export function stripWakeWord(transcript: string): string {
  const { command } = parseWakeUtterance(transcript);
  return command || transcript.trim();
}
