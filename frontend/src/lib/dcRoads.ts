/** Washington D.C. stylized road graph — lat/lng waypoints for 3D rendering. */

export type RoadKind = "highway" | "avenue" | "street" | "alley";

export interface RoadSegment {
  id: string;
  kind: RoadKind;
  name?: string;
  points: [number, number][]; // [lat, lng]
}

export interface BridgeDef {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** Deck length in scene units */
  length: number;
  /** Y-axis rotation (radians) */
  rotation: number;
  width: number;
}

const STYLE: Record<RoadKind, { color: string; width: number; opacity: number; y: number }> = {
  highway: { color: "#6a9ec8", width: 3.2, opacity: 0.88, y: 2.4 },
  avenue: { color: "#5588aa", width: 2.4, opacity: 0.78, y: 2.1 },
  street: { color: "#446688", width: 1.6, opacity: 0.62, y: 1.8 },
  alley: { color: "#334455", width: 0.9, opacity: 0.42, y: 1.5 },
};

export function roadStyle(kind: RoadKind) {
  return STYLE[kind];
}

/** Named diagonal & radial avenues (real DC layout approx.) */
const NAMED_AVENUES: RoadSegment[] = [
  {
    id: "pennsylvania",
    kind: "avenue",
    name: "Pennsylvania Ave",
    points: [
      [38.892, -76.978],
      [38.895, -77.002],
      [38.898, -77.028],
      [38.896, -77.048],
    ],
  },
  {
    id: "constitution",
    kind: "avenue",
    name: "Constitution Ave",
    points: [
      [38.891, -77.055],
      [38.892, -77.035],
      [38.893, -77.012],
      [38.894, -76.988],
    ],
  },
  {
    id: "independence",
    kind: "avenue",
    name: "Independence Ave",
    points: [
      [38.887, -77.048],
      [38.888, -77.028],
      [38.889, -77.005],
      [38.890, -76.982],
    ],
  },
  {
    id: "k-street",
    kind: "avenue",
    name: "K Street",
    points: [
      [38.902, -77.075],
      [38.903, -77.048],
      [38.904, -77.022],
      [38.903, -76.998],
    ],
  },
  {
    id: "massachusetts",
    kind: "avenue",
    name: "Massachusetts Ave",
    points: [
      [38.910, -77.065],
      [38.908, -77.042],
      [38.906, -77.018],
      [38.904, -76.992],
    ],
  },
  {
    id: "new-york",
    kind: "highway",
    name: "New York Ave",
    points: [
      [38.907, -77.018],
      [38.908, -76.995],
      [38.910, -76.972],
      [38.915, -76.955],
    ],
  },
  {
    id: "connecticut",
    kind: "avenue",
    name: "Connecticut Ave",
    points: [
      [38.920, -77.045],
      [38.912, -77.044],
      [38.904, -77.043],
      [38.896, -77.042],
    ],
  },
  {
    id: "georgia",
    kind: "avenue",
    name: "Georgia Ave",
    points: [
      [38.935, -77.022],
      [38.922, -77.021],
      [38.910, -77.020],
      [38.898, -77.019],
    ],
  },
  {
    id: "m-street",
    kind: "street",
    name: "M Street NW",
    points: [
      [38.905, -77.078],
      [38.905, -77.055],
      [38.905, -77.032],
    ],
  },
];

function gridRoads(): RoadSegment[] {
  const roads: RoadSegment[] = [];
  const latMin = 38.838;
  const latMax = 38.948;
  const lngMin = -77.108;
  const lngMax = -76.952;

  for (let i = -10; i <= 10; i++) {
    const lng = -77.0369 + i * 0.0055;
    if (lng < lngMin || lng > lngMax) continue;
    const kind: RoadKind =
      i === 0 ? "avenue" :
      Math.abs(i) % 4 === 0 ? "avenue" :
      "street";
    roads.push({
      id: `ns-${i}`,
      kind,
      points: [[latMin, lng], [latMax, lng]],
    });
  }

  for (let j = -12; j <= 12; j++) {
    const lat = 38.9072 + j * 0.004;
    if (lat < latMin || lat > latMax) continue;
    const kind: RoadKind =
      j === 0 ? "avenue" :
      Math.abs(j) % 3 === 0 ? "avenue" :
      "street";
    roads.push({
      id: `ew-${j}`,
      kind,
      points: [[lat, lngMin], [lat, lngMax]],
    });
  }

  return roads;
}

function alleyRoads(): RoadSegment[] {
  const alleys: RoadSegment[] = [];
  const latMin = 38.845;
  const latMax = 38.940;
  const lngMin = -77.098;
  const lngMax = -76.962;

  for (let i = -9; i <= 9; i++) {
    const lng = -77.0369 + i * 0.0055 + 0.00275;
    if (lng < lngMin || lng > lngMax) continue;
    alleys.push({
      id: `alley-ns-${i}`,
      kind: "alley",
      points: [[latMin, lng], [latMax, lng]],
    });
  }

  for (let j = -11; j <= 11; j++) {
    const lat = 38.9072 + j * 0.004 + 0.002;
    if (lat < latMin || lat > latMax) continue;
    alleys.push({
      id: `alley-ew-${j}`,
      kind: "alley",
      points: [[lat, lngMin], [lat, lngMax]],
    });
  }

  return alleys;
}

export const DC_ROADS: RoadSegment[] = [...NAMED_AVENUES, ...gridRoads(), ...alleyRoads()];

export const DC_BRIDGES: BridgeDef[] = [
  {
    id: "memorial-bridge",
    name: "Arlington Memorial Bridge",
    lat: 38.889,
    lng: -77.043,
    length: 320,
    rotation: Math.PI / 2,
    width: 28,
  },
  {
    id: "key-bridge",
    name: "Francis Scott Key Bridge",
    lat: 38.905,
    lng: -77.068,
    length: 280,
    rotation: Math.PI / 2.2,
    width: 24,
  },
  {
    id: "roosevelt-bridge",
    name: "Theodore Roosevelt Bridge",
    lat: 38.898,
    lng: -77.055,
    length: 300,
    rotation: Math.PI / 1.9,
    width: 26,
  },
  {
    id: "14th-st-bridge",
    name: "14th Street Bridge",
    lat: 38.862,
    lng: -77.035,
    length: 260,
    rotation: Math.PI / 2.05,
    width: 22,
  },
  {
    id: "chain-bridge",
    name: "Chain Bridge",
    lat: 38.928,
    lng: -77.088,
    length: 200,
    rotation: Math.PI / 2.3,
    width: 18,
  },
];

/** Traffic paths along major east-west corridors (scene coords filled at runtime). */
export const TRAFFIC_CORRIDORS: [number, number][] = [
  [38.904, -77.08],
  [38.904, -77.04],
  [38.904, -77.0],
  [38.904, -76.96],
  [38.892, -77.06],
  [38.892, -77.02],
  [38.892, -76.98],
  [38.878, -77.04],
  [38.878, -77.0],
  [38.918, -77.04],
  [38.918, -77.0],
];
