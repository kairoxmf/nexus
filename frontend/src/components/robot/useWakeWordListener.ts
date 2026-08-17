import { useCallback, useEffect, useRef, useState } from "react";
import { looksLikeWakeResidue, parseWakeFromAlternatives, parseWakeUtterance } from "./wakeWord";
import {
  getSpeechRecognition,
  markMicPermissionGranted,
  primeMicFromGesture,
  commandRecognitionLangs,
  requestMicPermission,
  waitForMicRelease,
  type SpeechRecognitionInstance,
} from "./speechRecognition";

export type WakeMode = "off" | "standby" | "command" | "manual";

type Options = {
  enabled: boolean;
  lang: string;
  /** Pause wake-word scanning only (not follow-up question capture). */
  pauseStandby: boolean;
  onCommand: (text: string, alternatives?: string[]) => void;
  /** Called when wake word heard without a question — call startCommandListen after TTS ends. */
  onWakePrompt?: () => void;
  onNoSpeech?: () => void;
};

export function useWakeWordListener({
  enabled,
  lang,
  pauseStandby,
  onCommand,
  onWakePrompt,
  onNoSpeech,
}: Options) {
  const [mode, setMode] = useState<WakeMode>("off");
  const [needsMicPermission, setNeedsMicPermission] = useState(false);
  const recRef = useRef<SpeechRecognitionInstance | null>(null);
  const modeRef = useRef<WakeMode>("off");
  const enabledRef = useRef(enabled);
  const pauseStandbyRef = useRef(pauseStandby);
  const awaitingQuestionRef = useRef(false);
  const onCommandRef = useRef(onCommand);
  const onWakePromptRef = useRef(onWakePrompt);
  const onNoSpeechRef = useRef(onNoSpeech);
  const restartTimer = useRef<number | null>(null);
  const commandTimerRef = useRef<number | null>(null);
  const commandCommitTimerRef = useRef<number | null>(null);
  const lastHeardRef = useRef("");
  const wakeDebounceRef = useRef<number | null>(null);
  const holdFollowUpRef = useRef(false);
  const followUpDeadlineRef = useRef(0);
  const commandRetryRef = useRef(0);
  const armedRef = useRef(false);
  const startGenRef = useRef(0);
  const startCommandListenRef = useRef<() => void>(() => {});

  enabledRef.current = enabled;
  pauseStandbyRef.current = pauseStandby;
  onCommandRef.current = onCommand;
  onWakePromptRef.current = onWakePrompt;
  onNoSpeechRef.current = onNoSpeech;

  const setModeSafe = useCallback((next: WakeMode) => {
    modeRef.current = next;
    setMode(next);
  }, []);

  const clearRestart = useCallback(() => {
    if (restartTimer.current != null) {
      window.clearTimeout(restartTimer.current);
      restartTimer.current = null;
    }
  }, []);

  const clearCommandTimer = useCallback(() => {
    if (commandTimerRef.current != null) {
      window.clearTimeout(commandTimerRef.current);
      commandTimerRef.current = null;
    }
  }, []);

  const clearCommandCommit = useCallback(() => {
    if (commandCommitTimerRef.current != null) {
      window.clearTimeout(commandCommitTimerRef.current);
      commandCommitTimerRef.current = null;
    }
    lastHeardRef.current = "";
  }, []);

  const clearWakeDebounce = useCallback(() => {
    if (wakeDebounceRef.current != null) {
      window.clearTimeout(wakeDebounceRef.current);
      wakeDebounceRef.current = null;
    }
  }, []);

  const stopRec = useCallback(() => {
    clearRestart();
    clearCommandTimer();
    clearCommandCommit();
    clearWakeDebounce();
    try {
      recRef.current?.abort();
    } catch {
      recRef.current?.stop();
    }
    recRef.current = null;
  }, [clearCommandCommit, clearCommandTimer, clearRestart, clearWakeDebounce]);

  const scheduleStandby = useCallback(
    (delayMs = 400) => {
      clearRestart();
      restartTimer.current = window.setTimeout(() => {
        if (!enabledRef.current || pauseStandbyRef.current || modeRef.current === "manual") return;
        if (holdFollowUpRef.current || modeRef.current === "command") return;
        awaitingQuestionRef.current = false;
        startStandbyRef.current();
      }, delayMs);
    },
    [clearRestart],
  );

  const resumeStandbySoon = useCallback(
    (delayMs = 320) => {
      if (holdFollowUpRef.current && Date.now() < followUpDeadlineRef.current) return;
      awaitingQuestionRef.current = false;
      if (modeRef.current === "command") setModeSafe("off");
      scheduleStandby(delayMs);
    },
    [scheduleStandby, setModeSafe],
  );

  const deliverCommand = useCallback(
    (text: string, alternatives: string[] = []) => {
      const cleaned = text.trim();
      if (!cleaned) return;
      holdFollowUpRef.current = false;
      awaitingQuestionRef.current = false;
      commandRetryRef.current = 0;
      followUpDeadlineRef.current = 0;
      setModeSafe("off");
      stopRec();
      onCommandRef.current(cleaned, alternatives);
    },
    [setModeSafe, stopRec],
  );

  const commitFollowUp = useCallback(
    (raw: string, altCount = 1, getAlt?: (i: number) => string | undefined) => {
      const alternatives: string[] = [];
      if (getAlt) {
        for (let i = 0; i < altCount; i++) {
          const item = getAlt(i)?.trim();
          if (item) alternatives.push(item);
        }
      }
      if (!alternatives.includes(raw.trim()) && raw.trim()) alternatives.unshift(raw.trim());

      const parsed = getAlt
        ? parseWakeFromAlternatives(getAlt, altCount)
        : parseWakeUtterance(raw);
      const text = (parsed.triggered ? parsed.command : raw).trim();
      if (!text || text.length < 2 || looksLikeWakeResidue(text)) return false;
      clearCommandTimer();
      clearCommandCommit();
      deliverCommand(text, alternatives);
      return true;
    },
    [clearCommandCommit, clearCommandTimer, deliverCommand],
  );

  const attachCommandHandlers = useCallback(
    (rec: SpeechRecognitionInstance, listenLang: string) => {
      rec.lang = listenLang;
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 5;

      rec.onstart = () => {
        if (recRef.current !== rec) return;
        markMicPermissionGranted();
        setModeSafe("command");
        setNeedsMicPermission(false);
      };

      rec.onresult = (ev) => {
        if (recRef.current !== rec) return;
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const result = ev.results[i];
          if (!result) continue;
          const transcript = result[0]?.transcript?.trim() ?? "";
          if (!transcript) continue;

          if (result.isFinal) {
            if (commitFollowUp(transcript, result.length, (idx) => result[idx]?.transcript)) return;
            continue;
          }

          lastHeardRef.current = transcript;
          if (commandCommitTimerRef.current != null) window.clearTimeout(commandCommitTimerRef.current);
          commandCommitTimerRef.current = window.setTimeout(() => {
            commandCommitTimerRef.current = null;
            const heard = lastHeardRef.current;
            if (heard.trim().length >= 2) commitFollowUp(heard);
          }, 1400);
        }
      };

      rec.onerror = (ev) => {
        if (recRef.current !== rec) return;
        if (pauseStandbyRef.current && ev.error !== "not-allowed") return;
        if (ev.error === "not-allowed") {
          holdFollowUpRef.current = false;
          armedRef.current = false;
          setNeedsMicPermission(true);
          clearCommandTimer();
          resumeStandbySoon(420);
          return;
        }
        if (ev.error === "no-speech") {
          if (lastHeardRef.current.trim().length >= 2) {
            commitFollowUp(lastHeardRef.current);
            return;
          }
          if (holdFollowUpRef.current && Date.now() < followUpDeadlineRef.current) {
            commandRetryRef.current += 1;
            try {
              recRef.current?.abort();
            } catch {
              /* ignore */
            }
            recRef.current = null;
            window.setTimeout(() => startCommandListenRef.current(), 220);
            return;
          }
          holdFollowUpRef.current = false;
          awaitingQuestionRef.current = false;
          onNoSpeechRef.current?.();
          clearCommandTimer();
          resumeStandbySoon(420);
          return;
        }
        if (ev.error !== "aborted") {
          console.warn("Wake command error:", ev.error);
        }
      };

      rec.onend = () => {
        if (recRef.current !== rec) return;
        recRef.current = null;
        if (pauseStandbyRef.current) return;
        if (modeRef.current !== "command" || !holdFollowUpRef.current) return;
        if (lastHeardRef.current.trim().length >= 2) {
          commitFollowUp(lastHeardRef.current);
          return;
        }
        if (commandRetryRef.current < 8 && awaitingQuestionRef.current && Date.now() < followUpDeadlineRef.current) {
          commandRetryRef.current += 1;
          window.setTimeout(() => startCommandListenRef.current(), 200);
          return;
        }
        holdFollowUpRef.current = false;
        awaitingQuestionRef.current = false;
        resumeStandbySoon(360);
      };
    },
    [clearCommandTimer, commitFollowUp, resumeStandbySoon, setModeSafe],
  );

  const startCommandListen = useCallback(() => {
    const Ctor = getSpeechRecognition();
    if (!Ctor || !enabledRef.current) return;

    holdFollowUpRef.current = true;
    awaitingQuestionRef.current = true;
    if (!followUpDeadlineRef.current || Date.now() >= followUpDeadlineRef.current) {
      followUpDeadlineRef.current = Date.now() + 18000;
    }
    setModeSafe("command");

    if (recRef.current) return;

    if (!armedRef.current) {
      primeMicFromGesture();
      armedRef.current = true;
      void requestMicPermission().then((micOk) => setNeedsMicPermission(!micOk));
    }

    const langs = commandRecognitionLangs(lang);
    const listenLang = langs[commandRetryRef.current % langs.length] ?? lang;

    const startNow = () => {
      if (!enabledRef.current || !armedRef.current || !holdFollowUpRef.current) return false;
      if (recRef.current) return true;

      const gen = ++startGenRef.current;
      const rec = new Ctor();
      recRef.current = rec;
      attachCommandHandlers(rec, listenLang);

      try {
        rec.start();
        clearCommandTimer();
        const remain = Math.max(4000, followUpDeadlineRef.current - Date.now());
        commandTimerRef.current = window.setTimeout(() => {
          if (modeRef.current === "command" && awaitingQuestionRef.current) {
            if (lastHeardRef.current.trim().length >= 2) {
              commitFollowUp(lastHeardRef.current);
              return;
            }
            holdFollowUpRef.current = false;
            awaitingQuestionRef.current = false;
            stopRec();
            onNoSpeechRef.current?.();
          }
        }, remain);
        return gen === startGenRef.current;
      } catch (err) {
        console.warn("Command listen start failed:", err);
        recRef.current = null;
        return false;
      }
    };

    if (startNow()) return;
    void waitForMicRelease(120).then(() => {
      if (startNow()) return;
      void waitForMicRelease(280).then(() => {
        if (!startNow() && holdFollowUpRef.current) {
          commandRetryRef.current += 1;
          window.setTimeout(() => startCommandListenRef.current(), 240);
        }
      });
    });
  }, [attachCommandHandlers, clearCommandTimer, commitFollowUp, lang, setModeSafe, stopRec]);

  startCommandListenRef.current = startCommandListen;

  const handleWake = useCallback(
    (_command?: string, _alternatives: string[] = []) => {
      // Always two-step like Siri: say «Yes», then listen. Discard leftover STT like «news».
      lastHeardRef.current = "";
      stopRec();
      holdFollowUpRef.current = true;
      awaitingQuestionRef.current = true;
      commandRetryRef.current = 0;
      followUpDeadlineRef.current = Date.now() + 18000;
      setModeSafe("command");
      onWakePromptRef.current?.();
    },
    [setModeSafe, stopRec],
  );

  const startStandbyRef = useRef<() => void>(() => {});
  const startStandbyImmediateRef = useRef<() => boolean>(() => false);

  const attachStandbyHandlers = (rec: SpeechRecognitionInstance) => {
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 5;
    rec.lang = lang;

    rec.onstart = () => {
      markMicPermissionGranted();
      setNeedsMicPermission(false);
      if (enabledRef.current && !pauseStandbyRef.current) setModeSafe("standby");
    };

    rec.onresult = (ev) => {
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const result = ev.results[i];
        if (!result) continue;

        if (awaitingQuestionRef.current) {
          if (!result.isFinal) {
            const interim = result[0]?.transcript?.trim();
            if (interim && !looksLikeWakeResidue(interim)) lastHeardRef.current = interim;
            continue;
          }
          const transcript = result[0]?.transcript?.trim();
          if (!transcript || looksLikeWakeResidue(transcript)) continue;
          stopRec();
          const alts: string[] = [];
          for (let a = 0; a < result.length; a++) {
            const item = result[a]?.transcript?.trim();
            if (item) alts.push(item);
          }
          deliverCommand(transcript, alts);
          return;
        }

        const parsed = parseWakeFromAlternatives(
          (idx) => result[idx]?.transcript,
          result.length,
        );
        const transcript = result[0]?.transcript?.trim() ?? "";
        if (!parsed.triggered && !transcript) continue;

        if (!result.isFinal) {
          if (parsed.triggered) {
            clearWakeDebounce();
            wakeDebounceRef.current = window.setTimeout(() => {
              wakeDebounceRef.current = null;
              handleWake("");
            }, 500);
          }
          continue;
        }

        clearWakeDebounce();
        if (parsed.triggered) {
          handleWake("");
          return;
        }
      }
    };

    rec.onerror = (ev) => {
      if (recRef.current !== rec) return;
      if (ev.error === "not-allowed") {
        armedRef.current = false;
        setNeedsMicPermission(true);
        setModeSafe("off");
        return;
      }
      if (ev.error !== "aborted" && ev.error !== "no-speech") {
        console.warn("Wake standby error:", ev.error);
      }
      if (
        enabledRef.current &&
        !pauseStandbyRef.current &&
        !holdFollowUpRef.current &&
        modeRef.current !== "command"
      ) {
        resumeStandbySoon(680);
      }
    };

    rec.onend = () => {
      if (recRef.current !== rec) return;
      recRef.current = null;
      if (holdFollowUpRef.current && Date.now() < followUpDeadlineRef.current) {
        window.setTimeout(() => startCommandListenRef.current(), 200);
        return;
      }
      if (
        enabledRef.current &&
        !pauseStandbyRef.current &&
        modeRef.current !== "manual" &&
        modeRef.current !== "command"
      ) {
        resumeStandbySoon(420);
      }
    };
  };

  startStandbyImmediateRef.current = () => {
    const Ctor = getSpeechRecognition();
    if (
      !Ctor ||
      !enabledRef.current ||
      !armedRef.current ||
      pauseStandbyRef.current ||
      holdFollowUpRef.current ||
      modeRef.current === "manual" ||
      modeRef.current === "command"
    ) {
      return false;
    }

    const gen = ++startGenRef.current;
    stopRec();
    setModeSafe("standby");

    const rec = new Ctor();
    recRef.current = rec;
    attachStandbyHandlers(rec);

    try {
      rec.start();
      if (gen !== startGenRef.current) {
        try {
          rec.abort();
        } catch {
          /* ignore */
        }
        return false;
      }
      setNeedsMicPermission(false);
      return true;
    } catch {
      recRef.current = null;
      return false;
    }
  };

  startStandbyRef.current = () => {
    const Ctor = getSpeechRecognition();
    if (
      !Ctor ||
      !enabledRef.current ||
      !armedRef.current ||
      pauseStandbyRef.current ||
      holdFollowUpRef.current ||
      modeRef.current === "manual" ||
      modeRef.current === "command"
    ) {
      return;
    }

    const gen = ++startGenRef.current;
    stopRec();
    setModeSafe("standby");

    void waitForMicRelease(180).then(() => {
      if (
        gen !== startGenRef.current ||
        !enabledRef.current ||
        !armedRef.current ||
        pauseStandbyRef.current ||
        holdFollowUpRef.current ||
        modeRef.current === "manual" ||
        modeRef.current === "command"
      ) {
        return;
      }

      const rec = new Ctor();
      recRef.current = rec;
      attachStandbyHandlers(rec);

      try {
        rec.start();
        setNeedsMicPermission(false);
      } catch (err) {
        console.warn("Standby recognition start failed:", err);
        scheduleStandby(1200);
      }
    });
  };

  const startStandby = useCallback(() => {
    startStandbyRef.current();
  }, []);

  const setManualListening = useCallback(
    (active: boolean) => {
      if (active) {
        holdFollowUpRef.current = false;
        awaitingQuestionRef.current = false;
        stopRec();
        setModeSafe("manual");
        return;
      }
      if (modeRef.current !== "manual") return;
      if (enabledRef.current && !pauseStandbyRef.current && !holdFollowUpRef.current) {
        scheduleStandby(400);
      } else {
        setModeSafe("off");
      }
    },
    [scheduleStandby, setModeSafe, stopRec],
  );

  const armMic = useCallback(() => {
    primeMicFromGesture();
    armedRef.current = true;
    setNeedsMicPermission(false);

    if (
      !enabledRef.current ||
      pauseStandbyRef.current ||
      holdFollowUpRef.current ||
      modeRef.current === "manual" ||
      modeRef.current === "command"
    ) {
      return;
    }

    if (startStandbyImmediateRef.current()) return;

    window.setTimeout(() => {
      if (
        !enabledRef.current ||
        pauseStandbyRef.current ||
        holdFollowUpRef.current ||
        modeRef.current === "manual" ||
        modeRef.current === "command"
      ) {
        return;
      }
      if (startStandbyImmediateRef.current()) return;
      void requestMicPermission().then((micOk) => {
        setNeedsMicPermission(!micOk);
        startStandbyRef.current();
      });
    }, 120);
  }, []);

  const markMicArmed = useCallback(() => {
    armedRef.current = true;
    setNeedsMicPermission(false);
    if (
      enabledRef.current &&
      !pauseStandbyRef.current &&
      !holdFollowUpRef.current &&
      modeRef.current !== "manual" &&
      modeRef.current !== "command"
    ) {
      startStandbyRef.current();
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      holdFollowUpRef.current = false;
      awaitingQuestionRef.current = false;
      armedRef.current = false;
      stopRec();
      setModeSafe("off");
      setNeedsMicPermission(false);
      return;
    }

    if (!armedRef.current) {
      setNeedsMicPermission(true);
      if (modeRef.current === "standby") stopRec();
      return;
    }

    if (pauseStandby) {
      if (modeRef.current === "standby" || modeRef.current === "command") stopRec();
      return;
    }

    if (holdFollowUpRef.current || modeRef.current === "command") {
      if (!recRef.current) startCommandListen();
      return;
    }

    awaitingQuestionRef.current = false;

    if (modeRef.current !== "manual") {
      startStandby();
    }

    return () => {
      if (modeRef.current === "standby") stopRec();
    };
  }, [enabled, pauseStandby, startCommandListen, startStandby, stopRec, setModeSafe]);

  /** Recover if Chrome silently drops the standby or follow-up session. */
  useEffect(() => {
    if (!enabled || pauseStandby) return;
    const watchdog = window.setInterval(() => {
      if (!enabledRef.current || !armedRef.current) return;
      if (pauseStandbyRef.current && !holdFollowUpRef.current) return;
      if (modeRef.current === "manual") return;
      if (holdFollowUpRef.current) {
        if (Date.now() >= followUpDeadlineRef.current) return;
        if (!recRef.current) startCommandListenRef.current();
        return;
      }
      if (modeRef.current === "command") return;
      if (!recRef.current && modeRef.current !== "off") setModeSafe("off");
      if (!recRef.current) resumeStandbySoon(120);
    }, 900);
    return () => window.clearInterval(watchdog);
  }, [enabled, pauseStandby, resumeStandbySoon, setModeSafe]);

  useEffect(() => () => stopRec(), [stopRec]);

  return {
    wakeMode: mode,
    needsMicPermission,
    armMic,
    markMicArmed,
    startStandby,
    startCommandListen,
    setManualListening,
    stopListening: stopRec,
  };
}
