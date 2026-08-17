const ONBOARDING_KEY = "nexus-onboarding-v1";
const GESTURE_KEY = "nexus-gesture-enabled";

export function isOnboardingComplete(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(ONBOARDING_KEY) === "1";
}

export function markOnboardingComplete(): void {
  window.localStorage.setItem(ONBOARDING_KEY, "1");
}

export function isGestureEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(GESTURE_KEY) === "1";
}

export function setGestureEnabledStorage(enabled: boolean): void {
  window.localStorage.setItem(GESTURE_KEY, enabled ? "1" : "0");
}
