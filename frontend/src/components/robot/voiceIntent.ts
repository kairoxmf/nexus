/** Chrome STT often hears «برو تو کامند» / «go to command» as «to come». */

const COMMAND_SOUND =
  "(?:command|comand|commmand|comment|common|coming|come(?:\\s+(?:and|on|end))?|cmd|کامند|کماند|فرماندهی|فرمان)";

const NAV_LEAD =
  "(?:(?:please\\s+)?(?:go|open|enter|show|take\\s*me|switch|navigate|برو(?:ی)?|بریم|ببر(?:مت)?|باز\\s*کن|وارد\\s*شو)(?:\\s+(?:to|into|تو|به|توی|صفحه))?\\s+|(?:to|two|too|into|تو|به|صفحه)\\s+|borrow(?:\\s+to)?\\s+|bro\\s+|brow\\s+)";

const COMMAND_UTTERANCE = new RegExp(`^(?:${NAV_LEAD})?${COMMAND_SOUND}\\s*[.!?؟]*$`, "i");

const INTEL_UTTERANCE =
  /^(?:go\s+to\s+|open\s+|to\s+|برو(?:\s+تو)?\s+)?(intel|until|in\s*tell|اطلاعات|تحلیل)\s*[.!?؟]*$/i;

const HOME_UTTERANCE =
  /^(?:go\s+to\s+|open\s+|to\s+|برو(?:\s+تو)?\s+)?(home|hone|landing|خانه|خونه|صفحه\s*اصلی)\s*[.!?؟]*$/i;

const PROFILE_UTTERANCE =
  /^(?:go\s+to\s+|open\s+|to\s+|برو(?:\s+تو)?\s+)?(profile|pro\s*file|account|پروفایل)\s*[.!?؟]*$/i;

const CONTACT_UTTERANCE =
  /^(?:go\s+to\s+|open\s+|to\s+|برو(?:\s+تو)?\s+)?(contact|support|تماس|پشتیبانی)\s*[.!?؟]*$/i;

export function collectTranscripts(
  result: ArrayLike<{ length: number; [index: number]: { transcript?: string } }>,
  index = 0,
): string[] {
  const row = result[index];
  if (!row) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < row.length; i++) {
    const text = row[i]?.transcript?.trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out;
}

export function correctVoiceTranscript(raw: string): string {
  const q = raw.trim();
  if (!q) return q;

  if (COMMAND_UTTERANCE.test(q) || /^(to\s+|two\s+|too\s+)?come$/i.test(q)) {
    return "go to command";
  }
  if (
    /^(start|run|play|launch)?\s*(the\s+)?(voice\s+)?demo$/i.test(q) ||
    /شروع\s*(کن\s*)?(دمو|demo)|دمو\s*(رو\s*)?(شروع|صوتی)|دموی\s*صوتی/i.test(q)
  ) {
    return "start demo";
  }
  if (INTEL_UTTERANCE.test(q)) return "go to intel";
  if (HOME_UTTERANCE.test(q)) return "go to home";
  if (PROFILE_UTTERANCE.test(q)) return "go to profile";
  if (CONTACT_UTTERANCE.test(q)) return "go to contact";

  if (q.length <= 56) {
    let next = q
      .replace(/\b(borrow|bro|brow|go\s+through)\s+(to\s+)?(come|coming|comment|common|comand|command)\b/gi, "go to command")
      .replace(/\b(go\s+to\s+|go\s+|open\s+|to\s+|two\s+|too\s+|into\s+)(come|coming|comment|common|comand)\b/gi, "go to command")
      .replace(/\b(go\s+to\s+|to\s+)?(the\s+)?(come\s+and|command\s+page|command\s+center)\b/gi, "go to command");
    if (/^(go\s+to\s+)?command$/i.test(next.trim())) return "go to command";
    if (next !== q) return next;
  }

  return q;
}

export function resolveVoiceText(raw: string, alternatives: string[] = []): string {
  const seen = new Set<string>();
  const list: string[] = [];
  for (const item of [raw, ...alternatives]) {
    const text = item.trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    list.push(text);
  }
  if (!list.length) return raw.trim();

  for (const item of list) {
    const corrected = correctVoiceTranscript(item);
    if (corrected !== item) return corrected;
    if (COMMAND_UTTERANCE.test(item)) return "go to command";
  }

  return correctVoiceTranscript(list[0]);
}
