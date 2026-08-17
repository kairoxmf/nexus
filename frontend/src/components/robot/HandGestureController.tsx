import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import type { HandLandmarker, HandLandmarkerResult } from "@mediapipe/tasks-vision";
import { useNexusControlOptional } from "../../context/NexusControlContext";
import { useI18n } from "../../i18n";
import { getHandLandmarker, resetHandLandmarker } from "../../lib/handLandmarker";
import {
  analyzeHandFrame,
  dispatchMapGesture,
  isHandPresent,
  type GestureTrackerState,
} from "../../lib/handGestures";

const GESTURE_FRAME_MS = 48;

type Phase = "idle" | "camera" | "model" | "ready" | "denied" | "error";

export function HandGestureController() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const control = useNexusControlOptional();
  const enabled = control?.gestureEnabled ?? false;
  const onCommand = pathname === "/command";

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const trackerRef = useRef<GestureTrackerState>({ smoothedIndex: null, lastPinch: null });
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const lastGestureAtRef = useRef(0);
  const runIdRef = useRef(0);

  const [phase, setPhase] = useState<Phase>("idle");
  const [tracking, setTracking] = useState(false);

  const stopCamera = useCallback(() => {
    runIdRef.current += 1;
    cancelAnimationFrame(rafRef.current);
    const v = videoRef.current;
    const stream = v?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((tr) => tr.stop());
    if (v) v.srcObject = null;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    landmarkerRef.current = null;
    setPhase("idle");
    setTracking(false);
    trackerRef.current = { smoothedIndex: null, lastPinch: null };
    lastGestureAtRef.current = 0;
  }, []);

  const drawLandmarks = useCallback((result: HandLandmarkerResult) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = video.videoWidth || 128;
    canvas.height = video.videoHeight || 96;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const hand = result.landmarks?.[0];
    if (!hand?.length) return;
    ctx.fillStyle = "#4cc9f0";
    ctx.strokeStyle = "rgba(51, 193, 122, 0.85)";
    ctx.lineWidth = 2;
    for (const pt of hand) {
      ctx.beginPath();
      ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const loop = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      let result: HandLandmarkerResult;
      try {
        result = landmarker.detectForVideo(video, performance.now());
      } catch {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      drawLandmarks(result);
      const hand = result.landmarks?.[0];
      if (hand?.length) {
        setTracking(isHandPresent(hand) || hand.length >= 21);
        const now = performance.now();
        if (now - lastGestureAtRef.current >= GESTURE_FRAME_MS) {
          const { events, next } = analyzeHandFrame(hand, trackerRef.current);
          trackerRef.current = next;
          if (events.length) {
            lastGestureAtRef.current = now;
            for (const ev of events) dispatchMapGesture(ev);
          }
        }
      } else {
        setTracking(false);
        trackerRef.current = { smoothedIndex: null, lastPinch: null };
      }
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [drawLandmarks]);

  const attachStream = useCallback(async (stream: MediaStream, runId: number) => {
    const video = videoRef.current;
    if (!video) {
      stream.getTracks().forEach((tr) => tr.stop());
      throw new Error("Video element missing");
    }
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    await video.play();
    if (runId !== runIdRef.current) {
      stream.getTracks().forEach((tr) => tr.stop());
      throw new Error("aborted");
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (!onCommand) return;
    const runId = ++runIdRef.current;
    setTracking(false);
    setPhase("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      if (runId !== runIdRef.current) {
        stream.getTracks().forEach((tr) => tr.stop());
        return;
      }
      if (!videoRef.current) {
        await new Promise((r) => requestAnimationFrame(() => r(null)));
      }
      await attachStream(stream, runId);
      setPhase("model");
      const landmarker = await getHandLandmarker();
      if (runId !== runIdRef.current) return;
      landmarkerRef.current = landmarker;
      lastVideoTimeRef.current = -1;
      setPhase("ready");
      rafRef.current = requestAnimationFrame(loop);
    } catch (err) {
      if (runId !== runIdRef.current) return;
      const name = err instanceof Error ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setPhase("denied");
      } else {
        resetHandLandmarker();
        setPhase("error");
      }
    }
  }, [attachStream, loop, onCommand]);

  useEffect(() => {
    if (enabled && onCommand) {
      void startCamera();
    } else {
      stopCamera();
    }
    return () => {
      runIdRef.current += 1;
      cancelAnimationFrame(rafRef.current);
      const v = videoRef.current;
      const stream = v?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((tr) => tr.stop());
      if (v) v.srcObject = null;
    };
  }, [enabled, onCommand, startCamera, stopCamera]);

  if (!control || !onCommand) return null;

  const loading = phase === "camera" || phase === "model";
  const active = phase === "ready" || phase === "model";
  const label =
    phase === "camera"
      ? t("gesture_camera_ready")
      : phase === "model"
        ? t("gesture_loading")
        : phase === "denied"
          ? t("gesture_camera_denied")
          : phase === "error"
            ? t("gesture_model_error")
            : phase === "ready"
              ? tracking
                ? t("gesture_tracking")
                : t("gesture_active")
              : t("gesture_on");

  return (
    <div className={`nexus-gesture${active ? " is-active" : ""}${tracking ? " is-tracking" : ""}${enabled ? " is-enabled" : ""}`}>
      <div className="nexus-gesture-toolbar">
        <span className={`nexus-gesture-dot${tracking ? " is-live" : ""}${loading ? " is-busy" : ""}`} aria-hidden />
        <span className="nexus-gesture-label">{label}</span>
        <button
          type="button"
          className="nexus-gesture-toggle"
          onClick={() => control.setGestureEnabled(!enabled)}
        >
          {enabled ? t("gesture_off") : t("gesture_on")}
        </button>
        {phase === "error" && (
          <button
            type="button"
            className="nexus-gesture-toggle"
            onClick={() => {
              resetHandLandmarker();
              void startCamera();
            }}
          >
            {t("gesture_retry")}
          </button>
        )}
      </div>
      {enabled && (
        <>
          <div className="nexus-gesture-preview">
            <video ref={videoRef} className="nexus-gesture-video" playsInline muted autoPlay aria-hidden />
            <canvas ref={canvasRef} className="nexus-gesture-canvas" aria-hidden />
            {loading && (
              <div className="nexus-gesture-overlay">
                <span className="nexus-gesture-spinner" />
              </div>
            )}
          </div>
          <div className="nexus-gesture-hint">{t("gesture_pan_hint")}</div>
        </>
      )}
    </div>
  );
}
