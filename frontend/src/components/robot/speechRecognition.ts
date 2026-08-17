export type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onresult: ((ev: {
    resultIndex: number;
    results: ArrayLike<{
      isFinal: boolean;
      length: number;
      [index: number]: { transcript?: string };
    }>;
  }) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};

export type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

export function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return !!getSpeechRecognition();
}

/** Chrome needs a short gap after abort/stop before a new recognition session. */
export function waitForMicRelease(ms = 160): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

let micPermissionGranted = false;
let micPermissionPromise: Promise<boolean> | null = null;

export type MicPermissionReason = "denied" | "not-found" | "in-use" | "insecure" | "unsupported" | "unknown";

export function isMicPermissionGranted(): boolean {
  return micPermissionGranted;
}

export function markMicPermissionGranted(): void {
  micPermissionGranted = true;
}

/** Call synchronously inside a click/key handler — starts getUserMedia without blocking. */
export function primeMicFromGesture(): void {
  void requestMicPermission();
}

export function startRecognitionNow(
  configure: (rec: SpeechRecognitionInstance, lang: string) => void,
  lang: string,
): SpeechRecognitionInstance | null {
  const Ctor = getSpeechRecognition();
  if (!Ctor) return null;

  const candidate = recognitionLangCandidates(lang)[0] ?? "en-US";
  const rec = new Ctor();
  configure(rec, candidate);
  rec.lang = candidate;

  try {
    rec.start();
    return rec;
  } catch {
    return null;
  }
}

/** Prime browser mic permission before SpeechRecognition (avoids not-allowed on first use). */
export async function requestMicPermission(): Promise<boolean> {
  if (micPermissionGranted) return true;
  if (micPermissionPromise) return micPermissionPromise;

  micPermissionPromise = (async () => {
    if (typeof navigator === "undefined") return false;
    if (typeof window !== "undefined" && !window.isSecureContext) return false;
    if (!navigator.mediaDevices?.getUserMedia) return true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      stream.getTracks().forEach((track) => track.stop());
      micPermissionGranted = true;
      return true;
    } catch {
      micPermissionGranted = false;
      return false;
    } finally {
      micPermissionPromise = null;
    }
  })();

  return micPermissionPromise;
}

export async function getMicPermissionReason(): Promise<MicPermissionReason | null> {
  if (micPermissionGranted) return null;
  if (typeof navigator === "undefined") return "unsupported";
  if (typeof window !== "undefined" && !window.isSecureContext) return "insecure";
  if (!navigator.mediaDevices?.getUserMedia) return null;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    micPermissionGranted = true;
    return null;
  } catch (err) {
    micPermissionGranted = false;
    const name = err instanceof DOMException ? err.name : "unknown";
    if (name === "NotAllowedError" || name === "PermissionDeniedError") return "denied";
    if (name === "NotFoundError" || name === "DevicesNotFoundError") return "not-found";
    if (name === "NotReadableError" || name === "TrackStartError") return "in-use";
    return "unknown";
  }
}

const LANG_FALLBACKS: Record<string, string[]> = {
  "fa-IR": ["fa-IR", "en-US", "fa"],
  "ar-SA": ["ar-SA", "en-US"],
  "es-ES": ["es-ES", "en-US"],
  "fr-FR": ["fr-FR", "en-US"],
  en: ["en-US", "en-GB"],
  "en-US": ["en-US", "en-GB"],
};

export function recognitionLangCandidates(lang: string): string[] {
  const list = LANG_FALLBACKS[lang];
  if (list) return list;
  return [lang || "en-US"];
}

/** Follow-up questions: cycle UI language, OS language, Persian, and English. */
export function commandRecognitionLangs(uiLang: string): string[] {
  const nav = typeof navigator !== "undefined" ? navigator.language || "" : "";
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (value: string) => {
    const v = value.trim();
    if (!v || seen.has(v)) return;
    seen.add(v);
    out.push(v);
  };
  if (/^(fa|ar)/i.test(nav) || uiLang.toLowerCase().startsWith("fa") || uiLang.toLowerCase().startsWith("ar")) {
    push(nav.startsWith("fa") ? "fa-IR" : nav);
    push("fa-IR");
    push(uiLang);
    push("en-US");
  } else {
    push(uiLang);
    push("en-US");
    push("fa-IR");
    push(nav);
  }
  return out.length ? out : ["en-US"];
}

export async function startRecognitionWithRetry(
  configure: (rec: SpeechRecognitionInstance, lang: string) => void,
  lang: string,
): Promise<{ rec: SpeechRecognitionInstance; lang: string } | null> {
  const Ctor = getSpeechRecognition();
  if (!Ctor) return null;

  // Prime permission when possible, but still try recognition — Chrome may prompt on rec.start().
  await requestMicPermission();

  await waitForMicRelease();

  for (const candidate of recognitionLangCandidates(lang)) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const rec = new Ctor();
      configure(rec, candidate);
      rec.lang = candidate;

      let permissionDenied = false;
      const started = await new Promise<boolean>((resolve) => {
        let settled = false;
        const finish = (ok: boolean) => {
          if (settled) return;
          settled = true;
          resolve(ok);
        };

        const prevStart = rec.onstart;
        const prevError = rec.onerror;

        rec.onstart = () => {
          markMicPermissionGranted();
          prevStart?.();
          finish(true);
        };
        rec.onerror = (ev) => {
          prevError?.(ev);
          if (ev.error === "aborted") return;
          if (ev.error === "not-allowed") permissionDenied = true;
          finish(false);
        };

        try {
          rec.start();
        } catch {
          finish(false);
          return;
        }

        window.setTimeout(() => {
          if (!settled) {
            try {
              rec.abort();
            } catch {
              /* ignore */
            }
            finish(false);
          }
        }, micPermissionGranted ? 2200 : 12000);
      });

      if (permissionDenied) return null;
      if (started) return { rec, lang: candidate };
      try {
        rec.abort();
      } catch {
        /* ignore */
      }
      await waitForMicRelease(220);
    }
  }

  return null;
}
