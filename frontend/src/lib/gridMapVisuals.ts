/** Visual config for grid buildings on the 3D map — matches map legend swatches */

import type { Feature, FeatureCollection } from "geojson";
import { isInDcBounds } from "./geo";

export const MAP_BUILDING_HEX: Record<string, string> = {
  "=": "#7fa8c9",
  h: "#6b7280",
  $: "#ffd166",
  R: "#4a5568",
  F: "#33c17a",
  S: "#ff4655",
  P: "#6fdc8c",
  I: "#c9a24c",
  W: "#4cc9f0",
  E: "#f4a100",
  M: "#ff9f43",
  L: "#6c7ce0",
  D: "#b885f0",
  T: "#ff7a45",
  G: "#ffe66d",
  C: "#ffd166",
};

function hexToRgba(hex: string, alpha = 245): [number, number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, alpha];
}

export const MAP_BUILDING_COLORS: Record<string, [number, number, number, number]> = Object.fromEntries(
  Object.entries(MAP_BUILDING_HEX).map(([k, v]) => [k, hexToRgba(v)]),
);

export const MAP_BUILDING_HEIGHTS: Record<string, number> = {
  "=": 28,
  h: 18,
  $: 58,
  R: 4,
  F: 22,
  S: 75,
  P: 8,
  I: 50,
  W: 38,
  E: 55,
  M: 30,
  L: 38,
  D: 34,
  T: 32,
  G: 10,
  C: 45,
};

export const MAP_BUILDING_RADIUS: Record<string, number> = {
  "=": 28,
  h: 22,
  $: 30,
  R: 34,
  F: 26,
  S: 36,
  P: 30,
  I: 32,
  W: 28,
  E: 30,
  M: 28,
  L: 32,
  D: 28,
  T: 32,
  G: 20,
};

/** Shown on map legend — same hex as 3D columns */
export const MAP_LEGEND_ITEMS: { symbol: string; hex: string; i18nKey: string }[] = [
  { symbol: "S", hex: MAP_BUILDING_HEX.S, i18nKey: "bld_hospital" },
  { symbol: "L", hex: MAP_BUILDING_HEX.L, i18nKey: "bld_police" },
  { symbol: "T", hex: MAP_BUILDING_HEX.T, i18nKey: "bld_fire" },
  { symbol: "D", hex: MAP_BUILDING_HEX.D, i18nKey: "bld_school" },
  { symbol: "F", hex: MAP_BUILDING_HEX.F, i18nKey: "bld_farm" },
  { symbol: "I", hex: MAP_BUILDING_HEX.I, i18nKey: "bld_factory" },
  { symbol: "W", hex: MAP_BUILDING_HEX.W, i18nKey: "bld_water" },
  { symbol: "E", hex: MAP_BUILDING_HEX.E, i18nKey: "bld_power" },
  { symbol: "=", hex: MAP_BUILDING_HEX["="], i18nKey: "bld_house" },
  { symbol: "h", hex: MAP_BUILDING_HEX.h, i18nKey: "bld_poor_house" },
  { symbol: "$", hex: MAP_BUILDING_HEX.$, i18nKey: "bld_rich_house" },
  { symbol: "P", hex: MAP_BUILDING_HEX.P, i18nKey: "bld_park" },
  { symbol: "M", hex: MAP_BUILDING_HEX.M, i18nKey: "bld_market" },
  { symbol: "R", hex: MAP_BUILDING_HEX.R, i18nKey: "bld_road" },
  { symbol: "G", hex: MAP_BUILDING_HEX.G, i18nKey: "bld_solar" },
];

export function defaultBuildingRadius(symbol: string): number {
  return MAP_BUILDING_RADIUS[symbol] ?? 24;
}

export function defaultBuildingHeight(symbol: string): number {
  return MAP_BUILDING_HEIGHTS[symbol] ?? 24;
}

export function defaultBuildingColor(symbol: string): [number, number, number, number] {
  return MAP_BUILDING_COLORS[symbol] ?? hexToRgba("#243858");
}

export const BUILDING_I18N_KEYS: Record<string, string> = {
  W: "bld_water",
  E: "bld_power",
  "=": "bld_house",
  h: "bld_poor_house",
  $: "bld_rich_house",
  S: "bld_hospital",
  F: "bld_farm",
  M: "bld_market",
  I: "bld_factory",
  L: "bld_police",
  D: "bld_school",
  R: "bld_road",
  P: "bld_park",
  T: "bld_fire",
  G: "bld_solar",
  C: "bld_center",
};

export function shouldShowMapLabel(symbol: string): boolean {
  return symbol !== "R" && symbol !== "C" && symbol !== ".";
}

/** Grid cell size on map (~91m) — one extruded block fills the whole cell */
export const GRID_CELL_HALF_METERS = 46;

/** Square footprint half-width in meters — full building block, not a dot */
export function buildingFootprintMeters(symbol: string): number {
  if (symbol === "R") return 38;
  if (symbol === "P") return GRID_CELL_HALF_METERS;
  return GRID_CELL_HALF_METERS;
}

export function squareFootprintPolygon(
  lat: number,
  lng: number,
  halfSizeM: number,
): { type: "Polygon"; coordinates: [number, number][][] } {
  const latRad = (lat * Math.PI) / 180;
  const dLat = halfSizeM / 111_000;
  const dLng = halfSizeM / (111_000 * Math.cos(latRad));
  return {
    type: "Polygon",
    coordinates: [
      [
        [lng - dLng, lat - dLat],
        [lng + dLng, lat - dLat],
        [lng + dLng, lat + dLat],
        [lng - dLng, lat + dLat],
        [lng - dLng, lat - dLat],
      ],
    ],
  };
}

export interface MapBuildingFeatureProps {
  building: string;
  height: number;
  color: [number, number, number, number];
  labelText: string;
  labelAlt: number;
}

export function placementsToGeoJSON(
  placements: Array<{
    latitude: number;
    longitude: number;
    building: string;
    height: number;
    color: [number, number, number, number];
    labelText: string;
    labelAlt: number;
  }>,
): { type: "FeatureCollection"; features: Array<{ type: "Feature"; properties: MapBuildingFeatureProps; geometry: ReturnType<typeof squareFootprintPolygon> }> } {
  return {
    type: "FeatureCollection",
    features: placements.map((p) => ({
      type: "Feature" as const,
      properties: {
        building: p.building,
        height: p.height,
        color: p.color,
        labelText: p.labelText,
        labelAlt: p.labelAlt,
      },
      geometry: squareFootprintPolygon(p.latitude, p.longitude, buildingFootprintMeters(p.building)),
    })),
  };
}

export function featureCentroid(feature: Feature): [number, number] | null {
  const g = feature.geometry;
  if (!g || g.type === "GeometryCollection") return null;
  if (g.type === "Point") {
    const c = g.coordinates;
    return [c[0], c[1]];
  }
  if (g.type === "Polygon") {
    const ring = g.coordinates[0];
    if (!ring?.length) return null;
    let lng = 0;
    let lat = 0;
    for (const c of ring) {
      lng += c[0];
      lat += c[1];
    }
    return [lng / ring.length, lat / ring.length];
  }
  if (g.type === "MultiPolygon") {
    const poly = g.coordinates[0]?.[0];
    if (!poly?.length) return null;
    let lng = 0;
    let lat = 0;
    for (const c of poly) {
      lng += c[0];
      lat += c[1];
    }
    return [lng / poly.length, lat / poly.length];
  }
  return null;
}

const PLACEMENT_HIDE_RADIUS_DEG = 0.00048;

/** Keep only building footprints whose centroid lies inside Washington D.C. */
export function filterFeaturesInDcBounds(collection: FeatureCollection): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: collection.features.filter((f) => {
      const c = featureCentroid(f);
      if (!c) return false;
      const [lng, lat] = c;
      return isInDcBounds(lat, lng);
    }),
  };
}

const OSM_TAG_COLORS: Record<string, [number, number, number, number]> = {
  house: MAP_BUILDING_COLORS["="],
  residential: MAP_BUILDING_COLORS["="],
  detached: MAP_BUILDING_COLORS["="],
  apartments: MAP_BUILDING_COLORS.h,
  dormitory: MAP_BUILDING_COLORS.h,
  commercial: MAP_BUILDING_COLORS.M,
  retail: MAP_BUILDING_COLORS.M,
  supermarket: MAP_BUILDING_COLORS.M,
  office: MAP_BUILDING_COLORS["$"],
  hotel: MAP_BUILDING_COLORS["$"],
  industrial: MAP_BUILDING_COLORS.I,
  warehouse: MAP_BUILDING_COLORS.I,
  manufacture: MAP_BUILDING_COLORS.I,
  public: MAP_BUILDING_COLORS.D,
  government: MAP_BUILDING_COLORS.L,
  civic: MAP_BUILDING_COLORS.D,
  hospital: MAP_BUILDING_COLORS.S,
  school: MAP_BUILDING_COLORS.D,
  university: MAP_BUILDING_COLORS.D,
  college: MAP_BUILDING_COLORS.D,
  kindergarten: MAP_BUILDING_COLORS.D,
  church: MAP_BUILDING_COLORS.D,
  cathedral: MAP_BUILDING_COLORS.D,
  chapel: MAP_BUILDING_COLORS.D,
  fire_station: MAP_BUILDING_COLORS.T,
  garage: MAP_BUILDING_COLORS.R,
  parking: MAP_BUILDING_COLORS.R,
  greenhouse: MAP_BUILDING_COLORS.F,
  farm: MAP_BUILDING_COLORS.F,
  yes: MAP_BUILDING_COLORS["="],
};

/** Solid fill color for an OSM building footprint inside D.C. */
export function osmBuildingFillColor(
  buildingTag: string | undefined,
  height: number,
  crisisMode: boolean,
): [number, number, number, number] {
  const tag = (buildingTag ?? "yes").toLowerCase();
  let base = OSM_TAG_COLORS[tag];
  if (!base) {
    if (height >= 55) base = MAP_BUILDING_COLORS["$"];
    else if (height >= 35) base = MAP_BUILDING_COLORS.M;
    else if (height >= 22) base = MAP_BUILDING_COLORS["="];
    else base = MAP_BUILDING_COLORS.h;
  }
  if (crisisMode) {
    return [
      Math.round(base[0] * 0.72),
      Math.round(base[1] * 0.72),
      Math.round(base[2] * 0.72),
      255,
    ];
  }
  return [base[0], base[1], base[2], 255];
}

/** Hide OSM meshes under user-built cells so colored blocks replace them entirely */
export function filterOsmAwayFromPlacements(
  collection: FeatureCollection,
  placements: Array<{ latitude: number; longitude: number }>,
): FeatureCollection {
  if (!placements.length) return collection;
  return {
    type: "FeatureCollection",
    features: collection.features.filter((f) => {
      const c = featureCentroid(f);
      if (!c) return true;
      const [lng, lat] = c;
      return !placements.some(
        (p) => Math.abs(lat - p.latitude) < PLACEMENT_HIDE_RADIUS_DEG && Math.abs(lng - p.longitude) < PLACEMENT_HIDE_RADIUS_DEG,
      );
    }),
  };
}

export const INFRA_BLOCK_COLORS: Record<string, [number, number, number, number]> = {
  hospital: MAP_BUILDING_COLORS.S,
  fire: MAP_BUILDING_COLORS.T,
  police: MAP_BUILDING_COLORS.L,
  power: MAP_BUILDING_COLORS.E,
  water: MAP_BUILDING_COLORS.W,
  residential: MAP_BUILDING_COLORS["="],
  shelter: MAP_BUILDING_COLORS.D,
  warehouse: MAP_BUILDING_COLORS.I,
  bridge: [154, 165, 177, 230],
  airport: MAP_BUILDING_COLORS.E,
  port: MAP_BUILDING_COLORS.W,
  comm: MAP_BUILDING_COLORS.M,
};

export const INFRA_BLOCK_HEIGHTS: Record<string, number> = {
  hospital: 85,
  fire: 48,
  police: 44,
  power: 62,
  water: 40,
  bridge: 12,
  airport: 35,
  port: 30,
  residential: 28,
  shelter: 32,
  warehouse: 36,
  comm: 30,
};

export function infraNodesToGeoJSON(
  nodes: Array<{ type: string; name: string; latitude: number; longitude: number; health: number }>,
): { type: "FeatureCollection"; features: Array<{ type: "Feature"; properties: { height: number; color: [number, number, number, number]; label: string }; geometry: ReturnType<typeof squareFootprintPolygon> }> } {
  return {
    type: "FeatureCollection",
    features: nodes.map((n) => {
      const base = INFRA_BLOCK_COLORS[n.type] ?? MAP_BUILDING_COLORS["="];
      const dim = n.health < 40 ? 0.65 : n.health < 70 ? 0.85 : 1;
      const color: [number, number, number, number] = [
        Math.round(base[0] * dim),
        Math.round(base[1] * dim),
        Math.round(base[2] * dim),
        255,
      ];
      const half = n.type === "bridge" ? 34 : n.type === "hospital" ? 38 : 28;
      return {
        type: "Feature" as const,
        properties: {
          height: INFRA_BLOCK_HEIGHTS[n.type] ?? 34,
          color,
          label: n.name,
        },
        geometry: squareFootprintPolygon(n.latitude, n.longitude, half),
      };
    }),
  };
}

export function rgbaFill(color: [number, number, number, number]): [number, number, number, number] {
  return [color[0], color[1], color[2], color[3] ?? 255];
}
