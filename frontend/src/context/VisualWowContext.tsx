import {

  createContext,

  useCallback,

  useContext,

  useEffect,

  useMemo,

  useRef,

  useState,

  type ReactNode,

} from "react";

import type { SimulationState } from "../types";

import {

  DEFAULT_SOUNDSCAPE,

  DEFAULT_WOW_TOGGLES,

  DEMO_LITE_TOGGLES,

  deriveVisualWow,

  buildCrisisWrapped,

  type CrisisTarotCard,

  type CrisisWrappedData,

  type MapAnnotation,

  type SoundscapeMix,

  type VisualWowDerived,

  type VisualWowFeature,

  type VisualWowToggles,

  TAROT_DECK,

} from "../lib/visualWowTypes";



type VisualWowContextValue = {

  toggles: VisualWowToggles;

  setToggle: (key: VisualWowFeature, on: boolean) => void;

  toggleFeature: (key: VisualWowFeature) => void;

  soundscape: SoundscapeMix;

  setSoundscape: (mix: Partial<SoundscapeMix>) => void;

  derived: VisualWowDerived;

  cityId: string;

  setCityId: (id: string) => void;

  photoModeLocked: boolean;

  setPhotoModeLocked: (v: boolean) => void;

  vhsActive: boolean;

  triggerVhs: () => void;

  tarotCard: CrisisTarotCard | null;

  drawTarot: () => CrisisTarotCard;

  clearTarot: () => void;

  waxSealFlash: WaxSealFlash | null;

  dualTimelineAlt: number;

  setDualTimelineAlt: (v: number) => void;

  dualTimelineNow: number;

  setDualTimelineNow: (v: number) => void;

  showTrophy: boolean;

  dismissTrophy: () => void;

  newspaperHtml: string | null;

  generateNewspaper: (state: SimulationState) => string;

  memorialNames: string[];

  enableAllToggles: () => void;

  applyDemoLite: () => void;

  disableAllToggles: () => void;

  ebsActive: boolean;

  triggerEbs: () => void;

  crisisWrapped: CrisisWrappedData | null;

  showCrisisWrapped: boolean;

  generateCrisisWrapped: (state: SimulationState, locale?: string) => CrisisWrappedData;

  dismissCrisisWrapped: () => void;

  beforeAfterPos: number;

  setBeforeAfterPos: (v: number) => void;

  annotationMode: boolean;

  setAnnotationMode: (v: boolean) => void;

  annotationRole: string;

  setAnnotationRole: (v: string) => void;

  mapAnnotations: MapAnnotation[];

  draftAnnotation: [number, number][];

  addAnnotationPoint: (lng: number, lat: number) => void;

  finishAnnotation: () => void;

  cancelDraftAnnotation: () => void;

  clearAnnotations: () => void;

};



export type WaxSealFlash = { id: string; decision: string };



const VisualWowContext = createContext<VisualWowContextValue | null>(null);



const STORAGE_KEY = "nexus_visual_wow_toggles_v5";



const ANNOTATION_COLORS: Record<string, [number, number, number, number]> = {

  mayor: [244, 161, 0, 220],

  fema: [76, 201, 240, 220],

  media: [255, 70, 85, 220],

  default: [180, 200, 255, 220],

};



function loadToggles(): VisualWowToggles {

  try {

    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) return { ...DEFAULT_WOW_TOGGLES, ...JSON.parse(raw) };

  } catch {

    /* ignore */

  }

  return { ...DEFAULT_WOW_TOGGLES };

}



export function VisualWowProvider({

  children,

  state,

  cityId: externalCityId,

}: {

  children: ReactNode;

  state: SimulationState;

  cityId: string;

}) {

  const [toggles, setToggles] = useState<VisualWowToggles>(loadToggles);

  const [soundscape, setSoundscapeState] = useState<SoundscapeMix>(DEFAULT_SOUNDSCAPE);

  const [cityId, setCityId] = useState(externalCityId);

  const [photoModeLocked, setPhotoModeLocked] = useState(false);

  const [vhsActive, setVhsActive] = useState(false);

  const [tarotCard, setTarotCard] = useState<CrisisTarotCard | null>(null);

  const [waxSealFlash, setWaxSealFlash] = useState<WaxSealFlash | null>(null);

  const [dualTimelineAlt, setDualTimelineAlt] = useState(0);

  const [dualTimelineNow, setDualTimelineNow] = useState(0);

  const [showTrophy, setShowTrophy] = useState(false);

  const [newspaperHtml, setNewspaperHtml] = useState<string | null>(null);

  const [memorialNames] = useState(["First Responders", "Community Heroes", "Lost Citizens"]);

  const [ebsActive, setEbsActive] = useState(false);

  const [crisisWrapped, setCrisisWrapped] = useState<CrisisWrappedData | null>(null);

  const [showCrisisWrapped, setShowCrisisWrapped] = useState(false);

  const [beforeAfterPos, setBeforeAfterPos] = useState(100);

  const [annotationMode, setAnnotationMode] = useState(false);

  const [annotationRole, setAnnotationRole] = useState("mayor");

  const [mapAnnotations, setMapAnnotations] = useState<MapAnnotation[]>([]);

  const [draftAnnotation, setDraftAnnotation] = useState<[number, number][]>([]);

  const prevDisasterRef = useRef<string | null>(null);

  const wrappedShownRef = useRef(false);



  useEffect(() => setCityId(externalCityId), [externalCityId]);



  useEffect(() => {

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toggles));

  }, [toggles]);



  const derived = useMemo(() => deriveVisualWow(state, cityId), [state, cityId]);



  useEffect(() => {

    setDualTimelineNow(state.tick);

  }, [state.tick]);



  useEffect(() => {

    const latest = derived.recentDecisions[0];

    if (!latest || !toggles.waxSeal) return;

    setWaxSealFlash({ id: latest.id, decision: latest.decision });

    const t = window.setTimeout(() => setWaxSealFlash(null), 3200);

    return () => window.clearTimeout(t);

  }, [derived.recentDecisions[0]?.id, toggles.waxSeal]);



  useEffect(() => {

    if (derived.achievements.length > 0 && toggles.trophy) {

      setShowTrophy(true);

    }

  }, [derived.achievements.join(","), toggles.trophy]);



  useEffect(() => {

    if (!toggles.ebsTakeover) return;

    const disaster = state.active_disaster;

    if (disaster && disaster !== prevDisasterRef.current) {

      setEbsActive(true);

      window.setTimeout(() => setEbsActive(false), 5200);

    }

    prevDisasterRef.current = disaster ?? null;

  }, [state.active_disaster, toggles.ebsTakeover]);



  useEffect(() => {

    if (!toggles.beforeAfterSlider) return;

    if (state.active_disaster) {

      setBeforeAfterPos(Math.max(0, derived.crisisHealthAtStart));

    } else if (state.recovery_mode) {

      setBeforeAfterPos(state.metrics.city_health);

    }

  }, [state.active_disaster, state.recovery_mode, state.metrics.city_health, toggles.beforeAfterSlider, derived.crisisHealthAtStart]);



  useEffect(() => {

    if (!toggles.crisisWrapped || wrappedShownRef.current) return;

    if (state.recovery_mode && state.metrics.city_health >= 80 && !state.active_disaster) {

      wrappedShownRef.current = true;

      const data = buildCrisisWrapped(state, cityId, "en");

      setCrisisWrapped(data);

      setShowCrisisWrapped(true);

    }

  }, [state.recovery_mode, state.metrics.city_health, state.active_disaster, toggles.crisisWrapped, cityId, state]);



  const setToggle = useCallback((key: VisualWowFeature, on: boolean) => {
    setToggles((prev) => ({ ...prev, [key]: on }));
    if (key === "photoMode") setPhotoModeLocked(on);
    if (key === "mapAnnotation" && !on) {
      setAnnotationMode(false);
      setDraftAnnotation([]);
    }
  }, []);



  const toggleFeature = useCallback((key: VisualWowFeature) => {

    setToggles((prev) => {

      const next = !prev[key];

      if (key === "photoMode") setPhotoModeLocked(next);

      return { ...prev, [key]: next };

    });

  }, []);



  const setSoundscape = useCallback((mix: Partial<SoundscapeMix>) => {

    setSoundscapeState((prev) => ({ ...prev, ...mix }));

  }, []);



  const triggerVhs = useCallback(() => {

    setVhsActive(true);

    window.setTimeout(() => setVhsActive(false), 1400);

  }, []);



  const triggerEbs = useCallback(() => {

    setEbsActive(true);

    window.setTimeout(() => setEbsActive(false), 5200);

  }, []);



  const drawTarot = useCallback(() => {

    const card = TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)]!;

    setTarotCard(card);

    return card;

  }, []);



  const clearTarot = useCallback(() => setTarotCard(null), []);



  const enableAllToggles = useCallback(() => {
    setToggles({ ...DEFAULT_WOW_TOGGLES, soundscape: false, photoMode: false });
    setPhotoModeLocked(false);
  }, []);

  const applyDemoLite = useCallback(() => {
    setToggles({ ...DEMO_LITE_TOGGLES });
    setPhotoModeLocked(false);
    setAnnotationMode(false);
    setDraftAnnotation([]);
  }, []);



  const disableAllToggles = useCallback(() => {

    const off = Object.fromEntries(

      Object.keys(DEFAULT_WOW_TOGGLES).map((k) => [k, false]),

    ) as VisualWowToggles;

    setToggles(off);

    setPhotoModeLocked(false);

  }, []);



  const generateCrisisWrapped = useCallback(

    (s: SimulationState, locale = "en") => {

      const loc = locale === "fa" ? "fa" : locale === "ar" ? "ar" : "en";

      const data = buildCrisisWrapped(s, cityId, loc);

      setCrisisWrapped(data);

      setShowCrisisWrapped(true);

      return data;

    },

    [cityId],

  );



  const dismissCrisisWrapped = useCallback(() => setShowCrisisWrapped(false), []);



  const addAnnotationPoint = useCallback((lng: number, lat: number) => {

    setDraftAnnotation((prev) => [...prev, [lng, lat]]);

  }, []);



  const finishAnnotation = useCallback(() => {

    setDraftAnnotation((prev) => {

      if (!prev.length) return prev;

      const color = ANNOTATION_COLORS[annotationRole] ?? ANNOTATION_COLORS.default;

      const ann: MapAnnotation = {

        id: `ann-${Date.now()}`,

        points: prev,

        color,

        role: annotationRole,

      };

      setMapAnnotations((a) => [...a, ann]);

      return [];

    });

  }, [annotationRole]);



  const cancelDraftAnnotation = useCallback(() => setDraftAnnotation([]), []);



  const clearAnnotations = useCallback(() => {

    setMapAnnotations([]);

    setDraftAnnotation([]);

  }, []);



  const generateNewspaper = useCallback((s: SimulationState) => {

    const headline =

      s.active_disaster

        ? `CRISIS IN ${cityId.toUpperCase()}: ${s.active_disaster.replace(/_/g, " ").toUpperCase()}`

        : `RECOVERY CONTINUES — HEALTH AT ${s.metrics.city_health}%`;

    const quote =

      s.advanced?.press_conference?.speech?.slice(0, 120) ??

      "We remain committed to every citizen. — Mayor";

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>NEXUS Chronicle</title>

<style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:20px;background:#f4efe6;color:#1a1a1a}

.banner{border-bottom:4px double #000;padding-bottom:8px;margin-bottom:16px}

h1{font-size:2.4em;margin:0;line-height:1.1}.sub{font-size:12px;color:#666;margin-top:4px}

.map-box{height:180px;background:linear-gradient(135deg,#1a2a3a,#4cc9f0);margin:16px 0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px}

.quote{font-style:italic;border-left:4px solid #c00;padding-left:12px;margin-top:20px}</style></head>

<body><div class="banner"><h1>${headline}</h1><div class="sub">NEXUS Chronicle · T+${s.tick} · ${new Date().toLocaleDateString()}</div></div>

<div class="map-box">[ City Map Snapshot — ${cityId.toUpperCase()} ]</div>

<p>City health index stands at <strong>${s.metrics.city_health}%</strong>. Power grid ${s.metrics.power_grid}%, water ${s.metrics.water_network}%.</p>

<div class="quote">"${quote}"</div></body></html>`;

    setNewspaperHtml(html);

    return html;

  }, [cityId]);



  useEffect(() => {

    const onVhs = () => {

      if (toggles.vhsRewind) triggerVhs();

    };

    window.addEventListener("nexus-vhs-rewind", onVhs);

    return () => window.removeEventListener("nexus-vhs-rewind", onVhs);

  }, [toggles.vhsRewind, triggerVhs]);



  const value: VisualWowContextValue = {

    toggles,

    setToggle,

    toggleFeature,

    soundscape,

    setSoundscape,

    derived,

    cityId,

    setCityId,

    photoModeLocked,

    setPhotoModeLocked,

    vhsActive,

    triggerVhs,

    tarotCard,

    drawTarot,

    clearTarot,

    waxSealFlash,

    dualTimelineAlt,

    setDualTimelineAlt,

    dualTimelineNow,

    setDualTimelineNow,

    showTrophy,

    dismissTrophy: () => setShowTrophy(false),

    newspaperHtml,

    generateNewspaper,

    memorialNames,

    enableAllToggles,

    applyDemoLite,

    disableAllToggles,

    ebsActive,

    triggerEbs,

    crisisWrapped,

    showCrisisWrapped,

    generateCrisisWrapped,

    dismissCrisisWrapped,

    beforeAfterPos,

    setBeforeAfterPos,

    annotationMode,

    setAnnotationMode,

    annotationRole,

    setAnnotationRole,

    mapAnnotations,

    draftAnnotation,

    addAnnotationPoint,

    finishAnnotation,

    cancelDraftAnnotation,

    clearAnnotations,

  };



  return <VisualWowContext.Provider value={value}>{children}</VisualWowContext.Provider>;

}



export function useVisualWow() {

  const ctx = useContext(VisualWowContext);

  if (!ctx) throw new Error("useVisualWow must be used within VisualWowProvider");

  return ctx;

}



export function useVisualWowOptional() {

  return useContext(VisualWowContext);

}


