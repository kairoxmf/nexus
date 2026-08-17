import type { SimulationState } from "../types";

export type VisualWowFeature =
  | "dayNight"
  | "particles"
  | "panicHeatmap"
  | "sosRipple"
  | "xrayUnderground"
  | "holographicHud"
  | "ekgHeader"
  | "moodRing"
  | "photoMode"
  | "tehranMiniature"
  | "ghostCity"
  | "crisisTarot"
  | "soundscape"
  | "heliCam"
  | "neuralNet"
  | "infraRings"
  | "dualTimeline"
  | "trophy"
  | "crisisDna"
  | "newspaper"
  | "constellation"
  | "brokenGlass"
  | "waxSeal"
  | "vhsRewind"
  | "memorialWall"
  | "ebsTakeover"
  | "seismicRings"
  | "crisisWrapped"
  | "beforeAfterSlider"
  | "mapAnnotation"
  | "fogOfWar";

export type VisualWowToggles = Record<VisualWowFeature, boolean>;

export const DEFAULT_WOW_TOGGLES: VisualWowToggles = {
  dayNight: true,
  particles: true,
  panicHeatmap: true,
  sosRipple: true,
  xrayUnderground: true,
  holographicHud: true,
  ekgHeader: true,
  moodRing: true,
  photoMode: false,
  tehranMiniature: true,
  ghostCity: true,
  crisisTarot: true,
  soundscape: false,
  heliCam: false,
  neuralNet: true,
  infraRings: true,
  dualTimeline: true,
  trophy: true,
  crisisDna: true,
  newspaper: true,
  constellation: true,
  brokenGlass: true,
  waxSeal: true,
  vhsRewind: true,
  memorialWall: true,
  ebsTakeover: true,
  seismicRings: true,
  crisisWrapped: true,
  beforeAfterSlider: true,
  mapAnnotation: true,
  fogOfWar: true,
};

/** Lightweight preset for live demos — 10 cinematic effects, smooth on most GPUs */
export const DEMO_LITE_TOGGLES: VisualWowToggles = {
  dayNight: true,
  particles: true,
  panicHeatmap: true,
  sosRipple: true,
  xrayUnderground: false,
  holographicHud: false,
  ekgHeader: true,
  moodRing: true,
  photoMode: false,
  tehranMiniature: false,
  ghostCity: false,
  crisisTarot: false,
  soundscape: false,
  heliCam: false,
  neuralNet: false,
  infraRings: false,
  dualTimeline: false,
  trophy: false,
  crisisDna: false,
  newspaper: false,
  constellation: false,
  brokenGlass: false,
  waxSeal: false,
  vhsRewind: false,
  memorialWall: false,
  ebsTakeover: true,
  seismicRings: true,
  crisisWrapped: true,
  beforeAfterSlider: true,
  mapAnnotation: false,
  fogOfWar: false,
};

export type MapAnnotation = {
  id: string;
  points: [number, number][];
  color: [number, number, number, number];
  role: string;
  label?: string;
};

export type CrisisWrappedData = {
  cityId: string;
  tick: number;
  health: number;
  sosResolved: number;
  decisionsMade: number;
  disaster: string;
  trustIndex: number;
  grade: string;
  headline: string;
  stats: Array<{ label: string; value: string; emoji: string }>;
};

export type SoundscapeMix = {
  siren: number;
  crowd: number;
  rain: number;
  heartbeat: number;
  radio: number;
};

export const DEFAULT_SOUNDSCAPE: SoundscapeMix = {
  siren: 0,
  crowd: 0,
  rain: 0,
  heartbeat: 0,
  radio: 0,
};

export type CrisisTarotCard = {
  id: string;
  title: string;
  titleFa: string;
  emoji: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
};

export type WaxSealEvent = {
  id: string;
  decision: string;
  timestamp: number;
};

export type VisualWowDerived = {
  dayPhase: number;
  isNight: boolean;
  particleType: "none" | "smoke" | "rain" | "fire" | "dust" | "lightning";
  moodTier: "green" | "amber" | "red" | "glitch";
  trustIndex: number;
  bpm: number;
  crisisFingerprint: string;
  showMemorial: boolean;
  showGhostCity: boolean;
  showBrokenGlass: boolean;
  sosRippleCenters: Array<{ lat: number; lng: number; id: string }>;
  panicPoints: Array<{ lat: number; lng: number; weight: number }>;
  heliTarget: { lat: number; lng: number } | null;
  recentDecisions: WaxSealEvent[];
  achievements: string[];
  fogZones: Array<{ lat: number; lng: number; radiusM: number }>;
  crisisHealthAtStart: number;
};

export function deriveVisualWow(state: SimulationState, cityId: string): VisualWowDerived {
  const health = state.metrics.city_health;
  const panic = state.mega?.social_network?.panic_level ?? (100 - health) / 100;
  const trustIndex = Math.round(
    (state.metrics.safety_index + state.metrics.citizen_satisfaction) / 2,
  );

  const tick = state.tick;
  const dayPhase = (tick % 240) / 240;
  const isNight = dayPhase > 0.55 && dayPhase < 0.92;

  let particleType: VisualWowDerived["particleType"] = "none";
  const disaster = state.active_disaster ?? "";
  const weather = state.weather?.overlay ?? "none";
  if (disaster.includes("earthquake")) particleType = "dust";
  else if (disaster.includes("fire")) particleType = "fire";
  else if (disaster.includes("flood") || weather === "rain") particleType = "rain";
  else if (disaster.includes("blackout") || state.metrics.power_grid < 30) particleType = "lightning";
  else if (disaster) particleType = "smoke";

  let moodTier: VisualWowDerived["moodTier"] = "green";
  if (health < 25 || panic > 0.85) moodTier = "glitch";
  else if (health < 40) moodTier = "red";
  else if (health < 70) moodTier = "amber";

  const bpm = state.creative?.city_pulse?.heartbeat_bpm ?? Math.round(60 + (100 - health) * 0.8);

  const fingerprint = [
    disaster || "calm",
    state.disaster_magnitude?.toFixed(1) ?? "0",
    cityId,
    Object.entries(state.city_dna)
      .slice(0, 3)
      .map(([k, v]) => `${k}:${v}`)
      .join("-"),
  ].join("|");

  const evacuating = state.citizen_agents?.evacuating ?? 0;
  const showGhostCity = evacuating > 5000 || (state.recovery_mode && health < 30);
  const showMemorial = state.recovery_mode && health > 75 && !state.active_disaster;
  const showBrokenGlass = trustIndex < 35;

  const sosRippleCenters =
    state.creative?.sos_sync?.reports?.map((r) => ({
      lat: r.latitude,
      lng: r.longitude,
      id: r.id,
    })) ?? [];

  const panicPoints: VisualWowDerived["panicPoints"] = [];
  if (state.epicenter) {
    panicPoints.push({ lat: state.epicenter.latitude, lng: state.epicenter.longitude, weight: 1 });
  }
  sosRippleCenters.forEach((s) => panicPoints.push({ lat: s.lat, lng: s.lng, weight: 0.8 }));
  state.mega?.social_network?.posts
    ?.filter((p) => p.is_misinformation)
    .slice(0, 5)
    .forEach((_, i) => {
      const base = state.epicenter ?? { latitude: 38.9072, longitude: -77.0369 };
      panicPoints.push({
        lat: base.latitude + (i - 2) * 0.004,
        lng: base.longitude + (i - 2) * 0.005,
        weight: 0.5,
      });
    });

  const heli = state.vehicles?.find((v) => v.type === "helicopter") ?? null;
  const heliTarget = heli ? { lat: heli.latitude, lng: heli.longitude } : null;

  const recentDecisions: WaxSealEvent[] = [];
  if (state.last_debate) {
    recentDecisions.push({
      id: `debate-${state.tick}`,
      decision: state.last_debate.decision,
      timestamp: Date.now(),
    });
  }
  state.creative?.war_room?.decisions
    ?.filter((d) => d.player_submitted)
    .slice(-2)
    .forEach((d) => {
      recentDecisions.push({
        id: d.id,
        decision: d.action,
        timestamp: Date.now(),
      });
    });

  const achievements: string[] = [];
  if (health >= 90 && state.recovery_mode) achievements.push("recovery_hero");
  if (state.tick > 500 && health > 60) achievements.push("endurance");
  if ((state.creative?.sos_sync?.active_count ?? 0) === 0 && state.tick > 100) achievements.push("all_clear");

  const knownPoints: Array<{ lat: number; lng: number }> = [];
  if (state.epicenter) knownPoints.push({ lat: state.epicenter.latitude, lng: state.epicenter.longitude });
  sosRippleCenters.forEach((s) => knownPoints.push({ lat: s.lat, lng: s.lng }));
  (state.vehicles ?? []).forEach((v) => knownPoints.push({ lat: v.latitude, lng: v.longitude }));

  const fogZones: VisualWowDerived["fogZones"] = [];
  const base = state.epicenter ?? { latitude: 38.9072, longitude: -77.0369 };
  for (let i = 0; i < 12; i++) {
    const lat = base.latitude + (Math.sin(i * 2.1) * 0.025);
    const lng = base.longitude + (Math.cos(i * 1.7) * 0.03);
    const nearKnown = knownPoints.some((p) => {
      const dLat = p.lat - lat;
      const dLng = p.lng - lng;
      return Math.sqrt(dLat * dLat + dLng * dLng) < 0.012;
    });
    if (!nearKnown) {
      fogZones.push({ lat, lng, radiusM: 400 + (i % 3) * 200 });
    }
  }

  const crisisHealthAtStart = state.active_disaster
    ? Math.min(health, 100 - Math.round((state.disaster_magnitude ?? 5) * 8))
    : health;

  return {
    dayPhase,
    isNight,
    particleType,
    moodTier,
    trustIndex,
    bpm,
    crisisFingerprint: fingerprint,
    showMemorial,
    showGhostCity,
    showBrokenGlass,
    sosRippleCenters,
    panicPoints,
    heliTarget,
    recentDecisions,
    achievements,
    fogZones,
    crisisHealthAtStart,
  };
}

export function buildCrisisWrapped(
  state: SimulationState,
  cityId: string,
  locale: "en" | "fa" | "ar",
): CrisisWrappedData {
  const health = state.metrics.city_health;
  const trustIndex = Math.round(
    (state.metrics.safety_index + state.metrics.citizen_satisfaction) / 2,
  );
  const sosResolved = state.creative?.sos_sync?.reports?.filter((r) => r.status === "resolved").length ?? 0;
  const decisionsMade =
    (state.creative?.war_room?.decisions?.filter((d) => d.player_submitted).length ?? 0) +
    (state.last_debate ? 1 : 0);
  const disaster = state.active_disaster?.replace(/_/g, " ") ?? (locale === "fa" ? "بحران" : "crisis");

  let grade = "C";
  if (health >= 90 && trustIndex >= 70) grade = "S";
  else if (health >= 75) grade = "A";
  else if (health >= 55) grade = "B";

  const headline =
    locale === "fa"
      ? health >= 75
        ? "شهر را نجات دادید"
        : "بازیابی در جریان است"
      : health >= 75
        ? "You saved the city"
        : "Recovery in progress";

  const stats =
    locale === "fa"
      ? [
          { label: "سلامت شهر", value: `${health}%`, emoji: "🏙" },
          { label: "اعتماد", value: `${trustIndex}%`, emoji: "🤝" },
          { label: "SOS حل‌شده", value: String(sosResolved), emoji: "🆘" },
          { label: "تصمیمات", value: String(decisionsMade), emoji: "📋" },
          { label: "تیک", value: `T+${state.tick}`, emoji: "⏱" },
        ]
      : [
          { label: "City Health", value: `${health}%`, emoji: "🏙" },
          { label: "Trust Index", value: `${trustIndex}%`, emoji: "🤝" },
          { label: "SOS Resolved", value: String(sosResolved), emoji: "🆘" },
          { label: "Decisions", value: String(decisionsMade), emoji: "📋" },
          { label: "Simulation", value: `T+${state.tick}`, emoji: "⏱" },
        ];

  return {
    cityId,
    tick: state.tick,
    health,
    sosResolved,
    decisionsMade,
    disaster,
    trustIndex,
    grade,
    headline,
    stats,
  };
}

export const TAROT_DECK: CrisisTarotCard[] = [
  {
    id: "blackout",
    title: "Grid Blackout",
    titleFa: "قطعی برق",
    emoji: "⚡",
    severity: "critical",
    description: "Power grid cascade — streetlights die, hospitals on generators.",
  },
  {
    id: "misinfo",
    title: "Fake News Wave",
    titleFa: "موج اخبار جعلی",
    emoji: "📰",
    severity: "high",
    description: "Social panic spreads faster than rescue teams.",
  },
  {
    id: "aftershock",
    title: "Aftershock",
    titleFa: "پس‌لرزه",
    emoji: "🌋",
    severity: "high",
    description: "Secondary tremor hits weakened structures.",
  },
  {
    id: "protest",
    title: "Civil Unrest",
    titleFa: "ناآرامی مدنی",
    emoji: "✊",
    severity: "medium",
    description: "Citizens block evacuation routes demanding answers.",
  },
  {
    id: "blessing",
    title: "Mutual Aid",
    titleFa: "کمک متقابل",
    emoji: "🤝",
    severity: "low",
    description: "Neighborhood volunteers boost recovery speed.",
  },
  {
    id: "storm",
    title: "Supercell Storm",
    titleFa: "طوفان شدید",
    emoji: "🌩",
    severity: "medium",
    description: "Weather complicates aerial rescue operations.",
  },
  {
    id: "cyber",
    title: "Grid Cyber Attack",
    titleFa: "حمله سایبری شبکه",
    emoji: "💻",
    severity: "critical",
    description: "SCADA systems compromised — manual override required.",
  },
  {
    id: "pandemic",
    title: "Outbreak Zone",
    titleFa: "منطقه شیوع",
    emoji: "🦠",
    severity: "high",
    description: "Quarantine corridors block evacuation routes.",
  },
  {
    id: "blackswan",
    title: "Black Swan Event",
    titleFa: "رویداد قوی سیاه",
    emoji: "🃏",
    severity: "critical",
    description: "Unpredictable cascade — no playbook exists.",
  },
  {
    id: "dawn",
    title: "Dawn Recovery",
    titleFa: "بامداد بازیابی",
    emoji: "🌅",
    severity: "low",
    description: "First light brings hope — morale surges citywide.",
  },
];
