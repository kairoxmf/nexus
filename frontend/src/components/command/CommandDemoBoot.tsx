import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n";
import { useVisualWow } from "../../context/VisualWowContext";
import type { SimulationState } from "../../types";
import type { CommandFeatureTab } from "./CommandFeatureHub";
import { DemoGuideOverlay } from "./DemoGuideOverlay";

const API = import.meta.env.VITE_API_URL ?? "";
const VOICE_PENDING_KEY = "nexus-voice-demo-pending";
let narrateSeq = 0;

const GUIDED_STEPS: Array<{ tab?: CommandFeatureTab; labelKey: string; action?: "trigger" | "recovery" | "wrapped" }> = [
  { labelKey: "demo_step_1" },
  { labelKey: "demo_step_2", action: "trigger" },
  { labelKey: "demo_step_3", tab: "warroom" },
  { labelKey: "demo_step_4", tab: "sos" },
  { labelKey: "demo_step_5", tab: "mayor" },
  { labelKey: "demo_step_6", action: "recovery" },
  { labelKey: "demo_step_7", tab: "timeline" },
  { labelKey: "demo_step_8", action: "wrapped" },
];

type VoiceBeat = {
  key: string;
  tab?: CommandFeatureTab;
  action?: "trigger" | "recovery" | "cinema" | "wrapped";
};

const VOICE_BEATS: VoiceBeat[] = [
  { key: "vdemo_1" },
  { key: "vdemo_2", action: "trigger" },
  { key: "vdemo_3", tab: "warroom" },
  { key: "vdemo_4", tab: "sos" },
  { key: "vdemo_5", action: "recovery" },
  { key: "vdemo_6", tab: "cinema", action: "cinema" },
  { key: "vdemo_7", action: "wrapped" },
];

type Props = {
  fullPage: boolean;
  state: SimulationState;
  onOpenTab: (tab: CommandFeatureTab) => void;
  onCollapseSidebars: () => void;
  onTriggerDisaster?: () => Promise<void | boolean>;
  onToggleRecovery?: () => Promise<void | boolean>;
  onReset?: () => Promise<void | boolean>;
};

function narrateLine(text: string): Promise<void> {
  const id = ++narrateSeq;
  return new Promise((resolve) => {
    let settled = false;
    const finish = (ev: Event) => {
      const d = (ev as CustomEvent<{ id?: number; skip?: boolean }>).detail ?? {};
      if (!d.skip && d.id !== id) return;
      if (settled) return;
      settled = true;
      window.removeEventListener("nexus-narrate-done", finish);
      window.clearTimeout(safety);
      resolve();
    };
    const ms = Math.min(16000, 1800 + text.length * 75);
    const safety = window.setTimeout(() => finish(new CustomEvent("nexus-narrate-done", { detail: { id } })), ms);
    window.addEventListener("nexus-narrate-done", finish);
    window.dispatchEvent(new CustomEvent("nexus-robot-focus"));
    window.dispatchEvent(new CustomEvent("nexus-robot-narrate", { detail: { text, id } }));
  });
}

function isCommandPath() {
  return window.location.pathname.replace(/\/$/, "") === "/command";
}

/** Auto-enable Demo Lite on Command page and orchestrate guided / voice demos. */
export function CommandDemoBoot({
  fullPage,
  state,
  onOpenTab,
  onCollapseSidebars,
  onTriggerDisaster,
  onToggleRecovery,
  onReset,
}: Props) {
  const { t, locale } = useI18n();
  const wow = useVisualWow();
  const [guidedStep, setGuidedStep] = useState(0);
  const [voiceStep, setVoiceStep] = useState(0);
  const timersRef = useRef<number[]>([]);
  const abortVoiceRef = useRef(false);
  const voiceGenRef = useRef(0);
  const stateRef = useRef(state);
  const wowRef = useRef(wow);
  const tRef = useRef(t);
  const localeRef = useRef(locale);
  stateRef.current = state;
  wowRef.current = wow;
  tRef.current = t;
  localeRef.current = locale;

  useEffect(() => {
    if (!fullPage) return;
    wow.applyDemoLite();
  }, [fullPage, wow.applyDemoLite]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const wait = useCallback((ms: number) => {
    return new Promise<void>((resolve) => {
      const id = window.setTimeout(resolve, ms);
      timersRef.current.push(id);
    });
  }, []);

  const stopGuided = useCallback(() => {
    clearTimers();
    setGuidedStep(0);
  }, [clearTimers]);

  const stopVoice = useCallback(() => {
    abortVoiceRef.current = true;
    voiceGenRef.current += 1;
    window.dispatchEvent(new CustomEvent("nexus-narrate-done", { detail: { skip: true } }));
    setVoiceStep(0);
  }, []);

  const runGuidedStep = useCallback(
    (index: number) => {
      const step = GUIDED_STEPS[index];
      if (!step) {
        stopGuided();
        return;
      }

      setGuidedStep(index + 1);
      if (step.tab) onOpenTab(step.tab);
      if (step.action === "trigger" && !state.active_disaster) void onTriggerDisaster?.();
      if (step.action === "recovery" && !state.recovery_mode) void onToggleRecovery?.();
      if (step.action === "wrapped") wow.generateCrisisWrapped(state, "fa");

      const next = index + 1;
      if (next < GUIDED_STEPS.length) {
        const delay = step.action === "trigger" ? 35000 : step.action === "recovery" ? 30000 : 22000;
        const id = window.setTimeout(() => runGuidedStep(next), delay);
        timersRef.current.push(id);
      } else {
        const id = window.setTimeout(stopGuided, 12000);
        timersRef.current.push(id);
      }
    },
    [onOpenTab, onToggleRecovery, onTriggerDisaster, state, stopGuided, wow],
  );

  const runVoiceDemo = useCallback(async () => {
    const gen = ++voiceGenRef.current;
    abortVoiceRef.current = false;
    window.dispatchEvent(new CustomEvent("nexus-narrate-done", { detail: { skip: true } }));
    stopGuided();
    wowRef.current.applyDemoLite();
    onCollapseSidebars();
    window.dispatchEvent(new CustomEvent("nexus-robot-focus"));

    if (stateRef.current.active_disaster) {
      await onReset?.();
      await wait(700);
    }
    if (voiceGenRef.current !== gen) return;

    for (let i = 0; i < VOICE_BEATS.length; i++) {
      if (abortVoiceRef.current || voiceGenRef.current !== gen) return;
      const beat = VOICE_BEATS[i];
      setVoiceStep(i + 1);
      if (beat.tab) onOpenTab(beat.tab);

      const line = tRef.current(beat.key);
      const speech = narrateLine(line);

      window.setTimeout(() => {
        if (abortVoiceRef.current || voiceGenRef.current !== gen) return;
        if (beat.action === "trigger") void onTriggerDisaster?.();
        if (beat.action === "recovery" && !stateRef.current.recovery_mode) void onToggleRecovery?.();
        if (beat.action === "cinema") {
          void fetch(`${API}/api/v1/immersive/cinema/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ locale: localeRef.current === "fa" ? "fa" : "en" }),
          }).catch(() => undefined);
        }
        if (beat.action === "wrapped") {
          wowRef.current.generateCrisisWrapped(stateRef.current, localeRef.current);
        }
      }, 450);

      await speech;
      if (abortVoiceRef.current || voiceGenRef.current !== gen) return;
      await wait(i === VOICE_BEATS.length - 1 ? 1600 : 850);
    }

    if (voiceGenRef.current === gen) {
      const id = window.setTimeout(() => setVoiceStep(0), 8000);
      timersRef.current.push(id);
    }
  }, [onCollapseSidebars, onOpenTab, onReset, onToggleRecovery, onTriggerDisaster, stopGuided, wait]);

  useEffect(() => {
    const onFullDemo = () => {
      stopVoice();
      wow.enableAllToggles();
      onCollapseSidebars();
      onOpenTab("timeline");
      window.setTimeout(() => onOpenTab("debate"), 1200);
      window.setTimeout(() => onOpenTab("cinema"), 4500);
    };

    const onGuidedDemo = () => {
      stopVoice();
      stopGuided();
      wow.applyDemoLite();
      onCollapseSidebars();
      onOpenTab("timeline");
      runGuidedStep(0);
    };

    const onVoiceDemo = () => {
      void runVoiceDemo();
    };

    window.addEventListener("nexus-full-demo", onFullDemo);
    window.addEventListener("nexus-guided-demo", onGuidedDemo);
    window.addEventListener("nexus-voice-demo", onVoiceDemo);
    return () => {
      window.removeEventListener("nexus-full-demo", onFullDemo);
      window.removeEventListener("nexus-guided-demo", onGuidedDemo);
      window.removeEventListener("nexus-voice-demo", onVoiceDemo);
      clearTimers();
    };
  }, [clearTimers, onCollapseSidebars, onOpenTab, runGuidedStep, runVoiceDemo, stopGuided, stopVoice, wow]);

  useEffect(() => {
    if (!fullPage) return;
    if (sessionStorage.getItem(VOICE_PENDING_KEY) !== "1") return;
    sessionStorage.removeItem(VOICE_PENDING_KEY);
    const id = window.setTimeout(() => void runVoiceDemo(), 500);
    return () => window.clearTimeout(id);
  }, [fullPage, runVoiceDemo]);

  if (voiceStep > 0) {
    const current = VOICE_BEATS[voiceStep - 1];
    if (!current) return null;
    return (
      <DemoGuideOverlay
        step={voiceStep}
        total={VOICE_BEATS.length}
        labelKey={current.key}
        titleKey="demo_voice_title"
        variant="voice"
        onSkip={stopVoice}
      />
    );
  }

  if (guidedStep === 0) return null;

  const current = GUIDED_STEPS[guidedStep - 1];
  if (!current) return null;

  return (
    <DemoGuideOverlay
      step={guidedStep}
      total={GUIDED_STEPS.length}
      labelKey={current.labelKey}
      onSkip={stopGuided}
    />
  );
}

export function launchFullDemo() {
  window.dispatchEvent(new CustomEvent("nexus-full-demo"));
}

export function launchGuidedDemo() {
  window.dispatchEvent(new CustomEvent("nexus-guided-demo"));
}

export function launchVoiceDemo(navigate?: (path: string) => void) {
  if (!isCommandPath()) {
    sessionStorage.setItem(VOICE_PENDING_KEY, "1");
    navigate?.("/command");
    return;
  }
  window.dispatchEvent(new CustomEvent("nexus-voice-demo"));
}
