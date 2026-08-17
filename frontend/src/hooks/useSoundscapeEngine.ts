import { useEffect, useRef } from "react";
import type { SoundscapeMix } from "../lib/visualWowTypes";

/** Lightweight procedural soundscape from Web Audio oscillators + noise */
export function useSoundscapeEngine(mix: SoundscapeMix, enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<Array<{ stop: () => void }>>([]);

  const stopAll = () => {
    nodesRef.current.forEach((n) => {
      try {
        n.stop();
      } catch {
        /* already stopped */
      }
    });
    nodesRef.current = [];
  };

  useEffect(() => {
    if (!enabled) {
      stopAll();
      void ctxRef.current?.suspend();
      return;
    }

    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") void ctx.resume();

      stopAll();

      const mkOsc = (freq: number, type: OscillatorType, gain: number) => {
        if (gain <= 0.01) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        g.gain.value = gain * 0.06;
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start();
        nodesRef.current.push({ stop: () => osc.stop() });
      };

      mkOsc(680 + mix.siren * 200, "sawtooth", mix.siren);
      mkOsc(120 + mix.crowd * 80, "square", mix.crowd * 0.5);
      mkOsc(200, "sine", mix.rain * 0.3);
      mkOsc(60 + mix.heartbeat * 40, "sine", mix.heartbeat);
      mkOsc(440 + mix.radio * 100, "triangle", mix.radio * 0.4);

      return () => {
        stopAll();
      };
    } catch {
      /* audio blocked */
    }
  }, [enabled, mix.siren, mix.crowd, mix.rain, mix.heartbeat, mix.radio]);

  useEffect(() => {
    return () => {
      stopAll();
      void ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, []);
}
