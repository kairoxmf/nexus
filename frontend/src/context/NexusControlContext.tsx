import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  isGestureEnabled as readGestureEnabled,
  isOnboardingComplete,
  markOnboardingComplete,
  setGestureEnabledStorage,
} from "../lib/nexusControlStorage";

interface NexusControlValue {
  showOnboarding: boolean;
  gestureEnabled: boolean;
  micGranted: boolean;
  completeOnboarding: (opts: { enableGesture: boolean; micGranted?: boolean }) => void;
  setGestureEnabled: (enabled: boolean) => void;
  setMicGranted: (granted: boolean) => void;
  reopenOnboarding: () => void;
}

const NexusControlContext = createContext<NexusControlValue | null>(null);

export function NexusControlProvider({ children }: { children: ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingComplete());
  const [gestureEnabled, setGestureEnabledState] = useState(() => readGestureEnabled());
  const [micGranted, setMicGrantedState] = useState(false);

  const completeOnboarding = useCallback((opts: { enableGesture: boolean; micGranted?: boolean }) => {
    markOnboardingComplete();
    setGestureEnabledStorage(opts.enableGesture);
    setGestureEnabledState(opts.enableGesture);
    if (opts.micGranted) setMicGrantedState(true);
    setShowOnboarding(false);
    window.dispatchEvent(new CustomEvent("nexus-robot-focus"));
    if (opts.micGranted) {
      window.dispatchEvent(new CustomEvent("nexus-mic-armed"));
    }
  }, []);

  const setMicGranted = useCallback((granted: boolean) => {
    setMicGrantedState(granted);
    if (granted) window.dispatchEvent(new CustomEvent("nexus-mic-armed"));
  }, []);

  const setGestureEnabled = useCallback((enabled: boolean) => {
    setGestureEnabledStorage(enabled);
    setGestureEnabledState(enabled);
  }, []);

  const reopenOnboarding = useCallback(() => {
    setShowOnboarding(true);
  }, []);

  const value = useMemo(
    () => ({
      showOnboarding,
      gestureEnabled,
      micGranted,
      completeOnboarding,
      setGestureEnabled,
      setMicGranted,
      reopenOnboarding,
    }),
    [showOnboarding, gestureEnabled, micGranted, completeOnboarding, setGestureEnabled, setMicGranted, reopenOnboarding],
  );

  return <NexusControlContext.Provider value={value}>{children}</NexusControlContext.Provider>;
}

export function useNexusControl() {
  const ctx = useContext(NexusControlContext);
  if (!ctx) throw new Error("useNexusControl must be used within NexusControlProvider");
  return ctx;
}

export function useNexusControlOptional() {
  return useContext(NexusControlContext);
}
