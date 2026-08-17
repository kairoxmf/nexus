export type SpeakCallbacks = {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error?: string) => void;
};

type PendingUtterance = {
  text: string;
  lang: string;
  callbacks: SpeakCallbacks;
};

let voicesCache: SpeechSynthesisVoice[] = [];
let unlocked = false;
let pendingQueue: PendingUtterance[] = [];
let activeCallbacks: SpeakCallbacks | null = null;
let safetyTimer: number | null = null;
let speakDelayTimer: number | null = null;
let speakingBusy = false;

function getSynth(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  return window.speechSynthesis;
}

function refreshVoices(): SpeechSynthesisVoice[] {
  const synth = getSynth();
  if (!synth) return [];
  const voices = synth.getVoices();
  if (voices.length) voicesCache = voices;
  return voicesCache.length ? voicesCache : voices;
}

const FEMALE_VOICE_HINT =
  /zira|hazel|susan|samantha|aria|sara|jenny|michelle|dilara|farah|helen|linda|victoria|maria|paulina|monica|nancy|hoda|naayf|female|woman|girl/i;
const MALE_VOICE_HINT =
  /david|mark|daniel|guy|male|george|james|richard|ryan|tom|andrew|brian|christopher|eric|john|steven|google.*english.*male|microsoft david|malek|naayf.*male/i;

function voiceScore(v: SpeechSynthesisVoice, lang: string): number {
  const name = `${v.name} ${v.lang}`.toLowerCase();
  const prefix = lang.split("-")[0].toLowerCase();
  const full = lang.toLowerCase();
  let score = 0;

  if (v.lang.toLowerCase() === full) score += 40;
  else if (v.lang.toLowerCase().startsWith(prefix)) score += 24;

  if (prefix === "fa" && /persian|farsi|\bfa\b|ir/i.test(name)) score += 20;
  if (MALE_VOICE_HINT.test(name)) score += 35;
  if (FEMALE_VOICE_HINT.test(name)) score -= 80;
  if (v.default) score += 4;

  return score;
}

function pickVoice(lang: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const ranked = [...voices].sort((a, b) => voiceScore(b, lang) - voiceScore(a, lang));
  const best = ranked[0];
  if (best && voiceScore(best, lang) > -40) return best;

  const maleFallback =
    voices.find((v) => MALE_VOICE_HINT.test(`${v.name} ${v.lang}`) && v.lang.toLowerCase().startsWith("en")) ??
    voices.find((v) => MALE_VOICE_HINT.test(`${v.name} ${v.lang}`));

  if (maleFallback) return maleFallback;

  return voices.find((v) => v.default) ?? voices.find((v) => v.lang.startsWith("en")) ?? voices[0] ?? null;
}

function clearSafetyTimer() {
  if (safetyTimer != null) {
    window.clearTimeout(safetyTimer);
    safetyTimer = null;
  }
}

function clearSpeakDelay() {
  if (speakDelayTimer != null) {
    window.clearTimeout(speakDelayTimer);
    speakDelayTimer = null;
  }
}

function flushQueue() {
  if (!unlocked || pendingQueue.length === 0 || speakingBusy) return;
  const next = pendingQueue.shift();
  if (next) speakNow(next.text, next.lang, next.callbacks);
}

function finishUtterance(kind: "onEnd" | "onError", error?: string) {
  const cbs = activeCallbacks;
  clearSafetyTimer();
  activeCallbacks = null;
  speakingBusy = false;
  if (kind === "onError") cbs?.onError?.(error);
  else cbs?.onEnd?.();
  flushQueue();
}

function speakNow(text: string, lang: string, callbacks: SpeakCallbacks): void {
  const synth = getSynth();
  if (!synth) {
    callbacks.onError?.("no-synth");
    return;
  }

  speakingBusy = true;
  activeCallbacks = callbacks;

  const start = () => {
    if (activeCallbacks !== callbacks) return;

    const voices = refreshVoices();
    try {
      synth.resume();
    } catch {
      /* ignore */
    }

    const u = new SpeechSynthesisUtterance(text.slice(0, 1200));
    const voice = pickVoice(lang, voices);
    const hasFaVoice = voices.some((v) => v.lang.toLowerCase().startsWith("fa"));
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    } else if (lang.toLowerCase().startsWith("fa") && !hasFaVoice) {
      u.lang = "fa-IR";
    } else {
      u.lang = lang;
    }
    const isFa = lang.toLowerCase().startsWith("fa") || u.lang.toLowerCase().startsWith("fa");
    u.rate = isFa ? 0.94 : 1.0;
    u.pitch = FEMALE_VOICE_HINT.test(`${voice?.name ?? ""} ${voice?.lang ?? ""}`) ? 0.82 : 0.9;
    u.volume = 1;

    u.onstart = () => {
      if (activeCallbacks === callbacks) callbacks.onStart?.();
    };
    u.onend = () => {
      if (activeCallbacks === callbacks) finishUtterance("onEnd");
    };
    u.onerror = (ev) => {
      if (activeCallbacks !== callbacks) return;
      const err = ev.error ?? "error";
      // Intentional cancel — treat as end so the queue can continue
      if (err === "interrupted" || err === "canceled") {
        finishUtterance("onEnd");
        return;
      }
      console.warn("[NEXUS TTS]", err, { lang: u.lang, text: text.slice(0, 48) });
      finishUtterance("onError", err);
    };

    clearSafetyTimer();
    const ms = Math.min(60000, 4000 + text.length * 80);
    safetyTimer = window.setTimeout(() => {
      if (activeCallbacks === callbacks) {
        console.warn("[NEXUS TTS] safety timeout — forcing end");
        try {
          synth.cancel();
        } catch {
          /* ignore */
        }
        finishUtterance("onEnd");
      }
    }, ms);

    try {
      synth.speak(u);
      // Some Chromium builds stay paused after cancel/resume races
      window.setTimeout(() => {
        try {
          if (synth.paused) synth.resume();
        } catch {
          /* ignore */
        }
      }, 40);
    } catch (e) {
      console.warn("[NEXUS TTS] speak failed", e);
      finishUtterance("onError", "speak-failed");
    }
  };

  // Chrome: speak() right after cancel()/recognition often never starts
  clearSpeakDelay();
  try {
    if (synth.speaking || synth.pending) synth.cancel();
  } catch {
    /* ignore */
  }
  speakDelayTimer = window.setTimeout(start, 60);
}

/** Call synchronously inside a user click/key handler. */
export function unlockSpeech(): void {
  const synth = getSynth();
  if (!synth) return;

  try {
    synth.resume();
  } catch {
    /* ignore */
  }
  refreshVoices();

  const wasLocked = !unlocked;
  unlocked = true;

  // Chrome/Edge: must utter something inside the user gesture to unlock audio
  if (wasLocked) {
    try {
      const warm = new SpeechSynthesisUtterance(" ");
      warm.volume = 0;
      warm.rate = 10;
      warm.pitch = 1;
      warm.onend = () => {
        window.setTimeout(() => flushQueue(), 40);
      };
      warm.onerror = () => {
        window.setTimeout(() => flushQueue(), 40);
      };
      synth.speak(warm);
    } catch {
      /* ignore */
    }
    window.setTimeout(() => flushQueue(), 120);
    return;
  }

  flushQueue();
}

export function isSpeechUnlocked(): boolean {
  return unlocked;
}

export function hasPendingSpeech(): boolean {
  return pendingQueue.length > 0 || speakingBusy;
}

export function preloadSpeechVoices(): void {
  refreshVoices();
  const synth = getSynth();
  if (!synth || voicesCache.length) return;
  const onVoices = () => {
    synth.removeEventListener("voiceschanged", onVoices);
    refreshVoices();
    if (unlocked) flushQueue();
  };
  synth.addEventListener("voiceschanged", onVoices);
}

export function speakText(text: string, lang: string, callbacks: SpeakCallbacks = {}): void {
  const trimmed = text.trim();
  if (!trimmed) {
    callbacks.onEnd?.();
    return;
  }

  pendingQueue.push({ text: trimmed, lang, callbacks });
  if (unlocked && !speakingBusy) flushQueue();
}

export function stopSpeech(): void {
  pendingQueue = [];
  clearSafetyTimer();
  clearSpeakDelay();
  activeCallbacks = null;
  speakingBusy = false;
  const synth = getSynth();
  if (!synth) return;
  try {
    synth.cancel();
    synth.resume();
  } catch {
    /* ignore */
  }
}

export function startSpeechKeepAlive(): () => void {
  const id = window.setInterval(() => {
    const synth = getSynth();
    if (!synth) return;
    if (synth.speaking || synth.pending) {
      try {
        synth.resume();
      } catch {
        /* ignore */
      }
    }
  }, 2500);
  return () => window.clearInterval(id);
}
