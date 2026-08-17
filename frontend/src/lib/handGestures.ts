/** Normalized hand landmark (MediaPipe). */
export type HandPoint = { x: number; y: number; z?: number };

export type MapGestureDetail =
  | { type: "pan"; dx: number; dy: number }
  | { type: "zoom"; delta: number };

export type GestureTrackerState = {
  smoothedIndex: HandPoint | null;
  lastPinch: number | null;
};

/** Tune hand → map feel (lower = slower). */
const GESTURE = {
  panLngLatScale: 0.16,
  zoomScale: 2.8,
  smoothAlpha: 0.28,
  panMinMove: 0.009,
  pinchMinDelta: 0.006,
  maxPanStep: 0.011,
  maxZoomStep: 0.045,
} as const;

export function dispatchMapGesture(detail: MapGestureDetail): void {
  window.dispatchEvent(new CustomEvent("nexus-map-gesture", { detail }));
}

function dist(a: HandPoint, b: HandPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(v: number, max: number): number {
  return Math.max(-max, Math.min(max, v));
}

function smoothPoint(prev: HandPoint | null, next: HandPoint, alpha: number): HandPoint {
  if (!prev) return next;
  return {
    x: prev.x + (next.x - prev.x) * alpha,
    y: prev.y + (next.y - prev.y) * alpha,
  };
}

/** Index tip = 8, thumb tip = 4, middle tip = 12 */
export function analyzeHandFrame(
  landmarks: HandPoint[],
  prev: GestureTrackerState,
): { events: MapGestureDetail[]; next: GestureTrackerState } {
  const events: MapGestureDetail[] = [];
  if (landmarks.length < 13) return { events, next: prev };

  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];

  const pinch = dist(thumb, index);
  const pointing = index.y < middle.y - 0.02;
  const indexPt = { x: index.x, y: index.y };
  const smoothed = pointing ? smoothPoint(prev.smoothedIndex, indexPt, GESTURE.smoothAlpha) : null;

  if (prev.lastPinch != null) {
    const pinchDelta = pinch - prev.lastPinch;
    if (pinch < 0.055 && Math.abs(pinchDelta) > GESTURE.pinchMinDelta) {
      const delta = clamp(-pinchDelta * GESTURE.zoomScale, GESTURE.maxZoomStep);
      events.push({ type: "zoom", delta });
    }
  }

  if (pointing && pinch > 0.07 && prev.smoothedIndex && smoothed) {
    const dx = clamp(smoothed.x - prev.smoothedIndex.x, GESTURE.maxPanStep);
    const dy = clamp(smoothed.y - prev.smoothedIndex.y, GESTURE.maxPanStep);
    if (Math.hypot(dx, dy) > GESTURE.panMinMove) {
      events.push({
        type: "pan",
        dx: dx * GESTURE.panLngLatScale,
        dy: dy * GESTURE.panLngLatScale,
      });
    }
  }

  return {
    events,
    next: {
      smoothedIndex: smoothed,
      lastPinch: pinch,
    },
  };
}

/** Palm roughly open and centered — used as "tracking active" signal. */
export function isHandPresent(landmarks: HandPoint[]): boolean {
  if (landmarks.length < 21) return false;
  const wrist = landmarks[0];
  const tips = [landmarks[8], landmarks[12], landmarks[16], landmarks[20]];
  const avgDist = tips.reduce((s, t) => s + dist(wrist, t), 0) / tips.length;
  return avgDist > 0.12 && avgDist < 0.55;
}

export { GESTURE as GESTURE_TUNING };
