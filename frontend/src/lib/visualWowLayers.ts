import { PolygonLayer, ScatterplotLayer, PathLayer } from "@deck.gl/layers";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import type { Layer } from "@deck.gl/core";
import type { SimulationState } from "../types";
import { METRO_LINES, METRO_STATIONS } from "./dcMetro";
import type { VisualWowDerived, VisualWowToggles, MapAnnotation } from "./visualWowTypes";

function latLngPath(points: [number, number][]): [number, number][] {
  return points.map(([lat, lng]) => [lng, lat]);
}

function rippleRing(
  center: { lat: number; lng: number },
  radiusM: number,
  segments = 48,
): [number, number][] {
  const coords: [number, number][] = [];
  const latRad = (center.lat * Math.PI) / 180;
  const mPerDegLat = 111_000;
  const mPerDegLng = 111_000 * Math.cos(latRad);
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    coords.push([
      center.lng + (Math.cos(a) * radiusM) / mPerDegLng,
      center.lat + (Math.sin(a) * radiusM) / mPerDegLat,
    ]);
  }
  return coords;
}

/** Animated SOS ripple rings — radius driven by tick modulo */
export function buildSosRippleLayers(
  derived: VisualWowDerived,
  tick: number,
): Layer[] {
  if (!derived.sosRippleCenters.length) return [];

  const phase = (tick % 60) / 60;
  const rings = derived.sosRippleCenters.flatMap((c) =>
    [0, 1, 2].map((i) => {
      const r = 200 + ((phase + i * 0.33) % 1) * 800;
      const alpha = Math.round(180 * (1 - ((phase + i * 0.33) % 1)));
      return {
        polygon: rippleRing({ lat: c.lat, lng: c.lng }, r),
        alpha,
        id: `${c.id}-${i}`,
      };
    }),
  );

  return [
    new PolygonLayer({
      id: "sos-ripple",
      data: rings,
      getPolygon: (d) => d.polygon,
      getFillColor: (d) => [255, 60, 90, Math.max(8, d.alpha * 0.15)],
      getLineColor: (d) => [255, 100, 140, Math.max(20, d.alpha * 0.6)],
      getLineWidth: 2,
      lineWidthUnits: "pixels",
      stroked: true,
      filled: true,
      pickable: false,
    }),
  ];
}

/** Panic heatmap from SOS + epicenter + fake news spread */
export function buildPanicHeatmapLayer(derived: VisualWowDerived): Layer | null {
  if (!derived.panicPoints.length) return null;

  const data = derived.panicPoints.map((p) => ({
    position: [p.lng, p.lat],
    weight: p.weight,
  }));

  return new HeatmapLayer({
    id: "panic-heatmap",
    data,
    getPosition: (d) => d.position as [number, number],
    getWeight: (d) => d.weight,
    radiusPixels: 80,
    intensity: 1.8,
    threshold: 0.08,
    colorRange: [
      [255, 200, 100, 0],
      [255, 140, 40, 100],
      [255, 70, 50, 180],
      [255, 20, 40, 220],
    ],
  });
}

/** X-ray underground: metro + utility paths glow beneath city */
export function buildXrayLayers(state: SimulationState): Layer[] {
  const power = state.metrics.power_grid;
  const water = state.metrics.water_network;

  const metroLines = METRO_LINES.map(
    (line) =>
      new PathLayer({
        id: `xray-metro-${line.id}`,
        data: [{ path: latLngPath(line.points) }],
        getPath: (d) => d.path,
        getColor: [76, 201, 240, 200],
        getWidth: 8,
        widthUnits: "meters",
        widthMinPixels: 3,
        pickable: false,
      }),
  );

  const metroStations = new ScatterplotLayer({
    id: "xray-metro-stations",
    data: METRO_STATIONS,
    getPosition: (d) => [d.lng, d.lat],
    getRadius: 35,
    radiusUnits: "meters",
    getFillColor: [255, 255, 255, 180],
    getLineColor: [76, 201, 240, 255],
    lineWidthUnits: "pixels",
    getLineWidth: 2,
    stroked: true,
    pickable: false,
  });

  const epicenter = state.epicenter ?? { latitude: 38.9072, longitude: -77.0369 };
  const utilityPaths = [
    {
      path: latLngPath([
        [epicenter.latitude - 0.02, epicenter.longitude - 0.03],
        [epicenter.latitude, epicenter.longitude],
        [epicenter.latitude + 0.015, epicenter.longitude + 0.02],
      ]),
      color: power < 40 ? [255, 70, 85, 220] : [255, 200, 80, 200],
      label: "power",
    },
    {
      path: latLngPath([
        [epicenter.latitude + 0.01, epicenter.longitude - 0.025],
        [epicenter.latitude - 0.005, epicenter.longitude + 0.01],
      ]),
      color: water < 40 ? [255, 120, 60, 220] : [100, 200, 255, 200],
      label: "water",
    },
  ];

  const utilityLayer = new PathLayer({
    id: "xray-utilities",
    data: utilityPaths,
    getPath: (d) => d.path,
    getColor: (d) => d.color as [number, number, number, number],
    getWidth: 5,
    widthUnits: "meters",
    widthMinPixels: 2,
    pickable: false,
  });

  return [...metroLines, metroStations, utilityLayer];
}

/** Seismic shockwave rings expanding from epicenter */
export function buildSeismicRingLayers(
  state: SimulationState,
  tick: number,
): Layer[] {
  if (!state.epicenter) return [];

  const phase = (tick % 80) / 80;
  const center = { lat: state.epicenter.latitude, lng: state.epicenter.longitude };
  const maxR = Math.min(state.disaster_radius * 2, 2400);

  const rings = [0, 1, 2, 3].map((i) => {
    const p = (phase + i * 0.25) % 1;
    const r = 150 + p * maxR;
    const alpha = Math.round(220 * (1 - p));
    return {
      polygon: rippleRing(center, r),
      alpha,
      id: `seismic-${i}`,
    };
  });

  return [
    new PolygonLayer({
      id: "seismic-rings",
      data: rings,
      getPolygon: (d) => d.polygon,
      getFillColor: (d) => [255, 140, 60, Math.max(6, d.alpha * 0.08)],
      getLineColor: (d) => [255, 200, 100, Math.max(15, d.alpha * 0.55)],
      getLineWidth: 3,
      lineWidthUnits: "pixels",
      stroked: true,
      filled: true,
      pickable: false,
    }),
  ];
}

/** Fog of war — dark zones where intel is unknown */
export function buildFogOfWarLayers(derived: VisualWowDerived): Layer[] {
  if (!derived.fogZones.length) return [];

  const data = derived.fogZones.map((z) => ({
    polygon: rippleRing({ lat: z.lat, lng: z.lng }, z.radiusM, 24),
    id: `${z.lat}-${z.lng}`,
  }));

  return [
    new PolygonLayer({
      id: "fog-of-war",
      data,
      getPolygon: (d) => d.polygon,
      getFillColor: [5, 8, 18, 200],
      getLineColor: [40, 50, 70, 80],
      getLineWidth: 1,
      lineWidthUnits: "pixels",
      stroked: true,
      filled: true,
      pickable: false,
    }),
  ];
}

/** War Room map annotations — evacuation routes, zones */
export function buildAnnotationLayers(annotations: MapAnnotation[]): Layer[] {
  if (!annotations.length) return [];

  const paths = annotations
    .filter((a) => a.points.length >= 2)
    .map((a) => ({
      path: a.points,
      color: a.color,
      id: a.id,
    }));

  const points = annotations
    .filter((a) => a.points.length === 1)
    .map((a) => ({
      position: a.points[0]!,
      color: a.color,
      id: a.id,
    }));

  const layers: Layer[] = [];

  if (paths.length) {
    layers.push(
      new PathLayer({
        id: "map-annotations",
        data: paths,
        getPath: (d) => d.path,
        getColor: (d) => d.color,
        getWidth: 12,
        widthUnits: "meters",
        widthMinPixels: 3,
        pickable: false,
      }),
    );
  }

  if (points.length) {
    layers.push(
      new ScatterplotLayer({
        id: "map-annotation-points",
        data: points,
        getPosition: (d) => d.position,
        getRadius: 30,
        radiusUnits: "meters",
        getFillColor: (d) => d.color,
        getLineColor: [255, 255, 255, 200],
        lineWidthUnits: "pixels",
        getLineWidth: 2,
        stroked: true,
        pickable: false,
      }),
    );
  }

  return layers;
}

/** Ghost city: emergency lights only — dim everything else via companion opacity hint */
export function buildGhostCityLayers(state: SimulationState): Layer[] {
  const emergencyNodes = state.nodes.filter((n) => n.health < 50 || n.type.includes("hospital"));
  const vehicles = state.vehicles ?? [];

  return [
    new ScatterplotLayer({
      id: "ghost-emergency-lights",
      data: emergencyNodes,
      getPosition: (d) => [d.longitude, d.latitude],
      getRadius: 40,
      radiusUnits: "meters",
      getFillColor: [255, 60, 80, 240],
      getLineColor: [255, 200, 100, 255],
      lineWidthUnits: "pixels",
      getLineWidth: 2,
      stroked: true,
      pickable: false,
    }),
    new ScatterplotLayer({
      id: "ghost-units",
      data: vehicles,
      getPosition: (d) => [d.longitude, d.latitude],
      getRadius: 25,
      radiusUnits: "meters",
      getFillColor: [255, 255, 255, 255],
      pickable: false,
    }),
  ];
}

export function buildVisualWowLayers(
  state: SimulationState,
  toggles: VisualWowToggles,
  derived: VisualWowDerived,
  annotations: MapAnnotation[] = [],
): Layer[] {
  const layers: Layer[] = [];

  if (toggles.panicHeatmap) {
    const heat = buildPanicHeatmapLayer(derived);
    if (heat) layers.push(heat);
  }

  if (toggles.sosRipple) {
    layers.push(...buildSosRippleLayers(derived, state.tick));
  }

  if (toggles.seismicRings) {
    layers.push(...buildSeismicRingLayers(state, state.tick));
  }

  if (toggles.fogOfWar) {
    layers.push(...buildFogOfWarLayers(derived));
  }

  if (toggles.mapAnnotation && annotations.length) {
    layers.push(...buildAnnotationLayers(annotations));
  }

  if (toggles.xrayUnderground) {
    layers.push(...buildXrayLayers(state));
  }

  if (toggles.ghostCity && derived.showGhostCity) {
    layers.push(...buildGhostCityLayers(state));
  }

  return layers;
}
