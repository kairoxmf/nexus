import { Suspense, useCallback, useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { Icon3D } from "@shared/icons";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useLocation } from "react-router-dom";
import { useI18n } from "../../i18n";
import { translate, type Locale } from "../../i18n/catalog";
import { inferSpeechLocale, speechLangFor } from "../../lib/localeSpeech";
import {
  isSpeechUnlocked,
  preloadSpeechVoices,
  speakText,
  startSpeechKeepAlive,
  stopSpeech,
  unlockSpeech,
} from "../../lib/speechSynthesis";
import { useNexusControlOptional } from "../../context/NexusControlContext";
import { CompanionRobot3D } from "./CompanionRobot3D";
import { useRobotAssistant } from "./useRobotAssistant";
import { useWakeWordListener } from "./useWakeWordListener";
import {
  getSpeechRecognition,
  isSpeechRecognitionSupported,
  primeMicFromGesture,
  startRecognitionNow,
  startRecognitionWithRetry,
  waitForMicRelease,
  type SpeechRecognitionInstance,
} from "./speechRecognition";
import { collectTranscripts } from "./voiceIntent";

const AUTO_MINIMIZE_MS = 5000;

function RobotCanvas({ anim, compact }: { anim: ReturnType<typeof useRobotAssistant>["anim"]; compact?: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%", pointerEvents: compact ? "none" : "auto" }}
    >
      <PerspectiveCamera makeDefault position={[0, 0.4, 2.4]} fov={42} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 3, 4]} intensity={1.1} color="#b8d4ff" />
      <pointLight position={[-1, 1, 2]} intensity={0.6} color="#4cc9f0" />
      <Suspense fallback={null}>
        <CompanionRobot3D anim={anim} scale={compact ? 0.85 : 1} />
      </Suspense>
      {!compact && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
          autoRotate
          autoRotateSpeed={0.5}
        />
      )}
    </Canvas>
  );
}

export function NexusRobotAssistant() {
  const { pathname } = useLocation();
  const isCommandPage = pathname === "/command";
  const { t, locale, setLocale, locales, rtl } = useI18n();
  const nexusControl = useNexusControlOptional();
  const [open, setOpen] = useState(!isCommandPage);
  const [input, setInput] = useState("");
  const [voiceOn, setVoiceOn] = useState(true);
  const [speechReady, setSpeechReady] = useState(false);
  const [wakeOn, setWakeOn] = useState(true);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [ttsDone, setTtsDone] = useState(true);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [micDenied, setMicDenied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const manualRecRef = useRef<SpeechRecognitionInstance | null>(null);
  const minimizeTimerRef = useRef<number | null>(null);
  const bubbleTimerRef = useRef<number | null>(null);
  const setAnimRef = useRef<(anim: ReturnType<typeof useRobotAssistant>["anim"]) => void>(() => {});
  const startCommandListenRef = useRef<() => void>(() => {});
  const stopMicForTtsRef = useRef<() => void>(() => {});
  const armMicRef = useRef<() => void>(() => {});

  const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  const voiceSupported = isSpeechRecognitionSupported();
  const uiSpeechLang = speechLangFor(locale);

  useEffect(() => {
    if (isCommandPage) setOpen(false);
  }, [isCommandPage]);

  const clearMinimizeTimer = useCallback(() => {
    if (minimizeTimerRef.current != null) {
      window.clearTimeout(minimizeTimerRef.current);
      minimizeTimerRef.current = null;
    }
  }, []);

  const enableSpeech = useCallback((stopMic = true) => {
    if (stopMic) stopMicForTtsRef.current();
    unlockSpeech();
  }, []);

  const scheduleMinimize = useCallback(() => {
    clearMinimizeTimer();
    minimizeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
    }, AUTO_MINIMIZE_MS);
  }, [clearMinimizeTimer]);

  const speakWithDone = useCallback(
    (text: string, speakLocale?: string, onDone?: () => void) => {
      const lang = inferSpeechLocale(text, speakLocale ?? locale);
      if (!voiceOn || !speechSupported) {
        window.setTimeout(() => {
          setAnimRef.current("idle");
          setSpeaking(false);
          setTtsDone(true);
          onDone?.();
        }, Math.min(2500, 500 + text.length * 30));
        return;
      }

      // Stop mic BEFORE TTS — Chrome drops speechSynthesis while recognition is active
      stopMicForTtsRef.current();

      if (!isSpeechUnlocked()) {
        // Queue only — first click unlocks and flushes. Don't stick speaking=true.
        setSpeaking(false);
        setTtsDone(true);
        setAnimRef.current("idle");
        speakText(text, lang, {
          onStart: () => {
            setSpeechReady(true);
            setSpeaking(true);
            setTtsDone(false);
            setAnimRef.current("speaking");
          },
          onEnd: () => {
            setSpeaking(false);
            setTtsDone(true);
            setAnimRef.current("idle");
            onDone?.();
          },
          onError: (err) => {
            setSpeaking(false);
            setTtsDone(true);
            setAnimRef.current("idle");
            if (err === "not-allowed" || !isSpeechUnlocked()) setSpeechReady(false);
            onDone?.();
          },
        });
        return;
      }

      // Mark busy immediately so wake-word standby stays paused until audio ends
      setTtsDone(false);
      setSpeaking(true);
      setAnimRef.current("speaking");

      speakText(text, lang, {
        onStart: () => {
          setSpeechReady(true);
          setSpeaking(true);
          setAnimRef.current("speaking");
        },
        onEnd: () => {
          setSpeaking(false);
          setTtsDone(true);
          setAnimRef.current("idle");
          onDone?.();
        },
        onError: (err) => {
          setSpeaking(false);
          setTtsDone(true);
          setAnimRef.current("idle");
          if (err === "not-allowed" || !isSpeechUnlocked()) setSpeechReady(false);
          onDone?.();
        },
      });
    },
    [locale, voiceOn, speechSupported],
  );

  const speak = useCallback(
    (text: string, speakLocale?: string) => speakWithDone(text, speakLocale),
    [speakWithDone],
  );

  const {
    messages,
    anim,
    loading,
    send,
    sendVoice,
    ingestSilent,
    setListening: setRobotListening,
    ensureGreeting,
    clear,
    setAnim,
  } = useRobotAssistant(speak);

  setAnimRef.current = setAnim;

  const handleWakeCommand = useCallback(
    (text: string, alternatives?: string[]) => {
      clearMinimizeTimer();
      setOpen(true);
      void sendVoice(text, alternatives);
    },
    [clearMinimizeTimer, sendVoice],
  );

  const handleNoSpeech = useCallback(() => {
    speak(t("robot_wake_no_speech"), locale);
  }, [locale, speak, t]);

  const { wakeMode, needsMicPermission, armMic, markMicArmed, startCommandListen, setManualListening, stopListening } =
    useWakeWordListener({
      enabled: wakeOn && voiceSupported,
      lang: uiSpeechLang,
      // Keep mic off while AI thinks or TTS plays — otherwise Chrome kills speechSynthesis
      pauseStandby: speaking || listening || loading || !ttsDone,
      onCommand: handleWakeCommand,
      onWakePrompt: () => {
        clearMinimizeTimer();
        setOpen(true);
        unlockSpeech();
        const fallbackTimer = window.setTimeout(() => startCommandListenRef.current(), 2200);
        speakWithDone(t("robot_wake_prompt"), locale, () => {
          window.clearTimeout(fallbackTimer);
          window.setTimeout(() => startCommandListenRef.current(), 280);
        });
      },
      onNoSpeech: handleNoSpeech,
    });

  startCommandListenRef.current = startCommandListen;
  armMicRef.current = armMic;

  stopMicForTtsRef.current = () => {
    try {
      manualRecRef.current?.abort();
    } catch {
      /* ignore */
    }
    manualRecRef.current = null;
    setListening(false);
    setRobotListening(false);
    stopListening();
  };

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const displayAnim = loading ? "thinking" : listening || wakeMode === "command" ? "listening" : anim;

  const wakeLabel =
    wakeMode === "command" || listening
      ? t("robot_wake_listening")
      : wakeMode === "standby"
        ? t("robot_wake_standby")
        : needsMicPermission
          ? t("robot_wake_mic_hint")
          : micDenied
            ? t("robot_mic_denied")
            : null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading && !speaking) {
      setTtsDone(true);
    }
  }, [loading, speaking]);

  useEffect(() => {
    if (nexusControl?.showOnboarding) return;
    const timer = window.setTimeout(() => {
      if (isSpeechUnlocked()) ensureGreeting();
    }, 700);
    return () => clearTimeout(timer);
  }, [ensureGreeting, nexusControl?.showOnboarding]);

  useEffect(() => {
    const onMicArmed = () => {
      unlockSpeech();
      armMicRef.current();
    };
    window.addEventListener("nexus-mic-armed", onMicArmed);
    return () => window.removeEventListener("nexus-mic-armed", onMicArmed);
  }, []);

  useEffect(() => {
    const onType = (ev: Event) => {
      const text = (ev as CustomEvent<{ text: string }>).detail?.text;
      if (!text) return;
      setOpen(true);
      clearMinimizeTimer();
      setInput(text);
      window.setTimeout(() => inputRef.current?.focus(), 80);
    };
    const onSubmitVoice = () => {
      if (input.trim() && !loading) {
        enableSpeech();
        clearMinimizeTimer();
        void send(input);
        setInput("");
      }
    };
    window.addEventListener("nexus-voice-type", onType);
    window.addEventListener("nexus-robot-submit", onSubmitVoice);
    return () => {
      window.removeEventListener("nexus-voice-type", onType);
      window.removeEventListener("nexus-robot-submit", onSubmitVoice);
    };
  }, [clearMinimizeTimer, enableSpeech, input, loading, send]);

  useEffect(() => {
    if (!open || loading || speaking || listening || wakeMode === "command" || !ttsDone) {
      clearMinimizeTimer();
      return;
    }
    if (input.trim()) {
      clearMinimizeTimer();
      return;
    }
    if (lastAssistant) {
      scheduleMinimize();
    }
    return clearMinimizeTimer;
  }, [open, loading, speaking, listening, wakeMode, ttsDone, input, lastAssistant?.id, scheduleMinimize, clearMinimizeTimer]);

  // Companion bubble above FAB — show on new reply / minimize, hide after 5s
  useEffect(() => {
    if (bubbleTimerRef.current != null) {
      window.clearTimeout(bubbleTimerRef.current);
      bubbleTimerRef.current = null;
    }

    if (open || !lastAssistant) {
      setBubbleVisible(false);
      return;
    }

    setBubbleVisible(true);
    bubbleTimerRef.current = window.setTimeout(() => {
      setBubbleVisible(false);
      bubbleTimerRef.current = null;
    }, AUTO_MINIMIZE_MS);

    return () => {
      if (bubbleTimerRef.current != null) {
        window.clearTimeout(bubbleTimerRef.current);
        bubbleTimerRef.current = null;
      }
    };
  }, [open, lastAssistant?.id]);

  const stopListeningRef = useRef(stopListening);
  stopListeningRef.current = stopListening;

  useEffect(() => {
    preloadSpeechVoices();
    const stopKeepAlive = startSpeechKeepAlive();

    const unlock = () => {
      enableSpeech(false);
      armMicRef.current();
      ensureGreeting();
    };
    document.addEventListener("pointerdown", unlock, { once: true, capture: true });
    document.addEventListener("keydown", unlock, { once: true, capture: true });

    const onVoices = () => preloadSpeechVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", onVoices);

    const onFocusRobot = () => {
      enableSpeech();
      clearMinimizeTimer();
      setOpen(true);
      window.setTimeout(() => inputRef.current?.focus(), 100);
    };
    window.addEventListener("nexus-robot-focus", onFocusRobot);

    return () => {
      stopKeepAlive();
      window.speechSynthesis?.removeEventListener("voiceschanged", onVoices);
      window.removeEventListener("nexus-robot-focus", onFocusRobot);
    };
  }, [clearMinimizeTimer, enableSpeech, ensureGreeting]);

  useEffect(() => {
    const onNarrate = (ev: Event) => {
      const detail = (ev as CustomEvent<{ text?: string; id?: number }>).detail;
      const text = detail?.text?.trim();
      const id = detail?.id;
      if (!text) {
        window.dispatchEvent(new CustomEvent("nexus-narrate-done", { detail: { id, skip: true } }));
        return;
      }
      enableSpeech();
      clearMinimizeTimer();
      setOpen(true);
      ingestSilent(text);
      speakWithDone(text, locale, () => {
        window.dispatchEvent(new CustomEvent("nexus-narrate-done", { detail: { id } }));
      });
    };
    window.addEventListener("nexus-robot-narrate", onNarrate);
    return () => window.removeEventListener("nexus-robot-narrate", onNarrate);
  }, [clearMinimizeTimer, enableSpeech, ingestSilent, locale, speakWithDone]);

  useEffect(() => {
    return () => {
      manualRecRef.current?.abort();
      stopListeningRef.current();
    };
  }, []);

  const openPanel = () => {
    enableSpeech(false);
    armMicRef.current();
    clearMinimizeTimer();
    setOpen(true);
  };

  const configureManualRec = useCallback(
    (rec: SpeechRecognitionInstance) => {
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 5;

      rec.onstart = () => {
        setMicDenied(false);
        setListening(true);
        setRobotListening(true);
        markMicArmed();
      };
      rec.onend = () => {
        setListening(false);
        setRobotListening(false);
        setManualListening(false);
        manualRecRef.current = null;
      };
      rec.onerror = (ev) => {
        setListening(false);
        setRobotListening(false);
        setManualListening(false);
        manualRecRef.current = null;
        if (ev.error === "not-allowed") {
          setMicDenied(true);
          speak(t("robot_mic_denied"), locale);
        } else if (ev.error !== "aborted" && ev.error !== "no-speech") {
          console.warn("Speech recognition error:", ev.error);
        }
      };
      rec.onresult = (ev) => {
        const alternatives = collectTranscripts(ev.results);
        const transcript = alternatives[0] ?? ev.results[0]?.[0]?.transcript?.trim();
        if (transcript) {
          setInput(transcript);
          void sendVoice(transcript, alternatives);
          setInput("");
        }
      };
    },
    [locale, markMicArmed, sendVoice, setManualListening, setRobotListening, speak, t],
  );

  const toggleVoiceInput = () => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;

    if (listening) {
      manualRecRef.current?.stop();
      setListening(false);
      setRobotListening(false);
      setManualListening(false);
      return;
    }

    clearMinimizeTimer();
    setOpen(true);
    unlockSpeech();
    setManualListening(true);

    const tryStart = () =>
      startRecognitionNow((instance) => {
        manualRecRef.current = instance;
        configureManualRec(instance);
      }, uiSpeechLang);

    // Keep the first attempt inside the click gesture — do not stop other listeners yet.
    primeMicFromGesture();
    const first = tryStart();
    if (first) {
      stopListening();
      return;
    }

    stopListening();
    const second = tryStart();
    if (second) return;

    void (async () => {
      for (const delay of [120, 280, 600]) {
        await waitForMicRelease(delay);
        const retry = tryStart();
        if (retry) return;
      }

      const started = await startRecognitionWithRetry(
        (instance) => {
          manualRecRef.current = instance;
          configureManualRec(instance);
        },
        uiSpeechLang,
      );

      if (!started) {
        setMicDenied(true);
        setListening(false);
        setRobotListening(false);
        setManualListening(false);
        speak(t("robot_mic_denied"), locale);
      }
    })();
  };

  const onSubmit = () => {
    if (!input.trim() || loading) return;
    enableSpeech();
    clearMinimizeTimer();
    void send(input);
    setInput("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  const composer = (ref: RefObject<HTMLInputElement | null>) => (
    <div className="ai-chat-composer nexus-robot-composer-inner">
      {voiceSupported && (
        <button
          type="button"
          className={`nexus-robot-mic${listening || wakeMode === "command" ? " is-active" : ""}`}
          onClick={toggleVoiceInput}
          aria-label={listening ? t("robot_voice_stop") : t("robot_voice_start")}
          title={listening ? t("robot_voice_stop") : t("robot_voice_start")}
        >
          <Icon3D
            name={listening || wakeMode === "command" ? "stop" : "mic"}
            size={18}
            animated={listening || wakeMode === "standby" || wakeMode === "command"}
            color={listening || wakeMode === "command" ? "#ff4655" : undefined}
          />
        </button>
      )}
      <input
        ref={ref}
        type="text"
        className="ai-chat-input nexus-robot-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={clearMinimizeTimer}
        placeholder={t("robot_placeholder")}
        autoComplete="off"
      />
      <button
        type="button"
        className="ai-chat-send nexus-robot-send"
        onClick={onSubmit}
        disabled={loading || !input.trim()}
        aria-label={t("chat_send")}
      >
        {loading ? <Icon3D name="loading" size={18} animated /> : <Icon3D name="send" size={18} animated />}
      </button>
    </div>
  );

  if (nexusControl?.showOnboarding) return null;

  return (
    <div className={`nexus-robot${open ? " is-open" : " is-companion"}${rtl ? " is-rtl" : ""}`} aria-live="polite">
      {!open && (
        <div className="nexus-robot-companion">
          {voiceOn && speechSupported && !speechReady && (
            <button type="button" className="nexus-robot-speech-tap is-compact" onClick={openPanel}>
              <Icon3D name="volume-on" size={12} animated color="#ffb347" />
              <span>{t("robot_speech_tap")}</span>
            </button>
          )}
          {lastAssistant && bubbleVisible && (
            <div className="nexus-robot-companion-bubble ai-chat-bubble">
              <p>{lastAssistant.content.slice(0, 120)}{lastAssistant.content.length > 120 ? "…" : ""}</p>
            </div>
          )}
          <button
            type="button"
            className="nexus-robot-fab"
            onClick={openPanel}
            aria-label={t("robot_expand")}
            title={t("robot_expand")}
          >
            <div className="nexus-robot-fab-canvas">
              <RobotCanvas anim={displayAnim} compact />
            </div>
            {(listening || wakeMode === "command" || loading) && (
              <span className="nexus-robot-fab-badge" aria-hidden />
            )}
            <span className="nexus-robot-fab-pulse" aria-hidden />
          </button>
        </div>
      )}

      {open && (
        <div className="nexus-robot-panel ai-chat" role="dialog" aria-label={t("robot_name")}>
          <header className="nexus-robot-header ai-chat-toolbar">
            <div className="nexus-robot-header-title">
              <strong>{t("robot_name")}</strong>
              <span>{wakeOn && wakeMode === "standby" ? t("robot_wake_standby") : t("robot_subtitle")}</span>
            </div>
            <div className="nexus-robot-header-actions">
              {voiceSupported && (
                <button
                  type="button"
                  className={`nexus-robot-icon-btn${wakeOn ? " active" : ""}`}
                  onClick={() => {
                    enableSpeech();
                    setWakeOn((v) => {
                      const next = !v;
                      if (next) window.setTimeout(() => armMicRef.current(), 300);
                      else stopListening();
                      return next;
                    });
                  }}
                  title={t("robot_wake_toggle")}
                >
                  <Icon3D name="mic" size={16} animated={wakeOn && wakeMode === "standby"} />
                </button>
              )}
              {messages.length > 0 && (
                <button type="button" className="ai-chat-clear" onClick={clear} title={t("chat_new")}>
                  <Icon3D name="refresh" size={14} animated />
                </button>
              )}
              <button
                type="button"
                className={`nexus-robot-icon-btn${voiceOn ? " active" : ""}`}
                onClick={() => {
                  setVoiceOn((v) => {
                    if (v) {
                      stopSpeech();
                      return false;
                    }
                    enableSpeech();
                    speakWithDone(t("robot_voice_enabled"), locale);
                    return true;
                  });
                }}
                title={t("robot_speak_toggle")}
              >
                <Icon3D name={voiceOn ? "volume-on" : "volume-off"} size={16} animated={voiceOn} />
              </button>
              <button
                type="button"
                className="nexus-robot-icon-btn"
                onClick={() => setOpen(false)}
                aria-label={t("robot_minimize")}
              >
                <Icon3D name="minimize" size={16} />
              </button>
            </div>
          </header>

          <div className="nexus-robot-langs" role="group" aria-label={t("language")}>
            {locales.map((l) => (
              <button
                key={l.code}
                type="button"
                className={`nexus-robot-lang-btn${locale === l.code ? " active" : ""}`}
                aria-pressed={locale === l.code}
                onClick={() => {
                  if (l.code === locale) return;
                  const next = l.code as Locale;
                  enableSpeech();
                  setLocale(next);
                  speakWithDone(translate(next, "robot_lang_switched"), next);
                }}
              >
                {l.native}
              </button>
            ))}
          </div>

          {voiceOn && speechSupported && !speechReady && (
            <button
              type="button"
              className="nexus-robot-speech-tap"
              onClick={() => {
                enableSpeech(false);
                armMicRef.current();
                ensureGreeting();
              }}
            >
              <Icon3D name="volume-on" size={14} animated color="#ffb347" />
              <span>{t("robot_speech_tap")}</span>
            </button>
          )}

          {(wakeLabel && wakeOn) || micDenied ? (
            <div
              className={`nexus-robot-wake-bar${micDenied || needsMicPermission ? " is-active" : wakeMode === "standby" ? " is-standby" : " is-active"}`}
              role={needsMicPermission || micDenied ? "button" : undefined}
              onClick={needsMicPermission || micDenied ? () => { unlockSpeech(); primeMicFromGesture(); armMicRef.current(); } : undefined}
            >
              <Icon3D name="mic" size={14} animated color={micDenied ? "#ff4655" : "#4cc9f0"} />
              <span>{micDenied ? t("robot_mic_denied") : needsMicPermission ? t("robot_wake_mic_hint") : wakeLabel}</span>
            </div>
          ) : null}

          <div className="nexus-robot-stage">
            <RobotCanvas anim={displayAnim} />
          </div>

          <div className="nexus-robot-messages ai-chat-messages nx-scroll nx-scroll-glow" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="ai-chat-welcome">
                <h3>{t("robot_name")}</h3>
                <p>{t("robot_hint")}</p>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`ai-chat-row${m.role === "user" ? " is-user" : ""}`}>
                <div className={`ai-chat-avatar${m.role === "user" ? " user" : " ai"}`}>
                  {m.role === "user" ? t("chat_you").charAt(0) : "N"}
                </div>
                <div className="ai-chat-bubble">
                  {m.role === "assistant" && <span className="ai-chat-bubble-label">{t("robot_name")}</span>}
                  <p>{m.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="ai-chat-row">
                <div className="ai-chat-avatar ai">N</div>
                <div className="ai-chat-bubble">
                  <span>{t("robot_thinking")}</span>
                  <div className="ai-chat-dots"><span /><span /><span /></div>
                </div>
              </div>
            )}
          </div>

          <div className="nexus-robot-composer">{composer(inputRef)}</div>
        </div>
      )}
    </div>
  );
}
