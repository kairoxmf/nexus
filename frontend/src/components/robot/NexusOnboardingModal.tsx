import { useCallback, useEffect, useRef, useState } from "react";
import { Icon3D } from "@shared/icons";
import { useNexusControl } from "../../context/NexusControlContext";
import { useI18n } from "../../i18n";
import { inferSpeechLocale, speechLangFor } from "../../lib/localeSpeech";
import { requestMicPermission } from "./speechRecognition";
import {
  isSpeechUnlocked,
  speakText,
  stopSpeech,
  unlockSpeech,
} from "../../lib/speechSynthesis";
import { NexusModal } from "../../ui/NexusModal";

type Step = "welcome" | "voice" | "gesture" | "done";

const STEPS: Step[] = ["welcome", "voice", "gesture", "done"];

function dispatchMicArmed(): void {
  window.dispatchEvent(new CustomEvent("nexus-mic-armed"));
}

export function NexusOnboardingModal() {
  const { t, locale } = useI18n();
  const { showOnboarding, completeOnboarding } = useNexusControl();
  const [step, setStep] = useState<Step>("welcome");
  const [reading, setReading] = useState(false);
  const [micOk, setMicOk] = useState<boolean | null>(null);
  const [cameraOk, setCameraOk] = useState<boolean | null>(null);
  const [enableGesture, setEnableGesture] = useState(false);
  const [busy, setBusy] = useState(false);
  const spokeRef = useRef(false);

  const welcomeSpeech = `${t("onboarding_welcome_body")} ${t("onboarding_voice_body")}`;
  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const readWelcome = useCallback(() => {
    unlockSpeech();
    setReading(true);
    const lang = speechLangFor(inferSpeechLocale(welcomeSpeech, locale));
    speakText(welcomeSpeech, lang, {
      onEnd: () => setReading(false),
      onError: () => setReading(false),
    });
  }, [welcomeSpeech, locale]);

  useEffect(() => {
    if (!showOnboarding) return;
    setStep("welcome");
    setMicOk(null);
    setCameraOk(null);
    setEnableGesture(false);
    setBusy(false);
    spokeRef.current = false;
  }, [showOnboarding]);

  useEffect(() => {
    if (!showOnboarding || step !== "welcome" || spokeRef.current) return;
    if (!isSpeechUnlocked()) return;
    spokeRef.current = true;
    readWelcome();
  }, [showOnboarding, step, readWelcome]);

  const handleEnableMic = async () => {
    unlockSpeech();
    setBusy(true);
    const ok = await requestMicPermission();
    setMicOk(ok);
    setBusy(false);
    if (ok) {
      dispatchMicArmed();
      setStep("gesture");
    }
  };

  const handleEnableCamera = async () => {
    setBusy(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      stream.getTracks().forEach((tr) => tr.stop());
      setCameraOk(true);
      setEnableGesture(true);
      setStep("done");
    } catch {
      setCameraOk(false);
      setEnableGesture(false);
      setStep("done");
    } finally {
      setBusy(false);
    }
  };

  const handleSkipCamera = () => {
    setEnableGesture(false);
    setCameraOk(null);
    setStep("done");
  };

  const handleSkipTour = () => {
    stopSpeech();
    completeOnboarding({ enableGesture: false, micGranted: micOk === true });
  };

  const handleFinish = () => {
    stopSpeech();
    unlockSpeech();
    const done = () => completeOnboarding({ enableGesture, micGranted: micOk === true });
    if (!isSpeechUnlocked()) {
      done();
      return;
    }
    const lang = speechLangFor(inferSpeechLocale(t("onboarding_done_speech"), locale));
    speakText(t("onboarding_done_speech"), lang, {
      onEnd: done,
      onError: done,
    });
  };

  if (!showOnboarding) return null;

  return (
    <NexusModal
      open
      closable={false}
      onClose={handleSkipTour}
      title={t("onboarding_title")}
      subtitle={t("onboarding_sub")}
    >
      <div className="nx-onboarding">
        <div className="nx-onboarding-progress" aria-hidden>
          <div className="nx-onboarding-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="nx-onboarding-steps" aria-hidden>
          {STEPS.map((s, i) => (
            <span key={s} className={`nx-onboarding-step${i <= stepIndex ? " active" : ""}${i === stepIndex ? " current" : ""}`}>
              <span className="nx-onboarding-step-num">{i + 1}</span>
              {t(`onboarding_step_${s}` as "onboarding_step_welcome")}
            </span>
          ))}
        </div>

        {step === "welcome" && (
          <div className="nx-onboarding-panel">
            <div className="nx-onboarding-icon">
              <Icon3D name="vr" size={48} animated color="#4cc9f0" />
            </div>
            <p className="nx-onboarding-text">{t("onboarding_welcome_body")}</p>
            <p className="nx-onboarding-text muted">{t("onboarding_voice_body")}</p>
            <button type="button" className="nx-btn" onClick={readWelcome} disabled={reading}>
              <Icon3D name={reading ? "loading" : "volume-on"} size={16} animated={reading} />
              {reading ? t("onboarding_listening") : t("onboarding_read_aloud")}
            </button>
            <button
              type="button"
              className="nx-btn-ghost"
              onClick={() => {
                unlockSpeech();
                setStep("voice");
              }}
            >
              {t("onboarding_continue")} →
            </button>
          </div>
        )}

        {step === "voice" && (
          <div className="nx-onboarding-panel">
            <div className="nx-onboarding-icon">
              <Icon3D name="mic" size={40} animated color="#4cc9f0" />
            </div>
            <p className="nx-onboarding-text">{t("onboarding_voice_body")}</p>
            <button type="button" className="nx-btn" disabled={busy} onClick={() => void handleEnableMic()}>
              <Icon3D name="mic" size={16} animated />
              {busy ? t("onboarding_listening") : t("onboarding_enable_mic")}
            </button>
            {micOk === false && (
              <p className="nx-onboarding-note warn">{t("onboarding_mic_fail")}</p>
            )}
            {micOk === true && (
              <p className="nx-onboarding-note ok">{t("onboarding_mic_ok")}</p>
            )}
            <div className="nx-onboarding-actions-row">
              {micOk !== true && (
                <button type="button" className="nx-btn-ghost" onClick={() => setStep("gesture")}>
                  {t("onboarding_skip_mic")} →
                </button>
              )}
              {micOk === true && (
                <button type="button" className="nx-btn" onClick={() => setStep("gesture")}>
                  {t("onboarding_continue")} →
                </button>
              )}
            </div>
          </div>
        )}

        {step === "gesture" && (
          <div className="nx-onboarding-panel">
            <div className="nx-onboarding-icon">
              <Icon3D name="vr" size={40} animated color="#a78bfa" />
            </div>
            <p className="nx-onboarding-text">{t("onboarding_gesture_body")}</p>
            <p className="nx-onboarding-hint">{t("gesture_pan_hint")}</p>
            <button type="button" className="nx-btn" disabled={busy} onClick={() => void handleEnableCamera()}>
              <Icon3D name="vr" size={16} animated />
              {busy ? t("gesture_loading") : t("onboarding_enable_camera")}
            </button>
            <button type="button" className="nx-btn-ghost" onClick={handleSkipCamera}>
              {t("onboarding_skip_camera")}
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="nx-onboarding-panel">
            <div className="nx-onboarding-icon">
              <Icon3D name="check" size={44} animated color="#33c17a" />
            </div>
            <p className="nx-onboarding-text">{t("onboarding_done_body")}</p>
            {micOk && <p className="nx-onboarding-note ok">{t("onboarding_mic_ok")}</p>}
            {micOk === false && (
              <p className="nx-onboarding-note warn">{t("onboarding_mic_fail")}</p>
            )}
            {enableGesture && cameraOk && (
              <p className="nx-onboarding-note ok">{t("onboarding_camera_ok")}</p>
            )}
            {cameraOk === false && (
              <p className="nx-onboarding-note warn">{t("onboarding_camera_fail")}</p>
            )}
            {!enableGesture && (
              <p className="nx-onboarding-note">{t("onboarding_gesture_later")}</p>
            )}
            <button type="button" className="nx-btn nx-onboarding-finish" onClick={handleFinish}>
              {t("onboarding_finish")}
            </button>
          </div>
        )}

        <button type="button" className="nx-onboarding-skip" onClick={handleSkipTour}>
          {t("onboarding_skip_tour")}
        </button>
      </div>
    </NexusModal>
  );
}
